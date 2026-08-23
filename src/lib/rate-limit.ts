import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { logger } from "./logger";

// Redis client (only initialized if REDIS_URL is present)
const redis = process.env.REDIS_URL
  ? new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN || "" })
  : null;

// Local fallback Rate limiting state
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const MAX_REQUESTS = 100;
// Login attempts are far more sensitive than general traffic
export const MAX_LOGIN_ATTEMPTS = 10;
// Per-phone-number order velocity: blocks fake-order spam that rotates IPs
export const MAX_PHONE_ORDERS_PER_HOUR = 5;
export const PHONE_ORDER_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// After a Redis failure, skip Redis entirely for this long so every request
// doesn't pay the latency of a doomed connection attempt.
const REDIS_FAILURE_COOLDOWN_MS = 60 * 1000;
let redisDisabledUntil = 0;

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
 * Only trust forwarding headers when explicitly running behind a known
 * reverse proxy / platform. Otherwise they are attacker-controlled.
 */
function isProxyTrusted(): boolean {
  return process.env.TRUST_PROXY === "true";
}

/**
 * Resolves the client IP from standard headers. Headers are only honored
 * when TRUST_PROXY=true; otherwise they are ignored to prevent spoofing.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  if (isProxyTrusted()) {
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      // The right-most entry is appended by the proxy closest to this server
      // and cannot be spoofed by the client; left-most entries are
      // client-controlled when chains are involved.
      const parts = forwarded.split(",").map(s => s.trim()).filter(Boolean);
      if (parts.length > 0) {
        return parts[parts.length - 1];
      }
    }
    const realIp = headers.get("x-real-ip");
    if (realIp) {
      return realIp;
    }
  }
  return "unknown_ip";
}

/**
 * NextRequest variant of getClientIpFromHeaders, falling back to req.ip.
 */
export function getClientIp(req: NextRequest): string {
  const ip = getClientIpFromHeaders(req.headers);
  if (ip !== "unknown_ip") {
    return ip;
  }
  return (req as unknown as { ip?: string }).ip || "unknown_ip";
}

/**
 * Health probe used by /api/health. Reports whether Redis is configured and
 * reachable; a failure also trips the circuit breaker below.
 */
export async function pingRedis(): Promise<"ok" | "disabled" | "error"> {
  if (!redis) return "disabled";
  try {
    await redis.ping();
    return "ok";
  } catch (error) {
    redisDisabledUntil = Date.now() + REDIS_FAILURE_COOLDOWN_MS;
    logger.error("Health check: Redis is unreachable", { error: error instanceof Error ? error.message : String(error) });
    return "error";
  }
}

export async function checkRateLimit(
  key: string,
  maxRequests: number = MAX_REQUESTS,
  windowMs: number = RATE_LIMIT_WINDOW
): Promise<boolean> {
  const client = redis;
  if (client && Date.now() >= redisDisabledUntil) {
    const redisKey = `rate_limit:${key}`;
    try {
      const requests = await client.incr(redisKey);
      if (requests === 1) {
        await client.pexpire(redisKey, windowMs);
      }
      return requests <= maxRequests;
    } catch (error) {
      // Trip the circuit breaker and degrade to in-memory limiting instead of
      // failing every request while Redis is down.
      redisDisabledUntil = Date.now() + REDIS_FAILURE_COOLDOWN_MS;
      logger.error("Rate limiter: Redis unavailable, using in-memory fallback", { error: error instanceof Error ? error.message : String(error) });
    }
  }

  // Local fallback (VPS / Redis outage)
  const now = Date.now();
  const record = rateLimitMap.get(key);
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) {
    return false;
  }
  record.count += 1;
  return true;
}
