"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import { CheckoutModal } from "./CheckoutModal";
import FocusTrap from "focus-trap-react";

export function CartDrawer() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, clearCart, cartTotal, cartCount } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />
          
          {/* Drawer */}
          <FocusTrap focusTrapOptions={{ fallbackFocus: "body", escapeDeactivates: false }}>
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-background-light dark:bg-[#1a1f1b] z-[90] shadow-2xl flex flex-col pb-24 md:pb-0"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Cart"
            >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <ShoppingBag size={24} className="text-primary" />
                <h2 className="text-xl font-display font-semibold dark:text-gray-100">Your Cart ({cartCount})</h2>
              </div>
              <div className="flex items-center space-x-2">
                {cartItems.length > 0 && (
                  <button 
                    onClick={clearCart}
                    className="text-xs uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors mr-2 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
                <button 
                  onClick={toggleCart}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="Close cart"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg dark:text-gray-200">Your cart is empty</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Looks like you haven&apos;t added anything yet.</p>
                  </div>
                  <button 
                    onClick={toggleCart}
                    className="bg-primary text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-4 border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0"
                  >
                    <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900">
                      <Image 
                        src={item.img} 
                        alt={item.name} 
                        fill 
                        className="object-cover" 
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-display font-medium dark:text-gray-100">{item.name}</h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1"
                          aria-label="Remove item from cart"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">${item.price}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-sm">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold dark:text-gray-200">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-semibold dark:text-gray-200">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs font-bold">Subtotal</span>
                  <span className="text-xl font-semibold dark:text-gray-100">${cartTotal.toFixed(2)}</span>
                </div>
                <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-primary text-white py-4 rounded-sm text-sm font-bold uppercase tracking-[0.2em] hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] ">
                  Checkout Now
                </button>
                <p className="text-xs text-gray-400 text-center mt-4 uppercase tracking-widest">Free Shipping on all orders</p>
              </div>
            )}
            </motion.div>
          </FocusTrap>
          <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
        </>
      )}
    </AnimatePresence>
  );
}
