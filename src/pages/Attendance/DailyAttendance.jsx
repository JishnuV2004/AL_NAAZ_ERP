import React, { useState, useEffect, useRef } from 'react';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoAddOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline,
  IoChevronDownOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoHelpCircle,
  IoRefreshOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoCreateOutline,
  IoChatboxEllipsesOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import toast from 'react-hot-toast';
import EmployeeAttendanceHistoryModal from '../../components/attendance/EmployeeAttendanceHistoryModal';
import { Calendar } from '../../components/ui/calendar';
import axiosInstance from '../../config/axios';

// Custom Select Component for stylish, non-system theme dropdowns
const CustomSelect = ({ value, onChange, options, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(typeof o === 'object' ? o.value : o) === String(value));
  const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : (selectedOption || value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-xs cursor-pointer"
      >
        <span className="truncate">{displayLabel}</span>
        <IoChevronDownOutline
          className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''
            }`}
          size={13}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 min-w-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 font-sans">
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const isSelected = String(val) === String(value);
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${isSelected
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="truncate">{label}</span>
                {isSelected && <IoCheckmarkOutline size={15} className="text-blue-600 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${monthNamesShort[m]} ${d}, ${y}`;
};

const getInitials = (name) => {
  if (!name) return 'E';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-teal-100 text-teal-700 border-teal-200'
  ];
  let hash = 0;
  const str = name || 'Employee';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const normalizeStatus = (rawStatus) => {
  if (!rawStatus || rawStatus === 'null' || rawStatus === 'NULL' || rawStatus === 'none' || rawStatus === 'undefined') {
    return 'NOT MARKED';
  }
  const clean = String(rawStatus).trim().toUpperCase().replace(/_/g, ' ');
  if (clean === 'PRESENT' || clean === 'P') return 'PRESENT';
  if (clean === 'ABSENT' || clean === 'A') return 'ABSENT';
  if (clean === 'HALF DAY' || clean === 'HALFDAY' || clean === 'H' || clean === 'HALF') return 'HALF DAY';
  if (clean === 'LEAVE' || clean === 'L') return 'LEAVE';
  if (clean === 'PENDING') return 'NOT MARKED';
  if (clean === 'NOT MARKED' || clean === 'UNMARKED') return 'NOT MARKED';
  return clean;
};

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DailyAttendance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const datePickerRef = useRef(null);

  const [branches, setBranches] = useState([
    { id: 1, name: 'Al Naaz Kayamkulam' },
    { id: 2, name: 'Al Naaz Kochi' }
  ]);
  const [selectedBranchId, setSelectedBranchId] = useState(1);
  const [designation, setDesignation] = useState('All Designations');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [isMarkingPresent, setIsMarkingPresent] = useState(false);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);
  const [activeRemarkInputId, setActiveRemarkInputId] = useState(null);
  const [remarkInputText, setRemarkInputText] = useState('');
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [remarkEmployee, setRemarkEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest || !e.target.closest('.status-dropdown-container')) {
        setOpenStatusDropdownId(null);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Fetch branches dynamically
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axiosInstance.get('/branches/');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setBranches(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch branches:', err);
      }
    };
    fetchBranches();
  }, []);

  // Fetch daily attendance dynamically based on selected branch & selected date
  const loadDailyAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/attendance/daily/', {
        params: {
          branch: selectedBranchId,
          date: selectedDate
        }
      });

      if (Array.isArray(res.data)) {
        const mapped = res.data.map((item, idx) => {
          const status = normalizeStatus(item.status);

          return {
            id: item.employee || item.id || idx + 1,
            empId: `EMP-${String(item.employee || item.id || idx + 1).padStart(4, '0')}`,
            name: item.employee_name || `Employee ${item.employee || idx + 1}`,
            email: `${(item.employee_name || 'emp').toLowerCase().replace(/\s+/g, '.')}@alnaaz.com`,
            avatar: `https://i.pravatar.cc/150?u=emp${item.employee || idx + 1}`,
            designation: item.designation || item.department || 'Staff',
            salaryType: item.salaryType || 'MONTHLY',
            workingDays: item.workingDays || 30,
            presentAbsent: {
              present: status === 'PRESENT' ? 1 : 0,
              absent: status === 'ABSENT' ? 1 : 0
            },
            leaveHalf: {
              leave: status === 'LEAVE' ? 1 : 0,
              half: status === 'HALF DAY' ? 1 : 0
            },
            grossSalary: item.grossSalary || 25000.00,
            deductions: item.deductions || 0.00,
            advances: item.advances || 0.00,
            netSalary: item.netSalary || 25000.00,
            status: status,
            is_paid: item.is_paid !== undefined ? item.is_paid : true,
            paymentDate: item.paymentDate || '-',
            remarks: item.remarks || '-'
          };
        });
        setEmployees(mapped);
      }
    } catch (err) {
      console.error('Error fetching daily attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDailyAttendance();
  }, [selectedBranchId, selectedDate]);

  const updateEmployeeRecord = (updatedEmp) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (String(emp.id) === String(updatedEmp.id)) {
          const present = updatedEmp.status === 'PRESENT' ? 1 : 0;
          const absent = updatedEmp.status === 'ABSENT' ? 1 : 0;
          const leave = updatedEmp.status === 'LEAVE' ? 1 : 0;
          const half = updatedEmp.status === 'HALF DAY' ? 1 : 0;

          return {
            ...updatedEmp,
            status: updatedEmp.status,
            is_paid: updatedEmp.is_paid !== undefined ? Boolean(updatedEmp.is_paid) : true,
            presentAbsent: { present, absent },
            leaveHalf: { leave, half },
            remarks: updatedEmp.remarks || '-'
          };
        }
        return emp;
      })
    );
    toast.success(`Updated record for ${updatedEmp.name}`);
  };

  const toggleEmployeePaid = (id) => {
    let empName = '';
    let nextPaidVal = true;
    setEmployees((prev) =>
      prev.map((emp) => {
        if (String(emp.id) === String(id)) {
          nextPaidVal = emp.is_paid === false ? true : false;
          empName = emp.name;
          return {
            ...emp,
            is_paid: nextPaidVal
          };
        }
        return emp;
      })
    );
    toast.success(`${empName || 'Employee'}: set to ${nextPaidVal ? 'Paid' : 'Unpaid'}`);
  };

  const handleSaveModalRecord = async () => {
    if (!editingEmployee) return;

    const rawStatus = editingEmployee.status ? String(editingEmployee.status).trim().toUpperCase() : '';
    const formattedStatus =
      rawStatus === 'HALF DAY' || rawStatus === 'HALFDAY' || rawStatus === 'HALF_DAY'
        ? 'HALF_DAY'
        : rawStatus;

    const cleanRemark =
      editingEmployee.remarks && editingEmployee.remarks !== '-' ? String(editingEmployee.remarks).trim() : '';

    const empIdNum = parseInt(editingEmployee.id, 10);

    if (
      formattedStatus &&
      formattedStatus !== 'NOT MARKED' &&
      formattedStatus !== 'PENDING' &&
      !isNaN(empIdNum) &&
      empIdNum > 0
    ) {
      const payload = {
        employee: empIdNum,
        date: selectedDate || new Date().toISOString().split('T')[0],
        status: formattedStatus,
        is_paid: editingEmployee.is_paid !== undefined ? Boolean(editingEmployee.is_paid) : true,
        remarks: cleanRemark
      };

      try {
        await axiosInstance.post('/attendance/', payload);
      } catch (err) {
        console.warn('Individual /attendance/ POST notice:', err);
      }
    }

    updateEmployeeRecord(editingEmployee);
    setEditingEmployee(null);
  };

  const saveEmployeeRemark = (empId, newRemark) => {
    const cleanText = typeof newRemark === 'string' ? newRemark.trim() : '';
    setEmployees((prev) =>
      prev.map((emp) => (String(emp.id) === String(empId) ? { ...emp, remarks: cleanText || '-' } : emp))
    );
    toast.success('Attendance remark saved');
  };

  // Status Metrics
  const presentCount = employees.filter((e) => e.status === 'PRESENT').length;
  const absentCount = employees.filter((e) => e.status === 'ABSENT').length;
  const halfDayCount = employees.filter((e) => e.status === 'HALF DAY').length;
  const leaveCount = employees.filter((e) => e.status === 'LEAVE').length;
  const notMarkedCount = employees.filter(
    (e) => !e.status || e.status === 'NOT MARKED' || e.status === 'PENDING'
  ).length;

  const chartData = [
    { name: 'Present', value: presentCount, color: '#16a34a' },
    { name: 'Absent', value: absentCount, color: '#dc2626' },
    { name: 'Half Day', value: halfDayCount, color: '#eab308' },
    { name: 'Leave', value: leaveCount, color: '#9333ea' },
    { name: 'Not Marked', value: notMarkedCount, color: '#f97316' }
  ];

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Status' || emp.status === statusFilter;

    const matchesDesignation =
      designation === 'All Designations' || emp.designation === designation;

    const matchesSalaryType =
      salaryTypeFilter === 'All Types' || emp.salaryType === salaryTypeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDesignation &&
      matchesSalaryType
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const emptyRowsCount = loading ? 0 : Math.max(0, itemsPerPage - paginatedEmployees.length);

  const updateEmployeeStatus = (id, newStatus) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (String(emp.id) === String(id)) {
          const present = newStatus === 'PRESENT' ? 1 : 0;
          const absent = newStatus === 'ABSENT' ? 1 : 0;
          const leave = newStatus === 'LEAVE' ? 1 : 0;
          const half = newStatus === 'HALF DAY' ? 1 : 0;

          return {
            ...emp,
            status: newStatus,
            presentAbsent: { present, absent },
            leaveHalf: { leave, half }
          };
        }
        return emp;
      })
    );
    toast.success(`Updated status to ${newStatus}`);
  };

  const handleResetFilters = () => {
    setSelectedDate(getTodayDateString());
    setSelectedBranchId(1);
    setDesignation('All Designations');
    setStatusFilter('All Status');
    setSalaryTypeFilter('All Types');
    setSearchQuery('');
    toast.success('Filters reset');
  };

  const handleBulkMarkPresent = () => {
    if (isMarkingPresent) return;
    if (filteredEmployees.length === 0) {
      toast.error('No employees available to mark present');
      return;
    }

    setIsMarkingPresent(true);
    setTimeout(() => {
      setEmployees((prev) =>
        prev.map((emp) => {
          const isTarget = filteredEmployees.some((f) => String(f.id) === String(emp.id));
          return isTarget
            ? {
              ...emp,
              status: 'PRESENT',
              is_paid: true,
              presentAbsent: { present: 1, absent: 0 },
              leaveHalf: { leave: 0, half: 0 }
            }
            : emp;
        })
      );
      setIsMarkingPresent(false);
      toast.success(`Marked all ${filteredEmployees.length} employee(s) Present`);
    }, 350);
  };

  const handleSaveAttendance = async () => {
    if (isSaving) return;

    // Check if any employee has a remark but no status assigned
    const unassignedWithRemark = employees.find(
      (emp) =>
        emp.remarks &&
        emp.remarks !== '-' &&
        emp.remarks.trim() !== '' &&
        (!emp.status || emp.status === 'NOT MARKED' || emp.status === 'PENDING')
    );

    if (unassignedWithRemark) {
      toast.error(
        `Please select a status (Present, Absent, Half Day, or Leave) for ${unassignedWithRemark.name} before saving.`
      );
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving attendance...');
    try {
      const records = employees
        .map((emp) => {
          const empIdNum = parseInt(emp.id, 10);
          if (isNaN(empIdNum) || empIdNum <= 0) return null;

          const rawStatus = emp.status ? String(emp.status).trim().toUpperCase() : '';
          if (
            !rawStatus ||
            rawStatus === 'NOT MARKED' ||
            rawStatus === 'PENDING' ||
            rawStatus === 'NULL' ||
            rawStatus === 'NONE' ||
            rawStatus === 'UNDEFINED'
          ) {
            return null;
          }

          const formattedStatus =
            rawStatus === 'HALF DAY' || rawStatus === 'HALFDAY' || rawStatus === 'HALF_DAY'
              ? 'HALF_DAY'
              : rawStatus;

          const cleanRemark =
            emp.remarks && emp.remarks !== '-' ? String(emp.remarks).trim() : '';

          return {
            employee: empIdNum,
            date: selectedDate || new Date().toISOString().split('T')[0],
            status: formattedStatus,
            is_paid: emp.is_paid !== undefined ? Boolean(emp.is_paid) : true,
            remarks: cleanRemark
          };
        })
        .filter(Boolean);

      if (records.length === 0) {
        toast.error('Please select or change at least one employee status before saving.', {
          id: loadingToast
        });
        setIsSaving(false);
        return;
      }

      const payload = {
        branch: parseInt(selectedBranchId, 10) || 1,
        date: selectedDate || new Date().toISOString().split('T')[0],
        records: records
      };

      const res = await axiosInstance.post('/attendance/bulk/', payload);
      toast.success(res.data?.message || 'Attendance saved successfully.', { id: loadingToast });

      if (res.data && Array.isArray(res.data.records) && res.data.records.length > 0) {
        const returnedMap = new Map();
        res.data.records.forEach((rec) => {
          returnedMap.set(String(rec.employee), rec);
        });

        setEmployees((prev) =>
          prev.map((emp) => {
            const ret = returnedMap.get(String(emp.id));
            if (ret) {
              return {
                ...emp,
                status: normalizeStatus(ret.status),
                remarks: ret.remarks || '-',
                is_paid: ret.is_paid !== undefined ? Boolean(ret.is_paid) : (emp.is_paid !== undefined ? Boolean(emp.is_paid) : true)
              };
            }
            return emp;
          })
        );
      } else {
        loadDailyAttendance();
      }
    } catch (err) {
      console.error('Error saving bulk attendance:', err, err.response?.data);
      const data = err.response?.data;
      let errMsg = err.userMessage || 'Failed to save attendance.';
      if (data) {
        if (typeof data === 'string') errMsg = data;
        else if (data.detail) errMsg = data.detail;
        else if (data.message) errMsg = data.message;
        else if (data.error) errMsg = data.error;
        else if (Array.isArray(data.records)) {
          const recErrs = data.records
            .map((item, idx) => {
              if (!item) return null;
              if (typeof item === 'string') return `Record #${idx + 1}: ${item}`;
              if (typeof item === 'object') {
                const subKeys = Object.keys(item);
                if (subKeys.length > 0) {
                  const val = item[subKeys[0]];
                  const msg = Array.isArray(val) ? val.join(', ') : String(val);
                  return `${subKeys[0]}: ${msg}`;
                }
              }
              return null;
            })
            .filter(Boolean);
          if (recErrs.length > 0) errMsg = recErrs.join('; ');
        } else if (typeof data === 'object') {
          const keys = Object.keys(data);
          if (keys.length > 0) {
            const firstErr = data[keys[0]];
            const errStr = Array.isArray(firstErr)
              ? firstErr.join(', ')
              : typeof firstErr === 'object'
                ? JSON.stringify(firstErr)
                : String(firstErr);
            errMsg = `${keys[0]}: ${errStr}`;
          }
        }
      }
      toast.error(errMsg, { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'HALF DAY':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'LEAVE':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'NOT MARKED':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300';
    }
  };

  if (viewingEmployee) {
    return (
      <EmployeeAttendanceHistoryModal
        employee={viewingEmployee}
        onClose={() => setViewingEmployee(null)}
      />
    );
  }

  return (
    <div className="space-y-5 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Daily Attendance Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily attendance, working days, present/absent status, and leave records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadDailyAttendance();
              toast.success('Reloaded employee records');
            }}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm cursor-pointer"
          >
            <IoRefreshOutline size={16} /> Refresh Data
          </button>
        </div>
      </div>

      {/* 1. Top Metrics Cards & Donut Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Metric Cards Grid (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Total Staff */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Staff
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <IoPeopleOutline size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{employees.length}</span>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Active Staff</p>
            </div>
          </div>

          {/* Present */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Present
              </span>
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
                <IoCheckmarkCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{presentCount}</span>
              <p className="text-xs text-green-600 mt-0.5 font-medium">On Shift</p>
            </div>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Absent
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <IoCloseCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{absentCount}</span>
              <p className="text-xs text-red-500 mt-0.5 font-medium">Unexcused</p>
            </div>
          </div>

          {/* Half Day */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Half Day
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <IoTimeOutline size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{halfDayCount}</span>
              <p className="text-xs text-amber-600 mt-0.5 font-medium">Partial Shift</p>
            </div>
          </div>

          {/* Leave */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Leave
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{leaveCount}</span>
              <p className="text-xs text-purple-600 mt-0.5 font-medium">Approved</p>
            </div>
          </div>

          {/* Not Marked */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                Not Marked
              </span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <IoHelpCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{notMarkedCount}</span>
              <p className="text-xs text-orange-600 mt-0.5 font-medium">Unmarked</p>
            </div>
          </div>
        </div>

        {/* Attendance Summary Donut Chart Card (1 col) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Attendance Breakdown</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{selectedDate}</p>
          </div>

          <div className="relative w-full h-[120px] my-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-gray-900 leading-none">{employees.length}</span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Staff</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-gray-100 text-[10px] font-semibold">
            {chartData.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  <span className="text-gray-600 truncate">{stat.name}</span>
                </div>
                <span className="text-gray-900 font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Reference Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Row 1: Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-3 items-end">
          <div className="relative" ref={datePickerRef}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Select Date
            </label>
            <button
              type="button"
              onClick={() => setShowCalendarPopover(!showCalendarPopover)}
              className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IoCalendarOutline size={15} className="text-blue-600" />
                <span className="font-bold">{formatDisplayDate(selectedDate)}</span>
              </div>
              <IoChevronDownOutline
                className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${showCalendarPopover ? 'rotate-180' : ''
                  }`}
                size={13}
              />
            </button>

            {showCalendarPopover && (
              <div className="absolute left-0 mt-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <Calendar
                  value={selectedDate}
                  onChange={(newDate) => {
                    setSelectedDate(newDate);
                    setShowCalendarPopover(false);
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Branch
            </label>
            <CustomSelect
              value={selectedBranchId}
              onChange={(val) => setSelectedBranchId(Number(val))}
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
              placeholder="Branch Filter"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Designation
            </label>
            <CustomSelect
              value={designation}
              onChange={setDesignation}
              options={['All Designations', 'Cook', 'Helper', 'Manager', 'Accountant', 'Staff']}
              placeholder="Designation Filter"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Status
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={['All Status', 'PRESENT', 'ABSENT', 'HALF DAY', 'LEAVE', 'NOT MARKED']}
              placeholder="Status Filter"
            />
          </div>

          <div className="xl:col-span-2 relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl pl-8 pr-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Filters applied')}
              className="h-[36px] px-3 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
            >
              <IoFilterOutline size={15} /> Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="h-[36px] px-2.5 text-gray-500 hover:text-gray-900 text-xs font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className={`px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm ${isSaving
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:bg-blue-700 cursor-pointer active:scale-98'
                }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving Attendance...</span>
                </>
              ) : (
                <>
                  <IoAddOutline size={16} />
                  <span>Save Attendance</span>
                </>
              )}
            </button>
            <button
              onClick={handleBulkMarkPresent}
              disabled={isSaving || isMarkingPresent}
              className={`px-3.5 py-2 bg-white border border-gray-200 text-blue-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${isMarkingPresent
                  ? 'opacity-75 cursor-not-allowed bg-blue-50/50'
                  : 'hover:bg-blue-50 cursor-pointer active:scale-98'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isMarkingPresent ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-blue-600 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Marking Present...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircleOutline size={16} />
                  <span>Mark All Present</span>
                </>
              )}
            </button>
          </div>

          <span className="text-xs font-semibold text-gray-500">
            Total: <span className="font-bold text-gray-900">{filteredEmployees.length}</span> employee(s)
          </span>
        </div>
      </div>

      {/* 3. Main Reference Table Container (Full Width) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-4 pl-6 pr-4 text-left">Employee</th>
                <th className="py-4 px-4 text-left">Designation</th>
                <th className="py-4 px-4 text-center">
                  <div className="inline-flex items-center justify-center gap-1">
                    Working Days <IoInformationCircleOutline className="text-gray-400" size={14} />
                  </div>
                </th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Type</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {loading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse h-[73px]">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                        <div className="space-y-1.5 w-36">
                          <div className="h-3.5 bg-gray-200 rounded w-28"></div>
                          <div className="h-2.5 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3.5 bg-gray-200 rounded w-20"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-3.5 bg-gray-200 rounded w-10 mx-auto"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-gray-200 rounded-lg w-24 mx-auto"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-6 bg-gray-200 rounded-full w-14 mx-auto"></div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-7 w-20 bg-gray-200 rounded-lg mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Employee Column with Letter Avatar + Name + ID + Remarks Badge */}
                    <td className="py-4 pl-6 pr-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border shadow-xs ${getAvatarColor(row.name)}`}>
                          {getInitials(row.name)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-tight">
                            {row.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono text-gray-500 font-semibold">
                              {row.empId}
                            </span>
                            {row.remarks && row.remarks !== '-' && (
                              <button
                                type="button"
                                onClick={() =>
                                  setRemarkEmployee({
                                    id: row.id,
                                    name: row.name,
                                    empId: row.empId,
                                    currentRemark: row.remarks,
                                    isViewOnly: true
                                  })
                                }
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100 hover:bg-purple-100 transition-colors cursor-pointer shadow-2xs"
                                title="Click to view remark message"
                              >
                                <IoChatboxEllipsesOutline size={11} className="text-purple-600" />
                                <span className="truncate max-w-[140px]">{row.remarks}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Designation */}
                    <td className="py-4 px-4 text-left font-semibold text-gray-800 text-sm">
                      {row.designation}
                    </td>

                    {/* Working Days */}
                    <td className="py-4 px-4 text-center font-bold text-gray-900 text-sm">
                      {row.workingDays}
                    </td>

                    {/* Status Badge Dropdown */}
                    <td className="py-4 px-4 text-center">
                      <div
                        className="relative inline-block text-left status-dropdown-container"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenStatusDropdownId(
                              openStatusDropdownId === row.id ? null : row.id
                            )
                          }
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${getStatusBadgeStyle(
                            row.status
                          )}`}
                        >
                          <span>{row.status}</span>
                          <IoChevronDownOutline
                            className={`transition-transform duration-200 ${openStatusDropdownId === row.id ? 'rotate-180' : ''
                              }`}
                            size={11}
                          />
                        </button>

                        {openStatusDropdownId === row.id && (
                          <div
                            className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 font-sans"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                              Set Status
                            </div>
                            {[
                              'PRESENT',
                              'ABSENT',
                              'HALF DAY',
                              'LEAVE',
                              'NOT MARKED'
                            ].map((statusOption) => (
                              <button
                                key={statusOption}
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateEmployeeStatus(row.id, statusOption);
                                  setOpenStatusDropdownId(null);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${row.status === statusOption
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700 hover:bg-gray-50'
                                  }`}
                              >
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusBadgeStyle(
                                    statusOption
                                  )}`}
                                >
                                  {statusOption}
                                </span>
                                {row.status === statusOption && (
                                  <IoCheckmarkOutline
                                    size={14}
                                    className="text-gray-800 shrink-0 ml-1"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Paid Field with Toggle Button */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={row.is_paid !== false}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEmployeePaid(row.id);
                          }}
                          className={`relative inline-flex h-6 w-11 p-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none focus:outline-none focus:ring-0 shadow-2xs ${row.is_paid !== false ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          title={
                            row.is_paid !== false
                              ? 'Paid (Click to toggle Unpaid leave)'
                              : 'Unpaid (Click to toggle Paid leave)'
                          }
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${row.is_paid !== false ? 'translate-x-5' : 'translate-x-0'
                              }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-bold select-none min-w-[42px] text-left transition-colors ${row.is_paid !== false ? 'text-emerald-700' : 'text-gray-500'
                            }`}
                        >
                          {row.is_paid !== false ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View History Button */}
                        <button
                          type="button"
                          onClick={() => setViewingEmployee(row)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer"
                          title="View Attendance History Log"
                        >
                          <IoEyeOutline size={16} />
                        </button>

                        {/* Edit Attendance Record Button */}
                        <button
                          type="button"
                          onClick={() => setEditingEmployee({ ...row })}
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                          title="Edit Attendance Record"
                        >
                          <IoCreateOutline size={16} />
                        </button>

                        {/* Add / Edit Remark Reason Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setRemarkEmployee({
                              id: row.id,
                              name: row.name,
                              empId: row.empId,
                              currentRemark: row.remarks === '-' ? '' : row.remarks,
                              isViewOnly: false
                            })
                          }
                          className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors cursor-pointer"
                          title={row.remarks && row.remarks !== '-' ? 'Edit Remark Reason' : 'Add Remark Reason'}
                        >
                          <IoChatboxEllipsesOutline size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500 font-medium text-sm">
                    No employees found matching the filters.
                  </td>
                </tr>
              )}
              {paginatedEmployees.length > 0 && emptyRowsCount > 0 && (
                Array.from({ length: emptyRowsCount }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-[73px] border-b border-gray-100/40">
                    <td colSpan="6">&nbsp;</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500 bg-white">
          <p>
            Showing {filteredEmployees.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of{' '}
            {filteredEmployees.length} entries
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <IoChevronBackOutline size={13} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${currentPage === idx + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <IoChevronForwardOutline size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Attendance Record Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border shadow-xs ${getAvatarColor(editingEmployee.name)}`}>
                  {getInitials(editingEmployee.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{editingEmployee.name}</h3>
                  <span className="text-xs font-mono text-gray-500 font-semibold">{editingEmployee.empId} • {editingEmployee.designation}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['PRESENT', 'ABSENT', 'HALF DAY', 'LEAVE', 'NOT MARKED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingEmployee({ ...editingEmployee, status: st })}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${editingEmployee.status === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Status Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-800">
                    Paid Status
                  </label>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {editingEmployee.is_paid !== false
                      ? 'Paid attendance / Paid leave'
                      : 'Unpaid attendance / Loss of pay (LOP)'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={editingEmployee.is_paid !== false}
                    onClick={() =>
                      setEditingEmployee({
                        ...editingEmployee,
                        is_paid: editingEmployee.is_paid === false ? true : false
                      })
                    }
                    className={`relative inline-flex h-6 w-11 p-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none focus:outline-none focus:ring-0 ${editingEmployee.is_paid !== false ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${editingEmployee.is_paid !== false ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                  </button>
                  <span
                    className={`text-xs font-bold select-none min-w-[42px] ${editingEmployee.is_paid !== false ? 'text-emerald-700' : 'text-gray-500'
                      }`}
                  >
                    {editingEmployee.is_paid !== false ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  value={editingEmployee.remarks === '-' ? '' : editingEmployee.remarks}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, remarks: e.target.value })}
                  placeholder="Enter remarks or details..."
                  className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingEmployee(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModalRecord}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remark Popup Modal (View-Only or Add/Edit) */}
      {remarkEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <IoChatboxEllipsesOutline size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">
                    {remarkEmployee.isViewOnly
                      ? 'Attendance Remark'
                      : remarkEmployee.currentRemark
                        ? 'Edit Remark Reason'
                        : 'Add Remark Reason'}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    {remarkEmployee.name} <span className="font-mono">({remarkEmployee.empId})</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemarkEmployee(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Modal Body */}
            {remarkEmployee.isViewOnly ? (
              /* View-Only Remark Message */
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Remark Message
                </label>
                <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-4 text-xs font-semibold text-purple-950 leading-relaxed break-words shadow-2xs">
                  {remarkEmployee.currentRemark || 'No remark message.'}
                </div>
              </div>
            ) : (
              /* Manual Input Box for Add / Edit */
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Enter Remark Reason Manually:
                </label>
                <textarea
                  rows={4}
                  autoFocus
                  value={remarkEmployee.currentRemark}
                  onChange={(e) => setRemarkEmployee({ ...remarkEmployee, currentRemark: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      saveEmployeeRemark(remarkEmployee.id, remarkEmployee.currentRemark);
                      setRemarkEmployee(null);
                    }
                  }}
                  placeholder="Enter remark reason manually..."
                  className="w-full text-xs border border-gray-200 rounded-xl p-3 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
                <p className="text-[11px] text-gray-400">Press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px]">Enter</kbd> to save remark</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              {remarkEmployee.isViewOnly ? (
                <button
                  type="button"
                  onClick={() => setRemarkEmployee(null)}
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Close
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setRemarkEmployee(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      saveEmployeeRemark(remarkEmployee.id, remarkEmployee.currentRemark);
                      setRemarkEmployee(null);
                    }}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Save Remark
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;
