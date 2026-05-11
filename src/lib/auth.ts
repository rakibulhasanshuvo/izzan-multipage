import { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

/**
 * Basic authentication check for admin routes.
 * In a real-world scenario, you would integrate NextAuth or verify JWT tokens here.
 */
export function checkAdminAuth(req: NextRequest): boolean {
  // We consume req to prevent lint errors, or just suppress it:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const url = req.url; // mock usage

  // Basic check to ensure a token is present
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
    if (!checkAdminAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return handler(req, ...args);
  };
}
