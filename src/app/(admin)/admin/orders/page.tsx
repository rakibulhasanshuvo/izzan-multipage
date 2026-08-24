import React from "react";
import { prisma } from "@/lib/db";
import { serializeOrderList } from "@/lib/serialize";
import { findFlaggedPhones } from "@/lib/fraud-flags";
import { ORDER_STATUSES } from "@/lib/validation";
import OrdersTableClient from "@/components/admin/OrdersTableClient";
import type { Prisma } from "@/generated/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const DATE_RANGES: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30 };

// Kept outside the component so no impure calls (Date.now) run in render.
async function getOrdersPageData(params: { page?: string; q?: string; status?: string; date?: string }) {
  // Filters are applied server-side so search/status/date operate over the
  // whole dataset and pagination stays correct (not just the current slice).
  const where: Prisma.OrderWhereInput = {};

  const q = (params.q ?? "").trim();
  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { customerName: { contains: q, mode: "insensitive" } },
      { customerPhone: { contains: q, mode: "insensitive" } },
      { customerEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  const status =
    params.status && (ORDER_STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : null;
  if (status) {
    where.status = status;
  }

  // Window is anchored to "now" at query time, so orders that arrive while
  // an admin keeps the filter open are never missed.
  const days = params.date ? DATE_RANGES[params.date] : undefined;
  if (days) {
    where.createdAt = { gte: new Date(Date.now() - days * 86400000) };
  }

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.page ?? "", 10) || 1;
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return { total, totalPages, page, orders };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; date?: string }>;
}) {
  const params = await searchParams;
  const { total, totalPages, page, orders } = await getOrdersPageData(params);

  // Phones with several recent active orders get a fraud-review badge in
  // the table.
  const flaggedPhones = await findFlaggedPhones();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-serif text-[36px] text-zinc-900 dark:text-zinc-100 leading-tight mb-2">Orders</h1>
          <p className="text-[16px] text-zinc-500 dark:text-zinc-400">Manage and track your boutique&apos;s recent transactions.</p>
        </div>
      </div>

      {/* Data Table */}
      <OrdersTableClient
        initialOrders={serializeOrderList(orders)}
        page={page}
        totalPages={totalPages}
        total={total}
        flaggedPhones={flaggedPhones}
      />
    </div>
  );
}
