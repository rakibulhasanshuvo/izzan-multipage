import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { Redis } from "@upstash/redis";

// Redis client (only initialized if REDIS_URL is present)
const redis = process.env.REDIS_URL 
  ? new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN || "" })
  : null;

// Local fallback Rate limiting state
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const MAX_REQUESTS = 100;

export async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();

  if (redis) {
    // Distributed rate limit (Vercel)
    const key = `rate_limit:${ip}`;
    const requests = await redis.incr(key);
    if (requests === 1) {
      await redis.pexpire(key, RATE_LIMIT_WINDOW);
    }
    return requests <= MAX_REQUESTS;
  } else {
    // Local fallback (VPS)
    const record = rateLimitMap.get(ip);
    if (!record || record.resetTime < now) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return true;
    }
    if (record.count >= MAX_REQUESTS) {
      return false;
    }
    record.count += 1;
    return true;
  }
}

/**
 * Basic authentication check for admin routes.
 * Supports both NextAuth session and ADMIN_TOKEN.
 */
export async function checkAdminAuth(req?: NextRequest): Promise<boolean> {
  // 1. Check for valid NextAuth session
  const session = await getServerSession(authOptions);
  if (session) return true;

  // 2. Check for ADMIN_TOKEN via Authorization header or cookies
  if (req) {
    const authHeader = req.headers.get("authorization");
    const tokenCookie = req.cookies.get("admin_token")?.value;
    const token = (authHeader && authHeader.startsWith("Bearer ")) 
      ? authHeader.split(" ")[1] 
      : tokenCookie;
    
    if (token && process.env.ADMIN_TOKEN && token === process.env.ADMIN_TOKEN) {
      return true;
    }
  }

  return false;
}

/**
 * Higher-order function to wrap API route handlers with authentication check.
 */
export function withAuth(handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse> | NextResponse) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const reqIp = (req as unknown as { ip?: string }).ip;
    const ip = reqIp || "unknown_ip";

    const allowed = await checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const isAuthenticated = await checkAdminAuth(req);
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ...args);
  };
}

/**
 * Verifies a token against the expected admin token.
 */
export function verifyToken(token?: string): boolean {
  if (!token) return false;
  const expectedToken = process.env.ADMIN_TOKEN;
  if (!expectedToken) {
    console.error("ADMIN_TOKEN is not configured");
    return false;
  }
  return token === expectedToken;
}
