import axiosInstance from '../config/axios';
import { useSalaryStore } from '../store/salaryStore';
import toast from 'react-hot-toast';

export const salaryService = {
  fetchSalaries: async () => {
    // Simply fetch lists and calculations from salaryStore (synced with attendance)
    return useSalaryStore.getState().getStaffSalaryList();
  },

  updateSalaryRecord: async (staffId, recordData) => {
    const store = useSalaryStore.getState();
    const loadingToast = toast.loading('Saving salary records...');
    store.updateSalaryRecord(staffId, recordData);
    toast.success('Salary updated locally (Demo Mode)!', { id: loadingToast });
    return recordData;
  },

  paySalary: async (monthStr, staffId, details) => {
    const store = useSalaryStore.getState();
    const loadingToast = toast.loading('Processing salary disbursement...');
    store.paySalary(monthStr, staffId, details);
    toast.success('Disbursement recorded locally (Demo Mode)!', { id: loadingToast });
    return details;
  }
};
