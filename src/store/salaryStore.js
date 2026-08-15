import { create } from 'zustand';
import { useAttendanceStore } from './attendanceStore';
import { useAdvanceStore } from './advanceStore';

export const useSalaryStore = create((set, get) => ({
  // Holds manual overrides or records for staff salaries. E.g. { "1": { baseSalary: 28000, deductions: 0, notes: "No deductions" } }
  salaryRecords: {
    '2': { deductions: 800, notes: 'Uniform fee deduction' }
  },
  paidMonths: {
    // e.g. "2026-08": { "1": { amount: 28000, date: "2026-08-05" } }
  },
  salaryRequests: [
    // Mock existing pending request for UI testing
    { id: 'req_1', type: 'single', month: 'August', year: '2026', data: { staffId: '1', name: 'Ahmed Khalifa', basePay: 28000, cut: 0, totalSalary: 28000 }, status: 'Pending', createdAt: new Date().toISOString() }
  ],
  loading: false,
  error: null,

  createSalaryRequest: (type, data, role, month, year) => {
    set((state) => {
      const newRequest = {
        id: `req_${Date.now()}`,
        type,
        data,
        month,
        year,
        status: role === 'admin' ? 'Approved' : 'Pending',
        createdAt: new Date().toISOString()
      };
      
      const newRequests = [...state.salaryRequests, newRequest];
      
      // If admin, we could auto-apply here, but for simplicity we'll let the component call approve if needed,
      // or we just set it as Approved. In a real app, backend handles this.
      if (role === 'admin') {
        // Auto apply logic if needed
        const newRecords = { ...state.salaryRecords };
        if (type === 'single') {
          newRecords[data.staffId] = {
            ...newRecords[data.staffId],
            baseSalary: Number(data.basePay),
            deductions: Number(data.cut)
          };
        }
        return { salaryRequests: newRequests, salaryRecords: newRecords };
      }
      
      return { salaryRequests: newRequests };
    });
  },

  approveSalaryRequest: (id) => {
    set((state) => {
      const requests = [...state.salaryRequests];
      const index = requests.findIndex(r => r.id === id);
      if (index === -1) return state;

      const req = requests[index];
      requests[index] = { ...req, status: 'Approved' };

      const newRecords = { ...state.salaryRecords };
      if (req.type === 'single') {
        newRecords[req.data.staffId] = {
          ...newRecords[req.data.staffId],
          baseSalary: Number(req.data.basePay),
          deductions: Number(req.data.cut)
        };
      }
      return { salaryRequests: requests, salaryRecords: newRecords };
    });
  },

  rejectSalaryRequest: (id) => {
    set((state) => {
      return {
        salaryRequests: state.salaryRequests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r)
      };
    });
  },

  deleteSalaryRecord: (staffId) => {
    set((state) => {
      const newRecords = { ...state.salaryRecords };
      delete newRecords[staffId];
      // Also delete from paidMonths if we want full reset, but for now just clear overrides
      return { salaryRecords: newRecords };
    });
  },

  updateSalaryRecord: (staffId, record) => {
    set((state) => ({
      salaryRecords: {
        ...state.salaryRecords,
        [staffId]: {
          ...state.salaryRecords[staffId],
          ...record,
          deductions: Number(record.deductions || 0)
        }
      }
    }));
  },

  paySalary: (monthStr, staffId, details) => {
    set((state) => {
      const paid = { ...state.paidMonths };
      if (!paid[monthStr]) paid[monthStr] = {};
      paid[monthStr][staffId] = {
        amount: details.amount,
        date: new Date().toISOString().split('T')[0]
      };

      // Auto-deduct advance from advanceStore if a deduction is applied
      if (details.advanceDeducted && details.advanceDeducted > 0) {
        const advances = useAdvanceStore.getState().advances;
        const activeAdvance = advances.find(a => a.staffId === staffId && a.status !== 'Paid Back');
        if (activeAdvance) {
          useAdvanceStore.getState().deductAdvance(activeAdvance.id, details.advanceDeducted);
        }
      }

      return { paidMonths: paid };
    });
  },

  getStaffSalaryList: () => {
    // Get staff from attendance store
    const staff = useAttendanceStore.getState().staff;
    const records = get().salaryRecords;
    const paidCurrentMonth = get().paidMonths['2026-08'] || {};
    const advances = useAdvanceStore.getState().advances;

    return staff.map(s => {
      const record = records[s.id] || {};
      
      // Auto deductions if they missed days (e.g. daily wage deduction for absent days)
      const absentDays = s.totalDays - s.daysPresent;
      const dailyWage = s.baseSalary / s.totalDays;
      const autoDeduction = Math.round(absentDays * dailyWage);
      
      // Find remaining advances
      const pendingAdvance = advances
        .filter(a => a.staffId === s.id && a.status !== 'Paid Back')
        .reduce((sum, a) => sum + a.remaining, 0);

      // Use record deductions if overridden, otherwise use autoDeduction
      const deductions = record.deductions !== undefined ? record.deductions : autoDeduction;
      const netSalary = Math.max(0, s.baseSalary - deductions);
      const isPaid = !!paidCurrentMonth[s.id];

      return {
        id: s.id,
        name: s.name,
        role: s.role,
        baseSalary: s.baseSalary,
        daysPresent: s.daysPresent,
        totalDays: s.totalDays,
        absentDays,
        deductions,
        netSalary,
        pendingAdvance,
        notes: record.notes || '',
        isPaid,
        paidDate: paidCurrentMonth[s.id]?.date || null
      };
    });
  },

  getStats: () => {
    const list = get().getStaffSalaryList();
    const totalStaff = list.length;
    const baseSalaryTotal = list.reduce((sum, s) => sum + s.baseSalary, 0);
    const deductionsTotal = list.reduce((sum, s) => sum + s.deductions, 0);
    const netSalaryTotal = list.reduce((sum, s) => sum + s.netSalary, 0);

    return {
      totalStaff,
      baseSalaryTotal,
      deductionsTotal,
      netSalaryTotal
    };
  }
}));
