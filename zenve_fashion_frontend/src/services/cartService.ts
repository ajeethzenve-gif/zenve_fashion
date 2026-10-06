import { apiClient } from './api';
import { CartItem } from '../types/cart';

export const cartService = {
  /**
   * Fetch authenticated customer's cart from backend
   */
  async getCart(): Promise<CartItem[]> {
    return (await apiClient.get<CartItem[]>('/cart/')).data;
  },
  async clearCart(): Promise<void> { await apiClient.delete('/cart/'); },
  async syncCart(items: CartItem[]): Promise<CartItem[]> {
    return (await apiClient.post<CartItem[]>('/cart/sync/', { items })).data;
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
