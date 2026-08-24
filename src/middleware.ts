import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const isDev = process.env.NODE_ENV === "development";

// Hosts allowed to serve user-uploaded media through next/image / <video>.
const MEDIA_HOSTS = "https://lh3.googleusercontent.com https://*.public.blob.vercel-storage.com";

function buildCsp(nonce: string): string {
  if (isDev) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data:",
      "style-src 'self' 'unsafe-inline'",
      `img-src 'self' blob: data: ${MEDIA_HOSTS}`,
      "font-src 'self' data:",
      `media-src 'self' blob: data: https://storage.googleapis.com ${MEDIA_HOSTS}`,
      "connect-src 'self' ws: wss:",
    ].join("; ");
  }
  // Production: nonce + strict-dynamic replaces 'unsafe-inline'
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
    `img-src 'self' blob: data: ${MEDIA_HOSTS}`,
    "font-src 'self' data:",
    `media-src 'self' blob: data: https://storage.googleapis.com ${MEDIA_HOSTS}`,
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; ");
}

export async function middleware(req: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const { pathname } = req.nextUrl;

  // Admin area protection (same semantics as previous withAuth setup)
  if (pathname.startsWith("/admin")) {
    const isLogin = pathname.startsWith("/admin/login");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (isLogin && token) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    if (!isLogin && !token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Propagate nonce to the app so framework scripts and manual inline
  // scripts (JSON-LD) can pick it up.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    // All pages except static assets, API routes, and media directories
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|uploads|images|videos|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|mp4|webm|ico|txt|xml)$).*)",
  ],
};
