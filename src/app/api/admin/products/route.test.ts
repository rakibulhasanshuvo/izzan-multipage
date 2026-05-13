import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Need to hoist the mock implementation completely
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
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing product ID');
  });

  it('should return 404 if product is not found', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null);

    const req = createRequest({ id: 'non-existent' });
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });

  it('should return 400 if name is invalid', async () => {
    const req = createRequest({ id: '123', name: '' });
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Name must be a non-empty string');
  });

  it('should return 400 if price is invalid', async () => {
    const req = createRequest({ id: '123', price: 'invalid' });
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid price');
  });

  it('should return 400 if stock is invalid', async () => {
    const req = createRequest({ id: '123', stock: 'abc' });
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid stock');
  });

  it('should return 200 and update successfully', async () => {
    const mockProduct = { id: '123', name: 'Old Name', price: 10, stock: 5, description: null, badge: null, categories: '', hoverImg: null, img: '', originalPrice: null, createdAt: new Date(), updatedAt: new Date() };

    prismaMock.product.findUnique.mockResolvedValue(mockProduct);
    prismaMock.product.update.mockImplementation(async ({ data }: any) => ({ ...mockProduct, ...data }));

    const req = createRequest({ id: '123', name: 'New Name', price: 15, stock: 10 });
    const res = await PATCH(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe('New Name');
    expect(data.price).toBe(15);
    expect(data.stock).toBe(10);
  });
});
