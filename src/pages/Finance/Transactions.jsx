import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoEyeOutline,
  IoCalendarOutline,
  IoCopyOutline,
  IoCheckmarkOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Calendar } from '../../components/ui/calendar';
import axiosInstance from '../../config/axios';
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

const formatDisplayDate = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatNiceDateTime = (dateStr) => {
  if (!dateStr || dateStr === '-') return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

const Transactions = () => {
  // Transactions State
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState('All');
  const [accountFilter, setAccountFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [directionFilter, setDirectionFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Accounts List for Dropdowns
  const [accountsList, setAccountsList] = useState([]);

  // Modals State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const pageSize = 10;

  // New Transfer Form State
  const [newTransfer, setNewTransfer] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: '',
    reference: ''
  });
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [showTransferCalendar, setShowTransferCalendar] = useState(false);
  const transferCalendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (transferCalendarRef.current && !transferCalendarRef.current.contains(event.target)) {
        setShowTransferCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Accounts for Transfer Dropdowns
  const loadAccounts = async () => {
    try {
      const data = await accountService.fetchAccounts();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setAccountsList(list);
      if (list.length > 0) {
        setNewTransfer((prev) => ({
          ...prev,
          from_account: prev.from_account || String(list[0].id),
          to_account: prev.to_account || (list[1] ? String(list[1].id) : String(list[0].id))
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch accounts list:', err);
    }
  };

  // Fetch Transactions from API
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/transactions/');
      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      if (rawData && rawData.length > 0) {
        const mapped = rawData.map((item) => ({
          id: item.id,
          txCode: `#${item.id}`,
          date: item.transaction_date || (item.created_at ? item.created_at.split('T')[0] : '-'),
          rawDate: item.transaction_date || item.created_at || '',
          type: (item.transaction_type || '').replace(/_/g, ' '),
          rawType: item.transaction_type || '',
          account: item.account_name || (item.account ? `Account #${item.account}` : '-'),
          accountId: item.account,
          accountName: item.account_name || '',
          direction: item.direction || 'IN',
          amount: parseFloat(item.amount) || 0,
          rawAmount: item.amount,
          reference: item.reference && item.reference !== 'string' ? item.reference : (item.reference || '-'),
          description: item.description && item.description !== 'string' ? item.description : (item.description || '-'),
          createdBy: item.created_by_name || (item.created_by ? `User #${item.created_by}` : '-'),
          createdById: item.created_by,
          createdByName: item.created_by_name || '',
          branch: item.branch_name || (item.branch ? `Branch #${item.branch}` : '-'),
          branchId: item.branch,
          branchName: item.branch_name || '',
          transferGroupId: item.transfer_group_id || '',
          createdAt: item.created_at || ''
        }));
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions API:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadAccounts();
  }, []);

  // Dynamic filter options
  const availableBranches = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.branch && t.branch !== '-') set.add(t.branch);
    });
    return ['All', ...Array.from(set)];
  }, [transactions]);

  const availableAccounts = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => {
      if (t.account && t.account !== '-') set.add(t.account);
    });
    return ['All', ...Array.from(set)];
  }, [transactions]);

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
  const emptyRowsCount = Math.max(0, pageSize - currentTransactions.length);

  // Handle Submit New Money Transfer via API
  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    if (!newTransfer.from_account) {
      toast.error('Please select source account');
      return;
    }
    if (!newTransfer.to_account) {
      toast.error('Please select destination account');
      return;
    }
    if (String(newTransfer.from_account) === String(newTransfer.to_account)) {
      toast.error('From Account and To Account must be different');
      return;
    }
    const amt = parseFloat(newTransfer.amount) || 0;
    if (amt <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }

    const payload = {
      from_account: parseInt(newTransfer.from_account, 10),
      to_account: parseInt(newTransfer.to_account, 10),
      amount: String(newTransfer.amount),
      transaction_date: newTransfer.transaction_date || new Date().toISOString().split('T')[0],
      description: newTransfer.description || '',
      reference: newTransfer.reference || ''
    };

    setSubmittingTransfer(true);
    const loadingToast = toast.loading('Executing fund transfer...');
    try {
      const res = await accountService.transferFunds(payload);
      toast.success(res?.message || 'Transfer completed successfully!', { id: loadingToast });
      setShowTransferModal(false);
      setNewTransfer({
        from_account: accountsList[0] ? String(accountsList[0].id) : '',
        to_account: accountsList[1] ? String(accountsList[1].id) : '',
        amount: '',
        transaction_date: new Date().toISOString().split('T')[0],
        description: '',
        reference: ''
      });
      await loadTransactions();
    } catch (err) {
      console.error('Transfer failed:', err);
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.userMessage || 'Failed to execute transfer';
      toast.error(msg, { id: loadingToast });
    } finally {
      setSubmittingTransfer(false);
    }
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-400">Finance</span>
            <span className="text-xs text-gray-300">&gt;</span>
            <span className="text-xs font-semibold text-blue-600">Financial Transactions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Financial Transactions
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Immutable Financial Ledger — record and monitor all account transactions.
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <IoAddOutline size={16} />
          <span>+ Transfer Money</span>
        </button>
      </div>

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

      {/* Financial Transactions Table (Showing Important Data + View Action) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-center">Direction</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {loading ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={`skeleton-${i}`} className="animate-pulse h-[54px]">
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                          <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                          <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredTransactions.length > 0 ? (
                      <>
                        {currentTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                            {/* Date */}
                            <td className="py-3.5 px-4 font-medium text-gray-700 whitespace-nowrap">
                              {formatDisplayDate(tx.date) || tx.date}
                            </td>

                            {/* Account & Branch */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <p className="font-semibold text-gray-900">{tx.account}</p>
                              <p className="text-[11px] text-gray-400 font-normal">{tx.branch}</p>
                            </td>

                            {/* Type Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border ${getTypeBadgeStyle(tx.type)}`}>
                                {tx.type}
                              </span>
                            </td>

                            {/* Direction */}
                            <td className="py-3.5 px-4 text-center font-bold whitespace-nowrap">
                              <span className={tx.direction === 'IN' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]' : 'text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[10px]'}>
                                {tx.direction}
                              </span>
                            </td>

                            {/* Amount */}
                            <td className="py-3.5 px-4 text-right font-extrabold tabular-nums whitespace-nowrap font-mono">
                              {tx.direction === 'IN' ? (
                                <span className="text-emerald-600">+ ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              ) : (
                                <span className="text-rose-600">- ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              )}
                            </td>

                            {/* Action / View Option */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setViewingTransaction(tx)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                                title="View All Transaction Details"
                              >
                                <IoEyeOutline size={15} />
                                <span>View</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                        {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className="h-[54px] border-b border-gray-100/40">
                            <td colSpan="6">&nbsp;</td>
                          </tr>
                        ))}
                      </>
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
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

      {/* --- MODAL 1: VIEW TRANSACTION DETAILS (SHOWS ALL DETAILS) --- */}
      {viewingTransaction && (
        <Modal
          isOpen={Boolean(viewingTransaction)}
          onClose={() => setViewingTransaction(null)}
          title={`Transaction Details (${viewingTransaction.txCode || `#${viewingTransaction.id}`})`}
        >
          <div className="space-y-4 font-sans text-xs">
            {/* Amount & Status Banner */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">Transaction Amount</span>
                <div className="text-2xl font-extrabold font-mono mt-0.5">
                  {viewingTransaction.direction === 'IN' ? (
                    <span className="text-emerald-600">+ ₹{viewingTransaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  ) : (
                    <span className="text-rose-600">- ₹{viewingTransaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md border ${getTypeBadgeStyle(viewingTransaction.type)}`}>
                  {viewingTransaction.type}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                  viewingTransaction.direction === 'IN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {viewingTransaction.direction === 'IN' ? 'INCOMING (CREDIT)' : 'OUTGOING (DEBIT)'}
                </span>
              </div>
            </div>

            {/* Comprehensive Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
              {/* Transaction ID */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction ID</span>
                <span className="font-bold text-gray-900 font-mono text-sm">#{viewingTransaction.id}</span>
              </div>

              {/* Transaction Date */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction Date</span>
                <span className="font-bold text-gray-800 text-sm">
                  {formatDisplayDate(viewingTransaction.date) || viewingTransaction.date}
                </span>
                {viewingTransaction.rawDate && viewingTransaction.rawDate !== viewingTransaction.date && (
                  <span className="text-[10px] text-gray-400 block font-mono">({viewingTransaction.rawDate})</span>
                )}
              </div>

              {/* Financial Account */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Financial Account</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="font-bold text-gray-900 text-xs">
                    {viewingTransaction.accountName || viewingTransaction.account}
                  </span>
                  {viewingTransaction.accountId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                      ID: {viewingTransaction.accountId}
                    </span>
                  )}
                </div>
              </div>

              {/* Branch */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Branch</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="font-bold text-gray-900 text-xs">
                    {viewingTransaction.branchName || viewingTransaction.branch}
                  </span>
                  {viewingTransaction.branchId && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200 rounded font-semibold">
                      ID: {viewingTransaction.branchId}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Type */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction Type</span>
                <span className="font-bold text-gray-900 text-xs block">
                  {viewingTransaction.type}
                </span>
                {viewingTransaction.rawType && (
                  <span className="text-[10px] font-mono text-gray-500">
                    {viewingTransaction.rawType}
                  </span>
                )}
              </div>

              {/* Direction */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Direction</span>
                <span className={`font-extrabold text-xs inline-block mt-0.5 ${
                  viewingTransaction.direction === 'IN' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {viewingTransaction.direction === 'IN' ? 'IN (Incoming / Credit)' : 'OUT (Outgoing / Debit)'}
                </span>
              </div>

              {/* Created By */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Created By</span>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="font-semibold text-gray-800 text-xs">
                    {viewingTransaction.createdByName || viewingTransaction.createdBy}
                  </span>
                  {viewingTransaction.createdById && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                      User ID: {viewingTransaction.createdById}
                    </span>
                  )}
                </div>
              </div>

              {/* Created At Timestamp */}
              <div className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Created At</span>
                <span className="font-semibold text-gray-800 text-xs block mt-0.5">
                  {formatNiceDateTime(viewingTransaction.createdAt) || '-'}
                </span>
                {viewingTransaction.createdAt && (
                  <span className="text-[9px] text-gray-400 font-mono block truncate" title={viewingTransaction.createdAt}>
                    {viewingTransaction.createdAt}
                  </span>
                )}
              </div>
            </div>

            {/* Transfer Group ID Card */}
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-700 block">Transfer Group ID</span>
              <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-lg border border-blue-200">
                <span className="font-mono text-blue-900 text-xs break-all select-all font-semibold">
                  {viewingTransaction.transferGroupId || 'N/A'}
                </span>
                {viewingTransaction.transferGroupId && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(viewingTransaction.transferGroupId);
                      setCopiedKey('transferGroupId');
                      toast.success('Transfer Group ID copied!');
                      setTimeout(() => setCopiedKey(null), 2000);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer shrink-0"
                    title="Copy Transfer Group ID"
                  >
                    {copiedKey === 'transferGroupId' ? (
                      <IoCheckmarkOutline className="text-emerald-600 text-sm" />
                    ) : (
                      <IoCopyOutline className="text-sm" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Reference & Description Card */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Reference Code</span>
                <span className="font-bold text-blue-600 block break-words font-mono text-xs">
                  {viewingTransaction.reference || 'None'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200/70">
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Description / Notes</span>
                <span className="font-medium text-gray-700 block break-words leading-relaxed text-xs">
                  {viewingTransaction.description || 'No description provided'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingTransaction(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 3: INITIATE MONEY TRANSFER --- */}
      {showTransferModal && (
        <Modal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          title="+ Initiate Money Transfer"
          overflowVisible={true}
        >
          <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  From Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTransfer.from_account}
                  onChange={(e) => {
                    const fromVal = e.target.value;
                    const others = accountsList.filter((a) => String(a.id) !== String(fromVal));
                    const toVal = others.some((a) => String(a.id) === String(newTransfer.to_account))
                      ? newTransfer.to_account
                      : (others[0]?.id || '');
                    setNewTransfer({ ...newTransfer, from_account: fromVal, to_account: toVal });
                  }}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
                >
                  {accountsList.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.account_type || acc.type || 'ACCOUNT'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  To Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={newTransfer.to_account}
                  onChange={(e) => setNewTransfer({ ...newTransfer, to_account: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
                >
                  {accountsList
                    .filter((acc) => String(acc.id) !== String(newTransfer.from_account))
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.account_type || acc.type || 'ACCOUNT'})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 5000"
                  value={newTransfer.amount}
                  onChange={(e) => setNewTransfer({ ...newTransfer, amount: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="relative" ref={transferCalendarRef}>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Transfer Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTransferCalendar(!showTransferCalendar)}
                  className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium text-left cursor-pointer"
                >
                  <span>
                    {newTransfer.transaction_date
                      ? newTransfer.transaction_date.split('-').reverse().join('/')
                      : 'Select Date'}
                  </span>
                  <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
                </button>

                {showTransferCalendar && (
                  <div className="absolute right-0 bottom-full mb-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <Calendar
                      value={newTransfer.transaction_date || new Date().toISOString().split('T')[0]}
                      onChange={(newDate) => {
                        setNewTransfer({ ...newTransfer, transaction_date: newDate });
                        setShowTransferCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Reference Code
              </label>
              <input
                type="text"
                placeholder="e.g. TR-2026-001"
                value={newTransfer.reference}
                onChange={(e) => setNewTransfer({ ...newTransfer, reference: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Description / Notes
              </label>
              <textarea
                rows="2"
                placeholder="Reason for money transfer..."
                value={newTransfer.description}
                onChange={(e) => setNewTransfer({ ...newTransfer, description: e.target.value })}
                className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
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
                disabled={submittingTransfer}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                {submittingTransfer ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

export default Transactions;
