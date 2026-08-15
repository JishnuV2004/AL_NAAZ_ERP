import { create } from 'zustand';

export const useAttendanceStore = create((set, get) => ({
  staff: [
    { id: '1', name: 'Ahmed Khalifa', role: 'Front Desk', baseSalary: 28000, daysPresent: 24, totalDays: 26 },
    { id: '2', name: 'Fatima Rahman', role: 'Housekeeping', baseSalary: 19000, daysPresent: 26, totalDays: 26 },
    { id: '3', name: 'Chef Hassan Ali', role: 'Kitchen Staff', baseSalary: 42000, daysPresent: 25, totalDays: 26 },
    { id: '4', name: 'Omar Siddiqui', role: 'Security', baseSalary: 21000, daysPresent: 22, totalDays: 26 },
    { id: '5', name: 'Layla Souad', role: 'Management', baseSalary: 65000, daysPresent: 26, totalDays: 26 },
    { id: '6', name: 'Youssef Kamal', role: 'Maintenance', baseSalary: 24000, daysPresent: 20, totalDays: 26 }
  ],
  // Log index by date and staffId. E.g. { "2026-08-10": { "1": "P", "2": "P", "3": "A", "4": "P", "5": "P", "6": "L" } }
  attendanceLogs: {
    '2026-08-10': { '1': 'P', '2': 'P', '3': 'A', '4': 'P', '5': 'P', '6': 'L' }
  },
  loading: false,
  error: null,

  setStaff: (staff) => set({ staff }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Actions
  addStaff: (member) => {
    const newStaff = {
      id: Date.now().toString(),
      name: member.name,
      role: member.role,
      baseSalary: Number(member.baseSalary),
      daysPresent: 26,
      totalDays: 26
    };
    set((state) => ({ staff: [...state.staff, newStaff] }));
  },

  updateStaff: (id, data) => {
    set((state) => ({
      staff: state.staff.map((s) => (s.id === id ? { ...s, ...data } : s))
    }));
  },

  deleteStaff: (id) => {
    set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
  },

  markAttendance: (date, staffId, status) => {
    set((state) => {
      const logs = { ...state.attendanceLogs };
      if (!logs[date]) logs[date] = {};
      
      const oldStatus = logs[date][staffId];
      logs[date][staffId] = status;

      // Dynamically adjust the "daysPresent" stats for the staff member
      const updatedStaff = state.staff.map(s => {
        if (s.id === staffId) {
          let presentDiff = 0;
          if (oldStatus !== 'P' && status === 'P') presentDiff = 1;
          else if (oldStatus === 'P' && status !== 'P') presentDiff = -1;
          
          return {
            ...s,
            daysPresent: Math.min(s.totalDays, Math.max(0, s.daysPresent + presentDiff))
          };
        }
        return s;
      });

      return { attendanceLogs: logs, staff: updatedStaff };
    });
  },

  // KPI calculations
  getStats: (date) => {
    const staff = get().staff;
    const logs = get().attendanceLogs[date] || {};

    const totalStaff = staff.length;
    let presentToday = 0;
    let onLeave = 0;
    let absentToday = 0;

    staff.forEach(s => {
      const status = logs[s.id] || 'P'; // default to Present if not logged
      if (status === 'P') presentToday++;
      else if (status === 'L') onLeave++;
      else if (status === 'A') absentToday++;
    });

    return {
      totalStaff,
      presentToday,
      onLeave,
      absentToday
    };
  }
}));
