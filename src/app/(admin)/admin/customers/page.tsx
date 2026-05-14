import React from "react";
import { prisma } from "@/lib/db";
import CustomersTableClient from "@/components/admin/CustomersTableClient";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-serif text-[36px] text-zinc-900 dark:text-zinc-100 leading-tight mb-2">Customers</h1>
          <p className="text-[16px] text-zinc-500 dark:text-zinc-400">Manage your high-value client relationships.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-zinc-200/50 dark:border-zinc-700/50 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white rounded-full hover:bg-zinc-800 transition-colors font-medium shadow-lg shadow-zinc-900/20">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Client
          </button>
        </div>
      </div>

      <CustomersTableClient initialCustomers={customers} />
    </div>
  );
}
