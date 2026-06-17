"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, BookOpen, Phone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { useMounted } from "@/hooks/useMounted";

export function BottomNavbar() {
  const pathname = usePathname();
  const { cartCount, toggleCart, isCartOpen } = useCart();
  const mounted = useMounted();

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: ShoppingBag,
      isActive: pathname === "/shop" || pathname.startsWith("/product/"),
    },
    {
      label: "Cart",
      onClick: toggleCart,
      icon: ShoppingCart,
      isActive: isCartOpen,
      isCart: true,
    },
    {
      label: "Story",
      href: "/story",
      icon: BookOpen,
      isActive: pathname === "/story",
    },
    {
      label: "Support",
      href: "/contact",
      icon: Phone,
      isActive: pathname === "/contact",
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-[#1a1f1b]/80 backdrop-blur-lg border-t border-black/5 dark:border-white/5 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-all duration-300">
      <nav aria-label="Mobile Navigation" className="flex justify-around items-center h-12 max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          const content = (
            <div className="flex flex-col items-center justify-center relative py-1 w-full select-none">
              {/* Icon & Badge Container */}
              <div className="relative p-1">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? "text-[#607c64] dark:text-[#84a98c]"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                />
                
                {/* Cart Count Badge */}
                {item.isCart && mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#607c64] dark:bg-[#84a98c] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm border border-white dark:border-[#1a1f1b] animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </div>

              {/* Text Label */}
              <span
                className={`text-xs tracking-wider uppercase mt-1 font-bold transition-colors duration-200 ${
                  isActive
                    ? "text-[#607c64] dark:text-[#84a98c]"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {item.label}
              </span>

              {/* Sliding Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-dot"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#607c64] dark:bg-[#84a98c]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex-1 flex justify-center items-center h-full focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              onClick={() => {
                if (isCartOpen) toggleCart();
              }}
              className="flex-1 flex justify-center items-center h-full focus:outline-none"
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
