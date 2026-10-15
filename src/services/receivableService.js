import axiosInstance from '../config/axios';

export const receivableService = {
  fetchReceivables: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/receivables/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch receivables:', error);
      throw error;
    }
  },

  getReceivableById: async (id) => {
    try {
      const response = await axiosInstance.get(`/receivables/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch receivable #${id}:`, error);
      throw error;
    }
  },

  updateReceivable: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/receivables/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update receivable #${id}:`, error);
      throw error;
    }
  },

  createReceivableSettlement: async (payload) => {
    try {
      const response = await axiosInstance.post('/receivable-settlements/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create receivable settlement:', error);
      throw error;
    }
  }
};
