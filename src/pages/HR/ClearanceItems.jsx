import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoFilterOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoShieldCheckmarkOutline,
  IoReceiptOutline,
  IoRefreshOutline,
  IoCalendarOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { clearanceService } from '../../services/clearanceService';
import { getEmployees } from '../../api/employees.api';
import { Calendar } from '../../components/ui/calendar';

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

const ClearanceItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All statuses');
  const [selectedEmployee, setSelectedEmployee] = useState('All employees');
  const [appliedFilters, setAppliedFilters] = useState({
    status: 'All statuses',
    employee: 'All employees'
  });

  // Modal State strictly matching POST /clearance/items/
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeesList, setEmployeesList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [customEmpId, setCustomEmpId] = useState('');
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const [popoverPlacement, setPopoverPlacement] = useState('top');
  const calendarRef = useRef(null);

  const handleToggleCalendar = () => {
    if (!showCalendarPopover) {
      if (calendarRef.current) {
        const rect = calendarRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 380) {
          setPopoverPlacement('top');
        } else {
          setPopoverPlacement('bottom');
        }
      } else {
        setPopoverPlacement('top');
      }
      setShowCalendarPopover(true);
    } else {
      setShowCalendarPopover(false);
    }
  };

  const [formData, setFormData] = useState({
    employee: '',
    item_name: '',
    quantity: '1',
    unit_value: '',
    employee_payable: '',
    issued_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendarPopover(false);
      }
    };
    if (showCalendarPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarPopover]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const list = await clearanceService.getItems();
      setItems(Array.isArray(list) ? list : []);
      if (isRefresh) {
        toast.success('Clearance items refreshed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load clearance items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const fetchEmployeesData = async () => {
      try {
        const data = await getEmployees();
        if (Array.isArray(data) && data.length > 0) {
          setEmployeesList(data);
        }
      } catch (err) {
        console.warn('Failed loading employees list:', err);
      }
    };
    fetchEmployeesData();
  }, []);

  // Unique employees for filter dropdown
  const employeeOptions = useMemo(() => {
    const set = new Set();
    items.forEach((it) => {
      const emp = it.employee_name || it.employee;
      if (emp) set.add(emp);
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const rawStatus = String(item.approval_status || item.status || '').toUpperCase();
      if (appliedFilters.status !== 'All statuses') {
        const filterStatus = String(appliedFilters.status).toUpperCase().replace(/\s+/g, '_');
        if (rawStatus !== filterStatus && rawStatus !== String(appliedFilters.status).toUpperCase()) {
          return false;
        }
      }
      if (appliedFilters.employee !== 'All employees') {
        const empName = item.employee_name || item.employee;
        if (String(empName).toLowerCase() !== String(appliedFilters.employee).toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [items, appliedFilters]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const pendingManager = items.filter((i) => {
      const s = String(i.approval_status || i.status || '').toUpperCase();
      return s === 'PENDING_MANAGER' || s === 'PENDING MANAGER';
    }).length;
    const pendingAdmin = items.filter((i) => {
      const s = String(i.approval_status || i.status || '').toUpperCase();
      return s === 'PENDING_ADMIN' || s === 'PENDING ADMIN';
    }).length;
    const approved = items.filter((i) => {
      const s = String(i.approval_status || i.status || '').toUpperCase();
      return s === 'APPROVED';
    }).length;
    const rejected = items.filter((i) => {
      const s = String(i.approval_status || i.status || '').toUpperCase();
      return s === 'REJECTED';
    }).length;
    const totalPayable = items.reduce((sum, i) => sum + (Number(i.employee_payable || i.payable) || 0), 0);
    const totalPaid = items.reduce((sum, i) => sum + (Number(i.total_paid !== undefined ? i.total_paid : i.paid) || 0), 0);
    return { total, pendingManager, pendingAdmin, approved, rejected, totalPayable, totalPaid };
  }, [items]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      status: selectedStatus,
      employee: selectedEmployee
    });
  };

  const handleClearFilters = () => {
    setSelectedStatus('All statuses');
    setSelectedEmployee('All employees');
    setAppliedFilters({
      status: 'All statuses',
      employee: 'All employees'
    });
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    const finalEmpId = formData.employee === 'custom' ? parseInt(customEmpId, 10) : parseInt(formData.employee, 10);
    if (!finalEmpId) {
      toast.error('Please select or enter an employee');
      return;
    }

    const itemName = formData.item_name.trim();
    if (!itemName) {
      toast.error('Please enter an item name');
      return;
    }

    const unitVal = parseFloat(formData.unit_value) || 0;
    const payableVal = formData.employee_payable !== '' ? parseFloat(formData.employee_payable) : unitVal;
    const qty = parseInt(formData.quantity, 10) || 1;

    setSubmitting(true);
    try {
      await clearanceService.addItem({
        employee: finalEmpId,
        item_name: itemName,
        quantity: qty,
        unit_value: String(unitVal),
        employee_payable: String(payableVal),
        issued_date: formData.issued_date,
        notes: formData.notes.trim()
      });

      toast.success('Clearance item issued successfully');
      setIsModalOpen(false);
      setShowCalendarPopover(false);
      setFormData({
        employee: '',
        item_name: '',
        quantity: '1',
        unit_value: '',
        employee_payable: '',
        issued_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setCustomEmpId('');
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to issue clearance item');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Pending Manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Pending Manager
          </span>
        );
      case 'Pending Admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Pending Admin
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span
              onClick={() => navigate('/hr/employees')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              HR
            </span>
            <span>&gt;</span>
            <span className="text-gray-700 font-bold">Clearance Items</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Clearance Items
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Track employee-issued items, approval lifecycles, and clearance settlement balances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh clearance items"
          >
            <IoRefreshOutline
              size={16}
              className={refreshing ? 'animate-spin text-blue-600' : ''}
            />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/hr/clearance-payments')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoReceiptOutline size={16} /> Payments
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={17} /> Issue New Item
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Issued Items</p>
            {loading ? (
              <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {stats.total} Items
              </h3>
            )}
            <p className="text-[10px] font-medium text-blue-600 mt-1">
              Active item inventory records
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={22} />
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Pending Approvals</p>
            {loading ? (
              <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {stats.pendingManager + stats.pendingAdmin} Items
              </h3>
            )}
            <p className="text-[10px] font-medium text-amber-600 mt-1">
              {stats.pendingManager} Mgr · {stats.pendingAdmin} Admin
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoTimeOutline size={24} />
          </div>
        </div>

        {/* Approved Items */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Approved Clearance</p>
            {loading ? (
              <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {stats.approved} Items
              </h3>
            )}
            <p className="text-[10px] font-medium text-emerald-600 mt-1">
              Confirmed payable balances
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoShieldCheckmarkOutline size={24} />
          </div>
        </div>

        {/* Total Settled Paid */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Settled Amount</p>
            {loading ? (
              <div className="h-7 w-24 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
                {formatCurrency(stats.totalPaid)}
              </h3>
            )}
            <p className="text-[10px] font-medium text-gray-500 mt-1">
              Recorded recovery collections
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-wrap items-center gap-3">
          {/* Approval status filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[150px]"
            >
              <option value="All statuses">All statuses</option>
              <option value="Pending Manager">Pending Manager</option>
              <option value="Pending Admin">Pending Admin</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Employee filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Employee:</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[160px]"
            >
              <option value="All employees">All employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Apply filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Item</th>
                <th className="p-3.5 text-center">Qty</th>
                <th className="p-3.5 text-right">Unit Value</th>
                <th className="p-3.5 text-right">Payable</th>
                <th className="p-3.5">Issued</th>
                <th className="p-3.5">Issued By</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Paid</th>
                <th className="p-3.5 text-right">Outstanding</th>
                <th className="p-3.5 text-center pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse h-[52px]">
                    <td className="p-3.5 pl-5"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-3.5 text-center"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5 text-center"><div className="h-5 bg-slate-200 rounded-full w-24 mx-auto"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5 pr-5 text-center"><div className="h-6 bg-slate-200 rounded w-14 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const rawStatus = String(item.approval_status || item.status || '').toUpperCase();
                  const isApproved = rawStatus === 'APPROVED';
                  const outstanding = isApproved
                    ? (item.outstanding_balance !== undefined ? item.outstanding_balance : Math.max(0, Number(item.employee_payable || item.payable || 0) - Number(item.total_paid !== undefined ? item.total_paid : item.paid || 0)))
                    : null;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* ID */}
                      <td className="p-3.5 pl-5 font-mono font-bold text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">
                          {item.id}
                        </span>
                      </td>

                      {/* Employee */}
                      <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                        {item.employee_name || item.employee}
                      </td>

                      {/* Item */}
                      <td className="p-3.5 font-medium text-gray-800">
                        {item.item_name || item.item}
                      </td>

                      {/* Qty */}
                      <td className="p-3.5 text-center font-mono font-bold text-gray-700">
                        {item.quantity}
                      </td>

                      {/* Unit Value */}
                      <td className="p-3.5 text-right font-mono text-gray-700 whitespace-nowrap">
                        {formatCurrency(item.unit_value || item.unitValue)}
                      </td>

                      {/* Payable */}
                      <td className="p-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.employee_payable || item.payable)}
                      </td>

                      {/* Issued */}
                      <td className="p-3.5 text-gray-600 whitespace-nowrap">
                        {item.issued_date || item.issuedDate}
                      </td>

                      {/* Issued By */}
                      <td className="p-3.5 text-gray-600 whitespace-nowrap">
                        {item.issued_by_name || item.issuedBy}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {renderStatusBadge(item.approval_status || item.status)}
                      </td>

                      {/* Paid */}
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                        {formatCurrency(item.total_paid !== undefined ? item.total_paid : item.paid)}
                      </td>

                      {/* Outstanding */}
                      <td className="p-3.5 text-right font-mono whitespace-nowrap">
                        {outstanding !== null ? (
                          <span className={outstanding > 0 ? 'text-amber-700 font-bold' : 'text-gray-500 font-medium'}>
                            {formatCurrency(outstanding)}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-bold">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => navigate(`/hr/clearance-items/${item.id}`)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 rounded-lg text-xs font-semibold shadow-2xs transition-colors inline-flex items-center gap-1.5 mx-auto cursor-pointer"
                          title="View Details"
                        >
                          <IoEyeOutline size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={12} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <IoReceiptOutline size={26} />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">No Clearance Items Found</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        No clearance records matched your filter criteria. Try clearing or adjusting the filters.
                      </p>
                      {(selectedStatus !== 'All statuses' || selectedEmployee !== 'All employees') && (
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-visible relative shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA] rounded-t-2xl">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Issue Clearance Item</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record equipment, uniform, or assets issued to an employee.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setShowCalendarPopover(false);
                }}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateItem} className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Employee *
                  </label>
                  <select
                    required
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium cursor-pointer"
                  >
                    <option value="">Select Employee</option>
                    {employeesList.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name || emp.employee_name || `Employee #${emp.id}`} (ID: #{emp.id})
                      </option>
                    ))}
                    {!employeesList.some((e) => String(e.id) === '5') && (
                      <option value="5">Test Employee KOC (ID: #5)</option>
                    )}
                    {!employeesList.some((e) => String(e.id) === '18') && (
                      <option value="18">joy (ID: #18)</option>
                    )}
                    {!employeesList.some((e) => String(e.id) === '17') && (
                      <option value="17">stew (ID: #17)</option>
                    )}
                    <option value="custom">Other (Enter Employee ID manually)</option>
                  </select>
                  {formData.employee === 'custom' && (
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Enter numeric Employee ID (e.g. 5)"
                      value={customEmpId}
                      onChange={(e) => setCustomEmpId(e.target.value)}
                      className="mt-2 w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shirt, Safety Shoes"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Unit Value (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="750"
                    value={formData.unit_value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        unit_value: val,
                        employee_payable: prev.employee_payable === '' || prev.employee_payable === prev.unit_value ? val : prev.employee_payable
                      }));
                    }}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Employee Payable (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="750"
                    value={formData.employee_payable}
                    onChange={(e) => setFormData({ ...formData, employee_payable: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>

              {/* Issued Date with Custom Calendar Model */}
              <div className="relative" ref={calendarRef}>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Issued Date *
                </label>
                <button
                  type="button"
                  onClick={handleToggleCalendar}
                  className={`w-full flex items-center justify-between text-xs border rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none transition-colors cursor-pointer ${
                    showCalendarPopover
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <IoCalendarOutline size={16} className="text-blue-600 shrink-0" />
                    <span className="font-semibold text-gray-800">
                      {formData.issued_date ? formatDisplayDate(formData.issued_date) : 'Select Date'}
                    </span>
                  </div>
                  <IoChevronDownOutline
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${
                      showCalendarPopover ? 'rotate-180 text-blue-600' : ''
                    }`}
                    size={14}
                  />
                </button>

                {showCalendarPopover && (
                  <div
                    className={`absolute left-0 z-[100] shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-100 ${
                      popoverPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    }`}
                  >
                    <Calendar
                      value={formData.issued_date || new Date().toISOString().split('T')[0]}
                      onChange={(newDate) => {
                        setFormData((prev) => ({ ...prev, issued_date: newDate }));
                        setShowCalendarPopover(false);
                      }}
                      onClose={() => setShowCalendarPopover(false)}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notes</label>
                <textarea
                  rows="2"
                  placeholder="Optional item details or notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowCalendarPopover(false);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors cursor-pointer text-xs shadow-2xs disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submitting ? 'Issuing...' : 'Issue Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearanceItems;
