import { promises as fs } from 'fs';
import { join, dirname, extname } from 'path';
import { PathValidator } from '../utils/path-validator.js';
import { BackupManager } from '../utils/backup-manager.js';
import { Logger } from '../utils/logger.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { DevToolsConfig } from '../types/config.js';
import {
  RenameFileParams,
  RenameFileResult,
  DeleteFileParams,
  DeleteFileResult,
  CopyFileParams,
  CopyFileResult,
  FileExistsParams,
  FileExistsResult,
  GetFileInfoParams,
  GetFileInfoResult
} from '../types/tools.js';

/**
 * FileOperations - Handles all file manipulation operations
 * Provides secure file operations with validation, backups, and logging
 */
export class FileOperations {
  private workspaceDir: string;
  private pathValidator: PathValidator;
  private backupManager: BackupManager;
  private logger: Logger;
  private rateLimiter: RateLimiter;

  constructor(config: DevToolsConfig) {
    this.workspaceDir = config.workspace.dir;
    this.pathValidator = new PathValidator(config.workspace);
    this.backupManager = new BackupManager(config.files);
    this.logger = new Logger(config.logging);
    this.rateLimiter = new RateLimiter(config.rateLimits);
  }

  /**
   * Rename or move a file
   */
  async renameFile(params: RenameFileParams): Promise<RenameFileResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('rename_file', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate parameters
      this.validateRenameParams(params);

      // 3. Validate paths
      const oldPathValidation = this.pathValidator.validatePath(params.oldPath);
      if (!oldPathValidation.valid) {
        throw new Error(`Invalid old path: ${oldPathValidation.reason}`);
      }

      const newPathValidation = this.pathValidator.validatePath(params.newPath);
      if (!newPathValidation.valid) {
        throw new Error(`Invalid new path: ${newPathValidation.reason}`);
      }

      // 4. Construct full paths
      const oldFullPath = join(this.workspaceDir, params.oldPath);
      const newFullPath = join(this.workspaceDir, params.newPath);

      // 5. Check if paths are different
      if (oldFullPath === newFullPath) {
        throw new Error('Source and destination paths are identical');
      }

      // 6. Verify source file exists
      try {
        await fs.access(oldFullPath);
      } catch {
        throw new Error(`Source file not found: ${params.oldPath}`);
      }

      // 7. Check if destination exists
      let destExists = false;
      try {
        await fs.access(newFullPath);
        destExists = true;
      } catch {
        // File doesn't exist, that's OK
      }

      let backupPath: string | undefined;

      // 8. Handle existing destination
      if (destExists) {
        if (!params.overwrite) {
          throw new Error(
            `Destination file already exists: ${params.newPath}. Use overwrite: true to replace it`
          );
        }

        // Create backup if requested
        if (params.createBackup !== false) {
          const backupResult = await this.backupManager.createBackup(newFullPath);
          if (backupResult.success) {
            backupPath = backupResult.backupPath;
          }
        }
      }

      // 9. Create parent directory if necessary
      const newDir = dirname(newFullPath);
      await fs.mkdir(newDir, { recursive: true });

      // 10. Rename the file
      await fs.rename(oldFullPath, newFullPath);

      // 11. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'rename_file',
        params: {
          oldPath: params.oldPath,
          newPath: params.newPath,
          overwrite: params.overwrite,
          createBackup: params.createBackup
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        oldPath: params.oldPath,
        newPath: params.newPath,
        backupPath,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'rename_file',
        params: { oldPath: params.oldPath, newPath: params.newPath },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        oldPath: params.oldPath,
        newPath: params.newPath,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(params: DeleteFileParams): Promise<DeleteFileResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('delete_file', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate parameters
      this.validateDeleteParams(params);

      // 3. Validate path
      const pathValidation = this.pathValidator.validatePath(params.path);
      if (!pathValidation.valid) {
        throw new Error(`Invalid path: ${pathValidation.reason}`);
      }

      // 4. Construct full path
      const fullPath = join(this.workspaceDir, params.path);

      // 5. Verify file exists
      try {
        await fs.access(fullPath);
      } catch {
        throw new Error(`File not found: ${params.path}`);
      }

      let backupPath: string | undefined;

      // 6. Create backup if requested (default: true)
      if (params.createBackup !== false) {
        const backupResult = await this.backupManager.createBackup(fullPath);
        if (backupResult.success) {
          backupPath = backupResult.backupPath;
        }
      }

      // 7. Delete the file
      await fs.unlink(fullPath);

      // 8. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'delete_file',
        params: {
          path: params.path,
          confirm: params.confirm,
          createBackup: params.createBackup
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        path: params.path,
        backupPath,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'delete_file',
        params: { path: params.path },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        path: params.path,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Copy a file
   */
  async copyFile(params: CopyFileParams): Promise<CopyFileResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('copy_file', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate parameters
      this.validateCopyParams(params);

      // 3. Validate paths
      const sourceValidation = this.pathValidator.validatePath(params.sourcePath);
      if (!sourceValidation.valid) {
        throw new Error(`Invalid source path: ${sourceValidation.reason}`);
      }

      const destValidation = this.pathValidator.validatePath(params.destPath);
      if (!destValidation.valid) {
        throw new Error(`Invalid destination path: ${destValidation.reason}`);
      }

      // 4. Construct full paths
      const sourceFullPath = join(this.workspaceDir, params.sourcePath);
      const destFullPath = join(this.workspaceDir, params.destPath);

      // 5. Check if paths are different
      if (sourceFullPath === destFullPath) {
        throw new Error('Source and destination paths are identical');
      }

      // 6. Verify source file exists
      try {
        await fs.access(sourceFullPath);
      } catch {
        throw new Error(`Source file not found: ${params.sourcePath}`);
      }

      // 7. Check if destination exists
      let destExists = false;
      try {
        await fs.access(destFullPath);
        destExists = true;
      } catch {
        // File doesn't exist, that's OK
      }

      // 8. Handle existing destination
      if (destExists && !params.overwrite) {
        throw new Error(
          `Destination file already exists: ${params.destPath}. Use overwrite: true to replace it`
        );
      }

      // 9. Create parent directory if necessary
      const destDir = dirname(destFullPath);
      await fs.mkdir(destDir, { recursive: true });

      // 10. Copy the file
      await fs.copyFile(sourceFullPath, destFullPath);

      // 11. Preserve timestamps if requested (default: true)
      if (params.preserveTimestamps !== false) {
        const sourceStats = await fs.stat(sourceFullPath);
        await fs.utimes(destFullPath, sourceStats.atime, sourceStats.mtime);
      }

      // 12. Log success
      const duration = Date.now() - startTime;
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'copy_file',
        params: {
          sourcePath: params.sourcePath,
          destPath: params.destPath,
          overwrite: params.overwrite,
          preserveTimestamps: params.preserveTimestamps
        },
        result: { success: true, duration }
      });

      return {
        success: true,
        sourcePath: params.sourcePath,
        destPath: params.destPath,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'copy_file',
        params: { sourcePath: params.sourcePath, destPath: params.destPath },
        result: { success: false, duration, error: errorMessage }
      });

      return {
        success: false,
        sourcePath: params.sourcePath,
        destPath: params.destPath,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(params: FileExistsParams): Promise<FileExistsResult> {
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate path
      const pathValidation = this.pathValidator.validatePath(params.path);
      if (!pathValidation.valid) {
        return {
          success: false,
          exists: false,
          path: params.path,
          timestamp,
          error: `Invalid path: ${pathValidation.reason}`
        };
      }

      // 2. Construct full path
      const fullPath = join(this.workspaceDir, params.path);

      // 3. Check if exists and get type
      try {
        const stats = await fs.stat(fullPath);
        
        return {
          success: true,
          exists: true,
          path: params.path,
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          timestamp
        };
      } catch {
        return {
          success: true,
          exists: false,
          path: params.path,
          timestamp
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        exists: false,
        path: params.path,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Get detailed file information
   */
  async getFileInfo(params: GetFileInfoParams): Promise<GetFileInfoResult> {
    const timestamp = new Date().toISOString();

    try {
      // 1. Validate path
      const pathValidation = this.pathValidator.validatePath(params.path);
      if (!pathValidation.valid) {
        return {
          success: false,
          exists: false,
          path: params.path,
          size: 0,
          sizeFormatted: '0 B',
          created: '',
          modified: '',
          accessed: '',
          isFile: false,
          isDirectory: false,
          extension: '',
          timestamp,
          error: `Invalid path: ${pathValidation.reason}`
        };
      }

      // 2. Construct full path
      const fullPath = join(this.workspaceDir, params.path);

      // 3. Get file stats
      try {
        const stats = await fs.stat(fullPath);
        
        return {
          success: true,
          exists: true,
          path: params.path,
          size: stats.size,
          sizeFormatted: this.formatSize(stats.size),
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          accessed: stats.atime.toISOString(),
          isFile: stats.isFile(),
          isDirectory: stats.isDirectory(),
          extension: stats.isFile() ? extname(params.path) : '',
          permissions: stats.mode.toString(8).slice(-3),
          timestamp
        };
      } catch {
        return {
          success: true,
          exists: false,
          path: params.path,
          size: 0,
          sizeFormatted: '0 B',
          created: '',
          modified: '',
          accessed: '',
          isFile: false,
          isDirectory: false,
          extension: '',
          timestamp
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return {
        success: false,
        exists: false,
        path: params.path,
        size: 0,
        sizeFormatted: '0 B',
        created: '',
        modified: '',
        accessed: '',
        isFile: false,
        isDirectory: false,
        extension: '',
        timestamp,
        error: errorMessage
      };
    }
  }

  // Private validation methods

  private validateRenameParams(params: RenameFileParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required and must be a string');
    }
    if (!params.oldPath || typeof params.oldPath !== 'string') {
      throw new Error('oldPath parameter is required and must be a string');
    }
    if (!params.newPath || typeof params.newPath !== 'string') {
      throw new Error('newPath parameter is required and must be a string');
    }
  }

  private validateDeleteParams(params: DeleteFileParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required and must be a string');
    }
    if (!params.path || typeof params.path !== 'string') {
      throw new Error('path parameter is required and must be a string');
    }
    if (params.confirm !== true) {
      throw new Error('confirm parameter must be explicitly set to true to delete a file');
    }
  }

  private validateCopyParams(params: CopyFileParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required and must be a string');
    }
    if (!params.sourcePath || typeof params.sourcePath !== 'string') {
      throw new Error('sourcePath parameter is required and must be a string');
    }
    if (!params.destPath || typeof params.destPath !== 'string') {
      throw new Error('destPath parameter is required and must be a string');
    }
  }

  // Helper methods

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
