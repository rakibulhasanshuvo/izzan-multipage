"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Product } from "@/generated/client";
import { useCart } from "@/context/CartContext";
import { getProductMetadata } from "@/lib/productDetails";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const metadata = useMemo(() => getProductMetadata(product.name), [product.name]);

  const [selectedVolume, setSelectedVolume] = useState(() => 
    metadata.volumeOptions && metadata.volumeOptions.length > 0 
      ? metadata.volumeOptions[0] 
      : ""
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const itemWithOption = {
      ...product,
      name: selectedVolume ? `${product.name} (${selectedVolume})` : product.name
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(itemWithOption);
    }

    toast.success("Added to Cart!", {
      description: `${quantity}x ${product.name} ${selectedVolume ? `(${selectedVolume})` : ""} successfully added.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/5 max-w-4xl w-full max-h-[90vh] md:max-h-[85vh] overflow-y-auto flex flex-col md:flex-row z-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 text-gray-500 hover:text-gray-800 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm border border-black/5"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Left Side: Product Image */}
        <div className="md:w-1/2 relative aspect-[4/5] md:aspect-auto min-h-[300px] md:min-h-[450px] bg-black/[0.02] dark:bg-white/[0.01] flex items-center justify-center">
          <Image
            src={product.img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          {product.badge && (
            <div className={`absolute top-6 left-6 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] rounded-full text-white shadow-sm backdrop-blur-md ${product.badge === 'Sale' ? 'bg-red-500/90' : product.badge === 'New' ? 'bg-primary/90' : 'bg-[#607c64]/90'}`}>
              {product.badge}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Controls */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[#607c64] dark:text-[#84a98c] text-xs font-bold uppercase tracking-[0.25em] block mb-2">
              {product.categories.split(",")[0]}
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-2">
              {product.name}
            </h2>

            {/* Price section */}
            <div className="flex items-center space-x-3 mb-4">
              {product.originalPrice && (
                <span className="text-gray-400 line-through text-sm font-light">
                  ${product.originalPrice}
                </span>
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${product.price}
              </span>
            </div>

            {/* Scent Profile summary (if available) */}
            {metadata.scentProfile && (
              <div className="mb-6 bg-black/[0.01] dark:bg-white/[0.01] border border-black/5 dark:border-white/5 rounded-2xl p-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block mb-2">Scent Character</span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col p-1 border-r border-black/5 dark:border-white/5">
                    <span className="font-semibold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Top</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate" title={metadata.scentProfile.top}>{metadata.scentProfile.top.split(",")[0]}</span>
                  </div>
                  <div className="flex flex-col p-1 border-r border-black/5 dark:border-white/5">
                    <span className="font-semibold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Heart</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate" title={metadata.scentProfile.heart}>{metadata.scentProfile.heart.split(",")[0]}</span>
                  </div>
                  <div className="flex flex-col p-1">
                    <span className="font-semibold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Base</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate" title={metadata.scentProfile.base}>{metadata.scentProfile.base.split(",")[0]}</span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-6">
              {product.description || "Indulge in our signature blend crafted to invite comfort, focus, and a serene sense of clarity into your everyday moments."}
            </p>

            {/* Size/Volume Option Selector */}
            {metadata.volumeOptions && metadata.volumeOptions.length > 0 && (
              <div className="space-y-3 mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 block">
                  Select Volume
                </span>
                <div className="flex flex-col gap-2">
                  {metadata.volumeOptions.map((vol) => (
                    <label
                      key={vol}
                      onClick={() => setSelectedVolume(vol)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-semibold uppercase tracking-[0.1em] cursor-pointer transition-all ${
                        selectedVolume === vol
                          ? "border-[#607c64] bg-[#607c64]/5 text-[#607c64] dark:border-[#84a98c] dark:bg-[#84a98c]/5 dark:text-[#84a98c]"
                          : "border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:text-gray-700"
                      }`}
                    >
                      <span>{vol}</span>
                      <input
                        type="radio"
                        name="quickview-vol"
                        value={vol}
                        checked={selectedVolume === vol}
                        onChange={() => setSelectedVolume(vol)}
                        className="sr-only"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">
                Quantity
              </span>
              <div className="flex items-center space-x-1 bg-black/[0.03] dark:bg-white/[0.04] rounded-xl p-1 border border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-800 dark:text-gray-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#607c64] hover:bg-[#4d6350] text-white py-4 rounded-xl text-xs tracking-[0.25em] font-bold uppercase transition-all shadow-lg shadow-[#607c64]/10 cursor-pointer flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={14} />
              <span>Add to Cart - ${(product.price * quantity).toFixed(2)}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
