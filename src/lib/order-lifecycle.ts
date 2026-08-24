import { Prisma } from "@/generated/client";
import { prisma } from "./db";
import { logger } from "./logger";
import type { OrderStatus } from "./validation";

type TransactionClient = Prisma.TransactionClient;

interface StoredOrderItem {
  id?: string;
  name?: string;
  quantity?: number;
}

/**
 * Thrown for expected, user-facing lifecycle failures (missing order,
 * insufficient stock on reopen). Callers map these to 4xx responses or
 * actionable admin messages; anything else is an unexpected error.
 */
export class OrderLifecycleError extends Error {}

/**
 * Consolidates quantities per product id from an order's serialized items
 * JSON. Entries without a usable id/quantity are skipped defensively so a
 * malformed legacy row can never wedge a status update.
 */
function consolidateQuantities(itemsJson: string): Map<string, number> {
  const quantities = new Map<string, number>();
  let parsed: unknown;
  try {
    parsed = JSON.parse(itemsJson);
  } catch {
    return quantities;
  }
  if (!Array.isArray(parsed)) return quantities;

  for (const raw of parsed) {
    const item = raw as StoredOrderItem;
    if (!item || typeof item.id !== "string" || item.id.length === 0) continue;
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) continue;
    quantities.set(item.id, (quantities.get(item.id) ?? 0) + quantity);
  }
  return quantities;
}

/**
 * Returns stock to inventory after an order moves to Cancelled.
 * Products that no longer exist are skipped (nothing to restore).
 */
async function restoreOrderStock(tx: TransactionClient, orderId: string, itemsJson: string): Promise<void> {
  const baseName = (value: string): string => value.replace(/\s*\([^()]*\)\s*$/, "").trim();

  for (const [productId, quantity] of consolidateQuantities(itemsJson)) {
    try {
      await tx.product.update({
        where: { id: productId },
        data: { stock: { increment: quantity } },
      });
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === "P2025") {
        // Product deleted since the order was placed; fall back to a
        // name-based lookup so legacy orders still restock correctly.
        let name: string | null = null;
        try {
          const stored = JSON.parse(itemsJson) as StoredOrderItem[];
          name =
            stored.find((item) => item.id === productId && typeof item.name === "string")?.name ?? null;
        } catch {
          name = null;
        }
        if (name) {
          const replacement = await tx.product.findFirst({ where: { name: baseName(name) } });
          if (replacement) {
            await tx.product.update({
              where: { id: replacement.id },
              data: { stock: { increment: quantity } },
            });
            continue;
          }
        }
        logger.warn("Order cancel: product no longer exists, skipping stock restore", {
          orderId,
          productId,
        });
        continue;
      }
      throw error;
    }
  }
}

/**
 * Re-reserves stock when a cancelled order is reactivated, mirroring the
 * checkout-time post-check so concurrent sales cannot drive stock negative.
 */
async function reserveOrderStock(tx: TransactionClient, itemsJson: string): Promise<void> {
  for (const [productId, quantity] of consolidateQuantities(itemsJson)) {
    const updated = await tx.product
      .update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      })
      .catch((error: unknown) => {
        const err = error as { code?: string };
        if (err?.code === "P2025") return null; // deleted product: nothing to reserve
        throw error;
      });

    if (updated && updated.stock < 0) {
      throw new OrderLifecycleError(
        `Cannot reopen order: insufficient stock${updated.name ? ` for ${updated.name}` : ""}.`
      );
    }
  }
}

/**
 * Shared order status transition used by both the admin API route and the
 * server action so stock/spend accounting cannot drift between them.
 *
 * - Active → Cancelled: restores product stock and reverses customer
 *   totalSpend inside one transaction.
 * - Cancelled → Active: re-reserves stock (with insufficient-stock guard)
 *   and re-applies totalSpend.
 * - Any other transition: plain status update.
 */
export async function updateOrderStatusWithLifecycle(id: string, nextStatus: OrderStatus) {
  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    throw new OrderLifecycleError("Order not found");
  }

  if (existing.status === nextStatus) {
    return existing;
  }

  const wasCancelled = existing.status === "Cancelled";
  const willBeCancelled = nextStatus === "Cancelled";

  if (wasCancelled === willBeCancelled) {
    return prisma.order.update({
      where: { id },
      data: { status: nextStatus },
    });
  }

  return prisma.$transaction(async (tx) => {
    // Claim the transition atomically BEFORE touching stock/spend so two
    // concurrent updates (e.g. two admins, or admin + API) can never both
    // apply side effects for the same source status (double stock restore,
    // double spend decrement). The guard matches on the status we observed.
    const claimed = await tx.order.updateMany({
      where: { id, status: existing.status },
      data: { status: nextStatus },
    });
    if (claimed.count === 0) {
      throw new OrderLifecycleError(
        "Order was already updated by someone else. Refresh and try again."
      );
    }

    if (willBeCancelled) {
      await restoreOrderStock(tx, existing.id, existing.items);
      if (existing.customerId) {
        await tx.customer.update({
          where: { id: existing.customerId },
          data: { totalSpend: { decrement: existing.totalAmount } },
        });
      }
    } else {
      await reserveOrderStock(tx, existing.items);
      if (existing.customerId) {
        await tx.customer.update({
          where: { id: existing.customerId },
          data: { totalSpend: { increment: existing.totalAmount } },
        });
      }
    }

    return tx.order.findUniqueOrThrow({ where: { id } });
  });
}
