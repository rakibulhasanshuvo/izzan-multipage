/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', async () => {
  const { mockDeep } = await import('vitest-mock-extended');
  return {
    prisma: mockDeep(),
  };
});

import { prisma } from '@/lib/db';
import { PrismaClient } from '@/generated/client';
import {
  updateOrderStatusWithLifecycle,
  OrderLifecycleError,
} from './order-lifecycle';

const prismaMock = prisma as unknown as ReturnType<typeof import('vitest-mock-extended').mockDeep<PrismaClient>>;

const itemsJson = JSON.stringify([
  { id: 'prod1', name: 'Product 1', quantity: 3 },
  { id: 'prod2', name: 'Product 2', quantity: 2 },
]);

// Minimal Decimal stand-in: the helper only forwards it into Prisma calls.
const totalAmount = { toString: () => '50.00' } as any;

const baseOrder = {
  id: 'order1',
  status: 'Pending',
  items: itemsJson,
  customerId: 'cust1',
  totalAmount,
};

describe('updateOrderStatusWithLifecycle', () => {
  let txMock: any;
  let claimedStatus: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    claimedStatus = undefined;
    txMock = {
      product: { update: vi.fn().mockResolvedValue({ id: 'x', stock: 10 }) },
      customer: { update: vi.fn().mockResolvedValue({}) },
      order: {
        // Atomic claim of the transition: records the newly-set status so
        // findUniqueOrThrow can reflect it, and reports whether the row
        // was still in the expected source status (count === 0 → raced).
        updateMany: vi.fn().mockImplementation(async ({ data }: any) => {
          claimedStatus = data.status;
          return { count: 1 };
        }),
        findUniqueOrThrow: vi.fn().mockImplementation(async () => ({
          ...baseOrder,
          status: claimedStatus,
        })),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback: unknown) => {
      if (typeof callback === 'function') return (callback as any)(txMock);
    });
  });

  it('throws OrderLifecycleError when the order does not exist', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null as any);

    await expect(updateOrderStatusWithLifecycle('missing', 'Cancelled')).rejects.toThrow(
      OrderLifecycleError
    );
    await expect(updateOrderStatusWithLifecycle('missing', 'Cancelled')).rejects.toThrow(
      'Order not found'
    );
  });

  it('restores stock and reverses customer spend when cancelling', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder });

    const result: any = await updateOrderStatusWithLifecycle('order1', 'Cancelled');

    expect(result.status).toBe('Cancelled');
    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod1' },
      data: { stock: { increment: 3 } },
    });
    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod2' },
      data: { stock: { increment: 2 } },
    });
    expect(txMock.customer.update).toHaveBeenCalledWith({
      where: { id: 'cust1' },
      data: { totalSpend: { decrement: totalAmount } },
    });
    expect(txMock.order.updateMany).toHaveBeenCalledWith({
      where: { id: 'order1', status: 'Pending' },
      data: { status: 'Cancelled' },
    });
  });

  it('skips customer spend reversal for guest orders without a customer', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder, customerId: null });

    await updateOrderStatusWithLifecycle('order1', 'Cancelled');

    expect(txMock.customer.update).not.toHaveBeenCalled();
  });

  it('is a no-op when the order is already cancelled (no double stock restore)', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder, status: 'Cancelled' });

    const result: any = await updateOrderStatusWithLifecycle('order1', 'Cancelled');

    expect(result.status).toBe('Cancelled');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it('performs a plain update for active-to-active transitions', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder });
    prismaMock.order.update.mockResolvedValue({ ...baseOrder, status: 'Processing' });

    const result: any = await updateOrderStatusWithLifecycle('order1', 'Processing');

    expect(result.status).toBe('Processing');
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: 'order1' },
      data: { status: 'Processing' },
    });
  });

  it('re-reserves stock and re-applies spend when reopening a cancelled order', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder, status: 'Cancelled' });

    const result: any = await updateOrderStatusWithLifecycle('order1', 'Processing');

    expect(result.status).toBe('Processing');
    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod1' },
      data: { stock: { decrement: 3 } },
    });
    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod2' },
      data: { stock: { decrement: 2 } },
    });
    expect(txMock.customer.update).toHaveBeenCalledWith({
      where: { id: 'cust1' },
      data: { totalSpend: { increment: totalAmount } },
    });
  });

  it('refuses to reopen when stock is insufficient (aborts before spend is applied)', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder, status: 'Cancelled' });
    txMock.product.update.mockResolvedValue({ id: 'prod1', name: 'Product 1', stock: -1 });

    await expect(updateOrderStatusWithLifecycle('order1', 'Processing')).rejects.toThrow(
      /insufficient stock/i
    );

    // Reservation failed → the whole transaction rolls back, so the customer
    // spend increment must never have been applied.
    expect(txMock.customer.update).not.toHaveBeenCalled();
  });

  it('aborts without side effects when another writer claimed the transition first', async () => {
    prismaMock.order.findUnique.mockResolvedValue({ ...baseOrder });
    // Simulates a concurrent update that already flipped Pending → Cancelled.
    txMock.order.updateMany.mockResolvedValue({ count: 0 } as any);

    await expect(updateOrderStatusWithLifecycle('order1', 'Cancelled')).rejects.toThrow(
      OrderLifecycleError
    );

    // No stock restore and no spend reversal may run for the losing writer.
    expect(txMock.product.update).not.toHaveBeenCalled();
    expect(txMock.customer.update).not.toHaveBeenCalled();
  });

  it('handles malformed items JSON gracefully when cancelling', async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      ...baseOrder,
      items: '{not-valid-json',
    });

    const result: any = await updateOrderStatusWithLifecycle('order1', 'Cancelled');

    expect(result.status).toBe('Cancelled');
    expect(txMock.product.update).not.toHaveBeenCalled();
  });

  it('skips items with missing or invalid quantities instead of failing', async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      ...baseOrder,
      items: JSON.stringify([
        { id: 'prod1', quantity: 0 },
        { name: 'no-id', quantity: 5 },
        { id: 'prod2', quantity: 1 },
      ]),
    });

    await updateOrderStatusWithLifecycle('order1', 'Cancelled');

    expect(txMock.product.update).toHaveBeenCalledTimes(1);
    expect(txMock.product.update).toHaveBeenCalledWith({
      where: { id: 'prod2' },
      data: { stock: { increment: 1 } },
    });
  });
});
