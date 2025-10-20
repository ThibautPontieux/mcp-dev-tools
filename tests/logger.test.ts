import { Logger } from '../src/utils/logger';
import { LoggingConfig } from '../src/types/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('Logger', () => {
  let logger: Logger;
  let testLogDir: string;

  beforeEach(async () => {
    // Create temporary log directory
    testLogDir = join(tmpdir(), `test-logs-${Date.now()}`);
    
    const config: LoggingConfig = {
      level: 'DEBUG',
      logDir: testLogDir,
      maxLogSize: 1024, // 1KB for testing rotation
      retention: 1 // 1 day
    };
    
    logger = new Logger(config);
  });

  afterEach(async () => {
    // Clean up test logs
    try {
      const files = await fs.readdir(testLogDir);
      for (const file of files) {
        await fs.unlink(join(testLogDir, file));
      }
      await fs.rmdir(testLogDir);
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Logging Levels', () => {
    it('should log DEBUG level messages', async () => {
      await logger.log({
        level: 'DEBUG',
        agent: 'test',
        operation: 'test_operation',
        params: { test: 'value' },
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs.length).toBe(1);
      expect(logs[0].level).toBe('DEBUG');
    });

    it('should log INFO level messages', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'test_operation',
        params: {},
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].level).toBe('INFO');
    });

    it('should log WARN level messages', async () => {
      await logger.log({
        level: 'WARN',
        agent: 'test',
        operation: 'test_operation',
        params: {},
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].level).toBe('WARN');
    });

    it('should log ERROR level messages', async () => {
      await logger.log({
        level: 'ERROR',
        agent: 'test',
        operation: 'test_operation',
        params: {},
        result: { success: false, duration: 100, error: 'Test error' }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].level).toBe('ERROR');
    });
  });

  describe('Sensitive Data Sanitization', () => {
    it('should redact password fields', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'login',
        params: { username: 'john', password: 'secret123' },
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].params.password).toBe('[REDACTED]');
      expect(logs[0].params.username).toBe('john');
    });

    it('should redact token fields', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'api_call',
        params: { apiToken: 'abc123', data: 'test' },
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].params.apiToken).toBe('[REDACTED]');
    });

    it('should redact secret fields', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'config',
        params: { clientSecret: 'xyz789', setting: 'value' },
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].params.clientSecret).toBe('[REDACTED]');
    });

    it('should redact nested sensitive fields', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'nested',
        params: {
          user: {
            name: 'john',
            password: 'secret'
          }
        },
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].params.user.password).toBe('[REDACTED]');
      expect(logs[0].params.user.name).toBe('john');
    });
  });

  describe('Log Structure', () => {
    it('should include timestamp', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'test',
        params: {},
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp)).toBeInstanceOf(Date);
    });

    it('should include metadata', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'test',
        params: {},
        result: { success: true, duration: 100 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].metadata).toBeDefined();
      expect(logs[0].metadata.workspaceDir).toBeDefined();
      expect(logs[0].metadata.nodeVersion).toBeDefined();
      expect(logs[0].metadata.platform).toBeDefined();
      expect(logs[0].metadata.memoryUsage).toBeDefined();
    });

    it('should include operation details', async () => {
      await logger.log({
        level: 'INFO',
        agent: 'developer',
        operation: 'rename_file',
        params: { oldPath: 'a.txt', newPath: 'b.txt' },
        result: { success: true, duration: 50 }
      });

      const logs = await logger.getRecentLogs(10);
      expect(logs[0].agent).toBe('developer');
      expect(logs[0].operation).toBe('rename_file');
      expect(logs[0].result.success).toBe(true);
      expect(logs[0].result.duration).toBe(50);
    });
  });

  describe('Log Retrieval', () => {
    it('should retrieve recent logs', async () => {
      // Log multiple entries
      for (let i = 0; i < 5; i++) {
        await logger.log({
          level: 'INFO',
          agent: 'test',
          operation: `operation_${i}`,
          params: {},
          result: { success: true, duration: 100 }
        });
      }

      const logs = await logger.getRecentLogs(3);
      expect(logs.length).toBe(3);
    });

    it('should return empty array if no logs exist', async () => {
      const logs = await logger.getRecentLogs(10);
      expect(logs).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle logging errors gracefully', async () => {
      // Try to log to invalid directory
      const badConfig: LoggingConfig = {
        level: 'INFO',
        logDir: '/invalid/path/that/does/not/exist',
        maxLogSize: 1024,
        retention: 1
      };
      
      const badLogger = new Logger(badConfig);
      
      // Should not throw
      await expect(badLogger.log({
        level: 'INFO',
        agent: 'test',
        operation: 'test',
        params: {},
        result: { success: true, duration: 100 }
      })).resolves.not.toThrow();
    });
  });
});
