import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoCalendarOutline,
  IoTimeOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoEyeOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoRefreshOutline,
  IoPersonOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { getLeaves } from '../../api/leaves.api';
import { getBranches } from '../../api/users.api';
import { getEmployees } from '../../api/employees.api';
import { Calendar } from '../../components/ui/calendar';

const MONTH_OPTIONS = [
  { value: '1', label: '01 - January' },
  { value: '2', label: '02 - February' },
  { value: '3', label: '03 - March' },
  { value: '4', label: '04 - April' },
  { value: '5', label: '05 - May' },
  { value: '6', label: '06 - June' },
  { value: '7', label: '07 - July' },
  { value: '8', label: '08 - August' },
  { value: '9', label: '09 - September' },
  { value: '10', label: '10 - October' },
  { value: '11', label: '11 - November' },
  { value: '12', label: '12 - December' }
];

const currentYearNum = new Date().getFullYear();
const YEAR_OPTIONS = [
  currentYearNum + 1,
  currentYearNum,
  currentYearNum - 1,
  currentYearNum - 2,
  currentYearNum - 3
];

const LeaveVacation = () => {
  const navigate = useNavigate();

  // Data states
  const [leaves, setLeaves] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reference Image Filters:
  // branch, employee, end_date, is_paid, month, search, start_date, year
  const initialFilters = {
    branch: 'All',
    employee: 'All',
    start_date: '',
    end_date: '',
    is_paid: 'All', // 'All' | 'true' | 'false'
    month: 'All',
    year: 'All',
    search: ''
  };

  const [filters, setFilters] = useState(initialFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Calendar popover states & refs
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // View Details Modal State
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Close calendar popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (startCalendarRef.current && !startCalendarRef.current.contains(event.target)) {
        setShowStartCalendar(false);
      }
      if (endCalendarRef.current && !endCalendarRef.current.contains(event.target)) {
        setShowEndCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 350);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Load branches & employees on mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [branchList, employeeList] = await Promise.all([
          getBranches().catch(() => []),
          getEmployees().catch(() => [])
        ]);
        setBranches(Array.isArray(branchList) ? branchList : []);
        setEmployees(Array.isArray(employeeList) ? employeeList : []);
      } catch (err) {
        console.warn('Failed to load initial metadata:', err);
      }
    };
    loadDropdownData();
  }, []);

  // Fetch leaves from API whenever filters change
  const fetchLeaves = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = {
        ...filters,
        search: debouncedSearch
      };
      const res = await getLeaves(activeFilters);
      const list = Array.isArray(res) ? res : (res?.results || []);
      setLeaves(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to fetch leave records';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [
    filters.branch,
    filters.employee,
    filters.start_date,
    filters.end_date,
    filters.is_paid,
    filters.month,
    filters.year,
    debouncedSearch
  ]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setShowStartCalendar(false);
    setShowEndCalendar(false);
    setCurrentPage(1);
    toast.success('Filters reset to default');
  };

  // Filtered employees for dropdown based on branch selection if branch is chosen
  const filteredEmployeeOptions = useMemo(() => {
    if (filters.branch === 'All') return employees;
    return employees.filter(emp => {
      const empBranchId = typeof emp.branch === 'object' ? emp.branch?.id : emp.branch;
      return String(empBranchId) === String(filters.branch);
    });
  }, [employees, filters.branch]);

  // Filter leaves according to is_paid filter (true or false)
  const displayLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      if (filters.is_paid === 'true' || filters.is_paid === true) {
        return Boolean(leave.is_paid) === true;
      }
      if (filters.is_paid === 'false' || filters.is_paid === false) {
        return Boolean(leave.is_paid) === false;
      }
      return true;
    });
  }, [leaves, filters.is_paid]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = displayLeaves.length;
    const paid = displayLeaves.filter(l => Boolean(l.is_paid) === true).length;
    const unpaid = displayLeaves.filter(l => Boolean(l.is_paid) === false).length;
    const uniqueEmployees = new Set(displayLeaves.map(l => l.employee)).size;
    return { total, paid, unpaid, uniqueEmployees };
  }, [displayLeaves]);

  // Standard Pagination Calculation
  const totalItems = displayLeaves.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const startIndex = totalItems > 0 ? (currentPage - 1) * ITEMS_PER_PAGE : 0;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
  const paginatedLeaves = displayLeaves.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Formatter helpers
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const formatDateTimeDisplay = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return isoStr;
    }
  };

  const hasActiveFilters = Boolean(
    filters.branch !== 'All' ||
    filters.employee !== 'All' ||
    filters.start_date ||
    filters.end_date ||
    filters.is_paid !== 'All' ||
    filters.month !== 'All' ||
    filters.year !== 'All' ||
    filters.search.trim()
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leave & Attendance Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Track employee leave records, verify paid vs unpaid absences, and filter by branch or date range.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLeaves}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <IoRefreshOutline size={16} className={loading ? 'animate-spin text-[#1E5E45]' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Leaves */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Leaves</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.total}</h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Recorded in system</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCalendarOutline size={24} />
          </div>
        </div>

        {/* Paid Leaves */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Paid Leaves</p>
            <h3 className="text-2xl font-bold text-emerald-600 tabular-nums">{stats.paid}</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Compensated days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        {/* Unpaid Leaves */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Unpaid Leaves</p>
            <h3 className="text-2xl font-bold text-amber-600 tabular-nums">{stats.unpaid}</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Loss of pay (LOP)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoTimeOutline size={24} />
          </div>
        </div>

        {/* Employees on Leave */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Staff Affected</p>
            <h3 className="text-2xl font-bold text-purple-600 tabular-nums">{stats.uniqueEmployees}</h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Distinct employees</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoPersonOutline size={24} />
          </div>
        </div>
      </div>

      {/* API Reference Filters Section */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E5E45]/10 text-[#1E5E45] flex items-center justify-center">
              <IoFilterOutline size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Leave Filters</h2>
              <p className="text-[11px] text-gray-500">Filter leave records by branch, employee, date range, or paid status.</p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <IoCloseOutline size={16} /> Reset All Filters
            </button>
          )}
        </div>

        {/* Grid of the 8 Parameters matching the API Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-sans">

          {/* 1. search: Search employee name */}
          <div>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Search Employee Name
            </label>
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Type employee name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] transition-all font-medium text-xs"
              />
            </div>
          </div>

          {/* 2. branch: Filter by branch ID */}
          <div>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Branch
            </label>
            <div className="relative">
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] transition-all font-medium text-xs cursor-pointer"
              >
                <option value="All">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.code ? `(${b.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. employee: Filter by employee ID */}
          <div>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Employee
            </label>
            <select
              value={filters.employee}
              onChange={(e) => handleFilterChange('employee', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] transition-all font-medium text-xs cursor-pointer"
            >
              <option value="All">All Employees</option>
              {filteredEmployeeOptions.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} (EMP-{String(emp.id).padStart(3, '0')})
                </option>
              ))}
            </select>
          </div>

          {/* 4. is_paid: Filter by paid or unpaid leave (true or false) */}
          <div>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Paid / Unpaid
            </label>
            <select
              value={filters.is_paid}
              onChange={(e) => handleFilterChange('is_paid', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] transition-all font-medium text-xs cursor-pointer"
            >
              <option value="All">-- (All Leaves)</option>
              <option value="true">Paid Leave</option>
              <option value="false">Unpaid Leave</option>
            </select>
          </div>

          {/* 5. start_date: Start date (YYYY-MM-DD) via Standard Calendar component */}
          <div className="relative" ref={startCalendarRef}>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Start Date (From)
            </label>
            <button
              type="button"
              onClick={() => {
                setShowStartCalendar(!showStartCalendar);
                setShowEndCalendar(false);
              }}
              className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <IoCalendarOutline size={15} className="text-blue-600 shrink-0" />
                <span className="truncate">
                  {filters.start_date ? formatDateDisplay(filters.start_date) : 'Select Start Date'}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {filters.start_date && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterChange('start_date', '');
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear date"
                  >
                    <IoCloseOutline size={14} />
                  </span>
                )}
                <IoChevronDownOutline
                  className={`text-gray-400 transition-transform duration-200 ${showStartCalendar ? 'rotate-180' : ''
                    }`}
                  size={13}
                />
              </div>
            </button>

            {showStartCalendar && (
              <div className="absolute left-0 mt-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <Calendar
                  value={filters.start_date || new Date().toISOString().slice(0, 10)}
                  onChange={(newDate) => {
                    handleFilterChange('start_date', newDate);
                    setShowStartCalendar(false);
                  }}
                  onClose={() => setShowStartCalendar(false)}
                />
              </div>
            )}
          </div>

          {/* 6. end_date: End date (YYYY-MM-DD) via Standard Calendar component */}
          <div className="relative" ref={endCalendarRef}>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              End Date (To)
            </label>
            <button
              type="button"
              onClick={() => {
                setShowEndCalendar(!showEndCalendar);
                setShowStartCalendar(false);
              }}
              className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <IoCalendarOutline size={15} className="text-blue-600 shrink-0" />
                <span className="truncate">
                  {filters.end_date ? formatDateDisplay(filters.end_date) : 'Select End Date'}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {filters.end_date && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFilterChange('end_date', '');
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear date"
                  >
                    <IoCloseOutline size={14} />
                  </span>
                )}
                <IoChevronDownOutline
                  className={`text-gray-400 transition-transform duration-200 ${showEndCalendar ? 'rotate-180' : ''
                    }`}
                  size={13}
                />
              </div>
            </button>

            {showEndCalendar && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <Calendar
                  value={filters.end_date || new Date().toISOString().slice(0, 10)}
                  onChange={(newDate) => {
                    handleFilterChange('end_date', newDate);
                    setShowEndCalendar(false);
                  }}
                  onClose={() => setShowEndCalendar(false)}
                />
              </div>
            )}
          </div>

          {/* 7. month: Filter by month (1-12) */}
          <div>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Month (1-12)
            </label>
            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] transition-all font-medium text-xs cursor-pointer"
            >
              <option value="All">All Months</option>
              {MONTH_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* 8. year: Filter by year */}
          <div>
            <label className="block font-bold text-gray-600 uppercase tracking-wider text-[11px] mb-1.5">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-gray-50/50 hover:bg-white text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] transition-all font-medium text-xs cursor-pointer"
            >
              <option value="All">All Years</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col">

        {/* Table Title Bar */}
        <div className="p-4 sm:px-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              Leave Records
            </h3>
            <p className="text-xs text-gray-500">
              {loading ? 'Fetching records...' : `Showing ${displayLeaves.length} records matching current filter criteria.`}
            </p>
          </div>
        </div>

        {/* Leaves Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-6">ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Leave Date</th>
                <th className="p-3.5 text-center">Paid Status</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 max-w-[250px]">Remarks</th>
                <th className="p-3.5">Recorded At</th>
                <th className="p-3.5 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skel-${i}`} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 w-10 bg-gray-100 rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-36 bg-gray-100 rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-24 bg-gray-100 rounded"></div></td>
                    <td className="p-4 text-center"><div className="h-5 w-20 bg-gray-100 rounded-full mx-auto"></div></td>
                    <td className="p-4 text-center"><div className="h-5 w-16 bg-gray-100 rounded-full mx-auto"></div></td>
                    <td className="p-4"><div className="h-4 w-40 bg-gray-100 rounded"></div></td>
                    <td className="p-4"><div className="h-4 w-28 bg-gray-100 rounded"></div></td>
                    <td className="p-4 pr-6 text-center"><div className="h-6 w-14 bg-gray-100 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IoAlertCircleOutline size={36} className="text-red-400" />
                      <p className="font-bold text-gray-800 text-sm">Failed to Load Leave Records</p>
                      <p className="text-xs text-gray-500">{error}</p>
                      <button
                        onClick={fetchLeaves}
                        className="mt-2 px-3.5 py-1.5 bg-[#1E5E45] text-white text-xs font-semibold rounded-lg hover:bg-[#154633] transition-colors cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeaves.length > 0 ? (
                paginatedLeaves.map((leave) => {
                  const empName = leave.employee_name || `Employee #${leave.employee}`;
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    empName
                  )}&background=1E5E45&color=fff&size=64`;

                  return (
                    <tr key={leave.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* ID */}
                      <td className="p-3.5 pl-6 font-mono font-bold text-gray-700 whitespace-nowrap">
                        {leave.id}
                      </td>

                      {/* Employee Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatarUrl}
                            alt={empName}
                            className="w-8 h-8 rounded-full object-cover shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate">
                              {empName}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono block">
                              EMP-{String(leave.employee).padStart(3, '0')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3.5 font-medium text-gray-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <IoCalendarOutline className="text-gray-400" size={14} />
                          <span>{formatDateDisplay(leave.date)}</span>
                        </div>
                      </td>

                      {/* Paid Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {Boolean(leave.is_paid) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <IoCheckmarkCircleOutline size={12} />
                            Paid Leave
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <IoTimeOutline size={12} />
                            Unpaid (LOP)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                          {leave.status || 'LEAVE'}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="p-3.5 text-gray-600 max-w-[250px] truncate" title={leave.remarks || 'No remarks'}>
                        {leave.remarks ? leave.remarks : <span className="text-gray-400 italic">None</span>}
                      </td>

                      {/* Created At */}
                      <td className="p-3.5 text-gray-500 whitespace-nowrap font-mono text-[11px]">
                        {formatDateTimeDisplay(leave.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedLeave(leave)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <IoEyeOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <IoCalendarOutline size={26} />
                      </div>
                      <p className="font-bold text-gray-800 text-sm mt-1">No Leave Records Found</p>
                      <p className="text-xs text-gray-500">
                        No leaves match the selected filters. Try clearing some filters or searching with a different term.
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetFilters}
                          className="mt-2 px-3 py-1.5 bg-[#1E5E45] text-white text-xs font-semibold rounded-lg hover:bg-[#154633] transition-colors cursor-pointer"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Standard Project Pagination Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium mt-auto">
          <div>
            Showing <span className="font-bold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-bold text-gray-800">{endItem}</span> of{' '}
            <span className="font-bold text-gray-800">{totalItems}</span> entries
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <IoChevronBackOutline size={14} />
            </button>

            {totalPages <= 7 ? (
              Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    disabled={loading}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })
            ) : (
              (() => {
                let pages = [];
                if (currentPage <= 4) {
                  pages = [1, 2, 3, 4, 5, '...', totalPages];
                } else if (currentPage >= totalPages - 3) {
                  pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                } else {
                  pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                }
                return pages.map((pageItem, idx) => {
                  if (pageItem === '...') {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold"
                      >
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={pageItem}
                      type="button"
                      disabled={loading}
                      onClick={() => setCurrentPage(pageItem)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${currentPage === pageItem
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {pageItem}
                    </button>
                  );
                });
              })()
            )}

            <button
              type="button"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <IoChevronForwardOutline size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Modal: View Leave Details */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Leave Record Details</h3>
                <p className="text-xs text-gray-400 font-mono">Record ID: {selectedLeave.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Employee Name:</span>
                  <span className="font-bold text-gray-900">
                    {selectedLeave.employee_name || `Employee #${selectedLeave.employee}`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Employee ID:</span>
                  <span className="font-mono text-gray-800 font-bold">
                    EMP-{String(selectedLeave.employee).padStart(3, '0')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Leave Date:</span>
                  <span className="font-bold text-gray-900">
                    {formatDateDisplay(selectedLeave.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {selectedLeave.status || 'LEAVE'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Compensation:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${Boolean(selectedLeave.is_paid)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {Boolean(selectedLeave.is_paid) ? 'Paid Leave' : 'Unpaid (LOP)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Recorded At:</span>
                  <span className="text-gray-700 font-mono text-[11px]">
                    {formatDateTimeDisplay(selectedLeave.created_at)}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-700 mb-1">Remarks / Note:</p>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 min-h-[50px]">
                  {selectedLeave.remarks ? (
                    <span>"{selectedLeave.remarks}"</span>
                  ) : (
                    <span className="text-gray-400 italic">No remarks provided for this record.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveVacation;
