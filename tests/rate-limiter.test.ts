import { RateLimiter } from '../src/utils/rate-limiter';
import { RateLimitsConfig } from '../src/types/config';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    const config: RateLimitsConfig = {
      enabled: true,
      limits: {
        test_operation: { max: 5, per: 1000 }, // 5 requests per second
        slow_operation: { max: 2, per: 2000 }  // 2 requests per 2 seconds
      }
    };
    rateLimiter = new RateLimiter(config);
  });

  describe('Rate Limit Enforcement', () => {
    it('should allow requests within limit', () => {
      const result1 = rateLimiter.checkLimit('test_operation', 'agent1');
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      const result2 = rateLimiter.checkLimit('test_operation', 'agent1');
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests after limit exceeded', () => {
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('test_operation', 'agent1');
      }

      // Next request should be blocked
      const result = rateLimiter.checkLimit('test_operation', 'agent1');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Rate limit exceeded');
      expect(result.remaining).toBe(0);
    });

    it('should track different agents separately', () => {
      // Agent 1 uses up their limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('test_operation', 'agent1');
      }

      // Agent 2 should still be allowed
      const result = rateLimiter.checkLimit('test_operation', 'agent2');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should track different operations separately', () => {
      // Use up limit for test_operation
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('test_operation', 'agent1');
      }

      // slow_operation should still be allowed
      const result = rateLimiter.checkLimit('slow_operation', 'agent1');
      expect(result.allowed).toBe(true);
    });

    it('should allow unlimited requests for unconfigured operations', () => {
      const result = rateLimiter.checkLimit('unconfigured_op', 'agent1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Time Window', () => {
    it('should reset after time window expires', async () => {
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('test_operation', 'agent1');
      }

      // Should be blocked
      expect(rateLimiter.checkLimit('test_operation', 'agent1').allowed).toBe(false);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const result = rateLimiter.checkLimit('test_operation', 'agent1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset specific agent/operation', () => {
      // Use up limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit('test_operation', 'agent1');
      }

      // Reset
      rateLimiter.reset('test_operation', 'agent1');

      // Should be allowed again
      const result = rateLimiter.checkLimit('test_operation', 'agent1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should reset all operations for agent', () => {
      rateLimiter.checkLimit('test_operation', 'agent1');
      rateLimiter.checkLimit('slow_operation', 'agent1');

      rateLimiter.reset(undefined, 'agent1');

      const usage1 = rateLimiter.getUsage('test_operation', 'agent1');
      const usage2 = rateLimiter.getUsage('slow_operation', 'agent1');
      expect(usage1.count).toBe(0);
      expect(usage2.count).toBe(0);
    });

    it('should reset all limits', () => {
      rateLimiter.checkLimit('test_operation', 'agent1');
      rateLimiter.checkLimit('test_operation', 'agent2');

      rateLimiter.reset();

      const usage1 = rateLimiter.getUsage('test_operation', 'agent1');
      const usage2 = rateLimiter.getUsage('test_operation', 'agent2');
      expect(usage1.count).toBe(0);
      expect(usage2.count).toBe(0);
    });
  });

  describe('Usage Tracking', () => {
    it('should report current usage', () => {
      rateLimiter.checkLimit('test_operation', 'agent1');
      rateLimiter.checkLimit('test_operation', 'agent1');
      rateLimiter.checkLimit('test_operation', 'agent1');

      const usage = rateLimiter.getUsage('test_operation', 'agent1');
      expect(usage.count).toBe(3);
      expect(usage.limit).toBe(5);
      expect(usage.resetIn).toBeGreaterThan(0);
    });
  });

  describe('Disabled Rate Limiting', () => {
    it('should allow all requests when disabled', () => {
      const config: RateLimitsConfig = {
        enabled: false,
        limits: {
          test_operation: { max: 1, per: 1000 }
        }
      };
      const limiter = new RateLimiter(config);

      // Should allow many requests even though limit is 1
      for (let i = 0; i < 10; i++) {
        const result = limiter.checkLimit('test_operation', 'agent1');
        expect(result.allowed).toBe(true);
      }
    });
  });

  describe('Cleanup', () => {
    it('should remove old usage data', async () => {
      rateLimiter.checkLimit('test_operation', 'agent1');
      
      // Wait for data to become old
      await new Promise(resolve => setTimeout(resolve, 1100));

      rateLimiter.cleanup();

      const usage = rateLimiter.getUsage('test_operation', 'agent1');
      expect(usage.count).toBe(0);
    });
  });

  describe('Custom Limits', () => {
    it('should allow setting custom limits', () => {
      rateLimiter.setLimit('custom_operation', { max: 10, per: 5000 });

      const result = rateLimiter.checkLimit('custom_operation', 'agent1');
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(10);
    });

    it('should get all configured limits', () => {
      const limits = rateLimiter.getLimits();
      expect(limits.has('test_operation')).toBe(true);
      expect(limits.has('slow_operation')).toBe(true);
    });
  });
});
