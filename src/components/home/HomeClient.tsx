"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Product } from "@/generated/client";
import { ProductCard } from "@/components/ProductCard";
import { Search as SearchIcon, SlidersHorizontal, ArrowUpDown, ArrowRight, Leaf, Droplet, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuickViewModal from "@/components/shop/QuickViewModal";

// Sub-components for details
import { Hero } from "@/components/sections/Hero";
import { Pillars } from "@/components/sections/Pillars";
import { Spotlight } from "@/components/sections/Spotlight";
import { Story } from "@/components/sections/Story";
import { Testimonials } from "@/components/sections/Testimonials";
import { Community } from "@/components/sections/Community";

const INGREDIENTS_DATA = [
  {
    id: "soy-wax",
    label: "Natural Soy Wax",
    icon: Leaf,
    title: "Natural Soy Wax Base",
    subtitle: "Clean & Sustainable Slow-Burn",
    description: "Sourced from renewable, domestic, non-GMO soy fields, our clean soy wax burns cleaner and longer. Unlike paraffin (petroleum) bases, it does not release harmful soot or toxins, creating a healthy environment for your senses.",
    benefits: [
      "100% natural, biodegradable & renewable",
      "Up to 50% longer burn time than paraffin",
      "Clean-burning with zero petrol-carbon soot",
      "Water-soluble for easy jar repurposing"
    ],
    stat: "100% Vegan",
    tagline: "Eco-friendly base",
    badgeColor: "bg-[#607c64]/10 text-[#607c64] dark:bg-[#84a98c]/10 dark:text-[#84a98c]"
  },
  {
    id: "botanical-oils",
    label: "Botanical Oils",
    icon: Droplet,
    title: "Pure Botanical Oils",
    subtitle: "Steam-Distilled & Therapeutic",
    description: "Every scent formulation is crafted from premium botanical extracts, pure steam-distilled essential oils, and phthalate-free fragrance oils. These clean oils deliver an authentic, aromatherapy-grade throw.",
    benefits: [
      "Sustainably harvested plant extracts",
      "Strictly paraben & phthalate-free",
      "Aromatherapy-aligned wellness benefits",
      "Multi-layered, rich scent throw"
    ],
    stat: "Phthalate-Free",
    tagline: "Therapeutic essence",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
  },
  {
    id: "wood-wicks",
    label: "Wood Wicks",
    icon: Flame,
    title: "Crackle Wood Wicks",
    subtitle: "FSC-Certified Organic Soundscape",
    description: "Handcrafted from natural, FSC-certified organic wood, our wicks produce a gentle, relaxing crackling sound that evokes the cozy feel of a hearth. They ensure a wider melt pool, optimizing scent release.",
    benefits: [
      "FSC-certified organic wood",
      "Soothing ambient crackling fireplace sound",
      "Uniform heat distribution & even wax melt",
      "No chemical pre-treatments or lead cores"
    ],
    stat: "FSC Certified",
    tagline: "Soothing crackle",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300"
  },
  {
    id: "amber-vessels",
    label: "Amber Vessels",
    icon: Sparkles,
    title: "Amber Glass Vessels",
    subtitle: "UV-Protective Apothecary Glass",
    description: "Housed in signature UV-protective amber glass apothecary jars. Designed to filter light, preserving the delicate essential oils from breaking down, while remaining infinitely reusable or recyclable.",
    benefits: [
      "Protective UV-filtering amber tint",
      "Infinitely recyclable & reusable",
      "Heat-resistant apothecary design",
      "Elegant home decor addition"
    ],
    stat: "100% Recyclable",
    tagline: "UV-protective glass",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
  }
];

interface HomeClientProps {
  products: Product[];
  cms: Record<string, string>;
}

export default function HomeClient({ products, cms }: HomeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeIngredientTab, setActiveIngredientTab] = useState("soy-wax");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Categories list
  const categories = ["All", "Best Sellers", "New Arrivals", "Sale"];

  // Filter and Sort products
  const processedProducts = useMemo(() => {
    let filtered = [...products];

    // 1. Category Filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.categories.includes(selectedCategory));
    }

    // 2. Search Query Filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    // 3. Sort Logic
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const visibleProducts = useMemo(() => processedProducts.slice(0, 5), [processedProducts]);

  const testimonialImages = useMemo(() => [
    cms.testimonial_1_img,
    cms.testimonial_2_img,
    cms.testimonial_3_img
  ].filter(Boolean), [cms]);

  const communityImages = useMemo(() => [
    cms.community_1_img,
    cms.community_2_img,
    cms.community_3_img,
    cms.community_4_img,
    cms.community_5_img
  ].filter(Boolean), [cms]);

  const spotlightProduct = useMemo(() => 
    products.find(p => p.name.toLowerCase().includes("lavender drift")) || null
  , [products]);

  return (
    <div className="space-y-0 animate-in fade-in duration-700">
      {/* Portfolio Hero */}
      <Hero 
        title={cms.hero_title} 
        subtitle={cms.hero_subtitle} 
        videoUrl={cms.hero_video_url} 
        posterUrl={cms.hero_video_poster} 
      />
      
      {/* Core Brand Pillars */}
      <Pillars images={[cms.pillar_1_img, cms.pillar_2_img, cms.pillar_3_img].filter(Boolean)} />
      
      {/* Portfolio Catalog Section */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 min-h-[70vh]">
        <div className="text-center mb-10">
          <span className="text-[#607c64] dark:text-[#84a98c] font-bold tracking-[0.25em] uppercase text-xs mb-2 block">
            Handcrafted Scent Portfolio
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-zinc-900 dark:text-gray-100">
            {selectedCategory === "All" ? "The Storefront" : selectedCategory}
          </h2>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-gray-200 dark:border-gray-800 mb-10">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-[0.1em] transition-all cursor-pointer ${
                  selectedCategory === category
                    ? "bg-[#607c64] text-white shadow-lg shadow-[#607c64]/20"
                    : "bg-black/[0.03] dark:bg-white/[0.04] text-gray-600 dark:text-gray-400 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search and Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* Live Search Input */}
            <div className="relative flex-1 sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <SearchIcon size={18} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#607c64]/20 focus:border-[#607c64] transition-all text-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative min-w-[160px] flex items-center bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2.5">
              <span className="text-gray-400 mr-2">
                <ArrowUpDown size={16} />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm text-gray-700 dark:text-gray-300 focus:outline-none w-full font-medium cursor-pointer"
                aria-label="Sort products"
              >
                <option value="default" className="dark:bg-zinc-900">Sort: Default</option>
                <option value="price-low" className="dark:bg-zinc-900">Price: Low to High</option>
                <option value="price-high" className="dark:bg-zinc-900">Price: High to Low</option>
                <option value="newest" className="dark:bg-zinc-900">Newest</option>
              </select>
            </div>

          </div>
        </div>

        {/* Product Grid / Empty State */}
        {processedProducts.length === 0 ? (
          <div className="text-center py-20 bg-black/[0.01] dark:bg-white/[0.01] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <SlidersHorizontal size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">No products found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setSortBy("default");
              }}
              className="mt-6 bg-[#607c64] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] hover:bg-opacity-90 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div>
            <div className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6 px-1 flex justify-between items-center">
              <span>Showing {visibleProducts.length} of {processedProducts.length} product{processedProducts.length === 1 ? "" : "s"}</span>
            </div>
            
            <motion.div 
              layout
              className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {visibleProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard item={product} onQuickView={setQuickViewProduct} />
                </motion.div>
              ))}
            </motion.div>

            {/* Explore Shop CTA button */}
            {processedProducts.length > 5 && (
              <div className="flex justify-center mt-12">
                <Link
                  href={selectedCategory === "All" ? "/shop" : `/shop?category=${encodeURIComponent(selectedCategory)}`}
                  className="group inline-flex items-center space-x-3 px-10 py-4 border border-[#607c64]/20 text-[#607c64] rounded-full font-bold tracking-[0.2em] text-xs md:text-sm uppercase hover:bg-[#607c64] hover:text-white hover:border-[#607c64] transition-all duration-500 hover:shadow-lg hover:shadow-[#607c64]/10 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-700"
                >
                  <span>Explore Full Collection</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* E-Commerce Value Props Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 pt-12 border-t border-gray-200 dark:border-gray-800 text-center">
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#607c64]/10 text-[#607c64] flex items-center justify-center mb-4 font-bold text-lg">100%</div>
            <h4 className="font-semibold text-base mb-1 dark:text-gray-200">Natural Ingredients</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Handmade with premium soy wax and therapeutic-grade essential oils.</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#607c64]/10 text-[#607c64] flex items-center justify-center mb-4 font-bold text-lg">🚀</div>
            <h4 className="font-semibold text-base mb-1 dark:text-gray-200">Free Express Delivery</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Complimentary tracked shipping on all orders over $50 nationwide.</p>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#607c64]/10 text-[#607c64] flex items-center justify-center mb-4 font-bold text-lg">✨</div>
            <h4 className="font-semibold text-base mb-1 dark:text-gray-200">Small-Batch Crafted</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Poured in small batches in our studio to preserve scent integrity.</p>
          </div>
        </div>
      </div>

      {/* Cinematic Spotlight Video */}
      <Spotlight product={spotlightProduct} videoUrl={cms.spotlight_video} />
      
      {/* Brand Story Preview */}
      <div className="relative py-8 bg-background-light dark:bg-background-dark transition-colors duration-300">
        <Story title={cms.story_title} content={cms.story_content} imgUrl={cms.story_img} />
        <div className="flex justify-center -mt-8 mb-16 relative z-10">
          <Link
            href="/story"
            className="group inline-flex items-center space-x-3 px-10 py-4 border border-[#607c64]/20 text-[#607c64] rounded-full font-bold tracking-[0.2em] text-xs md:text-sm uppercase hover:bg-[#607c64] hover:text-white hover:border-[#607c64] transition-all duration-500 hover:shadow-lg hover:shadow-[#607c64]/10 cursor-pointer"
          >
            <span>Read Our Full Story</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Ingredients & Materials Showcase */}
      <div className="py-24 bg-zinc-50 dark:bg-zinc-900/40 border-y border-gray-100 dark:border-gray-800/50 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-[#607c64] dark:text-[#84a98c] font-bold tracking-[0.25em] uppercase text-xs mb-2 block">
              Pure Craftsmanship
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-zinc-900 dark:text-gray-100">
              Our Ingredients & Materials
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto font-light leading-relaxed">
              We conscientiously source and meticulously blend every element to create clean-burning wellness rituals.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12">
            {INGREDIENTS_DATA.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeIngredientTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveIngredientTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3.5 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-[#607c64] text-white shadow-lg shadow-[#607c64]/20 scale-105"
                      : "bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700/50 border border-gray-100 dark:border-gray-800"
                  }`}
                >
                  <IconComponent size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab content panel */}
          <div className="relative min-h-[380px] bg-white dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800/70 rounded-3xl p-8 md:p-12 shadow-sm backdrop-blur-sm">
            <AnimatePresence mode="wait">
              {INGREDIENTS_DATA.map((tab) => {
                if (tab.id !== activeIngredientTab) return null;
                const IconComponent = tab.icon;
                return (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                  >
                    <div className="lg:col-span-7 space-y-6">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3.5 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-bold ${tab.badgeColor}`}>
                          {tab.tagline}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <span className="text-xs font-semibold tracking-wider text-[#607c64] dark:text-[#84a98c]">
                          {tab.stat}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-3xl font-display font-semibold text-zinc-900 dark:text-gray-100 mb-2">
                          {tab.title}
                        </h3>
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">
                          {tab.subtitle}
                        </h4>
                      </div>

                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                        {tab.description}
                      </p>

                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {tab.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start space-x-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-[#607c64] dark:text-[#84a98c] mt-0.5 font-bold">✓</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="lg:col-span-5 flex justify-center">
                      <div className="relative w-full aspect-square max-w-[280px] rounded-3xl bg-gradient-to-tr from-[#607c64]/5 to-[#607c64]/20 dark:from-zinc-800 dark:to-zinc-700/30 border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center p-8 text-center shadow-inner group">
                        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-zinc-800 text-[#607c64] dark:text-[#84a98c] flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-500">
                          <IconComponent size={36} />
                        </div>
                        <span className="text-xs tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 font-bold mb-1">
                          Craft Standard
                        </span>
                        <div className="text-xl font-display font-semibold text-zinc-800 dark:text-zinc-200">
                          {tab.stat}
                        </div>
                        <div className="absolute inset-x-8 bottom-6 border-t border-gray-100 dark:border-zinc-800/50 pt-4">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-normal">
                            Zero animal testing, non-toxic formulations, consciously handcrafted.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Testimonials (Social Proof) */}
      {testimonialImages.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800/50 pt-4 bg-secondary-light/20 dark:bg-secondary-dark/20">
          <Testimonials images={testimonialImages} />
        </div>
      )}

      {/* Community Gallery (Instagram Wall) */}
      {communityImages.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800/50 py-16 bg-background-light dark:bg-background-dark transition-colors duration-300">
          <div className="text-center mb-8 px-6">
            <h2 className="text-3xl font-display dark:text-gray-100 font-semibold">Our Community</h2>
            <p className="text-sm text-gray-500 mt-2 font-light">Tag us @izzan_moment to share your moment of calm.</p>
          </div>
          <Community images={communityImages} />
        </div>
      )}

      {/* Quick View Modal Container */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
