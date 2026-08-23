"use server";

import { prisma } from "@/lib/db";
import { serializeProductList } from "@/lib/serialize";

export async function fetchStorefrontProducts() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        img: true,
        categories: true,
      },
      orderBy: { name: "asc" },
    });
    return serializeProductList(products);
  } catch (error) {
    console.error("Failed to fetch products for search:", error);
    return [];
  }
}
