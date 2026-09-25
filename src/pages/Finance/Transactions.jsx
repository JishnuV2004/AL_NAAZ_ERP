import React, { useState, useEffect, useRef } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoArrowForwardOutline,
  IoSwapHorizontalOutline,
  IoInformationCircleOutline
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

// Initial Data for Financial Transactions Ledger
const INITIAL_TRANSACTIONS = [
  {
    id: 34,
    txCode: '#34',
    date: '19 Sep 2026',
    rawDate: '2026-09-19',
    type: 'REVENUE',
    account: 'Main Cash Drawer',
    direction: 'IN',
    amount: 21000,
    reference: 'DAILY-SALES-3',
    description: 'Cash revenue — Daily Sale #3',
    createdBy: 'System',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 33,
    txCode: '#33',
    date: '19 Sep 2026',
    rawDate: '2026-09-19',
    type: 'REVENUE',
    account: 'UPI Collections',
    direction: 'IN',
    amount: 11400,
    reference: 'DAILY-SALES-3',
    description: 'UPI revenue — Daily Sale #3',
    createdBy: 'System',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 32,
    txCode: '#32',
    date: '19 Sep 2026',
    rawDate: '2026-09-19',
    type: 'REVENUE',
    account: 'Food Delivery Receivable',
    direction: 'IN',
    amount: 4600,
    reference: 'DAILY-SALES-3',
    description: 'Food delivery revenue — Zomato',
    createdBy: 'System',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 31,
    txCode: '#31',
    date: '20 Sep 2026',
    rawDate: '2026-09-20',
    type: 'EXPENSE',
    account: 'Petty Cash',
    direction: 'OUT',
    amount: 1800,
    reference: 'EXPENSE-4',
    description: 'Ice blocks — evening batch',
    createdBy: 'Sana Iqbal',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 30,
    txCode: '#30',
    date: '15 Sep 2026',
    rawDate: '2026-09-15',
    type: 'EXPENSE',
    account: 'HDFC Current A/C',
    direction: 'OUT',
    amount: 6400,
    reference: 'EXPENSE-2',
    description: 'Electricity bill — Aug cycle',
    createdBy: 'Farhan Rasheed',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 29,
    txCode: '#29',
    date: '12 Sep 2026',
    rawDate: '2026-09-12',
    type: 'EXPENSE',
    account: 'Main Cash Drawer',
    direction: 'OUT',
    amount: 950,
    reference: 'EXPENSE-1',
    description: 'Weighing scale repair',
    createdBy: 'Rahim K.',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 28,
    txCode: '#28',
    date: '13 Sep 2026',
    rawDate: '2026-09-13',
    type: 'ADJUSTMENT',
    account: 'Main Cash Drawer',
    direction: 'OUT',
    amount: 200,
    reference: 'EXPENSE-1-ADJUSTMENT-2',
    description: 'Adjustment — added spare part',
    createdBy: 'System',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 27,
    txCode: '#27',
    date: '11 Sep 2026',
    rawDate: '2026-09-11',
    type: 'TRANSFER OUT',
    account: 'Petty Cash',
    direction: 'OUT',
    amount: 5000,
    reference: 'TRANSFER-GRP-9',
    description: 'Transfer to HDFC Current A/C',
    createdBy: 'Farhan Rasheed',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 26,
    txCode: '#26',
    date: '11 Sep 2026',
    rawDate: '2026-09-11',
    type: 'TRANSFER IN',
    account: 'HDFC Current A/C',
    direction: 'IN',
    amount: 5000,
    reference: 'TRANSFER-GRP-9',
    description: 'Transfer from Petty Cash',
    createdBy: 'Farhan Rasheed',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 25,
    txCode: '#25',
    date: '08 Sep 2026',
    rawDate: '2026-09-08',
    type: 'SUPPLIER PAYMENT',
    account: 'HDFC Current A/C',
    direction: 'OUT',
    amount: 4000,
    reference: 'SUPPLIER-PAYMENT-7',
    description: 'Payment to ABC Traders',
    createdBy: 'Farhan Rasheed',
    branch: 'Kochi — Main Mandi'
  },
  {
    id: 1,
    txCode: '#1',
    date: '01 Jan 2026',
    rawDate: '2026-01-01',
    type: 'OPENING BALANCE',
    account: 'HDFC Current A/C',
    direction: 'IN',
    amount: 200000,
    reference: 'OPENING-4',
    description: 'Opening balance',
    createdBy: 'Farhan Rasheed',
    branch: 'Kochi — Main Mandi'
  }
];

// Initial Data for Transfers
const INITIAL_TRANSFERS = [
  {
    id: 9,
    transferGroup: 'TRANSFER-GRP-9',
    date: '11 Sep 2026',
    fromAccount: 'Petty Cash',
    toAccount: 'HDFC Current A/C',
    amount: 5000,
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 8,
    transferGroup: 'TRANSFER-GRP-8',
    date: '05 Sep 2026',
    fromAccount: 'Main Cash Drawer',
    toAccount: 'Petty Cash',
    amount: 3500,
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 7,
    transferGroup: 'TRANSFER-GRP-7',
    date: '28 Aug 2026',
    fromAccount: 'Main Cash Drawer',
    toAccount: 'HDFC Current A/C',
    amount: 12000,
    createdBy: 'Rahim K.'
  }
];

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'transfers'

  // Transactions Tab Filter State
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [branchFilter, setBranchFilter] = useState('Kochi — Main Mandi');
  const [accountFilter, setAccountFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');

  // Transfers Tab State
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    fromAccount: 'Petty Cash',
    toAccount: 'HDFC Current A/C',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Filtered Financial Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (branchFilter && tx.branch !== branchFilter) return false;
    if (accountFilter !== 'All' && tx.account !== accountFilter) return false;
    if (typeFilter !== 'All' && tx.type !== typeFilter) return false;
    if (directionFilter !== 'All' && tx.direction !== directionFilter) return false;
    return true;
  });

  // Handle Submit New Money Transfer
  const handleCreateTransfer = (e) => {
    e.preventDefault();
    const amt = parseFloat(newTransfer.amount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }

    if (newTransfer.fromAccount === newTransfer.toAccount) {
      toast.error('From and To accounts must be different');
      return;
    }

    const nextGrpId = transfers.length > 0 ? Math.max(...transfers.map((t) => t.id)) + 1 : 1;
    const grpCode = `TRANSFER-GRP-${nextGrpId}`;
    const formattedDateStr = new Date(newTransfer.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const transferRecord = {
      id: nextGrpId,
      transferGroup: grpCode,
      date: formattedDateStr,
      fromAccount: newTransfer.fromAccount,
      toAccount: newTransfer.toAccount,
      amount: amt,
      createdBy: 'Admin User'
    };

    // Create corresponding TRANSFER OUT & TRANSFER IN ledger transactions
    const nextTxId = Math.max(...transactions.map((t) => t.id)) + 1;
    const txOut = {
      id: nextTxId + 1,
      txCode: `#${nextTxId + 1}`,
      date: formattedDateStr,
      rawDate: newTransfer.date,
      type: 'TRANSFER OUT',
      account: newTransfer.fromAccount,
      direction: 'OUT',
      amount: amt,
      reference: grpCode,
      description: `Transfer to ${newTransfer.toAccount}`,
      createdBy: 'Admin User',
      branch: branchFilter
    };

    const txIn = {
      id: nextTxId,
      txCode: `#${nextTxId}`,
      date: formattedDateStr,
      rawDate: newTransfer.date,
      type: 'TRANSFER IN',
      account: newTransfer.toAccount,
      direction: 'IN',
      amount: amt,
      reference: grpCode,
      description: `Transfer from ${newTransfer.fromAccount}`,
      createdBy: 'Admin User',
      branch: branchFilter
    };

    setTransfers([transferRecord, ...transfers]);
    setTransactions([txOut, txIn, ...transactions]);
    setShowTransferModal(false);
    toast.success(`Transfer ${grpCode} of ₹${amt.toLocaleString('en-IN')} completed successfully!`);

    setNewTransfer({
      fromAccount: 'Petty Cash',
      toAccount: 'HDFC Current A/C',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  // Helper Badge Color Resolver
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'REVENUE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'EXPENSE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ADJUSTMENT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TRANSFER IN':
      case 'TRANSFER OUT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SUPPLIER PAYMENT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'OPENING BALANCE':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-5 font-sans w-full pb-10">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {activeTab === 'transactions' ? 'Financial Transactions' : 'Transfers'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'transactions'
              ? 'Immutable Financial Ledger — every movement across every account, read-only.'
              : 'History reconstructed from TRANSFER_IN / TRANSFER_OUT transactions sharing a transfer group.'}
          </p>
        </div>

        {activeTab === 'transfers' && (
          <button
            onClick={() => setShowTransferModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <IoAddOutline size={16} />
            <span>+ Transfer Money</span>
          </button>
        )}
      </div>

      {/* Main Outer Container with Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Underlined Tab Switcher */}
        <div className="flex px-6 border-b border-gray-200 bg-white overflow-x-auto">
          {[
            { id: 'transactions', label: 'Financial Transactions' },
            { id: 'transfers', label: 'Transfers' }
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

        {/* --- TAB 1: FINANCIAL TRANSACTIONS VIEW --- */}
        {activeTab === 'transactions' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Filter Bar Box */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-4xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                  <CustomSelect
                    value={branchFilter}
                    onChange={setBranchFilter}
                    options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account</label>
                  <CustomSelect
                    value={accountFilter}
                    onChange={setAccountFilter}
                    options={[
                      'All',
                      'Petty Cash',
                      'Main Cash Drawer',
                      'HDFC Current A/C',
                      'UPI Collections',
                      'Food Delivery Receivable'
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Transaction Type</label>
                  <CustomSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      'All',
                      'REVENUE',
                      'EXPENSE',
                      'ADJUSTMENT',
                      'TRANSFER IN',
                      'TRANSFER OUT',
                      'SUPPLIER PAYMENT',
                      'OPENING BALANCE'
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Direction</label>
                  <CustomSelect
                    value={directionFilter}
                    onChange={setDirectionFilter}
                    options={['All', 'IN', 'OUT']}
                  />
                </div>
              </div>
            </div>

            {/* Financial Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[1050px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Transaction ID</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Account</th>
                      <th className="py-3.5 px-4">Direction</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Date */}
                          <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                            {tx.date}
                          </td>

                          {/* Transaction ID */}
                          <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                            {tx.txCode}
                          </td>

                          {/* Type Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border ${getTypeBadgeStyle(tx.type)}`}>
                              {tx.type}
                            </span>
                          </td>

                          {/* Account */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800 whitespace-nowrap">
                            {tx.account}
                          </td>

                          {/* Direction */}
                          <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                            {tx.direction}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-extrabold tabular-nums whitespace-nowrap">
                            {tx.direction === 'IN' ? (
                              <span className="text-emerald-600">+ ₹{tx.amount.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-rose-600">- ₹{tx.amount.toLocaleString('en-IN')}</span>
                            )}
                          </td>

                          {/* Reference Link */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-blue-600 hover:underline cursor-pointer">
                              {tx.reference}
                            </span>
                          </td>

                          {/* Description */}
                          <td className="py-3.5 px-4 font-medium text-gray-600 max-w-xs leading-relaxed">
                            {tx.description}
                          </td>

                          {/* Created By */}
                          <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                            {tx.createdBy}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                          No transactions found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: TRANSFERS VIEW --- */}
        {activeTab === 'transfers' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Transfers Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Transfer Group</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">From</th>
                      <th className="py-3.5 px-4">To</th>
                      <th className="py-3.5 px-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {transfers.length > 0 ? (
                      transfers.map((tr) => (
                        <tr key={tr.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Transfer Group Link */}
                          <td className="py-3.5 px-4 font-bold text-blue-600 hover:underline cursor-pointer whitespace-nowrap">
                            {tr.transferGroup}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 font-medium text-gray-800 whitespace-nowrap">
                            {tr.date}
                          </td>

                          {/* From Account */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800 whitespace-nowrap">
                            {tr.fromAccount}
                          </td>

                          {/* To Account */}
                          <td className="py-3.5 px-4 font-semibold text-gray-800 whitespace-nowrap">
                            {tr.toAccount}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums whitespace-nowrap">
                            ₹{tr.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">
                          No transfer records found.
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

      {/* Transfer Money Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Initiate Money Transfer</h3>
              <button onClick={() => setShowTransferModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">From Account</label>
                <CustomSelect
                  value={newTransfer.fromAccount}
                  onChange={(val) => setNewTransfer({ ...newTransfer, fromAccount: val })}
                  options={['Petty Cash', 'Main Cash Drawer', 'HDFC Current A/C', 'UPI Collections']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">To Account</label>
                <CustomSelect
                  value={newTransfer.toAccount}
                  onChange={(val) => setNewTransfer({ ...newTransfer, toAccount: val })}
                  options={['HDFC Current A/C', 'Petty Cash', 'Main Cash Drawer', 'UPI Collections']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={newTransfer.amount}
                  onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Transfer Date</label>
                <input
                  type="date"
                  value={newTransfer.date}
                  onChange={(e) => setNewTransfer({ ...newTransfer, date: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  placeholder="Reason for money transfer..."
                  value={newTransfer.description}
                  onChange={(e) => setNewTransfer({ ...newTransfer, description: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Transactions;
