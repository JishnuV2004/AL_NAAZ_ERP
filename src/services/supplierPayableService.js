import axiosInstance from '../config/axios';

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {}
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    } catch (e) {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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

  createSupplierPayment: async (payload, idempotencyKey) => {
    try {
      const key = idempotencyKey || generateUUID();
      const response = await axiosInstance.post('/supplier-payments/', payload, {
        headers: {
          'Idempotency-Key': key
        }
      });
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
