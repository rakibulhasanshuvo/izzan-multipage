import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Fetch current product
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  // Fetch up to 4 other related products for upselling
  const relatedProducts = await prisma.product.findMany({
    where: {
      NOT: { id },
    },
    take: 4,
  });

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
