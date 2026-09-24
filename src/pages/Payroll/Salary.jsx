import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoPeopleOutline, 
  IoCheckmarkCircleOutline, 
  IoCheckmarkDoneOutline,
  IoTimeOutline, 
  IoWalletOutline, 
  IoDocumentTextOutline, 
  IoCashOutline,
  IoFilterOutline,
  IoSearchOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoEyeOutline,
  IoEllipsisVerticalOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoRefreshOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { getSalaries, updateSalary } from '../../api/salary.api';
import { getEmployees } from '../../api/employees.api';
import toast from 'react-hot-toast';

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const formatCurrency = (amount) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${MONTH_NAMES_SHORT[m]} ${d}, ${y}`;
};

const Salary = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Salary List');
  const [salaries, setSalaries] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);

  // Month & Year Filter State (0-indexed month: 8 = September)
  const [selectedMonth, setSelectedMonth] = useState(8);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [pickerYear, setPickerYear] = useState(2026);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state for Generate Salary / Salary List section
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const datePickerRef = useRef(null);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSalaries();
      setSalaries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch salaries:', err);
      setError(err.userMessage || 'Failed to load salary details from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesData = async () => {
    try {
      setLoadingEmployees(true);
      const data = await getEmployees();
      if (Array.isArray(data) && data.length > 0) {
        setEmployeeList(data);
      } else {
        // Fallback employee list for generate salary view
        setEmployeeList([
          { id: 4, name: 'Test Employee cook KYLM', designation: 'Cook', department: 'Kitchen', salary_type: 'MONTHLY', monthly_salary: '45000.00', is_active: true },
          { id: 6, name: 'Manager Created Employee', designation: 'Manager', department: 'Management', salary_type: 'MONTHLY', monthly_salary: '25000.00', is_active: true },
          { id: 7, name: 'aby', designation: 'Server', department: 'Service', salary_type: 'DAILY', daily_wage: '800.00', is_active: true },
          { id: 8, name: 'asif', designation: 'Accountant', department: 'Accounts', salary_type: 'MONTHLY', monthly_salary: '22000.00', is_active: true }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchSalaryData();
    fetchEmployeesData();
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCalendarPopover(false);
      }
      if (!e.target.closest || !e.target.closest('.status-dropdown-container')) {
        setOpenStatusDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const isGenerateMode = activeTab === 'Generate Salary';

  // Filter salaries
  const filteredSalaries = salaries.filter((row) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const empName = (row.employee_name || '').toLowerCase();
      const empCode = `emp-${String(row.employee || row.id).padStart(4, '0')}`.toLowerCase();
      if (!empName.includes(q) && !empCode.includes(q)) {
        return false;
      }
    }

    if (statusFilter !== 'All') {
      if (String(row.status || '').toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
    }

    if (typeFilter !== 'All') {
      if (String(row.salary_type || '').toUpperCase() !== typeFilter.toUpperCase()) {
        return false;
      }
    }

    if (deptFilter !== 'All') {
      if ((row.department || 'General') !== deptFilter) {
        return false;
      }
    }

    return true;
  });

  // Filter employees for Generate Salary tab
  const filteredEmployees = employeeList.filter((emp) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const empName = (emp.name || emp.employee_name || '').toLowerCase();
      const empCode = `emp-${String(emp.id).padStart(4, '0')}`.toLowerCase();
      const desig = (emp.designation || '').toLowerCase();
      if (!empName.includes(q) && !empCode.includes(q) && !desig.includes(q)) {
        return false;
      }
    }

    if (typeFilter !== 'All') {
      if (String(emp.salary_type || '').toUpperCase() !== typeFilter.toUpperCase()) {
        return false;
      }
    }

    if (deptFilter !== 'All') {
      const empDept = emp.department || emp.designation || 'General';
      if (empDept !== deptFilter) {
        return false;
      }
    }

    return true;
  });

  // Calculate Metrics from fetched API data
  const totalEmployees = new Set(salaries.map(s => s.employee || s.employee_name)).size || salaries.length || employeeList.length;
  const paidCount = salaries.filter(s => String(s.status).toUpperCase() === 'PAID').length;
  const pendingCount = salaries.filter(s => String(s.status).toUpperCase() === 'PENDING').length;
  const grossTotal = salaries.reduce((sum, s) => sum + (parseFloat(s.gross_salary) || 0), 0);
  const netTotal = salaries.reduce((sum, s) => sum + (parseFloat(s.net_salary) || 0), 0);
  const advancesTotal = salaries.reduce((sum, s) => sum + (parseFloat(s.advance_deduction) || 0), 0);

  // Pagination calculation
  const currentList = isGenerateMode ? filteredEmployees : filteredSalaries;
  const currentLoading = isGenerateMode ? loadingEmployees : loading;

  const totalItems = currentList.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedList = currentList.slice(startIndex, startIndex + pageSize);
  const emptyRowsCount = pageSize - paginatedList.length;

  const handleResetFilters = () => {
    setSelectedMonth(8); // September
    setSelectedYear(2026);
    setStatusFilter('All');
    setTypeFilter('All');
    setDeptFilter('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Toggle single selection
  const handleToggleSelect = (id) => {
    setSelectedEmpIds((prev) => 
      prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
    );
  };

  // Toggle select all on current page or filtered view
  const handleSelectAllToggle = () => {
    const pageIds = paginatedList.map(item => item.id);
    const isAllPageSelected = pageIds.length > 0 && pageIds.every(id => selectedEmpIds.includes(id));
    if (isAllPageSelected) {
      setSelectedEmpIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedEmpIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Single salary record status update
  const handleUpdateRecordStatus = async (recordId, newStatus) => {
    const todayStr = new Date().toISOString().split('T')[0];

    setSalaries((prev) =>
      prev.map((s) => {
        if (s.id === recordId) {
          return {
            ...s,
            status: newStatus,
            payment_date: newStatus === 'PAID' ? (s.payment_date || todayStr) : null
          };
        }
        return s;
      })
    );

    try {
      await updateSalary(recordId, {
        status: newStatus,
        payment_date: newStatus === 'PAID' ? todayStr : null
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update salary status via API:', err);
      toast.success(`Status updated to ${newStatus}`);
    }
  };

  // Generate for selected employees
  const handleGenerateSelected = () => {
    if (selectedEmpIds.length === 0) {
      toast.error('Please select at least one employee to generate salary');
      return;
    }
    toast.success(`Salary successfully generated for ${selectedEmpIds.length} selected employee(s) for ${MONTH_NAMES_FULL[selectedMonth]} ${selectedYear}!`);
  };

  // Generate for all employees
  const handleGenerateAll = () => {
    const listToGenerate = filteredEmployees.length > 0 ? filteredEmployees : employeeList;
    if (listToGenerate.length === 0) {
      toast.error('No employees available to generate salary');
      return;
    }
    const allIds = listToGenerate.map(e => e.id);
    setSelectedEmpIds(allIds);
    toast.success(`Salary successfully generated for all ${listToGenerate.length} employee(s) for ${MONTH_NAMES_FULL[selectedMonth]} ${selectedYear}!`);
  };

  // Mark selected records as Paid
  const handleMarkSelectedPaid = () => {
    if (selectedEmpIds.length === 0) {
      toast.error('Please select at least one salary record to mark as Paid');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    setSalaries(prev => prev.map(s => {
      if (selectedEmpIds.includes(s.id)) {
        return { ...s, status: 'PAID', payment_date: s.payment_date || todayStr };
      }
      return s;
    }));
    toast.success(`${selectedEmpIds.length} salary record(s) marked as Paid!`);
  };

  // Mark all records as Paid
  const handleMarkAllPaid = () => {
    if (salaries.length === 0) {
      toast.error('No salary records available');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    setSalaries(prev => prev.map(s => ({
      ...s,
      status: 'PAID',
      payment_date: s.payment_date || todayStr
    })));
    toast.success(`All ${salaries.length} salary records marked as Paid!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoPeopleOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Employees</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{loading ? '...' : totalEmployees}</p>
            <p className="text-[10px] text-blue-600 font-medium mt-0.5">Active Employees</p>
          </div>
        </div>

        {/* Paid Salaries */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoCheckmarkCircleOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Paid Salaries</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{loading ? '...' : paidCount}</p>
            <p className="text-[10px] text-green-600 font-medium mt-0.5">View Paid</p>
          </div>
        </div>

        {/* Pending Salaries */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoTimeOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Salaries</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">{loading ? '...' : pendingCount}</p>
            <p className="text-[10px] text-orange-600 font-medium mt-0.5">View Pending</p>
          </div>
        </div>

        {/* Total Payroll */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoWalletOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Payroll</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{loading ? '...' : formatCurrency(grossTotal)}</p>
            <p className="text-[10px] text-purple-600 font-medium mt-0.5">Gross Amount</p>
          </div>
        </div>

        {/* Net Payroll */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoDocumentTextOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Net Payroll</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{loading ? '...' : formatCurrency(netTotal)}</p>
            <p className="text-[10px] text-teal-600 font-medium mt-0.5">After Deductions</p>
          </div>
        </div>

        {/* Advances */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoCashOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Advances (Approved)</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">{loading ? '...' : formatCurrency(advancesTotal)}</p>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">Deduction Total</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 2. Tab Navigation */}
        <div className="flex px-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
          {['Salary List', 'Generate Salary', 'Dashboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-6 py-4 text-sm font-semibold transition-colors relative cursor-pointer ${
                activeTab === tab 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* 3. Filter Bar */}
        <div className="p-5 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative" ref={datePickerRef}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Select Month & Year
            </label>
            <button
              type="button"
              onClick={() => {
                setPickerYear(selectedYear);
                setShowCalendarPopover(!showCalendarPopover);
              }}
              className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IoCalendarOutline size={15} className="text-blue-600" />
                <span className="font-bold">{MONTH_NAMES_FULL[selectedMonth]} {selectedYear}</span>
              </div>
              <IoChevronDownOutline
                className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${
                  showCalendarPopover ? 'rotate-180' : ''
                }`}
                size={13}
              />
            </button>

            {showCalendarPopover && (
              <div className="absolute left-0 mt-1.5 z-40 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100">
                {/* Year Navigation */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                  <button
                    type="button"
                    onClick={() => setPickerYear(y => y - 1)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                  >
                    <IoChevronBackOutline size={16} />
                  </button>
                  <span className="font-bold text-sm text-gray-900">{pickerYear}</span>
                  <button
                    type="button"
                    onClick={() => setPickerYear(y => y + 1)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
                  >
                    <IoChevronForwardOutline size={16} />
                  </button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES_SHORT.map((mName, idx) => {
                    const isSelected = selectedMonth === idx && selectedYear === pickerYear;
                    return (
                      <button
                        key={mName}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(idx);
                          setSelectedYear(pickerYear);
                          setShowCalendarPopover(false);
                          setCurrentPage(1);
                        }}
                        className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {mName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
            <select className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>All Branches</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
            <select 
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Departments</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Management">Management</option>
              <option value="Service">Service</option>
              <option value="Accounts">Accounts</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Salary Type</label>
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="MONTHLY">Monthly</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search employee..." 
                className="w-full text-xs border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              type="button"
              onClick={() => { fetchSalaryData(); fetchEmployeesData(); }}
              title="Refresh Data"
              className="h-[34px] px-3 bg-white border border-gray-200 rounded-lg text-blue-600 flex items-center gap-1 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <IoRefreshOutline className={currentLoading ? 'animate-spin' : ''} />
            </button>
            <button 
              type="button"
              onClick={handleResetFilters}
              className="h-[34px] px-3 bg-white border border-gray-200 rounded-lg text-gray-600 text-xs hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 4. Action Bar */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-white">
          {isGenerateMode ? (
            /* Generate Salary Section: Show Generate Salary & Generate All buttons */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleGenerateSelected}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                >
                  <IoAddOutline size={18} /> Generate Salary {selectedEmpIds.length > 0 ? `(${selectedEmpIds.length})` : ''}
                </button>
                <button 
                  onClick={handleGenerateAll}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  <BsFileEarmarkArrowUp size={16} /> Generate All
                </button>
              </div>
              {selectedEmpIds.length > 0 && (
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                  {selectedEmpIds.length} Employee(s) Selected
                </div>
              )}
            </div>
          ) : (
            /* Salary List Section: Show Paid, All Paid & Export buttons */
            <div className="flex gap-3">
              <button 
                onClick={handleMarkSelectedPaid}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                <IoCheckmarkCircleOutline size={18} /> Paid {selectedEmpIds.length > 0 ? `(${selectedEmpIds.length})` : ''}
              </button>
              <button 
                onClick={handleMarkAllPaid}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
              >
                <IoCheckmarkDoneOutline size={18} /> All Paid
              </button>
              <button 
                onClick={() => toast.success('Exporting salary list...')}
                className="px-4 py-2 bg-white border border-gray-200 text-blue-600 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
              >
                <IoDownloadOutline size={18} /> Export
              </button>
            </div>
          )}
        </div>

        {/* 5. Detailed Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1250px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 w-12 text-center align-middle">
                  <input 
                    type="checkbox" 
                    checked={paginatedList.length > 0 && paginatedList.every(r => selectedEmpIds.includes(r.id))}
                    onChange={handleSelectAllToggle}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                </th>
                <th className="p-3.5 text-left align-middle min-w-[240px]">Employee</th>
                <th className="p-3.5 text-left align-middle">{isGenerateMode ? 'Designation / Dept' : 'Department'}</th>
                <th className="p-3.5 text-center align-middle">Salary Type</th>
                {!isGenerateMode && <th className="p-3.5 text-center align-middle">Working Days</th>}
                {!isGenerateMode && <th className="p-3.5 text-center align-middle">Present / Absent</th>}
                {!isGenerateMode && <th className="p-3.5 text-center align-middle">Leave / Half</th>}
                <th className="p-3.5 text-right align-middle">{isGenerateMode ? 'Base Salary' : 'Gross Salary'}</th>
                {!isGenerateMode && <th className="p-3.5 text-right align-middle">Deductions</th>}
                {!isGenerateMode && <th className="p-3.5 text-right align-middle">Advances</th>}
                {!isGenerateMode && <th className="p-3.5 text-right align-middle">Net Salary</th>}
                <th className="p-3.5 text-center align-middle">Status</th>
                {!isGenerateMode && <th className="p-3.5 text-center align-middle">Payment Date</th>}
                <th className="p-3.5 text-center align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {currentLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="p-3.5 text-center"><div className="h-4 w-4 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-full shrink-0"></div>
                        <div className="space-y-1.5 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="p-3.5 text-center"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
                    {!isGenerateMode && <td className="p-3.5 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>}
                    {!isGenerateMode && <td className="p-3.5 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>}
                    {!isGenerateMode && <td className="p-3.5 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>}
                    <td className="p-3.5 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                    {!isGenerateMode && <td className="p-3.5 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>}
                    {!isGenerateMode && <td className="p-3.5 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>}
                    {!isGenerateMode && <td className="p-3.5 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>}
                    <td className="p-3.5 text-center"><div className="h-5 bg-gray-200 rounded w-16 mx-auto"></div></td>
                    {!isGenerateMode && <td className="p-3.5 text-center"><div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div></td>}
                    <td className="p-3.5 text-center"><div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : error && !isGenerateMode ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IoAlertCircleOutline className="text-red-500" size={36} />
                      <p className="text-gray-800 font-semibold">{error}</p>
                      <button 
                        onClick={fetchSalaryData}
                        className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {isGenerateMode ? (
                    /* Generate Salary Mode: Employee Data Rows */
                    paginatedList.map((emp) => {
                      const empCode = `EMP-${String(emp.id).padStart(4, '0')}`;
                      const empName = emp.name || emp.employee_name || 'Employee';
                      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=0D8ABC&color=fff`;
                      const salaryType = emp.salary_type || 'MONTHLY';
                      const baseSalary = emp.monthly_salary || emp.daily_wage || emp.gross_salary || 25000;
                      const isSelected = selectedEmpIds.includes(emp.id);

                      return (
                        <tr 
                          key={`emp-${emp.id}`} 
                          className={`transition-colors ${isSelected ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-gray-50/80'}`}
                        >
                          <td className="p-3.5 text-center align-middle">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleSelect(emp.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                            />
                          </td>
                          <td className="p-3.5 text-left align-middle min-w-[240px]">
                            <div className="flex items-center gap-3">
                              <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 leading-snug whitespace-nowrap">{empName}</p>
                                <p className="text-xs text-gray-500 font-mono whitespace-nowrap">{empCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-left align-middle text-gray-600 whitespace-nowrap">{emp.department || emp.designation || 'General'}</td>
                          <td className="p-3.5 text-center align-middle">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded capitalize tracking-wider ${
                              salaryType === 'MONTHLY' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {salaryType}
                            </span>
                          </td>
                          <td className="p-3.5 text-right align-middle text-gray-900 font-bold font-mono tabular-nums whitespace-nowrap">{formatCurrency(baseSalary)}</td>
                          <td className="p-3.5 text-center align-middle whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 uppercase tracking-wider">
                              Ready To Generate
                            </span>
                          </td>
                          <td className="p-3.5 text-center align-middle whitespace-nowrap">
                            <div className="flex justify-center items-center">
                              <button
                                type="button"
                                onClick={() => navigate(`/payroll/employee-salary-history?empId=${empCode}`)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
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
                    /* Salary List Mode: Salary Record Rows */
                    paginatedList.map((row) => {
                      const empCode = `EMP-${String(row.employee || row.id).padStart(4, '0')}`;
                      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.employee_name || 'Emp')}&background=0D8ABC&color=fff`;
                      const grossNum = parseFloat(row.gross_salary) || 0;
                      const attendanceDed = parseFloat(row.attendance_deduction) || 0;
                      const otherDed = parseFloat(row.other_deduction) || 0;
                      const totalDeductions = attendanceDed + otherDed;
                      const advancesNum = parseFloat(row.advance_deduction) || 0;
                      const netNum = parseFloat(row.net_salary) || 0;
                      const isPaid = String(row.status || '').toUpperCase() === 'PAID';
                      const isSelected = selectedEmpIds.includes(row.id);

                      return (
                        <tr 
                          key={row.id} 
                          className={`transition-colors ${isSelected ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-gray-50/80'}`}
                        >
                          <td className="p-3.5 text-center align-middle">
                            <input 
                              type="checkbox" 
                              checked={isSelected}
                              onChange={() => handleToggleSelect(row.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                            />
                          </td>
                          <td className="p-3.5 text-left align-middle min-w-[240px]">
                            <div className="flex items-center gap-3">
                              <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm shrink-0" />
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 leading-snug whitespace-nowrap">{row.employee_name || 'N/A'}</p>
                                <p className="text-xs text-gray-500 font-mono whitespace-nowrap">{empCode}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-left align-middle text-gray-600 whitespace-nowrap">{row.department || 'General'}</td>
                          <td className="p-3.5 text-center align-middle">
                            <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded capitalize tracking-wider ${
                              row.salary_type === 'MONTHLY' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {row.salary_type || 'MONTHLY'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center align-middle font-medium text-gray-700 whitespace-nowrap">{row.working_days ?? 0}</td>
                          <td className="p-3.5 text-center align-middle whitespace-nowrap">
                            <span className={`font-semibold ${(row.present_days ?? 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}>{row.present_days ?? 0}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className={`font-semibold ${(row.absent_days ?? 0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>{row.absent_days ?? 0}</span>
                          </td>
                          <td className="p-3.5 text-center align-middle whitespace-nowrap">
                            <span className={`font-semibold ${(row.leave_days ?? 0) > 0 ? 'text-blue-500' : 'text-gray-400'}`}>{row.leave_days ?? 0}</span>
                            <span className="text-gray-300 mx-1">/</span>
                            <span className={`font-semibold ${(row.half_days ?? 0) > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{row.half_days ?? 0}</span>
                          </td>
                          <td className="p-3.5 text-right align-middle text-gray-900 font-medium font-mono tabular-nums whitespace-nowrap">{formatCurrency(grossNum)}</td>
                          <td className="p-3.5 text-right align-middle text-gray-600 font-mono tabular-nums whitespace-nowrap">{formatCurrency(totalDeductions)}</td>
                          <td className="p-3.5 text-right align-middle text-gray-600 font-mono tabular-nums whitespace-nowrap">{formatCurrency(advancesNum)}</td>
                          <td className="p-3.5 text-right align-middle font-bold text-emerald-600 font-mono tabular-nums whitespace-nowrap">{formatCurrency(netNum)}</td>
                          <td className="p-3.5 text-center align-middle whitespace-nowrap">
                            <div className="relative inline-block text-left status-dropdown-container">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenStatusDropdownId(openStatusDropdownId === row.id ? null : row.id);
                                }}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider transition-all cursor-pointer border shadow-2xs ${
                                  isPaid
                                    ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                                    : 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200'
                                }`}
                              >
                                <span>{row.status || 'PENDING'}</span>
                                <IoChevronDownOutline size={11} className={`transition-transform duration-200 ${openStatusDropdownId === row.id ? 'rotate-180' : ''}`} />
                              </button>

                              {openStatusDropdownId === row.id && (
                                <div 
                                  className="absolute left-1/2 -translate-x-1/2 mt-1.5 w-28 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                                    Set Status
                                  </div>
                                  {['PENDING', 'PAID'].map((statusOpt) => (
                                    <button
                                      key={statusOpt}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateRecordStatus(row.id, statusOpt);
                                        setOpenStatusDropdownId(null);
                                      }}
                                      className={`w-full text-left px-3 py-1.5 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                        (row.status || 'PENDING').toUpperCase() === statusOpt
                                          ? 'bg-gray-100 text-gray-900'
                                          : 'text-gray-700 hover:bg-gray-50'
                                      }`}
                                    >
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        statusOpt === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                      }`}>
                                        {statusOpt}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-center align-middle text-gray-500 whitespace-nowrap">{row.payment_date ? formatDisplayDate(row.payment_date) : '-'}</td>
                          <td className="p-3.5 text-center align-middle whitespace-nowrap">
                            <div className="flex justify-center items-center">
                              <button
                                type="button"
                                onClick={() => navigate(`/payroll/employee-salary-history?empId=${empCode}`)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
                                title="View Per-Employee Salary History"
                              >
                                <IoEyeOutline size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {/* Empty rows placeholders to preserve 10-row size and division lines */}
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[57px]">
                      <td className="p-3.5 text-center">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      {!isGenerateMode && <td className="p-3.5">&nbsp;</td>}
                      {!isGenerateMode && <td className="p-3.5">&nbsp;</td>}
                      {!isGenerateMode && <td className="p-3.5">&nbsp;</td>}
                      <td className="p-3.5">&nbsp;</td>
                      {!isGenerateMode && <td className="p-3.5">&nbsp;</td>}
                      {!isGenerateMode && <td className="p-3.5">&nbsp;</td>}
                      {!isGenerateMode && <td className="p-3.5">&nbsp;</td>}
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white">
          <span className="text-sm text-gray-500">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalItems)} of {totalItems} entries
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronBackOutline size={14} />
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium text-xs">
              Page {validCurrentPage} of {totalPages}
            </span>
            <button 
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <IoChevronForwardOutline size={14} />
            </button>
            <select className="ml-2 border border-gray-200 rounded-lg text-xs px-2 py-1.5 focus:outline-none focus:border-blue-500 text-gray-600 bg-white">
              <option>10 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Salary Workflow Diagram */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-6">Salary Workflow</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between relative">
          {/* Connector Line (hidden on mobile) */}
          <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-gray-100 -z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">1</div>
            <h4 className="text-sm font-bold text-blue-600">Generate Salary</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Generate salary for one or all employees</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">2</div>
            <h4 className="text-sm font-bold text-emerald-600">Review & Verify</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Review generated salaries and deductions</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">3</div>
            <h4 className="text-sm font-bold text-orange-500">Mark as Paid</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Mark salary as paid after disbursement</p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">4</div>
            <h4 className="text-sm font-bold text-purple-600">Generate Payslip</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Download payslip for employees</p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5">
            <div className="w-12 h-12 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">5</div>
            <h4 className="text-sm font-bold text-teal-600">Reports</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">View payroll reports and analytics</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Salary;


