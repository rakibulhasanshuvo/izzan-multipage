"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/(admin)/admin/actions";

import { Order } from "@/generated/client";

export default function OrdersTableClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);

      toast.success("Order status updated");
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      router.refresh();
    } catch (error) {
      toast.error("Error updating order");
      console.error("Error updating order:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-3xl border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
              <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest">Order ID</th>
              <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest">Customer</th>
              <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest">Date</th>
              <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-right">Amount</th>
              <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-center">Status</th>
              <th className="text-[12px] text-zinc-500 dark:text-zinc-400 py-4 px-6 font-semibold uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-[15px] text-zinc-800 dark:text-zinc-200">
            {orders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const initials = order.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
              
              return (
                <tr key={order.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100/50 dark:border-zinc-800 last:border-0 cursor-pointer">
                  <td className="py-4 px-6 font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700 flex items-center justify-center text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 tracking-wider">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-800 dark:text-zinc-100">{order.customerName}</span>
                        <span className="text-[12px] text-zinc-500 dark:text-zinc-400">{order.customerPhone || order.customerEmail || 'No contact info'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-zinc-500 dark:text-zinc-400">{dateStr}</td>
                  <td className="py-4 px-6 text-right font-medium text-zinc-900 dark:text-zinc-100">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-4 px-6 text-center">
                    <select 
                      aria-label="Update order status"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={cn(
                        "inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider border outline-none appearance-none cursor-pointer dark:bg-zinc-900",
                        order.status === "Shipped" || order.status === "Delivered" ? "bg-green-50 text-green-700 border-green-100/50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50" : 
                        order.status === "Processing" ? "bg-blue-50 text-blue-700 border-blue-100/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50" :
                        order.status === "Cancelled" ? "bg-red-50 text-red-700 border-red-100/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50" :
                        order.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-100/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50" : "bg-zinc-100 text-zinc-600 border-zinc-200/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50"
                      )}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button aria-label="More actions" className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 dark:text-zinc-400">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Footer */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
        <span className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">Showing {orders.length} orders</span>
        <div className="flex gap-2">
          <button aria-label="Previous page" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button aria-label="Next page" className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors disabled:opacity-50" disabled>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
