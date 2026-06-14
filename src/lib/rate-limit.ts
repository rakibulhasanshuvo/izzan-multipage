import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

// Redis client (only initialized if REDIS_URL is present)
const redis = process.env.REDIS_URL 
  ? new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN || "" })
  : null;

// Local fallback Rate limiting state
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const MAX_REQUESTS = 100;

// Periodically clean up expired rate limit entries to prevent memory leaks on persistent servers
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      if (record.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }, RATE_LIMIT_WINDOW).unref();
}

/**
 * Resolves the client's real IP address from standard headers, falling back to req.ip.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // Return first IP address in the comma-separated list
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return (req as unknown as { ip?: string }).ip || "unknown_ip";
}

export async function checkRateLimit(key: string): Promise<boolean> {
  const now = Date.now();

  if (redis) {
    // Distributed rate limit (Vercel)
    const redisKey = `rate_limit:${key}`;
    const requests = await redis.incr(redisKey);
    if (requests === 1) {
      await redis.pexpire(redisKey, RATE_LIMIT_WINDOW);
    }
    return requests <= MAX_REQUESTS;
  } else {
    // Local fallback (VPS)
    const record = rateLimitMap.get(key);
    if (!record || record.resetTime < now) {
      rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }
    if (record.count >= MAX_REQUESTS) {
      return false;
    }
    record.count += 1;
    return true;
  }
}
