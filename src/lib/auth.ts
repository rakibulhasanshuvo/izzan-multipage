import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import {
  checkRateLimit,
  getClientIp,
  rateLimitMap,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS
} from "./rate-limit";

export {
  checkRateLimit,
  getClientIp,
  rateLimitMap,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS
};


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
    const ip = getClientIp(req);

    // Isolate admin endpoint rate limit bucket
    const allowed = await checkRateLimit(`admin:${ip}`);
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

