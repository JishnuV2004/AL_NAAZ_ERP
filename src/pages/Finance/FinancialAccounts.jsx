import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoQrCodeOutline,
  IoCalendarOutline,
  IoArrowBackOutline,
  IoDownloadOutline,
  IoPencilOutline,
  IoSwapHorizontalOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoArrowForwardOutline,
  IoTrashOutline,
  IoWarningOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Calendar } from '../../components/ui/calendar';
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
        className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className="truncate">{value || 'Select...'}</span>
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

const FinancialAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountService.fetchAccounts();
      if (Array.isArray(data)) {
        setAccounts(data);
      } else if (data && Array.isArray(data.results)) {
        setAccounts(data.results);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.warn('API /accounts/ unavailable:', err);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const [branchesList, setBranchesList] = useState([]);

  const loadBranches = async () => {
    try {
      const data = await accountService.fetchBranches();
      const list = Array.isArray(data) ? data : (data?.results || []);
      if (list.length > 0) {
        setBranchesList(list);
      }
    } catch (err) {
      console.warn('Failed to fetch branches from API:', err);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadBranches();
  }, []);

  const [detailTxnPage, setDetailTxnPage] = useState(1);
  const [loadingAccountDetails, setLoadingAccountDetails] = useState(false);

  const handleViewAccount = async (acc) => {
    const typeStr = acc.account_type || acc.type || '';
    const nameStr = (acc.name || '').toLowerCase();
    if (typeStr === 'PETTY_CASH' || nameStr.includes('petty cash')) {
      navigate('/finance/pettycash', { state: { accountId: acc.id } });
      return;
    }

    setViewingAccount(acc);
    setDetailTxnPage(1);
    setLoadingAccountDetails(true);

    try {
      const [details, txns, balData] = await Promise.all([
        accountService.getAccountById(acc.id).catch(() => null),
        accountService.getAccountTransactions(acc.id).catch(() => null),
        accountService.getAccountBalance(acc.id).catch(() => null)
      ]);

      let updatedViewing = details ? { ...acc, ...details } : { ...acc };
      if (balData && (balData.balance !== undefined && balData.balance !== null)) {
        updatedViewing.balance = balData.balance;
        updatedViewing.current_balance = balData.balance;
      }
      setViewingAccount(updatedViewing);

      const rawTxnsList = Array.isArray(txns) ? txns : (txns?.results || []);
      if (rawTxnsList.length > 0) {
        const mappedTxns = rawTxnsList.map((tx) => ({
          rawId: tx.id,
          id: tx.id,
          branch: tx.branch,
          branch_name: tx.branch_name || '-',
          account: tx.account,
          account_name: tx.account_name || acc.name,
          transaction_type: tx.transaction_type || '-',
          direction: tx.direction || 'IN',
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
            : tx.transaction_date || '-',
          type: tx.direction === 'IN' ? 'CREDIT' : 'DEBIT'
        }));
        setTransactionsMap((prev) => ({
          ...prev,
          [acc.id]: mappedTxns
        }));
      }
    } catch (err) {
      console.warn(`Could not fetch details/transactions for account #${acc.id}:`, err);
    } finally {
      setLoadingAccountDetails(false);
    }
  };

  // Account Management Modals State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    transaction_date: getTodayDateString(),
    description: '',
    reference: ''
  });
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


  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementData, setStatementData] = useState({
    fromDate: '2026-09-01',
    toDate: getTodayDateString(),
    format: 'PDF Document (*.pdf)'
  });

  const [transactionsMap, setTransactionsMap] = useState({});
  const [viewingTxnDetail, setViewingTxnDetail] = useState(null);

  const handleOpenTransfer = () => {
    const fromId = viewingAccount ? viewingAccount.id : (accounts.length > 0 ? accounts[0].id : '');
    const otherAccounts = accounts.filter((a) => String(a.id) !== String(fromId));
    const defaultToId = otherAccounts.length > 0 ? otherAccounts[0].id : '';
    setTransferData({
      from_account: fromId,
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

    const loadingToast = toast.loading('Executing fund transfer...');
    try {
      const res = await accountService.transferFunds(payload);
      toast.success(res.message || 'Transfer completed successfully.', { id: loadingToast });
      setShowTransferModal(false);

      // Refresh accounts list & current viewing account details
      await loadAccounts();
      if (viewingAccount) {
        await handleViewAccount(viewingAccount);
      }
    } catch (err) {
      console.error('Transfer failed:', err);
      const msg = err?.response?.data?.detail || err?.response?.data?.error || err?.userMessage || 'Failed to execute transfer';
      toast.error(msg, { id: loadingToast });
    }
  };


  const handleOpenStatement = () => {
    setStatementData({
      fromDate: '2026-09-01',
      toDate: getTodayDateString(),
      format: 'PDF Document (*.pdf)'
    });
    setShowStatementModal(true);
  };

  const handleDownloadStatement = (e) => {
    e.preventDefault();
    toast.success(`Account statement for ${viewingAccount.name} downloaded successfully!`);
    setShowStatementModal(false);
  };

  // Calendar popover state & ref for Form Modal
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [newAccount, setNewAccount] = useState({
    name: '',
    branch_name: 'Al Naaz Kayamkulam',
    account_type: 'CASH',
    account_purpose: 'GENERAL',
    opening_balance: '',
    opening_balance_date: getTodayDateString(),
    is_active: true
  });

  const filteredAccounts = accounts.filter((acc) => {
    const branchName = acc.branch_name || acc.branch || '';
    const accType = acc.account_type || acc.type || '';
    const accPurpose = acc.account_purpose || acc.purpose || '';
    const isActiveStr = acc.is_active !== undefined ? (acc.is_active ? 'ACTIVE' : 'INACTIVE') : (acc.status || 'ACTIVE');

    if (branchFilter !== 'All' && branchName !== branchFilter) return false;
    if (typeFilter !== 'All' && accType !== typeFilter) return false;
    if (purposeFilter !== 'All' && accPurpose !== purposeFilter) return false;
    if (statusFilter !== 'All' && isActiveStr !== statusFilter) return false;
    return true;
  });

  // Calculate summary metrics
  const getAccBalance = (a) => parseFloat(a.balance ?? a.current_balance ?? a.currentBalance ?? a.opening_balance ?? 0);
  const getAccType = (a) => a.account_type || a.type;
  const getAccPurpose = (a) => a.account_purpose || a.purpose;

  const totalCash = accounts
    .filter((a) => getAccType(a) === 'CASH')
    .reduce((sum, a) => sum + getAccBalance(a), 0);

  const totalPettyCash = accounts
    .filter((a) => getAccType(a) === 'PETTY_CASH')
    .reduce((sum, a) => sum + getAccBalance(a), 0);

  const totalBank = accounts
    .filter((a) => getAccType(a) === 'BANK')
    .reduce((sum, a) => sum + getAccBalance(a), 0);

  const totalUpi = accounts
    .filter((a) => getAccType(a) === 'UPI')
    .reduce((sum, a) => sum + getAccBalance(a), 0);

  const cardReceivable = accounts
    .filter((a) => getAccPurpose(a) === 'CARD_RECEIVABLE')
    .reduce((sum, a) => sum + getAccBalance(a), 0);

  const foodDeliveryReceivable = accounts
    .filter((a) => getAccPurpose(a) === 'FOOD_DELIVERY_RECEIVABLE')
    .reduce((sum, a) => sum + getAccBalance(a), 0);

  const branchOptions = useMemo(() => {
    const set = new Set();
    branchesList.forEach((b) => {
      if (b.name) set.add(b.name);
    });
    accounts.forEach((a) => {
      if (a.branch_name) set.add(a.branch_name);
    });
    if (set.size === 0) set.add('Al Naaz Kayamkulam');
    return ['All', ...Array.from(set)];
  }, [branchesList, accounts]);

  const handleStartCreate = () => {
    setEditingAccount(null);
    const defaultBranch = branchesList.length > 0 ? branchesList[0] : null;
    setNewAccount({
      name: '',
      branch: defaultBranch ? defaultBranch.id : 1,
      branch_name: defaultBranch ? defaultBranch.name : 'Al Naaz Kayamkulam',
      account_type: 'CASH',
      account_purpose: 'GENERAL',
      opening_balance: '',
      opening_balance_date: getTodayDateString(),
      is_active: true
    });
    setShowCreateModal(true);
  };

  // Confirmation Modals State
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [pendingAccountPayload, setPendingAccountPayload] = useState(null);

  const handleStartEdit = (account) => {
    setEditingAccount(account);
    setViewingAccount(null);
    const matchingBr = branchesList.find((b) => b.name === (account.branch_name || account.branch) || b.id === account.branch);
    setNewAccount({
      name: account.name || '',
      branch: matchingBr ? matchingBr.id : (account.branch || 1),
      branch_name: account.branch_name || matchingBr?.name || 'Al Naaz Kayamkulam',
      account_type: account.account_type || account.type || 'CASH',
      account_purpose: account.account_purpose || account.purpose || 'GENERAL',
      opening_balance: String(account.opening_balance ?? account.openingBalance ?? 0),
      opening_balance_date: account.opening_balance_date || account.openingBalanceDate || getTodayDateString(),
      is_active: account.is_active !== undefined ? account.is_active : account.status === 'ACTIVE'
    });
    setShowCreateModal(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.name.trim()) {
      toast.error('Please enter account name');
      return;
    }

    const selectedBr = branchesList.find((b) => b.name === newAccount.branch_name || b.id === newAccount.branch);
    const branchId = selectedBr ? selectedBr.id : (newAccount.branch || 1);
    const openBal = parseFloat(newAccount.opening_balance) || 0;

    const payload = {
      branch: branchId,
      name: newAccount.name.trim(),
      account_type: newAccount.account_type,
      account_purpose: newAccount.account_purpose,
      opening_balance: newAccount.opening_balance ? String(newAccount.opening_balance) : "0",
      opening_balance_date: newAccount.opening_balance_date,
      is_active: newAccount.is_active
    };

    if (editingAccount) {
      setPendingAccountPayload(payload);
      setShowEditConfirmModal(true);
    } else {
      const loadingToast = toast.loading('Creating financial account...');
      try {
        const created = await accountService.createAccount(payload);
        setAccounts([created, ...accounts]);
        setShowCreateModal(false);
        toast.success(`Financial Account '${created.name || newAccount.name}' created successfully!`, { id: loadingToast });
        setNewAccount({
          name: '',
          branch_name: 'Al Naaz Kayamkulam',
          account_type: 'CASH',
          account_purpose: 'GENERAL',
          opening_balance: '',
          opening_balance_date: getTodayDateString(),
          is_active: true
        });
      } catch (err) {
        console.error('Failed to create account:', err);
        const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to create financial account';
        toast.error(msg, { id: loadingToast });
      }
    }
  };

  const confirmUpdateAccount = async () => {
    if (!editingAccount || !pendingAccountPayload) return;
    const loadingToast = toast.loading(`Updating account '${editingAccount.name}'...`);
    try {
      const updatedData = await accountService.updateAccount(editingAccount.id, pendingAccountPayload);
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === editingAccount.id) {
          const updated = {
            ...acc,
            ...updatedData,
            name: pendingAccountPayload.name,
            account_type: pendingAccountPayload.account_type,
            account_purpose: pendingAccountPayload.account_purpose,
            current_balance: parseFloat(pendingAccountPayload.opening_balance || 0),
            currentBalance: parseFloat(pendingAccountPayload.opening_balance || 0)
          };
          if (viewingAccount && viewingAccount.id === editingAccount.id) {
            setViewingAccount(updated);
          }
          return updated;
        }
        return acc;
      });

      setAccounts(updatedAccounts);
      setShowEditConfirmModal(false);
      setShowCreateModal(false);
      setEditingAccount(null);
      setPendingAccountPayload(null);
      toast.success(`Account '${pendingAccountPayload.name}' updated successfully!`, { id: loadingToast });
    } catch (err) {
      console.error('Failed to update account:', err);
      const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to update account';
      toast.error(msg, { id: loadingToast });
    }
  };

  const handleOpenDelete = (account) => {
    setAccountToDelete(account);
    setViewingAccount(null);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    const loadingToast = toast.loading(`Deleting account '${accountToDelete.name}'...`);
    try {
      await accountService.deleteAccount(accountToDelete.id);
      setAccounts(accounts.filter((acc) => acc.id !== accountToDelete.id));
      if (viewingAccount && viewingAccount.id === accountToDelete.id) {
        setViewingAccount(null);
      }
      setShowDeleteConfirmModal(false);
      setShowCreateModal(false);
      setEditingAccount(null);
      toast.success(`Account '${accountToDelete.name}' deleted successfully!`, { id: loadingToast });
      setAccountToDelete(null);
    } catch (err) {
      console.error('Failed to delete account:', err);
      const msg = err?.response?.data?.detail || err?.userMessage || 'Failed to delete account';
      toast.error(msg, { id: loadingToast });
    }
  };

  // Pagination bounds
  const totalCount = filteredAccounts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const emptyRowsCount = Math.max(0, pageSize - paginatedAccounts.length);

  const renderAccountDetails = () => {
    const curBal = getAccBalance(viewingAccount);
    const openBal = parseFloat(viewingAccount.opening_balance ?? viewingAccount.openingBalance ?? 0);

    const ledgerTransactions = transactionsMap[viewingAccount.id] || [];
    const netMovement = curBal - openBal;

    const DETAIL_PAGE_SIZE = 10;
    const detailTotalPages = Math.max(1, Math.ceil(ledgerTransactions.length / DETAIL_PAGE_SIZE));
    const detailIndexOfLast = detailTxnPage * DETAIL_PAGE_SIZE;
    const detailIndexOfFirst = detailIndexOfLast - DETAIL_PAGE_SIZE;
    const currentDetailTxns = ledgerTransactions.slice(detailIndexOfFirst, detailIndexOfLast);

    return (
      <div className="space-y-6 font-sans w-full pb-10 animate-in fade-in duration-150">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => setViewingAccount(null)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-bold transition-colors cursor-pointer"
          >
            <IoArrowBackOutline size={18} />
            <span>Back to Financial Accounts</span>
          </button>
        </div>

        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {viewingAccount.name}
              </h1>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {getAccType(viewingAccount)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{viewingAccount.is_active !== false ? 'ACTIVE' : 'INACTIVE'}</span>
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Branch: <span className="font-semibold text-gray-800">{viewingAccount.branch_name || viewingAccount.branch || 'Al Naaz Kayamkulam'}</span> · Purpose Tag: <span className="font-semibold text-gray-800">{getAccPurpose(viewingAccount)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleStartEdit(viewingAccount)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <IoPencilOutline size={15} />
              <span>Edit Account</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenDelete(viewingAccount)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <IoTrashOutline size={15} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Top 4 Key Metric Summary Cards */}
        {loadingAccountDetails ? (
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
              <p className="text-[11px] text-gray-400 font-medium">Setup amount ({viewingAccount.opening_balance_date || '2026-09-10'})</p>
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
                {viewingAccount.created_by_name || 'admin'}
              </p>
              <p className="text-[11px] text-gray-400 font-medium">{viewingAccount.created_at ? viewingAccount.created_at.slice(0, 10) : '-'}</p>
            </div>
          </div>
        )}

        {/* Recent Transactions & Account Management Layout */}
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
                    {loadingAccountDetails ? (
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
            {ledgerTransactions.length > 0 && (
              <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-800">{detailIndexOfFirst + 1}</span> to{' '}
                  <span className="font-bold text-slate-800">
                    {Math.min(detailIndexOfLast, ledgerTransactions.length)}
                  </span>{' '}
                  of <span className="font-bold text-slate-800">{ledgerTransactions.length}</span> entries
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

      </div>
    );
  };

  return (
    <div className="space-y-5 font-sans w-full pb-10">
      {viewingAccount ? (
        renderAccountDetails()
      ) : (
        <>
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
            <span>Finance</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Financial Accounts</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Accounts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cash, bank, UPI, petty cash and receivable accounts across every branch.
          </p>
        </div>

        <button
          onClick={handleStartCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <IoAddOutline size={16} />
          <span>Create Account</span>
        </button>
      </div>

      {/* 2. Top Summary Cards Grid (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Cash */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Cash</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-md mt-0.5"></div>
          ) : (
            <p className="text-lg font-extrabold text-gray-900 tabular-nums">
              ₹{totalCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Petty Cash */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Petty Cash</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-md mt-0.5"></div>
          ) : (
            <p className="text-lg font-extrabold text-gray-900 tabular-nums">
              ₹{totalPettyCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Bank */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Bank</p>
          {loading ? (
            <div className="h-7 w-28 bg-gray-200 animate-pulse rounded-md mt-0.5"></div>
          ) : (
            <p className="text-lg font-extrabold text-gray-900 tabular-nums">
              ₹{totalBank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* UPI */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">UPI</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-md mt-0.5"></div>
          ) : (
            <p className="text-lg font-extrabold text-gray-900 tabular-nums">
              ₹{totalUpi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Card Receivable */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Card Receivable</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-md mt-0.5"></div>
          ) : (
            <p className="text-lg font-extrabold text-purple-600 tabular-nums">
              ₹{cardReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Food Delivery Receivable */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Food Delivery Receivable</p>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-md mt-0.5"></div>
          ) : (
            <p className="text-lg font-extrabold text-purple-600 tabular-nums">
              ₹{foodDeliveryReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
      </div>

      {/* 3. Filter Bar Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-4xl">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
            <CustomSelect
              value={branchFilter}
              onChange={setBranchFilter}
              options={branchOptions}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Account Type</label>
            <CustomSelect
              value={typeFilter}
              onChange={setTypeFilter}
              options={['All', 'CASH', 'PETTY_CASH', 'UPI', 'BANK', 'RECEIVABLE']}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Purpose</label>
            <CustomSelect
              value={purposeFilter}
              onChange={setPurposeFilter}
              options={['All', 'CASH', 'UPI', 'GENERAL', 'CARD_RECEIVABLE', 'FOOD_DELIVERY_RECEIVABLE']}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={['All', 'ACTIVE', 'INACTIVE']}
            />
          </div>
        </div>
      </div>

      {/* 4. Accounts Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full min-h-[530px]">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Account ID</th>
                <th className="py-3.5 px-4">Account Name</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4 text-right">Opening Balance</th>
                <th className="py-3.5 px-4">Opening Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs bg-white">
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="h-[54px] border-b border-gray-100 animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-gray-200 rounded w-14 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-gray-200 rounded w-12 mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedAccounts.length > 0 ? (
                <>
                  {paginatedAccounts.map((acc) => {
                    const accType = acc.account_type || acc.type || 'CASH';
                    const accPurpose = acc.account_purpose || acc.purpose || 'GENERAL';
                    const branchName = acc.branch_name || acc.branch || 'Al Naaz Kayamkulam';
                    const openBalNum = parseFloat(acc.opening_balance ?? acc.openingBalance ?? 0);
                    const isActiveBool = acc.is_active !== undefined ? acc.is_active : (acc.status === 'ACTIVE');

                    return (
                      <tr key={acc.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                        {/* Account ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          #{acc.id}
                        </td>

                        {/* Account Name */}
                        <td
                          onClick={() => handleViewAccount(acc)}
                          className="py-3.5 px-4 font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        >
                          {acc.name}
                        </td>

                        {/* Branch */}
                        <td className="py-3.5 px-4 font-medium text-gray-700">{branchName}</td>

                        {/* Type Badge */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {accType}
                          </span>
                        </td>

                        {/* Purpose */}
                        <td className="py-3.5 px-4 font-semibold text-gray-500 uppercase tracking-wide text-[11px]">
                          {accPurpose}
                        </td>

                        {/* Opening Balance */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 tabular-nums">
                          ₹{openBalNum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Opening Date */}
                        <td className="py-3.5 px-4 font-medium text-gray-600">
                          {acc.opening_balance_date || acc.openingBalanceDate || (acc.created_at ? acc.created_at.slice(0, 10) : '-')}
                        </td>

                        {/* Active Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          {isActiveBool ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>INACTIVE</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleViewAccount(acc)}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Filler empty rows to maintain 10-row container height */}
                  {emptyRowsCount > 0 &&
                    Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="h-[54px] border-b border-gray-100/40">
                        <td colSpan="9" className="py-3.5 px-4">&nbsp;</td>
                      </tr>
                    ))}
                </>
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                    No financial accounts found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white">
          <span className="text-xs text-gray-500 font-medium">
            Showing {startItem} to {endItem} of {totalCount} account entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <IoChevronBackOutline size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
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
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <IoChevronForwardOutline size={14} />
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl animate-in zoom-in-95 duration-150 font-sans relative">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAccount ? `Edit Financial Account: ${editingAccount.name}` : 'Create Financial Account'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editingAccount
                    ? 'Update account details, purpose classification, or status.'
                    : 'Admin-level setup. Account purpose must be compatible with the selected account type.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingAccount(null);
                }}
                className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-6 sm:p-7 space-y-6 text-sm">
              {editingAccount && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                  Note: In edit mode, <span className="font-bold">Name</span>, <span className="font-bold">Account Type</span>, <span className="font-bold">Account Purpose</span>, and <span className="font-bold">Active Status</span> can be modified.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Branch */}
                <div className={editingAccount ? 'opacity-60 pointer-events-none' : ''}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAccount.branch_name || (branchesList.length > 0 ? branchesList[0].name : 'Al Naaz Kayamkulam')}
                    onChange={(val) => {
                      if (editingAccount) return;
                      const selectedBr = branchesList.find((b) => b.name === val);
                      setNewAccount({
                        ...newAccount,
                        branch: selectedBr ? selectedBr.id : 1,
                        branch_name: val
                      });
                    }}
                    options={branchesList.length > 0 ? branchesList.map((b) => b.name) : ['Al Naaz Kayamkulam']}
                  />
                </div>

                {/* Name (Editable) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SBI Savings A/C"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                    required
                  />
                </div>

                {/* Account Type (Editable) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Account Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAccount.account_type}
                    onChange={(val) => setNewAccount({ ...newAccount, account_type: val })}
                    options={['CASH', 'PETTY_CASH', 'UPI', 'BANK', 'RECEIVABLE']}
                  />
                </div>

                {/* Account Purpose (Editable) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Account Purpose <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAccount.account_purpose}
                    onChange={(val) => setNewAccount({ ...newAccount, account_purpose: val })}
                    options={['GENERAL', 'CASH', 'UPI', 'CARD_RECEIVABLE', 'FOOD_DELIVERY_RECEIVABLE']}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Options change based on account type.</p>
                </div>

                {/* Opening Balance */}
                <div className={editingAccount ? 'opacity-60 pointer-events-none' : ''}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Opening Balance (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={!!editingAccount}
                    placeholder="e.g. 6000"
                    value={newAccount.opening_balance}
                    onChange={(e) => setNewAccount({ ...newAccount, opening_balance: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono font-bold shadow-2xs disabled:bg-gray-100 disabled:text-gray-500"
                    required
                  />
                </div>

                {/* Opening Balance Date */}
                <div className={`relative ${editingAccount ? 'opacity-60 pointer-events-none' : ''}`} ref={datePickerRef}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Opening Balance Date <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    disabled={!!editingAccount}
                    onClick={() => !editingAccount && setShowCalendarPopover(!showCalendarPopover)}
                    className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium shadow-2xs text-left cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <span>
                      {newAccount.opening_balance_date
                        ? newAccount.opening_balance_date.split('-').reverse().join('/')
                        : '01/10/2026'}
                    </span>
                    <IoCalendarOutline className="text-gray-400 text-base shrink-0" />
                  </button>

                  {!editingAccount && showCalendarPopover && (
                    <div className="absolute right-0 bottom-full mb-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <Calendar
                        value={newAccount.opening_balance_date || '2026-10-01'}
                        onChange={(newDate) => {
                          setNewAccount({
                            ...newAccount,
                            opening_balance_date: newDate
                          });
                          setShowCalendarPopover(false);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Active */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Active</label>
                  <CustomSelect
                    value={newAccount.is_active ? 'Yes' : 'No'}
                    onChange={(val) => setNewAccount({ ...newAccount, is_active: val === 'Yes' })}
                    options={['Yes', 'No']}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAccount(null);
                  }}
                  className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
                >
                  {editingAccount ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <IoWarningOutline size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Confirm Account Update</h3>
              <p className="text-xs text-gray-500 mt-1.5">
                Are you sure you want to update the details for <span className="font-bold text-gray-800">{editingAccount?.name}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowEditConfirmModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmUpdateAccount}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <IoTrashOutline size={26} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Financial Account</h3>
              <p className="text-xs text-gray-500 mt-1.5">
                Are you sure you want to delete <span className="font-bold text-gray-800">{accountToDelete?.name}</span>?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                This action cannot be undone and will permanently remove this account.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
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
                  disabled={!!viewingAccount}
                  value={transferData.from_account}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    const otherAccounts = accounts.filter((a) => String(a.id) !== String(newFrom));
                    const newTo = otherAccounts.some((a) => String(a.id) === String(transferData.to_account))
                      ? transferData.to_account
                      : (otherAccounts[0]?.id || '');
                    setTransferData({ ...transferData, from_account: newFrom, to_account: newTo });
                  }}
                  className={`w-full px-3.5 py-2.5 border rounded-xl outline-none text-xs font-medium ${
                    viewingAccount
                      ? 'bg-slate-100 text-slate-700 font-semibold cursor-not-allowed border-slate-300'
                      : 'bg-white focus:border-blue-500 border-gray-200'
                  }`}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.account_type || acc.type || 'ACCOUNT'})
                    </option>
                  ))}
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
                  {accounts
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
                      : '01/10/2026'}
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

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
              <input
                type="text"
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                placeholder="e.g. Daily cash transfer to main account"
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference</label>
              <input
                type="text"
                value={transferData.reference}
                onChange={(e) => setTransferData({ ...transferData, reference: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                placeholder="e.g. TRF-2026-001"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium text-xs cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Execute Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Transaction Details Modal */}
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

export default FinancialAccounts;
