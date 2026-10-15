import axiosInstance from '../config/axios';

export const deliveryPartnerService = {
  fetchDeliveryPartners: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/delivery-partners/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch delivery partners:', error);
      throw error;
    }
  },

  fetchCommissionRates: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/delivery-partner-rates/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch commission rates:', error);
      throw error;
    }
  },

  createDeliveryPartner: async (payload) => {
    try {
      const response = await axiosInstance.post('/delivery-partners/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create delivery partner:', error);
      throw error;
    }
  },

  updateDeliveryPartner: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/delivery-partners/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update delivery partner #${id}:`, error);
      throw error;
    }
  },

  deleteDeliveryPartner: async (id) => {
    try {
      const response = await axiosInstance.delete(`/delivery-partners/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete delivery partner #${id}:`, error);
      throw error;
    }
  }
};

