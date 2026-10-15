import axiosInstance from '../config/axios';

export const purchaseService = {
  fetchPurchases: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/purchases/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
      throw error;
    }
  },

  getPurchaseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/purchases/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch purchase #${id}:`, error);
      throw error;
    }
  },

  createPurchase: async (payload, idempotencyKey) => {
    try {
      const key = idempotencyKey || `purchases-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const response = await axiosInstance.post('/purchases/', payload, {
        headers: {
          'Idempotency-Key': key
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create purchase:', error);
      throw error;
    }
  }
};
