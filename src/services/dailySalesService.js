import axiosInstance from '../config/axios';

export const dailySalesService = {
  fetchDailySales: async (page = 1, pageSize = 10, branchId = null) => {
    try {
      let url = `/daily-sales/?page=${page}&page_size=${pageSize}`;
      if (branchId) {
        url += `&branch=${branchId}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch daily sales:', error);
      throw error;
    }
  },

  createDailySale: async (payload) => {
    try {
      const response = await axiosInstance.post('/daily-sales/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create daily sale:', error);
      throw error;
    }
  },

  updateDailySale: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/daily-sales/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update daily sale #${id}:`, error);
      throw error;
    }
  },

  postDailySale: async (id) => {
    try {
      const response = await axiosInstance.post(`/daily-sales/${id}/post/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to post daily sale #${id}:`, error);
      throw error;
    }
  },

  deleteDailySale: async (id) => {
    try {
      const response = await axiosInstance.delete(`/daily-sales/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete daily sale #${id}:`, error);
      throw error;
    }
  }
};
