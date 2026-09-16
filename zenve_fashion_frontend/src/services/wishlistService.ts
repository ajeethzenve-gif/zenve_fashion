import { apiClient } from './api';
import { Product } from '../types/product';

export const wishlistService = {
  /**
   * Fetch authenticated customer's wishlist items from backend
   */
  async getWishlist(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/wishlist/');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  async clearWishlist(): Promise<void> {
    try {
      await apiClient.delete('/wishlist/');
    } catch {
      // ignore
    }
  },

  async syncWishlist(productIds: string[]): Promise<Product[]> {
    try {
      const response = await apiClient.post<Product[]>('/wishlist/sync/', { productIds });
      return response.data;
    } catch {
      return [];
    }
  }
};
