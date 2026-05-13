const fs = require('fs');
let content = fs.readFileSync('src/lib/auth.test.ts', 'utf8');

// replace the failing test
const finalTestFile = `import { describe, it, vi, beforeEach, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAuth, rateLimitMap } from "./auth";

// Mock getServerSession to bypass headers() issue outside Next.js request scope
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "1" } })),
}));

// Mock authOptions to avoid pulling in db
vi.mock("./auth-options", () => ({
  authOptions: {},
}));

describe("withAuth IP extraction and rate limiting", () => {
  beforeEach(() => {
    rateLimitMap.clear();
  });

  it("should use req.ip if available and ignore x-forwarded-for", async () => {
    const handler = async () => {
      return NextResponse.json({ success: true });
    };

    const wrappedHandler = withAuth(handler);

    // Mock NextRequest with multiple x-forwarded-for IPs
    const mockReq1 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "10.0.0.1, 10.0.0.2",
      }),
    });

    Object.defineProperty(mockReq1, "ip", { value: "20.0.0.1", writable: true });

    for (let i = 0; i < 100; i++) {
      const res = await wrappedHandler(mockReq1);
      expect(res.status).not.toBe(429);
    }

    const res101 = await wrappedHandler(mockReq1);
    expect(res101.status).toBe(429);
  });

  it("should fall back to 'unknown_ip' when req.ip is missing, ignoring x-forwarded-for", async () => {
    const handler = async () => {
      return NextResponse.json({ success: true });
    };

    const wrappedHandler = withAuth(handler);

    const mockReq = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "30.0.0.5, 30.0.0.6",
      }),
    });

    for (let i = 0; i < 100; i++) {
      await wrappedHandler(mockReq);
    }

    const res101 = await wrappedHandler(mockReq);
    expect(res101.status).toBe(429);
  });

  it("should ignore spoofed headers completely", async () => {
    const handler = async () => {
      return NextResponse.json({ success: true });
    };

    const wrappedHandler = withAuth(handler);

    const reqSpoofed1 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "40.0.0.1",
      }),
    });

    for (let i = 0; i < 50; i++) {
      await wrappedHandler(reqSpoofed1);
    }

    const reqSpoofed2 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "40.0.0.2",
      }),
    });

    for (let i = 0; i < 50; i++) {
      await wrappedHandler(reqSpoofed2);
    }

    const reqSpoofed3 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "40.0.0.3",
      }),
    });
    const res = await wrappedHandler(reqSpoofed3);

    // We expect 429 because the first 100 requests filled up the bucket for unknown_ip
    expect(res.status).toBe(429);
  });
});
`;

fs.writeFileSync('src/lib/auth.test.ts', finalTestFile);
