import { apiClient } from './api';
import { Collection } from '../types/product';

export const collectionService = {
  /**
   * Get all collections from database
   */
  async getCollections(): Promise<Collection[]> {
    try {
      const response = await apiClient.get<Collection[]>('/collections');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Get single collection by slug from database
   */
  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    try {
      const response = await apiClient.get<Collection>(`/collections/${slug}`);
      return response.data || null;
    } catch {
      return null;
    }
  },
};

