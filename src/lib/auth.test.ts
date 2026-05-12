import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  checkRateLimit,
  rateLimitMap,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS
} from './auth';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Clear the global rate limit map before each test
    rateLimitMap.clear();
    // Use fake timers to manipulate time during testing
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers();
  });

  it('allows the first request from a new IP', () => {
    const ip = '192.168.1.1';
    const result = checkRateLimit(ip);
    expect(result).toBe(true);

    // Check map state
    const record = rateLimitMap.get(ip);
    expect(record).toBeDefined();
    expect(record?.count).toBe(1);
    expect(record?.resetTime).toBeGreaterThan(Date.now());
  });

  it('allows multiple requests up to MAX_REQUESTS', () => {
    const ip = '192.168.1.2';

    // Perform MAX_REQUESTS requests
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }

    // Check map state after all requests
    const record = rateLimitMap.get(ip);
    expect(record?.count).toBe(MAX_REQUESTS);
  });

  it('blocks requests exceeding MAX_REQUESTS within the window', () => {
    const ip = '192.168.1.3';

    // Consume all allowed requests
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip);
    }

    // Next request should be blocked
    const result = checkRateLimit(ip);
    expect(result).toBe(false);

    // Check count doesn't increment beyond MAX_REQUESTS on blocked requests
    const record = rateLimitMap.get(ip);
    expect(record?.count).toBe(MAX_REQUESTS);
  });

  it('resets the rate limit after the window expires', () => {
    const ip = '192.168.1.4';

    // Consume all allowed requests
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip);
    }

    // Should be blocked now
    expect(checkRateLimit(ip)).toBe(false);

    // Advance time past the rate limit window
    vi.advanceTimersByTime(RATE_LIMIT_WINDOW + 1000); // Wait the window + 1 second

    // Next request should be allowed and reset the count
    const result = checkRateLimit(ip);
    expect(result).toBe(true);

    const record = rateLimitMap.get(ip);
    expect(record?.count).toBe(1);
  });

  it('maintains independent rate limits for different IPs', () => {
    const ip1 = '10.0.0.1';
    const ip2 = '10.0.0.2';

    // IP 1 consumes all requests
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip1);
    }

    // IP 1 should be blocked
    expect(checkRateLimit(ip1)).toBe(false);

    // IP 2 should still be allowed
    expect(checkRateLimit(ip2)).toBe(true);

    // IP 2 only has 1 request counted
    const record2 = rateLimitMap.get(ip2);
    expect(record2?.count).toBe(1);
  });
});
