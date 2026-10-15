import axiosInstance from '../config/axios';

export const accountService = {
  fetchAccounts: async () => {
    try {
      const response = await axiosInstance.get('/accounts/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  },

  getAccountById: async (id) => {
    try {
      const response = await axiosInstance.get(`/accounts/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch account #${id}:`, error);
      throw error;
    }
  },

  getAccountTransactions: async (id) => {
    try {
      const response = await axiosInstance.get(`/accounts/${id}/transactions/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch transactions for account #${id}:`, error);
      throw error;
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
      console.error('Failed to fetch branches:', error);
      throw error;
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
    try {
      const response = await axiosInstance.get(`/accounts/${id}/balance/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch balance for account #${id}:`, error);
      throw error;
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
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }
};
