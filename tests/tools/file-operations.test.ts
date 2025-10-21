import { FileOperations } from '../../src/tools/file-operations';
import { DevToolsConfig } from '../../src/types/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('FileOperations', () => {
  let fileOps: FileOperations;
  let testDir: string;
  let config: DevToolsConfig;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = join(tmpdir(), `test-file-ops-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });

    // Create test configuration
    config = {
      workspace: {
        dir: testDir,
        allowedPaths: [],
        deniedPaths: [],
        maxDepth: 10
      },
      files: {
        backupEnabled: true,
        backupDir: join(testDir, '.backups'),
        backupRetention: 7,
        maxFileSize: 10 * 1024 * 1024 // 10MB
      },
      logging: {
        enabled: true,
        level: 'INFO',
        dir: join(testDir, '.logs'),
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 5
      },
      rateLimits: {
        enabled: false, // Disable for tests
        windowMs: 60000,
        maxRequests: 100
      }
    };

    fileOps = new FileOperations(config);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // ========================================
  // RENAME FILE TESTS
  // ========================================

  describe('renameFile', () => {
    describe('Success Cases', () => {
      it('should rename a file successfully', async () => {
        const oldPath = 'test.txt';
        const newPath = 'renamed.txt';
        const oldFullPath = join(testDir, oldPath);
        const newFullPath = join(testDir, newPath);
        await fs.writeFile(oldFullPath, 'test content');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath
        });

        expect(result.success).toBe(true);
        expect(result.oldPath).toBe(oldPath);
        expect(result.newPath).toBe(newPath);
        expect(result.timestamp).toBeDefined();
        
        await expect(fs.access(oldFullPath)).rejects.toThrow();
        await expect(fs.access(newFullPath)).resolves.not.toThrow();
      });

      it('should preserve file content when renaming', async () => {
        const content = 'important data that should not be lost';
        const oldPath = 'original.txt';
        const newPath = 'renamed.txt';
        await fs.writeFile(join(testDir, oldPath), content);

        await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath
        });

        const newContent = await fs.readFile(join(testDir, newPath), 'utf8');
        expect(newContent).toBe(content);
      });

      it('should move file to subdirectory', async () => {
        const oldPath = 'root-file.txt';
        const newPath = 'sub/dir/moved-file.txt';
        await fs.writeFile(join(testDir, oldPath), 'content');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath
        });

        expect(result.success).toBe(true);
        await expect(fs.access(join(testDir, newPath))).resolves.not.toThrow();
      });

      it('should create parent directories when moving', async () => {
        const oldPath = 'file.txt';
        const newPath = 'deep/nested/path/file.txt';
        await fs.writeFile(join(testDir, oldPath), 'content');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath
        });

        expect(result.success).toBe(true);
        await expect(fs.access(join(testDir, 'deep/nested/path'))).resolves.not.toThrow();
      });

      it('should overwrite existing file when overwrite=true', async () => {
        const oldPath = 'source.txt';
        const newPath = 'dest.txt';
        await fs.writeFile(join(testDir, oldPath), 'new content');
        await fs.writeFile(join(testDir, newPath), 'old content');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath,
          overwrite: true
        });

        expect(result.success).toBe(true);
        const content = await fs.readFile(join(testDir, newPath), 'utf8');
        expect(content).toBe('new content');
      });

      it('should create backup when overwriting', async () => {
        const oldPath = 'source.txt';
        const newPath = 'dest.txt';
        await fs.writeFile(join(testDir, oldPath), 'new content');
        await fs.writeFile(join(testDir, newPath), 'old content to backup');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath,
          overwrite: true,
          createBackup: true
        });

        expect(result.success).toBe(true);
        expect(result.backupPath).toBeDefined();
        
        if (result.backupPath) {
          const backupContent = await fs.readFile(result.backupPath, 'utf8');
          expect(backupContent).toBe('old content to backup');
        }
      });
    });

    describe('Error Cases', () => {
      it('should fail when source file does not exist', async () => {
        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath: 'nonexistent.txt',
          newPath: 'new.txt'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Source file not found');
      });

      it('should fail when destination exists without overwrite', async () => {
        const oldPath = 'source.txt';
        const newPath = 'dest.txt';
        await fs.writeFile(join(testDir, oldPath), 'content');
        await fs.writeFile(join(testDir, newPath), 'existing');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath,
          newPath,
          overwrite: false
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('already exists');
      });

      it('should fail when paths are identical', async () => {
        const path = 'same.txt';
        await fs.writeFile(join(testDir, path), 'content');

        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath: path,
          newPath: path
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('identical');
      });

      it('should fail with invalid old path', async () => {
        const result = await fileOps.renameFile({
          agent: 'test-agent',
          oldPath: '../../../etc/passwd',
          newPath: 'new.txt'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid old path');
      });

      it('should fail without agent parameter', async () => {
        await fs.writeFile(join(testDir, 'test.txt'), 'content');

        const result = await fileOps.renameFile({
          agent: '',
          oldPath: 'test.txt',
          newPath: 'new.txt'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Agent parameter is required');
      });
    });
  });

  // ========================================
  // DELETE FILE TESTS
  // ========================================

  describe('deleteFile', () => {
    describe('Success Cases', () => {
      it('should delete a file successfully', async () => {
        const path = 'to-delete.txt';
        const fullPath = join(testDir, path);
        await fs.writeFile(fullPath, 'content');

        const result = await fileOps.deleteFile({
          agent: 'test-agent',
          path,
          confirm: true
        });

        expect(result.success).toBe(true);
        expect(result.path).toBe(path);
        await expect(fs.access(fullPath)).rejects.toThrow();
      });

      it('should create backup by default', async () => {
        const path = 'important.txt';
        const content = 'important data';
        await fs.writeFile(join(testDir, path), content);

        const result = await fileOps.deleteFile({
          agent: 'test-agent',
          path,
          confirm: true
        });

        expect(result.success).toBe(true);
        expect(result.backupPath).toBeDefined();
        
        if (result.backupPath) {
          const backupContent = await fs.readFile(result.backupPath, 'utf8');
          expect(backupContent).toBe(content);
        }
      });

      it('should not create backup when disabled', async () => {
        const path = 'temp.txt';
        await fs.writeFile(join(testDir, path), 'content');

        const result = await fileOps.deleteFile({
          agent: 'test-agent',
          path,
          confirm: true,
          createBackup: false
        });

        expect(result.success).toBe(true);
        expect(result.backupPath).toBeUndefined();
      });
    });

    describe('Error Cases', () => {
      it('should fail when file does not exist', async () => {
        const result = await fileOps.deleteFile({
          agent: 'test-agent',
          path: 'nonexistent.txt',
          confirm: true
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('File not found');
      });

      it('should fail when confirm is not true', async () => {
        const path = 'test.txt';
        await fs.writeFile(join(testDir, path), 'content');

        const result = await fileOps.deleteFile({
          agent: 'test-agent',
          path,
          confirm: false
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('confirm parameter must be explicitly set to true');
      });

      it('should fail with invalid path', async () => {
        const result = await fileOps.deleteFile({
          agent: 'test-agent',
          path: '../../../etc/passwd',
          confirm: true
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid path');
      });
    });
  });

  // ========================================
  // COPY FILE TESTS
  // ========================================

  describe('copyFile', () => {
    describe('Success Cases', () => {
      it('should copy a file successfully', async () => {
        const sourcePath = 'source.txt';
        const destPath = 'dest.txt';
        const content = 'test content';
        await fs.writeFile(join(testDir, sourcePath), content);

        const result = await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath,
          destPath
        });

        expect(result.success).toBe(true);
        await expect(fs.access(join(testDir, sourcePath))).resolves.not.toThrow();
        await expect(fs.access(join(testDir, destPath))).resolves.not.toThrow();
        
        const destContent = await fs.readFile(join(testDir, destPath), 'utf8');
        expect(destContent).toBe(content);
      });

      it('should preserve file content exactly', async () => {
        const sourcePath = 'original.txt';
        const destPath = 'copy.txt';
        const content = 'Sensitive data\nMulti-line content';
        await fs.writeFile(join(testDir, sourcePath), content);

        await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath,
          destPath
        });

        const copiedContent = await fs.readFile(join(testDir, destPath), 'utf8');
        expect(copiedContent).toBe(content);
      });

      it('should preserve timestamps by default', async () => {
        const sourcePath = 'source.txt';
        const destPath = 'dest.txt';
        await fs.writeFile(join(testDir, sourcePath), 'content');
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const sourceStats = await fs.stat(join(testDir, sourcePath));

        await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath,
          destPath,
          preserveTimestamps: true
        });

        const destStats = await fs.stat(join(testDir, destPath));
        expect(destStats.mtime.getTime()).toBe(sourceStats.mtime.getTime());
      });

      it('should overwrite when specified', async () => {
        const sourcePath = 'source.txt';
        const destPath = 'dest.txt';
        await fs.writeFile(join(testDir, sourcePath), 'new content');
        await fs.writeFile(join(testDir, destPath), 'old content');

        const result = await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath,
          destPath,
          overwrite: true
        });

        expect(result.success).toBe(true);
        const content = await fs.readFile(join(testDir, destPath), 'utf8');
        expect(content).toBe('new content');
      });
    });

    describe('Error Cases', () => {
      it('should fail when source does not exist', async () => {
        const result = await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath: 'nonexistent.txt',
          destPath: 'dest.txt'
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Source file not found');
      });

      it('should fail when destination exists without overwrite', async () => {
        const sourcePath = 'source.txt';
        const destPath = 'dest.txt';
        await fs.writeFile(join(testDir, sourcePath), 'content');
        await fs.writeFile(join(testDir, destPath), 'existing');

        const result = await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath,
          destPath,
          overwrite: false
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('already exists');
      });

      it('should fail when paths are identical', async () => {
        const path = 'same.txt';
        await fs.writeFile(join(testDir, path), 'content');

        const result = await fileOps.copyFile({
          agent: 'test-agent',
          sourcePath: path,
          destPath: path
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('identical');
      });
    });
  });

  // ========================================
  // FILE EXISTS TESTS
  // ========================================

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const path = 'existing.txt';
      await fs.writeFile(join(testDir, path), 'content');

      const result = await fileOps.fileExists({ path });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.isFile).toBe(true);
      expect(result.isDirectory).toBe(false);
    });

    it('should return true for directory', async () => {
      const path = 'existing-dir';
      await fs.mkdir(join(testDir, path));

      const result = await fileOps.fileExists({ path });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.isFile).toBe(false);
      expect(result.isDirectory).toBe(true);
    });

    it('should return false for non-existent', async () => {
      const result = await fileOps.fileExists({ path: 'nonexistent.txt' });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
    });

    it('should fail with invalid path', async () => {
      const result = await fileOps.fileExists({ path: '../../../etc/passwd' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid path');
    });
  });

  // ========================================
  // GET FILE INFO TESTS
  // ========================================

  describe('getFileInfo', () => {
    it('should return complete file information', async () => {
      const path = 'info-test.txt';
      const content = 'test content';
      await fs.writeFile(join(testDir, path), content);

      const result = await fileOps.getFileInfo({ path });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(true);
      expect(result.size).toBe(content.length);
      expect(result.isFile).toBe(true);
      expect(result.extension).toBe('.txt');
      expect(result.created).toBeDefined();
      expect(result.modified).toBeDefined();
    });

    it('should format size correctly', async () => {
      const path = 'large.txt';
      await fs.writeFile(join(testDir, path), 'x'.repeat(1024));

      const result = await fileOps.getFileInfo({ path });

      expect(result.sizeFormatted).toContain('KB');
    });

    it('should return info for directory', async () => {
      const path = 'test-dir';
      await fs.mkdir(join(testDir, path));

      const result = await fileOps.getFileInfo({ path });

      expect(result.success).toBe(true);
      expect(result.isDirectory).toBe(true);
      expect(result.extension).toBe('');
    });

    it('should return false for non-existent', async () => {
      const result = await fileOps.getFileInfo({ path: 'nonexistent.txt' });

      expect(result.success).toBe(true);
      expect(result.exists).toBe(false);
    });
  });

  // ========================================
  // READ FILE TESTS
  // ========================================

  describe('readFile', () => {
    it('should read text file successfully', async () => {
      const path = 'read-test.txt';
      const content = 'Hello, World!';
      await fs.writeFile(join(testDir, path), content);

      const result = await fileOps.readFile({ path });

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
      expect(result.size).toBe(content.length);
      expect(result.encoding).toBe('utf8');
    });

    it('should read UTF-8 content', async () => {
      const path = 'utf8.txt';
      const content = 'Héllo Wörld 你好';
      await fs.writeFile(join(testDir, path), content, 'utf8');

      const result = await fileOps.readFile({ path, encoding: 'utf8' });

      expect(result.success).toBe(true);
      expect(result.content).toBe(content);
    });

    it('should read with base64 encoding', async () => {
      const path = 'binary.txt';
      const content = 'test';
      await fs.writeFile(join(testDir, path), content);

      const result = await fileOps.readFile({ path, encoding: 'base64' });

      expect(result.success).toBe(true);
      expect(result.encoding).toBe('base64');
    });

    it('should fail for non-existent file', async () => {
      const result = await fileOps.readFile({ path: 'nonexistent.txt' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('File not found');
    });

    it('should fail for directory', async () => {
      const path = 'test-dir';
      await fs.mkdir(join(testDir, path));

      const result = await fileOps.readFile({ path });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not a file');
    });
  });

  // ========================================
  // WRITE FILE TESTS
  // ========================================

  describe('writeFile', () => {
    it('should write file successfully', async () => {
      const path = 'write-test.txt';
      const content = 'test content';

      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path,
        content
      });

      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
      
      const written = await fs.readFile(join(testDir, path), 'utf8');
      expect(written).toBe(content);
    });

    it('should create parent directories', async () => {
      const path = 'sub/dir/file.txt';
      const content = 'content';

      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path,
        content
      });

      expect(result.success).toBe(true);
      await expect(fs.access(join(testDir, 'sub/dir'))).resolves.not.toThrow();
    });

    it('should fail without overwrite flag', async () => {
      const path = 'existing.txt';
      await fs.writeFile(join(testDir, path), 'old');

      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path,
        content: 'new',
        overwrite: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should overwrite with flag', async () => {
      const path = 'existing.txt';
      await fs.writeFile(join(testDir, path), 'old');

      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path,
        content: 'new',
        overwrite: true
      });

      expect(result.success).toBe(true);
      const content = await fs.readFile(join(testDir, path), 'utf8');
      expect(content).toBe('new');
    });

    it('should create backup when overwriting', async () => {
      const path = 'existing.txt';
      const oldContent = 'old content';
      await fs.writeFile(join(testDir, path), oldContent);

      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path,
        content: 'new content',
        overwrite: true,
        createBackup: true
      });

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      
      if (result.backupPath) {
        const backup = await fs.readFile(result.backupPath, 'utf8');
        expect(backup).toBe(oldContent);
      }
    });

    it('should write with base64 encoding', async () => {
      const path = 'base64.txt';
      const content = Buffer.from('test').toString('base64');

      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path,
        content,
        encoding: 'base64'
      });

      expect(result.success).toBe(true);
    });

    it('should fail with invalid path', async () => {
      const result = await fileOps.writeFile({
        agent: 'test-agent',
        path: '../../../etc/passwd',
        content: 'content'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid path');
    });
  });
});
