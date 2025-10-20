import { promises as fs } from 'fs';
import { join, basename, extname } from 'path';
import * as glob from 'fast-glob';
import { PathValidator } from '../utils/path-validator.js';
import { Logger } from '../utils/logger.js';
import { RateLimiter } from '../utils/rate-limiter.js';
import { SearchCache } from '../utils/search-cache.js';
import { FileHasher } from '../utils/file-hasher.js';
import { DevToolsConfig } from '../types/config.js';
import {
  SearchFilesParams,
  SearchFilesResult,
  SearchFileEntry,
  SearchContentParams,
  SearchContentResult,
  ContentMatch,
  Match,
  FindDuplicatesParams,
  FindDuplicatesResult,
  DuplicateGroup,
  DuplicateFile
} from '../types/search.js';

/**
 * SearchOperations - Handles all search and duplicate detection operations
 */
export class SearchOperations {
  private workspaceDir: string;
  private pathValidator: PathValidator;
  private logger: Logger;
  private rateLimiter: RateLimiter;
  private searchCache: SearchCache;
  private fileHasher: FileHasher;
  private defaultExcludePatterns = [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/.cache/**'
  ];

  constructor(config: DevToolsConfig) {
    this.workspaceDir = config.workspace.dir;
    this.pathValidator = new PathValidator(config.workspace);
    this.logger = new Logger(config.logging);
    this.rateLimiter = new RateLimiter(config.rateLimits);
    this.searchCache = new SearchCache(300000); // 5 min cache
    this.fileHasher = new FileHasher();
  }

  /**
   * Search for files by name or pattern
   */
  async searchFiles(params: SearchFilesParams): Promise<SearchFilesResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('search_files', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Check cache
      const cacheKey = SearchCache.generateKey('search_files', params);
      const cached = this.searchCache.get<SearchFilesResult>(cacheKey);
      if (cached) {
        return cached;
      }

      // 3. Validate params
      this.validateSearchFilesParams(params);

      // 4. Validate path
      const searchPath = params.path || '';
      if (searchPath) {
        const pathValidation = this.pathValidator.validatePath(searchPath);
        if (!pathValidation.valid) {
          throw new Error(`Invalid path: ${pathValidation.reason}`);
        }
      }

      const fullPath = join(this.workspaceDir, searchPath);

      // 5. Build search pattern
      const pattern = this.buildSearchPattern(params);
      
      // 6. Build exclude patterns
      const excludePatterns = [
        ...this.defaultExcludePatterns,
        ...(params.excludePatterns || [])
      ];

      // 7. Search files
      const globOptions = {
        cwd: fullPath,
        onlyFiles: true,
        dot: params.includeHidden || false,
        deep: params.recursive !== false ? Infinity : 1,
        absolute: false,
        ignore: excludePatterns,
        caseSensitiveMatch: params.caseSensitive || false
      };

      let foundFiles = await glob.glob(pattern, globOptions);

      // 8. Filter by file types
      if (params.fileTypes && params.fileTypes.length > 0) {
        foundFiles = foundFiles.filter(file => {
          const ext = extname(file);
          return params.fileTypes!.includes(ext);
        });
      }

      // 9. Get file info and calculate relevance
      const results: SearchFileEntry[] = [];
      for (const file of foundFiles) {
        const filePath = join(fullPath, file);
        const stats = await fs.stat(filePath);
        const fileName = basename(file);

        const entry: SearchFileEntry = {
          path: file,
          name: fileName,
          size: stats.size,
          sizeFormatted: this.formatSize(stats.size),
          modified: stats.mtime.toISOString(),
          extension: extname(file),
          relevanceScore: this.calculateRelevance(fileName, params.pattern, params.caseSensitive),
          matchType: this.determineMatchType(fileName, params.pattern)
        };

        results.push(entry);
      }

      // 10. Sort by relevance
      results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      // 11. Apply max results
      const maxResults = params.maxResults || 100;
      const truncated = results.length > maxResults;
      const returnedResults = results.slice(0, maxResults);

      const searchTime = Date.now() - startTime;

      // 12. Log success
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'search_files',
        params: {
          pattern: params.pattern,
          path: searchPath,
          resultsFound: results.length
        },
        result: { success: true, duration: searchTime }
      });

      const result: SearchFilesResult = {
        success: true,
        query: params.pattern,
        results: returnedResults,
        totalFound: results.length,
        totalReturned: returnedResults.length,
        searchTime,
        truncated,
        timestamp
      };

      // 13. Cache result
      this.searchCache.set(cacheKey, result);

      return result;

    } catch (error) {
      const searchTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'search_files',
        params: { pattern: params.pattern },
        result: { success: false, duration: searchTime, error: errorMessage }
      });

      return {
        success: false,
        query: params.pattern,
        results: [],
        totalFound: 0,
        totalReturned: 0,
        searchTime,
        truncated: false,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Search for content within files
   */
  async searchContent(params: SearchContentParams): Promise<SearchContentResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('search_content', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Validate params
      this.validateSearchContentParams(params);

      // 3. Validate path
      const searchPath = params.path || '';
      if (searchPath) {
        const pathValidation = this.pathValidator.validatePath(searchPath);
        if (!pathValidation.valid) {
          throw new Error(`Invalid path: ${pathValidation.reason}`);
        }
      }

      const fullPath = join(this.workspaceDir, searchPath);

      // 4. Build file list
      const excludePatterns = [
        ...this.defaultExcludePatterns,
        ...(params.excludePatterns || [])
      ];

      let pattern = '**/*';
      if (params.fileTypes && params.fileTypes.length > 0) {
        pattern = `**/*{${params.fileTypes.join(',')}}`;
      }

      const globOptions = {
        cwd: fullPath,
        onlyFiles: true,
        dot: false,
        deep: params.recursive !== false ? Infinity : 1,
        absolute: false,
        ignore: excludePatterns
      };

      const files = await glob.glob(pattern, globOptions);

      // 5. Build search regex
      const searchRegex = this.buildSearchRegex(params);

      // 6. Search in files
      const results: ContentMatch[] = [];
      let totalMatches = 0;
      let filesScanned = 0;
      const maxResults = params.maxResults || 50;
      const maxFileSize = params.maxFileSize || 1048576; // 1MB default

      for (const file of files) {
        if (results.length >= maxResults) break;

        const filePath = join(fullPath, file);
        filesScanned++;

        // Check file size
        const stats = await fs.stat(filePath);
        if (stats.size > maxFileSize) continue;

        // Skip binary files
        if (await this.isBinaryFile(filePath)) continue;

        // Search in file
        const matches = await this.searchInFile(filePath, searchRegex, params.context || 2);
        
        if (matches.length > 0) {
          results.push({
            file,
            matches,
            matchCount: matches.length
          });
          totalMatches += matches.length;
        }
      }

      const searchTime = Date.now() - startTime;

      // 7. Log success
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'search_content',
        params: {
          query: params.query,
          filesScanned,
          matchesFound: totalMatches
        },
        result: { success: true, duration: searchTime }
      });

      return {
        success: true,
        query: params.query,
        results,
        totalFiles: filesScanned,
        totalMatches,
        filesWithMatches: results.length,
        searchTime,
        truncated: results.length >= maxResults,
        timestamp
      };

    } catch (error) {
      const searchTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'search_content',
        params: { query: params.query },
        result: { success: false, duration: searchTime, error: errorMessage }
      });

      return {
        success: false,
        query: params.query,
        results: [],
        totalFiles: 0,
        totalMatches: 0,
        filesWithMatches: 0,
        searchTime,
        truncated: false,
        timestamp,
        error: errorMessage
      };
    }
  }

  /**
   * Find duplicate files
   */
  async findDuplicates(params: FindDuplicatesParams): Promise<FindDuplicatesResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    try {
      // 1. Rate limiting
      const rateCheck = this.rateLimiter.checkLimit('find_duplicates', params.agent);
      if (!rateCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateCheck.reason}`);
      }

      // 2. Check cache
      const cacheKey = SearchCache.generateKey('find_duplicates', params);
      const cached = this.searchCache.get<FindDuplicatesResult>(cacheKey);
      if (cached) {
        return cached;
      }

      // 3. Validate params
      this.validateFindDuplicatesParams(params);

      // 4. Validate path
      const searchPath = params.path || '';
      if (searchPath) {
        const pathValidation = this.pathValidator.validatePath(searchPath);
        if (!pathValidation.valid) {
          throw new Error(`Invalid path: ${pathValidation.reason}`);
        }
      }

      const fullPath = join(this.workspaceDir, searchPath);

      // 5. Get all files
      const excludePatterns = [
        ...this.defaultExcludePatterns,
        ...(params.excludePatterns || [])
      ];

      let pattern = '**/*';
      if (params.fileTypes && params.fileTypes.length > 0) {
        pattern = `**/*{${params.fileTypes.join(',')}}`;
      }

      const globOptions = {
        cwd: fullPath,
        onlyFiles: true,
        dot: false,
        deep: params.recursive !== false ? Infinity : 1,
        absolute: false,
        ignore: excludePatterns
      };

      const files = await glob.glob(pattern, globOptions);

      // 6. Filter by size
      const minSize = params.minSize || 1024; // 1KB default
      const maxSize = params.maxSize;

      const filteredFiles: Array<{ path: string; size: number; modified: string }> = [];

      for (const file of files) {
        const filePath = join(fullPath, file);
        const stats = await fs.stat(filePath);

        if (stats.size < minSize) continue;
        if (maxSize && stats.size > maxSize) continue;

        filteredFiles.push({
          path: file,
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      }

      // 7. Find duplicates based on compareBy
      const compareBy = params.compareBy || 'hash';
      const groups = await this.groupDuplicates(fullPath, filteredFiles, compareBy);

      // 8. Calculate statistics
      let totalDuplicates = 0;
      let wastedSpace = 0;

      const duplicateGroups: DuplicateGroup[] = groups.map(group => {
        // Sort by modification date (oldest first = original)
        group.files.sort((a, b) => 
          new Date(a.modified).getTime() - new Date(b.modified).getTime()
        );

        const duplicateFiles: DuplicateFile[] = group.files.map((file, index) => ({
          path: file.path,
          modified: file.modified,
          original: index === 0
        }));

        const duplicatesInGroup = group.files.length - 1;
        totalDuplicates += duplicatesInGroup;

        const groupWasted = group.size * duplicatesInGroup;
        wastedSpace += groupWasted;

        return {
          files: duplicateFiles,
          count: group.files.length,
          size: group.size,
          sizeFormatted: this.formatSize(group.size),
          hash: group.hash,
          totalWasted: groupWasted
        };
      });

      const searchTime = Date.now() - startTime;

      // 9. Log success
      await this.logger.log({
        level: 'INFO',
        agent: params.agent,
        operation: 'find_duplicates',
        params: {
          compareBy,
          groupsFound: duplicateGroups.length,
          totalDuplicates
        },
        result: { success: true, duration: searchTime }
      });

      const result: FindDuplicatesResult = {
        success: true,
        duplicateGroups,
        totalDuplicates,
        totalGroups: duplicateGroups.length,
        wastedSpace,
        wastedSpaceFormatted: this.formatSize(wastedSpace),
        searchTime,
        timestamp
      };

      // 10. Cache result
      this.searchCache.set(cacheKey, result);

      return result;

    } catch (error) {
      const searchTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.logger.log({
        level: 'ERROR',
        agent: params.agent,
        operation: 'find_duplicates',
        params: { compareBy: params.compareBy },
        result: { success: false, duration: searchTime, error: errorMessage }
      });

      return {
        success: false,
        duplicateGroups: [],
        totalDuplicates: 0,
        totalGroups: 0,
        wastedSpace: 0,
        wastedSpaceFormatted: '0 B',
        searchTime,
        timestamp,
        error: errorMessage
      };
    }
  }

  // Private helper methods

  private validateSearchFilesParams(params: SearchFilesParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
    if (!params.pattern || typeof params.pattern !== 'string') {
      throw new Error('Pattern parameter is required');
    }
  }

  private validateSearchContentParams(params: SearchContentParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
    if (!params.query || typeof params.query !== 'string') {
      throw new Error('Query parameter is required');
    }
  }

  private validateFindDuplicatesParams(params: FindDuplicatesParams): void {
    if (!params.agent || typeof params.agent !== 'string') {
      throw new Error('Agent parameter is required');
    }
  }

  private buildSearchPattern(params: SearchFilesParams): string {
    if (params.useRegex) {
      // Convert regex to glob-like pattern (simplified)
      return params.pattern;
    }

    // Check if already a glob pattern
    if (params.pattern.includes('*') || params.pattern.includes('?')) {
      return params.pattern;
    }

    // Simple text search - wrap in wildcards
    return `**/*${params.pattern}*`;
  }

  private calculateRelevance(fileName: string, pattern: string, caseSensitive?: boolean): number {
    const name = caseSensitive ? fileName : fileName.toLowerCase();
    const search = caseSensitive ? pattern : pattern.toLowerCase();

    // Exact match = 100
    if (name === search) return 100;

    // Starts with = 80
    if (name.startsWith(search)) return 80;

    // Contains = 60
    if (name.includes(search)) return 60;

    // Partial match = 40
    const searchChars = search.split('');
    let matched = 0;
    for (const char of searchChars) {
      if (name.includes(char)) matched++;
    }
    return (matched / searchChars.length) * 40;
  }

  private determineMatchType(fileName: string, pattern: string): 'exact' | 'partial' | 'pattern' {
    if (pattern.includes('*') || pattern.includes('?')) return 'pattern';
    if (fileName === pattern) return 'exact';
    return 'partial';
  }

  private buildSearchRegex(params: SearchContentParams): RegExp {
    let pattern = params.query;

    if (!params.useRegex) {
      // Escape special regex characters
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (params.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    const flags = params.caseSensitive ? 'g' : 'gi';
    return new RegExp(pattern, flags);
  }

  private async isBinaryFile(filePath: string): Promise<boolean> {
    try {
      const buffer = Buffer.alloc(512);
      const fd = await fs.open(filePath, 'r');
      await fd.read(buffer, 0, 512, 0);
      await fd.close();

      // Check for null bytes (indicator of binary)
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === 0) return true;
      }

      return false;
    } catch {
      return true; // Assume binary if can't read
    }
  }

  private async searchInFile(filePath: string, regex: RegExp, context: number): Promise<Match[]> {
    const matches: Match[] = [];

    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        regex.lastIndex = 0; // Reset regex
        const match = regex.exec(line);

        if (match) {
          const before: string[] = [];
          const after: string[] = [];

          // Get context lines before
          for (let j = Math.max(0, i - context); j < i; j++) {
            before.push(lines[j]);
          }

          // Get context lines after
          for (let j = i + 1; j <= Math.min(lines.length - 1, i + context); j++) {
            after.push(lines[j]);
          }

          matches.push({
            line: i + 1, // 1-based line numbers
            column: match.index + 1,
            text: line,
            before,
            after,
            matchedText: match[0]
          });
        }
      }
    } catch (error) {
      // Skip files that can't be read
    }

    return matches;
  }

  private async groupDuplicates(
    basePath: string,
    files: Array<{ path: string; size: number; modified: string }>,
    compareBy: 'hash' | 'name' | 'size-name'
  ): Promise<Array<{ files: Array<{ path: string; size: number; modified: string }>; size: number; hash?: string }>> {
    const groups = new Map<string, Array<{ path: string; size: number; modified: string }>>();

    for (const file of files) {
      let key: string;

      switch (compareBy) {
        case 'hash':
          const filePath = join(basePath, file.path);
          key = await this.fileHasher.md5(filePath);
          break;
        case 'name':
          key = basename(file.path);
          break;
        case 'size-name':
          key = `${file.size}_${basename(file.path)}`;
          break;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(file);
    }

    // Filter out non-duplicates (groups with only 1 file)
    const duplicateGroups: Array<{ files: Array<{ path: string; size: number; modified: string }>; size: number; hash?: string }> = [];

    for (const [key, files] of groups.entries()) {
      if (files.length > 1) {
        duplicateGroups.push({
          files,
          size: files[0].size,
          hash: compareBy === 'hash' ? key : undefined
        });
      }
    }

    return duplicateGroups;
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
