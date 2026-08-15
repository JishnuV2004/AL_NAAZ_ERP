import { create } from 'zustand';

export const useExpenseStore = create((set, get) => ({
  expenses: [
    { id: '1', date: '2026-07-28', category: 'Kitchen & Food', description: 'Weekly produce top-up', paidBy: 'Chef Hassan', amount: 18500 },
    { id: '2', date: '2026-07-28', category: 'Utilities', description: 'Generator diesel refill', paidBy: 'Eng. Youssef', amount: 6200 },
    { id: '3', date: '2026-07-27', category: 'Housekeeping', description: 'Laundry chemicals', paidBy: 'Fatima R.', amount: 3400 },
    { id: '4', date: '2026-07-27', category: 'Maintenance', description: 'Pool pump repair', paidBy: 'Ahmed K.', amount: 7800 },
    { id: '5', date: '2026-07-26', category: 'Transport', description: 'Airport shuttle fuel', paidBy: 'Driver Omar', amount: 2100 },
    { id: '6', date: '2026-07-25', category: 'Miscellaneous', description: 'Lobby floral arrangements', paidBy: 'Layla S.', amount: 4200 }
  ],
  loading: false,
  error: null,

  setExpenses: (expenses) => set({ expenses }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Actions
  addExpense: (expense) => {
    const newExpense = {
      id: Date.now().toString(),
      ...expense,
      amount: Number(expense.amount)
    };
    set((state) => ({ expenses: [newExpense, ...state.expenses] }));
  },

  deleteExpense: (id) => {
    set((state) => ({ expenses: state.expenses.filter((exp) => exp.id !== id) }));
  },

  // KPI Computations
  getStats: () => {
    const expenses = get().expenses;
    if (expenses.length === 0) {
      return { latestDayTotal: 0, periodTotal: 0, averagePerDay: 0, topCategory: 'None' };
    }

    // Sort by date descending to get the latest day
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestDate = sortedExpenses[0]?.date;
    
    const latestDayTotal = expenses
      .filter(e => e.date === latestDate)
      .reduce((sum, e) => sum + e.amount, 0);

    const periodTotal = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Get unique days
    const uniqueDays = new Set(expenses.map(e => e.date)).size;
    const averagePerDay = uniqueDays > 0 ? Math.round(periodTotal / uniqueDays) : 0;

    // Calculate category spending
    const categoryMap = {};
    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let maxSpend = 0;
    Object.entries(categoryMap).forEach(([category, spend]) => {
      if (spend > maxSpend) {
        maxSpend = spend;
        topCategory = category;
      }
    });

    return {
      latestDayTotal,
      periodTotal,
      averagePerDay,
      topCategory: maxSpend > 0 ? `${topCategory} (₹${maxSpend.toLocaleString()})` : 'None'
    };
  }
}));
