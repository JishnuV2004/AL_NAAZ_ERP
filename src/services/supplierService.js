import axiosInstance from '../config/axios';

export const supplierService = {
  fetchSuppliers: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/suppliers/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      throw error;
    }
  },

  getSupplierById: async (id) => {
    try {
      const response = await axiosInstance.get(`/suppliers/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch supplier #${id}:`, error);
      throw error;
    }
  },

  createSupplier: async (payload) => {
    try {
      const response = await axiosInstance.post('/suppliers/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create supplier:', error);
      throw error;
    }
  },

  updateSupplier: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/suppliers/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update supplier #${id}:`, error);
      throw error;
    }
  },

  deleteSupplier: async (id) => {
    try {
      const response = await axiosInstance.delete(`/suppliers/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete supplier #${id}:`, error);
      throw error;
    }
  }
};
