import { prisma } from "@/lib/db";
import HomeClient from "@/components/home/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch products
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Fetch CMS content
  const cmsItems = await prisma.cMSContent.findMany();
  const cmsMap = cmsItems.reduce((acc: Record<string, string>, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return <HomeClient products={products} cms={cmsMap} />;
}
