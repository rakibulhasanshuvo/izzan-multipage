/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, vi, describe, it, beforeEach } from "vitest";
import { NextRequest } from "next/server.js";
import { prisma } from "../../../../lib/db";
import * as auth from "../../../../lib/auth";

vi.mock("next-auth/next", () => ({ getServerSession: vi.fn().mockResolvedValue(true) }));

import { PATCH } from './route';

vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

describe('Products API PATCH handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_TOKEN = "test-token";
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost/api/admin/products', {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('should return 400 if ID is missing', async () => {
    const req = createRequest({});
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Missing product ID");
  });

  it("should return 404 if product is not found", async () => {
    prisma.product.findUnique.mockResolvedValue(null);

    const req = createRequest({ id: "non-existent", name: "New Name" });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Product not found");
  });

  it("should return 400 for invalid name", async () => {
    const req = createRequest({ id: "123", name: "   " });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Name must be a non-empty string");
  });

  it("should return 400 for invalid price", async () => {
    const req = createRequest({ id: "123", price: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid price");
  });

  it("should return 400 for invalid stock", async () => {
    const req = createRequest({ id: "123", stock: "abc" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid stock");
  });

  it("should return 400 for invalid original price", async () => {
    const req = createRequest({ id: "123", originalPrice: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid original price");
  });

  it("should return 200 and clear original price", async () => {
    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5, originalPrice: 20 };
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }));

    const req = createRequest({ id: "123", originalPrice: null });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.originalPrice).toBe(null);
  });

  it("should successfully update fields", async () => {
    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }));

    const req = createRequest({ id: "123", name: "New Name", price: 15, stock: 10 });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("New Name");
    expect(data.price).toBe(15);
    expect(data.stock).toBe(10);
  });

  it("should successfully update all fields", async () => {
    const mockProduct = { id: "123", name: "Old", description: "Old desc", price: 10, originalPrice: 20, img: "old.jpg", hoverImg: "old_h.jpg", categories: "old,cat", badge: "Old Badge", stock: 5 };
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    prisma.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }));

    const req = createRequest({
        id: "123",
        name: " New Name ",
        description: "New desc",
        price: "15.5",
        originalPrice: "25.5",
        img: "new.jpg",
        hoverImg: "new_h.jpg",
        categories: "new,cat",
        badge: "New Badge",
        stock: "10"
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.name).toBe("New Name"); // Trimmed
    expect(data.description).toBe("New desc");
    expect(data.price).toBe(15.5);
    expect(data.originalPrice).toBe(25.5);
    expect(data.img).toBe("new.jpg");
    expect(data.hoverImg).toBe("new_h.jpg");
    expect(data.categories).toBe("new,cat");
    expect(data.badge).toBe("New Badge");
    expect(data.stock).toBe(10);
  });
});
