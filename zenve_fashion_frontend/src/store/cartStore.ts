import { create } from 'zustand';
import { CartItem } from '../types/cart';
import { Product, ProductColor } from '../types/product';
import { cartService } from '../services/cartService';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[]; loaded: boolean; error: string | null;
  promoDiscountPercent: number; promoCode: string | null;
  addItem: (p: Product, s: string, c: ProductColor, q?: number) => Promise<boolean>;
  removeItem: (id: string) => Promise<boolean>;
  increaseQuantity: (id: string) => Promise<boolean>;
  decreaseQuantity: (id: string) => Promise<boolean>;
  updateQuantity: (id: string, q: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  applyPromo: (code: string, percent: number) => void;
  removePromo: () => void;
  getSubtotal: () => number; getDiscount: () => number; getShipping: () => number;
  getTotal: () => number; getItemCount: () => number;
}
let pending: Promise<unknown> = Promise.resolve();
export const useCartStore = create<CartState>((set, get) => {
  const save = (change: (items: CartItem[]) => CartItem[]): Promise<boolean> => {
    const owner = useAuthStore.getState().user?.id;
    const work = pending.then(async () => {
      if (!owner || owner !== useAuthStore.getState().user?.id) {
        set({error: 'Please log in to save products to your cart.'}); return false;
      }
      if (!get().loaded) {set({error: "Your cart is still loading. Please try again."}); return false;}
      try {
        const items = await cartService.syncCart(change(get().items));
        if (owner !== useAuthStore.getState().user?.id) return false;
        set({items, error: null}); return true;
      } catch (err: any) {
        set({error: err.response?.data?.message || 'Could not save your cart. Please try again.'}); return false;
      }
    });
    pending = work; return work;
  };
  return {
    items: [], loaded: false, error: null, promoDiscountPercent: 0, promoCode: null,
    addItem: (product, selectedSize, selectedColor, quantity=1) => save(items => {
      const id = `${product.id}-${selectedSize}-${selectedColor.name}`;
      const existing = items.find(i => i.id === id);
      return existing ? items.map(i => i.id === id ? {...i, quantity:i.quantity+quantity} : i)
        : [...items,{id, product, selectedSize, selectedColor, quantity, price:product.price}];
    }),
    removeItem: id => save(items => items.filter(i => i.id !== id)),
    increaseQuantity: id => save(items => items.map(i => i.id===id ? {...i,quantity:i.quantity+1}:i)),
    decreaseQuantity: id => save(items => items.map(i => i.id===id ? {...i,quantity:i.quantity-1}:i).filter(i=>i.quantity>0)),
    updateQuantity: (id,q) => save(items => items.map(i=>i.id===id ? {...i,quantity:q}:i).filter(i=>i.quantity>0)),
    clearCart: () => save(() => []),
    applyPromo: (promoCode,promoDiscountPercent)=>set({promoCode,promoDiscountPercent}),
    removePromo: ()=>set({promoCode:null,promoDiscountPercent:0}),
    getSubtotal: ()=>get().items.reduce((n,i)=>n+i.price*i.quantity,0),
    getDiscount: ()=>Math.round(get().getSubtotal()*get().promoDiscountPercent/100),
    getShipping: ()=>0,
    getTotal: ()=>get().getSubtotal()-get().getDiscount(),
    getItemCount: ()=>get().items.reduce((n,i)=>n+i.quantity,0),
  };
});
