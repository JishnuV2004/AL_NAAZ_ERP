import axiosInstance from '../config/axios';

export const supplierPayableService = {
  fetchSupplierPayables: async (pageOrParams = 1, pageSize = 10, status = '') => {
    try {
      let page = 1;
      let size = 10;
      let stat = '';
      let search = '';
      let supplier = '';

      if (typeof pageOrParams === 'object' && pageOrParams !== null) {
        page = pageOrParams.page || 1;
        size = pageOrParams.pageSize || pageOrParams.page_size || 10;
        stat = pageOrParams.status || '';
        search = pageOrParams.search || '';
        supplier = pageOrParams.supplier || '';
      } else {
        page = pageOrParams;
        size = pageSize;
        stat = status;
      }

      const params = { page, page_size: size };
      if (stat && stat !== 'All' && stat !== 'ALL') params.status = stat;
      if (search) params.search = search;
      if (supplier && supplier !== 'All') params.supplier = supplier;

      const response = await axiosInstance.get('/supplier-payables/', { params });
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
