import axiosInstance from '../config/axios';
import { useAdvanceStore } from '../store/advanceStore';
import toast from 'react-hot-toast';

export const advanceService = {
  fetchAdvances: async () => {
    const store = useAdvanceStore.getState();
    store.setLoading(true);
    try {
      return store.advances;
    } finally {
      store.setLoading(false);
    }
  },

  addAdvance: async (advanceData) => {
    const store = useAdvanceStore.getState();
    const loadingToast = toast.loading('Recording advance...');
    store.addAdvance(advanceData);
    toast.success('Advance logged locally (Demo Mode)!', { id: loadingToast });
    return advanceData;
  }
};
