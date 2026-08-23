"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { ProductView as Product } from "@/lib/serialize";

export type CartItem = Product & { quantity: number; variant?: string };

// A cart line is identified by the real product id PLUS its selected variant
// (e.g. volume option), so distinct variants never merge and every line keeps
// an id that resolves directly against the database at checkout.
export function cartLineKey(id: string, variant?: string): string {
  return variant ? `${id}::${variant}` : id;
}

export function cartLineTitle(item: Pick<CartItem, "name" | "variant">): string {
  return item.variant ? `${item.name} (${item.variant})` : item.name;
}

interface CartState {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product & { variant?: string }) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

const CART_STORAGE_KEY = "izzan_cart";

// Supports the legacy format used by the previous Context implementation,
// which stored a plain array instead of zustand's { state, version } shape.
const cartStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(name);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return JSON.stringify({ state: { cartItems: parsed }, version: 0 });
      }
    } catch {
      return null;
    }
    return raw;
  },
  setItem: (name, value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(name);
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isCartOpen: false,

      addToCart: (product) =>
        set((state) => {
          const key = cartLineKey(product.id, product.variant);
          const exists = state.cartItems.some(
            (item) => cartLineKey(item.id, item.variant) === key
          );
          return {
            cartItems: exists
              ? state.cartItems.map((item) =>
                  cartLineKey(item.id, item.variant) === key
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                )
              : [...state.cartItems, { ...product, quantity: 1 }],
            isCartOpen: true,
          };
        }),

      removeFromCart: (productId, variant) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => cartLineKey(item.id, item.variant) !== cartLineKey(productId, variant)
          ),
        })),

      updateQuantity: (productId, quantity, variant) => {
        if (quantity < 1) {
          get().removeFromCart(productId, variant);
          return;
        }
        const key = cartLineKey(productId, variant);
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            cartLineKey(item.id, item.variant) === key ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setCartOpen: (open) => set({ isCartOpen: open }),
    }),
    {
      name: CART_STORAGE_KEY,
      skipHydration: true,
      storage: createJSONStorage(() => cartStorage),
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);

export function useCart() {
  const cartItems = useCartStore((s) => s.cartItems);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  const cartTotalCents = cartItems.reduce(
    (acc, item) => acc + Math.round(Number(item.price) * 100) * item.quantity,
    0
  );
  const cartTotal = Math.round(cartTotalCents) / 100;
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    setCartOpen,
    cartTotal,
    cartCount,
  };
}
