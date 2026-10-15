import React, { useState, useEffect, useRef } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoArrowForwardOutline,
  IoSwapHorizontalOutline,
  IoInformationCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import axiosInstance from '../../config/axios';

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

// Initial Fallback Data for Financial Transactions Ledger
const INITIAL_TRANSACTIONS = [
  {
    id: 64,
    txCode: '#64',
    date: '2026-10-09',
    rawDate: '2026-10-09',
    type: 'SUPPLIER PAYMENT',
    account: 'Petty Cash',
    direction: 'OUT',
    amount: 200,
    reference: 'PURCHASE-26-BALANCE',
    description: 'Supplier payment - ABC traders',
    createdBy: 'admin',
    branch: 'Al Naaz Kayamkulam'
  },
  {
    id: 63,
    txCode: '#63',
    date: '2026-10-09',
    rawDate: '2026-10-09',
    type: 'SUPPLIER PAYMENT',
    account: 'Petty Cash',
    direction: 'OUT',
    amount: 100,
    reference: 'PURCHASE-26-INITIAL',
    description: 'Supplier payment - ABC traders',
    createdBy: 'admin',
    branch: 'Al Naaz Kayamkulam'
  },
  {
    id: 62,
    txCode: '#62',
    date: '2026-10-09',
    rawDate: '2026-10-09',
    type: 'SUPPLIER PAYMENT',
    account: 'Petty Cash',
    direction: 'OUT',
    amount: 200,
    reference: 'testing',
    description: 'Supplier payment - RRR',
    createdBy: 'admin',
    branch: 'Al Naaz Kayamkulam'
  },
  {
    id: 61,
    txCode: '#61',
    date: '2026-10-07',
    rawDate: '2026-10-07',
    type: 'REVENUE',
    account: 'Cash',
    direction: 'IN',
    amount: 300,
    reference: 'DAILY-SALES-5',
    description: 'Daily sales - CASH',
    createdBy: 'admin',
    branch: 'Al Naaz Kayamkulam'
  }
];

// Initial Fallback Data for Transfers
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
  }
];

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'transfers'

  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('All');
  const [accountFilter, setAccountFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Transfers Tab State
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [transfersPage, setTransfersPage] = useState(1);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const pageSize = 10;

  // Fetch Transactions from API
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/transactions/');
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      
      if (rawData && rawData.length > 0) {
        const mapped = rawData.map((item) => ({
          id: item.id,
          txCode: `#${item.id}`,
          date: item.transaction_date || (item.created_at ? item.created_at.split('T')[0] : '-'),
          rawDate: item.transaction_date || item.created_at || '',
          type: (item.transaction_type || '').replace(/_/g, ' '),
          rawType: item.transaction_type,
          account: item.account_name || (item.account ? `Account #${item.account}` : '-'),
          accountId: item.account,
          direction: item.direction || 'IN',
          amount: parseFloat(item.amount) || 0,
          reference: item.reference || '-',
          description: item.description || '-',
          createdBy: item.created_by_name || (item.created_by ? `User #${item.created_by}` : '-'),
          branch: item.branch_name || (item.branch ? `Branch #${item.branch}` : '-'),
          transferGroupId: item.transfer_group_id
        }));
        setTransactions(mapped);
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } catch (error) {
      console.error('Failed to fetch transactions API:', error);
      setTransactions(INITIAL_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    fromAccount: 'Petty Cash',
    toAccount: 'HDFC Current A/C',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Unique filter lists
  const availableBranches = [
    'All',
    ...Array.from(new Set(transactions.map((t) => t.branch).filter(Boolean)))
  ];
  const availableAccounts = [
    'All',
    ...Array.from(new Set(transactions.map((t) => t.account).filter(Boolean)))
  ];

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [branchFilter, accountFilter, typeFilter, directionFilter]);

  // Filtered Financial Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (branchFilter !== 'All' && tx.branch !== branchFilter) return false;
    if (accountFilter !== 'All' && tx.account !== accountFilter) return false;
    if (typeFilter !== 'All') {
      const formattedFilter = typeFilter.replace(/_/g, ' ').toUpperCase();
      const formattedTxType = (tx.type || '').toUpperCase();
      if (formattedTxType !== formattedFilter) return false;
    }
    if (directionFilter !== 'All' && tx.direction !== directionFilter) return false;
    return true;
  });

  // Pagination calculation for Transactions
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const indexOfLast = currentPage * pageSize;
  const indexOfFirst = (currentPage - 1) * pageSize;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const emptyRowsCount = pageSize - currentTransactions.length;

  // Pagination calculation for Transfers
  const totalTransfersPages = Math.max(1, Math.ceil(transfers.length / pageSize));
  const currentTransfersPage = Math.min(transfersPage, totalTransfersPages);
  const indexOfLastTransfer = currentTransfersPage * pageSize;
  const indexOfFirstTransfer = (currentTransfersPage - 1) * pageSize;
  const currentTransfers = transfers.slice(indexOfFirstTransfer, indexOfLastTransfer);
  const emptyTransfersRowsCount = pageSize - currentTransfers.length;

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

    const nextTxId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
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
      branch: branchFilter !== 'All' ? branchFilter : 'Main Branch'
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
      branch: branchFilter !== 'All' ? branchFilter : 'Main Branch'
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
    const formattedType = (type || '').toUpperCase().replace(/_/g, ' ');
    switch (formattedType) {
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
                    options={availableBranches}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account</label>
                  <CustomSelect
                    value={accountFilter}
                    onChange={setAccountFilter}
                    options={availableAccounts}
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
                <table className="w-full text-left border-collapse min-w-[1150px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Branch</th>
                      <th className="py-3.5 px-4">Account</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Direction</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4">Reference</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {loading ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={`skeleton-${i}`} className="animate-pulse h-[54px]">
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        </tr>
                      ))
                    ) : filteredTransactions.length > 0 ? (
                      <>
                        {currentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                            {/* Date */}
                            <td className="py-3.5 px-4 font-semibold text-gray-900 whitespace-nowrap">
                              {tx.date}
                            </td>

                            {/* Branch */}
                            <td className="py-3.5 px-4 font-semibold text-gray-800 whitespace-nowrap">
                              {tx.branch}
                            </td>

                            {/* Account */}
                            <td className="py-3.5 px-4 font-semibold text-gray-800 whitespace-nowrap">
                              {tx.account}
                            </td>

                            {/* Type Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 text-[11px] font-extrabold rounded-full border ${getTypeBadgeStyle(tx.type)}`}>
                                {tx.type}
                              </span>
                            </td>

                            {/* Direction */}
                            <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                              <span className={tx.direction === 'IN' ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]' : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[11px]'}>
                                {tx.direction}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="py-3.5 px-4 font-extrabold tabular-nums whitespace-nowrap">
                              {tx.direction === 'IN' ? (
                                <span className="text-emerald-600">+ ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              ) : (
                                <span className="text-rose-600">- ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              )}
                            </td>

                            {/* Reference Link */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="font-bold text-blue-600 hover:underline cursor-pointer">
                                {tx.reference}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="py-3.5 px-4 font-medium text-gray-600 max-w-xs leading-relaxed truncate">
                              {tx.description}
                            </td>

                            {/* Created By */}
                            <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                              {tx.createdBy}
                            </td>
                          </tr>
                        ))}
                        {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className="h-[54px] border-b border-gray-100/40">
                            <td colSpan="9">&nbsp;</td>
                          </tr>
                        ))}
                      </>
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

              {/* Transactions Pagination */}
              {!loading && filteredTransactions.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                  <div>
                    Showing <span className="font-bold text-gray-900">{indexOfFirst + 1}</span> to{' '}
                    <span className="font-bold text-gray-900">{Math.min(indexOfLast, filteredTransactions.length)}</span> of{' '}
                    <span className="font-bold text-gray-900">{filteredTransactions.length}</span> entries
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronBackOutline size={14} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setPage(pNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                            currentPage === pNum
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronForwardOutline size={14} />
                    </button>
                  </div>
                </div>
              )}
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
                      <>
                        {currentTransfers.map((tr) => (
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
                              ₹{tr.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        {emptyTransfersRowsCount > 0 && Array.from({ length: emptyTransfersRowsCount }).map((_, idx) => (
                          <tr key={`empty-transfer-${idx}`} className="h-[54px] border-b border-gray-100/40">
                            <td colSpan="5">&nbsp;</td>
                          </tr>
                        ))}
                      </>
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

              {/* Transfers Pagination */}
              {transfers.length > 0 && (
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                  <div>
                    Showing <span className="font-bold text-gray-900">{indexOfFirstTransfer + 1}</span> to{' '}
                    <span className="font-bold text-gray-900">{Math.min(indexOfLastTransfer, transfers.length)}</span> of{' '}
                    <span className="font-bold text-gray-900">{transfers.length}</span> entries
                  </div>
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={currentTransfersPage === 1}
                      onClick={() => setTransfersPage((prev) => Math.max(1, prev - 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronBackOutline size={14} />
                    </button>

                    {Array.from({ length: totalTransfersPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setTransfersPage(pNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                            currentTransfersPage === pNum
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentTransfersPage >= totalTransfersPages}
                      onClick={() => setTransfersPage((prev) => Math.min(totalTransfersPages, prev + 1))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <IoChevronForwardOutline size={14} />
                    </button>
                  </div>
                </div>
              )}
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
