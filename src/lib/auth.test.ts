import { describe, it, vi, beforeEach, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { withAuth, rateLimitMap, checkRateLimit, getClientIp } from "./auth";

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
    rateLimitMap.clear();
  });

  describe("getClientIp", () => {
    it("should extract first IP from x-forwarded-for header", () => {
      const req = new NextRequest("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("should fall back to x-real-ip when x-forwarded-for is missing", () => {
      const req = new NextRequest("http://localhost", {
        headers: { "x-real-ip": "198.51.100.1" },
      });
      expect(getClientIp(req)).toBe("198.51.100.1");
    });

    it("should fall back to req.ip when headers are missing", () => {
      const req = new NextRequest("http://localhost");
      Object.defineProperty(req, "ip", { value: "192.0.2.1", writable: true });
      expect(getClientIp(req)).toBe("192.0.2.1");
    });

    it("should return 'unknown_ip' if no headers or req.ip exist", () => {
      const req = new NextRequest("http://localhost");
      expect(getClientIp(req)).toBe("unknown_ip");
    });
  });

  describe("checkRateLimit", () => {
    it("should allow first request", async () => {
      expect(await checkRateLimit("1.1.1.1")).toBe(true);
      expect(rateLimitMap.has("1.1.1.1")).toBe(true);
      expect(rateLimitMap.get("1.1.1.1")?.count).toBe(1);
    });

    it("should increment count for existing request", async () => {
      await checkRateLimit("2.2.2.2");
      expect(await checkRateLimit("2.2.2.2")).toBe(true);
      expect(rateLimitMap.get("2.2.2.2")?.count).toBe(2);
    });
  });

  describe("withAuth rate limit isolation", () => {
    it("should rate limit a single IP after 100 requests", async () => {
      const handler = async () => NextResponse.json({ success: true });
      const wrappedHandler = withAuth(handler);

      const req = new NextRequest("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.1" }
      });

      for (let i = 0; i < 100; i++) {
        const res = await wrappedHandler(req);
        expect(res.status).not.toBe(429);
      }

      const res101 = await wrappedHandler(req);
      expect(res101.status).toBe(429);
    });

    it("should isolate rate limiting per IP and not block other clients", async () => {
      const handler = async () => NextResponse.json({ success: true });
      const wrappedHandler = withAuth(handler);

      // Exhaust limit on IP 10.0.0.2
      const reqBlock = new NextRequest("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.2" }
      });
      for (let i = 0; i < 100; i++) {
        await wrappedHandler(reqBlock);
      }
      // Verification: 10.0.0.2 is blocked
      const resBlock = await wrappedHandler(reqBlock);
      expect(resBlock.status).toBe(429);

      // Verify that IP 10.0.0.3 is NOT blocked
      const reqAllow = new NextRequest("http://localhost", {
        headers: { "x-forwarded-for": "10.0.0.3" }
      });
      const resAllow = await wrappedHandler(reqAllow);
      expect(resAllow.status).toBe(200);
    });
  });
});

