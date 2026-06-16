"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Sun, Moon, ArrowRight, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";
import { Search } from "./Search";
import { useMounted } from "@/hooks/useMounted";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useMounted();
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();

  const isShop = pathname === "/shop" || pathname.startsWith("/product/");
  const isStory = pathname === "/story";
  const isSupport = pathname === "/contact";

  return (
    <>
      <div className="w-full bg-[#607c64] dark:bg-[#2d3730] text-white text-[10px] md:text-xs py-2 px-4 text-center flex flex-wrap justify-center items-center tracking-[0.2em] uppercase font-bold transition-colors">
        <span className="break-words text-center">Free Shipping on orders over $50</span> <ArrowRight size={12} className="ml-2 shrink-0" />
      </div>
      <header className="w-full bg-white/85 dark:bg-[#1a1f1b]/85 backdrop-blur-md sticky top-0 z-50 py-4 px-4 md:px-8 lg:px-12 border-b border-black/5 dark:border-white/5 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center relative z-20">
          
          {/* Logo & Mobile Menu Hamburger Icon */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors focus:outline-none cursor-pointer"
              aria-label="Open Menu"
            >
              <Menu size={20} />
            </button>
            <Link 
              href="/" 
              className="font-display text-xl md:text-2xl uppercase tracking-[0.25em] font-semibold text-gray-900 dark:text-gray-100 hover:opacity-85 transition-opacity cursor-pointer select-none"
            >
              Izzan
            </Link>
          </div>

          {/* Nav Links with dynamic active state & sliding underlines */}
          <nav className="hidden md:flex space-x-10">
            <Link 
              href="/shop" 
              className={`text-xs md:text-[13px] tracking-[0.22em] font-black uppercase relative py-1 transition-all ${
                isShop 
                  ? "text-[#607c64] dark:text-[#84a98c] after:w-full" 
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 after:w-0"
              } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#607c64] dark:after:bg-[#84a98c] after:transition-all after:duration-300 hover:after:w-full`}
            >
              Shop
            </Link>
            <Link 
              href="/story" 
              className={`text-xs md:text-[13px] tracking-[0.22em] font-black uppercase relative py-1 transition-all ${
                isStory 
                  ? "text-[#607c64] dark:text-[#84a98c] after:w-full" 
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 after:w-0"
              } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#607c64] dark:after:bg-[#84a98c] after:transition-all after:duration-300 hover:after:w-full`}
            >
              Story
            </Link>
            <Link 
              href="/contact" 
              className={`text-xs md:text-[13px] tracking-[0.22em] font-black uppercase relative py-1 transition-all ${
                isSupport 
                  ? "text-[#607c64] dark:text-[#84a98c] after:w-full" 
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 after:w-0"
              } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#607c64] dark:after:bg-[#84a98c] after:transition-all after:duration-300 hover:after:w-full`}
            >
              Support
            </Link>
          </nav>

          {/* Right Action Icons with Tactile Circular Hover Frames */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <Search />

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="w-10 h-10 rounded-full flex items-center justify-center text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#607c64] dark:hover:text-[#84a98c] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <button
              onClick={toggleCart}
              className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-text-light dark:text-text-dark hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#607c64] dark:hover:text-[#84a98c] transition-all relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={18} />
              {mounted && cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-[#607c64] dark:bg-[#84a98c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-md">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[120] bg-black/40 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="md:hidden fixed top-0 left-0 h-full w-64 bg-background-light dark:bg-[#1a1f1b] z-[130] shadow-2xl p-6 flex flex-col space-y-6"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
                <span className="font-display text-lg uppercase tracking-[0.2em] font-semibold text-gray-900 dark:text-gray-100">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-gray-500"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/shop"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold tracking-widest uppercase py-2 border-b border-black/5 dark:border-white/5 ${
                    isShop ? "text-[#607c64] dark:text-[#84a98c]" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Shop
                </Link>
                <Link
                  href="/story"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold tracking-widest uppercase py-2 border-b border-black/5 dark:border-white/5 ${
                    isStory ? "text-[#607c64] dark:text-[#84a98c]" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Story
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-bold tracking-widest uppercase py-2 border-b border-black/5 dark:border-white/5 ${
                    isSupport ? "text-[#607c64] dark:text-[#84a98c]" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  Support
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
