import React, { useState, useEffect, useRef } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

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
    branch: 'Kochi — Main Mandi',
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
    branch: 'Kochi — Main Mandi',
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
    branch: 'Kochi — Main Mandi',
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
    branch: 'Kochi — Main Mandi'
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
    branch: 'Kochi — Main Mandi'
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
    branch: 'Kochi — Main Mandi'
  }
];

const SupplierPayables = () => {
  const [activeTab, setActiveTab] = useState('payables'); // 'payables' | 'payments'

  // --- Payables Tab State ---
  const [payables, setPayables] = useState(INITIAL_PAYABLES);
  const [branchFilter, setBranchFilter] = useState('Kochi — Main Mandi');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewingPayable, setViewingPayable] = useState(null);

  // --- Payments Tab State ---
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [paymentBranchFilter, setPaymentBranchFilter] = useState('Kochi — Main Mandi');
  const [paymentSupplierFilter, setPaymentSupplierFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentAccountFilter, setPaymentAccountFilter] = useState('All');

  const [showMakePaymentModal, setShowMakePaymentModal] = useState(false);

  const [newPayment, setNewPayment] = useState({
    supplier: 'ABC Traders',
    payableCode: 'PAYABLE-8',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentAccount: 'HDFC Current A/C',
    notes: ''
  });

  // Calculate Metrics for Payables
  const totalOutstanding = payables.reduce((acc, item) => acc + item.outstandingAmount, 0);
  const openCount = payables.filter((p) => p.status === 'OPEN').length;
  const partialCount = payables.filter((p) => p.status === 'PARTIAL').length;
  const paidCount = payables.filter((p) => p.status === 'PAID').length;

  // Filtered Payables
  const filteredPayables = payables.filter((p) => {
    if (branchFilter && p.branch !== branchFilter) return false;
    if (supplierFilter !== 'All' && p.supplier !== supplierFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    return true;
  });

  // Filtered Payments
  const filteredPayments = payments.filter((pm) => {
    if (paymentBranchFilter && pm.branch !== paymentBranchFilter) return false;
    if (paymentSupplierFilter !== 'All' && pm.supplier !== paymentSupplierFilter) return false;
    if (paymentAccountFilter !== 'All' && pm.paymentAccount !== paymentAccountFilter) return false;
    if (dateFrom && pm.paymentDate < dateFrom) return false;
    if (dateTo && pm.paymentDate > dateTo) return false;
    return true;
  });

  // Submit Make Payment Handler
  const handleMakePayment = (e) => {
    e.preventDefault();
    const amt = parseFloat(newPayment.amount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    // Find targeted payable
    const targetPayable = payables.find(
      (p) => p.payableCode === newPayment.payableCode || `#${p.id}` === newPayment.payableCode
    );

    if (targetPayable && amt > targetPayable.outstandingAmount) {
      toast.error(`Payment amount cannot exceed remaining outstanding (₹${targetPayable.outstandingAmount.toLocaleString('en-IN')})`);
      return;
    }

    const nextPaymentId = payments.length > 0 ? Math.max(...payments.map((p) => p.id)) + 1 : 1;
    const refCode = `SUPPLIER-PAYMENT-${nextPaymentId}`;
    const formattedDateStr = new Date(newPayment.paymentDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const paymentRecord = {
      id: nextPaymentId,
      paymentCode: `#${nextPaymentId}`,
      supplier: newPayment.supplier,
      payableCode: targetPayable ? `PAYABLE-${targetPayable.id}` : newPayment.payableCode,
      amount: amt,
      paymentDate: formattedDateStr,
      paymentAccount: newPayment.paymentAccount,
      reference: refCode,
      createdBy: 'Admin User',
      branch: branchFilter
    };

    // Update target payable paid & outstanding amount
    if (targetPayable) {
      setPayables((prev) =>
        prev.map((p) => {
          if (p.id === targetPayable.id) {
            const newPaid = p.paidAmount + amt;
            const newOutstanding = Math.max(0, p.totalAmount - newPaid);
            let newStatus = 'PARTIAL';
            if (newOutstanding === 0) newStatus = 'PAID';
            else if (newPaid === 0) newStatus = 'OPEN';

            return {
              ...p,
              paidAmount: newPaid,
              outstandingAmount: newOutstanding,
              status: newStatus
            };
          }
          return p;
        })
      );
    }

    setPayments([paymentRecord, ...payments]);
    setShowMakePaymentModal(false);
    toast.success(`Payment of ₹${amt.toLocaleString('en-IN')} recorded for ${newPayment.supplier}!`);

    setNewPayment({
      supplier: 'ABC Traders',
      payableCode: 'PAYABLE-8',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentAccount: 'HDFC Current A/C',
      notes: ''
    });
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
            onClick={() => setShowMakePaymentModal(true)}
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
                    options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                  <CustomSelect
                    value={supplierFilter}
                    onChange={setSupplierFilter}
                    options={['All', 'ABC Traders', 'Green Valley Farms', 'Coastal Ice Co.']}
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
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
                    {filteredPayables.length > 0 ? (
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
                              onClick={() => setViewingPayable(p)}
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
            </div>

          </div>
        )}

        {/* --- TAB 2: SUPPLIER PAYMENTS VIEW --- */}
        {activeTab === 'payments' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Filter Bar Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 max-w-5xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                  <CustomSelect
                    value={paymentBranchFilter}
                    onChange={setPaymentBranchFilter}
                    options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier</label>
                  <CustomSelect
                    value={paymentSupplierFilter}
                    onChange={setPaymentSupplierFilter}
                    options={['All', 'ABC Traders', 'Green Valley Farms', 'Coastal Ice Co.']}
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
                    options={['All', 'HDFC Current A/C', 'Main Cash Drawer', 'Petty Cash']}
                  />
                </div>
              </div>
            </div>

            {/* Supplier Payments Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[950px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Payment ID</th>
                      <th className="py-3.5 px-4">Supplier</th>
                      <th className="py-3.5 px-4">Payable</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Payment Account</th>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {filteredPayments.length > 0 ? (
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
                            - ₹{pm.amount.toLocaleString('en-IN')}
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
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                          No supplier payments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Make Payment Modal */}
      {showMakePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Make Supplier Payment</h3>
              <button onClick={() => setShowMakePaymentModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Supplier</label>
                <CustomSelect
                  value={newPayment.supplier}
                  onChange={(val) => setNewPayment({ ...newPayment, supplier: val })}
                  options={['ABC Traders', 'Green Valley Farms', 'Coastal Ice Co.']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payable ID</label>
                <CustomSelect
                  value={newPayment.payableCode}
                  onChange={(val) => setNewPayment({ ...newPayment, payableCode: val })}
                  options={payables.map((p) => `PAYABLE-${p.id} (${p.supplier} - ₹${p.outstandingAmount.toLocaleString('en-IN')})`)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 3000"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment({ ...newPayment, paymentDate: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Account</label>
                  <CustomSelect
                    value={newPayment.paymentAccount}
                    onChange={(val) => setNewPayment({ ...newPayment, paymentAccount: val })}
                    options={['HDFC Current A/C', 'Main Cash Drawer', 'Petty Cash']}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Reference</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Bank transfer / Cheque reference details..."
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payable Details Modal */}
      {viewingPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Payable Details {viewingPayable.payableCode}</h3>
                <p className="text-xs text-gray-500">{viewingPayable.supplier} • {viewingPayable.purchaseCode}</p>
              </div>
              <button onClick={() => setViewingPayable(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-800 font-semibold">Remaining Outstanding</p>
                  <p className="text-xl font-extrabold text-amber-900 tabular-nums">
                    ₹{viewingPayable.outstandingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800">
                  {viewingPayable.status}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Total Purchase Bill:</span>
                  <span className="font-bold">₹{viewingPayable.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Total Paid So Far:</span>
                  <span className="font-semibold text-emerald-600">₹{viewingPayable.paidAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-700">
                  <span>Branch:</span>
                  <span className="font-bold">{viewingPayable.branch}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
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
