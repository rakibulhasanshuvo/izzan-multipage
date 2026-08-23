import React from "react";
import { prisma } from "@/lib/db";
import {
  serializeOrderList,
  serializeProductList,
  serializeDecimalSum,
} from "@/lib/serialize";
import OverviewClientContainer from "@/components/admin/OverviewClientContainer";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  // 1. Basic Stats
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const customersCount = await prisma.customer.count();

  const revenueObj = await prisma.order.aggregate({
    where: { status: { not: "Cancelled" } },
    _sum: { totalAmount: true },
  });
  const totalRevenue = serializeDecimalSum(revenueObj._sum.totalAmount);

  // 2. Fetch Lists
  const recentOrders = await prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  const recentProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lt: 10 } },
    take: 5,
  });

  // 3. Fetch monthly target sales
  const now = new Date();
  const firstDayOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const monthlyRevenueObj = await prisma.order.aggregate({
    where: {
      createdAt: { gte: firstDayOfMonth },
      status: { not: "Cancelled" },
    },
    _sum: { totalAmount: true },
  });
  const currentMonthSales = serializeDecimalSum(monthlyRevenueObj._sum.totalAmount);

  // 4. Compile Daily Chart Data Points (Past 7 Days)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = [];

  // Fetch all orders from the past 7 days to compile daily statistics
  const todayUtcStartMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weekStart = new Date(todayUtcStartMs - 6 * 24 * 60 * 60 * 1000);

  const pastWeekOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: weekStart },
      status: { not: "Cancelled" },
    },
    orderBy: { createdAt: "asc" },
  });

  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayUtcStartMs - i * 24 * 60 * 60 * 1000);
    const dayName = weekdays[d.getUTCDay()];
    const dateStr = `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;

    const dayOrders = pastWeekOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getUTCDate() === d.getUTCDate() &&
        orderDate.getUTCMonth() === d.getUTCMonth() &&
        orderDate.getUTCFullYear() === d.getUTCFullYear()
      );
    });

    const revenue = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const ordersCount = dayOrders.length;

    chartData.push({
      label: dayName,
      revenue,
      orders: ordersCount,
      dateStr,
    });
  }

  // Monthly Target Parameter (Boutique target)
  const salesTarget = 1500;

  return (
    <OverviewClientContainer
      productCount={productCount}
      orderCount={orderCount}
      customersCount={customersCount}
      totalRevenue={totalRevenue}
      recentOrders={serializeOrderList(recentOrders)}
      recentProducts={serializeProductList(recentProducts)}
      lowStockProducts={serializeProductList(lowStockProducts)}
      chartData={chartData}
      currentMonthSales={currentMonthSales}
      salesTarget={salesTarget}
    />
  );
}
