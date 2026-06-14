"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import OverviewChart from "./OverviewChart";
import SalesTargetTracker from "./SalesTargetTracker";
import RecentOrdersTableClient from "./RecentOrdersTableClient";
import Image from "next/image";
import { Order, Product } from "@/generated/client";

interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
  dateStr: string;
}

interface OverviewClientContainerProps {
  // Stats
  productCount: number;
  orderCount: number;
  customersCount: number;
  totalRevenue: number;
  
  // Lists
  recentOrders: Order[];
  recentProducts: Product[];
  lowStockProducts: Product[];
  
  // Chart & Target
  chartData: ChartDataPoint[];
  currentMonthSales: number;
  salesTarget: number;
}

export default function OverviewClientContainer({
  productCount,
  orderCount,
  customersCount,
  totalRevenue,
  recentOrders,
  recentProducts,
  lowStockProducts,
  chartData,
  currentMonthSales,
  salesTarget,
}: OverviewClientContainerProps) {
  const [activeMetric, setActiveMetric] = useState<"revenue" | "orders">("revenue");

  // Determine top sales zila if any orders exist
  const zilaCounts = recentOrders.reduce((acc: Record<string, number>, order) => {
    if (order.zila) {
      acc[order.zila] = (acc[order.zila] || 0) + 1;
    }
    return acc;
  }, {});
  const topZila = Object.entries(zilaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative">
      {/* Decorative ambient background mesh glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-1/4 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      {/* Page Header */}
      <div>
        <h1 className="font-serif text-[36px] text-zinc-900 dark:text-zinc-100 leading-tight mb-2">
          Performance Overview
        </h1>
        <p className="text-[16px] text-zinc-500 dark:text-zinc-400">
          A live look at your boutique&apos;s operations, sales targets, and inventory.
        </p>
      </div>

      {/* Analytics Bento Grid (Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <InteractiveStatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          isActive={activeMetric === "revenue"}
          onClick={() => setActiveMetric("revenue")}
          icon="account_balance_wallet"
          trend="Live"
          sparklineTrend="up"
        />

        {/* Orders Card */}
        <InteractiveStatCard
          title="Total Orders"
          value={orderCount.toString()}
          isActive={activeMetric === "orders"}
          onClick={() => setActiveMetric("orders")}
          icon="local_mall"
          trend="Live"
          sparklineTrend="up"
        />

        {/* Products Card */}
        <InteractiveStatCard
          title="Active Products"
          value={productCount.toString()}
          icon="inventory_2"
          trend="In Stock"
          sparklineTrend="flat"
        />

        {/* Customers Card */}
        <InteractiveStatCard
          title="Total Customers"
          value={customersCount.toString()}
          icon="groups"
          trend="Active"
          sparklineTrend="up"
        />
      </div>

      {/* Main Analysis Section: Chart + Target Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <OverviewChart data={chartData} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <SalesTargetTracker currentSales={currentMonthSales} target={salesTarget} />
        </div>
      </div>

      {/* Lower Dashboard Section: Recent Orders + Live Insights Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Recent Orders Card */}
        <div className="xl:col-span-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-full">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-serif text-[24px] md:text-[28px] text-zinc-900 dark:text-zinc-100 leading-tight">
                Recent Transactions
              </h3>
              <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">
                Latest customer purchases across all regions.
              </p>
            </div>
            <a
              href="/admin/orders"
              className="text-[13px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors uppercase tracking-widest group flex items-center gap-1.5 cursor-pointer"
            >
              View All
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_right_alt
              </span>
            </a>
          </div>
          <RecentOrdersTableClient recentOrders={recentOrders} />
        </div>

        {/* Store Insights Panel */}
        <div className="xl:col-span-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-6">
          <div>
            <h3 className="font-serif text-[24px] md:text-[28px] text-zinc-900 dark:text-zinc-100 leading-tight">
              Boutique Insights
            </h3>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mt-1">
              Automated operational diagnostics.
            </p>
          </div>

          <div className="space-y-4">
            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 ? (
              <div className="flex gap-4 p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-2xl">
                <span className="material-symbols-outlined text-red-600 dark:text-red-400 flex-shrink-0 text-[24px] mt-0.5">
                  warning
                </span>
                <div>
                  <h4 className="text-[14px] font-semibold text-red-800 dark:text-red-300">
                    Low Stock Alerts
                  </h4>
                  <p className="text-[13px] text-red-700/80 dark:text-red-400/80 mt-1">
                    {lowStockProducts.slice(0, 2).map(p => p.name).join(", ")}
                    {lowStockProducts.length > 2 && ` and ${lowStockProducts.length - 2} more`} are running critically low on stock.
                  </p>
                  <a
                    href="/admin/products"
                    className="text-[12px] font-semibold text-red-800 dark:text-red-300 underline mt-2 block hover:opacity-85"
                  >
                    Restock Inventory
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 p-4 bg-green-50/50 dark:bg-green-950/10 border border-green-100/30 dark:border-green-900/20 rounded-2xl">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 flex-shrink-0 text-[24px]">
                  check_circle
                </span>
                <div>
                  <h4 className="text-[14px] font-semibold text-green-800 dark:text-green-300">
                    Inventory Healthy
                  </h4>
                  <p className="text-[13px] text-green-700/80 dark:text-green-400/80 mt-0.5">
                    All products are safely above minimum stock parameters.
                  </p>
                </div>
              </div>
            )}

            {/* Geographical Hotspot */}
            <div className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150/40 dark:border-zinc-800 rounded-2xl">
              <span className="material-symbols-outlined text-zinc-500 dark:text-zinc-400 flex-shrink-0 text-[24px]">
                explore
              </span>
              <div>
                <h4 className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-200">
                  Top Sales Region
                </h4>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {topZila !== "None yet" ? `Highest concentration of deliveries is in ${topZila}.` : "No regional orders recorded yet."}
                </p>
              </div>
            </div>

            {/* Recently Added Products List */}
            <div className="pt-2">
              <h4 className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-3 block">
                Recently Restocked
              </h4>
              <div className="space-y-4">
                {recentProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-1 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-850 flex-shrink-0 relative">
                      <Image
                        src={product.img}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[13.5px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {product.name}
                      </h5>
                      <span className="text-[11.5px] text-zinc-400 dark:text-zinc-500">
                        {product.stock} units in stock
                      </span>
                    </div>
                    <span className="text-[13.5px] font-medium font-mono text-zinc-800 dark:text-zinc-200">
                      ${product.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InteractiveStatCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
  sparklineTrend: "up" | "down" | "flat";
  isActive?: boolean;
  onClick?: () => void;
}

function InteractiveStatCard({
  title,
  value,
  icon,
  trend,
  sparklineTrend,
  isActive = false,
  onClick,
}: InteractiveStatCardProps) {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-3xl p-6 border shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group transition-all duration-500 relative overflow-hidden select-none",
        isClickable ? "cursor-pointer" : "",
        isActive
          ? "border-primary dark:border-primary -translate-y-1 shadow-[0_20px_40px_rgba(99,102,241,0.08)] bg-primary/[0.02] dark:bg-primary/[0.01]"
          : "border-white dark:border-zinc-850 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]"
      )}
    >
      {/* Subtle ambient light gradient background for active card */}
      {isActive && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl transition-colors duration-500"></div>
      )}

      <div className="flex justify-between items-start mb-6 relative z-10">
        <h3 className="text-[12px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em]">
          {title}
        </h3>
        <div className={cn(
          "w-9 h-9 rounded-full border flex items-center justify-center transition-transform duration-500 shadow-sm",
          isActive 
            ? "bg-primary border-primary text-white scale-110" 
            : "bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-750 text-zinc-400 dark:text-zinc-500 group-hover:scale-110"
        )}>
          <span className="material-symbols-outlined text-[18px]">
            {icon}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between gap-4">
        <div>
          <span className="text-[36px] font-serif text-zinc-900 dark:text-zinc-100 leading-none tracking-tight block mb-3 font-semibold">
            {value}
          </span>
          <span className="inline-flex px-2.5 py-1 bg-green-50/50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-[10.5px] font-semibold border border-green-100/50 dark:border-green-900/30 items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></span>
            {trend}
          </span>
        </div>

        {/* Micro Sparkline line */}
        <svg className="w-16 h-8 opacity-40 dark:opacity-30 group-hover:opacity-75 transition-opacity flex-shrink-0" viewBox="0 0 60 20">
          <path
            d={
              sparklineTrend === "up" 
                ? "M 0 16 Q 15 6, 30 11 T 60 2" 
                : sparklineTrend === "down" 
                  ? "M 0 2 Q 15 14, 30 9 T 60 18" 
                  : "M 0 10 Q 15 9, 30 11 T 60 10"
            }
            fill="none"
            className="stroke-primary dark:stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
