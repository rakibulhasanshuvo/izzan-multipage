import { Prisma, type Customer, type Order, type Product } from "@/generated/client";

/**
 * Prisma Decimal fields cannot cross the server/client boundary as-is
 * (they arrive as strings on the client). These mappers convert money
 * columns to plain numbers at every server -> client hand-off.
 */

export type ProductView = Omit<Product, "price" | "originalPrice"> & {
  price: number;
  originalPrice: number | null;
};

export type OrderView = Omit<Order, "totalAmount"> & {
  totalAmount: number;
};

export type CustomerView = Omit<Customer, "totalSpend"> & {
  totalSpend: number;
};

export type SerializedProduct<T> = Omit<T, "price" | "originalPrice"> & {
  price: number;
  originalPrice: number | null;
};

export type SerializedOrder<T> = Omit<T, "totalAmount"> & {
  totalAmount: number;
};

export type SerializedCustomer<T> = Omit<T, "totalSpend"> & {
  totalSpend: number;
};

function decimalToNumber(value: Prisma.Decimal | number): number {
  return Number(value);
}

export function serializeProduct<
  T extends { price: Prisma.Decimal; originalPrice: Prisma.Decimal | null }
>(product: T): SerializedProduct<T> {
  const { price, originalPrice, ...rest } = product;
  return {
    ...(rest as Omit<T, "price" | "originalPrice">),
    price: decimalToNumber(price),
    originalPrice: originalPrice === null ? null : decimalToNumber(originalPrice),
  };
}

export function serializeProductList<
  T extends { price: Prisma.Decimal; originalPrice: Prisma.Decimal | null }
>(products: T[]): SerializedProduct<T>[] {
  return products.map(serializeProduct);
}

export function serializeOrder<T extends { totalAmount: Prisma.Decimal }>(
  order: T
): SerializedOrder<T> {
  const { totalAmount, ...rest } = order;
  return {
    ...(rest as Omit<T, "totalAmount">),
    totalAmount: decimalToNumber(totalAmount),
  };
}

export function serializeOrderList<T extends { totalAmount: Prisma.Decimal }>(
  orders: T[]
): SerializedOrder<T>[] {
  return orders.map(serializeOrder);
}

export function serializeCustomer<T extends { totalSpend: Prisma.Decimal }>(
  customer: T
): SerializedCustomer<T> {
  const { totalSpend, ...rest } = customer;
  return {
    ...(rest as Omit<T, "totalSpend">),
    totalSpend: decimalToNumber(totalSpend),
  };
}

export function serializeCustomerList<T extends { totalSpend: Prisma.Decimal }>(
  customers: T[]
): SerializedCustomer<T>[] {
  return customers.map(serializeCustomer);
}

export function serializeDecimalSum(
  value: Prisma.Decimal | null | undefined
): number {
  return value === null || value === undefined ? 0 : Number(value);
}
