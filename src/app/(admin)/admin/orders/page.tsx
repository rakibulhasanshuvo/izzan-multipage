import React from "react";
import { prisma } from "@/lib/db";
import OrdersTableClient from "@/components/admin/OrdersTableClient";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

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
      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
