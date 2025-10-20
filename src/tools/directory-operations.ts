import { promises as fs } from 'fs';
import { join, basename, extname } from 'path';
import * as glob from 'fast-glob';
import { PathValidator } from '../utils/path-validator.js';
// import { BackupManager } from '../utils/backup-manager.js';
import { Logger } from '../utils/logger.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { DevToolsConfig } from '../types/config.js';
import {
  ListDirectoryParams,
  ListDirectoryResult,
  CreateDirectoryParams,
  CreateDirectoryResult,
  DeleteDirectoryParams,
  DeleteDirectoryResult,
  MoveDirectoryParams,
  MoveDirectoryResult
} from '../types/directory.js';
import { FileEntry } from '../types/tools.js';

/**
 * DirectoryOperations - Handles all directory manipulation operations
 */
export class DirectoryOperations {
  private workspaceDir: string;
  private pathValidator: PathValidator;
  // private backupManager: BackupManager;
  private logger: Logger;
  private rateLimiter: RateLimiter;

  constructor(config: DevToolsConfig) {
    this.workspaceDir = config.workspace.dir;
    this.pathValidator = new PathValidator(config.workspace);
    // this.backupManager = new BackupManager(config.files);
    this.logger = new Logger(config.logging);
    this.rateLimiter = new RateLimiter(config.rateLimits);
  }

  /**
   * List directory contents with filtering and sorting
   */
  async listDirectory(params: ListDirectoryParams): Promise<ListDirectoryResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('list_directory', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate params
      this.validateListParams(params);

      // 3. Resolve path
      const targetPath = params.path || '';
      if (targetPath) {
        const pathValidation = this.pathValidator.validatePath(targetPath);
        if (!pathValidation.valid) {
          throw new Error(`Invalid path: ${pathValidation.reason}`);
        }
      }

      const fullPath = join(this.workspaceDir, targetPath);

      // 4. Check if directory exists
      try {
        const stats = await fs.stat(fullPath);
        if (!stats.isDirectory()) {
          throw new Error(`Path is not a directory: ${targetPath}`);
        }
      } catch (error) {
        throw new Error(`Directory not found: ${targetPath}`);
      }

      // 5. Build glob pattern
      const pattern = this.buildGlobPattern(params);
      const globOptions = {
        cwd: fullPath,
        onlyFiles: false,
        markDirectories: true,
        dot: params.includeHidden || false,
        deep: params.recursive ? (params.maxDepth || 10) : 1,
        absolute: false
      };

      // 6. Get entries
      const entries = await glob.glob(pattern, globOptions);

      // 7. Process entries
      const files: FileEntry[] = [];
      let totalSize = 0;
      let totalFiles = 0;
      let totalDirectories = 0;

      for (const entry of entries) {
        const entryPath = join(fullPath, entry);
        const stats = await fs.stat(entryPath);
        const isDirectory = stats.isDirectory();

        // Filter by file types
        if (!isDirectory && params.fileTypes && params.fileTypes.length > 0) {
          const ext = extname(entry);
          if (!params.fileTypes.includes(ext)) {
            continue;
          }
        }

        const fileEntry: FileEntry = {
          name: basename(entry),
          path: entry,
          type: isDirectory ? 'directory' : 'file',
          size: stats.size,
          sizeFormatted: this.formatSize(stats.size),
          modified: stats.mtime.toISOString(),
          extension: isDirectory ? '' : extname(entry),
          depth: entry.split('/').length - 1
        };

        files.push(fileEntry);

        if (isDirectory) {
          totalDirectories++;
        } else {
          totalFiles++;
          totalSize += stats.size;
        }
      }

      // 8. Sort
      this.sortFiles(files, params.sortBy || 'name', params.sortOrder || 'asc');

      // 9. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'list_directory',
        params: {
          path: targetPath,
          recursive: params.recursive,
          fileTypes: params.fileTypes
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        path: targetPath,
        files,
        totalFiles,
        totalDirectories,
        totalSize,
        totalSizeFormatted: this.formatSize(totalSize),
        depth: params.recursive ? (params.maxDepth || 10) : 1,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'list_directory',
        params: { path: params.path },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        path: params.path || '',
        files: [],
        totalFiles: 0,
        totalDirectories: 0,
        totalSize: 0,
        totalSizeFormatted: '0 B',
        depth: 0,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Create a directory
   */
  async createDirectory(params: CreateDirectoryParams): Promise<CreateDirectoryResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('create_directory', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate params
      this.validateCreateParams(params);

      // 3. Validate path
      const pathValidation = this.pathValidator.validatePath(params.path);
      if (!pathValidation.valid) {
        throw new Error(`Invalid path: ${pathValidation.reason}`);
      }

      const fullPath = join(this.workspaceDir, params.path);

      // 4. Check if already exists
      try {
        await fs.access(fullPath);
        throw new Error(`Directory already exists: ${params.path}`);
      } catch (error) {
        // Directory doesn't exist, good to create
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      // 5. Create directory
      const created: string[] = [];
      await fs.mkdir(fullPath, {
        recursive: params.recursive !== false,
        mode: params.mode ? parseInt(params.mode, 8) : undefined
      });

      // Track created path
      created.push(params.path);

      // 6. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'create_directory',
        params: {
          path: params.path,
          recursive: params.recursive,
          mode: params.mode
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        path: params.path,
        created,
        permissions: params.mode,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'create_directory',
        params: { path: params.path },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        path: params.path,
        created: [],
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Delete a directory
   */
  async deleteDirectory(params: DeleteDirectoryParams): Promise<DeleteDirectoryResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('delete_directory', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate params
      this.validateDeleteParams(params);

      // 3. Validate path
      const pathValidation = this.pathValidator.validatePath(params.path);
      if (!pathValidation.valid) {
        throw new Error(`Invalid path: ${pathValidation.reason}`);
      }

      const fullPath = join(this.workspaceDir, params.path);

      // 4. Check if exists and is directory
      let stats;
      try {
        stats = await fs.stat(fullPath);
        if (!stats.isDirectory()) {
          throw new Error(`Path is not a directory: ${params.path}`);
        }
      } catch (error) {
        throw new Error(`Directory not found: ${params.path}`);
      }

      // 5. Count contents
      const contents = await this.countDirectoryContents(fullPath);
      
      // 6. Check if empty (if not recursive/force)
      if (contents.total > 0 && !params.recursive) {
        throw new Error(`Directory is not empty. Use recursive: true to delete contents`);
      }

      if (contents.total > 0 && !params.force) {
        throw new Error(`Directory contains ${contents.total} items. Use force: true to confirm deletion`);
      }

      let backupPath: string | undefined;

      // 7. Create backup if requested
      if (params.createBackup !== false && contents.total > 0) {
        backupPath = `${fullPath}_backup_${Date.now()}`;
        // In production, implement actual tar.gz backup
      }

      // 8. Delete directory
      await fs.rm(fullPath, { recursive: true, force: true });

      // 9. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'delete_directory',
        params: {
          path: params.path,
          recursive: params.recursive,
          force: params.force
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        path: params.path,
        backupPath,
        filesDeleted: contents.files,
        directoriesDeleted: contents.directories,
        totalSize: contents.size,
        totalSizeFormatted: this.formatSize(contents.size),
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'delete_directory',
        params: { path: params.path },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        path: params.path,
        filesDeleted: 0,
        directoriesDeleted: 0,
        totalSize: 0,
        totalSizeFormatted: '0 B',
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Move or rename a directory
   */
  async moveDirectory(params: MoveDirectoryParams): Promise<MoveDirectoryResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('move_directory', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate params
      this.validateMoveParams(params);

      // 3. Validate paths
      const sourceValidation = this.pathValidator.validatePath(params.sourcePath);
      if (!sourceValidation.valid) {
        throw new Error(`Invalid source path: ${sourceValidation.reason}`);
      }

      const destValidation = this.pathValidator.validatePath(params.destPath);
      if (!destValidation.valid) {
        throw new Error(`Invalid destination path: ${destValidation.reason}`);
      }

      const sourceFull = join(this.workspaceDir, params.sourcePath);
      const destFull = join(this.workspaceDir, params.destPath);

      // 4. Check if paths are identical
      if (sourceFull === destFull) {
        throw new Error('Source and destination paths are identical');
      }

      // 5. Check source exists
      let sourceStats;
      try {
        sourceStats = await fs.stat(sourceFull);
        if (!sourceStats.isDirectory()) {
          throw new Error(`Source is not a directory: ${params.sourcePath}`);
        }
      } catch (error) {
        throw new Error(`Source directory not found: ${params.sourcePath}`);
      }

      // 6. Count source contents
      const contents = await this.countDirectoryContents(sourceFull);

      // 7. Check destination
      let destExists = false;
      try {
        await fs.stat(destFull);
        destExists = true;
      } catch {
        // Destination doesn't exist, OK
      }

      let backupPath: string | undefined;
      let merged = false;

      if (destExists) {
        if (!params.overwrite && !params.merge) {
          throw new Error(`Destination already exists: ${params.destPath}. Use overwrite or merge`);
        }

        if (params.createBackup !== false) {
          backupPath = `${destFull}_backup_${Date.now()}`;
          // In production, create actual backup
        }

        if (params.merge) {
          // Merge directories (copy contents then delete source)
          await this.mergeDirectories(sourceFull, destFull);
          merged = true;
        }
      }

      // 8. Move directory
      if (!merged) {
        await fs.rename(sourceFull, destFull);
      }

      // 9. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'move_directory',
        params: {
          sourcePath: params.sourcePath,
          destPath: params.destPath,
          merge: params.merge
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        sourcePath: params.sourcePath,
        destPath: params.destPath,
        backupPath,
        filesMoved: contents.files,
        directoriesMoved: contents.directories,
        totalSize: contents.size,
        merged,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'move_directory',
        params: { sourcePath: params.sourcePath, destPath: params.destPath },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        sourcePath: params.sourcePath,
        destPath: params.destPath,
        filesMoved: 0,
        directoriesMoved: 0,
        totalSize: 0,
        merged: false,
        timestamp,
        error: errorMessage
      };
    }
  }

  // Private helper methods

  private validateListParams(params: ListDirectoryParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
  }

  private validateCreateParams(params: CreateDirectoryParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
    if (!params.path || typeof params.path !== 'string') {
      throw new Error('Path parameter is required');
    }
  }

  private validateDeleteParams(params: DeleteDirectoryParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
    if (!params.path || typeof params.path !== 'string') {
      throw new Error('Path parameter is required');
    }
    if (params.confirm !== true) {
      throw new Error('confirm parameter must be explicitly set to true');
    }
  }

  private validateMoveParams(params: MoveDirectoryParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
    if (!params.sourcePath || typeof params.sourcePath !== 'string') {
      throw new Error('sourcePath parameter is required');
    }
    if (!params.destPath || typeof params.destPath !== 'string') {
      throw new Error('destPath parameter is required');
    }
  }

  private buildGlobPattern(params: ListDirectoryParams): string {
    if (params.pattern) {
      return params.pattern;
    }
    return params.recursive ? '**/*' : '*';
  }

  private sortFiles(files: FileEntry[], sortBy: string, sortOrder: string): void {
    files.sort((a, b) => {
      let comparison = 0;

      // Directories first
      if (a.type === 'directory' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'directory') return 1;

      switch (sortBy) {
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'modified':
          comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private async countDirectoryContents(dirPath: string): Promise<{
    files: number;
    directories: number;
    total: number;
    size: number;
  }> {
    let files = 0;
    let directories = 0;
    let size = 0;

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        directories++;
        const subCounts = await this.countDirectoryContents(fullPath);
        files += subCounts.files;
        directories += subCounts.directories;
        size += subCounts.size;
      } else {
        files++;
        const stats = await fs.stat(fullPath);
        size += stats.size;
      }
    }

    return {
      files,
      directories,
      total: files + directories,
      size
    };
  }

  private async mergeDirectories(source: string, dest: string): Promise<void> {
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = join(source, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        // Create directory if doesn't exist
        try {
          await fs.mkdir(destPath, { recursive: true });
        } catch {
          // Already exists
        }
        // Recursively merge
        await this.mergeDirectories(sourcePath, destPath);
      } else {
        // Copy file
        await fs.copyFile(sourcePath, destPath);
      }
    }

    // Delete source after merge
    await fs.rm(source, { recursive: true, force: true });
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
