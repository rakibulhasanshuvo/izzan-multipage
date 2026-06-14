"use server";

import { prisma } from "@/lib/db";

export async function fetchStorefrontProducts() {
  try {
    return await prisma.product.findMany({
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
  } catch (error) {
    console.error("Failed to fetch products for search:", error);
    return [];
  }
}
