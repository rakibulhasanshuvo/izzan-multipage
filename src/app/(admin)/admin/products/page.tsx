import React from "react";
import { prisma } from "@/lib/db";
import { serializeProductList } from "@/lib/serialize";
import ProductManagement from "@/components/admin/ProductManagement";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.product.count(),
  ]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProductManagement initialProducts={serializeProductList(products)} totalProducts={total} />
    </div>
  );
}
