import { ToolResult, FileEntry } from './tools.js';

// ============================================
// LIST DIRECTORY
// ============================================

export interface ListDirectoryParams {
  agent: string;
  path?: string;
  recursive?: boolean;
  includeHidden?: boolean;
  fileTypes?: string[];
  sortBy?: 'name' | 'size' | 'modified';
  sortOrder?: 'asc' | 'desc';
  maxDepth?: number;
  pattern?: string;
}

export interface ListDirectoryResult extends ToolResult {
  path: string;
  files: FileEntry[];
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  totalSizeFormatted: string;
  depth: number;
}

// ============================================
// CREATE DIRECTORY
// ============================================

export interface CreateDirectoryParams {
  agent: string;
  path: string;
  recursive?: boolean;
  mode?: string;
}

export interface CreateDirectoryResult extends ToolResult {
  path: string;
  created: string[];
  permissions?: string;
}

// ============================================
// DELETE DIRECTORY
// ============================================

export interface DeleteDirectoryParams {
  agent: string;
  path: string;
  confirm: boolean;
  recursive?: boolean;
  createBackup?: boolean;
  force?: boolean;
}

export interface DeleteDirectoryResult extends ToolResult {
  path: string;
  backupPath?: string;
  filesDeleted: number;
  directoriesDeleted: number;
  totalSize: number;
  totalSizeFormatted: string;
}

// ============================================
// MOVE DIRECTORY
// ============================================

export interface MoveDirectoryParams {
  agent: string;
  sourcePath: string;
  destPath: string;
  overwrite?: boolean;
  createBackup?: boolean;
  merge?: boolean;
}

export interface MoveDirectoryResult extends ToolResult {
  sourcePath: string;
  destPath: string;
  backupPath?: string;
  filesMoved: number;
  directoriesMoved: number;
  totalSize: number;
  merged: boolean;
}
