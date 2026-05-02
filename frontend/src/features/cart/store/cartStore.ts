import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartState } from '../types/cart.types';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem: CartItem) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (productId: string) =>
        set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

      updateQuantity: (productId: string, quantity: number) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.productId !== productId)
              : s.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'shopwave-cart' }
  )
);
