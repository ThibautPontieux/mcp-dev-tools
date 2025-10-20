import { promises as fs } from 'fs';
import { join } from 'path';
import { DevToolsConfig } from '../types/config.js';

/**
 * Load configuration from multiple sources with priority:
 * 1. Environment variables (highest priority)
 * 2. .dev-tools.config.json file
 * 3. Default values (lowest priority)
 */
export async function loadConfig(): Promise<DevToolsConfig> {
  // Start with defaults
  const config: DevToolsConfig = getDefaultConfig();

  // Try to load from config file
  const fileConfig = await loadConfigFile();
  if (fileConfig) {
    mergeConfig(config, fileConfig);
  }

  // Override with environment variables
  applyEnvironmentVariables(config);

  return config;
}

/**
 * Get default configuration
 */
function getDefaultConfig(): DevToolsConfig {
  return {
    workspace: {
      dir: process.cwd(),
      allowOutsideAccess: false,
      protectedPaths: ['node_modules', '.git', 'dist', '.env', 'build', 'coverage']
    },
    commands: {
      enabled: false,
      whitelist: ['npm', 'tsc', 'eslint', 'jest', 'git'],
      blacklist: ['rm -rf', 'sudo', 'chmod', 'chown', 'kill'],
      timeout: 30000,
      maxConcurrent: 3
    },
    search: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxResults: 100,
      skipPatterns: ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'coverage/**'],
      cacheEnabled: true,
      cacheTTL: 300000 // 5 minutes
    },
    files: {
      backupEnabled: true,
      backupDir: '.backups',
      backupRetention: 7, // days
      maxFileSize: 10 * 1024 * 1024 // 10MB
    },
    rateLimits: {
      enabled: true,
      limits: {
        // File Operations
        rename_file: { max: 50, per: 60000 },
        delete_file: { max: 20, per: 60000 },
        copy_file: { max: 50, per: 60000 },
        get_file_info: { max: 200, per: 60000 },
        
        // Directory Operations
        list_directory: { max: 100, per: 60000 },
        create_directory: { max: 50, per: 60000 },
        delete_directory: { max: 10, per: 60000 },
        move_directory: { max: 20, per: 60000 },
        
        // Search Operations
        search_files: { max: 100, per: 60000 },
        search_content: { max: 50, per: 60000 },
        find_duplicates: { max: 20, per: 60000 }
      }
    },
    logging: {
      level: 'INFO',
      logDir: '.logs',
      maxLogSize: 10 * 1024 * 1024, // 10MB
      retention: 30 // days
    }
  };
}

/**
 * Load configuration from .dev-tools.config.json
 */
async function loadConfigFile(): Promise<Partial<DevToolsConfig> | null> {
  try {
    const configPath = join(process.cwd(), '.dev-tools.config.json');
    const content = await fs.readFile(configPath, 'utf8');
    return JSON.parse(content);
  } catch {
    // Config file doesn't exist or is invalid, use defaults
    return null;
  }
}

/**
 * Merge configuration objects (deep merge)
 */
function mergeConfig(target: DevToolsConfig, source: Partial<DevToolsConfig>): void {
  for (const key in source) {
    const sourceValue = source[key as keyof DevToolsConfig];
    const targetValue = target[key as keyof DevToolsConfig];

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      // Deep merge for objects
      Object.assign(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      // Direct assignment for primitives and arrays
      (target as any)[key] = sourceValue;
    }
  }
}

/**
 * Apply environment variable overrides
 */
function applyEnvironmentVariables(config: DevToolsConfig): void {
  // Workspace
  if (process.env.WORKSPACE_DIR) {
    config.workspace.dir = process.env.WORKSPACE_DIR;
  }
  if (process.env.ALLOW_OUTSIDE_ACCESS === 'true') {
    config.workspace.allowOutsideAccess = true;
  }

  // Commands
  if (process.env.ALLOW_COMMAND_EXECUTION === 'true') {
    config.commands.enabled = true;
  }
  if (process.env.COMMAND_TIMEOUT) {
    config.commands.timeout = parseInt(process.env.COMMAND_TIMEOUT);
  }

  // Files
  if (process.env.BACKUP_ENABLED === 'false') {
    config.files.backupEnabled = false;
  }
  if (process.env.BACKUP_DIR) {
    config.files.backupDir = process.env.BACKUP_DIR;
  }
  if (process.env.BACKUP_RETENTION) {
    config.files.backupRetention = parseInt(process.env.BACKUP_RETENTION);
  }

  // Rate Limits
  if (process.env.RATE_LIMIT_ENABLED === 'false') {
    config.rateLimits.enabled = false;
  }

  // Logging
  if (process.env.LOG_LEVEL) {
    const level = process.env.LOG_LEVEL.toUpperCase();
    if (level === 'DEBUG' || level === 'INFO' || level === 'WARN' || level === 'ERROR') {
      config.logging.level = level;
    }
  }
  if (process.env.LOG_DIR) {
    config.logging.logDir = process.env.LOG_DIR;
  }
  if (process.env.LOG_RETENTION) {
    config.logging.retention = parseInt(process.env.LOG_RETENTION);
  }
}

/**
 * Validate configuration
 */
export function validateConfig(config: DevToolsConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate workspace
  if (!config.workspace.dir) {
    errors.push('Workspace directory is required');
  }

  // Validate commands
  if (config.commands.timeout < 1000) {
    errors.push('Command timeout must be at least 1000ms');
  }
  if (config.commands.maxConcurrent < 1) {
    errors.push('Max concurrent commands must be at least 1');
  }

  // Validate search
  if (config.search.maxFileSize < 1) {
    errors.push('Max file size must be positive');
  }
  if (config.search.maxResults < 1) {
    errors.push('Max results must be at least 1');
  }

  // Validate files
  if (config.files.backupRetention < 1) {
    errors.push('Backup retention must be at least 1 day');
  }

  // Validate logging
  if (config.logging.retention < 1) {
    errors.push('Log retention must be at least 1 day');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Save configuration to file
 */
export async function saveConfig(config: DevToolsConfig): Promise<void> {
  const configPath = join(process.cwd(), '.dev-tools.config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
}
