"use client";

import type { ProductView as Product } from "@/lib/serialize";
import { ProductCard } from "./ProductCard";

interface InfiniteMarqueeProps {
  products: Product[];
  reverse?: boolean;
}

export function InfiniteMarquee({ products, reverse = false }: InfiniteMarqueeProps) {
  if (!products || products.length === 0) return null;

  // Duplicate items if there are too few to fill the loop seamlessly
  const displayProducts = products.length < 6 ? [...products, ...products, ...products] : products;

  const durationStyle = { 
    animationDuration: `${Math.max(20, displayProducts.length * 5)}s`,
    willChange: 'transform'
  };

  return (
    <div className="relative w-full overflow-hidden py-12 group flex">
      <div
        className={`flex w-max ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} group-hover:[animation-play-state:paused]`}
        style={durationStyle}
      >
        <div className="flex space-x-8 pr-8">
          {displayProducts.map((item, idx) => (
            <div key={`${item.id}-${idx}-1`} className="flex-shrink-0 w-64 md:w-80">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
        
        <div className="flex space-x-8 pr-8" aria-hidden="true">
          {displayProducts.map((item, idx) => (
            <div key={`${item.id}-${idx}-2`} className="flex-shrink-0 w-64 md:w-80">
              <ProductCard item={item} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Gradient Fades on edges */}
      <div className="absolute top-0 left-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-background-light dark:from-background-dark to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-background-light dark:from-background-dark to-transparent pointer-events-none z-10"></div>
    </div>
  );
}

