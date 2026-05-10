"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CollectionDrawer } from "@/components/CollectionDrawer";
import { Product } from "@/generated/client";

// Sections
import { Hero } from "@/components/sections/Hero";
import { Pillars } from "@/components/sections/Pillars";
import { ShopSection } from "@/components/sections/ShopSection";
import { Spotlight } from "@/components/sections/Spotlight";
import { Story } from "@/components/sections/Story";
import { Features } from "@/components/sections/Features";
import { CareGuide } from "@/components/sections/CareGuide";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Community } from "@/components/sections/Community";
import { ContactSection } from "@/components/sections/ContactSection";

interface HomeClientProps {
  products: Product[];
  cms: Record<string, string>;
}

export default function HomeClient({ products, cms }: HomeClientProps) {
  const [drawerContent, setDrawerContent] = useState<{ title: string; products: Product[] } | null>(null);

  const bestSellers = useMemo(() => products.filter(p => p.categories.includes("Best Sellers")), [products]);
  const newArrivals = useMemo(() => products.filter(p => p.categories.includes("New Arrivals")), [products]);
  const saleItems = useMemo(() => products.filter(p => p.categories.includes("Sale")), [products]);

  const handleExplore = useCallback((title: string, products: Product[]) => {
    setDrawerContent({ title, products });
  }, []);

  return (
    <>
      <Header onViewAllProducts={useCallback(() => handleExplore("Full Collection", products), [handleExplore, products])} />
      <main className="flex-1">
        <Hero title={cms.hero_title} subtitle={cms.hero_subtitle} videoUrl={cms.hero_video_url} posterUrl={cms.hero_video_poster} />
        <Pillars images={[cms.pillar_1_img, cms.pillar_2_img, cms.pillar_3_img].filter(Boolean)} />
        <ShopSection
          bestSellers={bestSellers}
          newArrivals={newArrivals}
          saleItems={saleItems}
          onExplore={handleExplore}
        />
        <Spotlight imgUrl={cms.spotlight_img} />
        <Story title={cms.story_title} content={cms.story_content} imgUrl={cms.story_img} />
        <Features />
        <CareGuide />
        <Testimonials images={[cms.testimonial_1_img, cms.testimonial_2_img, cms.testimonial_3_img].filter(Boolean)} />
        <FAQ />
        <Community images={[cms.community_1_img, cms.community_2_img, cms.community_3_img, cms.community_4_img, cms.community_5_img].filter(Boolean)} />
        <ContactSection />
      </main>
      <Footer />
      <CollectionDrawer
        isOpen={!!drawerContent}
        onClose={() => setDrawerContent(null)}
        title={drawerContent?.title || ""}
        products={drawerContent?.products || []}
      />
    </>
  );
}
