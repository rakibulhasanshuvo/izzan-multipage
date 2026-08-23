import React from "react";
import { prisma } from "@/lib/db";
import { serializeOrderList } from "@/lib/serialize";
import { findFlaggedPhones } from "@/lib/fraud-flags";
import OrdersTableClient from "@/components/admin/OrdersTableClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "", 10) || 1;

  const total = await prisma.order.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

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
