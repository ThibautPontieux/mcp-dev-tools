import { RateLimitsConfig, RateLimit } from '../types/config.js';
import { RateLimitResult } from '../types/tools.js';

/**
 * RateLimiter - Prevents abuse by limiting operation frequency
 */
export class RateLimiter {
  private limits: Map<string, RateLimit>;
  private usage: Map<string, number[]>;
  private enabled: boolean;

  constructor(config: RateLimitsConfig) {
    this.enabled = config.enabled;
    this.limits = new Map(Object.entries(config.limits || {}));
    this.usage = new Map();
  }

  /**
   * Check if operation is allowed for agent
   */
  checkLimit(operation: string, agent: string): RateLimitResult {
    // If rate limiting is disabled, always allow
    if (!this.enabled) {
      return { allowed: true };
    }

    // Get limit configuration for this operation
    const limit = this.limits.get(operation);
    if (!limit) {
      // No limit configured, allow operation
      return { allowed: true };
    }

    // Create unique key for this agent + operation
    const key = `${agent}:${operation}`;
    
    // Get usage history for this key
    const timestamps = this.usage.get(key) || [];
    const now = Date.now();
    const windowStart = now - limit.per;

    // Clean old timestamps outside the window
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);

    // Check if limit exceeded
    if (recentTimestamps.length >= limit.max) {
      const oldestInWindow = Math.min(...recentTimestamps);
      const resetIn = oldestInWindow + limit.per - now;

      return {
        allowed: false,
        reason: `Rate limit exceeded: ${limit.max} requests per ${limit.per}ms`,
        limit: limit.max,
        remaining: 0,
        resetIn: Math.max(0, resetIn)
      };
    }

    // Add current timestamp
    recentTimestamps.push(now);
    this.usage.set(key, recentTimestamps);

    // Calculate remaining requests
    const remaining = limit.max - recentTimestamps.length;

    return {
      allowed: true,
      limit: limit.max,
      remaining,
      resetIn: limit.per
    };
  }

  /**
   * Reset limits for a specific agent/operation
   */
  reset(operation?: string, agent?: string): void {
    if (operation && agent) {
      const key = `${agent}:${operation}`;
      this.usage.delete(key);
    } else if (agent) {
      // Reset all operations for this agent
      for (const key of this.usage.keys()) {
        if (key.startsWith(`${agent}:`)) {
          this.usage.delete(key);
        }
      }
    } else {
      // Reset everything
      this.usage.clear();
    }
  }

  /**
   * Get current usage for agent/operation
   */
  getUsage(operation: string, agent: string): { count: number; limit: number; resetIn: number } {
    const limit = this.limits.get(operation);
    if (!limit) {
      return { count: 0, limit: Infinity, resetIn: 0 };
    }

    const key = `${agent}:${operation}`;
    const timestamps = this.usage.get(key) || [];
    const now = Date.now();
    const windowStart = now - limit.per;
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);

    const resetIn = recentTimestamps.length > 0 
      ? Math.max(0, Math.min(...recentTimestamps) + limit.per - now)
      : 0;

    return {
      count: recentTimestamps.length,
      limit: limit.max,
      resetIn
    };
  }

  /**
   * Clean old usage data periodically
   */
  cleanup(): void {
    const now = Date.now();

    for (const [key, timestamps] of this.usage.entries()) {
      // Find the longest time window among all limits
      const maxWindow = Math.max(...Array.from(this.limits.values()).map(l => l.per));
      
      // Keep only timestamps within the longest window
      const filtered = timestamps.filter(ts => ts > now - maxWindow);
      
      if (filtered.length === 0) {
        this.usage.delete(key);
      } else {
        this.usage.set(key, filtered);
      }
    }
  }

  /**
   * Set a custom limit for an operation
   */
  setLimit(operation: string, limit: RateLimit): void {
    this.limits.set(operation, limit);
  }

  /**
   * Get all configured limits
   */
  getLimits(): Map<string, RateLimit> {
    return new Map(this.limits);
  }
}
