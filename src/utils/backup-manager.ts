import { promises as fs } from 'fs';
import { join, basename, dirname } from 'path';
import { FilesConfig } from '../types/config.js';
import { BackupResult, BackupInfo } from '../types/tools.js';

/**
 * BackupManager - Manages file backups with automatic cleanup
 */
export class BackupManager {
  private backupDir: string;
  private retention: number;
  private enabled: boolean;

  constructor(config: FilesConfig) {
    this.backupDir = config.backupDir;
    this.retention = config.backupRetention;
    this.enabled = config.backupEnabled;
  }

  /**
   * Create a backup of a file
   */
  async createBackup(filePath: string): Promise<BackupResult> {
    if (!this.enabled) {
      return {
        success: false,
        originalPath: filePath,
        backupPath: '',
        timestamp: Date.now()
      };
    }

    try {
      // Ensure backup directory exists
      await this.ensureBackupDir();

      // Generate backup filename with timestamp
      const timestamp = Date.now();
      const fileName = basename(filePath);
      const backupFileName = `${fileName}.${timestamp}.backup`;
      const backupPath = join(this.backupDir, backupFileName);

      // Copy file to backup location
      await fs.copyFile(filePath, backupPath);

      // Clean old backups for this file
      await this.cleanOldBackups(fileName);

      return {
        success: true,
        originalPath: filePath,
        backupPath,
        timestamp
      };
    } catch (error) {
      return {
        success: false,
        originalPath: filePath,
        backupPath: '',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Restore a file from backup
   */
  async restoreBackup(backupPath: string, targetPath: string): Promise<void> {
    try {
      // Ensure target directory exists
      const targetDir = dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      // Copy backup to target location
      await fs.copyFile(backupPath, targetPath);
    } catch (error) {
      throw new Error(`Failed to restore backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * List all backups for a file
   */
  async listBackups(fileName: string): Promise<BackupInfo[]> {
    try {
      await this.ensureBackupDir();
      
      const files = await fs.readdir(this.backupDir);
      const backups: BackupInfo[] = [];

      for (const file of files) {
        // Check if this backup is for the requested file
        if (file.startsWith(fileName) && file.endsWith('.backup')) {
          const filePath = join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          
          // Extract timestamp from filename
          const match = file.match(/\.(\d+)\.backup$/);
          const timestamp = match ? parseInt(match[1]) : 0;

          backups.push({
            path: filePath,
            fileName: file,
            timestamp,
            size: stats.size,
            created: new Date(stats.birthtimeMs)
          });
        }
      }

      // Sort by timestamp (newest first)
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupPath: string): Promise<void> {
    try {
      await fs.unlink(backupPath);
    } catch (error) {
      throw new Error(`Failed to delete backup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Clean old backups for a specific file
   */
  private async cleanOldBackups(fileName: string): Promise<void> {
    try {
      const backups = await this.listBackups(fileName);
      const now = Date.now();
      const retentionMs = this.retention * 24 * 60 * 60 * 1000;

      for (const backup of backups) {
        const age = now - backup.timestamp;
        
        if (age > retentionMs) {
          try {
            await fs.unlink(backup.path);
          } catch {
            // Ignore errors when deleting old backups
          }
        }
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  /**
   * Ensure backup directory exists
   */
  private async ensureBackupDir(): Promise<void> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch {
      // Ignore if directory already exists
    }
  }

  /**
   * Get total size of all backups
   */
  async getBackupSize(): Promise<number> {
    try {
      await this.ensureBackupDir();
      
      const files = await fs.readdir(this.backupDir);
      let totalSize = 0;

      for (const file of files) {
        if (file.endsWith('.backup')) {
          const filePath = join(this.backupDir, file);
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        }
      }

      return totalSize;
    } catch {
      return 0;
    }
  }

  /**
   * Clean all old backups
   */
  async cleanAllOldBackups(): Promise<number> {
    try {
      await this.ensureBackupDir();
      
      const files = await fs.readdir(this.backupDir);
      const now = Date.now();
      const retentionMs = this.retention * 24 * 60 * 60 * 1000;
      let cleaned = 0;

      for (const file of files) {
        if (!file.endsWith('.backup')) continue;

        const filePath = join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > retentionMs) {
          try {
            await fs.unlink(filePath);
            cleaned++;
          } catch {
            // Ignore deletion errors
          }
        }
      }

      return cleaned;
    } catch {
      return 0;
    }
  }
}
