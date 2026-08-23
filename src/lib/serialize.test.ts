import { describe, it, expect } from 'vitest';
import { Prisma } from '@/generated/client';
import {
  serializeProduct,
  serializeProductList,
  serializeOrder,
  serializeOrderList,
  serializeCustomer,
  serializeCustomerList,
  serializeDecimalSum,
} from './serialize';

const D = (v: string) => new Prisma.Decimal(v);

describe('serializeProduct', () => {
  it('converts price and originalPrice Decimal fields to numbers', () => {
    const product = {
      id: 'p1',
      name: 'Candle',
      price: D('28.50'),
      originalPrice: D('45.00'),
      stock: 10,
    };

    const result = serializeProduct(product as never);

    expect(result.price).toBe(28.5);
    expect(result.originalPrice).toBe(45);
    expect(typeof result.price).toBe('number');
    expect(typeof result.originalPrice).toBe('number');
  });

  it('preserves null originalPrice and passes through other fields', () => {
    const product = {
      id: 'p2',
      name: 'Oil',
      price: D('19.99'),
      originalPrice: null,
      stock: 0,
    };

    const result = serializeProduct(product as never);

    expect(result.originalPrice).toBeNull();
    expect(result.id).toBe('p2');
    expect(result.name).toBe('Oil');
    expect(result.stock).toBe(0);
  });

  it('serializes a list of products', () => {
    const products = [
      { id: 'a', price: D('1.00'), originalPrice: null },
      { id: 'b', price: D('2.00'), originalPrice: D('3.00') },
    ];

    const result = serializeProductList(products as never);

    expect(result).toHaveLength(2);
    expect(result[0].price).toBe(1);
    expect(result[1].originalPrice).toBe(3);
  });
});

describe('serializeOrder', () => {
  it('converts totalAmount Decimal to number', () => {
    const order = { id: 'o1', totalAmount: D('1234.56'), status: 'Pending' };

    const result = serializeOrder(order as never);

    expect(result.totalAmount).toBe(1234.56);
    expect(typeof result.totalAmount).toBe('number');
    expect(result.status).toBe('Pending');
  });

  it('serializes a list of orders', () => {
    const orders = [
      { id: 'o1', totalAmount: D('10.00') },
      { id: 'o2', totalAmount: D('20.00') },
    ];

    const result = serializeOrderList(orders as never);

    expect(result.map((o) => o.totalAmount)).toEqual([10, 20]);
  });
});

describe('serializeCustomer', () => {
  it('converts totalSpend Decimal to number', () => {
    const customer = { id: 'c1', totalSpend: D('999.95'), tier: 'Gold' };

    const result = serializeCustomer(customer as never);

    expect(result.totalSpend).toBe(999.95);
    expect(result.tier).toBe('Gold');
  });

  it('serializes a list of customers', () => {
    const customers = [{ id: 'c1', totalSpend: D('0.00') }];

    const result = serializeCustomerList(customers as never);

    expect(result[0].totalSpend).toBe(0);
  });
});

describe('serializeDecimalSum', () => {
  it('returns 0 for null or undefined', () => {
    expect(serializeDecimalSum(null)).toBe(0);
    expect(serializeDecimalSum(undefined)).toBe(0);
  });

  it('converts a Decimal sum to a plain number', () => {
    expect(serializeDecimalSum(D('42.42'))).toBe(42.42);
  });
});
