import React from "react";
import { prisma } from "@/lib/db";
import ProductManagement from "@/components/admin/ProductManagement";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ProductManagement initialProducts={products} />
    </div>
  );
}
