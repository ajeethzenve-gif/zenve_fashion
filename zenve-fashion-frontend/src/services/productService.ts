import { apiClient } from './api';
import { Product, ProductCategory, ProductFilterState } from '../types/product';

export const productService = {
  /**
   * Get all products from database with optional filters
   */
  async getProducts(filters?: Partial<ProductFilterState>): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products', { params: filters });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get single product by slug from database
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(`/products/${slug}`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  /**
   * Get featured Atelier Picks from database for homepage or showroom
   */
  async getAtelierPicks(): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>('/products/atelier-picks');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get products by category ('people' | 'pets' | 'twin')
   */
  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>(`/products/category/${category}`);
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get related products for product details page
   */
  async getRelatedProducts(productId: string, category: ProductCategory, limit = 4): Promise<Product[]> {
    try {
      const response = await apiClient.get<Product[]>(`/products/${productId}/related`, {
        params: { limit, category },
      });
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },
};

