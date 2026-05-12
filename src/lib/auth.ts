import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

// Rate limiting state
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
export const MAX_REQUESTS = 100;

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetTime < now) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
}

/**
 * Basic authentication check for admin routes.
 * In a real-world scenario, you would integrate NextAuth or verify JWT tokens here.
 */
export function checkAdminAuth(req: NextRequest): boolean {
  // Mock check: verify against a specific admin token
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];
  if (token !== env.ADMIN_TOKEN) {
    return false;
  }

  return true;
}

/**
 * Higher-order function to wrap API route handlers with authentication check.
 */
export function withAuth(handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse> | NextResponse) {
  return async (req: NextRequest, ...args: unknown[]) => {
    // Determine a generic IP representation since actual IP extraction from headers can vary behind proxies
    const ip = req.headers.get("x-forwarded-for") || "unknown_ip";

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    if (!checkAdminAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ...args);
  };
}
