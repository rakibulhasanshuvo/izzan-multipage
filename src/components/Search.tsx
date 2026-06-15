"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchStorefrontProducts } from "@/app/actions/products";
import { Product } from "@/generated/client";
import Image from "next/image";
import Link from "next/link";

export function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchStorefrontProducts().then((data) => setDbProducts(data as unknown as Product[]));
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (query.trim() === "") {
      return [];
    }

    const filtered = dbProducts.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.categories.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.slice(0, 5);
  }, [query, dbProducts]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleSearch = () => setIsOpen(!isOpen);

  return (
    <>
      <button 
        onClick={toggleSearch}
        className="w-10 h-10 rounded-full flex items-center justify-center text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#607c64] dark:hover:text-[#84a98c] transition-all cursor-pointer"
        aria-label="Search Products"
      >
        <SearchIcon size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 md:px-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSearch}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="p-6 flex items-center space-x-4 border-b border-gray-100 dark:border-gray-800">
                <SearchIcon className="text-gray-400" size={24} />
                <input 
                  ref={inputRef}
                  type="text" 
                  aria-label="Search catalog"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Search for candles, oils, scents…" 
                  className="flex-1 bg-transparent border-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-md text-lg dark:text-gray-100 placeholder-gray-400 px-2"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={toggleSearch} 
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1 cursor-pointer"
                  aria-label="Close search"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4">
                {query.trim() === "" ? (
                  <div className="py-12 text-center text-gray-500">
                    <p className="text-sm uppercase tracking-widest font-semibold mb-4">Trending Scents</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Lavender", "Eucalyptus", "Sandalwood", "Amber"].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setQuery(s)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-medium hover:bg-primary hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 px-2 mb-4">Search Results</p>
                    {results.map((product) => (
                      <Link 
                        key={product.id} 
                        href={`/shop#product-${product.id}`}
                        onClick={toggleSearch}
                        className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                          <Image src={product.img} alt={product.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="font-semibold text-sm dark:text-gray-100 group-hover:text-primary transition-colors">{product.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">${product.price}</p>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <p>No results found for &ldquo;{query}&rdquo;</p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 text-center">
                <Link 
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:underline cursor-pointer inline-block"
                >
                  View All Products
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
