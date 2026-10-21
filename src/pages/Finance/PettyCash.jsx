import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoPencilOutline,
  IoSwapHorizontalOutline,
  IoArrowForwardOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
  IoCloseOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Calendar } from '../../components/ui/calendar';
import { accountService } from '../../services/accountService';

// Custom Select Component matching FinancialAccounts.jsx
const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', className = '' }) => {
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
        className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className="truncate">{value || placeholder}</span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1.5 ${isOpen ? 'rotate-180' : ''}`} size={15} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                value === opt ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'
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
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${monthNamesShort[m]} ${d}, ${y}`;
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

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PettyCash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Account State
  const [account, setAccount] = useState(null);
  const [allAccounts, setAllAccounts] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const DETAIL_PAGE_SIZE = 10;
  const [detailTxnPage, setDetailTxnPage] = useState(1);

  // Modals
  const [viewingTxnDetail, setViewingTxnDetail] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    transaction_date: getTodayDateString(),
    description: '',
    reference: ''
  });
  const [showTransferCalendar, setShowTransferCalendar] = useState(false);
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const transferCalendarRef = useRef(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    branch: '',
    account_purpose: 'GENERAL',
    is_active: true
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (transferCalendarRef.current && !transferCalendarRef.current.contains(event.target)) {
        setShowTransferCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all accounts and branches in parallel
      const [accountsRes, branchesRes] = await Promise.allSettled([
        accountService.fetchAccounts(),
        accountService.fetchBranches()
      ]);

      const accList = accountsRes.status === 'fulfilled' && accountsRes.value
        ? (Array.isArray(accountsRes.value) ? accountsRes.value : (accountsRes.value.results || []))
        : [];
      setAllAccounts(accList);

      const brList = branchesRes.status === 'fulfilled' && branchesRes.value
        ? (Array.isArray(branchesRes.value) ? branchesRes.value : (branchesRes.value.results || []))
        : [];
      setBranchesList(brList);

      // 2. Identify target Petty Cash account
      let targetAccId = location.state?.accountId;
      let matchedAcc = null;

      if (targetAccId) {
        matchedAcc = accList.find((a) => String(a.id) === String(targetAccId));
      }
      if (!matchedAcc) {
        matchedAcc = accList.find(
          (a) => (a.account_type === 'PETTY_CASH' || a.type === 'PETTY_CASH' || (a.name || '').toLowerCase().includes('petty cash'))
        );
      }
      if (!matchedAcc && accList.length > 0) {
        matchedAcc = accList[0];
      }

      const accountId = matchedAcc ? matchedAcc.id : (targetAccId || 1);

      // 3. Fetch detailed account data, transactions, and live balance
      const [detailRes, txnsRes, balRes] = await Promise.allSettled([
        accountService.getAccountById(accountId),
        accountService.getAccountTransactions(accountId),
        accountService.getAccountBalance(accountId)
      ]);

      let accData = matchedAcc || { id: accountId, name: 'Petty Cash', account_type: 'PETTY_CASH' };
      if (detailRes.status === 'fulfilled' && detailRes.value) {
        accData = { ...accData, ...detailRes.value };
      }

      if (balRes.status === 'fulfilled' && balRes.value && (balRes.value.balance !== undefined && balRes.value.balance !== null)) {
        accData.current_balance = balRes.value.balance;
        accData.balance = balRes.value.balance;
      }

      setAccount(accData);

      // 4. Map transactions
      const rawTxns = txnsRes.status === 'fulfilled' && txnsRes.value
        ? (Array.isArray(txnsRes.value) ? txnsRes.value : (txnsRes.value.results || []))
        : [];

      const mappedTxns = rawTxns.map((tx) => ({
        rawId: tx.id,
        id: tx.id,
        branch: tx.branch,
        branch_name: tx.branch_name || accData.branch_name || '-',
        account: tx.account,
        account_name: tx.account_name || accData.name,
        transaction_type: tx.transaction_type || '-',
        direction: tx.direction || (tx.type === 'CREDIT' ? 'IN' : 'OUT'),
        amount: parseFloat(tx.amount || 0),
        transaction_date: tx.transaction_date || (tx.created_at ? tx.created_at.slice(0, 10) : '-'),
        description: tx.description || '-',
        reference: tx.reference || '-',
        transfer_group_id: tx.transfer_group_id || null,
        created_by: tx.created_by,
        created_by_name: tx.created_by_name || 'admin',
        created_at: tx.created_at || '-',
        date: tx.created_at
          ? `${tx.created_at.slice(0, 10)} ${tx.created_at.slice(11, 16)}`
          : (tx.transaction_date || '-'),
        type: tx.direction === 'IN' || tx.type === 'CREDIT' ? 'CREDIT' : 'DEBIT'
      }));

      setTransactions(mappedTxns);
    } catch (err) {
      console.warn('Failed to load Petty Cash account details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountData();
  }, [location.state?.accountId]);

  // Calculations
  const curBal = parseFloat(account?.current_balance ?? account?.balance ?? account?.opening_balance ?? 0);
  const openBal = parseFloat(account?.opening_balance ?? 0);
  const netMovement = curBal - openBal;

  const detailTotalPages = Math.max(1, Math.ceil(transactions.length / DETAIL_PAGE_SIZE));
  const detailIndexOfLast = detailTxnPage * DETAIL_PAGE_SIZE;
  const detailIndexOfFirst = detailIndexOfLast - DETAIL_PAGE_SIZE;
  const currentDetailTxns = transactions.slice(detailIndexOfFirst, detailIndexOfLast);

  // Transfer modal opening
  const handleOpenTransfer = () => {
    if (!account) return;
    const otherAccounts = allAccounts.filter((a) => String(a.id) !== String(account.id));
    const defaultToId = otherAccounts.length > 0 ? otherAccounts[0].id : '';
    setTransferData({
      from_account: account.id,
      to_account: defaultToId,
      amount: '',
      transaction_date: getTodayDateString(),
      description: '',
      reference: ''
    });
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (!transferData.from_account) {
      toast.error('Please select source account');
      return;
    }
    if (!transferData.to_account) {
      toast.error('Please select destination account');
      return;
    }
    if (String(transferData.from_account) === String(transferData.to_account)) {
      toast.error('From Account and To Account must be different');
      return;
    }
    const numAmount = parseFloat(transferData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }

    const payload = {
      from_account: parseInt(transferData.from_account, 10),
      to_account: parseInt(transferData.to_account, 10),
      amount: String(transferData.amount),
      transaction_date: transferData.transaction_date || getTodayDateString(),
      description: transferData.description || '',
      reference: transferData.reference || ''
    };

    setSubmittingTransfer(true);
    const loadingToast = toast.loading('Executing fund transfer...');
    try {
      const res = await accountService.transferFunds(payload);
      toast.success(res?.message || 'Transfer completed successfully.', { id: loadingToast });
      setShowTransferModal(false);
      await loadAccountData();
    } catch (err) {
      console.error('Transfer failed:', err);
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.userMessage || 'Failed to execute transfer';
      toast.error(msg, { id: loadingToast });
    } finally {
      setSubmittingTransfer(false);
    }
  };

  // Edit Account Handlers
  const handleStartEdit = () => {
    if (!account) return;
    setEditForm({
      name: account.name || '',
      branch: account.branch_name || account.branch || 'Al Naaz Kayamkulam',
      account_purpose: account.account_purpose || account.purpose || 'GENERAL',
      is_active: account.is_active !== false
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!account) return;
    if (!editForm.name.trim()) {
      toast.error('Please enter an account name');
      return;
    }

    const payload = {
      name: editForm.name.trim(),
      account_purpose: editForm.account_purpose,
      is_active: editForm.is_active
    };

    setSavingEdit(true);
    try {
      await accountService.updateAccount(account.id, payload);
      toast.success('Account updated successfully!');
      setShowEditModal(false);
      await loadAccountData();
    } catch (err) {
      console.error('Failed to update account:', err);
      const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to update account';
      toast.error(msg);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6 font-sans w-full pb-10 animate-in fade-in duration-150">
      {/* 1. Back Button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/finance/financialaccounts')}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-bold transition-colors cursor-pointer"
        >
          <IoArrowBackOutline size={18} />
          <span>Back to Financial Accounts</span>
        </button>
      </div>

      {/* 2. Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {account?.name || 'Petty Cash'}
            </h1>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {account?.account_type || account?.typeTag || 'PETTY_CASH'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{account?.is_active !== false && account?.status !== 'INACTIVE' ? 'ACTIVE' : 'INACTIVE'}</span>
            </span>
          </div>
          <p className="text-xs font-medium text-gray-500 mt-1">
            Branch: <span className="font-semibold text-gray-800">{account?.branch_name || account?.branch || 'Al Naaz Kayamkulam'}</span> · Purpose Tag: <span className="font-semibold text-gray-800">{account?.account_purpose || account?.purposeTag || 'GENERAL'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleStartEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <IoPencilOutline size={15} />
            <span>Edit Account</span>
          </button>
        </div>
      </div>

      {/* 3. Top 4 Key Metric Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5 animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-28"></div>
              <div className="h-7 bg-slate-200 rounded w-36"></div>
              <div className="h-3 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Balance */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500 font-sans">Current Available Balance</p>
            <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              ₹{curBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Reconciled balance</p>
          </div>

          {/* Opening Balance */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500 font-sans">Opening Balance</p>
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
              ₹{openBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Setup amount ({account?.opening_balance_date || '2026-09-01'})</p>
          </div>

          {/* Net Balance Movement */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500 font-sans">Net Movement</p>
            <p className={`text-2xl font-extrabold tabular-nums ${netMovement >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {netMovement >= 0 ? '+' : ''}₹{netMovement.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Since account creation</p>
          </div>

          {/* Account Classification */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500 font-sans">Created By</p>
            <p className="text-lg font-bold text-slate-800">
              {account?.created_by_name || 'admin'}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">{account?.created_at ? account.created_at.slice(0, 10) : (account?.opening_balance_date || '-')}</p>
          </div>
        </div>
      )}

      {/* 4. Recent Transactions & Account Management Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Ledger Transactions Table (Left side) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden min-h-[580px] flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900">Recent Account Transactions</h3>
              <span className="text-xs text-gray-500 font-medium">Real-time ledger audit log</span>
            </div>

            <div className="overflow-x-auto min-h-[480px]">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-3.5">Transaction Type</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-center">Type</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs bg-white">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-[48px]">
                        <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                        <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                        <td className="p-3.5 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto"></div></td>
                        <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                        <td className="p-3.5 text-center"><div className="h-4 bg-slate-200 rounded w-8 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : currentDetailTxns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  ) : (
                    currentDetailTxns.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors h-[48px]">
                        <td className="p-3.5 whitespace-nowrap font-bold text-gray-800">
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                            {txn.transaction_type || 'TRANSFER_IN'}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">{txn.date}</td>
                        <td className="p-3.5 font-medium text-slate-900 truncate max-w-xs">{txn.description}</td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              txn.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {txn.type}
                          </span>
                        </td>
                        <td
                          className={`p-3.5 text-right font-mono font-bold whitespace-nowrap ${
                            txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setViewingTxnDetail(txn)}
                            className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="View All Transaction Details"
                          >
                            <IoEyeOutline size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions Pagination Footer */}
          {transactions.length > 0 && (
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{detailIndexOfFirst + 1}</span> to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(detailIndexOfLast, transactions.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{transactions.length}</span> entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={detailTxnPage === 1}
                  onClick={() => setDetailTxnPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <IoChevronBackOutline size={14} />
                  <span>Previous</span>
                </button>
                {Array.from({ length: detailTotalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setDetailTxnPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        detailTxnPage === pNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled={detailTxnPage >= detailTotalPages}
                  onClick={() => setDetailTxnPage((p) => Math.min(detailTotalPages, p + 1))}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Next</span>
                  <IoChevronForwardOutline size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Compact Account Management Box (Right side) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-serif">
            Account Management
          </h2>

          <div className="space-y-2.5">
            {/* Transfer Funds */}
            <button
              type="button"
              onClick={handleOpenTransfer}
              className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-blue-600 font-bold">
                  <IoSwapHorizontalOutline size={18} />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Transfer Funds
                </span>
              </div>
              <IoArrowForwardOutline size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: TRANSFER FUNDS --- */}
      {showTransferModal && (
        <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Funds" overflowVisible={true}>
          <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* From Account */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  From Account <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={true}
                  value={transferData.from_account}
                  className="w-full px-3.5 py-2.5 border rounded-xl outline-none text-xs font-semibold bg-slate-100 text-slate-700 cursor-not-allowed border-slate-300"
                >
                  <option value={account?.id}>
                    {account?.name} ({account?.account_type || 'PETTY_CASH'})
                  </option>
                </select>
              </div>

              {/* To Account */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  To Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={transferData.to_account}
                  onChange={(e) => setTransferData({ ...transferData, to_account: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
                >
                  {allAccounts
                    .filter((acc) => String(acc.id) !== String(transferData.from_account))
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.account_type || acc.type || 'ACCOUNT'})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Transfer Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono font-bold"
                  placeholder="100"
                />
              </div>

              {/* Transaction Date */}
              <div className="relative" ref={transferCalendarRef}>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTransferCalendar(!showTransferCalendar)}
                  className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium text-left cursor-pointer"
                >
                  <span>
                    {transferData.transaction_date
                      ? transferData.transaction_date.split('-').reverse().join('/')
                      : 'Select Date'}
                  </span>
                  <IoCalendarOutline className="text-gray-400 text-sm shrink-0" />
                </button>

                {showTransferCalendar && (
                  <div className="absolute right-0 bottom-full mb-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <Calendar
                      value={transferData.transaction_date || getTodayDateString()}
                      onChange={(newDate) => {
                        setTransferData({ ...transferData, transaction_date: newDate });
                        setShowTransferCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Reference Code
              </label>
              <input
                type="text"
                placeholder="e.g. TR-2026-001"
                value={transferData.reference}
                onChange={(e) => setTransferData({ ...transferData, reference: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Optional transfer note..."
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold text-xs cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingTransfer}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs disabled:bg-blue-400"
              >
                {submittingTransfer ? 'Transferring...' : 'Execute Transfer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- MODAL 2: EDIT ACCOUNT --- */}
      {showEditModal && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Petty Cash Account">
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch</label>
              <input
                type="text"
                disabled
                value={editForm.branch}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none text-xs bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purpose Tag</label>
              <CustomSelect
                value={editForm.account_purpose}
                onChange={(val) => setEditForm({ ...editForm, account_purpose: val })}
                options={['GENERAL', 'CASH', 'UPI', 'CARD_RECEIVABLE', 'FOOD_DELIVERY_RECEIVABLE']}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Active Status</label>
              <CustomSelect
                value={editForm.is_active ? 'Yes' : 'No'}
                onChange={(val) => setEditForm({ ...editForm, is_active: val === 'Yes' })}
                options={['Yes', 'No']}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium text-xs cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs disabled:bg-blue-400"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- MODAL 3: VIEW TRANSACTION DETAILS --- */}
      {viewingTxnDetail && (
        <Modal
          isOpen={Boolean(viewingTxnDetail)}
          onClose={() => setViewingTxnDetail(null)}
          title={`Transaction Details (ID: #${viewingTxnDetail.rawId || viewingTxnDetail.id})`}
        >
          <div className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction ID</span>
                <span className="font-bold text-gray-900">#{viewingTxnDetail.rawId || viewingTxnDetail.id}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction Type</span>
                <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                  {(viewingTxnDetail.transaction_type || '-').replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Branch</span>
                <span className="font-semibold text-gray-800">{viewingTxnDetail.branch_name || viewingTxnDetail.branch || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Account</span>
                <span className="font-semibold text-gray-800">{viewingTxnDetail.account_name || viewingTxnDetail.account || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Direction</span>
                <span className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] ${
                  viewingTxnDetail.direction === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {viewingTxnDetail.direction || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Amount</span>
                <span className="font-extrabold text-gray-900 text-sm">
                  ₹{parseFloat(viewingTxnDetail.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transaction Date</span>
                <span className="font-semibold text-gray-800">{formatDisplayDate(viewingTxnDetail.transaction_date) || viewingTxnDetail.transaction_date || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Created At</span>
                <span className="font-semibold text-gray-800">{formatNiceDateTime(viewingTxnDetail.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Created By</span>
                <span className="font-semibold text-gray-800">{viewingTxnDetail.created_by_name || viewingTxnDetail.created_by || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Transfer Group ID</span>
                <span className="font-mono text-gray-800 text-[11px] truncate block">{viewingTxnDetail.transfer_group_id || 'N/A'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Reference</span>
                <span className="font-semibold text-blue-600 block break-words">{viewingTxnDetail.reference || '-'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-0.5">Description</span>
                <span className="font-medium text-gray-700 block break-words">{viewingTxnDetail.description || '-'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingTxnDetail(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PettyCash;
