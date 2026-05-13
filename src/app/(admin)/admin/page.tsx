import React from "react";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function AdminOverview() {
  // Fetch some real stats
  const productCount = await prisma.product.count();
  const recentProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const orderCount = await prisma.order.count();
  const customersCount = await prisma.customer.count();
  const revenueObj = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  });
  const totalRevenue = revenueObj._sum.totalAmount || 0;

  const recentOrders = await prisma.order.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="font-serif text-[36px] text-zinc-900 leading-tight mb-2">
          Performance Overview
        </h1>
        <p className="text-[16px] text-zinc-500">
          A summary of your boutique&apos;s metrics for the current period.
        </p>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Revenue Card (Real) */}
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          trend="Live"
          icon="account_balance_wallet"
        />
        {/* Orders Card (Real) */}
        <StatCard
          title="Total Orders"
          value={orderCount.toString()}
          trend="Live"
          icon="local_mall"
        />
        {/* Products Card (Real) */}
        <StatCard
          title="Active Products"
          value={productCount.toString()}
          trend="Live"
          icon="inventory_2"
        />
        {/* Customers Card (Real) */}
        <StatCard
          title="Total Customers"
          value={customersCount.toString()}
          trend="Live"
          icon="groups"
        />
      </div>

      {/* Lower Section Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Orders Table (Spans 2 columns) */}
        <div className="xl:col-span-2 bg-white/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-serif text-[28px] text-zinc-900 leading-tight">
                Recent Orders
              </h3>
              <p className="text-[15px] text-zinc-500 mt-1">
                Latest transactions across all channels.
              </p>
            </div>
            <a
              href="/admin/orders"
              className="text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest group flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_right_alt
              </span>
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr>
                  <th className="text-[12px] text-zinc-400 pb-4 font-semibold px-4 pl-0 uppercase tracking-widest">
                    Order ID
                  </th>
                  <th className="text-[12px] text-zinc-400 pb-4 font-semibold px-4 uppercase tracking-widest">
                    Customer
                  </th>
                  <th className="text-[12px] text-zinc-400 pb-4 font-semibold px-4 uppercase tracking-widest">
                    Date
                  </th>
                  <th className="text-[12px] text-zinc-400 pb-4 font-semibold px-4 text-right uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="text-[12px] text-zinc-400 pb-4 font-semibold px-4 pr-0 text-right uppercase tracking-widest">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-[15px] text-zinc-800">
                {recentOrders.map((order, i) => {
                  const dateStr = new Date(order.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" },
                  );
                  return (
                    <tr
                      key={order.id}
                      className={cn(
                        "group transition-colors",
                        i % 2 === 0 ? "bg-zinc-50/50" : "bg-transparent",
                      )}
                    >
                      <td className="py-5 px-4 pl-0 font-medium text-zinc-900 rounded-l-2xl group-hover:text-primary transition-colors">
                        #{order.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-5 px-4">{order.customerName}</td>
                      <td className="py-5 px-4 text-zinc-500">{dateStr}</td>
                      <td className="py-5 px-4 text-right font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-5 px-4 pr-0 text-right rounded-r-2xl">
                        <span
                          className={cn(
                            "inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider border",
                            order.status === "Shipped" ||
                              order.status === "Delivered"
                              ? "bg-green-50 text-green-700 border-green-100/50"
                              : order.status === "Processing"
                                ? "bg-blue-50 text-blue-700 border-blue-100/50"
                                : order.status === "Cancelled"
                                  ? "bg-red-50 text-red-700 border-red-100/50"
                                  : order.status === "Pending"
                                    ? "bg-amber-50 text-amber-700 border-amber-100/50"
                                    : "bg-zinc-100 text-zinc-600 border-zinc-200/50",
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
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No recent orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-8">
            <h3 className="font-serif text-[28px] text-zinc-900 leading-tight">
              Latest Inventory
            </h3>
            <p className="text-[15px] text-zinc-500 mt-1">
              Recently added products.
            </p>
          </div>
          <div className="space-y-6">
            {recentProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-5 group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-zinc-50/80 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/50 flex-shrink-0 shadow-sm relative">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    sizes="64px"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[16px] font-medium text-zinc-900 truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[14px] text-zinc-500 truncate mt-0.5">
                    {product.categories.split(",")[0]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-medium text-zinc-900">
                    ${product.price}
                  </p>
                  <p className="text-[12px] font-medium text-zinc-400 mt-1">
                    {product.badge || "Active"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  trend,
  icon,
}: {
  title: string;
  value: string;
  trend: string;
  icon: string;
}) {
  const isPositive = trend !== "Live" && !trend.startsWith("-");
  return (
    <div className="bg-white/80 backdrop-blur-3xl rounded-3xl p-6 border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

      <div className="flex justify-between items-start mb-8 relative z-10">
        <h3 className="text-[13px] font-semibold text-zinc-500 uppercase tracking-[0.15em]">
          {title}
        </h3>
        <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm">
          <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors text-[20px]">
            {icon}
          </span>
        </div>
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-[44px] font-serif text-zinc-900 leading-none tracking-tight">
            {value}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trend === "Live" ? (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1.5 border border-green-100/50">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>{" "}
              Live
            </span>
          ) : (
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 border",
                isPositive
                  ? "bg-green-50 text-green-700 border-green-100/50"
                  : "bg-red-50 text-red-700 border-red-100/50",
              )}
            >
              <span className="material-symbols-outlined text-[14px]">
                {isPositive ? "trending_up" : "trending_down"}
              </span>{" "}
              {trend}
            </span>
          )}
          <span className="text-[12px] text-zinc-400 font-medium">
            vs last month
          </span>
        </div>
      </div>
    </div>
  );
}
