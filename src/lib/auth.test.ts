import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAuth, checkRateLimit, rateLimitMap, RATE_LIMIT_WINDOW, MAX_REQUESTS } from "./auth";

// Mock getServerSession to bypass headers() issue outside Next.js request scope
vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "1" } })),
}));

// Mock authOptions to avoid pulling in db
vi.mock("./auth-options", () => ({
  authOptions: {},
}));

describe("auth limits and checks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    rateLimitMap.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("should allow first request", () => {
      expect(checkRateLimit("1.1.1.1")).toBe(true);
      expect(rateLimitMap.has("1.1.1.1")).toBe(true);
      expect(rateLimitMap.get("1.1.1.1")?.count).toBe(1);
    });

    it("should increment count for existing request", () => {
      checkRateLimit("2.2.2.2");
      expect(checkRateLimit("2.2.2.2")).toBe(true);
      expect(rateLimitMap.get("2.2.2.2")?.count).toBe(2);
    });

    it("should reject when max requests is reached", () => {
      for (let i = 0; i < MAX_REQUESTS; i++) {
        expect(checkRateLimit("3.3.3.3")).toBe(true);
      }
      expect(checkRateLimit("3.3.3.3")).toBe(false);
      expect(rateLimitMap.get("3.3.3.3")?.count).toBe(MAX_REQUESTS);
    });

    it("should reset count after rate limit window", () => {
      for (let i = 0; i < MAX_REQUESTS; i++) {
        checkRateLimit("4.4.4.4");
      }
      expect(checkRateLimit("4.4.4.4")).toBe(false);

      vi.advanceTimersByTime(RATE_LIMIT_WINDOW + 1000);

      expect(checkRateLimit("4.4.4.4")).toBe(true);
      expect(rateLimitMap.get("4.4.4.4")?.count).toBe(1);
    });
  });

  describe("withAuth IP extraction and rate limiting", () => {
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
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Clear the map before each test to ensure isolated tests
    import("./auth").then(({ rateLimitMap }) => {
      rateLimitMap.clear();
    });
  });

  it("should allow requests under the limit", async () => {
    const { checkRateLimit, rateLimitMap } = await import("./auth");
    const ip = "50.0.0.1";

    // Make 99 requests
    for (let i = 0; i < 99; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }

    // Check state
    const record = rateLimitMap.get(ip);
    expect(record).toBeDefined();
    expect(record?.count).toBe(99);
  });

  it("should block requests over the limit", async () => {
    const { checkRateLimit, rateLimitMap, MAX_REQUESTS } = await import("./auth");
    const ip = "50.0.0.2";

    // Fill up to the limit
    for (let i = 0; i < MAX_REQUESTS; i++) {
      expect(checkRateLimit(ip)).toBe(true);
    }

    // Next request should fail
    expect(checkRateLimit(ip)).toBe(false);

    const record = rateLimitMap.get(ip);
    expect(record?.count).toBe(MAX_REQUESTS); // Count doesn't increment past limit
  });

  it("should reset count after the window expires", async () => {
    const { checkRateLimit, rateLimitMap, MAX_REQUESTS, RATE_LIMIT_WINDOW } = await import("./auth");
    const ip = "50.0.0.3";

    // Fill up to the limit
    for (let i = 0; i < MAX_REQUESTS; i++) {
      checkRateLimit(ip);
    }

    // Verify it's blocked
    expect(checkRateLimit(ip)).toBe(false);

    // Mock Date.now() to simulate time passing
    const originalDateNow = Date.now;
    const futureTime = originalDateNow() + RATE_LIMIT_WINDOW + 1000;
    vi.spyOn(Date, "now").mockReturnValue(futureTime);

    // Should be allowed again
    expect(checkRateLimit(ip)).toBe(true);

    // Verify count was reset to 1
    const record = rateLimitMap.get(ip);
    expect(record?.count).toBe(1);

    // Restore Date.now
    vi.restoreAllMocks();
  });
});
