import { describe, it, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "./auth";

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
    // We can't reset the rate limit map easily because it's local to the module.
    // So we use different IP addresses for each test block to avoid cross-pollution.
  });

  it("should prioritize req.ip over x-forwarded-for", async () => {
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

    // Simulate req.ip being available (as Vercel would provide)
    // NextRequest.ip is readonly, but we can bypass it using defineProperty
    Object.defineProperty(mockReq1, "ip", { value: "20.0.0.1", writable: true });

    // Hit the rate limit for 20.0.0.1 (MAX_REQUESTS is 100)
    for (let i = 0; i < 100; i++) {
      const res = await wrappedHandler(mockReq1);
      if (res.status === 429) {
        throw new Error("Should not rate limit before 100 requests");
      }
    }

    // Request 101 should be rate limited
    const res101 = await wrappedHandler(mockReq1);
    if (res101.status !== 429) {
      throw new Error("Should be rate limited on 101st request");
    }

    // Now test if the rate limit was applied to "20.0.0.1" and not "10.0.0.1"
    const mockReq2 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "10.0.0.1",
      }),
    });
    // This doesn't have req.ip set, so it will fall back to "10.0.0.1"
    const resReq2 = await wrappedHandler(mockReq2);
    // Should NOT be rate limited
    if (resReq2.status === 429) {
      throw new Error("Rate limit should not have leaked to 10.0.0.1");
    }
  });

  it("should extract the first IP from x-forwarded-for correctly when req.ip is missing", async () => {
    const handler = async () => {
      return NextResponse.json({ success: true });
    };

    const wrappedHandler = withAuth(handler);

    const mockReq = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "  30.0.0.5  , 30.0.0.6",
      }),
    });

    // Hit rate limit. The extracted IP should be 30.0.0.5 (the first IP)
    for (let i = 0; i < 100; i++) {
      await wrappedHandler(mockReq);
    }

    const res101 = await wrappedHandler(mockReq);
    if (res101.status !== 429) {
      throw new Error("Should be rate limited on 101st request");
    }

    // 30.0.0.5 should be rate limited
    const mockReqSame = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "30.0.0.5",
      }),
    });
    const resSame = await wrappedHandler(mockReqSame);
    if (resSame.status !== 429) {
      throw new Error("30.0.0.5 should be rate limited because it was the extracted IP");
    }

    // 30.0.0.6 should NOT be rate limited
    const mockReqDiff = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "30.0.0.6",
      }),
    });
    const resDiff = await wrappedHandler(mockReqDiff);
    if (resDiff.status === 429) {
      throw new Error("30.0.0.6 should not be rate limited");
    }
  });

  it("should securely mitigate spoofed IP requests by properly splitting headers", async () => {
    const handler = async () => {
      return NextResponse.json({ success: true });
    };

    const wrappedHandler = withAuth(handler);

    // Create requests with different spoofed strings that shouldn't bypass
    // the core rate limit if they use the same first IP (splitting prevents full string mismatch)
    const reqSpoofed1 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "40.0.0.1, 8.8.8.8",
      }),
    });

    const reqSpoofed2 = new NextRequest("http://localhost", {
      headers: new Headers({
        "x-forwarded-for": "40.0.0.1, 9.9.9.9",
      }),
    });

    // 50 requests with spoof 1
    for (let i = 0; i < 50; i++) {
      await wrappedHandler(reqSpoofed1);
    }
    // 50 requests with spoof 2
    for (let i = 0; i < 50; i++) {
      await wrappedHandler(reqSpoofed2);
    }

    // 101st request should be rate limited
    const res = await wrappedHandler(reqSpoofed1);
    if (res.status !== 429) {
      throw new Error("Rate limit bypass: Different prefix strings created different buckets instead of splitting.");
    }
  });
});
