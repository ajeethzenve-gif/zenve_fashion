import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/product';
import { useCartStore } from './cartStore';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ items: [...get().items, product] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((p) => p.id !== productId) });
      },

      toggleWishlist: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((p) => p.id === productId);
      },

      moveToCart: (product) => {
        const defaultColor = product.colors[0] || { name: 'Standard', hex: '#E4BD5A' };
        const defaultSize = product.sizes[0] || 'Standard';
        useCartStore.getState().addItem(product, defaultSize, defaultColor, 1);
        get().removeItem(product.id);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'zenve-wishlist-storage',
    }
  )
);
