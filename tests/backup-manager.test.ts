import { BackupManager } from '../src/utils/backup-manager';
import { FilesConfig } from '../src/types/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('BackupManager', () => {
  let backupManager: BackupManager;
  let testDir: string;
  let backupDir: string;

  beforeEach(async () => {
    // Create temporary directories
    testDir = join(tmpdir(), `test-files-${Date.now()}`);
    backupDir = join(testDir, '.backups');
    
    await fs.mkdir(testDir, { recursive: true });
    
    const config: FilesConfig = {
      backupEnabled: true,
      backupDir,
      backupRetention: 1, // 1 day for testing
      maxFileSize: 1024 * 1024
    };
    
    backupManager = new BackupManager(config);
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Backup Creation', () => {
    it('should create backup successfully', async () => {
      // Create test file
      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'test content');

      // Create backup
      const result = await backupManager.createBackup(filePath);

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(result.timestamp).toBeGreaterThan(0);
      
      // Verify backup file exists
      await expect(fs.access(result.backupPath)).resolves.not.toThrow();
    });

    it('should preserve file content in backup', async () => {
      const content = 'important data';
      const filePath = join(testDir, 'data.txt');
      await fs.writeFile(filePath, content);

      const result = await backupManager.createBackup(filePath);
      const backupContent = await fs.readFile(result.backupPath, 'utf8');

      expect(backupContent).toBe(content);
    });

    it('should fail gracefully when file does not exist', async () => {
      const result = await backupManager.createBackup('/nonexistent/file.txt');
      expect(result.success).toBe(false);
    });

    it('should create backup directory if it does not exist', async () => {
      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      await backupManager.createBackup(filePath);

      await expect(fs.access(backupDir)).resolves.not.toThrow();
    });
  });

  describe('Backup Restoration', () => {
    it('should restore file from backup', async () => {
      // Create original file and backup
      const originalPath = join(testDir, 'original.txt');
      const content = 'original content';
      await fs.writeFile(originalPath, content);
      
      const backupResult = await backupManager.createBackup(originalPath);
      
      // Delete original
      await fs.unlink(originalPath);
      
      // Restore from backup
      await backupManager.restoreBackup(backupResult.backupPath, originalPath);
      
      // Verify restoration
      const restoredContent = await fs.readFile(originalPath, 'utf8');
      expect(restoredContent).toBe(content);
    });

    it('should create target directory if needed', async () => {
      const filePath = join(testDir, 'file.txt');
      await fs.writeFile(filePath, 'content');
      
      const backupResult = await backupManager.createBackup(filePath);
      
      const newPath = join(testDir, 'new', 'dir', 'restored.txt');
      await backupManager.restoreBackup(backupResult.backupPath, newPath);
      
      await expect(fs.access(newPath)).resolves.not.toThrow();
    });
  });

  describe('Backup Listing', () => {
    it('should list all backups for a file', async () => {
      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      // Create multiple backups
      await backupManager.createBackup(filePath);
      await new Promise(resolve => setTimeout(resolve, 10));
      await backupManager.createBackup(filePath);
      await new Promise(resolve => setTimeout(resolve, 10));
      await backupManager.createBackup(filePath);

      const backups = await backupManager.listBackups('test.txt');
      expect(backups.length).toBe(3);
    });

    it('should sort backups by timestamp (newest first)', async () => {
      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      await backupManager.createBackup(filePath);
      await new Promise(resolve => setTimeout(resolve, 10));
      await backupManager.createBackup(filePath);

      const backups = await backupManager.listBackups('test.txt');
      expect(backups[0].timestamp).toBeGreaterThan(backups[1].timestamp);
    });

    it('should include backup metadata', async () => {
      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'test content');

      await backupManager.createBackup(filePath);
      const backups = await backupManager.listBackups('test.txt');

      expect(backups[0].path).toBeDefined();
      expect(backups[0].fileName).toBeDefined();
      expect(backups[0].timestamp).toBeGreaterThan(0);
      expect(backups[0].size).toBeGreaterThan(0);
      expect(backups[0].created).toBeInstanceOf(Date);
    });

    it('should return empty array if no backups exist', async () => {
      const backups = await backupManager.listBackups('nonexistent.txt');
      expect(backups).toEqual([]);
    });
  });

  describe('Backup Deletion', () => {
    it('should delete specific backup', async () => {
      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      const result = await backupManager.createBackup(filePath);
      await backupManager.deleteBackup(result.backupPath);

      await expect(fs.access(result.backupPath)).rejects.toThrow();
    });
  });

  describe('Backup Size Calculation', () => {
    it('should calculate total backup size', async () => {
      const file1 = join(testDir, 'file1.txt');
      const file2 = join(testDir, 'file2.txt');
      
      await fs.writeFile(file1, 'a'.repeat(100));
      await fs.writeFile(file2, 'b'.repeat(200));

      await backupManager.createBackup(file1);
      await backupManager.createBackup(file2);

      const totalSize = await backupManager.getBackupSize();
      expect(totalSize).toBe(300);
    });

    it('should return 0 if no backups exist', async () => {
      const size = await backupManager.getBackupSize();
      expect(size).toBe(0);
    });
  });

  describe('Old Backup Cleanup', () => {
    it('should clean backups older than retention period', async () => {
      // Create backup manager with very short retention
      const shortRetentionConfig: FilesConfig = {
        backupEnabled: true,
        backupDir,
        backupRetention: 0.00001, // Very short for testing (< 1 second)
        maxFileSize: 1024 * 1024
      };
      const shortRetentionManager = new BackupManager(shortRetentionConfig);

      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      await shortRetentionManager.createBackup(filePath);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const cleaned = await shortRetentionManager.cleanAllOldBackups();
      expect(cleaned).toBeGreaterThan(0);
    });
  });

  describe('Disabled Backups', () => {
    it('should not create backups when disabled', async () => {
      const disabledConfig: FilesConfig = {
        backupEnabled: false,
        backupDir,
        backupRetention: 1,
        maxFileSize: 1024 * 1024
      };
      const disabledManager = new BackupManager(disabledConfig);

      const filePath = join(testDir, 'test.txt');
      await fs.writeFile(filePath, 'content');

      const result = await disabledManager.createBackup(filePath);
      expect(result.success).toBe(false);
    });
  });
});
