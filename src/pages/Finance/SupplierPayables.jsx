import React, { useState, useEffect, useRef } from 'react';
import { FiEdit } from 'react-icons/fi';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoTrashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Calendar } from '../../components/ui/calendar';
import { supplierPayableService } from '../../services/supplierPayableService';
import { accountService } from '../../services/accountService';

// Custom Dropdown Select
const CustomSelect = ({ value, onChange, options, className = '' }) => {
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

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className="truncate">{value || 'Select...'}</span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} size={13} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                value === opt ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Initial Data for Supplier Payables
const INITIAL_PAYABLES = [
  {
    id: 8,
    payableCode: '#8',
    purchaseCode: 'PURCHASE-8',
    supplier: 'ABC Traders',
    branch: 'Al Naaz Kayamkulam',
    totalAmount: 10000,
    paidAmount: 7000,
    outstandingAmount: 3000,
    status: 'PARTIAL'
  },
  {
    id: 7,
    payableCode: '#7',
    purchaseCode: 'PURCHASE-7',
    supplier: 'Green Valley Farms',
    branch: 'Al Naaz Kayamkulam',
    totalAmount: 15400,
    paidAmount: 15400,
    outstandingAmount: 0,
    status: 'PAID'
  },
  {
    id: 6,
    payableCode: '#6',
    purchaseCode: 'PURCHASE-6',
    supplier: 'Coastal Ice Co.',
    branch: 'Al Naaz Kayamkulam',
    totalAmount: 4200,
    paidAmount: 0,
    outstandingAmount: 4200,
    status: 'OPEN'
  }
];

// Initial Data for Supplier Payments
const INITIAL_PAYMENTS = [
  {
    id: 7,
    paymentCode: '#7',
    supplier: 'ABC Traders',
    payableCode: 'PAYABLE-8',
    amount: 4000,
    paymentDate: '08 Sep 2026',
    paymentAccount: 'HDFC Current A/C',
    reference: 'SUPPLIER-PAYMENT-7',
    createdBy: 'Farhan Rasheed',
    branch: 'Al Naaz Kayamkulam'
  },
  {
    id: 6,
    paymentCode: '#6',
    supplier: 'ABC Traders',
    payableCode: 'PAYABLE-8',
    amount: 3000,
    paymentDate: '05 Sep 2026',
    paymentAccount: 'HDFC Current A/C',
    reference: 'SUPPLIER-PAYMENT-6',
    createdBy: 'Farhan Rasheed',
    branch: 'Al Naaz Kayamkulam'
  },
  {
    id: 5,
    paymentCode: '#5',
    supplier: 'Green Valley Farms',
    payableCode: 'PAYABLE-7',
    amount: 15400,
    paymentDate: '30 Aug 2026',
    paymentAccount: 'HDFC Current A/C',
    reference: 'SUPPLIER-PAYMENT-5',
    createdBy: 'Farhan Rasheed',
    branch: 'Al Naaz Kayamkulam'
  }
];

const SupplierPayables = () => {
  const [activeTab, setActiveTab] = useState('payables'); // 'payables' | 'payments'

  // --- Payables Tab State ---
  const [payables, setPayables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [branchFilter, setBranchFilter] = useState('All');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingPayable, setViewingPayable] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // --- Payments Tab State ---
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsCurrentPage, setPaymentsCurrentPage] = useState(1);
  const [paymentsTotalCount, setPaymentsTotalCount] = useState(0);

  const [paymentBranchFilter, setPaymentBranchFilter] = useState('All');
  const [paymentSupplierFilter, setPaymentSupplierFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentAccountFilter, setPaymentAccountFilter] = useState('All');

  const [showMakePaymentModal, setShowMakePaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [showMakePaymentCalendarPopover, setShowMakePaymentCalendarPopover] = useState(false);
  const makePaymentCalendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (makePaymentCalendarRef.current && !makePaymentCalendarRef.current.contains(event.target)) {
        setShowMakePaymentCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newPayment, setNewPayment] = useState({
    payable: '',
    payment_account: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    remarks: ''
  });

  // --- Accounts State for mapping payment_account IDs ---
  const [accountsList, setAccountsList] = useState([]);

  const loadAccounts = async () => {
    try {
      const data = await accountService.fetchAccounts();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setAccountsList(list);
      return list;
    } catch (err) {
      console.warn('Failed to fetch financial accounts:', err);
      return [];
    }
  };

  const resolveAccountName = (accId, accName, currentAccounts = null) => {
    if (accName && accName !== 'string') return accName;
    if (!accId) return 'N/A';
    const listToSearch = currentAccounts && currentAccounts.length > 0 ? currentAccounts : accountsList;
    const matched = listToSearch.find((acc) => acc.id === accId || String(acc.id) === String(accId));
    if (matched) return matched.name || matched.account_name || `Account #${accId}`;
    return `Account #${accId}`;
  };

  const loadSupplierPayables = async (page = 1) => {
    setLoading(true);
    try {
      const data = await supplierPayableService.fetchSupplierPayables(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setTotalCount(count);
      setCurrentPage(page);

      if (list.length > 0) {
        const mapped = list.map((item) => ({
          id: item.id,
          payableCode: `#${item.id}`,
          purchaseId: item.purchase,
          purchaseCode: item.purchase_invoice_number && item.purchase_invoice_number !== 'string' 
            ? item.purchase_invoice_number 
            : `PURCHASE-${item.purchase}`,
          purchaseDate: item.purchase_date,
          supplier: item.supplier_name || 'N/A',
          supplier_id: item.supplier,
          branch: item.branch_name || 'Al Naaz Kayamkulam',
          branch_id: item.branch,
          totalAmount: parseFloat(item.total_amount) || 0,
          paidAmount: parseFloat(item.paid_amount) || 0,
          outstandingAmount: parseFloat(item.outstanding_amount) || 0,
          status: item.status || 'OPEN',
          payments: item.payments || [],
          createdAt: item.created_at
        }));
        setPayables(mapped);
      } else {
        setPayables([]);
      }
    } catch (err) {
      console.warn('Failed to fetch supplier payables from API, using fallback data:', err);
      setPayables(INITIAL_PAYABLES);
      setTotalCount(INITIAL_PAYABLES.length);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplierPayments = async (page = 1, currentAccounts = null) => {
    setLoadingPayments(true);
    try {
      const data = await supplierPayableService.fetchSupplierPayments(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setPaymentsTotalCount(count);
      setPaymentsCurrentPage(page);

      const accsToUse = currentAccounts || accountsList;

      if (list.length > 0) {
        const mapped = list.map((item) => ({
          id: item.id,
          paymentCode: `#${item.id}`,
          payableId: item.payable,
          payableCode: `#${item.payable}`,
          supplier: item.supplier_name || 'N/A',
          amount: parseFloat(item.amount) || 0,
          amountRaw: item.amount,
          paymentDate: item.payment_date,
          paymentAccount: item.payment_account !== undefined && item.payment_account !== null ? item.payment_account : 'N/A',
          reference: item.reference || 'N/A',
          remarks: item.remarks || '',
          createdBy: item.created_by_name 
            ? item.created_by_name 
            : item.created_by === 1 
            ? 'admin' 
            : item.created_by === 3 
            ? 'manager1' 
            : `User #${item.created_by}`,
          payableStatus: item.payable_status || 'PARTIAL',
          branch: item.branch_name || 'Al Naaz Kayamkulam',
          createdAt: item.created_at
        }));
        setPayments(mapped);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.warn('Failed to fetch supplier payments from API, using fallback data:', err);
      setPayments(INITIAL_PAYMENTS);
      setPaymentsTotalCount(INITIAL_PAYMENTS.length);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleViewPayable = async (payableItem) => {
    setViewingPayable(payableItem);
    setLoadingDetail(true);
    try {
      const data = await supplierPayableService.getSupplierPayableById(payableItem.id);
      if (data) {
        setViewingPayable({
          id: data.id,
          payableCode: `#${data.id}`,
          purchaseId: data.purchase,
          purchaseCode: data.purchase_invoice_number && data.purchase_invoice_number !== 'string'
            ? data.purchase_invoice_number
            : `PURCHASE-${data.purchase}`,
          purchaseDate: data.purchase_date,
          supplier: data.supplier_name || 'N/A',
          supplier_id: data.supplier,
          branch: data.branch_name || 'Al Naaz Kayamkulam',
          branch_id: data.branch,
          totalAmount: parseFloat(data.total_amount) || 0,
          paidAmount: parseFloat(data.paid_amount) || 0,
          outstandingAmount: parseFloat(data.outstanding_amount) || 0,
          status: data.status || 'OPEN',
          payments: data.payments || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch detail for payable #${payableItem.id}:`, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      const accs = await loadAccounts();
      loadSupplierPayables(1);
      loadSupplierPayments(1, accs);
    };
    initData();
  }, []);

  // Calculate Metrics for Payables
  const totalOutstanding = payables.reduce((acc, item) => acc + item.outstandingAmount, 0);
  const openCount = payables.filter((p) => p.status === 'OPEN').length;
  const partialCount = payables.filter((p) => p.status === 'PARTIAL').length;
  const paidCount = payables.filter((p) => p.status === 'PAID').length;

  // Filtered Payables
  const filteredPayables = payables.filter((p) => {
    if (branchFilter !== 'All' && p.branch !== branchFilter) return false;
    if (supplierFilter !== 'All' && p.supplier !== supplierFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    return true;
  });

  // Filtered Payments
  const filteredPayments = payments.filter((pm) => {
    if (paymentBranchFilter !== 'All' && pm.branch && pm.branch !== paymentBranchFilter) return false;
    if (paymentSupplierFilter !== 'All' && pm.supplier !== paymentSupplierFilter) return false;
    if (paymentAccountFilter !== 'All' && pm.paymentAccount !== paymentAccountFilter) return false;
    if (dateFrom && pm.paymentDate < dateFrom) return false;
    if (dateTo && pm.paymentDate > dateTo) return false;
    return true;
  });

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setNewPayment({
      payable: '',
      payment_account: '',
      amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      reference: '',
      remarks: ''
    });
    setShowMakePaymentModal(true);
  };

  const handleOpenEditPayment = (pm) => {
    setEditingPayment(pm);
    setNewPayment({
      payable: pm.payableId || '',
      payment_account: pm.paymentAccount !== undefined && pm.paymentAccount !== 'N/A' ? String(pm.paymentAccount) : '',
      amount: pm.amountRaw !== undefined ? String(pm.amountRaw) : String(pm.amount || ''),
      payment_date: pm.paymentDate || new Date().toISOString().split('T')[0],
      reference: pm.reference && pm.reference !== 'N/A' ? pm.reference : '',
      remarks: pm.remarks || ''
    });
    setShowMakePaymentModal(true);
  };

  // Submit Make Payment Handler (POST /api/supplier-payments/)
  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!newPayment.payable) {
      toast.error('Please select a supplier payable');
      return;
    }
    if (!newPayment.payment_account) {
      toast.error('Please select a payment account');
      return;
    }
    const amtNum = parseFloat(newPayment.amount);
    if (!amtNum || amtNum <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const payload = {
      payable: Number(newPayment.payable),
      payment_account: Number(newPayment.payment_account),
      amount: String(newPayment.amount),
      payment_date: newPayment.payment_date,
      reference: newPayment.reference || `REF-${Date.now()}`,
      remarks: newPayment.remarks || 'Supplier payment'
    };

    setIsSubmittingPayment(true);
    try {
      await supplierPayableService.createSupplierPayment(payload);
      toast.success(`Payment of ₹${amtNum.toLocaleString('en-IN')} recorded successfully!`);
      setShowMakePaymentModal(false);
      setNewPayment({
        payable: '',
        payment_account: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        reference: '',
        remarks: ''
      });
      loadSupplierPayables(currentPage);
      loadSupplierPayments(paymentsCurrentPage);
    } catch (err) {
      console.error('Failed to record supplier payment:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to record supplier payment';
      toast.error(errMsg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Submit Edit Payment Handler (PATCH /api/supplier-payments/{id}/)
  const handleEditPayment = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    if (!newPayment.payable) {
      toast.error('Please select a supplier payable');
      return;
    }
    if (!newPayment.payment_account) {
      toast.error('Please select a payment account');
      return;
    }
    const amtNum = parseFloat(newPayment.amount);
    if (!amtNum || amtNum <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const payload = {
      payable: Number(newPayment.payable),
      payment_account: Number(newPayment.payment_account),
      amount: String(newPayment.amount),
      payment_date: newPayment.payment_date,
      reference: newPayment.reference || 'testing',
      remarks: newPayment.remarks || 'testing'
    };

    setIsSubmittingPayment(true);
    try {
      await supplierPayableService.updateSupplierPayment(editingPayment.id, payload);
      toast.success(`Payment #${editingPayment.id} updated successfully!`);
      setShowMakePaymentModal(false);
      setEditingPayment(null);
      setNewPayment({
        payable: '',
        payment_account: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        reference: '',
        remarks: ''
      });
      loadSupplierPayables(currentPage);
      loadSupplierPayments(paymentsCurrentPage);
    } catch (err) {
      console.error('Failed to update supplier payment:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Failed to update supplier payment';
      toast.error(errMsg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Delete Payment Handler (DELETE /api/supplier-payments/{id}/)
  const handleDeletePaymentConfirm = async () => {
    if (!deletingPayment) return;
    setIsDeletingPayment(true);
    try {
      await supplierPayableService.deleteSupplierPayment(deletingPayment.id);
      toast.success(`Payment #${deletingPayment.id} deleted successfully!`);
      setDeletingPayment(null);
      loadSupplierPayables(currentPage);
      loadSupplierPayments(paymentsCurrentPage);
    } catch (err) {
      console.error('Failed to delete supplier payment:', err);
      const errMsg = err.response?.data?.detail || 'Failed to delete supplier payment';
      toast.error(errMsg);
    } finally {
      setIsDeletingPayment(false);
    }
  };

  return (
    <div className="space-y-5 font-sans w-full pb-10">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {activeTab === 'payables' ? 'Supplier Payables' : 'Supplier Payments'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'payables'
              ? 'Outstanding balances owed to suppliers for credit purchases.'
              : 'Every payment reduces the payable and the selected cash/bank account.'}
          </p>
        </div>

        {activeTab === 'payments' && (
          <button
            onClick={handleOpenAddPayment}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <IoAddOutline size={16} />
            <span>+ Make Payment</span>
          </button>
        )}
      </div>

      {/* Main Outer Container with Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Underlined Tab Switcher */}
        <div className="flex px-6 border-b border-gray-200 bg-white overflow-x-auto">
          {[
            { id: 'payables', label: 'Supplier Payables' },
            { id: 'payments', label: 'Supplier Payments' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm transition-colors relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-600 font-bold'
                  : 'text-gray-500 font-semibold hover:text-gray-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* --- TAB 1: SUPPLIER PAYABLES VIEW --- */}
        {activeTab === 'payables' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* 4 Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-gray-500">Total Payables</p>
                <p className="text-xl font-extrabold text-amber-800 mt-1 tabular-nums">
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-gray-500">Open</p>
                <p className="text-xl font-extrabold text-gray-900 mt-1">
                  {openCount}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-gray-500">Partially Paid</p>
                <p className="text-xl font-extrabold text-amber-600 mt-1">
                  {partialCount}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                <p className="text-xs font-semibold text-gray-500">Paid</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-1">
                  {paidCount}
                </p>
              </div>
            </div>

            {/* Filter Bar Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                  <CustomSelect
                    value={branchFilter}
                    onChange={setBranchFilter}
                    options={['All', ...Array.from(new Set(payables.map((p) => p.branch)))]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                  <CustomSelect
                    value={supplierFilter}
                    onChange={setSupplierFilter}
                    options={['All', ...Array.from(new Set(payables.map((p) => p.supplier)))]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={['All', 'OPEN', 'PARTIAL', 'PAID']}
                  />
                </div>
              </div>
            </div>

            {/* Supplier Payables Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
              <div className="overflow-x-auto min-h-[480px] w-full">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Payable ID</th>
                      <th className="py-3.5 px-4">Purchase</th>
                      <th className="py-3.5 px-4">Supplier</th>
                      <th className="py-3.5 px-4">Branch</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Paid</th>
                      <th className="py-3.5 px-4">Outstanding</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {loading ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={i} className="animate-pulse h-[54px]">
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                          <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredPayables.length > 0 ? (
                      filteredPayables.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Payable ID */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">{p.payableCode}</td>

                          {/* Purchase Link */}
                          <td className="py-3.5 px-4 font-bold text-blue-600 hover:underline cursor-pointer">
                            {p.purchaseCode}
                          </td>

                          {/* Supplier */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800">{p.supplier}</td>

                          {/* Branch */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{p.branch}</td>

                          {/* Total */}
                          <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums">
                            ₹{p.totalAmount.toLocaleString('en-IN')}
                          </td>

                          {/* Paid */}
                          <td className="py-3.5 px-4 font-semibold text-emerald-600 tabular-nums">
                            ₹{p.paidAmount.toLocaleString('en-IN')}
                          </td>

                          {/* Outstanding */}
                          <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums">
                            ₹{p.outstandingAmount.toLocaleString('en-IN')}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {p.status === 'PARTIAL' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>PARTIAL</span>
                              </span>
                            )}
                            {p.status === 'PAID' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span>✓ PAID</span>
                              </span>
                            )}
                            {p.status === 'OPEN' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>OPEN</span>
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleViewPayable(p)}
                              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                          No supplier payables found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const totalItems = totalCount || payables.length;
                const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
                const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
                const endItem = Math.min(currentPage * pageSize, totalItems);

                return (
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                    <div>
                      Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                      <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                      <span className="font-bold text-gray-800">{totalItems}</span> payables
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={currentPage === 1 || loading}
                        onClick={() => loadSupplierPayables(currentPage - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <IoChevronBackOutline size={14} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            disabled={loading}
                            onClick={() => loadSupplierPayables(pageNum)}
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
                        disabled={currentPage >= totalPages || loading}
                        onClick={() => loadSupplierPayables(currentPage + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <IoChevronForwardOutline size={14} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* --- TAB 2: SUPPLIER PAYMENTS VIEW --- */}
        {activeTab === 'payments' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Filter Bar Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 max-w-4xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                  <CustomSelect
                    value={paymentSupplierFilter}
                    onChange={setPaymentSupplierFilter}
                    options={['All', ...Array.from(new Set(payments.map((pm) => pm.supplier)))]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Account</label>
                  <CustomSelect
                    value={paymentAccountFilter}
                    onChange={setPaymentAccountFilter}
                    options={['All', ...Array.from(new Set(payments.map((pm) => pm.paymentAccount)))]}
                  />
                </div>
              </div>
            </div>

            {/* Supplier Payments Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
              <div className="overflow-x-auto min-h-[480px] w-full">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Payment ID</th>
                      <th className="py-3.5 px-4">Supplier</th>
                      <th className="py-3.5 px-4">Payable ID</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Payment Account</th>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Created By</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {loadingPayments ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={i} className="animate-pulse h-[54px]">
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredPayments.length > 0 ? (
                      filteredPayments.map((pm) => (
                        <tr key={pm.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Payment ID */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">{pm.paymentCode}</td>

                          {/* Supplier */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800">{pm.supplier}</td>

                          {/* Payable Link */}
                          <td className="py-3.5 px-4 font-bold text-blue-600 hover:underline cursor-pointer">
                            {pm.payableCode}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-extrabold text-rose-600 tabular-nums">
                            - ₹{pm.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Payment Date */}
                          <td className="py-3.5 px-4 font-medium text-gray-800">{pm.paymentDate}</td>

                          {/* Payment Account */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{pm.paymentAccount}</td>

                          {/* Reference Link */}
                          <td className="py-3.5 px-4 font-bold text-blue-600 hover:underline cursor-pointer">
                            {pm.reference}
                          </td>

                          {/* Created By */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{pm.createdBy}</td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                title="View Details & Remarks"
                                onClick={() => setViewingPayment(pm)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <IoEyeOutline size={16} />
                              </button>
                              <button
                                type="button"
                                title="Edit Payment"
                                onClick={() => handleOpenEditPayment(pm)}
                                className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <FiEdit size={15} />
                              </button>
                              <button
                                type="button"
                                title="Delete Payment"
                                onClick={() => setDeletingPayment(pm)}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <IoTrashOutline size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                          No supplier payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const totalItems = paymentsTotalCount || payments.length;
                const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
                const startItem = totalItems > 0 ? (paymentsCurrentPage - 1) * pageSize + 1 : 0;
                const endItem = Math.min(paymentsCurrentPage * pageSize, totalItems);

                return (
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                    <div>
                      Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                      <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                      <span className="font-bold text-gray-800">{totalItems}</span> payments
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={paymentsCurrentPage === 1 || loadingPayments}
                        onClick={() => loadSupplierPayments(paymentsCurrentPage - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <IoChevronBackOutline size={14} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            disabled={loadingPayments}
                            onClick={() => loadSupplierPayments(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                              paymentsCurrentPage === pageNum
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
                        disabled={paymentsCurrentPage >= totalPages || loadingPayments}
                        onClick={() => loadSupplierPayments(paymentsCurrentPage + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <IoChevronForwardOutline size={14} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

      </div>

      {/* Make / Edit Payment Modal */}
      {showMakePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <h3 className="text-base font-bold text-gray-900">
                {editingPayment ? `Edit Supplier Payment ${editingPayment.paymentCode}` : '+ Make Supplier Payment'}
              </h3>
              <button onClick={() => setShowMakePaymentModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={editingPayment ? handleEditPayment : handleMakePayment} className="p-5 space-y-4 font-sans text-xs">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payable Invoice *</label>
                <select
                  value={newPayment.payable}
                  onChange={(e) => setNewPayment({ ...newPayment, payable: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                >
                  <option value="">-- Select Payable --</option>
                  {payables.map((p) => (
                    <option key={p.id} value={p.id}>
                      Payable #{p.id} ({p.supplier} - Bal: ₹{p.outstandingAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Account *</label>
                <select
                  value={newPayment.payment_account}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_account: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                >
                  <option value="">-- Select Payment Account --</option>
                  {accountsList.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name || acc.account_name} (ID: {acc.id})
                    </option>
                  ))}
                  {accountsList.length === 0 && (
                    <>
                      <option value="1">Petty Cash (ID: 1)</option>
                      <option value="2">Bank Account (ID: 2)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 100"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative" ref={makePaymentCalendarRef}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date *</label>
                  <button
                    type="button"
                    onClick={() => setShowMakePaymentCalendarPopover(!showMakePaymentCalendarPopover)}
                    className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium cursor-pointer shadow-2xs"
                  >
                    <span>
                      {newPayment.payment_date
                        ? newPayment.payment_date.split('-').reverse().join('/')
                        : '03/10/2026'}
                    </span>
                    <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
                  </button>

                  {showMakePaymentCalendarPopover && (
                    <div className="absolute left-0 top-full mt-1.5 z-[80] shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 animate-in fade-in zoom-in-95 duration-100">
                      <Calendar
                        value={newPayment.payment_date || new Date().toISOString().slice(0, 10)}
                        onChange={(newDate) => {
                          setNewPayment({ ...newPayment, payment_date: newDate });
                          setShowMakePaymentCalendarPopover(false);
                        }}
                        onClose={() => setShowMakePaymentCalendarPopover(false)}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. testing"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks</label>
                <textarea
                  rows="2"
                  placeholder="e.g. testing"
                  value={newPayment.remarks}
                  onChange={(e) => setNewPayment({ ...newPayment, remarks: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMakePaymentModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingPayment ? (isSubmittingPayment ? 'Saving...' : 'Update Payment') : (isSubmittingPayment ? 'Recording...' : 'Record Payment')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payment Details & Remarks Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Payment Details {viewingPayment.paymentCode}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supplier: <span className="font-semibold text-gray-700">{viewingPayment.supplier}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingPayment(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-rose-50/80 rounded-xl border border-rose-200/60 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-rose-800">Amount Paid</p>
                  <p className="text-xl font-extrabold text-rose-900 mt-0.5 tabular-nums">
                    ₹{viewingPayment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800">
                  {viewingPayment.payableStatus}
                </span>
              </div>

              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                  <span className="font-medium text-gray-500">Payable ID:</span>
                  <span className="font-bold text-blue-600">{viewingPayment.payableCode}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                  <span className="font-medium text-gray-500">Supplier Name:</span>
                  <span className="font-bold text-gray-900">{viewingPayment.supplier}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                  <span className="font-medium text-gray-500">Payment Account:</span>
                  <span className="font-semibold text-gray-800">{viewingPayment.paymentAccount}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                  <span className="font-medium text-gray-500">Payment Date:</span>
                  <span className="font-semibold text-gray-800">{viewingPayment.paymentDate}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                  <span className="font-medium text-gray-500">Reference:</span>
                  <span className="font-semibold text-gray-800">{viewingPayment.reference}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                  <span className="font-medium text-gray-500">Created By:</span>
                  <span className="font-semibold text-gray-800">{viewingPayment.createdBy}</span>
                </div>

                {viewingPayment.createdAt && (
                  <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                    <span className="font-medium text-gray-500">Created At:</span>
                    <span className="font-medium text-gray-600">{new Date(viewingPayment.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Remarks Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">Remarks</label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium text-xs leading-relaxed min-h-[50px]">
                  {viewingPayment.remarks ? viewingPayment.remarks : <span className="text-gray-400 italic">No remarks provided.</span>}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {deletingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg flex items-center justify-center">
              <IoTrashOutline size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Delete Payment {deletingPayment.paymentCode}?</h3>
            <p className="text-xs text-gray-500 mb-5">
              Are you sure you want to delete payment <span className="font-bold text-gray-800">{deletingPayment.paymentCode}</span> of ₹{deletingPayment.amount.toLocaleString('en-IN')}? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={isDeletingPayment}
                onClick={() => setDeletingPayment(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPayment}
                onClick={handleDeletePaymentConfirm}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {isDeletingPayment ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Payable Details Modal */}
      {viewingPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Payable Details {viewingPayable.payableCode}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Supplier: <span className="font-semibold text-gray-700">{viewingPayable.supplier}</span> • Invoice: <span className="font-semibold text-gray-700">{viewingPayable.purchaseCode}</span>
                </p>
              </div>
              <button
                onClick={() => setViewingPayable(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 font-medium">Loading payable details from API...</p>
                </div>
              ) : (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/60">
                      <p className="text-[11px] font-semibold text-amber-800">Outstanding</p>
                      <p className="text-lg font-extrabold text-amber-900 mt-0.5 tabular-nums">
                        ₹{viewingPayable.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200/60">
                      <p className="text-[11px] font-semibold text-blue-800">Total Amount</p>
                      <p className="text-lg font-extrabold text-blue-900 mt-0.5 tabular-nums">
                        ₹{viewingPayable.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    <div className="p-3.5 bg-emerald-50/80 rounded-xl border border-emerald-200/60">
                      <p className="text-[11px] font-semibold text-emerald-800">Total Paid</p>
                      <p className="text-lg font-extrabold text-emerald-900 mt-0.5 tabular-nums">
                        ₹{viewingPayable.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* General Info Grid */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                      <span className="font-medium text-gray-500">Supplier Name:</span>
                      <span className="font-bold text-gray-900">{viewingPayable.supplier}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                      <span className="font-medium text-gray-500">Branch:</span>
                      <span className="font-semibold text-gray-800">{viewingPayable.branch}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                      <span className="font-medium text-gray-500">Invoice Number:</span>
                      <span className="font-bold text-gray-900">{viewingPayable.purchaseCode}</span>
                    </div>

                    {viewingPayable.purchaseDate && (
                      <div className="flex justify-between py-1 border-b border-gray-200/60 text-gray-700">
                        <span className="font-medium text-gray-500">Purchase Date:</span>
                        <span className="font-semibold text-gray-800">{viewingPayable.purchaseDate}</span>
                      </div>
                    )}

                    <div className="flex justify-between py-1 text-gray-700">
                      <span className="font-medium text-gray-500">Status:</span>
                      <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                        viewingPayable.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : viewingPayable.status === 'PARTIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {viewingPayable.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment History Table */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 text-xs tracking-wide uppercase">
                      Payment History Breakdown ({viewingPayable.payments.length})
                    </h4>

                    {viewingPayable.payments.length > 0 ? (
                      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Amount</th>
                              <th className="py-2.5 px-3">Account</th>
                              <th className="py-2.5 px-3">Reference / Remarks</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs">
                            {viewingPayable.payments.map((pm) => (
                              <tr key={pm.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="py-2.5 px-3 font-medium text-gray-800">
                                  {pm.payment_date}
                                </td>
                                <td className="py-2.5 px-3 font-bold text-emerald-600 tabular-nums">
                                  ₹{parseFloat(pm.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-2.5 px-3 font-medium text-gray-700">
                                  {pm.payment_account !== undefined && pm.payment_account !== null ? pm.payment_account : 'N/A'}
                                </td>
                                <td className="py-2.5 px-3 text-gray-600">
                                  <div className="font-semibold text-gray-900">{pm.reference}</div>
                                  {pm.remarks && <div className="text-[11px] text-gray-500 italic mt-0.5">{pm.remarks}</div>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center text-gray-400 font-medium text-xs">
                        No payments recorded for this payable yet.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingPayable(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
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

export default SupplierPayables;
