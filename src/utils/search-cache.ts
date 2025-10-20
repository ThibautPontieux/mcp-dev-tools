/**
 * SearchCache - Cache search results to improve performance
 */
export class SearchCache {
  private cache: Map<string, CacheEntry>;
  private ttl: number;

  constructor(ttl: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Get cached result
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, value: T): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Generate cache key from params
   */
  static generateKey(operation: string, params: Record<string, any>): string {
    const sorted = Object.keys(params).sort().map(k => `${k}:${params[k]}`);
    return `${operation}:${sorted.join(',')}`;
  }
}

interface CacheEntry {
  value: any;
  timestamp: number;
}
