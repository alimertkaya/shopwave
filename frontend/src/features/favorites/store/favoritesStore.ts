import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/features/products/types/product.types';

interface FavoritesState {
  items: Product[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  toggle: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product) =>
        set((s) => ({ items: [...s.items, product] })),

      remove: (productId) =>
        set((s) => ({ items: s.items.filter((p) => p.id !== productId) })),

      toggle: (product) => {
        get().isFavorite(product.id)
          ? get().remove(product.id)
          : get().add(product);
      },

      isFavorite: (productId) =>
        get().items.some((p) => p.id === productId),
    }),
    { name: 'shopwave-favorites' }
  )
);
