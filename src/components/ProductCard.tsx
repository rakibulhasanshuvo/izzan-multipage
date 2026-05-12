"use client";

import Image from "next/image";
import { Product } from "@/generated/client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Check } from "lucide-react";



export function ProductCard({ item }: { item: Product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div id={`product-${item.id}`} className="flex flex-col group w-full scroll-mt-32">
      {/* Image Container */}
      <div className="w-full aspect-[3/4] relative overflow-hidden mb-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5">
        {item.badge && (
          <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full text-white shadow-sm backdrop-blur-md ${item.badge === 'Sale' ? 'bg-red-500/80' : item.badge === 'New' ? 'bg-primary/80' : 'bg-accent-gold/80'}`}>
            {item.badge}
          </div>
        )}

        <Image
          alt={item.name}
          className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
          src={item.img}
          fill
          draggable={false}

        />

        {/* Desktop-only Quick Add Overlay (Visible on hover) */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end justify-center p-4">
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-500 translate-y-4 group-hover:translate-y-0 shadow-2xl flex items-center justify-center space-x-2 cursor-pointer ${added ? 'bg-green-600 text-white' : 'bg-white text-primary hover:bg-primary hover:text-white hover:shadow-primary/20'}`}
          >
            <span>{added ? 'Added' : 'Quick Add'}</span>
            {added ? <Check size={14} /> : <span className="text-lg leading-none">+</span>}
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-1 text-center">
        <h3 className="text-sm md:text-base font-display font-semibold mb-1 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300">{item.name}</h3>
        <div className="flex items-center justify-center space-x-2 mb-4">
          {item.originalPrice && (
            <span className="text-gray-500 line-through text-xs md:text-sm font-light">${item.originalPrice}</span>
          )}
          <span className="text-xs md:text-sm text-gray-800 dark:text-gray-300 font-bold">${item.price}</span>
        </div>

        {/* Mobile-only visible button */}
        <button
          onClick={handleAddToCart}
          className={`md:hidden w-full py-3 rounded-xl text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${added ? 'bg-green-600 text-white' : 'bg-primary text-white'}`}
        >
          <span>{added ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}


