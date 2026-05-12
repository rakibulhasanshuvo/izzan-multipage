import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Need to hoist the mock implementation completely
vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

import { POST } from './route';
import { prisma } from '@/lib/db';
import { PrismaClient } from '@/generated/client';

const prismaMock = prisma as unknown as ReturnType<typeof import('vitest-mock-extended').mockDeep<PrismaClient>>;

describe('Orders API POST handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: Record<string, unknown>) => {
    return new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const validPayload = {
    name: 'John Doe',
    phone: '01712345678',
    email: 'john@example.com',
    zila: 'Dhaka',
    upozila: 'Savar',
    shippingAddress: '123 Main St',
    items: [
      { id: 'prod1', name: 'Product 1', quantity: 2, price: 100 },
    ],
  };

  it('should return 400 if required fields are missing', async () => {
    const req = createRequest({ name: 'Incomplete' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields or empty cart');
  });

  it('should return 400 if items array is empty', async () => {
    const req = createRequest({ ...validPayload, items: [] });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields or empty cart');
  });

  it('should successfully process a valid order for a new customer', async () => {
    const req = createRequest(validPayload);

    // Mock findUnique to return null for customer and email (new customer)
    prismaMock.customer.findUnique.mockResolvedValue(null);

    // Mock transaction
    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      // Mock the transaction client
      const txMock = {
        product: {
          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
          update: vi.fn().mockResolvedValue({}),
        },
        customer: {
          create: vi.fn().mockResolvedValue({ id: 'cust1', name: 'John Doe', email: 'john@example.com' }),
          update: vi.fn(),
        },
        order: {
          create: vi.fn().mockResolvedValue({ id: 'order1' }),
        },
      };

      if (typeof callback === 'function') {
         return callback(txMock);
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderId).toBe('order1');
  });

  it('should successfully process a valid order for an existing customer', async () => {
    const req = createRequest(validPayload);

    // Mock findUnique to return existing customer
    prismaMock.customer.findUnique.mockImplementation(async (args: unknown) => {
      const typedArgs = args as { where?: { phone?: string, email?: string } };
      if (typedArgs?.where?.phone) {
        return { id: 'cust1', name: 'John Doe', phone: '01712345678', email: 'john@example.com', zila: 'Dhaka', upozila: 'Savar', location: 'Dhaka', totalSpend: 0, createdAt: new Date(), updatedAt: new Date() };
      }
      return null;
    });

    // Mock transaction
    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      // Mock the transaction client
      const txMock = {
        product: {
          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
          update: vi.fn().mockResolvedValue({}),
        },
        customer: {
          create: vi.fn(),
          update: vi.fn().mockResolvedValue({ id: 'cust1', name: 'John Doe', email: 'john@example.com' }),
        },
        order: {
          create: vi.fn().mockResolvedValue({ id: 'order2' }),
        },
      };

      if (typeof callback === 'function') {
         return callback(txMock);
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderId).toBe('order2');
  });

  it('should return 400 if a product is not found', async () => {
    const req = createRequest(validPayload);

    prismaMock.customer.findUnique.mockResolvedValue(null);

    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      const txMock = {
        product: {
          // Mock product not found
          findUnique: vi.fn().mockResolvedValue(null),
        },
      };

      if (typeof callback === 'function') {
         return callback(txMock);
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Product not found: Product 1');
  });

  it('should return 400 if there is insufficient stock', async () => {
    const req = createRequest({
      ...validPayload,
      items: [
        { id: 'prod1', name: 'Product 1', quantity: 20, price: 100 },
      ],
    });

    prismaMock.customer.findUnique.mockResolvedValue(null);

    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      const txMock = {
        product: {
          // Mock stock 10 (less than 20 requested)
          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
        },
      };

      if (typeof callback === 'function') {
         return callback(txMock);
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Insufficient stock for Product 1. Only 10 left.');
  });
});
