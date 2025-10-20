export interface DevToolsConfig {
  workspace: WorkspaceConfig;
  commands: CommandConfig;
  search: SearchConfig;
  files: FilesConfig;
  rateLimits: RateLimitsConfig;
  logging: LoggingConfig;
}

export interface WorkspaceConfig {
  dir: string;
  allowOutsideAccess: boolean;
  protectedPaths: string[];
}

export interface CommandConfig {
  enabled: boolean;
  whitelist: string[];
  blacklist: string[];
  timeout: number;
  maxConcurrent: number;
}

export interface SearchConfig {
  maxFileSize: number;
  maxResults: number;
  skipPatterns: string[];
  cacheEnabled: boolean;
  cacheTTL: number;
}

export interface FilesConfig {
  backupEnabled: boolean;
  backupDir: string;
  backupRetention: number;
  maxFileSize: number;
}

export interface RateLimitsConfig {
  enabled: boolean;
  limits: Record<string, RateLimit>;
}

export interface RateLimit {
  max: number;
  per: number;
}

export interface LoggingConfig {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  logDir: string;
  maxLogSize: number;
  retention: number;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

// Logging Types
export interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  agent: string;
  operation: string;
  params: Record<string, any>;
  result: {
    success: boolean;
    duration: number;
    error?: string;
  };
  metadata?: {
    workspaceDir: string;
    nodeVersion: string;
    platform: string;
    memoryUsage: number;
  };
}
