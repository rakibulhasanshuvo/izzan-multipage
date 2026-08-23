import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, type CartItem } from './cart-store';
import type { ProductView } from '@/lib/serialize';

const makeProduct = (id: string, price: number): ProductView =>
  ({
    id,
    name: `Product ${id}`,
    description: null,
    price,
    originalPrice: null,
    img: '/img.png',
    hoverImg: null,
    categories: 'Best Sellers',
    badge: null,
    stock: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as unknown as ProductView;

const reset = () => {
  useCartStore.setState({ cartItems: [], isCartOpen: false });
};

describe('cart-store', () => {
  beforeEach(() => {
    reset();
  });

  it('adds a product to the cart with quantity 1 and opens the drawer', () => {
    const p = makeProduct('a', 10);
    useCartStore.getState().addToCart(p);

    const { cartItems, isCartOpen } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]).toMatchObject({ id: 'a', quantity: 1 });
    expect(isCartOpen).toBe(true);
  });

  it('increments quantity when the same product is added twice', () => {
    const p = makeProduct('a', 10);
    useCartStore.getState().addToCart(p);
    useCartStore.getState().addToCart(p);

    const { cartItems } = useCartStore.getState();
    expect(cartItems).toHaveLength(1);
    expect((cartItems[0] as CartItem).quantity).toBe(2);
  });

  it('removes a product from the cart', () => {
    useCartStore.getState().addToCart(makeProduct('a', 10));
    useCartStore.getState().addToCart(makeProduct('b', 5));
    useCartStore.getState().removeFromCart('a');

    const { cartItems } = useCartStore.getState();
    expect(cartItems.map((i) => i.id)).toEqual(['b']);
  });

  it('updates quantity for an existing item', () => {
    useCartStore.getState().addToCart(makeProduct('a', 10));
    useCartStore.getState().updateQuantity('a', 4);

    expect((useCartStore.getState().cartItems[0] as CartItem).quantity).toBe(4);
  });

  it('removes the item when quantity is set below 1', () => {
    useCartStore.getState().addToCart(makeProduct('a', 10));
    useCartStore.getState().updateQuantity('a', 0);

    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  it('clears the cart', () => {
    useCartStore.getState().addToCart(makeProduct('a', 10));
    useCartStore.getState().clearCart();

    expect(useCartStore.getState().cartItems).toHaveLength(0);
  });

  it('toggles and sets drawer visibility', () => {
    useCartStore.getState().toggleCart();
    expect(useCartStore.getState().isCartOpen).toBe(true);
    useCartStore.getState().setCartOpen(false);
    expect(useCartStore.getState().isCartOpen).toBe(false);
  });

  it('computes cartTotal and cartCount from quantity x price', () => {
    useCartStore.getState().addToCart(makeProduct('a', 10));
    useCartStore.getState().addToCart(makeProduct('b', 2.5));
    useCartStore.getState().updateQuantity('b', 3);

    // Note: useCart() hook reads state directly; verify via store math here.
    const items = useCartStore.getState().cartItems;
    const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const count = items.reduce((acc, i) => acc + i.quantity, 0);
    expect(total).toBeCloseTo(17.5);
    expect(count).toBe(4);
  });
});
