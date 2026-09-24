import React, { useState } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoCheckmarkCircleOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

// Custom Dropdown Select
const CustomSelect = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`relative ${className}`}>
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

// Initial Data for Expenses Tab
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

// Initial Data for Expense Adjustments Tab
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
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'adjustments'

  // --- Expenses Tab State ---
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

  // --- Expense Adjustments Tab State ---
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

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (branchFilter && e.branch !== branchFilter) return false;
    if (categoryFilter !== 'All' && e.category !== categoryFilter) return false;
    if (accountFilter !== 'All' && e.paymentAccount !== accountFilter) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });

  // Filtered Adjustments
  const filteredAdjustments = adjustments.filter((a) => {
    if (adjStatusFilter !== 'All' && a.status !== adjStatusFilter) return false;
    if (adjExpenseFilter !== 'All' && a.expenseCode !== adjExpenseFilter) return false;
    return true;
  });

  // Add Expense Handler
  const handleAddExpense = (e) => {
    e.preventDefault();
    const amt = parseFloat(newExpense.amount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid amount');
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
      description: newExpense.description || 'General expense entry',
      createdBy: 'Admin User'
    };

    setExpenses([record, ...expenses]);
    setShowAddModal(false);
    toast.success(`Expense #${newId} added successfully!`);
    setNewExpense({
      branch: 'Kochi — Main Mandi',
      category: 'Ice & Packaging',
      paymentAccount: 'Petty Cash',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  // Request Adjustment Handler
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

  // Approve / Reject Adjustment Handler
  const handleUpdateAdjStatus = (id, newStatus) => {
    setAdjustments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (viewingAdjustment && viewingAdjustment.id === id) {
      setViewingAdjustment({ ...viewingAdjustment, status: newStatus });
    }
    toast.success(`Adjustment #${id} marked as ${newStatus}`);
  };

  return (
    <div className="space-y-5 font-sans w-full pb-10">
      
      {/* Outer Card Wrapper with Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 1. Tab Navigation Bar (Underlined Active Tab Style) */}
        <div className="flex px-6 border-b border-gray-200 bg-white overflow-x-auto">
          {[
            { id: 'expenses', label: 'Expenses' },
            { id: 'adjustments', label: 'Expense Adjustments' }
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

        {/* --- TAB 1: EXPENSES VIEW --- */}
        {activeTab === 'expenses' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expenses</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Every expense reduces a financial account and creates an immutable EXPENSE transaction.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <IoAddOutline size={16} />
                <span>+ Add Expense</span>
              </button>
            </div>

            {/* Filter Bar Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 max-w-5xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                  <CustomSelect
                    value={branchFilter}
                    onChange={setBranchFilter}
                    options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <CustomSelect
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={['All', 'Ice & Packaging', 'Transport & Logistics', 'Utilities', 'Maintenance', 'Staff Welfare']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Account</label>
                  <CustomSelect
                    value={accountFilter}
                    onChange={setAccountFilter}
                    options={['All', 'Petty Cash', 'Main Cash Drawer', 'HDFC Current A/C']}
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
              </div>
            </div>

            {/* Main Expenses Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
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
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {filteredExpenses.length > 0 ? (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                          {/* Expense ID */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">{exp.expenseCode}</td>

                          {/* Date */}
                          <td className="py-3.5 px-4 font-medium text-gray-800">{exp.formattedDate}</td>

                          {/* Branch */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{exp.branch}</td>

                          {/* Category */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800">{exp.category}</td>

                          {/* Payment Account */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{exp.paymentAccount}</td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-extrabold text-rose-600 tabular-nums">
                            - ₹{exp.amount.toLocaleString('en-IN')}
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-4 font-medium text-gray-600">{exp.description}</td>

                          {/* Created By */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{exp.createdBy}</td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => setViewingExpense(exp)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                              title="View Details"
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

            {/* Footer API Notice */}
            <div className="inline-block px-3 py-1.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-lg border border-gray-200/60">
              ExpenseViewSet currently exposes CRUD only — category / account / date filters shown here are frontend-only until the backend adds query parameters.
            </div>
          </div>
        )}

        {/* --- TAB 2: EXPENSE ADJUSTMENTS VIEW --- */}
        {activeTab === 'adjustments' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Expense Adjustments</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Approval workflow for correcting posted expenses without altering the original record.
                </p>
              </div>

              <button
                onClick={() => setShowRequestAdjModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <IoAddOutline size={16} />
                <span>+ Request Adjustment</span>
              </button>
            </div>

            {/* Filter Bar Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <CustomSelect
                    value={adjStatusFilter}
                    onChange={setAdjStatusFilter}
                    options={['All', 'PENDING', 'APPROVED', 'REJECTED']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Expense</label>
                  <CustomSelect
                    value={adjExpenseFilter}
                    onChange={setAdjExpenseFilter}
                    options={['All', 'EXPENSE-1', 'EXPENSE-2', 'EXPENSE-3', 'EXPENSE-4']}
                  />
                </div>
              </div>
            </div>

            {/* Adjustments Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
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
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {filteredAdjustments.length > 0 ? (
                      filteredAdjustments.map((adj) => (
                        <tr key={adj.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Adjustment ID */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">{adj.adjustmentCode}</td>

                          {/* Expense ID Link */}
                          <td className="py-3.5 px-4 font-bold text-blue-600">{adj.expenseCode}</td>

                          {/* Old Amount */}
                          <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums">
                            ₹{adj.oldAmount.toLocaleString('en-IN')}
                          </td>

                          {/* New Amount */}
                          <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums">
                            ₹{adj.newAmount.toLocaleString('en-IN')}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {adj.status === 'PENDING' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                <span>PENDING</span>
                              </span>
                            )}
                            {adj.status === 'APPROVED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span>✓ APPROVED</span>
                              </span>
                            )}
                            {adj.status === 'REJECTED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                <span>✕ REJECTED</span>
                              </span>
                            )}
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-4 text-gray-600 font-medium max-w-xs leading-relaxed">
                            {adj.reason}
                          </td>

                          {/* Requested By */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{adj.requestedBy}</td>

                          {/* Actions */}
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
                          No expense adjustments found.
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

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Add Expense Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
                <CustomSelect
                  value={newExpense.branch}
                  onChange={(val) => setNewExpense({ ...newExpense, branch: val })}
                  options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <CustomSelect
                    value={newExpense.category}
                    onChange={(val) => setNewExpense({ ...newExpense, category: val })}
                    options={['Ice & Packaging', 'Transport & Logistics', 'Utilities', 'Maintenance', 'Staff Welfare']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Account</label>
                  <CustomSelect
                    value={newExpense.paymentAccount}
                    onChange={(val) => setNewExpense({ ...newExpense, paymentAccount: val })}
                    options={['Petty Cash', 'Main Cash Drawer', 'HDFC Current A/C']}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1800"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Enter expense details..."
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Details Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Expense Details {viewingExpense.expenseCode}</h3>
                <p className="text-xs text-gray-500">{viewingExpense.branch} • {viewingExpense.formattedDate}</p>
              </div>
              <button onClick={() => setViewingExpense(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-700 font-semibold">Total Amount Deducted</p>
                  <p className="text-xl font-extrabold text-rose-900 tabular-nums">
                    - ₹{viewingExpense.amount.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-rose-100 text-rose-800">
                  {viewingExpense.category}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Payment Account:</span>
                  <span className="font-bold">{viewingExpense.paymentAccount}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Description:</span>
                  <span className="font-semibold text-gray-900">{viewingExpense.description}</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-700">
                  <span>Created By:</span>
                  <span className="font-bold">{viewingExpense.createdBy}</span>
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

      {/* Request Adjustment Modal */}
      {showRequestAdjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Request Expense Adjustment</h3>
              <button onClick={() => setShowRequestAdjModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestAdjustment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Expense ID</label>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Old Amount (₹)</label>
                  <input
                    type="number"
                    value={newAdjustment.oldAmount}
                    disabled
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-100 text-gray-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">New Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 6800"
                    value={newAdjustment.newAmount}
                    onChange={(e) => setNewAdjustment({ ...newAdjustment, newAmount: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Adjustment</label>
                <textarea
                  rows="3"
                  placeholder="Explain why adjustment is required..."
                  value={newAdjustment.reason}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Adjustment Details Modal with Approve / Reject Actions */}
      {viewingAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Adjustment Request {viewingAdjustment.adjustmentCode}</h3>
                <p className="text-xs text-gray-500">For {viewingAdjustment.expenseCode}</p>
              </div>
              <button onClick={() => setViewingAdjustment(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">Old Amount</p>
                  <p className="text-base font-bold text-gray-800 tabular-nums">₹{viewingAdjustment.oldAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold">New Revised Amount</p>
                  <p className="text-base font-bold text-blue-600 tabular-nums">₹{viewingAdjustment.newAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1 border-b border-gray-50 text-gray-700">
                  <span>Current Status:</span>
                  <span className="font-bold">{viewingAdjustment.status}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 text-gray-700">
                  <span>Requested By:</span>
                  <span className="font-bold">{viewingAdjustment.requestedBy}</span>
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
