import axiosInstance from '../config/axios';

export const expenseService = {
  fetchExpenses: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/expenses/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      throw error;
    }
  },

  createExpense: async (payload) => {
    try {
      const response = await axiosInstance.post('/expenses/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create expense response data:', error?.response?.data || error);
      throw error;
    }
  },

  updateExpense: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/expenses/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update expense #${id}:`, error?.response?.data || error);
      throw error;
    }
  },

  deleteExpense: async (id) => {
    try {
      const response = await axiosInstance.delete(`/expenses/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to delete expense #${id}:`, error);
      throw error;
    }
  },

  fetchExpenseAdjustments: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/expense-adjustments/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch expense adjustments:', error);
      throw error;
    }
  },

  createExpenseAdjustment: async (payload) => {
    try {
      const response = await axiosInstance.post('/expense-adjustments/', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create expense adjustment:', error);
      throw error;
    }
  },

  updateExpenseAdjustment: async (id, payload) => {
    try {
      const response = await axiosInstance.patch(`/expense-adjustments/${id}/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to update expense adjustment #${id}:`, error);
      throw error;
    }
  },

  approveExpenseAdjustment: async (id) => {
    try {
      const response = await axiosInstance.post(`/expense-adjustments/${id}/approve/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to approve expense adjustment #${id}:`, error);
      throw error;
    }
  },

  rejectExpenseAdjustment: async (id, payload) => {
    try {
      const response = await axiosInstance.post(`/expense-adjustments/${id}/reject/`, payload);
      return response.data;
    } catch (error) {
      console.error(`Failed to reject expense adjustment #${id}:`, error);
      throw error;
    }
  },

  fetchExpenseAdjustmentById: async (id) => {
    try {
      const response = await axiosInstance.get(`/expense-adjustments/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch expense adjustment #${id}:`, error);
      throw error;
    }
  }
};
