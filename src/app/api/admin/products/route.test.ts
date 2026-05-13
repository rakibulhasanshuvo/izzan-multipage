import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

vi.mock('@/lib/auth', () => ({
  checkAdminAuth: vi.fn().mockResolvedValue(true),
  withAuth: (handler: unknown) => handler,
}));

import { PATCH } from './route';
import { prisma } from '@/lib/db';
import { PrismaClient } from '@/generated/client';

const prismaMock = prisma as unknown as ReturnType<typeof import('vitest-mock-extended').mockDeep<PrismaClient>>;

describe('Products API PATCH handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/admin/products', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  it('should return 400 if product ID is missing', async () => {
    const req = createRequest({ name: 'Valid Name', price: '10.50' });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing product ID');
  });

  it('should return 400 if name is empty', async () => {
    const req = createRequest({ id: 'prod1', name: '' });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name must be a non-empty string');
  });

  it('should return 400 if name is not a string', async () => {
    const req = createRequest({ id: 'prod1', name: 123 });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name must be a non-empty string');
  });

  it('should return 400 if price is invalid', async () => {
    const req = createRequest({ id: 'prod1', price: 'invalid' });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid price');
  });

  it('should return 400 if original price is invalid', async () => {
    const req = createRequest({ id: 'prod1', originalPrice: 'invalid' });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid original price');
  });

  it('should return 400 if stock is invalid', async () => {
    const req = createRequest({ id: 'prod1', stock: 'invalid' });
    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid stock');
  });

  it('should return 404 if product is not found', async () => {
    const req = createRequest({ id: 'prod1', name: 'New Name' });

    prismaMock.product.findUnique.mockResolvedValue(null);

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });

  it('should successfully update a product', async () => {
    const req = createRequest({
      id: 'prod1',
      name: 'Updated Name',
      description: 'Updated Description',
      price: '150.00',
      originalPrice: '200.00',
      img: 'new-image.jpg',
      hoverImg: 'new-hover-image.jpg',
      categories: '["category1"]',
      badge: 'New Badge',
      stock: '20',
    });

    const mockExistingProduct = {
      id: 'prod1',
      name: 'Old Name',
      description: 'Old Description',
      price: 100,
      originalPrice: null,
      img: 'old.jpg',
      hoverImg: null,
      categories: '[]',
      badge: null,
      stock: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUpdatedProduct = {
      ...mockExistingProduct,
      name: 'Updated Name',
      description: 'Updated Description',
      price: 150,
      originalPrice: 200,
      img: 'new-image.jpg',
      hoverImg: 'new-hover-image.jpg',
      categories: '["category1"]',
      badge: 'New Badge',
      stock: 20,
    };

    prismaMock.product.findUnique.mockResolvedValue(mockExistingProduct);
    prismaMock.product.update.mockResolvedValue(mockUpdatedProduct);

    const response = await PATCH(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(JSON.parse(JSON.stringify(mockUpdatedProduct)));

    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod1' },
      data: {
        name: 'Updated Name',
        description: 'Updated Description',
        price: 150,
        originalPrice: 200,
        img: 'new-image.jpg',
        hoverImg: 'new-hover-image.jpg',
        categories: '["category1"]',
        badge: 'New Badge',
        stock: 20,
      },
    });
  });

  it('should successfully update a product removing original price', async () => {
    const req = createRequest({
      id: 'prod1',
      originalPrice: '',
    });

    const res = await PATCH(req);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.error, "Invalid stock");
});

test("PATCH /api/admin/products - Successful Update", async () => {
    const { PATCH } = await import("./route");

    const mockProduct = { id: "123", name: "Old Name", price: 10, stock: 5 };
    const findUniqueMock = mock.method(prisma.product, "findUnique", async () => mockProduct);
    const updateMock = mock.method(prisma.product, "update", async ({ data }: { data: unknown }) => ({ ...mockProduct, ...data }));

    const req = new NextRequest("http://localhost/api/admin/products", {
        method: "PATCH",
        headers: {
            "Authorization": "Bearer test-token"
        },
        body: JSON.stringify({ id: "123", name: "New Name", price: 15, stock: 10 })
    });
  });
});
