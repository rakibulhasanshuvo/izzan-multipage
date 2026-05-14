const fs = require('fs');

const content = `/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, expect, vi, describe, beforeEach, it } from "vitest";
import { NextRequest } from "next/server";
import * as auth from "../../../../lib/auth";
import { PATCH } from './route';
import { prisma } from '@/lib/db';
import { PrismaClient } from '@/generated/client';

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
    vi.spyOn(auth, "checkAdminAuth").mockResolvedValue(true);
    process.env.ADMIN_TOKEN = "test-token";
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
    prismaMock.product.findUnique.mockResolvedValue(null);

    const req = createRequest({ id: "non-existent" });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Product not found");
  });

  it('should return 400 for invalid price', async () => {
    const req = createRequest({ id: "123", price: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid price");
  });

  it('should return 400 if stock is invalid', async () => {
    const req = createRequest({ id: '123', stock: 'abc' });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid stock");
  });

  it('should successfully update product', async () => {
    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    prismaMock.product.findUnique.mockResolvedValue(mockProduct as any);

    prismaMock.product.update.mockImplementation(((args: any) => Promise.resolve({ ...mockProduct, ...args.data })) as any);

    const req = createRequest({ id: "123", name: "New Name", price: 15, stock: 10 });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("New Name");
    expect(data.price).toBe(15);
    expect(data.stock).toBe(10);
  });
});
`;

fs.writeFileSync('src/app/api/admin/products/route.test.ts', content);
