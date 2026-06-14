"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/generated/client";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { Check } from "lucide-react";

export function ProductCard({ item, onQuickView }: { item: Product; onQuickView?: (product: Product) => void }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div id={`product-${item.id}`} className="flex flex-col group w-full scroll-mt-32 h-full">
      <div className="relative w-full aspect-[3/4] mb-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.02] border border-black/[0.05] dark:border-white/[0.05] transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#607c64]/5 overflow-hidden">
        <Link href={`/product/${item.id}`} className="relative block w-full h-full select-none">
          {item.badge && (
            <div className={`absolute top-4 left-4 z-10 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] rounded-full text-white shadow-sm backdrop-blur-md ${item.badge === 'Sale' ? 'bg-red-500/80' : item.badge === 'New' ? 'bg-primary/80' : 'bg-[#607c64]/80'}`}>
              {item.badge}
            </div>
          )}

          <Image
            alt={item.name}
            className="object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
            src={item.img}
            fill
            draggable={false}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />

          {item.hoverImg && (
            <Image
              alt={`${item.name} alternate view`}
              className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out absolute inset-0"
              src={item.hoverImg}
              fill
              draggable={false}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          )}
        </Link>

        {/* Desktop-only Quick Actions Overlay (Visible on hover) */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col items-center justify-end p-4 gap-2 z-20 pointer-events-none group-hover:pointer-events-auto">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(item);
              }}
              className="w-full py-2.5 rounded-xl bg-white text-gray-800 hover:bg-gray-100 text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-md cursor-pointer border border-black/5 hover:scale-[1.02]"
            >
              Quick View
            </button>
          )}
          <button
            onClick={handleAddToCart}
            className={`w-full py-2.5 rounded-xl text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-500 translate-y-2 group-hover:translate-y-0 shadow-md flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.02] ${added ? 'bg-green-600 text-white' : 'bg-[#607c64] text-white hover:bg-[#4d6350]'}`}
          >
            <span>{added ? 'Added' : 'Quick Add'}</span>
            {added ? <Check size={14} /> : <span className="text-lg leading-none">+</span>}
          </button>
        </div>
      </div>

      <Link href={`/product/${item.id}`} className="flex flex-col flex-1 select-none">
        {/* Info Section */}
        <div className="px-1 text-center flex-1 flex flex-col justify-between">
          <div>
            <h2 className="text-sm md:text-base font-display font-semibold mb-1 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors duration-300">{item.name}</h2>
            <div className="flex items-center justify-center space-x-2 mb-4">
              {item.originalPrice && (
                <span className="text-gray-600 dark:text-gray-400 line-through text-xs md:text-sm font-light">${item.originalPrice}</span>
              )}
              <span className="text-xs md:text-sm text-gray-800 dark:text-gray-300 font-bold">${item.price}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Mobile-only visible button */}
      <div className="px-1 mt-2 md:hidden">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl text-[10px] tracking-widest uppercase font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${added ? 'bg-green-600 text-white' : 'bg-primary text-white'}`}
        >
          <span>{added ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
