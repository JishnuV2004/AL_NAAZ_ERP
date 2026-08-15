import { create } from 'zustand';

export const useFinanceStore = create((set, get) => ({
  // Loading states
  loading: false,
  setLoading: (status) => set({ loading: status }),

  // Data
  expenses: [],
  setExpenses: (data) => set({ expenses: data }),

  pettyCash: [],
  setPettyCash: (data) => set({ pettyCash: data }),

  activityLogs: [],
  setActivityLogs: (data) => set({ activityLogs: data }),

  expenseCategories: [],
  setExpenseCategories: (data) => set({ expenseCategories: data }),

  // Summary state (can be populated by reports API)
  summary: {
    currentBalance: 0,
    totalExpenses: 0,
    cashAdded: 0,
    transactionCount: 0
  },
  setSummary: (data) => set({ summary: data }),

  // Global Date Filter State
  dateFilter: {
    startDate: '',
    endDate: '',
    label: 'All Time'
  },
  setDateFilter: (filter) => set({ dateFilter: filter })
}));
