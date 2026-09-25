import React, { useState, useRef, useEffect } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoWarningOutline,
  IoFilterOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

// Custom Select Component for crisp filter controls
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
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
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
              className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
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

// Metric Card Component (Modeled after CompanyOverview.jsx)
const MetricCard = ({ title, amount, subtitle, icon: Icon, iconBg, iconColor, trend, trendValue }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">{amount}</h3>
      {subtitle && <p className="text-[10px] font-medium text-gray-400 mt-1">{subtitle}</p>}
      {trend && (
        <p className={`text-[10px] font-semibold mt-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendValue} vs last month
        </p>
      )}
    </div>
    <div className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
      <Icon size={24} />
    </div>
  </div>
);

// Initial Expenses Dataset
const INITIAL_EXPENSES = [
  {
    id: 4,
    expenseCode: '#4',
    date: '2026-09-20',
    formattedDate: '20 Sep 2026',
    branch: 'Kochi — Main Mandi',
    category: 'Ice & Packaging',
    paymentAccount: 'Petty Cash',
    amount: 1800,
    description: 'Ice blocks — evening batch',
    createdBy: 'Sana Iqbal'
  },
  {
    id: 3,
    expenseCode: '#3',
    date: '2026-09-19',
    formattedDate: '19 Sep 2026',
    branch: 'Kochi — Main Mandi',
    category: 'Transport & Logistics',
    paymentAccount: 'Main Cash Drawer',
    amount: 3200,
    description: 'Auto hire — market run',
    createdBy: 'Rahim K.'
  },
  {
    id: 2,
    expenseCode: '#2',
    date: '2026-09-15',
    formattedDate: '15 Sep 2026',
    branch: 'Kochi — Main Mandi',
    category: 'Utilities',
    paymentAccount: 'HDFC Current A/C',
    amount: 6400,
    description: 'Electricity bill — Aug cycle',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 1,
    expenseCode: '#1',
    date: '2026-09-12',
    formattedDate: '12 Sep 2026',
    branch: 'Kochi — Main Mandi',
    category: 'Maintenance',
    paymentAccount: 'Main Cash Drawer',
    amount: 950,
    description: 'Weighing scale repair',
    createdBy: 'Rahim K.'
  }
];

// Initial Expense Adjustments Dataset
const INITIAL_ADJUSTMENTS = [
  {
    id: 1,
    adjustmentCode: '#1',
    expenseCode: 'EXPENSE-2',
    oldAmount: 6400,
    newAmount: 6800,
    status: 'PENDING',
    reason: 'Meter reading was under-billed; DISCOM issued a revised invoice.',
    requestedBy: 'Farhan Rasheed'
  },
  {
    id: 2,
    adjustmentCode: '#2',
    expenseCode: 'EXPENSE-1',
    oldAmount: 950,
    newAmount: 1150,
    status: 'APPROVED',
    reason: 'Vendor added a spare part cost after initial invoice.',
    requestedBy: 'Rahim K.'
  },
  {
    id: 3,
    adjustmentCode: '#3',
    expenseCode: 'EXPENSE-3',
    oldAmount: 3200,
    newAmount: 2600,
    status: 'REJECTED',
    reason: 'Original entry used round-trip fare by mistake.',
    requestedBy: 'Rahim K.'
  }
];

const Expenses = () => {
  // Page Switcher State: 'expenses' | 'adjustments'
  const [activeTab, setActiveTab] = useState('expenses');

  // --- Expenses View State ---
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [branchFilter, setBranchFilter] = useState('Kochi — Main Mandi');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [accountFilter, setAccountFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingExpense, setViewingExpense] = useState(null);

  const [newExpense, setNewExpense] = useState({
    branch: 'Kochi — Main Mandi',
    category: 'Ice & Packaging',
    paymentAccount: 'Petty Cash',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // --- Expense Adjustments View State ---
  const [adjustments, setAdjustments] = useState(INITIAL_ADJUSTMENTS);
  const [adjStatusFilter, setAdjStatusFilter] = useState('All');
  const [adjExpenseFilter, setAdjExpenseFilter] = useState('All');

  const [showRequestAdjModal, setShowRequestAdjModal] = useState(false);
  const [viewingAdjustment, setViewingAdjustment] = useState(null);

  const [newAdjustment, setNewAdjustment] = useState({
    expenseCode: 'EXPENSE-2',
    oldAmount: 6400,
    newAmount: '',
    reason: ''
  });

  // Filtering Logic
  const filteredExpenses = expenses.filter((e) => {
    if (branchFilter && e.branch !== branchFilter) return false;
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (accountFilter !== 'All' && e.paymentAccount !== accountFilter) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });

  const filteredAdjustments = adjustments.filter((a) => {
    if (adjStatusFilter !== 'All' && a.status !== adjStatusFilter) return false;
    if (adjExpenseFilter !== 'All' && a.expenseCode !== adjExpenseFilter) return false;
    return true;
  });

  // Metrics calculation
  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAdjCount = adjustments.filter((a) => a.status === 'PENDING').length;
  const approvedAdjCount = adjustments.filter((a) => a.status === 'APPROVED').length;

  // Form Submission Handlers
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = parseFloat(newExpense.amount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }

    const newId = expenses.length > 0 ? Math.max(...expenses.map((ex) => ex.id)) + 1 : 1;
    const record = {
      id: newId,
      expenseCode: `#${newId}`,
      date: newExpense.date,
      formattedDate: new Date(newExpense.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      branch: newExpense.branch,
      category: newExpense.category,
      paymentAccount: newExpense.paymentAccount,
      amount: amt,
      description: newExpense.description || 'Operational expense entry',
      createdBy: 'Admin User'
    };

    setExpenses([record, ...expenses]);
    setShowAddModal(false);
    toast.success(`Expense #${newId} recorded successfully!`);
    setNewExpense({
      branch: 'Kochi — Main Mandi',
      category: 'Ice & Packaging',
      paymentAccount: 'Petty Cash',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const handleRequestAdjustment = (e) => {
    e.preventDefault();
    const newAmt = parseFloat(newAdjustment.newAmount) || 0;
    if (newAmt <= 0) {
      toast.error('Please enter a valid new amount');
      return;
    }

    const newId = adjustments.length > 0 ? Math.max(...adjustments.map((a) => a.id)) + 1 : 1;
    const record = {
      id: newId,
      adjustmentCode: `#${newId}`,
      expenseCode: newAdjustment.expenseCode,
      oldAmount: newAdjustment.oldAmount,
      newAmount: newAmt,
      status: 'PENDING',
      reason: newAdjustment.reason || 'Expense amount adjustment request',
      requestedBy: 'Admin User'
    };

    setAdjustments([record, ...adjustments]);
    setShowRequestAdjModal(false);
    toast.success(`Adjustment Request #${newId} submitted!`);
    setNewAdjustment({
      expenseCode: 'EXPENSE-2',
      oldAmount: 6400,
      newAmount: '',
      reason: ''
    });
  };

  const handleUpdateAdjStatus = (id, newStatus) => {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (viewingAdjustment && viewingAdjustment.id === id) {
      setViewingAdjustment({ ...viewingAdjustment, status: newStatus });
    }
    toast.success(`Adjustment #${id} ${newStatus.toLowerCase()}`);
  };

  return (
    <div className="space-y-6 font-sans w-full pb-12">
      
      {/* 1. Page Switcher Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-gray-400">Finance</span>
            <span className="text-xs text-gray-300">&gt;</span>
            <span className="text-xs font-semibold text-blue-600">
              {activeTab === 'expenses' ? 'Expenses Overview' : 'Expense Adjustments Audit'}
            </span>
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {activeTab === 'expenses' ? 'Expenses' : 'Expense Adjustments'}
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {activeTab === 'expenses'
              ? 'Every expense reduces a financial account and creates an immutable EXPENSE transaction.'
              : 'Approval workflow for correcting posted expenses without altering the original record.'}
          </p>
        </div>

        {/* Top Right Action Button & View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Page Switcher Navigation Tabs */}
          <div className="bg-gray-100 p-1 rounded-xl border border-gray-200 flex items-center">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expenses View
            </button>
            <button
              onClick={() => setActiveTab('adjustments')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'adjustments'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Adjustments View
            </button>
          </div>

          {activeTab === 'expenses' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <IoAddOutline size={16} />
              <span>+ Add Expense</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRequestAdjModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <IoAddOutline size={16} />
              <span>+ Request Adjustment</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary Metric Cards Grid (CompanyOverview.jsx Structure) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monthly Expenses"
          amount={`₹ ${totalExpenseSum.toLocaleString('en-IN')}`}
          subtitle="Total Disbursed"
          icon={IoWalletOutline}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          trend="down"
          trendValue="-4%"
        />
        <MetricCard
          title="Expenses Count"
          amount={`${expenses.length} Entries`}
          subtitle="Processed Vouchers"
          icon={IoReceiptOutline}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Pending Adjustments"
          amount={`${pendingAdjCount} Request`}
          subtitle="Awaiting Manager Approval"
          icon={IoWarningOutline}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <MetricCard
          title="Approved Adjustments"
          amount={`${approvedAdjCount} Approved`}
          subtitle="Audit Ledger Reconciled"
          icon={IoCheckmarkCircleOutline}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* --- PAGE 1: EXPENSES VIEW --- */}
      {activeTab === 'expenses' && (
        <div className="space-y-5">
          {/* Filter Bar Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Branch</label>
                <CustomSelect
                  value={branchFilter}
                  onChange={setBranchFilter}
                  options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Category</label>
                <CustomSelect
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={['All', 'Ice & Packaging', 'Transport & Logistics', 'Utilities', 'Maintenance', 'Staff Welfare']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Account</label>
                <CustomSelect
                  value={accountFilter}
                  onChange={setAccountFilter}
                  options={['All', 'Petty Cash', 'Main Cash Drawer', 'HDFC Current A/C']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Expense ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Payment Account</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Created By</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{exp.expenseCode}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-800">{exp.formattedDate}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{exp.branch}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-800">{exp.category}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{exp.paymentAccount}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600 tabular-nums font-mono">
                          - ₹{exp.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-600">{exp.description}</td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{exp.createdBy}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingExpense(exp)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                            title="View Expense Details"
                          >
                            <IoEyeOutline size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                        No expenses found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer API Notice (Matching Screenshot 1) */}
          <div className="inline-block px-3.5 py-2 bg-gray-100/90 text-gray-500 text-[11px] font-medium rounded-xl border border-gray-200/80 shadow-2xs">
            ExpenseViewSet currently exposes CRUD only — category / account / date filters shown here are frontend-only until the backend adds query parameters.
          </div>
        </div>
      )}

      {/* --- PAGE 2: EXPENSE ADJUSTMENTS VIEW --- */}
      {activeTab === 'adjustments' && (
        <div className="space-y-5">
          {/* Filter Bar Box */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
                <CustomSelect
                  value={adjStatusFilter}
                  onChange={setAdjStatusFilter}
                  options={['All', 'PENDING', 'APPROVED', 'REJECTED']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Expense</label>
                <CustomSelect
                  value={adjExpenseFilter}
                  onChange={setAdjExpenseFilter}
                  options={['All', 'EXPENSE-1', 'EXPENSE-2', 'EXPENSE-3', 'EXPENSE-4']}
                />
              </div>
            </div>
          </div>

          {/* Expense Adjustments Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/90 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <th className="py-3.5 px-4">Adjustment ID</th>
                    <th className="py-3.5 px-4">Expense ID</th>
                    <th className="py-3.5 px-4">Old Amount</th>
                    <th className="py-3.5 px-4">New Amount</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reason</th>
                    <th className="py-3.5 px-4">Requested By</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredAdjustments.length > 0 ? (
                    filteredAdjustments.map((adj) => (
                      <tr key={adj.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-gray-900">{adj.adjustmentCode}</td>
                        <td className="py-3.5 px-4 font-bold text-blue-600 font-mono">{adj.expenseCode}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums font-mono">
                          ₹{adj.oldAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums font-mono">
                          ₹{adj.newAmount.toLocaleString('en-IN')}
                        </td>

                        {/* Status Badges Matching Screenshot 2 */}
                        <td className="py-3.5 px-4">
                          {adj.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              <span>PENDING</span>
                            </span>
                          )}
                          {adj.status === 'APPROVED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                              <span>✓ APPROVED</span>
                            </span>
                          )}
                          {adj.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider">
                              <span>✕ REJECTED</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 font-medium max-w-xs leading-relaxed">
                          {adj.reason}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700">{adj.requestedBy}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => setViewingAdjustment(adj)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                        No expense adjustments found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: ADD EXPENSE --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">+ Add Expense Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Branch</label>
                <CustomSelect
                  value={newExpense.branch}
                  onChange={(val) => setNewExpense({ ...newExpense, branch: val })}
                  options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                  <CustomSelect
                    value={newExpense.category}
                    onChange={(val) => setNewExpense({ ...newExpense, category: val })}
                    options={['Ice & Packaging', 'Transport & Logistics', 'Utilities', 'Maintenance', 'Staff Welfare']}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Payment Account</label>
                  <CustomSelect
                    value={newExpense.paymentAccount}
                    onChange={(val) => setNewExpense({ ...newExpense, paymentAccount: val })}
                    options={['Petty Cash', 'Main Cash Drawer', 'HDFC Current A/C']}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1800"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Enter expense details..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: VIEW EXPENSE DETAILS --- */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Expense Voucher {viewingExpense.expenseCode}</h3>
                <p className="text-[11px] text-gray-500">{viewingExpense.branch} • {viewingExpense.formattedDate}</p>
              </div>
              <button onClick={() => setViewingExpense(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-rose-50/80 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-700 font-semibold">Total Amount Deducted</p>
                  <p className="text-xl font-extrabold text-rose-900 tabular-nums font-mono">
                    - ₹{viewingExpense.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-rose-100 text-rose-800">
                  {viewingExpense.category}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Payment Account:</span>
                  <span className="font-bold text-gray-900">{viewingExpense.paymentAccount}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Description:</span>
                  <span className="font-semibold text-gray-900">{viewingExpense.description}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Created By:</span>
                  <span className="font-bold text-gray-900">{viewingExpense.createdBy}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: REQUEST ADJUSTMENT --- */}
      {showRequestAdjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">+ Request Expense Adjustment</h3>
              <button onClick={() => setShowRequestAdjModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestAdjustment} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Expense ID</label>
                <CustomSelect
                  value={newAdjustment.expenseCode}
                  onChange={(val) => {
                    const match = expenses.find((e) => e.expenseCode === val || `EXPENSE-${e.id}` === val);
                    const oldAmt = match ? match.amount : 6400;
                    setNewAdjustment({ ...newAdjustment, expenseCode: val, oldAmount: oldAmt });
                  }}
                  options={['EXPENSE-1', 'EXPENSE-2', 'EXPENSE-3', 'EXPENSE-4']}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Old Amount (₹)</label>
                  <input
                    type="number"
                    value={newAdjustment.oldAmount}
                    disabled
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-100 text-gray-600 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">New Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 6800"
                    value={newAdjustment.newAmount}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, newAmount: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Reason for Adjustment</label>
                <textarea
                  rows="3"
                  placeholder="Explain why adjustment is required..."
                  value={newAdjustment.reason}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestAdjModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: VIEW ADJUSTMENT DETAILS --- */}
      {viewingAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Adjustment Request {viewingAdjustment.adjustmentCode}</h3>
                <p className="text-[11px] text-gray-500">Target: {viewingAdjustment.expenseCode}</p>
              </div>
              <button onClick={() => setViewingAdjustment(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">Old Amount</p>
                  <p className="text-base font-bold text-gray-800 tabular-nums font-mono">₹{viewingAdjustment.oldAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">New Revised Amount</p>
                  <p className="text-base font-bold text-blue-600 tabular-nums font-mono">₹{viewingAdjustment.newAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Current Status:</span>
                  <span className="font-bold text-gray-900">{viewingAdjustment.status}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Requested By:</span>
                  <span className="font-bold text-gray-900">{viewingAdjustment.requestedBy}</span>
                </div>
                <div className="space-y-1 pt-1 text-gray-700">
                  <p className="font-semibold text-gray-500">Adjustment Reason:</p>
                  <p className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 leading-relaxed font-medium">
                    {viewingAdjustment.reason}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              {viewingAdjustment.status === 'PENDING' ? (
                <div className="flex items-center gap-2 w-full justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateAdjStatus(viewingAdjustment.id, 'APPROVED')}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateAdjStatus(viewingAdjustment.id, 'REJECTED')}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={() => setViewingAdjustment(null)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="flex justify-end w-full">
                  <button
                    onClick={() => setViewingAdjustment(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
