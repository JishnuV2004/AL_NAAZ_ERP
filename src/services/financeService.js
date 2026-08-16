import { useFinanceStore } from '../store/financeStore';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axios';

export const financeService = {
  // === EXPENSES ===
  fetchExpenses: async () => {
    const store = useFinanceStore.getState();
    store.setLoading(true);
    try {
      // Fetch a large page size to get all expenses for local filtering
      const response = await axiosInstance.get(`/expenses/?page_size=10000`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return [];
    } finally {
      store.setLoading(false);
    }
  },

  createExpense: async (data) => {
    await new Promise(r => setTimeout(r, 300));
    toast.success('Expense created locally (Demo Mode).');
    return data;
  },

  updateExpense: async (id, data) => {
    await new Promise(r => setTimeout(r, 300));
    toast.success('Expense updated locally (Demo Mode).');
    return data;
  },

  // === CATEGORIES ===
  fetchExpenseCategories: async () => {
    const store = useFinanceStore.getState();
    try {
      const response = await axiosInstance.get('/categories/?page_size=100'); // Fetch enough for dropdowns
      const data = response.data.results || response.data || [];
      store.setExpenseCategories(data);
      return data;
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      return [];
    }
  },

  fetchCategories: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get(`/categories/?page=${page}&page_size=${pageSize}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  createCategory: async (data) => {
    try {
      const response = await axiosInstance.post('/categories/', data);
      return response.data;
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/categories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      await axiosInstance.delete(`/categories/${id}/`);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  },

  // === PETTY CASH ===
  fetchPettyCash: async (page = 1, pageSize = 20, filters = {}) => {
    const store = useFinanceStore.getState();
    store.setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      return {
        count: 3,
        next: null,
        previous: null,
        results: [
          {
            id: 101,
            transaction_type: 'CASH_IN',
            amount: 5000,
            balance_after: 20100,
            remarks: 'Added from safe',
            created_by_name: 'Admin',
            transaction_date: new Date().toISOString()
          },
          {
            id: 102,
            transaction_type: 'EXPENSE',
            amount: 1200,
            balance_after: 18900,
            remarks: 'Team lunch',
            expense_id: 1,
            created_by_name: 'Admin',
            transaction_date: new Date().toISOString()
          },
          {
            id: 103,
            transaction_type: 'ADJUSTMENT',
            amount: -300,
            balance_after: 18600,
            remarks: 'Expense correction',
            expense_id: 1,
            created_by_name: 'Admin',
            transaction_date: new Date().toISOString()
          }
        ]
      };
    } finally {
      store.setLoading(false);
    }
  },

  addPettyCash: async (data) => {
    await new Promise(r => setTimeout(r, 300));
    toast.success('Cash added locally (Demo Mode).');
    return data;
  },

  // === REPORTS ===
  fetchExpenseReport: async (startDate, endDate) => {
    await new Promise(r => setTimeout(r, 400));
    return {
      opening_balance: 15100,
      total_cash_added: 5000,
      total_expense: 2000,
      expense_count: 2,
      closing_balance: 18600,
      category_totals: [
        { category: 'Food', total: 1200 },
        { category: 'Transport', total: 800 }
      ]
    };
  },

  // === ACTIVITY LOGS ===
  fetchActivityLogs: async (page = 1, pageSize = 20, filters = {}) => {
    await new Promise(r => setTimeout(r, 400));
    return {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 1001,
          created_at: new Date().toISOString(),
          user_name: 'Admin',
          action: 'CREATE',
          module: 'PETTY_CASH',
          object_id: 101,
          description: 'Added ₹5,000 to petty cash',
          old_data: null,
          new_data: { amount: 5000 }
        },
        {
          id: 1002,
          created_at: new Date().toISOString(),
          user_name: 'Staff',
          action: 'UPDATE',
          module: 'EXPENSE',
          object_id: 1,
          description: 'Updated expense amount from 1000 to 1200',
          old_data: { amount: 1000 },
          new_data: { amount: 1200 }
        }
      ]
    };
  }
};
