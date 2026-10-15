import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoCalendarOutline,
  IoWarningOutline,
  IoEyeOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { supplierPayableService } from '../../services/supplierPayableService';

const CreditPurchases = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');

  // View modal state
  const [viewingInvoice, setViewingInvoice] = useState(null);

  const loadCreditPurchases = async (pageToLoad = 1) => {
    setTableLoading(true);
    try {
      const res = await supplierPayableService.fetchSupplierPayables(pageToLoad, pageSize, 'PARTIAL');
      const rawResults = res?.results || (Array.isArray(res) ? res : []);
      const count = typeof res?.count === 'number' ? res.count : rawResults.length;

      if (rawResults.length > 0) {
        const mapped = rawResults.map((item) => {
          const invNum =
            item.purchase_invoice_number && item.purchase_invoice_number !== 'string'
              ? item.purchase_invoice_number
              : item.purchase
              ? `INV-${item.purchase}`
              : `PAY-${item.id}`;

          return {
            id: item.id,
            purchaseId: item.purchase,
            invoiceNumber: invNum,
            poNumber: item.purchase ? `PO #${item.purchase}` : '—',
            supplierId: item.supplier,
            supplierName: item.supplier_name || `Supplier #${item.supplier}`,
            branchId: item.branch,
            branchName: item.branch_name || (item.branch ? `Branch #${item.branch}` : 'Main Branch'),
            purchaseDate: item.purchase_date || (item.created_at ? item.created_at.slice(0, 10) : '—'),
            totalAmount: parseFloat(item.total_amount || 0),
            paidAmount: parseFloat(item.paid_amount || 0),
            outstandingAmount: parseFloat(item.outstanding_amount || 0),
            status: item.status || 'PARTIAL',
            payments: item.payments || [],
            createdAt: item.created_at || '',
            updatedAt: item.updated_at || ''
          };
        });
        setInvoices(mapped);
        setTotalCount(count);
      } else {
        setInvoices([]);
        setTotalCount(count);
      }
      setCurrentPage(pageToLoad);
    } catch (err) {
      console.warn('Failed to load credit purchases:', err);
      toast.error('Failed to load credit purchases from server');
    } finally {
      setTableLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadCreditPurchases(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPagesCount || tableLoading) return;
    loadCreditPurchases(newPage);
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const invMatch = (inv.invoiceNumber || '').toLowerCase().includes(q);
    const poMatch = (inv.poNumber || '').toLowerCase().includes(q);
    const supMatch = (inv.supplierName || '').toLowerCase().includes(q);
    const branchMatch = (inv.branchName || '').toLowerCase().includes(q);
    return invMatch || poMatch || supMatch || branchMatch;
  });

  const totalInvoices = totalCount || invoices.length;
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
  const totalAmountSum = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const totalItemsCount = totalCount || filteredInvoices.length;
  const totalPagesCount = Math.max(1, Math.ceil(totalItemsCount / pageSize));
  const startItem = totalItemsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItemsCount);
  const emptyRowsCount = tableLoading ? 0 : Math.max(0, pageSize - filteredInvoices.length);

  return (
    <div className="space-y-6 pb-12 font-sans animate-in fade-in duration-150">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Credit Purchases</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Credit Invoices & Payables</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage vendor credit purchases, outstanding payables, and partial payment history.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Purchase Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierpayments')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Payments
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierledger')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Ledger
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Active Credit Invoices</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalInvoices} Invoices</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Status: PARTIAL</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Outstanding Credit</p>
            <h3 className="text-2xl font-bold text-rose-600 tabular-nums font-mono">
              ₹{totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Pending Balance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Invoice Value</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalAmountSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Current Page Summary</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Card with Min-Height & Stable 10-Row Height */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div>
          {/* Search Toolbar */}
          <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search invoice #, PO #, supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none transition-colors"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-800">{filteredInvoices.length}</span> of{' '}
              <span className="font-bold text-gray-800">{totalItemsCount}</span> credit purchases
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[480px] w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                  <th className="py-3.5 px-4">Invoice # & PO</th>
                  <th className="py-3.5 px-4">Supplier Name</th>
                  <th className="py-3.5 px-4">Purchase Date</th>
                  <th className="py-3.5 px-4 text-right">Invoice Amount (₹)</th>
                  <th className="py-3.5 px-4 text-right">Paid Amount (₹)</th>
                  <th className="py-3.5 px-4 text-right">Outstanding (₹)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 bg-white text-xs">
                {tableLoading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse h-[52px]">
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                        <div className="h-3 bg-slate-100 rounded w-16 mt-1"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-slate-200 rounded w-28"></div>
                        <div className="h-3 bg-slate-100 rounded w-20 mt-1"></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-5 bg-slate-200 rounded-full w-16 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="h-7 bg-slate-200 rounded-lg w-28 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredInvoices.length > 0 ? (
                  <>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                        {/* Invoice & PO */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900 font-mono">{inv.invoiceNumber}</div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">{inv.poNumber}</div>
                        </td>

                        {/* Supplier & Branch */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-gray-900">{inv.supplierName}</div>
                          <div className="text-[11px] text-gray-400">{inv.branchName}</div>
                        </td>

                        {/* Purchase Date */}
                        <td className="py-3.5 px-4 text-gray-700 font-medium whitespace-nowrap">
                          {inv.purchaseDate}
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                          ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                          ₹{inv.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Outstanding Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                          ₹{inv.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                            {inv.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingInvoice(inv)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 transition-colors font-semibold text-xs cursor-pointer shadow-2xs"
                              title="View details & payments"
                            >
                              <IoEyeOutline size={14} />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/procurement/supplierpayments?supplierId=${inv.supplierId}&payableId=${inv.id}`
                                )
                              }
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                            >
                              Settle
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* Spacer rows to maintain stable 10-row height */}
                    {emptyRowsCount > 0 &&
                      Array.from({ length: emptyRowsCount }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="h-[52px] border-b border-gray-100/40">
                          <td colSpan={8}>&nbsp;</td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400 font-medium">
                      No credit purchases found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
          <div>
            Showing <span className="font-bold text-gray-800">{startItem}–{endItem}</span> of{' '}
            <span className="font-bold text-gray-800">{totalItemsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1 || tableLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-semibold"
            >
              Previous
            </button>

            {Array.from({ length: totalPagesCount }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  disabled={tableLoading}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPagesCount || tableLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* View Details & Payment History Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/70">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Credit Purchase Details
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  {viewingInvoice.invoiceNumber} • {viewingInvoice.poNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 font-sans">
              {/* Supplier & Status Banner */}
              <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Supplier
                  </span>
                  <p className="font-bold text-gray-900 text-sm">{viewingInvoice.supplierName}</p>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Supplier ID: #{viewingInvoice.supplierId} • {viewingInvoice.branchName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Status
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    {viewingInvoice.status}
                  </span>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Total Amount
                  </span>
                  <p className="text-sm font-extrabold font-mono text-gray-900">
                    ₹{viewingInvoice.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Paid Amount
                  </span>
                  <p className="text-sm font-extrabold font-mono text-emerald-600">
                    ₹{viewingInvoice.paidAmount.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Outstanding Due
                  </span>
                  <p className="text-sm font-extrabold font-mono text-rose-600">
                    ₹{viewingInvoice.outstandingAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Purchase Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Purchase Date
                  </span>
                  <p className="font-medium text-gray-800">{viewingInvoice.purchaseDate}</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Purchase ID
                  </span>
                  <p className="font-mono font-medium text-gray-800">#{viewingInvoice.purchaseId}</p>
                </div>
              </div>

              {/* Payments History Table */}
              <div>
                <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2">
                  Payment History ({viewingInvoice.payments.length})
                </h4>
                {viewingInvoice.payments && viewingInvoice.payments.length > 0 ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 text-[11px]">
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5 text-right">Amount (₹)</th>
                          <th className="p-2.5">Account</th>
                          <th className="p-2.5">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                        {viewingInvoice.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/70">
                            <td className="p-2.5 whitespace-nowrap font-medium text-gray-600">
                              {p.payment_date || (p.created_at ? p.created_at.slice(0, 10) : '—')}
                            </td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                              ₹{parseFloat(p.amount || 0).toFixed(2)}
                            </td>
                            <td className="p-2.5 text-gray-700 whitespace-nowrap">
                              {p.payment_account_name || (p.payment_account ? `Account #${p.payment_account}` : '—')}
                            </td>
                            <td className="p-2.5 text-gray-600 truncate max-w-[120px]" title={p.remarks}>
                              {p.remarks || p.reference || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs">
                    No payment transactions recorded for this credit purchase yet.
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const targetSupplier = viewingInvoice.supplierId;
                  const targetPayable = viewingInvoice.id;
                  setViewingInvoice(null);
                  navigate(`/procurement/supplierpayments?supplierId=${targetSupplier}&payableId=${targetPayable}`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Settle Payment
              </button>
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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

export default CreditPurchases;
