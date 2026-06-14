"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/generated/client";
import { useCart } from "@/context/CartContext";
import { getProductMetadata } from "@/lib/productDetails";
import { ProductCard } from "@/components/ProductCard";
import { Plus, Minus, ShoppingBag, ArrowLeft, ChevronDown, ChevronUp, Star, Leaf, CheckCircle, ShieldCheck, Award, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import FocusTrap from "focus-trap-react";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

interface UserReview {
  id: number;
  name: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const metadata = useMemo(() => getProductMetadata(product.name), [product.name]);

  const [selectedVolume, setSelectedVolume] = useState(() => 
    metadata.volumeOptions && metadata.volumeOptions.length > 0 
      ? metadata.volumeOptions[0] 
      : ""
  );
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>("ingredients");

  // Interactive reviews state
  const [reviews, setReviews] = useState<UserReview[]>([
    {
      id: 1,
      name: "Sarah L.",
      rating: 5,
      date: "May 24, 2026",
      title: "Absolutely divine scent",
      comment: "The amber wood notes make my master bedroom feel like a luxury spa retreat. The burn is incredibly clean and slow.",
      verified: true,
    },
    {
      id: 2,
      name: "Marcus K.",
      rating: 4,
      date: "June 02, 2026",
      title: "Delicate and refreshing",
      comment: "The bergamot is wonderfully clean. I use this mist diffuser oil in my office and it aids my focus significantly.",
      verified: true,
    },
    {
      id: 3,
      name: "Elena R.",
      rating: 5,
      date: "June 09, 2026",
      title: "Top-tier quality",
      comment: "Truly natural and slow-burning candle. Most other candles trigger my allergies, but Izzan is clean and botanical.",
      verified: true,
    }
  ]);

  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);

  // New review form state
  const [newName, setNewName] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");

  // Prevent body scroll when review drawer is open
  useEffect(() => {
    if (isWriteReviewOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isWriteReviewOpen]);

  const handleAddToCart = () => {
    const itemWithOption = {
      ...product,
      name: `${product.name} (${selectedVolume})`
    };
    
    for (let i = 0; i < quantity; i++) {
      addToCart(itemWithOption);
    }

    toast.success("Added to Cart!", {
      description: `${quantity}x ${product.name} (${selectedVolume}) successfully added.`
    });
  };

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const handleWriteReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newTitle || !newComment) {
      toast.error("Please fill in all fields.");
      return;
    }

    const newReview: UserReview = {
      id: reviews.length + 1,
      name: newName,
      rating: newRating,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      }),
      title: newTitle,
      comment: newComment,
      verified: true
    };

    setReviews(prev => [newReview, ...prev]);
    toast.success("Review Submitted!", {
      description: "Thank you for sharing your feedback with the community."
    });

    // Reset fields
    setNewName("");
    setNewRating(5);
    setNewTitle("");
    setNewComment("");
    setIsWriteReviewOpen(false);
  };

  // Stats calculation
  const statsAverage = useMemo(() => {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 transition-colors duration-300">
      
      {/* Back to Shop Navigation Link */}
      <div className="mb-8">
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-primary transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shop Collection
        </Link>
      </div>

      {/* Main PDP Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-6 lg:sticky lg:top-28">
          <div className="relative w-full min-h-[350px] xs:min-h-[400px] md:min-h-0 md:aspect-[3/4] rounded-3xl overflow-hidden bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] shadow-lg group" style={{ position: "relative" }}>
            <Image
              src={product.img}
              alt={product.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.badge && (
              <div className="absolute top-6 left-6 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] rounded-full text-white shadow-sm bg-[#607c64]/90 backdrop-blur-sm">
                {product.badge}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Information & Options */}
        <div className="lg:col-span-6 flex flex-col space-y-8">
          
          {/* Header Title & Pricing */}
          <div>
            <span className="text-[#607c64] dark:text-[#84a98c] text-xs font-bold uppercase tracking-[0.3em] block mb-2">
              {product.categories.split(",")[0]}
            </span>
            <h1 className="text-3xl md:text-5xl font-display font-semibold mb-4 text-zinc-900 dark:text-gray-100 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-3 mb-2">
              {product.originalPrice && (
                <span className="text-gray-500 line-through text-lg font-light">${product.originalPrice}</span>
              )}
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${product.price}</span>
            </div>

            {/* Stars Summary */}
            <div className="flex items-center space-x-2.5 text-xs text-gray-550 dark:text-gray-400 select-none">
              <div className="flex text-[#d4af37]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={14} 
                    fill={s <= Math.round(Number(statsAverage)) ? "currentColor" : "none"} 
                    className="text-[#d4af37] stroke-[1.5]" 
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{statsAverage}</span>
              <span className="text-gray-300">|</span>
              <a href="#reviews" className="hover:underline hover:text-[#607c64] dark:hover:text-[#84a98c]">
                {reviews.length} Verified Review{reviews.length === 1 ? "" : "s"}
              </a>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-gray-500 dark:text-gray-400 font-light text-sm md:text-base leading-relaxed">
            {product.description || "Indulge in a premium scent experience. Mindfully crafted with clean ingredients to bring an ambient calm to your living spaces."}
          </p>

          {/* Scent Profile Highlight */}
          {metadata.scentProfile && (
            <div className="p-6 bg-gradient-to-br from-[#607c64]/5 to-transparent border border-[#607c64]/10 dark:border-white/5 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#607c64] dark:text-[#84a98c] block mb-4">
                Scent Notes
              </span>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em] mb-1">Top</span>
                  <span className="text-xs md:text-sm font-medium dark:text-gray-200">{metadata.scentProfile.top}</span>
                </div>
                <div className="flex flex-col border-x border-gray-200 dark:border-gray-800 px-2">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em] mb-1">Heart</span>
                  <span className="text-xs md:text-sm font-medium dark:text-gray-200">{metadata.scentProfile.heart}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-gray-400 font-bold tracking-[0.1em] mb-1">Base</span>
                  <span className="text-xs md:text-sm font-medium dark:text-gray-200">{metadata.scentProfile.base}</span>
                </div>
              </div>
            </div>
          )}

          {/* Volume Options Selection */}
          {metadata.volumeOptions && metadata.volumeOptions.length > 0 && (
            <div className="space-y-3">
              <label className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 block">
                Select Option / Size
              </label>
              <div className="flex flex-col gap-2">
                {metadata.volumeOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVolume(opt)}
                    className={`w-full text-left px-5 py-4 border rounded-xl text-xs md:text-sm transition-all cursor-pointer flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selectedVolume === opt
                        ? "border-[#607c64] bg-[#607c64]/5 dark:bg-[#607c64]/10 font-bold text-[#607c64] dark:text-[#84a98c]"
                        : "border-gray-200 dark:border-gray-850 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedVolume === opt && <span className="text-sm">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Buy Panel */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-2">
            
            {/* Quantity Selector */}
            <div className="flex items-center justify-between border border-gray-200 dark:border-gray-850 rounded-xl px-2 h-14 w-full sm:w-36 bg-black/[0.01] dark:bg-white/[0.01]">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold dark:text-gray-100">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#607c64] text-white hover:bg-opacity-95 font-bold uppercase tracking-[0.2em] text-xs md:text-sm h-14 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#607c64]/15 active:scale-[0.99] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ShoppingBag size={16} />
              Add to Cart
            </button>
          </div>

          {/* Trust Badges Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl select-none">
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <Leaf size={16} className="text-[#607c64] flex-shrink-0" />
              <span className="font-semibold">Natural Soy Wax</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <CheckCircle size={16} className="text-[#607c64] flex-shrink-0" />
              <span className="font-semibold">Vegan & Cruelty-Free</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <ShieldCheck size={16} className="text-[#607c64] flex-shrink-0" />
              <span className="font-semibold">Phthalate-Free Oils</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <Award size={16} className="text-[#607c64] flex-shrink-0" />
              <span className="font-semibold">Recyclable Glass</span>
            </div>
          </div>

          {/* Scent Specifications & Detail Accordions */}
          <div className="border-t border-gray-250 dark:border-gray-850 pt-4 space-y-2">
                       {/* Accordion: Ingredients */}
            <div className="border-b border-gray-200 dark:border-gray-850 py-3">
              <button
                onClick={() => toggleAccordion("ingredients")}
                aria-expanded={activeAccordion === "ingredients"}
                className="w-full flex justify-between items-center text-xs md:text-sm uppercase tracking-widest font-bold text-gray-700 dark:text-gray-300 hover:text-[#607c64] dark:hover:text-[#84a98c] transition-colors py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Ingredients & Details</span>
                {activeAccordion === "ingredients" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {activeAccordion === "ingredients" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light"
                  >
                    <p className="mb-2">{metadata.ingredients}</p>
                    {metadata.burnTime && (
                      <p className="font-semibold text-zinc-850 dark:text-zinc-200 mt-2">Burn Time: <span className="font-light">{metadata.burnTime}</span></p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion: Scent Ritual / Care Guide */}
            <div className="border-b border-gray-200 dark:border-gray-850 py-3">
              <button
                onClick={() => toggleAccordion("ritual")}
                aria-expanded={activeAccordion === "ritual"}
                className="w-full flex justify-between items-center text-xs md:text-sm uppercase tracking-widest font-bold text-gray-700 dark:text-gray-300 hover:text-[#607c64] dark:hover:text-[#84a98c] transition-colors py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Scent Ritual (Care Guide)</span>
                {activeAccordion === "ritual" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {activeAccordion === "ritual" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light"
                  >
                    <p>{metadata.ritual}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Accordion: Shipping & Returns */}
            <div className="border-b border-gray-200 dark:border-gray-850 py-3">
              <button
                onClick={() => toggleAccordion("shipping")}
                aria-expanded={activeAccordion === "shipping"}
                className="w-full flex justify-between items-center text-xs md:text-sm uppercase tracking-widest font-bold text-gray-700 dark:text-gray-300 hover:text-[#607c64] dark:hover:text-[#84a98c] transition-colors py-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>Shipping & Returns</span>
                {activeAccordion === "shipping" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <AnimatePresence>
                {activeAccordion === "shipping" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light"
                  >
                    <p>Free standard shipping on all orders over $50 nationwide. Standard delivery takes 3 to 5 business days. Returns are accepted within 14 days of delivery on all unused and unopened items.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="reviews" className="mt-28 border-t border-gray-250 dark:border-gray-850 pt-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Reviews Rating Graph */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 block">Customer Feedback</span>
            <h2 className="text-3xl font-display font-semibold dark:text-gray-100">Reviews Summary</h2>
            <div className="flex items-center space-x-3 select-none">
              <span className="text-5xl font-bold text-zinc-900 dark:text-gray-100">{statsAverage}</span>
              <div className="flex flex-col">
                <div className="flex text-[#d4af37]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={16} 
                      fill={s <= Math.round(Number(statsAverage)) ? "currentColor" : "none"} 
                      className="text-[#d4af37] stroke-[1.5]" 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium mt-1">Based on {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
              </div>
            </div>

            {/* Star Rating Bars */}
            <div className="space-y-2 pt-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percentage = ((count / reviews.length) * 100).toFixed(0);
                return (
                  <div key={stars} className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
                    <span className="w-12 text-right">{stars} star</span>
                    <div className="flex-1 h-2 bg-black/[0.03] dark:bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full bg-[#607c64]/80 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-left">{percentage}%</span>
                  </div>
                );
              })}
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="w-full mt-6 py-3 border border-[#607c64] text-[#607c64] hover:bg-[#607c64]/5 dark:text-[#84a98c] dark:border-[#84a98c] dark:hover:bg-[#84a98c]/5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Write a Review
            </button>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Verified Reviews List</span>
              <span className="text-xs text-gray-400">{reviews.length} Review{reviews.length === 1 ? "" : "s"}</span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800/40 space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{rev.name}</span>
                      {rev.verified && (
                        <span className="bg-[#607c64]/10 text-[#607c64] dark:text-[#84a98c] text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.1em] scale-90">
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{rev.date}</span>
                  </div>

                  <div className="flex text-[#d4af37] select-none">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={12} 
                        fill={s <= rev.rating ? "currentColor" : "none"} 
                        className="text-[#d4af37] stroke-[1.5]" 
                      />
                    ))}
                  </div>

                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-150">{rev.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Upsell Segment: You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="mt-28 border-t border-gray-200 dark:border-gray-850 pt-16">
          <div className="text-center mb-12">
            <span className="text-[#607c64] dark:text-[#84a98c] text-xs font-bold uppercase tracking-[0.25em] block mb-2">
              Curated Recommendations
            </span>
            <h2 className="text-3xl font-display dark:text-gray-100 font-semibold">You May Also Like</h2>
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <div key={item.id}>
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write a Review slide-out Drawer */}
      <AnimatePresence>
        {isWriteReviewOpen && (
          <FocusTrap focusTrapOptions={{ fallbackFocus: "body", escapeDeactivates: false }}>
            <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Write a Review">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsWriteReviewOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="relative w-full max-w-md h-full bg-white dark:bg-[#1a1f1b] shadow-2xl flex flex-col z-10"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Star size={16} fill="currentColor" className="text-[#d4af37] stroke-none animate-pulse" />
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-800 dark:text-gray-100">
                      Write a Review
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsWriteReviewOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-all text-gray-500 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Close review drawer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Form (Scrollable) */}
                <form onSubmit={handleWriteReviewSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 pb-24">
                  
                  {/* Rating selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block">Your Rating</label>
                    <div className="flex space-x-2 text-[#d4af37] select-none">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setNewRating(s)}
                          className="hover:scale-110 transition-transform cursor-pointer text-[#d4af37] p-1"
                        >
                          <Star size={24} fill={s <= newRating ? "currentColor" : "none"} className="stroke-[1.5]" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="space-y-1">
                    <label htmlFor="reviewer-name" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block">Your Name</label>
                    <input
                      id="reviewer-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Eleanor R."
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-all text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  {/* Review Title */}
                  <div className="space-y-1">
                    <label htmlFor="review-title" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block">Review Summary</label>
                    <input
                      id="review-title"
                      type="text"
                      required
                      autoComplete="off"
                      placeholder="e.g. Clean burn, beautiful fragrance"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-all text-gray-800 dark:text-gray-200"
                    />
                  </div>

                  {/* Review Body Comment */}
                  <div className="space-y-1">
                    <label htmlFor="review-comment" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 block">Review Details</label>
                    <textarea
                      id="review-comment"
                      required
                      autoComplete="off"
                      rows={5}
                      placeholder="Share your experience with this botanical blend…"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-black/[0.02] dark:bg-white/[0.04] border border-gray-200 dark:border-gray-800 rounded-xl py-3 px-4 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus:border-transparent transition-all text-gray-800 dark:text-gray-200 leading-relaxed"
                    />
                  </div>

                  {/* Action submit button */}
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#607c64] hover:bg-[#4d6350] text-white rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer shadow-md shadow-[#607c64]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Submit Review
                  </button>

                </form>
              </motion.div>
            </div>
          </FocusTrap>
        )}
      </AnimatePresence>

    </div>
  );
}
