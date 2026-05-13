import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

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
 * Uses NextAuth getServerSession.
 */
export async function checkAdminAuth(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session;
}

/**
 * Higher-order function to wrap API route handlers with authentication check.
 */
export function withAuth(handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse> | NextResponse) {
  return async (req: NextRequest, ...args: unknown[]) => {
    // Next.js provides req.ip on supported platforms (like Vercel).
    const reqIp = (req as unknown as { ip?: string }).ip;

    // Fallback to x-forwarded-for if req.ip is not available.
    const forwardedFor = req.headers.get("x-forwarded-for");
    let extractedIp = "unknown_ip";

    if (reqIp) {
      extractedIp = reqIp;
    } else if (forwardedFor) {
      // X-Forwarded-For contains a comma-separated list of IPs.
      // The first IP is the original client, subsequent IPs are proxies.
      // While the first IP can be spoofed by the client, extracting it correctly
      // prevents the entire string (e.g. "spoofed, real, proxy") from being used as a unique key,
      // which would allow infinite rate limit bypasses.
      extractedIp = forwardedFor.split(",")[0].trim();
    } else if (req.headers.get("x-real-ip")) {
      extractedIp = req.headers.get("x-real-ip")!;
    }
    const ip = extractedIp;

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const isAuthenticated = await checkAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ...args);
  };
}

<<<<<<< fix-patch-test-suite-5250918837225607534
export function verifyToken(token?: string): boolean {
  if (!token) return false;
  return token === process.env.ADMIN_TOKEN;
=======


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
>>>>>>> main
}
