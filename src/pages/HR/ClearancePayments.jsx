import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoCloseOutline,
  IoReceiptOutline,
  IoPersonOutline,
  IoCashOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { clearanceService } from '../../services/clearanceService';

const ClearancePayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('All employees');
  const [appliedEmployee, setAppliedEmployee] = useState('All employees');

  // Record Payment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    itemId: '',
    amount: '',
    method: 'Cash',
    recordedBy: 'Fatima Beevi',
    reference: '',
    paymentDateIso: new Date().toISOString().split('T')[0]
  });

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const list = await clearanceService.getAllPayments();
      setPayments(Array.isArray(list) ? list : []);

      const items = await clearanceService.getItems();
      const approved = (items || []).filter((i) => {
        const s = String(i.approval_status || i.status || '').toUpperCase();
        return s === 'APPROVED';
      });
      setApprovedItems(approved);

      if (isRefresh) {
        toast.success('Payments refreshed successfully');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load clearance payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Unique employees from payments
  const employeeOptions = useMemo(() => {
    const set = new Set();
    payments.forEach((p) => {
      if (p.employee) set.add(p.employee);
    });
    return Array.from(set);
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    if (appliedEmployee === 'All employees') {
      return payments;
    }
    return payments.filter((p) => p.employee === appliedEmployee);
  }, [payments, appliedEmployee]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = payments.length;
    const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const uniqueEmployeesCount = employeeOptions.length;
    return { totalCount, totalCollected, uniqueEmployeesCount };
  }, [payments, employeeOptions]);

  const handleApplyFilter = () => {
    setAppliedEmployee(selectedEmployee);
  };

  const handleClearFilter = () => {
    setSelectedEmployee('All employees');
    setAppliedEmployee('All employees');
  };

  const handleCreatePayment = (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast.error('Please select an approved clearance item');
      return;
    }
    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const selectedItem = approvedItems.find((i) => String(i.id) === String(formData.itemId));
    if (!selectedItem) {
      toast.error('Invalid clearance item selected');
      return;
    }

    const [yyyy, mm, dd] = formData.paymentDateIso.split('-');
    const dateObj = new Date(yyyy, mm - 1, dd);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    clearanceService.addPayment({
      itemId: selectedItem.id,
      employee: selectedItem.employee,
      itemName: selectedItem.item,
      amount: amt,
      method: formData.method,
      paymentDate: formattedDate,
      paymentDateIso: formData.paymentDateIso,
      recordedBy: formData.recordedBy.trim() || 'Fatima Beevi',
      reference: formData.reference.trim() || `RCPT-${Math.floor(1000 + Math.random() * 9000)}`
    });

    toast.success('Payment recorded successfully');
    setIsModalOpen(false);
    setFormData({
      itemId: '',
      amount: '',
      method: 'Cash',
      recordedBy: 'Fatima Beevi',
      reference: '',
      paymentDateIso: new Date().toISOString().split('T')[0]
    });
    loadData();
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
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span
              onClick={() => navigate('/hr/clearance-items')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Clearance Items
            </span>
            <span>&gt;</span>
            <span className="text-gray-700 font-bold">Payments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Payments
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Payments recorded against approved clearance items.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh payments list"
          >
            <IoRefreshOutline
              size={16}
              className={refreshing ? 'animate-spin text-blue-600' : ''}
            />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/hr/clearance-items')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoReceiptOutline size={16} /> Clearance Items
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={17} /> Record Payment
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Payments */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Transactions</p>
            {loading ? (
              <div className="h-7 w-20 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {stats.totalCount} Receipts
              </h3>
            )}
            <p className="text-[10px] font-medium text-blue-600 mt-1">
              Recorded payments log
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={22} />
          </div>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Amount Recovered</p>
            {loading ? (
              <div className="h-7 w-28 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
                {formatCurrency(stats.totalCollected)}
              </h3>
            )}
            <p className="text-[10px] font-medium text-emerald-600 mt-1">
              Settled to company accounts
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCashOutline size={22} />
          </div>
        </div>

        {/* Unique Employees */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Employees Paying</p>
            {loading ? (
              <div className="h-7 w-20 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {stats.uniqueEmployeesCount} Employees
              </h3>
            )}
            <p className="text-[10px] font-medium text-purple-600 mt-1">
              Settling issued liabilities
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoPersonOutline size={22} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Employee:</span>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="border border-gray-200 rounded-xl text-xs px-3.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[170px]"
            >
              <option value="All employees">All employees</option>
              {employeeOptions.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Apply filter
          </button>
          <button
            type="button"
            onClick={handleClearFilter}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Clear filter
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">ID</th>
                <th className="p-3.5">Item</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Item Name</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5">Recorded By</th>
                <th className="p-3.5 pr-5">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse h-[52px]">
                    <td className="p-3.5 pl-5"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5 pr-5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* ID */}
                    <td className="p-3.5 pl-5 font-mono text-gray-500 whitespace-nowrap">
                      #{p.id}
                    </td>

                    {/* Item */}
                    <td className="p-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => navigate(`/hr/clearance-items/${p.itemId}`)}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-mono font-bold text-xs transition-colors cursor-pointer"
                        title="View Clearance Item Details"
                      >
                        #{p.itemId}
                      </button>
                    </td>

                    {/* Employee */}
                    <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                      {p.employee}
                    </td>

                    {/* Item Name */}
                    <td className="p-3.5 text-gray-800">
                      {p.itemName}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </td>

                    {/* Method */}
                    <td className="p-3.5 font-medium text-gray-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-semibold text-[11px]">
                        {p.payment_method || p.method}
                      </span>
                    </td>

                    {/* Payment Date */}
                    <td className="p-3.5 text-gray-600 whitespace-nowrap">
                      {p.payment_date || p.paymentDate}
                    </td>

                    {/* Recorded By */}
                    <td className="p-3.5 text-gray-600 whitespace-nowrap">
                      {p.recorded_by_name || p.recordedBy}
                    </td>

                    {/* Reference */}
                    <td className="p-3.5 pr-5 font-mono text-gray-600 whitespace-nowrap">
                      {p.reference || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <IoReceiptOutline size={26} />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">No Payments Found</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        No payments recorded matching the selected filter.
                      </p>
                      {selectedEmployee !== 'All employees' && (
                        <button
                          type="button"
                          onClick={handleClearFilter}
                          className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Clear filter
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

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-[#F8F9FA]">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Record Clearance Payment</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record a payment received against an approved clearance item.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-5 space-y-4 text-xs font-sans">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Select Clearance Item *
                </label>
                <select
                  required
                  value={formData.itemId}
                  onChange={(e) => {
                    const itId = e.target.value;
                    const it = approvedItems.find((x) => String(x.id) === String(itId));
                    setFormData((prev) => ({
                      ...prev,
                      itemId: itId,
                      amount: it ? String(Math.max(0, it.payable - it.paid)) : prev.amount
                    }));
                  }}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium cursor-pointer"
                >
                  <option value="">-- Choose Approved Item --</option>
                  {approvedItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      #{it.id} - {it.item} ({it.employee}) - Outstanding: {formatCurrency(Math.max(0, it.payable - it.paid))}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Payment Method *
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium cursor-pointer"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Salary Deduction">Salary Deduction</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDateIso}
                    onChange={(e) => setFormData({ ...formData, paymentDateIso: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Reference / Receipt
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UPI-88213"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Recorded By *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recordedBy}
                  onChange={(e) => setFormData({ ...formData, recordedBy: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white text-gray-800 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors cursor-pointer text-xs shadow-2xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClearancePayments;
