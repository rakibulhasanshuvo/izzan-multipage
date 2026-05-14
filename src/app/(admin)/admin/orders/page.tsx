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
        {/* Filters */}
        <div className="flex items-center gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-zinc-200/50 dark:border-zinc-700/50 rounded-2xl p-1.5 shadow-sm">
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors border-r border-zinc-200/50 dark:border-zinc-700/50 pr-5">
            <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500 text-[18px]">calendar_today</span>
            <span className="text-[14px] text-zinc-700 dark:text-zinc-300 font-medium">Last 30 Days</span>
            <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500 text-[18px] ml-1">expand_more</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors pl-5">
            <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500 text-[18px]">filter_list</span>
            <span className="text-[14px] text-zinc-700 dark:text-zinc-300 font-medium">All Statuses</span>
            <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500 text-[18px] ml-1">expand_more</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <OrdersTableClient initialOrders={orders} />
    </div>
  );
}
