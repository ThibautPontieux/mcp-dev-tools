import { promises as fs } from 'fs';
import { join } from 'path';
import { LoggingConfig, LogEntry } from '../types/config.js';

/**
 * Logger - Handles structured logging with rotation and sanitization
 */
export class Logger {
  private logDir: string;
  private level: LoggingConfig['level'];
  private currentLogFile: string;
  private maxLogSize: number;
  private retention: number;
  private logLevels: Record<string, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

  constructor(config: LoggingConfig) {
    this.logDir = config.logDir;
    this.level = config.level;
    this.maxLogSize = config.maxLogSize;
    this.retention = config.retention;
    this.currentLogFile = this.getLogFileName();
  }

  /**
   * Log an entry
   */
  async log(entry: Partial<LogEntry>): Promise<void> {
    try {
      // Check if should log based on level
      const entryLevel = entry.level || 'INFO';
      const entryLevelValue = this.logLevels[entryLevel];
      const configLevelValue = this.logLevels[this.level];
      
      if (entryLevelValue < configLevelValue) {
        return;
      }

      // Ensure log directory exists
      await this.ensureLogDir();

      // Create complete log entry
      const completeEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: entryLevel,
        agent: entry.agent || 'unknown',
        operation: entry.operation || 'unknown',
        params: this.sanitizeParams(entry.params || {}),
        result: entry.result || { success: false, duration: 0 },
        metadata: {
          workspaceDir: process.cwd(),
          nodeVersion: process.version,
          platform: process.platform,
          memoryUsage: process.memoryUsage().heapUsed,
          ...entry.metadata
        }
      };

      // Format log entry
      const logLine = JSON.stringify(completeEntry) + '\n';

      // Check if rotation needed
      await this.rotateIfNeeded();

      // Write to log file
      const logPath = join(this.logDir, this.currentLogFile);
      await fs.appendFile(logPath, logLine, 'utf8');

      // Also log to console for errors
      if (entryLevel === 'ERROR') {
        console.error(`[${entryLevel}] ${entry.operation}: ${entry.result?.error || 'Unknown error'}`);
      }
    } catch (error) {
      // Fallback to console if logging fails
      console.error('Failed to write log:', error);
      console.error('Original log entry:', entry);
    }
  }

  /**
   * Sanitize sensitive parameters
   */
  private sanitizeParams(params: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'auth', 'key'];
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeParams(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Get current log file name
   */
  private getLogFileName(): string {
    const date = new Date().toISOString().split('T')[0];
    return `dev-tools-${date}.log`;
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDir(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
    }
  }

  /**
   * Rotate log file if needed
   */
  private async rotateIfNeeded(): Promise<void> {
    try {
      const logPath = join(this.logDir, this.currentLogFile);
      
      // Check if file exists
      let stats;
      try {
        stats = await fs.stat(logPath);
      } catch {
        // File doesn't exist, no rotation needed
        return;
      }

      // Check if file size exceeds limit
      if (stats.size >= this.maxLogSize) {
        const timestamp = Date.now();
        const rotatedName = this.currentLogFile.replace('.log', `-${timestamp}.log`);
        const rotatedPath = join(this.logDir, rotatedName);
        
        // Rename current log file
        await fs.rename(logPath, rotatedPath);
        
        // Update current log file name (will be created on next write)
        this.currentLogFile = this.getLogFileName();
      }

      // Clean old logs
      await this.cleanOldLogs();
    } catch (error) {
      console.error('Failed to rotate log:', error);
    }
  }

  /**
   * Clean logs older than retention period
   */
  private async cleanOldLogs(): Promise<void> {
    try {
      const files = await fs.readdir(this.logDir);
      const now = Date.now();
      const retentionMs = this.retention * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = join(this.logDir, file);
        const stats = await fs.stat(filePath);
        const age = now - stats.mtimeMs;

        if (age > retentionMs) {
          await fs.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to clean old logs:', error);
    }
  }

  /**
   * Get recent logs
   */
  async getRecentLogs(limit: number = 100): Promise<LogEntry[]> {
    try {
      const logPath = join(this.logDir, this.currentLogFile);
      const content = await fs.readFile(logPath, 'utf8');
      const lines = content.trim().split('\n');
      
      const entries: LogEntry[] = [];
      for (let i = Math.max(0, lines.length - limit); i < lines.length; i++) {
        try {
          entries.push(JSON.parse(lines[i]));
        } catch {
          // Skip invalid JSON lines
        }
      }
      
      return entries;
    } catch {
      return [];
    }
  }
}
