import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Single source of truth for money rendering so prices never flip between
 * "$12.5" and "$12.50" across components. Accepts numbers or Decimal-ish
 * values that stringify to plain decimal strings.
 */
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(value: number | string): string {
  const n = typeof value === "number" ? value : Number(value);
  return moneyFormatter.format(Number.isFinite(n) ? n : 0);
}
