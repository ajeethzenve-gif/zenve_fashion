import { apiClient } from './api';
import { Product } from '../types/product';

export const wishlistService = {
  async syncWishlist(productIds: string[]): Promise<Product[]> {
    try {
      const response = await apiClient.post<Product[]>('/wishlist/sync', { productIds });
      return response.data;
    } catch {
      return [];
    }
  }
};
