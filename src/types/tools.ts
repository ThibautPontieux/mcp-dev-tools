// Types génériques
export interface ToolResult {
  success: boolean;
  timestamp: string;
  error?: string;
}

// File Operations Types
export interface RenameFileParams {
  agent: string;
  oldPath: string;
  newPath: string;
  overwrite?: boolean;
  createBackup?: boolean;
}

export interface RenameFileResult extends ToolResult {
  oldPath: string;
  newPath: string;
  backupPath?: string;
}

export interface DeleteFileParams {
  agent: string;
  path: string;
  confirm: boolean;
  createBackup?: boolean;
}

export interface DeleteFileResult extends ToolResult {
  path: string;
  backupPath?: string;
}

export interface CopyFileParams {
  agent: string;
  sourcePath: string;
  destPath: string;
  overwrite?: boolean;
  preserveTimestamps?: boolean;
}

export interface CopyFileResult extends ToolResult {
  sourcePath: string;
  destPath: string;
}

export interface FileExistsParams {
  path: string;
}

export interface FileExistsResult extends ToolResult {
  exists: boolean;
  path: string;
  isFile?: boolean;
  isDirectory?: boolean;
}

export interface GetFileInfoParams {
  path: string;
}

export interface GetFileInfoResult extends ToolResult {
  exists: boolean;
  path: string;
  size: number;
  sizeFormatted: string;
  created: string;
  modified: string;
  accessed: string;
  isFile: boolean;
  isDirectory: boolean;
  extension: string;
  mimeType?: string;
  permissions?: string;
}

// FileEntry used by directory operations
export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  sizeFormatted: string;
  modified: string;
  extension?: string;
  depth?: number;
}

// Backup Types
export interface BackupResult {
  success: boolean;
  originalPath: string;
  backupPath: string;
  timestamp: number;
}

export interface BackupInfo {
  path: string;
  fileName: string;
  timestamp: number;
  size: number;
  created: Date;
}

// Rate Limiting Types
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  remaining?: number;
  resetIn?: number;
}
