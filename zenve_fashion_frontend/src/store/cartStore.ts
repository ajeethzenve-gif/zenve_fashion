import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types/cart';
import { Product, ProductColor } from '../types/product';

interface CartState {
  items: CartItem[];
  promoDiscountPercent: number;
  promoCode: string | null;
  // Actions
  addItem: (product: Product, selectedSize: string, selectedColor: ProductColor, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string, percent: number) => void;
  removePromo: () => void;
  // Computations
  getSubtotal: () => number;
  getDiscount: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoDiscountPercent: 0,
      promoCode: null,

      addItem: (product, selectedSize, selectedColor, quantity = 1) => {
        const itemId = `${product.id}-${selectedSize}-${selectedColor.name}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === itemId);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += quantity;
          set({ items: updated });
        } else {
          const newItem: CartItem = {
            id: itemId,
            product,
            selectedSize,
            selectedColor,
            quantity,
            price: product.price,
          };
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) });
      },

      increaseQuantity: (itemId) => {
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      },

      decreaseQuantity: (itemId) => {
        const currentItems = get().items;
        const item = currentItems.find((i) => i.id === itemId);
        if (item && item.quantity > 1) {
          set({
            items: currentItems.map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
            ),
          });
        } else {
          set({ items: currentItems.filter((i) => i.id !== itemId) });
        }
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
        } else {
          set({
            items: get().items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          });
        }
      },

      clearCart: () => {
        set({ items: [], promoDiscountPercent: 0, promoCode: null });
      },

      applyPromo: (code, percent) => {
        set({ promoCode: code, promoDiscountPercent: percent });
      },

      removePromo: () => {
        set({ promoCode: null, promoDiscountPercent: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const percent = get().promoDiscountPercent;
        return percent > 0 ? Math.round((subtotal * percent) / 100) : 0;
      },

      getShipping: () => {
        return 0;
      },

      getTotal: () => {
        return get().getSubtotal() - get().getDiscount() + get().getShipping();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'zenve-cart-storage',
    }
  )
);
