"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Product } from "@/generated/client";
import { ProductCard } from "@/components/ProductCard";
import ScentQuiz from "@/components/shop/ScentQuiz";
import QuickViewModal from "@/components/shop/QuickViewModal";
import { Search as SearchIcon, SlidersHorizontal, ArrowUpDown, X, Tag, Percent, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { toast } from "sonner";

interface ShopPageClientProps {
  initialProducts: Product[];
}

function ShopContent({ initialProducts }: ShopPageClientProps) {
  const searchParams = useSearchParams();
  
  // Search & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Advanced Filters state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() === "") return;
    setIsNewsletterSubmitted(true);
    toast.success("Successfully subscribed to our newsletter!");
  };

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileFilterOpen]);

  // Read URL query parameters
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      if (["Best Sellers", "New Arrivals", "Sale"].includes(categoryParam)) {
        setTimeout(() => {
          setSelectedCollections([categoryParam]);
        }, 0);
      } else {
        setTimeout(() => {
          setSelectedTypes([categoryParam]);
        }, 0);
      }
    }
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setTimeout(() => {
        setSearchQuery(searchParam);
      }, 0);
    }
  }, [searchParams]);

  // Helper: Get Scent Family programmatically
  const getScentFamily = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("lavender") || n.includes("jasmine") || n.includes("rose") || n.includes("blossom") || n.includes("sage") || n.includes("sweetgrass")) return "floral";
    if (n.includes("amber") || n.includes("sandalwood") || n.includes("cedar") || n.includes("pine") || n.includes("patchouli") || n.includes("fig")) return "woody";
    if (n.includes("citrus") || n.includes("grove") || n.includes("lemongrass") || n.includes("bergamot")) return "citrus";
    if (n.includes("eucalyptus") || n.includes("mint") || n.includes("tea tree") || n.includes("peppermint") || n.includes("breeze")) return "fresh";
    if (n.includes("vanilla") || n.includes("cinnamon") || n.includes("plum") || n.includes("oak")) return "spicy";
    return "other";
  };

  // Helper: Get Product Type programmatically
  const getProductType = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("oil")) return "Essential Oils";
    if (n.includes("diffuser") || n.includes("salt")) return "Mist Diffusers";
    return "Candles";
  };

  // Process filters
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Search filter
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // 2. Product Type filter
    if (selectedTypes.length > 0) {
      result = result.filter(p => selectedTypes.includes(getProductType(p.name)));
    }

    // 3. Collection filter
    if (selectedCollections.length > 0) {
      result = result.filter(p => selectedCollections.some(c => p.categories.includes(c)));
    }

    // 4. Scent Family filter
    if (selectedScents.length > 0) {
      result = result.filter(p => selectedScents.includes(getScentFamily(p.name)));
    }

    // 5. Price Range filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter(p => {
        return selectedPriceRanges.some(range => {
          if (range === "under-25") return p.price < 25;
          if (range === "25-40") return p.price >= 25 && p.price <= 40;
          if (range === "over-40") return p.price > 40;
          return true;
        });
      });
    }

    // 6. In Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort Logic
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [initialProducts, searchQuery, selectedTypes, selectedCollections, selectedScents, selectedPriceRanges, inStockOnly, sortBy]);

  // Handler for Scent Quiz recommendations filter
  const handleScentQuizMatch = (scentFamily: string) => {
    if (scentFamily === "All") {
      setSelectedScents([]);
    } else {
      setSelectedScents([scentFamily]);
    }
    setShowQuiz(false);
    setIsMobileFilterOpen(false);
  };

  const handleToggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleToggleCollection = (col: string) => {
    setSelectedCollections(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleToggleScent = (scent: string) => {
    setSelectedScents(prev => 
      prev.includes(scent) ? prev.filter(s => s !== scent) : [...prev, scent]
    );
  };

  const handleTogglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) ? prev.filter(r => r !== range) : [...prev, range]
    );
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
    setSelectedCollections([]);
    setSelectedScents([]);
    setSelectedPriceRanges([]);
    setInStockOnly(false);
    setSearchQuery("");
    setSortBy("default");
  };

  const hasActiveFilters = 
    selectedTypes.length > 0 || 
    selectedCollections.length > 0 || 
    selectedScents.length > 0 || 
    selectedPriceRanges.length > 0 || 
    inStockOnly || 
    searchQuery !== "";

  const activeFiltersCount = 
    selectedTypes.length + 
    selectedCollections.length + 
    selectedScents.length + 
    selectedPriceRanges.length + 
    (inStockOnly ? 1 : 0);

  const categoriesList = ["All", "Candles", "Essential Oils", "Mist Diffusers"];

  const renderFilters = () => (
    <>
      {/* Scent Finder Quiz Collapsible Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
            Scent Finder
          </h2>
          <button
            onClick={() => setShowQuiz(!showQuiz)}
            className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#607c64] dark:text-[#84a98c] cursor-pointer hover:underline"
          >
            {showQuiz ? "Hide Quiz" : "Take Quiz"}
          </button>
        </div>
        
        <AnimatePresence mode="wait">
          {showQuiz ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ScentQuiz products={initialProducts} onFilterMatch={handleScentQuizMatch} />
            </motion.div>
          ) : (
            <button
              onClick={() => setShowQuiz(true)}
              className="w-full p-4 rounded-2xl border border-dashed border-[#607c64]/20 hover:border-[#607c64] hover:bg-[#607c64]/5 dark:hover:bg-[#84a98c]/5 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#607c64] dark:text-[#84a98c] transition-all cursor-pointer"
            >
              ✨ Take Scent Match Quiz
            </button>
          )}
        </AnimatePresence>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* Product Type Filter */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          Product Type
        </h2>
        <div className="flex flex-col gap-2">
          {["Candles", "Essential Oils", "Mist Diffusers"].map((type) => (
            <label key={type} className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                id={`filter-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
                name="filter-type"
                checked={selectedTypes.includes(type)}
                onChange={() => handleToggleType(type)}
                className="w-4.5 h-4.5 rounded border-gray-300 text-[#607c64] focus:ring-[#607c64] cursor-pointer"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Collections Filter */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          Collections
        </h2>
        <div className="flex flex-col gap-2">
          {["Best Sellers", "New Arrivals", "Sale"].map((col) => (
            <label key={col} className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                id={`filter-collection-${col.toLowerCase().replace(/\s+/g, "-")}`}
                name="filter-collection"
                checked={selectedCollections.includes(col)}
                onChange={() => handleToggleCollection(col)}
                className="w-4.5 h-4.5 rounded border-gray-300 text-[#607c64] focus:ring-[#607c64] cursor-pointer"
              />
              <span>{col}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Scent Family Filter */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          Scent Profile
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { label: "Floral & Botanical", value: "floral" },
            { label: "Woody & Earthy", value: "woody" },
            { label: "Citrus & Fruit", value: "citrus" },
            { label: "Fresh & Minty", value: "fresh" },
            { label: "Warm & Spicy", value: "spicy" }
          ].map((s) => (
            <label key={s.value} className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                id={`filter-scent-${s.value}`}
                name="filter-scent"
                checked={selectedScents.includes(s.value)}
                onChange={() => handleToggleScent(s.value)}
                className="w-4.5 h-4.5 rounded border-gray-300 text-[#607c64] focus:ring-[#607c64] cursor-pointer"
              />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          Price Range
        </h2>
        <div className="flex flex-col gap-2">
          {[
            { label: "Under $25", value: "under-25" },
            { label: "$25 to $40", value: "25-40" },
            { label: "Over $40", value: "over-40" }
          ].map((r) => (
            <label key={r.value} className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none">
              <input
                type="checkbox"
                id={`filter-price-${r.value}`}
                name="filter-price"
                checked={selectedPriceRanges.includes(r.value)}
                onChange={() => handleTogglePriceRange(r.value)}
                className="w-4.5 h-4.5 rounded border-gray-300 text-[#607c64] focus:ring-[#607c64] cursor-pointer"
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability Toggle */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400 cursor-pointer select-none">
          <input
            type="checkbox"
            id="filter-availability"
            name="filter-availability"
            checked={inStockOnly}
            onChange={() => setInStockOnly(!inStockOnly)}
            className="w-4.5 h-4.5 rounded border-gray-300 text-[#607c64] focus:ring-[#607c64] cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-10 min-h-[80vh] transition-colors duration-300">
      
      {/* Premium Hero Promo Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-[#607c64]/20 to-[#607c64]/5 border border-[#607c64]/10 dark:border-white/5 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 min-h-[180px] transition-all">
        <div className="max-w-xl text-center md:text-left">
          <span className="text-[#607c64] dark:text-[#84a98c] font-bold tracking-[0.25em] uppercase text-[10px] md:text-xs mb-2 block">
            Izzan Boutique Collection
          </span>
          <h1 className="text-3xl md:text-4xl font-display font-semibold mb-3 text-zinc-900 dark:text-gray-100">
            The Scent Apothecary
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-light text-xs md:text-sm leading-relaxed">
            Curate your space with botanically-derived aromatics. Refine by scent profile, price, and vessel size to find the sensory match tailored to your ritual goals.
          </p>
        </div>

        {/* Promotional Code Card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-[#607c64]/10 dark:border-white/10 rounded-2xl p-5 w-full md:w-80 shadow-md text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-[#607c64]/10 text-[#607c64] flex items-center justify-center mb-3">
            <Percent size={18} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-1">First Order Offer</span>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Save 15% on All Aromatics</span>
          <div className="mt-3 px-4 py-1.5 rounded-lg border border-dashed border-[#607c64]/30 bg-[#607c64]/5 text-xs font-bold tracking-widest text-[#607c64] dark:text-[#84a98c]">
            CALM15
          </div>
        </div>
      </div>

      {/* Quick Category Scroll Ribbon */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-6 scroll-smooth select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {categoriesList.map((cat) => {
          const isActive = cat === "All" ? selectedTypes.length === 0 : selectedTypes.includes(cat) && selectedTypes.length === 1;
          return (
            <button
              key={cat}
              onClick={() => {
                if (cat === "All") {
                  setSelectedTypes([]);
                } else {
                  setSelectedTypes([cat]);
                }
              }}
              className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all border cursor-pointer ${
                isActive
                  ? "bg-[#607c64] border-[#607c64] text-white shadow-md shadow-[#607c64]/10"
                  : "bg-white dark:bg-zinc-900 border-black/5 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Left Column: Sticky Advanced Filter Sidebar (Desktop-Only) */}
        <aside className="hidden lg:block w-80 flex-shrink-0 space-y-8 sticky top-28 h-[fit-content] max-h-[85vh] overflow-y-auto pr-2 pb-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
          {renderFilters()}
        </aside>

        {/* Right Column: Grid and Filter Results */}
        <main className="flex-grow">
          
          {/* Controls Toolbar (Desktop & Mobile) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-gray-800 mb-6">
            
            {/* Active search bar */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <SearchIcon size={18} />
              </span>
              <input
                type="text"
                id="search-catalog"
                name="search-catalog"
                aria-label="Search catalog"
                autoComplete="off"
                spellCheck={false}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog…"
                className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-full py-2.5 pl-11 pr-4 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#607c64] transition-all text-gray-800 dark:text-gray-200 font-medium"
              />
            </div>

            {/* Mobile Toolbar Trigger (Filters Drawer button + Sort Pill) */}
            <div className="flex lg:hidden items-center justify-between gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-full py-2.5 px-5 text-xs font-bold uppercase tracking-[0.1em] text-gray-700 dark:text-gray-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all cursor-pointer relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#607c64]"
              >
                <SlidersHorizontal size={14} />
                <span>Filters & Quiz</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#607c64] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="relative flex items-center bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-full px-3 py-2.5 max-w-[130px] flex-shrink-0">
                <span className="text-gray-400 mr-1.5 flex-shrink-0">
                  <ArrowUpDown size={14} />
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-[10px] uppercase font-bold tracking-[0.05em] text-gray-700 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md w-full cursor-pointer pr-1"
                  aria-label="Sort products on mobile"
                >
                  <option value="default" className="dark:bg-zinc-900">Default</option>
                  <option value="price-low" className="dark:bg-zinc-900">Price: Low</option>
                  <option value="price-high" className="dark:bg-zinc-900">Price: High</option>
                  <option value="newest" className="dark:bg-zinc-900">Newest</option>
                </select>
              </div>
            </div>

            {/* Sort selector on desktop */}
            <div className="hidden lg:flex relative min-w-[160px] items-center bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-full px-4 py-2.5">
              <span className="text-gray-400 mr-2">
                <ArrowUpDown size={16} />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md w-full font-medium cursor-pointer"
                aria-label="Sort products"
              >
                <option value="default" className="dark:bg-zinc-900">Sort: Default</option>
                <option value="price-low" className="dark:bg-zinc-900">Price: Low to High</option>
                <option value="price-high" className="dark:bg-zinc-900">Price: High to Low</option>
                <option value="newest" className="dark:bg-zinc-900">Newest</option>
              </select>
            </div>

          </div>

          {/* Active Filter Tags Row */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 flex items-center gap-1 mr-1">
                <Tag size={10} />
                Filters:
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button onClick={() => setSearchQuery("")} className="cursor-pointer hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-0.5">
                    <X size={10} />
                  </button>
                </span>
              )}

              {selectedTypes.map(t => (
                <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  Type: {t}
                  <button onClick={() => handleToggleType(t)} className="cursor-pointer hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}

              {selectedCollections.map(c => (
                <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  Collection: {c}
                  <button onClick={() => handleToggleCollection(c)} className="cursor-pointer hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}

              {selectedScents.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#607c64]/5 border border-[#607c64]/10 text-[10px] font-semibold text-[#607c64] dark:text-[#84a98c]">
                  Scent: {s.toUpperCase()}
                  <button onClick={() => handleToggleScent(s)} className="cursor-pointer hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}

              {selectedPriceRanges.map(r => (
                <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  Price: {r === "under-25" ? "Under $25" : r === "25-40" ? "$25 - $40" : "Over $40"}
                  <button onClick={() => handleTogglePriceRange(r)} className="cursor-pointer hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}

              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="cursor-pointer hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearAll}
                className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-500 hover:text-red-700 cursor-pointer ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid / Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-black/[0.01] dark:bg-white/[0.01] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
              <SlidersHorizontal size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">No matching products found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try widening your price range or adjusting active filter selections.</p>
              <button
                onClick={handleClearAll}
                className="mt-6 bg-[#607c64] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] hover:bg-opacity-90 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 px-1">
                Showing {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
              </div>

              <motion.div 
                layout
                className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredProducts.map((product) => (
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
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer (Filters Panel) */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <FocusTrap focusTrapOptions={{ fallbackFocus: "body", escapeDeactivates: false }}>
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end" role="dialog" aria-modal="true" aria-label="Filters Panel">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileFilterOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="relative w-full max-w-sm h-full bg-white dark:bg-[#1a1f1b] shadow-2xl flex flex-col z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={16} className="text-[#607c64]" />
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-100">
                      Filters & Quiz
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer"
                    aria-label="Close filters drawer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Filters Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-24 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-black/10 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded">
                  {renderFilters()}
                </div>

                {/* Footer Drawer CTA */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/95 dark:bg-[#1a1f1b]/95 backdrop-blur border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        handleClearAll();
                        setIsMobileFilterOpen(false);
                      }}
                      className="flex-1 py-3 border border-red-200 text-red-500 rounded-xl text-xs font-bold uppercase tracking-[0.1em] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="flex-1 py-3 bg-[#607c64] hover:bg-[#4d6350] text-white rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer text-center shadow-md shadow-[#607c64]/10"
                  >
                    Show Results ({filteredProducts.length})
                  </button>
                </div>
              </motion.div>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>

      {/* Inline Lead-Capture Newsletter Box */}
      <div className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-800/80">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#607c64]/5 to-transparent border border-[#607c64]/10 dark:border-white/5 p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm backdrop-blur-sm">
          <div className="absolute inset-0 bg-white/30 dark:bg-zinc-900/10 backdrop-blur-md -z-10" />
          
          <div className="max-w-xl mx-auto space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#607c64]/10 text-[#607c64] dark:text-[#84a98c] flex items-center justify-center mx-auto">
              <Mail size={20} />
            </div>
            
            <AnimatePresence mode="wait">
              {!isNewsletterSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-display font-semibold text-zinc-900 dark:text-gray-100">
                    Join The Quiet Ritual
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed max-w-md mx-auto">
                    Subscribe to receive notes on small-batch drops, botanical sourcing journeys, and get 15% off your first addition.
                  </p>
                  
                  <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                    <input
                      type="email"
                      id="newsletter-email"
                      name="newsletter-email"
                      required
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="Enter your email address…"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-grow px-5 py-3.5 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#607c64] transition-all text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    <button
                      type="submit"
                      className="bg-[#607c64] hover:bg-[#4d6350] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-[0.1em] transition-all cursor-pointer shadow-md shadow-[#607c64]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#607c64]"
                    >
                      Subscribe
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4 py-4"
                >
                  <h3 className="text-2xl font-display font-semibold text-[#607c64] dark:text-[#84a98c]">
                    Welcome to the Circle
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-md mx-auto">
                    Thank you for subscribing! As promised, here is your 15% off coupon code for your first sanctuary addition:
                  </p>
                  <div className="inline-block px-6 py-2 border border-dashed border-[#607c64] dark:border-[#84a98c] bg-[#607c64]/5 rounded-xl font-bold tracking-[0.2em] text-[#607c64] dark:text-[#84a98c] text-sm md:text-base animate-pulse">
                    CALM15
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Check your inbox for a confirmation and details on our next release.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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

export default function ShopPageClient({ initialProducts }: ShopPageClientProps) {
  return (
    <Suspense fallback={
      <div className="h-[70vh] flex flex-col gap-4 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#607c64]"></div>
        <div className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-bold animate-pulse">Loading…</div>
      </div>
    }>
      <ShopContent initialProducts={initialProducts} />
    </Suspense>
  );
}
