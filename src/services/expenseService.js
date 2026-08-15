import axiosInstance from '../config/axios';
import { useExpenseStore } from '../store/expenseStore';
import toast from 'react-hot-toast';

export const expenseService = {
  fetchExpenses: async () => {
    const store = useExpenseStore.getState();
    store.setLoading(true);
    try {
      return store.expenses;
    } finally {
      store.setLoading(false);
    }
  },

  addExpense: async (expenseData) => {
    const store = useExpenseStore.getState();
    const loadingToast = toast.loading('Adding expense...');
    store.addExpense(expenseData);
    toast.success('Expense logged locally (Demo Mode)!', { id: loadingToast });
    return expenseData;
  },

  deleteExpense: async (id) => {
    const store = useExpenseStore.getState();
    const loadingToast = toast.loading('Deleting expense...');
    store.deleteExpense(id);
    toast.success('Expense deleted locally (Demo Mode)!', { id: loadingToast });
  }
};
