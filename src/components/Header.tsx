"use client";

import Link from "next/link";
import { ShoppingCart, Sun, Moon, Menu, X, ArrowRight, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";
import { Search } from "./Search";
import FocusTrap from "focus-trap-react";

interface HeaderProps {
  onViewAllProducts?: () => void;
}

export function Header({ onViewAllProducts }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cartCount, toggleCart } = useCart();

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <div className="w-full bg-primary text-white text-xs md:text-sm py-2 text-center flex justify-center items-center tracking-widest uppercase font-bold">
        Free Shipping on orders over $50 <ArrowRight size={14} className="ml-2" />
      </div>
      <header className="w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50 py-4 px-6 md:px-12 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center relative z-20">
          <Link href="/" onClick={closeMenu} className="text-3xl md:text-4xl font-logo text-text-light dark:text-text-dark">
            Izzan
          </Link>
          <nav className="hidden md:flex space-x-10">
            <Link href="/#shop" className="text-[11px] tracking-[0.2em] font-bold uppercase hover:text-primary transition-colors">Shop</Link>
            <Link href="/#story" className="text-[11px] tracking-[0.2em] font-bold uppercase hover:text-primary transition-colors">Story</Link>
            <Link href="/#discover" className="text-[11px] tracking-[0.2em] font-bold uppercase hover:text-primary transition-colors">Discover</Link>
            <Link href="/#reviews" className="text-[11px] tracking-[0.2em] font-bold uppercase hover:text-primary transition-colors">Reviews</Link>
          </nav>
          <div className="flex items-center space-x-4 md:space-x-6">
            <Search onViewAll={onViewAllProducts} />

            <button className="hidden sm:block text-text-light dark:text-text-dark hover:text-primary transition-colors" aria-label="User Account">
              <User size={20} />
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="text-text-light dark:text-text-dark hover:text-primary transition-colors cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
            <button
              onClick={toggleCart}
              className="text-text-light dark:text-text-dark hover:text-primary transition-colors relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={20} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden text-text-light dark:text-text-dark hover:text-primary transition-colors"
              aria-label="Toggle mobile menu"
              onClick={toggleMenu}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <FocusTrap focusTrapOptions={{ fallbackFocus: "body", escapeDeactivates: false }}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden absolute top-full left-0 right-0 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg z-10"
                role="dialog"
                aria-modal="true"
                aria-label="Mobile Menu"
              >
              <nav className="flex flex-col px-8 py-6 space-y-8">
                <Link href="/#shop" onClick={closeMenu} className="text-sm tracking-widest uppercase hover:text-primary transition-colors">Shop</Link>
                <Link href="/#story" onClick={closeMenu} className="text-sm tracking-widest uppercase hover:text-primary transition-colors">Story</Link>
                <Link href="/#discover" onClick={closeMenu} className="text-sm tracking-widest uppercase hover:text-primary transition-colors">Discover</Link>
                <Link href="/#reviews" onClick={closeMenu} className="text-sm tracking-widest uppercase hover:text-primary transition-colors">Reviews</Link>
              </nav>
              </motion.div>
            </FocusTrap>
          )}
        </AnimatePresence>
      </header>
      <CartDrawer />
    </>
  );
}
