"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/(admin)/admin/actions";
import { Order } from "@/generated/client";
import OrderDetailModal from "./OrderDetailModal";

export default function OrdersTableClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      toast.success("Order status updated");
      router.refresh();
    } catch (error) {
      toast.error("Error updating order");
      console.error("Error updating order:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Filter logic
  const filteredOrders = initialOrders.filter((order) => {
    // Search filter
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter !== "All") {
      const orderDate = new Date(order.createdAt).getTime();
      const now = new Date().getTime();
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "24h") {
        matchesDate = diffTime <= 24 * 60 * 60 * 1000;
      } else if (dateFilter === "7d") {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === "30d") {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <>
      {/* Filters & Search */}
      <div className="relative z-20 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl rounded-2xl p-4 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-wrap gap-4 items-center justify-between mb-8 transition-colors duration-300">
        <div className="flex gap-4 items-center flex-1 min-w-[300px]">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">search</span>
            <input
              aria-label="Search orders"
              type="text"
              placeholder="Search by ID, name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
            />
          </div>
          <div className="relative">
            <button 
              aria-label="Toggle filters"
              aria-expanded={showFilters}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 border rounded-xl text-[14px] font-medium transition-colors shadow-sm relative",
                showFilters || statusFilter !== "All" || dateFilter !== "All" 
                  ? "bg-zinc-900 dark:bg-primary text-white border-zinc-900 dark:border-primary hover:bg-zinc-800 dark:hover:bg-primary-dark" 
                  : "bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filters
              {(statusFilter !== "All" || dateFilter !== "All") && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary absolute -top-1 -right-1 border-2 border-white dark:border-zinc-900"></span>
              )}
            </button>
            
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-none border border-zinc-100 dark:border-zinc-800 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-5">
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2">Order Status</label>
                  <select 
                    aria-label="Filter by status"
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2">Date Range</label>
                  <select 
                    aria-label="Filter by date range"
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-[13px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="All">All Time</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>
                {(statusFilter !== "All" || dateFilter !== "All") && (
                  <button 
                    onClick={() => { setStatusFilter("All"); setDateFilter("All"); }}
                    className="w-full mt-4 text-[12px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-1 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800">{filteredOrders.length} Orders Found</span>
        </div>
      </div>

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
              {filteredOrders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const initials = order.customerName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                
                return (
                  <tr 
                    key={order.id} 
                    onClick={() => openOrderDetail(order)}
                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors border-b border-zinc-100/50 dark:border-zinc-800 last:border-0 cursor-pointer"
                  >
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
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
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
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => openOrderDetail(order)}
                        aria-label="View order details" 
                        className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 dark:text-zinc-400">No orders found matching the filter criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50">
          <span className="text-[13px] text-zinc-500 dark:text-zinc-400 font-medium">Showing {filteredOrders.length} orders</span>
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

      <OrderDetailModal 
        key={selectedOrder?.id || "none"}
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
