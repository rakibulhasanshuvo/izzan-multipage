
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from "next/server.js";

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    checkAdminAuth: vi.fn().mockResolvedValue(true),
    withAuth: (handler: unknown) => handler
  };
});



vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

import { PATCH } from './route';
import { prisma } from '@/lib/db';
import { PrismaClient } from '@/generated/client';

const prismaMock = prisma as unknown as ReturnType<typeof import('vitest-mock-extended').mockDeep<PrismaClient>>;

process.env.ADMIN_TOKEN = "test-token";

describe('Products API PATCH handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify(body)
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

  it('should return 400 for invalid name', async () => {
    const req = createRequest({ id: "123", name: "" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Name must be a non-empty string");
  });

  it('should return 400 for invalid price', async () => {
    const req = createRequest({ id: "123", price: "invalid" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid price");
  });

  it('should return 400 for invalid stock', async () => {
    const req = createRequest({ id: "123", stock: "abc" });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid stock");
  });

    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    const findUniqueMock = mock.method(prisma.product, "findUnique", async () => mockProduct);
    const updateMock = mock.method(prisma.product, "update", async ({ data }: { data: Parameters<typeof prisma.product.update>[0]['data'] }) => ({ ...mockProduct, ...data }));

    // Using vi.fn().mockImplementation to simulate the update
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
