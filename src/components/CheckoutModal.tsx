"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, User, Home, Mail } from "lucide-react";
import { useEffect, useRef } from "react";
import FocusTrap from "focus-trap-react";
import { IMaskInput } from "react-imask";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation";
import { useCart } from "@/store/cart-store";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-red-600 dark:text-red-400 mt-1">{message}</p> : null;

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cartItems, cartTotal, clearCart, setCartOpen } = useCart();
  const idempotencyKeyRef = useRef("");
  // Anti-bot: records when the modal opened so instant submits (bots) are rejected
  const openedAtRef = useRef(0);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      zila: "",
      upozila: "",
      shippingAddress: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      idempotencyKeyRef.current = crypto.randomUUID();
      openedAtRef.current = Date.now();
    }
  }, [isOpen]);

  // Minimum realistic fill time; scripted submissions are near-instant.
  const MIN_FILL_MS = 3000;

  const placeOrder = useMutation({
    mutationFn: async (values: CheckoutFormValues) => {
      // Minimum realistic fill time; scripted submissions are near-instant.
      if (Date.now() - openedAtRef.current < MIN_FILL_MS) {
        throw new Error("Please take a moment to review your details before placing the order.");
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          items: cartItems.map(item => ({ id: item.id, name: item.name, variant: item.variant, price: item.price, quantity: item.quantity })),
          totalAmount: cartTotal,
          idempotencyKey: idempotencyKeyRef.current,
          companyWebsite: honeypotRef.current?.value ?? "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Order placed successfully! We will contact you soon.");
      reset();
      clearCart();
      onClose();
      // Explicitly close (not toggle) the cart drawer behind this modal.
      setCartOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    },
  });

  const inputClassName =
    "w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-gray-800 dark:text-gray-100 text-sm transition-all";

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
                    className="p-2 rounded-full hover:bg-gray-250 dark:hover:bg-gray-800 transition-colors dark:text-gray-400 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Close checkout modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <form onSubmit={handleSubmit((values) => placeOrder.mutate(values))} className="space-y-4" id="checkout-form">
                    {/* Honeypot: invisible to humans; bots that autofill it are rejected server-side */}
                    <input
                      ref={honeypotRef}
                      type="text"
                      name="companyWebsite"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="hidden"
                    />
                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Full Name *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          autoComplete="name"
                          aria-invalid={!!errors.name}
                          {...register("name")}
                          className={inputClassName}
                          placeholder="Your full name…"
                        />
                      </div>
                      <FieldError message={errors.name?.message} />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="phone" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <Controller
                          control={control}
                          name="phone"
                          render={({ field }) => (
                            <IMaskInput
                              mask="000-0000-0000"
                              id="phone"
                              autoComplete="tel"
                              inputMode="tel"
                              unmask={true} // true|false|'typed'
                              value={field.value}
                              onAccept={(value: string) => field.onChange(value)}
                              onBlur={field.onBlur}
                              className={inputClassName}
                              placeholder="017-1234-5678…"
                            />
                          )}
                        />
                      </div>
                      <FieldError message={errors.phone?.message} />
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
                          autoComplete="email"
                          spellCheck={false}
                          aria-invalid={!!errors.email}
                          {...register("email")}
                          className={inputClassName}
                          placeholder="your@email.com…"
                        />
                      </div>
                      <FieldError message={errors.email?.message} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="zila" className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Zila / District *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin size={16} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="zila"
                            autoComplete="address-level2"
                            aria-invalid={!!errors.zila}
                            {...register("zila")}
                            className={inputClassName}
                            placeholder="e.g. Dhaka…"
                          />
                        </div>
                        <FieldError message={errors.zila?.message} />
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
                            autoComplete="address-level3"
                            aria-invalid={!!errors.upozila}
                            {...register("upozila")}
                            className={inputClassName}
                            placeholder="e.g. Mirpur…"
                          />
                        </div>
                        <FieldError message={errors.upozila?.message} />
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
                          autoComplete="street-address"
                          rows={3}
                          aria-invalid={!!errors.shippingAddress}
                          {...register("shippingAddress")}
                          className={`${inputClassName} resize-none`}
                          placeholder="House No, Road No, Area…"
                        />
                      </div>
                      <FieldError message={errors.shippingAddress?.message} />
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
                    disabled={placeOrder.isPending}
                    className="w-full bg-primary text-white py-3.5 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {placeOrder.isPending ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing…
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

