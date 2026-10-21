import axiosInstance from '../config/axios';

export const accountService = {
  fetchAccounts: async () => {
    try {
      const response = await axiosInstance.get('/accounts/');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch accounts:', error);
      return [];
    }
  },

  getAccountById: async (id) => {
    if (!id) return null;
    try {
      const response = await axiosInstance.get(`/accounts/${id}/`);
      return response.data;
    } catch (error) {
      console.warn(`Account #${id} not found:`, error?.message || error);
      return null;
    }
  },

  getAccountTransactions: async (id) => {
    if (!id) return [];
    try {
      // Primary: query transactions filtered by account
      const response = await axiosInstance.get('/transactions/', { params: { account: id } });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    } catch (error) {
      // Fallback: try nested endpoint or client-side filter
      try {
        const fallback = await axiosInstance.get(`/accounts/${id}/transactions/`);
        const data = fallback.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
      } catch (err2) {
        try {
          const allTxns = await axiosInstance.get('/transactions/');
          const list = Array.isArray(allTxns.data) ? allTxns.data : (allTxns.data?.results || []);
          return list.filter((tx) => String(tx.account || tx.account_id) === String(id));
        } catch (err3) {
          return [];
        }
      }
    }
  },

  createAccount: async (payload) => {
    try {
      const response = await axiosInstance.post('/accounts/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create account:', error);
      throw error;
    }
  },

  fetchBranches: async () => {
    try {
      const response = await axiosInstance.get('/branches/');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch branches:', error);
      return [];
    }
  },

  updateAccount: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/accounts/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update account #${id}:`, error);
      throw error;
    }
  },

  deleteAccount: async (id) => {
    try {
      const response = await axiosInstance.delete(`/accounts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete account #${id}:`, error);
      throw error;
    }
  },

  getAccountBalance: async (id) => {
    if (!id) return null;
    try {
      const response = await axiosInstance.get(`/accounts/${id}/balance/`);
      return response.data;
    } catch (error) {
      // Balance endpoint is optional on backend; balance exists on account object
      return null;
    }
  },

  transferFunds: async (payload) => {
    try {
      const response = await axiosInstance.post('/transfers/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to execute fund transfer:', error);
      throw error;
    }
  },

  fetchTransactions: async () => {
    try {
      const response = await axiosInstance.get('/transactions/');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch transactions:', error);
      return [];
    }
  }
};
