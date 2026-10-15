import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Calendar } from '../../components/ui/calendar';
import { supplierPayableService } from '../../services/supplierPayableService';
import { accountService } from '../../services/accountService';

// Custom Dropdown Select Component
const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', disabled = false, className = '' }) => {
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

  const formattedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        label: opt.label ?? opt.name ?? String(opt.value ?? opt.id),
        value: opt.value ?? opt.id
      };
    }
    return { label: String(opt), value: opt };
  });

  const selectedItem = formattedOptions.find((opt) => String(opt.value) === String(value));
  const isValueEmpty = value === '' || value === null || value === undefined;
  const displayText = selectedItem ? selectedItem.label : placeholder;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`truncate ${isValueEmpty ? 'text-gray-400 font-normal' : 'text-gray-900 font-semibold'}`}>
          {displayText}
        </span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} size={14} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-[90] font-sans max-h-56 overflow-y-auto">
          {formattedOptions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-400">No options available</div>
          ) : (
            formattedOptions.map((opt, idx) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <button
                  key={opt.value !== undefined ? String(opt.value) : `opt-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

const defaultForm = {
  payable: 1,
  payment_account: 1,
  amount: '',
  reference: '',
  remarks: '',
  paymentDate: new Date().toISOString().split('T')[0]
};

const SupplierPayments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSupplier = searchParams.get('supplierId') || '';

  const [payments, setPayments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pageSize = 10;

  // Auxiliary data states for modal dropdowns
  const [financialAccounts, setFinancialAccounts] = useState([]);
  const [payablesList, setPayablesList] = useState([]);

  const [searchTerm, setSearchTerm] = useState(preselectedSupplier);
  const [methodFilter, setMethodFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const calendarRef = useRef(null);

  const loadPayments = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await supplierPayableService.fetchSupplierPayments(page, pageSize);
      if (res && Array.isArray(res.results)) {
        setPayments(res.results);
        setTotalCount(res.count !== undefined ? res.count : res.results.length);
      } else if (Array.isArray(res)) {
        setPayments(res);
        setTotalCount(res.length);
      } else {
        setPayments([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch supplier payments:', err);
      setError(err.message || 'Failed to fetch supplier payments');
      toast.error('Failed to load supplier payments from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(currentPage);
  }, [currentPage]);

  // Load Financial Accounts and Supplier Payables for Record Payment form
  useEffect(() => {
    const fetchAuxData = async () => {
      try {
        const [accRes, payRes] = await Promise.all([
          accountService.fetchAccounts().catch(() => []),
          supplierPayableService.fetchSupplierPayables().catch(() => [])
        ]);

        const accs = Array.isArray(accRes) ? accRes : (accRes?.results || []);
        setFinancialAccounts(accs);

        const payables = Array.isArray(payRes) ? payRes : (payRes?.results || []);
        setPayablesList(payables);

        if (accs.length > 0) {
          setFormData(prev => ({ ...prev, payment_account: accs[0].id }));
        }
        if (payables.length > 0) {
          setFormData(prev => ({ ...prev, payable: payables[0].id }));
        }
      } catch (err) {
        console.error('Error fetching financial accounts/payables:', err);
      }
    };
    fetchAuxData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPayments = payments.filter(pay => {
    const ref = (pay.reference || pay.refNumber || '').toLowerCase();
    const supplier = (pay.supplier_name || pay.supplierName || '').toLowerCase();
    const remarks = (pay.remarks || pay.poRef || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || ref.includes(search) || supplier.includes(search) || remarks.includes(search);
    const matchesMethod = methodFilter === 'All' || (pay.paymentMethod || pay.remarks || '').includes(methodFilter);
    return matchesSearch && matchesMethod;
  });

  const totalPages = Math.max(1, Math.ceil((totalCount || filteredPayments.length) / pageSize));
  const emptyRowsCount = Math.max(0, pageSize - filteredPayments.length);

  const totalPaymentsCount = totalCount || payments.length;
  const totalAmountCleared = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!formData.payable || !formData.payment_account || !formData.amount) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        payable: parseInt(formData.payable, 10),
        payment_account: parseInt(formData.payment_account, 10),
        amount: String(formData.amount),
        payment_date: formData.paymentDate,
        reference: formData.reference || 'REF-PAYMENT',
        remarks: formData.remarks || 'Supplier Payment'
      };

      await supplierPayableService.createSupplierPayment(payload);
      toast.success('Supplier payment recorded successfully!');
      setIsModalOpen(false);
      setFormData(prev => ({
        ...defaultForm,
        payment_account: financialAccounts.length > 0 ? financialAccounts[0].id : 1,
        payable: payablesList.length > 0 ? payablesList[0].id : 1
      }));
      loadPayments(currentPage);
    } catch (err) {
      console.error('Failed to create payment:', err);
      const msg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to record supplier payment';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountOptions = financialAccounts.length > 0
    ? financialAccounts.map(a => ({
        value: a.id,
        label: `${a.name || a.account_name || 'Account'} (${a.account_type || 'ID: ' + a.id})`
      }))
    : [
        { value: 1, label: 'Cash Account (ID: 1)' },
        { value: 2, label: 'Bank Account (ID: 2)' }
      ];

  const payableOptions = payablesList.length > 0
    ? payablesList.map(p => ({
        value: p.id,
        label: `#${p.id} - ${p.supplier_name || 'Supplier'} (${p.invoice_number || 'INV'}) - Bal: ₹${p.balance || p.total_amount || 0}`
      }))
    : [
        { value: 6, label: 'Payable #6 - RRR (INV-2026-21)' },
        { value: 7, label: 'Payable #7 - ABC traders (PURCHASE-25)' }
      ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Supplier Payments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payments Made to Vendors</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Record bank transfers, cheques, and cash disbursements against supplier credit invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadPayments(currentPage)}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            title="Refresh list"
          >
            <IoRefreshOutline className={loading ? 'animate-spin' : ''} size={15} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/creditpurchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Credit Invoices
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierledger')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Ledger
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Payments Executed</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{loading ? '...' : totalPaymentsCount} Payments</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Settled Transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Funds Disbursed (Page)</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{loading ? '...' : totalAmountCleared.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Vendor Account Settlements</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/procurement/supplierledger')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Audit Supplier Statement</p>
            <h3 className="text-sm font-bold text-purple-700">Open Vendor Ledger</h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Complete Debit/Credit History &rarr;</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search payment ref, supplier, remarks..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Payment Filter:</span>
            <select
              value={methodFilter}
              onChange={e => { setMethodFilter(e.target.value); setCurrentPage(1); }}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Methods</option>
              <option value="Initial">Initial Payment</option>
              <option value="PURCHASE">Purchase Ref</option>
              <option value="testing">Testing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Reference & Date</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Payable / Remarks</th>
                <th className="py-3.5 px-4">Account ID</th>
                <th className="py-3.5 px-4 text-right">Amount Paid (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="animate-pulse h-[60px]">
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-5 bg-gray-200 rounded-full w-16 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IoAlertCircleOutline className="text-red-500" size={32} />
                      <p className="text-gray-800 font-semibold">{error}</p>
                      <button
                        onClick={() => loadPayments(currentPage)}
                        className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr className="h-[60px]">
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-xs">
                    No supplier payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => {
                  const status = pay.payable_status || pay.status || 'PAID';
                  const formattedAmount = parseFloat(pay.amount || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });

                  return (
                    <tr key={pay.id} className="hover:bg-gray-50/60 transition-colors h-[60px]">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 font-mono">{pay.reference || `PAY-#${pay.id}`}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{pay.payment_date || pay.paymentDate}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{pay.supplier_name || pay.supplierName || 'Supplier'}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{pay.remarks || pay.poRef || `Payable #${pay.payable}`}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800 font-mono">Account #{pay.payment_account}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        ₹{formattedAmount}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/procurement/supplierledger?supplierId=${pay.supplier_name || ''}`)}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Ledger
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
              {emptyRowsCount > 0 && !loading && !error && (
                Array.from({ length: filteredPayments.length === 0 ? Math.max(0, emptyRowsCount - 1) : emptyRowsCount }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-[60px]">
                    <td colSpan="7"></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls & Current Page Indicator */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">
              Showing <span className="font-bold text-gray-900">{filteredPayments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * pageSize, totalCount || filteredPayments.length)}</span> of <span className="font-bold text-gray-900">{totalCount || filteredPayments.length}</span> entries
            </span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-full">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white border border-blue-600' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Supplier Payment Clearance"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Target Payable (Invoice)</label>
            <CustomSelect
              options={payableOptions}
              value={formData.payable}
              onChange={val => {
                const pId = parseInt(val, 10);
                const selPay = payablesList.find(p => p.id === pId);
                setFormData(prev => ({
                  ...prev,
                  payable: pId,
                  amount: selPay ? (selPay.balance || selPay.total_amount || prev.amount) : prev.amount
                }));
              }}
              placeholder="Select Credit Payable..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Account (Financial Account)</label>
            <CustomSelect
              options={accountOptions}
              value={formData.payment_account}
              onChange={val => setFormData(prev => ({ ...prev, payment_account: parseInt(val, 10) }))}
              placeholder="Select Financial Account..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference</label>
              <input
                type="text"
                required
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono bg-white"
                placeholder="testing / PURCHASE-25-INITIAL"
              />
            </div>

            <div className="relative" ref={calendarRef}>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Date</label>
              <button
                type="button"
                onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium cursor-pointer"
              >
                <span>
                  {formData.paymentDate
                    ? formData.paymentDate.split('-').reverse().join('/')
                    : '09/10/2026'}
                </span>
                <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
              </button>

              {showCalendarPopover && (
                <div className="absolute left-0 top-full mt-1.5 z-[100] shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-100">
                  <Calendar
                    value={formData.paymentDate || new Date().toISOString().slice(0, 10)}
                    onChange={(newDate) => {
                      setFormData({ ...formData, paymentDate: newDate });
                      setShowCalendarPopover(false);
                    }}
                    onClose={() => setShowCalendarPopover(false)}
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount Paid (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono bg-white"
              placeholder="200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              placeholder="testing / Initial payment"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving...' : 'Execute Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierPayments;
