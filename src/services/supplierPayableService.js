import axiosInstance from '../config/axios';

export const supplierPayableService = {
  fetchSupplierPayables: async (page = 1, pageSize = 10, status = '') => {
    try {
      const url = status
        ? `/supplier-payables/?status=${status}&page=${page}&page_size=${pageSize}`
        : `/supplier-payables/?page=${page}&page_size=${pageSize}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch supplier payables:', error);
      throw error;
    }
  },

  getSupplierPayableById: async (id) => {
    try {
      const response = await axiosInstance.get(`/supplier-payables/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch supplier payable #${id}:`, error);
      throw error;
    }
  },

  fetchSupplierPayments: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/supplier-payments/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch supplier payments:', error);
      throw error;
    }
  },

  createSupplierPayment: async (payload) => {
    try {
      const response = await axiosInstance.post('/supplier-payments/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create supplier payment:', error);
      throw error;
    }
  },

  updateSupplierPayment: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/supplier-payments/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update supplier payment #${id}:`, error);
      throw error;
    }
  },

  deleteSupplierPayment: async (id) => {
    try {
      const response = await axiosInstance.delete(`/supplier-payments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete supplier payment #${id}:`, error);
      throw error;
    }
  }
};
