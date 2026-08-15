import { create } from 'zustand';

export const useAdvanceStore = create((set, get) => ({
  advances: [
    { id: '1', staffId: '1', staffName: 'Ahmed Khalifa', amount: 5000, date: '2026-07-15', reason: 'Emergency medical expense', status: 'Pending', remaining: 5000 },
    { id: '2', staffId: '4', staffName: 'Omar Siddiqui', amount: 3000, date: '2026-07-20', reason: 'School fee payment', status: 'Paid Back', remaining: 0 }
  ],
  loading: false,
  error: null,

  setAdvances: (advances) => set({ advances }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Actions
  addAdvance: (advance) => {
    const newAdvance = {
      id: Date.now().toString(),
      ...advance,
      amount: Number(advance.amount),
      remaining: Number(advance.amount),
      status: 'Pending'
    };
    set((state) => ({ advances: [newAdvance, ...state.advances] }));
  },

  deductAdvance: (advanceId, amount) => {
    set((state) => {
      const updatedAdvances = state.advances.map(adv => {
        if (adv.id === advanceId) {
          const newRemaining = Math.max(0, adv.remaining - amount);
          return {
            ...adv,
            remaining: newRemaining,
            status: newRemaining === 0 ? 'Paid Back' : 'Partial'
          };
        }
        return adv;
      });
      return { advances: updatedAdvances };
    });
  },

  // KPI Calculations
  getStats: () => {
    const advances = get().advances;
    const totalGiven = advances.reduce((sum, a) => sum + a.amount, 0);
    const totalRemaining = advances.reduce((sum, a) => sum + a.remaining, 0);
    const activeAdvancesCount = advances.filter(a => a.status !== 'Paid Back').length;

    return {
      totalGiven,
      totalRemaining,
      activeAdvancesCount
    };
  }
}));
