import { ToolResult } from './tools.js';

// ============================================
// SEARCH FILES
// ============================================

export interface SearchFilesParams {
  agent: string;
  pattern: string;
  path?: string;
  recursive?: boolean;
  caseSensitive?: boolean;
  includeHidden?: boolean;
  fileTypes?: string[];
  maxResults?: number;
  excludePatterns?: string[];
  useRegex?: boolean;
}

export interface SearchFilesResult extends ToolResult {
  query: string;
  results: SearchFileEntry[];
  totalFound: number;
  totalReturned: number;
  searchTime: number;
  truncated: boolean;
}

export interface SearchFileEntry {
  path: string;
  name: string;
  size: number;
  sizeFormatted: string;
  modified: string;
  extension: string;
  relevanceScore?: number;
  matchType: 'exact' | 'partial' | 'pattern';
}

// ============================================
// SEARCH CONTENT
// ============================================

export interface SearchContentParams {
  agent: string;
  query: string;
  path?: string;
  recursive?: boolean;
  caseSensitive?: boolean;
  useRegex?: boolean;
  fileTypes?: string[];
  maxResults?: number;
  maxFileSize?: number;
  context?: number;
  excludePatterns?: string[];
  wholeWord?: boolean;
}

export interface SearchContentResult extends ToolResult {
  query: string;
  results: ContentMatch[];
  totalFiles: number;
  totalMatches: number;
  filesWithMatches: number;
  searchTime: number;
  truncated: boolean;
}

export interface ContentMatch {
  file: string;
  matches: Match[];
  matchCount: number;
}

export interface Match {
  line: number;
  column: number;
  text: string;
  before: string[];
  after: string[];
  matchedText: string;
}

// ============================================
// FIND DUPLICATES
// ============================================

export interface FindDuplicatesParams {
  agent: string;
  path?: string;
  recursive?: boolean;
  compareBy?: 'hash' | 'name' | 'size-name';
  minSize?: number;
  maxSize?: number;
  fileTypes?: string[];
  excludePatterns?: string[];
}

export interface FindDuplicatesResult extends ToolResult {
  duplicateGroups: DuplicateGroup[];
  totalDuplicates: number;
  totalGroups: number;
  wastedSpace: number;
  wastedSpaceFormatted: string;
  searchTime: number;
}

export interface DuplicateGroup {
  files: DuplicateFile[];
  count: number;
  size: number;
  sizeFormatted: string;
  hash?: string;
  totalWasted: number;
}

export interface DuplicateFile {
  path: string;
  modified: string;
  original: boolean;
}
