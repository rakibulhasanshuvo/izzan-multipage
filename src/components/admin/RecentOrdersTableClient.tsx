"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Order } from "@/generated/client";
import OrderDetailModal from "./OrderDetailModal";

export default function RecentOrdersTableClient({ recentOrders }: { recentOrders: Order[] }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr>
              <th className="text-[12px] text-zinc-400 dark:text-zinc-500 pb-4 font-semibold px-4 pl-0 uppercase tracking-widest">
                Order ID
              </th>
              <th className="text-[12px] text-zinc-400 dark:text-zinc-500 pb-4 font-semibold px-4 uppercase tracking-widest">
                Customer
              </th>
              <th className="text-[12px] text-zinc-400 dark:text-zinc-500 pb-4 font-semibold px-4 uppercase tracking-widest">
                Date
              </th>
              <th className="text-[12px] text-zinc-400 dark:text-zinc-500 pb-4 font-semibold px-4 text-right uppercase tracking-widest">
                Amount
              </th>
              <th className="text-[12px] text-zinc-400 dark:text-zinc-500 pb-4 font-semibold px-4 pr-0 text-right uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="text-[15px] text-zinc-800 dark:text-zinc-200">
            {recentOrders.map((order, i) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              );
              return (
                <tr
                  key={order.id}
                  onClick={() => handleRowClick(order)}
                  className={cn(
                    "group transition-colors cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/80",
                    i % 2 === 0 ? "bg-zinc-50/50 dark:bg-zinc-800/50" : "bg-transparent",
                  )}
                >
                  <td className="py-5 px-4 pl-0 font-medium text-zinc-900 dark:text-zinc-100 rounded-l-2xl group-hover:text-primary transition-colors">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-5 px-4">{order.customerName}</td>
                  <td className="py-5 px-4 text-zinc-500 dark:text-zinc-400">{dateStr}</td>
                  <td className="py-5 px-4 text-right font-medium">
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-5 px-4 pr-0 text-right rounded-r-2xl">
                    <span
                      className={cn(
                        "inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider border",
                        order.status === "Shipped" ||
                          order.status === "Delivered"
                          ? "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100/50 dark:border-green-500/20"
                          : order.status === "Processing"
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100/50 dark:border-blue-500/20"
                            : order.status === "Cancelled"
                              ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100/50 dark:border-red-500/20"
                              : order.status === "Pending"
                                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100/50 dark:border-amber-500/20"
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/50 dark:border-zinc-700/50",
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 dark:text-zinc-400">
                  No recent orders.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </>
  );
}
