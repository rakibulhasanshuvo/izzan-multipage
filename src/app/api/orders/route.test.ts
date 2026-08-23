/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { rateLimitMap } from '@/lib/rate-limit';

const prismaMock = prisma as unknown as ReturnType<typeof import('vitest-mock-extended').mockDeep<PrismaClient>>;

describe('Orders API POST handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMap.clear();
  });

  const createRequest = (body: Record<string, unknown>, headers: Record<string, string> = {}) => {
    return new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Same-origin marker required by the fail-closed CSRF check
        Origin: 'http://localhost:3000',
        ...headers,
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

  it('should return 403 when Origin does not match Host (cross-site CSRF)', async () => {
    const req = createRequest(validPayload, { Origin: 'http://evil.example' });
    const response = await POST(req);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toContain('cross-origin');
  });

  it('should return 403 when neither Origin nor Referer is present (fail-closed)', async () => {
    const req = createRequest(validPayload, {
      Origin: '',
      Referer: '',
    });
    // NextRequest drops empty headers; build one without them entirely
    const bareReq = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });
    void req;
    const response = await POST(bareReq);

    expect(response.status).toBe(403);
  });

  it('should accept a matching Referer when Origin is absent', async () => {
    const req = new NextRequest('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'http://localhost:3000/shop',
      },
      body: JSON.stringify({ name: 'Incomplete' }),
    });
    const response = await POST(req);
    // Passes CSRF gate, then fails validation
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).not.toContain('cross-origin');
  });

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
    prismaMock.customer.findUnique.mockResolvedValue(null as any);

    // Mock transaction
    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      // Mock the transaction client
      const txMock = {
        product: {
          findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),
          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
          findFirst: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
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

    expect(data.error).toBeUndefined();
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
        return { id: 'cust1', name: 'John Doe', phone: '01712345678', email: 'john@example.com', zila: 'Dhaka', upozila: 'Savar', location: 'Dhaka', tier: 'BRONZE', totalSpend: 0, createdAt: new Date(), updatedAt: new Date() };
      }
      return null;
    });

    // Mock transaction
    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      // Mock the transaction client
      const txMock = {
        product: {
          findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),
          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
          findFirst: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
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

    expect(data.error).toBeUndefined();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderId).toBe('order2');
  });

  it('should return 400 if a product is not found', async () => {
    const req = createRequest(validPayload);

    prismaMock.customer.findUnique.mockResolvedValue(null as any);

    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      const txMock = {
        product: {
          // Mock product not found
          findMany: vi.fn().mockResolvedValue([]),
          findUnique: vi.fn().mockResolvedValue(null),
          findFirst: vi.fn().mockResolvedValue(null),
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
        { id: 'prod1', name: 'Product 1', quantity: 8, price: 100 },
      ],
    });

    prismaMock.customer.findUnique.mockResolvedValue(null as any);

    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      const txMock = {
        product: {
          // Mock stock 5 (less than 8 requested)
          findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 5 }]),
          findUnique: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 5 }),
          findFirst: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 5 }),
        },
      };

      if (typeof callback === 'function') {
         return callback(txMock);
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Insufficient stock for Product 1.');
    // Stock levels must not be disclosed to anonymous callers
    expect(data.error).not.toContain('10');
  });

  it('should roll back and return 400 if database stock goes below zero post-update due to race conditions', async () => {
    const req = createRequest({
      ...validPayload,
      items: [
        { id: 'prod1', name: 'Product 1', quantity: 8, price: 100 },
      ],
    });

    prismaMock.customer.findUnique.mockResolvedValue(null as any);

    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      const txMock = {
        product: {
          findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),
          update: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', stock: -2 }),
        },
      };

      if (typeof callback === 'function') {
         return callback(txMock);
      }
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Insufficient stock for Product 1');
  });

  it('should rate limit orders after too many requests', async () => {
    const req = createRequest(validPayload);
    rateLimitMap.set('order:unknown_ip', { count: 100, resetTime: Date.now() + 10000 });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many checkout requests');
  });

  it('should resolve legacy variant items via base-name fallback', async () => {
    // Legacy carts stored suffixed names ("Product 1 (8 oz ...)"); these must
    // still resolve to the base product instead of failing with 400.
    const req = createRequest({
      ...validPayload,
      items: [
        { id: 'prod1-8-oz-220g-single-wick', name: 'Product 1 (8 oz (220g) - Single Wick)', quantity: 1, price: 100 },
      ],
    });

    prismaMock.customer.findUnique.mockResolvedValue(null as any);

    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      const txMock = {
        product: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }),
          update: vi.fn().mockResolvedValue({ id: 'prod1', name: 'Product 1', stock: 9 }),
        },
        customer: {
          create: vi.fn().mockResolvedValue({ id: 'cust1' }),
        },
        order: {
          create: vi.fn().mockResolvedValue({ id: 'order3' }),
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
    expect(data.orderId).toBe('order3');
  });

  it('should report success when a concurrent request already created the order (P2002 race)', async () => {
    const req = createRequest({ ...validPayload, idempotencyKey: 'key-123' });

    prismaMock.customer.findUnique.mockResolvedValue(null as any);

    prismaMock.$transaction.mockImplementation(async () => {
      const p2002 = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
      throw p2002;
    });
    // First call = idempotency precheck (miss); second = post-P2002 lookup
    prismaMock.order.findUnique
      .mockResolvedValueOnce(null as any)
      .mockResolvedValueOnce({ id: 'order-original' } as any);

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.orderId).toBe('order-original');
  });

  it('should return 400 if email has an invalid format', async () => {
    const req = createRequest({ ...validPayload, email: 'not-an-email' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields or empty cart');
  });

  // --- Fraud hardening ---

  it('should reject submissions that filled the hidden honeypot field', async () => {
    const req = createRequest({ ...validPayload, companyWebsite: 'http://spam.example' });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Failed to process order. Please try again.');
    // No DB work should have been attempted
    expect(prismaMock.customer.findUnique).not.toHaveBeenCalled();
  });

  it('should rate limit by phone number after repeated orders', async () => {
    rateLimitMap.set('order-phone:01712345678', { count: 5, resetTime: Date.now() + 60_000 });

    const req = createRequest(validPayload);
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many orders from this phone number');
  });

  it('should enforce the per-item quantity cap', async () => {
    const req = createRequest({
      ...validPayload,
      items: [{ id: 'prod1', name: 'Product 1', quantity: 11, price: 100 }],
    });
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields or empty cart');
  });

  it('should reject orders whose DB-calculated total exceeds MAX_ORDER_TOTAL', async () => {
    process.env.MAX_ORDER_TOTAL = '150';
    try {
      const req = createRequest(validPayload); // 100 × 2 = 200 > 150

      prismaMock.customer.findUnique.mockResolvedValue(null as any);

      prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
        const txMock = {
          product: {
            findMany: vi.fn().mockResolvedValue([{ id: 'prod1', name: 'Product 1', price: 100, stock: 10 }]),
          },
        };
        if (typeof callback === 'function') return callback(txMock);
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Order total exceeds the maximum allowed');
    } finally {
      delete process.env.MAX_ORDER_TOTAL;
    }
  });
});

