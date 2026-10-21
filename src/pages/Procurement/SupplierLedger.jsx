import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoSearchOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoBusinessOutline
} from 'react-icons/io5';
import { supplierPayableService } from '../../services/supplierPayableService';
import { supplierService } from '../../services/supplierService';
import toast from 'react-hot-toast';

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  if (isNaN(num)) return '₹0.00';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const getStatusBadge = (status) => {
  const st = String(status || '').toUpperCase();
  switch (st) {
    case 'PAID':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'PAID'
      };
    case 'PARTIAL':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'PARTIAL'
      };
    case 'OPEN':
    default:
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'OPEN'
      };
  }
};

const SupplierLedger = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSupplierId = searchParams.get('supplierId') || 'ALL';

  // State management
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states matching system standard
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSupplier, setSelectedSupplier] = useState(urlSupplierId);
  const [suppliersList, setSuppliersList] = useState([]);

  // Selected item for payment detail modal
  const [selectedPayable, setSelectedPayable] = useState(null);

  // Fetch suppliers list for filter dropdown
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const data = await supplierService.fetchSuppliers(1, 100);
        if (data && Array.isArray(data.results)) {
          setSuppliersList(data.results);
        } else if (Array.isArray(data)) {
          setSuppliersList(data);
        }
      } catch (err) {
        console.error('Failed to load suppliers list:', err);
      }
    };
    loadSuppliers();
  }, []);

  // Fetch supplier payables from live API
  const fetchPayables = async (pageToFetch = currentPage, isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = {
        page: pageToFetch,
        page_size: pageSize
      };
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (selectedSupplier !== 'ALL') params.supplier = selectedSupplier;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await supplierPayableService.fetchSupplierPayables(params);

      if (data && Array.isArray(data.results)) {
        setPayables(data.results);
        setTotalCount(data.count ?? data.results.length);
      } else if (Array.isArray(data)) {
        setPayables(data);
        setTotalCount(data.length);
      } else {
        setPayables([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch supplier payables:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load supplier payables.');
      toast.error('Could not load supplier ledger entries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayables(currentPage);
  }, [currentPage, selectedStatus, selectedSupplier]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayables(1);
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const emptyRowsCount = loading ? 0 : Math.max(0, pageSize - payables.length);

  // Aggregate metrics from current page dataset
  const totalBilled = payables.reduce((acc, row) => acc + (parseFloat(row.total_amount) || 0), 0);
  const totalPaid = payables.reduce((acc, row) => acc + (parseFloat(row.paid_amount) || 0), 0);
  const totalOutstanding = payables.reduce((acc, row) => acc + (parseFloat(row.outstanding_amount) || 0), 0);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-300">
      
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-slate-700">Supplier Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <IoReceiptOutline className="text-blue-600" size={26} />
            Vendor Payables & Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Live supplier purchase invoices, settlement tracking, and outstanding payable balances.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Purchases
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/creditpurchases')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Credit Invoices
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierpayments')}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Payments
          </button>
          <button
            type="button"
            disabled={loading || refreshing}
            onClick={() => fetchPayables(currentPage, true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh payables"
          >
            <IoRefreshOutline size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Purchases / Billed</p>
            <h3 className="text-2xl font-bold text-slate-900 tabular-nums font-mono">
              {loading ? '...' : formatCurrency(totalBilled)}
            </h3>
            <p className="text-[11px] font-medium text-blue-600 mt-0.5">Page Credit Invoices</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={22} />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Payments / Settled</p>
            <h3 className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">
              {loading ? '...' : formatCurrency(totalPaid)}
            </h3>
            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">Cleared Disbursements</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={22} />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Net Outstanding Balance</p>
            <h3 className={`text-2xl font-bold tabular-nums font-mono ${totalOutstanding > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {loading ? '...' : formatCurrency(totalOutstanding)}
            </h3>
            <p className="text-[11px] font-medium text-rose-500 mt-0.5">{totalCount} total payable records</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={22} />
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search invoice number, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Supplier Dropdown */}
          <div className="sm:col-span-4">
            <select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Suppliers</option>
              {suppliersList.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name || sup.supplier_name || `Supplier #${sup.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="sm:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>

          {/* Search Submit */}
          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
              title="Apply Search"
            >
              <IoSearchOutline size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* 4. Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice & Date</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Total Billed</th>
                <th className="py-3.5 px-4 text-right">Paid Amount</th>
                <th className="py-3.5 px-4 text-right">Outstanding</th>
                <th className="py-3.5 px-4 text-center w-24">Payments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="h-[52px] animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-32" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-6 bg-slate-100 rounded w-12 mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <p className="text-rose-600 font-semibold mb-2">{error}</p>
                    <button
                      type="button"
                      onClick={() => fetchPayables(currentPage)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Retry Loading
                    </button>
                  </td>
                </tr>
              ) : payables.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <IoDocumentTextOutline size={40} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No supplier payable records found.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Records will automatically show here as credit purchases are billed.</p>
                  </td>
                </tr>
              ) : (
                <>
                  {payables.map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    const outstanding = parseFloat(item.outstanding_amount || 0);

                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50/70 transition-colors h-[52px]"
                      >
                        {/* Invoice & Date */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 font-mono text-xs">
                            {item.purchase_invoice_number || `Purchase #${item.purchase}`}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {formatDate(item.purchase_date || item.created_at)}
                          </div>
                        </td>

                        {/* Supplier */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">
                            {item.supplier_name || `Supplier #${item.supplier}`}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.branch_name || 'Branch Main'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border uppercase tracking-wider ${statusBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                            {statusBadge.label}
                          </span>
                        </td>

                        {/* Total Billed */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(item.total_amount)}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                          {formatCurrency(item.paid_amount)}
                        </td>

                        {/* Outstanding Amount */}
                        <td className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${outstanding > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {formatCurrency(item.outstanding_amount)}
                        </td>

                        {/* Payments Breakdown Action */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedPayable(item)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="View Payments & Breakdown"
                          >
                            <IoEyeOutline size={14} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty rows placeholders to preserve uniform 10-row size */}
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[52px]">
                      <td className="py-3.5 px-4">&nbsp;</td>
                      <td className="py-3.5 px-4">&nbsp;</td>
                      <td className="py-3.5 px-4">&nbsp;</td>
                      <td className="py-3.5 px-4">&nbsp;</td>
                      <td className="py-3.5 px-4">&nbsp;</td>
                      <td className="py-3.5 px-4">&nbsp;</td>
                      <td className="py-3.5 px-4">&nbsp;</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Standardized System Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">
            Showing {totalCount === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} payable entries
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={validCurrentPage <= 1 || loading}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <IoChevronBackOutline size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  disabled={loading}
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
              disabled={validCurrentPage >= totalPages || loading}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <IoChevronForwardOutline size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Payment Detail Modal */}
      {selectedPayable && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <IoReceiptOutline size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedPayable.purchase_invoice_number || `Purchase #${selectedPayable.purchase}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded on {formatDate(selectedPayable.purchase_date || selectedPayable.created_at)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPayable(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close Modal"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Overview Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/75 p-3.5 rounded-xl border border-slate-100 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Supplier</p>
                <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedPayable.supplier_name || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Branch</p>
                <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedPayable.branch_name || '-'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedPayable.status}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Purchase Ref</p>
                <p className="font-bold text-slate-900 mt-0.5 font-mono">#{selectedPayable.purchase || selectedPayable.id}</p>
              </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Billed</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {formatCurrency(selectedPayable.total_amount)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Paid</span>
                <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">
                  {formatCurrency(selectedPayable.paid_amount)}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <span className="text-[10px] font-bold text-rose-700 uppercase block">Outstanding</span>
                <span className="text-sm font-bold font-mono text-rose-700 mt-0.5 block">
                  {formatCurrency(selectedPayable.outstanding_amount)}
                </span>
              </div>
            </div>

            {/* Payments List Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <IoCheckmarkCircleOutline className="text-emerald-500" size={16} />
                  Settlement Payments ({selectedPayable.payments?.length || 0})
                </span>
              </div>

              {selectedPayable.payments && selectedPayable.payments.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Account</th>
                        <th className="p-2.5">Reference</th>
                        <th className="p-2.5">Remarks</th>
                        <th className="p-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedPayable.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 whitespace-nowrap text-slate-700 font-medium">
                            {formatDate(p.payment_date || p.created_at)}
                          </td>
                          <td className="p-2.5 whitespace-nowrap font-semibold text-slate-900">
                            {p.payment_account_name || `Account #${p.payment_account}`}
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">
                            {p.reference || '-'}
                          </td>
                          <td className="p-2.5 text-slate-600 text-[11px] max-w-[160px] truncate" title={p.remarks}>
                            {p.remarks || '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                  No payment disbursements recorded for this credit invoice yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPayable(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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

export default SupplierLedger;
