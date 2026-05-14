"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

import { Customer } from "@/generated/client";

export default function CustomersTableClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers] = useState<Customer[]>(initialCustomers);

  const activeGoldCount = customers.filter(c => c.tier === "Gold").length;
  const avgLTV = customers.length > 0 
    ? customers.reduce((acc, c) => acc + c.totalSpend, 0) / customers.length 
    : 0;

  return (
    <>
      {/* Stats Overview Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl p-6 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-500">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Total Clients</p>
            <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">group</span>
          </div>
          <h3 className="font-serif text-[44px] text-zinc-900 dark:text-zinc-100 leading-none mb-3">{customers.length}</h3>
          <p className="text-[13px] font-medium text-green-600 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Live
          </p>
        </div>
        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl p-6 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-500">
          <div className="flex justify-between items-start mb-4">
            <p className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Active Gold</p>
            <span className="material-symbols-outlined text-primary">workspace_premium</span>
          </div>
          <h3 className="font-serif text-[44px] text-zinc-900 dark:text-zinc-100 leading-none mb-3">{activeGoldCount}</h3>
          <p className="text-[13px] font-medium text-green-600 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            Live
          </p>
        </div>
        <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl p-6 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-500 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Avg. LTV</p>
              <span className="material-symbols-outlined text-zinc-400 dark:text-zinc-500">account_balance_wallet</span>
            </div>
            <h3 className="font-serif text-[44px] text-zinc-900 dark:text-zinc-100 leading-none mb-3">${avgLTV.toFixed(2)}</h3>
            <p className="text-[13px] font-medium text-green-600 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              Live
            </p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-[12px] text-zinc-500 py-4 px-6 font-semibold uppercase tracking-widest">Client</th>
                <th className="text-[12px] text-zinc-500 py-4 px-6 font-semibold uppercase tracking-widest">Contact</th>
                <th className="text-[12px] text-zinc-500 py-4 px-6 font-semibold uppercase tracking-widest">Tier</th>
                <th className="text-[12px] text-zinc-500 py-4 px-6 font-semibold uppercase tracking-widest text-right">Total Spend</th>
                <th className="text-[12px] text-zinc-500 py-4 px-6 font-semibold uppercase tracking-widest">Join Date</th>
                <th className="text-[12px] text-zinc-500 py-4 px-6 font-semibold uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[15px] text-zinc-800 dark:text-zinc-200">
              {customers.map((customer) => {
                const joinDate = new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const initials = customer.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                
                return (
                  <tr key={customer.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100/50 dark:border-zinc-800 last:border-0 cursor-pointer">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 flex items-center justify-center text-[12px] font-semibold text-zinc-600 dark:text-zinc-300 tracking-wider flex-shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">{customer.name}</div>
                          <div className="text-[13px] text-zinc-500 dark:text-zinc-400">{customer.location || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-zinc-800 dark:text-zinc-200">{customer.email || "-"}</div>
                      <div className="text-[13px] text-zinc-500 dark:text-zinc-400">{customer.phone || "-"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-flex px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border",
                        customer.tier === "Gold" ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:border-primary/30" :
                        customer.tier === "Silver" ? "bg-zinc-100 text-zinc-700 border-zinc-200/50 dark:bg-zinc-800/80 dark:text-zinc-300 dark:border-zinc-700/50" :
                        "bg-orange-50 text-orange-700 border-orange-100/50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50"
                      )}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-zinc-900 dark:text-zinc-100">${customer.totalSpend.toFixed(2)}</td>
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400">{joinDate}</td>
                    <td className="py-4 px-6 text-right">
                      <button aria-label="Customer actions" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
          <span className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">Showing {customers.length} entries</span>
          <div className="flex gap-2">
            <button aria-label="Previous page" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button aria-label="Next page" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
