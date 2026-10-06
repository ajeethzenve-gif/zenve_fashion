import { apiClient } from './api';
import { Product } from '../types/product';
export const wishlistService = {
  async getWishlist(): Promise<Product[]> { return (await apiClient.get<Product[]>('/wishlist/')).data; },
  async clearWishlist(): Promise<void> { await apiClient.delete('/wishlist/'); },
  async syncWishlist(productIds: string[]): Promise<Product[]> {
    return (await apiClient.post<Product[]>('/wishlist/sync/', { productIds })).data;
  },
};
