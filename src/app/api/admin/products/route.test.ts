/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, vi, describe, beforeEach, it } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import * as auth from "@/lib/auth";
import { PrismaClient } from '@/generated/client';
import { PATCH } from "./route";

vi.mock("next-auth/next", () => ({ getServerSession: vi.fn().mockResolvedValue(true) }));

vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

const prismaMock = prisma as unknown as ReturnType<typeof import('vitest-mock-extended').mockDeep<PrismaClient>>;

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

  it('should return 404 if product is not found', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null as any);

    const req = createRequest({ id: "non-existent", name: "Valid Name", price: 10, stock: 5 });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Product not found");
  });

  it('should return 400 if name is invalid', async () => {
    const req = createRequest({ id: '123', name: '' });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Name must be a non-empty string");
  });

  it('should return 400 if price is invalid', async () => {
    const req = createRequest({ id: "123", price: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid price");
  });

  it('should return 400 if stock is invalid', async () => {
    const req = createRequest({ id: "123", stock: "abc" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid stock");
  });

  it('should return 400 if original price is invalid', async () => {
    const req = createRequest({ id: "123", originalPrice: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid original price");
  });

  it('should successfully update a product', async () => {
    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);
    prismaMock.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }) as any);

    const req = createRequest({ id: "123", name: "New Name", price: 15, stock: 10 });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("New Name");
    expect(data.price).toBe(15);
    expect(data.stock).toBe(10);
  });

  it('should successfully clear original price', async () => {
    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5, originalPrice: 20 };
    prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);
    prismaMock.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }) as any);

    const req = createRequest({ id: "123", originalPrice: null });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.originalPrice).toBe(null);
  });

  it('should successfully update all fields', async () => {
    const mockProduct = { id: "123", name: "Old", description: "Old desc", price: 10, originalPrice: 20, img: "old.jpg", hoverImg: "old_h.jpg", categories: "old,cat", badge: "Old Badge", stock: 5 };
    prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);
    prismaMock.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }) as any);

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

    expect(data.name).toBe("New Name");
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
