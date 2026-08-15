import axiosInstance from '../config/axios';
import { useAttendanceStore } from '../store/attendanceStore';
import toast from 'react-hot-toast';

export const attendanceService = {
  fetchStaff: async () => {
    const store = useAttendanceStore.getState();
    store.setLoading(true);
    try {
      return store.staff;
    } finally {
      store.setLoading(false);
    }
  },

  addStaff: async (staffData) => {
    const store = useAttendanceStore.getState();
    const loadingToast = toast.loading('Adding staff member...');
    store.addStaff(staffData);
    toast.success('Staff added locally (Demo Mode)!', { id: loadingToast });
    return staffData;
  },

  deleteStaff: async (id) => {
    const store = useAttendanceStore.getState();
    const loadingToast = toast.loading('Removing staff member...');
    store.deleteStaff(id);
    toast.success('Staff member removed locally (Demo Mode)!', { id: loadingToast });
  },

  recordAttendance: async (date, staffId, status) => {
    const store = useAttendanceStore.getState();
    store.markAttendance(date, staffId, status);
    toast.success(`Marked attendance status to "${status}"`);
  }
};
