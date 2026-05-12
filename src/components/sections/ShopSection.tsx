"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

import { Product } from "@/generated/client";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
};

interface ShopSectionProps {
  bestSellers: Product[];
  newArrivals: Product[];
  saleItems: Product[];
  onExplore: (title: string, products: Product[]) => void;
}

const tabs = [
  { id: "best-sellers", label: "Best Sellers" },
  { id: "new-arrivals", label: "New Arrivals" },
  { id: "sale", label: "Sale" },
];

export function ShopSection({ bestSellers, newArrivals, saleItems, onExplore }: ShopSectionProps) {
  const [activeTab, setActiveTab] = useState("best-sellers");

  const productMap: Record<string, { products: Product[]; title: string }> = {
    "best-sellers": { products: bestSellers, title: "Our Best Sellers" },
    "new-arrivals": { products: newArrivals, title: "Fresh Drops" },
    "sale": { products: saleItems, title: "Special Offers" },
  };

  const { products: activeProducts, title: activeTitle } = productMap[activeTab];
  const displayProducts = activeProducts.slice(0, 12);

  return (
    <section id="shop" className="pt-16 pb-24 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.span variants={fadeIn} className="text-[#607c64] font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
            Curated for You
          </motion.span>
          <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl font-display mb-4 dark:text-gray-100">
            Our Collection
          </motion.h2>
          <motion.p variants={fadeIn} className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto font-light leading-relaxed text-sm">
            Every product is crafted with intention — pure ingredients, timeless design, and scents that transform your space.
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 md:px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-[0.15em] rounded-full transition-colors duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#607c64] rounded-full shadow-lg shadow-[#607c64]/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={staggerContainer}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6"
          >
            {displayProducts.map((product) => (
              <motion.div key={product.id} variants={cardVariant}>
                <ProductCard item={product} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <button
            onClick={() => onExplore(activeTitle, activeProducts)}
            className="group inline-flex items-center space-x-3 px-10 py-4 border border-[#607c64]/20 text-[#607c64] rounded-full font-bold tracking-[0.2em] text-xs md:text-sm uppercase hover:bg-[#607c64] hover:text-white hover:border-[#607c64] transition-all duration-500 hover:shadow-lg hover:shadow-[#607c64]/10 cursor-pointer"
          >
            <span>View All {tabs.find(t => t.id === activeTab)?.label}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
