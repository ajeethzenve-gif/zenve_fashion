import { apiClient } from './api';
import { CartItem } from '../types/cart';

export const cartService = {
  /**
   * Fetch authenticated customer's cart from backend
   */
  async getCart(): Promise<CartItem[]> {
    try {
      const response = await apiClient.get<CartItem[]>('/cart/');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  /**
   * Clear customer's cart on backend
   */
  async clearCart(): Promise<void> {
    try {
      await apiClient.delete('/cart/');
    } catch {
      // ignore
    }
  },

  /**
   * Sync cart with backend for logged-in users
   */
  async syncCart(items: CartItem[]): Promise<CartItem[]> {
    try {
      const response = await apiClient.post<CartItem[]>('/cart/sync/', { items });
      return response.data;
    } catch {
      return items;
    }
  },

  async applyPromoCode(code: string): Promise<{ valid: boolean; discountPercentage: number; message: string }> {
    try {
      const response = await apiClient.post('/cart/promo', { code });
      return response.data;
    } catch {
      const normalized = code.trim().toUpperCase();
      if (normalized === 'ZENVE10') {
        return { valid: true, discountPercentage: 10, message: '10% Atelier Welcome Privileges Applied' };
      }
      if (normalized === 'TWINLOVE') {
        return { valid: true, discountPercentage: 15, message: '15% Twin Edit Privilege Applied' };
      }
      return { valid: false, discountPercentage: 0, message: 'Invalid or expired invitation code' };
    }
  }
};
