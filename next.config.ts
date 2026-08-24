import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required by the Dockerfile runner stage (COPY .next/standalone); ignored
  // by Vercel, which handles its own output.
  output: "standalone",
  serverExternalPackages: ["@prisma/client"],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        // Vercel Blob storage (STORAGE_PROVIDER=vercel) serves uploads from
        // per-store subdomains like <store>.public.blob.vercel-storage.com
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            // 'preload' intentionally omitted until the domain is confirmed
            // HTTPS-ready and submitted to the HSTS preload list
            value: "max-age=63072000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // User-generated uploads are isolated in an opaque origin so that a
        // malicious file (even if it slips past validation) cannot execute
        // scripts on the site's origin.
        source: "/uploads/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "sandbox",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
