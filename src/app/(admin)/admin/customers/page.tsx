import React from "react";
import { prisma } from "@/lib/db";
import { serializeCustomerList } from "@/lib/serialize";
import CustomersTableClient from "@/components/admin/CustomersTableClient";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "", 10) || 1;

  const total = await prisma.customer.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(requestedPage, 1), totalPages);

  // KPI cards must reflect the WHOLE customer base, not the current page
  // slice — computed here via SQL aggregates.
  const [activeGold, avgSpendAgg] = await Promise.all([
    prisma.customer.count({ where: { tier: "Gold" } }),
    prisma.customer.aggregate({ _avg: { totalSpend: true } }),
  ]);
  const stats = {
    total,
    activeGold,
    avgLtv: Number((Number(avgSpendAgg._avg.totalSpend ?? 0)).toFixed(2)),
  };

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="font-serif text-[36px] text-zinc-900 dark:text-zinc-100 leading-tight mb-2">Customers</h1>
          <p className="text-[16px] text-zinc-500 dark:text-zinc-400">Manage your high-value client relationships.</p>
        </div>
      </div>

      {/* Data Table */}
      <CustomersTableClient
        initialCustomers={serializeCustomerList(customers)}
        page={page}
        totalPages={totalPages}
        total={total}
        stats={stats}
      />
    </div>
  );
}
