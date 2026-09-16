import { apiClient } from './api';
import { Address } from '../types/user';

export const addressService = {
  /**
   * Fetch all saved addresses for the currently authenticated customer
   */
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await apiClient.get<Address[]>('/accounts/addresses/');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Add a new address strictly under the authenticated customer's account
   */
  async createAddress(data: Partial<Address>): Promise<Address | null> {
    try {
      const response = await apiClient.post<Address>('/accounts/addresses/', data);
      return response.data || null;
    } catch (err) {
      console.error('Failed to create address:', err);
      throw err;
    }
  },

  /**
   * Update an existing address belonging to the authenticated customer
   */
  async updateAddress(id: string, data: Partial<Address>): Promise<Address | null> {
    try {
      const response = await apiClient.put<Address>(`/accounts/addresses/${id}/`, data);
      return response.data || null;
    } catch (err) {
      console.error('Failed to update address:', err);
      throw err;
    }
  },

  /**
   * Delete an address belonging to the authenticated customer
   */
  async deleteAddress(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/accounts/addresses/${id}/`);
      return true;
    } catch (err) {
      console.error('Failed to delete address:', err);
      return false;
    }
  },
};
