import React, { useState, useEffect, useRef } from 'react';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoAddOutline,
  IoWalletOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoBusinessOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoCheckmarkDoneOutline,
  IoPrintOutline,
  IoCloseCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';
import { Calendar } from '../../components/ui/calendar';
import toast from 'react-hot-toast';
import { advanceService } from '../../services/advanceService';
import { getEmployees } from '../../api/employees.api';

const defaultEmployeesList = [
  { id: 7, name: 'aby' },
  { id: 4, name: 'Test Employee cook KYLM' },
  { id: 10, name: 'Test Cook' }
];

const formatCurrency = (amount) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Advances = () => {
  const [advancesList, setAdvancesList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [employeesList, setEmployeesList] = useState(defaultEmployeesList);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [selectedDate, setSelectedDate] = useState('2026-09-29');
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const datePickerRef = useRef(null);

  // Form custom dropdowns & calendar popovers
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);
  const [empSearchQuery, setEmpSearchQuery] = useState('');
  const empDropdownRef = useRef(null);

  const [showFormCalendarPopover, setShowFormCalendarPopover] = useState(false);
  const formDatePickerRef = useRef(null);

  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLedgerAdvance, setSelectedLedgerAdvance] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employee: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    reason: '',
    remarks: ''
  });

  const selectedEmpObj = employeesList.find((e) => String(e.id) === String(formData.employee));
  const filteredEmpList = employeesList.filter((emp) => {
    const name = (emp.name || emp.employee_name || '').toLowerCase();
    const id = String(emp.id).toLowerCase();
    const q = empSearchQuery.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const loadAdvances = async (page = 1) => {
    setLoading(true);
    try {
      const data = await advanceService.fetchAdvances(page, pageSize);
      setAdvancesList(data?.results || []);
      setTotalCount(typeof data?.count === 'number' ? data.count : (data?.results?.length || 0));
    } catch (err) {
      console.error('Failed to load advance records:', err);
      setAdvancesList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvances(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchEmployeesData = async () => {
      try {
        const data = await getEmployees();
        if (Array.isArray(data) && data.length > 0) {
          setEmployeesList(data);
        }
      } catch (err) {
        console.warn('Unable to load employees list, using defaults:', err);
      }
    };
    fetchEmployeesData();
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCalendarPopover(false);
      }
      if (empDropdownRef.current && !empDropdownRef.current.contains(e.target)) {
        setShowEmpDropdown(false);
      }
      if (formDatePickerRef.current && !formDatePickerRef.current.contains(e.target)) {
        setShowFormCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Filtered List
  const filteredAdvances = advancesList.filter((adv) => {
    const empName = adv.employee_name || adv.name || '';
    const idStr = String(adv.id);
    const branch = adv.branch_name || adv.department || '';

    const matchesSearch =
      empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Status' || (adv.status && adv.status.toUpperCase() === statusFilter.toUpperCase());

    const matchesDept =
      departmentFilter === 'All Departments' || branch === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Calculate Metrics based on current dataset
  const totalOutstanding = advancesList
    .filter((a) => a.status === 'APPROVED')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalDisbursedThisMonth = advancesList
    .filter((a) => a.status === 'APPROVED')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const pendingRequests = advancesList.filter((a) => a.status === 'PENDING');
  const pendingAmount = pendingRequests.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const totalRecovered = advancesList
    .filter((a) => a.status === 'REPAID')
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  // Handle Approve Action
  const handleApprove = async (advId) => {
    const loadingToast = toast.loading(`Approving advance #${advId}...`);
    try {
      const res = await advanceService.approveAdvance(advId);
      toast.success(res?.message || `Advance #${advId} approved successfully!`, { id: loadingToast });
      loadAdvances(currentPage);
    } catch (error) {
      const msg = error?.userMessage || error?.response?.data?.detail || `Failed to approve advance #${advId}`;
      toast.error(msg, { id: loadingToast });
    }
  };

  // Handle Reject Action
  const handleReject = async (advId) => {
    const loadingToast = toast.loading(`Rejecting advance #${advId}...`);
    try {
      const res = await advanceService.rejectAdvance(advId);
      toast.success(res?.message || `Advance #${advId} rejected successfully!`, { id: loadingToast });
      loadAdvances(currentPage);
    } catch (error) {
      const msg = error?.userMessage || error?.response?.data?.detail || `Failed to reject advance #${advId}`;
      toast.error(msg, { id: loadingToast });
    }
  };

  // Submit New Request
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) {
      toast.error('Please select an employee');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid advance amount');
      return;
    }

    const payload = {
      employee: Number(formData.employee),
      amount: String(formData.amount),
      date: formData.date || new Date().toISOString().slice(0, 10),
      reason: formData.reason || '',
      remarks: formData.remarks || ''
    };

    const loadingToast = toast.loading('Submitting advance request...');
    try {
      await advanceService.addAdvance(payload);
      toast.success('Advance request submitted successfully!', { id: loadingToast });
      setShowRequestModal(false);
      setFormData({
        employee: '',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        reason: '',
        remarks: ''
      });
      loadAdvances(currentPage);
    } catch (error) {
      const msg = error?.userMessage || error?.response?.data?.detail || 'Failed to submit advance request';
      toast.error(msg, { id: loadingToast });
    }
  };

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Height preservation placeholder calculation
  const emptyRowsCount = Math.max(0, pageSize - filteredAdvances.length);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">

      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Payroll</span> &gt; <span className="text-slate-700">Salary Advances</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Employee Salary Advances
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage employee advance requests, approval status, and pagination records.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoAddOutline size={18} /> Request Advance
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Advance Balance */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <IoWalletOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Active Balance</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalOutstanding)}</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Approved Balance</p>
            </div>
          </div>
        </div>

        {/* Total Approved */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <IoCashOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Approved</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalDisbursedThisMonth)}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Disbursed Advances</p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <IoTimeOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Pending Approval</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{pendingRequests.length} Requests</h3>
              <p className="text-[11px] text-orange-600 font-semibold mt-0.5">{formatCurrency(pendingAmount)} Awaiting</p>
            </div>
          </div>
        </div>

        {/* Recovered */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IoCheckmarkCircleOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Settled</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalRecovered)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Repaid Advances</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">

        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Advance</label>
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search Employee, ID, Branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department / Branch Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Departments">All Branches</option>
              <option value="Al Naaz Kayamkulam">Al Naaz Kayamkulam</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REPAID">Repaid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="relative" ref={datePickerRef}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter Date</label>
            <button
              type="button"
              onClick={() => setShowCalendarPopover(!showCalendarPopover)}
              className="w-full flex items-center justify-between text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 hover:border-blue-400 focus:outline-none transition-all font-semibold shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IoCalendarOutline size={15} className="text-blue-600" />
                <span>{selectedDate}</span>
              </div>
              <IoChevronDownOutline
                className={`text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${showCalendarPopover ? 'rotate-180' : ''
                  }`}
                size={13}
              />
            </button>

            {showCalendarPopover && (
              <div className="absolute right-0 mt-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
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

          {/* Reset Filters */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All Status');
                setDepartmentFilter('All Departments');
              }}
              className="w-full py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Advances Table */}
        <div className="overflow-x-auto min-h-[530px]">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3.5 text-left align-middle">ID</th>
                <th className="p-3.5 text-left align-middle min-w-[180px]">Employee Name</th>
                <th className="p-3.5 text-right align-middle">Amount</th>
                <th className="p-3.5 text-left align-middle">Date</th>
                <th className="p-3.5 text-left align-middle">Reason</th>
                <th className="p-3.5 text-left align-middle">Remarks</th>
                <th className="p-3.5 text-left align-middle">Branch Name</th>
                <th className="p-3.5 text-left align-middle">Requested By</th>
                <th className="p-3.5 text-left align-middle">Approved By</th>
                <th className="p-3.5 text-center align-middle">Status</th>
                <th className="p-3.5 text-center align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="h-[52px] border-b border-slate-100 animate-pulse">
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-8"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-36"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200/80 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-24"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-24"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-28"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-16"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200/80 rounded w-16"></div></td>
                    <td className="p-3.5 text-center"><div className="h-4 bg-slate-200/80 rounded w-16 mx-auto"></div></td>
                    <td className="p-3.5 text-center"><div className="h-4 bg-slate-200/80 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan="11" className="p-12 text-center text-slate-400 font-medium">
                    No advance records found.
                  </td>
                </tr>
              ) : (
                <>
                  {filteredAdvances.map((row) => (
                    <tr key={row.id} className="h-[52px] hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 align-middle whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-600">#{row.id}</span>
                      </td>

                      <td className="p-3.5 align-middle font-semibold text-slate-900 whitespace-nowrap">
                        {row.employee_name || row.name || `Employee #${row.employee}`}
                      </td>

                      <td className="p-3.5 text-right align-middle font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(row.amount)}
                      </td>

                      <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap font-medium">
                        {row.date || (row.created_at ? row.created_at.slice(0, 10) : '-')}
                      </td>

                      <td className="p-3.5 align-middle text-slate-600 max-w-[150px] truncate">
                        {row.reason || '-'}
                      </td>

                      <td className="p-3.5 align-middle text-slate-600 max-w-[150px] truncate">
                        {row.remarks || '-'}
                      </td>

                      <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {row.branch_name || 'Al Naaz Kayamkulam'}
                        </span>
                      </td>

                      <td className="p-3.5 align-middle text-slate-600 whitespace-nowrap font-medium">
                        {row.requested_by_name || 'admin'}
                      </td>

                      <td className="p-3.5 align-middle text-slate-600 whitespace-nowrap font-medium">
                        {row.approved_by_name || (row.approved_by ? 'admin' : '-')}
                      </td>

                      <td className="p-3.5 text-center align-middle whitespace-nowrap">
                        {row.status === 'APPROVED' && (
                          <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                            APPROVED
                          </span>
                        )}
                        {row.status === 'PENDING' && (
                          <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-orange-100 text-orange-600 uppercase tracking-wider">
                            PENDING
                          </span>
                        )}
                        {row.status === 'REPAID' && (
                          <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-blue-100 text-blue-700 uppercase tracking-wider">
                            REPAID
                          </span>
                        )}
                        {row.status === 'REJECTED' && (
                          <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-rose-100 text-rose-700 uppercase tracking-wider">
                            REJECTED
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-center align-middle whitespace-nowrap">
                        <div className="flex justify-center items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedLedgerAdvance(row)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Details"
                          >
                            <IoEyeOutline size={14} /> View
                          </button>

                          {row.status === 'PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(row.id)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                                title="Approve Advance"
                              >
                                <IoCheckmarkDoneOutline size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(row.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                                title="Reject Request"
                              >
                                <IoCloseCircleOutline size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Empty rows filler to maintain 10-row container height when page has fewer items */}
                  {emptyRowsCount > 0 &&
                    Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="h-[52px] border-b border-slate-100/40">
                        <td colSpan="11" className="p-3.5">&nbsp;</td>
                      </tr>
                    ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">
            Showing {startItem} to {endItem} of {totalCount} advance entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <IoChevronBackOutline size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <IoChevronForwardOutline size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Request / Disburse Advance Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <IoAddOutline size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Request Salary Advance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Custom Themed Employee Selection Dropdown */}
              <div className="relative" ref={empDropdownRef}>
                <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
                <button
                  type="button"
                  onClick={() => setShowEmpDropdown(!showEmpDropdown)}
                  className={`w-full text-xs font-semibold border rounded-xl px-3 py-2.5 bg-white flex items-center justify-between transition-all cursor-pointer ${showEmpDropdown ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <span className={formData.employee ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
                    {selectedEmpObj ? `${selectedEmpObj.name || selectedEmpObj.employee_name} (ID: ${selectedEmpObj.id})` : 'Select Employee'}
                  </span>
                  <IoChevronDownOutline
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${showEmpDropdown ? 'rotate-180 text-blue-600' : ''}`}
                  />
                </button>

                {showEmpDropdown && (
                  <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 animate-in fade-in zoom-in-95 duration-100 space-y-1.5">
                    <div className="relative p-0.5">
                      <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                      <input
                        type="text"
                        placeholder="Search employee by name or ID..."
                        value={empSearchQuery}
                        onChange={(e) => setEmpSearchQuery(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                      {filteredEmpList.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">No employees found</div>
                      ) : (
                        filteredEmpList.map((emp) => {
                          const isSelected = String(formData.employee) === String(emp.id);
                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                setFormData({ ...formData, employee: emp.id });
                                setShowEmpDropdown(false);
                                setEmpSearchQuery('');
                              }}
                              className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
                                }`}
                            >
                              <span>{emp.name || emp.employee_name}</span>
                              <span className="text-[10px] font-mono text-slate-400">ID: {emp.id}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    required
                  />
                </div>

                {/* Form Date Picker matching Advance filter style */}
                <div className="relative" ref={formDatePickerRef}>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <button
                    type="button"
                    onClick={() => setShowFormCalendarPopover(!showFormCalendarPopover)}
                    className="w-full flex items-center justify-between text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-800 hover:border-blue-400 focus:outline-none transition-all font-semibold shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline size={15} className="text-blue-600" />
                      <span>{formData.date || 'Select Date'}</span>
                    </div>
                    <IoChevronDownOutline
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${showFormCalendarPopover ? 'rotate-180' : ''
                        }`}
                      size={13}
                    />
                  </button>

                  {showFormCalendarPopover && (
                    <div className="absolute right-0 mt-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <Calendar
                        value={formData.date}
                        onChange={(newDate) => {
                          setFormData({ ...formData, date: newDate });
                          setShowFormCalendarPopover(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason</label>
                <textarea
                  rows="2"
                  placeholder="Enter reason..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Enter remark..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. View Advance Details Modal */}
      {selectedLedgerAdvance && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 font-sans">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Advance Record #{selectedLedgerAdvance.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLedgerAdvance(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Advance Header Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{selectedLedgerAdvance.employee_name || selectedLedgerAdvance.name}</p>
                <p className="text-slate-500 font-mono">Branch: {selectedLedgerAdvance.branch_name || 'Al Naaz Kayamkulam'}</p>
              </div>
              <div className="text-right font-mono">
                <p className="text-[10px] text-slate-400 uppercase font-sans font-bold">Advance Amount</p>
                <p className="font-extrabold text-blue-600 text-sm">{formatCurrency(selectedLedgerAdvance.amount)}</p>
              </div>
            </div>

            {/* Detailed Table view */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs divide-y divide-slate-100">
              <div className="p-3 flex justify-between bg-slate-50/50">
                <span className="font-bold text-slate-500">Date</span>
                <span className="font-mono">{selectedLedgerAdvance.date || (selectedLedgerAdvance.created_at ? selectedLedgerAdvance.created_at.slice(0, 10) : '-')}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-bold text-slate-500">Status</span>
                <span className="font-bold uppercase text-blue-600">{selectedLedgerAdvance.status}</span>
              </div>
              <div className="p-3 flex justify-between bg-slate-50/50">
                <span className="font-bold text-slate-500">Requested By</span>
                <span>{selectedLedgerAdvance.requested_by_name || 'admin'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-bold text-slate-500">Approved By</span>
                <span>{selectedLedgerAdvance.approved_by_name || (selectedLedgerAdvance.approved_by ? 'admin' : 'Pending')}</span>
              </div>
              <div className="p-3 flex justify-between bg-slate-50/50">
                <span className="font-bold text-slate-500">Reason</span>
                <span>{selectedLedgerAdvance.reason || '-'}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="font-bold text-slate-500">Remarks</span>
                <span>{selectedLedgerAdvance.remarks || '-'}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Printing advance slip for #${selectedLedgerAdvance.id}...`);
                  setSelectedLedgerAdvance(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <IoPrintOutline size={16} /> Print Slip
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Advances;
