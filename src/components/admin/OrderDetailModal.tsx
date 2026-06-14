"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updateOrderTracking } from "@/app/(admin)/admin/actions";
import { Order } from "@/generated/client";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

interface ParsedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || "");
  const [trackingCarrier, setTrackingCarrier] = useState(order?.trackingCarrier || "");

  if (!isOpen || !order) return null;

  // Parse items safely
  let items: ParsedItem[] = [];
  try {
    items = JSON.parse(order.items) as ParsedItem[];
  } catch (e) {
    console.error("Failed to parse order items JSON:", e);
  }

  const handleStatusChangeInModal = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      toast.success("Order status updated");
      router.refresh();
    } catch (error) {
      toast.error("Error updating status");
      console.error(error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingTracking(true);
    try {
      await updateOrderTracking(order.id, trackingNumber, trackingCarrier);
      toast.success("Tracking information updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Error updating tracking details");
      console.error(error);
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-3xl rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white/50 dark:border-zinc-800/50 flex flex-col animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-light via-primary to-primary-dark"></div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-serif text-[28px] md:text-[32px] text-zinc-900 dark:text-zinc-100 leading-tight">
                Order #{order.id.slice(-6).toUpperCase()}
              </h3>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                  order.status === "Shipped" || order.status === "Delivered"
                    ? "bg-green-50 text-green-700 border-green-100/50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50"
                    : order.status === "Processing"
                      ? "bg-blue-50 text-blue-700 border-blue-100/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50"
                      : order.status === "Cancelled"
                        ? "bg-red-50 text-red-700 border-red-100/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50"
                        : "bg-amber-50 text-amber-700 border-amber-100/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50"
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">Placed on {dateStr}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200/50 dark:border-zinc-700 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shadow-sm"
            aria-label="Close details"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-zinc-50/30 dark:bg-zinc-950/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            {/* Left Column: Customer & Shipping Address (Spans 5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm space-y-4">
                <h4 className="font-serif text-[18px] text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  Customer & Shipping
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      Name
                    </span>
                    <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200">
                      {order.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      Contact
                    </span>
                    <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200 block">
                      📞 {order.customerPhone}
                    </span>
                    {order.customerEmail && (
                      <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200 block">
                        ✉️ {order.customerEmail}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      Detailed Address
                    </span>
                    <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200 block whitespace-pre-wrap">
                      {order.shippingAddress}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                        Upozila / Thana
                      </span>
                      <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200">
                        {order.upozila}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                        Zila / District
                      </span>
                      <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200">
                        {order.zila}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update Panel */}
              <div className="bg-white dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm space-y-4">
                <h4 className="font-serif text-[18px] text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  Fulfillment Status
                </h4>
                <div className="relative">
                  <label htmlFor="modal-status-select" className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                    Update Status
                  </label>
                  <select
                    id="modal-status-select"
                    value={order.status}
                    onChange={(e) => handleStatusChangeInModal(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-[14px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer disabled:opacity-50"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Order Items & Courier Tracking (Spans 7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Order Items Table */}
              <div className="bg-white dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm flex flex-col">
                <h4 className="font-serif text-[18px] text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">
                  Items Ordered
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        <th className="text-[11px] text-zinc-400 dark:text-zinc-500 pb-3 font-semibold uppercase tracking-widest">
                          Item Description
                        </th>
                        <th className="text-[11px] text-zinc-400 dark:text-zinc-500 pb-3 font-semibold text-center uppercase tracking-widest">
                          Price
                        </th>
                        <th className="text-[11px] text-zinc-400 dark:text-zinc-500 pb-3 font-semibold text-center uppercase tracking-widest">
                          Qty
                        </th>
                        <th className="text-[11px] text-zinc-400 dark:text-zinc-500 pb-3 font-semibold text-right uppercase tracking-widest">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px] text-zinc-800 dark:text-zinc-200">
                      {items.map((item) => (
                        <tr key={item.id} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                          <td className="py-3.5 pr-4 font-medium text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
                            {item.name}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-zinc-500 dark:text-zinc-400">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 pl-4 text-right font-medium font-mono text-zinc-900 dark:text-zinc-100">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4 bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-xl">
                  <span className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">
                    Grand Total
                  </span>
                  <span className="text-[20px] font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery & Courier Tracking Form */}
              <div className="bg-white dark:bg-zinc-900/60 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-sm">
                <h4 className="font-serif text-[18px] text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">
                  Courier Tracking
                </h4>
                <form onSubmit={handleSaveTracking} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tracking-carrier" className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                        Courier Name
                      </label>
                      <input
                        id="tracking-carrier"
                        type="text"
                        placeholder="e.g. RedX, Pathao, FedEx"
                        value={trackingCarrier}
                        onChange={(e) => setTrackingCarrier(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>
                    <div>
                      <label htmlFor="tracking-number" className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                        Tracking Code / ID
                      </label>
                      <input
                        id="tracking-number"
                        type="text"
                        placeholder="e.g. RX-9876543"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[14px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingTracking}
                      className="px-6 py-2.5 bg-zinc-900 dark:bg-primary hover:bg-zinc-800 dark:hover:bg-primary-dark text-white rounded-full text-[13px] font-semibold transition-all active:scale-95 shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isUpdatingTracking ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                          Save Tracking Info
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
