"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, User, Home, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import FocusTrap from "focus-trap-react";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart, toggleCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    zila: "",
    upozila: "",
    shippingAddress: "",
  });

  useEffect(() => {
    if (isOpen) {
      setIdempotencyKey(crypto.randomUUID());
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
          totalAmount: cartTotal,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      toast.success("Order placed successfully! We will contact you soon.");
      clearCart();
      onClose();
      // Also close the cart drawer if it's open
      toggleCart();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 z-[110] pointer-events-none">
            <FocusTrap focusTrapOptions={{ fallbackFocus: "form", escapeDeactivates: false }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#1a1f1b] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
                role="dialog"
                aria-modal="true"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                  <div>
                    <h2 className="text-xl font-display font-semibold dark:text-gray-100">Confirm Order</h2>
                    <p className="text-sm text-gray-500 mt-1">Please provide your details below.</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="overflow-y-auto p-6">
                  <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form">
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Full Name *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm transition-all"
                          placeholder="Your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <IMaskInput
                          mask="000-0000-0000"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          unmask={true} // true|false|'typed'
                          onAccept={(value: string) => {
                            setFormData((prev) => ({ ...prev, phone: value }));
                          }}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm transition-all"
                          placeholder="017-1234-5678"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email (Optional)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="zila" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Zila / District *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="zila"
                            name="zila"
                            required
                            value={formData.zila}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm transition-all"
                            placeholder="e.g. Dhaka"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="upozila" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Upozila / Thana *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="upozila"
                            name="upozila"
                            required
                            value={formData.upozila}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm transition-all"
                            placeholder="e.g. Mirpur"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="shippingAddress" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Detailed Address *</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <Home size={16} className="text-gray-400" />
                        </div>
                        <textarea
                          id="shippingAddress"
                          name="shippingAddress"
                          required
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          rows={3}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:text-gray-100 text-sm transition-all resize-none"
                          placeholder="House No, Road No, Area"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Confirm Order"
                    )}
                  </button>
                </div>
              </motion.div>
            </FocusTrap>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
