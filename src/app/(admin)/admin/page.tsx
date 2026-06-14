import React from "react";
import { prisma } from "@/lib/db";
import OverviewClientContainer from "@/components/admin/OverviewClientContainer";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  // 1. Basic Stats
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const customersCount = await prisma.customer.count();
  
  const revenueObj = await prisma.order.aggregate({
    _sum: { totalAmount: true },
  });
  const totalRevenue = revenueObj._sum.totalAmount || 0;

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
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const monthlyRevenueObj = await prisma.order.aggregate({
    where: {
      createdAt: { gte: firstDayOfMonth },
      status: { not: "Cancelled" },
    },
    _sum: { totalAmount: true },
  });
  const currentMonthSales = monthlyRevenueObj._sum.totalAmount || 0;

  // 4. Compile Daily Chart Data Points (Past 7 Days)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = [];

  // Fetch all orders from the past 7 days to compile daily statistics
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const pastWeekOrders = await prisma.order.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: "asc" },
  });

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = weekdays[d.getDay()];
    const dateStr = `${months[d.getMonth()]} ${d.getDate()}`;

    const dayOrders = pastWeekOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getDate() === d.getDate() &&
        orderDate.getMonth() === d.getMonth() &&
        orderDate.getFullYear() === d.getFullYear()
      );
    });

    const revenue = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
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
      recentOrders={recentOrders}
      recentProducts={recentProducts}
      lowStockProducts={lowStockProducts}
      chartData={chartData}
      currentMonthSales={currentMonthSales}
      salesTarget={salesTarget}
    />
  );
}
