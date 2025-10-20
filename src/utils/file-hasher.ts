import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';

/**
 * FileHasher - Calculate file hashes for duplicate detection
 */
export class FileHasher {
  /**
   * Calculate MD5 hash of a file
   */
  async md5(filePath: string): Promise<string> {
    return this.hash(filePath, 'md5');
  }

  /**
   * Calculate SHA256 hash of a file
   */
  async sha256(filePath: string): Promise<string> {
    return this.hash(filePath, 'sha256');
  }

  /**
   * Calculate hash of a file using specified algorithm
   */
  private async hash(filePath: string, algorithm: 'md5' | 'sha256'): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash(algorithm);
      const stream = createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Calculate hash for multiple files (batch)
   */
  async hashBatch(filePaths: string[], algorithm: 'md5' | 'sha256' = 'md5'): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    for (const filePath of filePaths) {
      try {
        const hash = await this.hash(filePath, algorithm);
        results.set(filePath, hash);
      } catch (error) {
        // Skip files that can't be hashed
        continue;
      }
    }

    return results;
  }

  /**
   * Quick hash for small files (read entire file)
   */
  async quickHash(filePath: string, algorithm: 'md5' | 'sha256' = 'md5'): Promise<string> {
    try {
      const content = await fs.readFile(filePath);
      return createHash(algorithm).update(content).digest('hex');
    } catch (error) {
      throw new Error(`Failed to hash file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
