import { prisma } from "@/lib/db";
import ShopPageClient from "@/components/shop/ShopPageClient";

export const revalidate = 60;

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ShopPageClient initialProducts={products} />;
}
