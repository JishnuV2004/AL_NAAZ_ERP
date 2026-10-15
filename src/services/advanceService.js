import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

export const advanceService = {
  fetchAdvances: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get('/advance/', {
        params: {
          page,
          page_size: pageSize
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch advances:', error);
      throw error;
    }
  },

  addAdvance: async (advanceData) => {
    try {
      const response = await axiosInstance.post('/advance/', advanceData);
      return response.data;
    } catch (error) {
      console.error('Failed to add advance:', error);
      throw error;
    }
  },

  approveAdvance: async (id) => {
    try {
      const response = await axiosInstance.post(`/advance/${id}/approve/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to approve advance #${id}:`, error);
      throw error;
    }
  },

  rejectAdvance: async (id) => {
    try {
      const response = await axiosInstance.post(`/advance/${id}/reject/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to reject advance #${id}:`, error);
      throw error;
    }
  }
};


