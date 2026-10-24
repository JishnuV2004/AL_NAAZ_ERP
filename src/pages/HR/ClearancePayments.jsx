import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoReceiptOutline,
  IoPersonOutline,
  IoCashOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearanceService } from '../../services/clearanceService';

const ClearancePayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('All employees');
  const [appliedEmployee, setAppliedEmployee] = useState('All employees');

  // Pagination state (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // GET https://al-naaz.onrender.com/api/clearance/payments/
      const [paymentsList, itemsList] = await Promise.all([
        clearanceService.getPayments(),
        clearanceService.getItems()
      ]);

      const itemsMap = {};
      (itemsList || []).forEach((item) => {
        if (item && item.id) {
          itemsMap[item.id] = item;
        }
      });

      const enriched = (paymentsList || []).map((p) => {
        const item = itemsMap[p.issued_item];
        return {
          ...p,
          employee: p.employee_name || item?.employee_name || '—',
          itemName: p.item_name || item?.item_name || (p.issued_item ? `Item #${p.issued_item}` : '—')
        };
      });

      setPayments(enriched);
      setCurrentPage(1);

      if (isRefresh) {
        toast.success('Payments refreshed successfully');
      }
    } catch (e) {
      console.error('Failed to load clearance payments:', e);
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
      if (p.employee && p.employee !== '—') set.add(p.employee);
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

  // Pagination calculations (10 items per page)
  const totalPayments = filteredPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalPayments / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalPayments);
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = payments.length;
    const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const uniqueEmployeesCount = employeeOptions.length;
    return { totalCount, totalCollected, uniqueEmployeesCount };
  }, [payments, employeeOptions]);

  const handleApplyFilter = () => {
    setAppliedEmployee(selectedEmployee);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setSelectedEmployee('All employees');
    setAppliedEmployee('All employees');
    setCurrentPage(1);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
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
            Payments recorded against clearance items.
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
                <th className="p-3.5">Reference</th>
                <th className="p-3.5 pr-5">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse h-[52px]">
                    <td className="p-3.5 pl-5"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-10"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                    <td className="p-3.5 pr-5"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  </tr>
                ))
              ) : paginatedPayments.length > 0 ? (
                paginatedPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* ID */}
                    <td className="p-3.5 pl-5 font-mono text-gray-500 whitespace-nowrap">
                      #{p.id}
                    </td>

                    {/* Item link */}
                    <td className="p-3.5 whitespace-nowrap">
                      {p.issued_item ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/hr/clearance-items/${p.issued_item}`)}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-mono font-bold text-xs transition-colors cursor-pointer"
                          title="View Clearance Item Details"
                        >
                          #{p.issued_item}
                        </button>
                      ) : (
                        <span className="text-gray-400 font-mono">—</span>
                      )}
                    </td>

                    {/* Employee */}
                    <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                      {p.employee || '—'}
                    </td>

                    {/* Item Name */}
                    <td className="p-3.5 text-gray-800">
                      {p.itemName || '—'}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(p.amount)}
                    </td>

                    {/* Method */}
                    <td className="p-3.5 font-medium text-gray-700 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-semibold text-[11px]">
                        {p.payment_method || 'CASH'}
                      </span>
                    </td>

                    {/* Payment Date */}
                    <td className="p-3.5 text-gray-600 whitespace-nowrap">
                      {formatDate(p.payment_date)}
                    </td>

                    {/* Recorded By */}
                    <td className="p-3.5 text-gray-600 whitespace-nowrap">
                      {p.recorded_by_name || 'admin'}
                    </td>

                    {/* Reference */}
                    <td className="p-3.5 font-mono text-gray-600 whitespace-nowrap">
                      {p.reference || '—'}
                    </td>

                    {/* Notes */}
                    <td className="p-3.5 pr-5 text-gray-500 max-w-[200px] truncate">
                      {p.notes || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-gray-500">
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

        {/* Pagination Controls - 10 per page */}
        {!loading && totalPayments > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
            <div>
              Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{endIndex}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPayments}</span> payments
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        safePage === pageNum
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClearancePayments;
