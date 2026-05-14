import React from "react";
import { prisma } from "@/lib/db";
import CMSManagement from "@/components/admin/CMSManagement";
import { CMSContent } from "@/generated/client";

export const dynamic = "force-dynamic";

export default async function AdminCMS() {
  const cmsContent = await prisma.cMSContent.findMany({
    orderBy: { section: "asc" },
  });

  // Group by section
  const sections = cmsContent.reduce((acc: Record<string, CMSContent[]>, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10">
        <h1 className="font-serif text-[36px] text-zinc-900 leading-tight mb-2">Content CMS</h1>
        <p className="text-[16px] text-zinc-500">
          Edit the copy and media across your boutique&apos;s storefront.
        </p>
      </div>
      
      <CMSManagement initialSections={sections} />
    </div>
  );
}
