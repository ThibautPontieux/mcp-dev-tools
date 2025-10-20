import { resolve, normalize, relative, sep } from 'path';
import { WorkspaceConfig, ValidationResult } from '../types/config.js';

/**
 * PathValidator - Validates and secures file paths
 * Prevents path traversal attacks and ensures operations stay within workspace
 */
export class PathValidator {
  private workspaceDir: string;
  private protectedPaths: string[];
  private normalizedWorkspace: string;

  constructor(config: WorkspaceConfig) {
    this.workspaceDir = config.dir;
    this.protectedPaths = config.protectedPaths || [];
    // Normalize and resolve workspace path once
    this.normalizedWorkspace = resolve(normalize(this.workspaceDir));
  }

  /**
   * Validate that a path is safe to use
   */
  validatePath(path: string): ValidationResult {
    try {
      // 1. Normalize the path
      const normalizedPath = this.normalizePath(path);
      
      // 2. Check for path traversal attempts
      if (this.containsPathTraversal(path)) {
        return { 
          valid: false, 
          reason: 'Path traversal detected: path contains ".." or other suspicious patterns' 
        };
      }
      
      // 3. Check that it's within workspace
      if (!this.isWithinWorkspace(normalizedPath)) {
        return { 
          valid: false, 
          reason: `Path is outside workspace: ${path}` 
        };
      }
      
      // 4. Check protected paths
      if (this.isProtectedPath(normalizedPath)) {
        return { 
          valid: false, 
          reason: `Path is protected: ${path}` 
        };
      }
      
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        reason: `Invalid path: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  /**
   * Normalize a path (handle both Windows and Unix)
   */
  private normalizePath(path: string): string {
    // Remove any null bytes
    const cleaned = path.replace(/\0/g, '');
    
    // Normalize slashes and resolve relative paths
    return resolve(this.normalizedWorkspace, normalize(cleaned));
  }

  /**
   * Check if path contains traversal patterns
   */
  private containsPathTraversal(path: string): boolean {
    // Check for common path traversal patterns
    const traversalPatterns = [
      /\.\./,           // Parent directory reference
      /\.\.[\\/]/,      // Parent with slash
      /[\\/]\.\./,      // Slash with parent
      /^\.\.$/,         // Just ".."
      /\0/,             // Null byte
      /~[\\/]/,         // Home directory
      /^\/+/,           // Absolute path starting with /
      /^[a-zA-Z]:\\/    // Windows absolute path
    ];

    return traversalPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Check if resolved path is within workspace
   */
  private isWithinWorkspace(resolvedPath: string): boolean {
    // Get relative path from workspace to target
    const relativePath = relative(this.normalizedWorkspace, resolvedPath);
    
    // If relative path starts with "..", it's outside workspace
    if (relativePath.startsWith('..')) {
      return false;
    }
    
    // If it's an absolute path different from workspace, it's outside
    if (resolve(relativePath) === relativePath && relativePath !== this.normalizedWorkspace) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if path is in protected directories
   */
  private isProtectedPath(resolvedPath: string): boolean {
    const relativePath = relative(this.normalizedWorkspace, resolvedPath);
    
    return this.protectedPaths.some(protectedPath => {
      // Normalize protected path
      const normalizedProtected = normalize(protectedPath);
      
      // Check if path starts with protected path
      const pathParts = relativePath.split(sep);
      const protectedParts = normalizedProtected.split(sep);
      
      // Check if any part of the path matches protected path
      for (let i = 0; i < protectedParts.length; i++) {
        if (pathParts[i] !== protectedParts[i]) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Get the full resolved path within workspace
   */
  getFullPath(path: string): string {
    return resolve(this.normalizedWorkspace, normalize(path));
  }

  /**
   * Get workspace directory
   */
  getWorkspaceDir(): string {
    return this.normalizedWorkspace;
  }
}
