import { apiClient } from './api';
import { Article } from '../types/journal';

export const journalService = {
  async getArticles(): Promise<Article[]> {
    try {
      const response = await apiClient.get<Article[]>('/journal');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const response = await apiClient.get<Article>(`/journal/${slug}`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  async getRelatedArticles(slug: string, limit = 3): Promise<Article[]> {
    try {
      const response = await apiClient.get<Article[]>(`/journal/${slug}/related?limit=${limit}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },
};

