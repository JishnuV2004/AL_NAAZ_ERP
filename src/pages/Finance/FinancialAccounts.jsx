import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoWalletOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoQrCodeOutline,
  IoCalendarOutline,
  IoArrowBackOutline,
  IoDownloadOutline,
  IoPencilOutline,
  IoSwapHorizontalOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Calendar } from '../../components/ui/calendar';

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

const INITIAL_ACCOUNTS = [
  {
    id: 1,
    name: 'Main Cash Drawer',
    branch: 'Kochi — Main Mandi',
    type: 'CASH',
    purpose: 'CASH',
    openingBalance: 50000,
    currentBalance: 128450,
    status: 'ACTIVE'
  },
  {
    id: 2,
    name: 'Petty Cash',
    branch: 'Kochi — Main Mandi',
    type: 'PETTY_CASH',
    purpose: 'CASH',
    openingBalance: 10000,
    currentBalance: 6180,
    status: 'ACTIVE'
  },
  {
    id: 3,
    name: 'UPI Collections',
    branch: 'Kochi — Main Mandi',
    type: 'UPI',
    purpose: 'UPI',
    openingBalance: 0,
    currentBalance: 84250,
    status: 'ACTIVE'
  },
  {
    id: 4,
    name: 'HDFC Current A/C',
    branch: 'Kochi — Main Mandi',
    type: 'BANK',
    purpose: 'GENERAL',
    openingBalance: 200000,
    currentBalance: 512300,
    status: 'ACTIVE'
  },
  {
    id: 5,
    name: 'Card Receivable',
    branch: 'Kochi — Main Mandi',
    type: 'RECEIVABLE',
    purpose: 'CARD_RECEIVABLE',
    openingBalance: 0,
    currentBalance: 23600,
    status: 'ACTIVE'
  },
  {
    id: 6,
    name: 'Food Delivery Receivable',
    branch: 'Kochi — Main Mandi',
    type: 'RECEIVABLE',
    purpose: 'FOOD_DELIVERY_RECEIVABLE',
    openingBalance: 0,
    currentBalance: 41250,
    status: 'ACTIVE'
  },
  {
    id: 7,
    name: 'Cash Drawer — Kozhikode',
    branch: 'Kozhikode Branch',
    type: 'CASH',
    purpose: 'CASH',
    openingBalance: 20000,
    currentBalance: 39800,
    status: 'ACTIVE'
  }
];

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

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FinancialAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const handleViewAccount = (acc) => {
    if (acc.type === 'PETTY_CASH' || acc.name.toLowerCase().includes('petty cash')) {
      navigate('/finance/pettycash');
    } else {
      setViewingAccount(acc);
    }
  };

  // Account Management Modals State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    targetAccountName: '',
    amount: '',
    reference: ''
  });

  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState({
    type: 'CREDIT (+)',
    amount: '',
    reason: 'Reconciliation Adjustment',
    reference: ''
  });

  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementData, setStatementData] = useState({
    fromDate: '2026-09-01',
    toDate: getTodayDateString(),
    format: 'PDF Document (*.pdf)'
  });

  const [transactionsMap, setTransactionsMap] = useState({});

  const handleOpenTransfer = () => {
    if (!viewingAccount) return;
    const otherAccounts = accounts.filter((a) => a.id !== viewingAccount.id);
    const defaultTarget = otherAccounts.length > 0 ? otherAccounts[0].name : '';
    setTransferData({
      targetAccountName: defaultTarget,
      amount: '',
      reference: ''
    });
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    if (!viewingAccount) return;
    const numAmount = parseFloat(transferData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid transfer amount');
      return;
    }
    if (numAmount > viewingAccount.currentBalance) {
      toast.error(`Insufficient balance in ${viewingAccount.name}`);
      return;
    }

    const targetAcc = accounts.find((a) => a.name === transferData.targetAccountName);
    if (!targetAcc) {
      toast.error('Please select a valid destination account');
      return;
    }

    const newSrcBal = viewingAccount.currentBalance - numAmount;
    const newTgtBal = targetAcc.currentBalance + numAmount;

    setAccounts(
      accounts.map((acc) => {
        if (acc.id === viewingAccount.id) return { ...acc, currentBalance: newSrcBal };
        if (acc.id === targetAcc.id) return { ...acc, currentBalance: newTgtBal };
        return acc;
      })
    );

    const updatedViewing = { ...viewingAccount, currentBalance: newSrcBal };
    setViewingAccount(updatedViewing);

    const srcTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${getTodayDateString()} 15:45`,
      description: `Fund Transfer to ${targetAcc.name}`,
      ref: transferData.reference || 'TRF-OUT',
      type: 'DEBIT',
      amount: numAmount,
      balance: newSrcBal
    };

    setTransactionsMap((prev) => ({
      ...prev,
      [viewingAccount.id]: [srcTxn, ...(prev[viewingAccount.id] || [])]
    }));

    toast.success(`Transferred ₹${numAmount.toLocaleString('en-IN')} to ${targetAcc.name} successfully!`);
    setShowTransferModal(false);
  };

  const handleOpenAdjustment = () => {
    setAdjustmentData({
      type: 'CREDIT (+)',
      amount: '',
      reason: 'Reconciliation Adjustment',
      reference: ''
    });
    setShowAdjustmentModal(true);
  };

  const handleExecuteAdjustment = (e) => {
    e.preventDefault();
    if (!viewingAccount) return;
    const numAmount = parseFloat(adjustmentData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid adjustment amount');
      return;
    }

    const isCredit = adjustmentData.type.includes('CREDIT');
    const newBal = isCredit ? viewingAccount.currentBalance + numAmount : viewingAccount.currentBalance - numAmount;

    setAccounts(
      accounts.map((acc) => (acc.id === viewingAccount.id ? { ...acc, currentBalance: newBal } : acc))
    );

    const updatedViewing = { ...viewingAccount, currentBalance: newBal };
    setViewingAccount(updatedViewing);

    const adjTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `${getTodayDateString()} 15:45`,
      description: `Adjustment: ${adjustmentData.reason}`,
      ref: adjustmentData.reference || 'ADJ-REC',
      type: isCredit ? 'CREDIT' : 'DEBIT',
      amount: numAmount,
      balance: newBal
    };

    setTransactionsMap((prev) => ({
      ...prev,
      [viewingAccount.id]: [adjTxn, ...(prev[viewingAccount.id] || [])]
    }));

    toast.success(`Recorded ${isCredit ? 'Credit' : 'Debit'} adjustment of ₹${numAmount.toLocaleString('en-IN')} successfully!`);
    setShowAdjustmentModal(false);
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
    branch: 'Kochi — Main Mandi',
    type: 'CASH',
    purpose: 'GENERAL',
    openingBalance: '',
    openingBalanceDate: getTodayDateString(),
    isActive: 'Yes'
  });

  const filteredAccounts = accounts.filter((acc) => {
    if (branchFilter !== 'All' && acc.branch !== branchFilter) return false;
    if (typeFilter !== 'All' && acc.type !== typeFilter) return false;
    if (purposeFilter !== 'All' && acc.purpose !== purposeFilter) return false;
    if (statusFilter !== 'All' && acc.status !== statusFilter) return false;
    return true;
  });

  // Calculate summary metrics
  const totalCash = accounts
    .filter((a) => a.type === 'CASH')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalPettyCash = accounts
    .filter((a) => a.type === 'PETTY_CASH')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalBank = accounts
    .filter((a) => a.type === 'BANK')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalUpi = accounts
    .filter((a) => a.type === 'UPI')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const cardReceivable = accounts
    .filter((a) => a.purpose === 'CARD_RECEIVABLE')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const foodDeliveryReceivable = accounts
    .filter((a) => a.purpose === 'FOOD_DELIVERY_RECEIVABLE')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const handleStartCreate = () => {
    setEditingAccount(null);
    setNewAccount({
      name: '',
      branch: 'Kochi — Main Mandi',
      type: 'CASH',
      purpose: 'GENERAL',
      openingBalance: '',
      openingBalanceDate: getTodayDateString(),
      isActive: 'Yes'
    });
    setShowCreateModal(true);
  };

  const handleStartEdit = (account) => {
    setEditingAccount(account);
    setNewAccount({
      name: account.name,
      branch: account.branch,
      type: account.type,
      purpose: account.purpose,
      openingBalance: String(account.openingBalance || 0),
      openingBalanceDate: account.openingBalanceDate || getTodayDateString(),
      isActive: account.status === 'ACTIVE' ? 'Yes' : 'No'
    });
    setShowCreateModal(true);
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    if (!newAccount.name.trim()) {
      toast.error('Please enter account name');
      return;
    }

    const openBal = parseFloat(newAccount.openingBalance) || 0;
    const statusVal = newAccount.isActive === 'Yes' ? 'ACTIVE' : 'INACTIVE';

    if (editingAccount) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === editingAccount.id) {
          const updated = {
            ...acc,
            name: newAccount.name,
            branch: newAccount.branch,
            type: newAccount.type,
            purpose: newAccount.purpose,
            openingBalance: openBal,
            status: statusVal
          };
          if (viewingAccount && viewingAccount.id === editingAccount.id) {
            setViewingAccount(updated);
          }
          return updated;
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      setShowCreateModal(false);
      setEditingAccount(null);
      toast.success(`Financial Account '${newAccount.name}' updated successfully!`);
    } else {
      const newAcc = {
        id: accounts.length + 1,
        name: newAccount.name,
        branch: newAccount.branch,
        type: newAccount.type,
        purpose: newAccount.purpose,
        openingBalance: openBal,
        currentBalance: openBal,
        status: statusVal
      };
      setAccounts([...accounts, newAcc]);
      setShowCreateModal(false);
      toast.success(`Financial Account '${newAccount.name}' created successfully!`);
    }

    setNewAccount({
      name: '',
      branch: 'Kochi — Main Mandi',
      type: 'CASH',
      purpose: 'GENERAL',
      openingBalance: '',
      openingBalanceDate: getTodayDateString(),
      isActive: 'Yes'
    });
  };

  if (viewingAccount) {


    const defaultTxns = [
      {
        id: 'TXN-9021',
        date: '2026-09-24 14:10',
        description: 'Daily Sales Revenue Collection',
        ref: 'DS-2026-0924',
        type: 'CREDIT',
        amount: 42500,
        balance: viewingAccount.currentBalance
      },
      {
        id: 'TXN-8845',
        date: '2026-09-23 18:30',
        description: 'Supplier Payment Settlement — Fresh Fruits Ltd',
        ref: 'PAY-8845',
        type: 'DEBIT',
        amount: 15000,
        balance: viewingAccount.currentBalance - 42500 + 15000
      },
      {
        id: 'TXN-8720',
        date: '2026-09-22 11:15',
        description: 'Store Expense Reimbursement — Utility Bills',
        ref: 'EXP-1042',
        type: 'DEBIT',
        amount: 3200,
        balance: viewingAccount.currentBalance - 42500 + 15000 + 3200
      },
      {
        id: 'TXN-8510',
        date: '2026-09-20 09:00',
        description: 'Account Opening / Initial Balance Setup',
        ref: 'INIT-001',
        type: 'CREDIT',
        amount: viewingAccount.openingBalance,
        balance: viewingAccount.openingBalance
      }
    ];

    const mockLedgerTransactions = transactionsMap[viewingAccount.id] || defaultTxns;

    const netMovement = viewingAccount.currentBalance - viewingAccount.openingBalance;

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
                {viewingAccount.type}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>{viewingAccount.status}</span>
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Branch: <span className="font-semibold text-gray-800">{viewingAccount.branch}</span> · Purpose Tag: <span className="font-semibold text-gray-800">{viewingAccount.purpose}</span>
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
          </div>
        </div>

        {/* Top 4 Key Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Available Balance */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500">Current Available Balance</p>
            <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
              ₹{viewingAccount.currentBalance.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Reconciled real-time balance</p>
          </div>

          {/* Opening Balance */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500">Opening Balance</p>
            <p className="text-2xl font-extrabold text-gray-900 tabular-nums">
              ₹{viewingAccount.openingBalance.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Initial ledger setup amount</p>
          </div>

          {/* Net Balance Movement */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500">Net Movement</p>
            <p className={`text-2xl font-extrabold tabular-nums ${netMovement >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {netMovement >= 0 ? '+' : ''}₹{netMovement.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">Since account creation</p>
          </div>

          {/* Account Classification */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
            <p className="text-xs font-semibold text-gray-500">Account Classification</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {viewingAccount.type} / {viewingAccount.purpose}
            </p>
            <p className="text-[11px] text-gray-400 font-medium">System purpose configuration</p>
          </div>
        </div>

        {/* Main ERP 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Transactions Ledger */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Recent Account Ledger Transactions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Automated debit and credit activity logged to this financial account.</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer">
                  View Full Audit Log
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4">Txn ID / Ref</th>
                      <th className="py-3.5 px-4">Description</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                      <th className="py-3.5 px-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {mockLedgerTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors h-[50px]">
                        <td className="py-3 px-4 font-mono text-gray-600">{txn.date}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{txn.id}</td>
                        <td className="py-3 px-4 font-medium text-gray-800">{txn.description}</td>
                        <td className="py-3 px-4">
                          {txn.type === 'CREDIT' ? (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              + CREDIT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                              - DEBIT
                            </span>
                          )}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold tabular-nums ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-gray-900 tabular-nums">
                          ₹{txn.balance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Account Details & Configuration Grid Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Account Specifications & Attributes</h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Account Name</span>
                  <span className="font-bold text-gray-900">{viewingAccount.name}</span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Branch Location</span>
                  <span className="font-bold text-gray-900">{viewingAccount.branch}</span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Account Type Code</span>
                  <span className="font-bold text-gray-900">{viewingAccount.type}</span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Purpose Grouping</span>
                  <span className="font-bold text-gray-900">{viewingAccount.purpose}</span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Opening Date</span>
                  <span className="font-bold text-gray-900">2026-09-01</span>
                </div>
                <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Reconciliation Status</span>
                  <span className="font-bold text-emerald-600">UP TO DATE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col Sidebar): Controls & Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 font-sans">
              <h3 className="text-base font-bold text-gray-900">Account Management</h3>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleOpenTransfer}
                  className="w-full py-3 px-3.5 bg-gray-50/80 hover:bg-blue-50/60 border border-gray-200/80 hover:border-blue-200 rounded-xl text-sm font-semibold text-gray-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="flex items-center gap-2.5">
                    <IoSwapHorizontalOutline className="text-blue-600 group-hover:scale-110 transition-transform" size={18} />
                    <span>Transfer Funds</span>
                  </span>
                  <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAdjustment}
                  className="w-full py-3 px-3.5 bg-gray-50/80 hover:bg-emerald-50/60 border border-gray-200/80 hover:border-emerald-200 rounded-xl text-sm font-semibold text-gray-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="flex items-center gap-2.5">
                    <IoWalletOutline className="text-emerald-600 group-hover:scale-110 transition-transform" size={18} />
                    <span>Record Adjustment</span>
                  </span>
                  <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenStatement}
                  className="w-full py-3 px-3.5 bg-gray-50/80 hover:bg-purple-50/60 border border-gray-200/80 hover:border-purple-200 rounded-xl text-sm font-semibold text-gray-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
                >
                  <span className="flex items-center gap-2.5">
                    <IoDownloadOutline className="text-purple-600 group-hover:scale-110 transition-transform" size={18} />
                    <span>Download PDF Report</span>
                  </span>
                  <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* System Info & Governance Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3.5 text-xs">
              <h3 className="text-sm font-bold text-gray-900">System & Audit Info</h3>
              <div className="space-y-2 divide-y divide-gray-100">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Account ID</span>
                  <span className="font-bold text-gray-900">ACC-00{viewingAccount.id}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="font-bold text-emerald-600">ACTIVE</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Created By</span>
                  <span className="font-medium text-gray-700">System Administrator</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500 font-medium">Last Reconciled</span>
                  <span className="font-medium text-gray-700">Today 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Popup overlay when viewing an account */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Branch <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newAccount.branch}
                      onChange={(val) => setNewAccount({ ...newAccount, branch: val })}
                      options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                    />
                  </div>

                  {/* Name */}
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

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newAccount.type}
                      onChange={(val) => setNewAccount({ ...newAccount, type: val })}
                      options={['CASH', 'PETTY_CASH', 'UPI', 'BANK', 'RECEIVABLE']}
                    />
                  </div>

                  {/* Account Purpose */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Account Purpose <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={newAccount.purpose}
                      onChange={(val) => setNewAccount({ ...newAccount, purpose: val })}
                      options={['GENERAL', 'CASH', 'UPI', 'CARD_RECEIVABLE', 'FOOD_DELIVERY_RECEIVABLE']}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Options change based on account type.</p>
                  </div>

                  {/* Opening Balance Date */}
                  <div className="relative" ref={datePickerRef}>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Opening Balance Date <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                      className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium shadow-2xs text-left cursor-pointer"
                    >
                      <span>
                        {newAccount.openingBalanceDate
                          ? newAccount.openingBalanceDate.split('-').reverse().join('/')
                          : '20/09/2026'}
                      </span>
                      <IoCalendarOutline className="text-gray-400 text-base shrink-0" />
                    </button>

                    {showCalendarPopover && (
                      <div className="absolute right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-2">
                        <Calendar
                          mode="single"
                          selected={newAccount.openingBalanceDate ? new Date(newAccount.openingBalanceDate) : new Date()}
                          onSelect={(date) => {
                            if (date) {
                              const year = date.getFullYear();
                              const month = String(date.getMonth() + 1).padStart(2, '0');
                              const day = String(date.getDate()).padStart(2, '0');
                              setNewAccount({
                                ...newAccount,
                                openingBalanceDate: `${year}-${month}-${day}`
                              });
                              setShowCalendarPopover(false);
                            }
                          }}
                          initialFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Active */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Active</label>
                    <CustomSelect
                      value={newAccount.isActive}
                      onChange={(val) => setNewAccount({ ...newAccount, isActive: val })}
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
                    {editingAccount ? 'Update Account' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transfer Funds Modal */}
        {showTransferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Transfer Funds</h2>
                  <p className="text-sm text-gray-500 mt-1">Move funds between enterprise financial accounts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <IoCloseOutline size={24} />
                </button>
              </div>

              <form onSubmit={handleExecuteTransfer} className="p-6 sm:p-7 space-y-4.5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Source Account</label>
                  <input
                    type="text"
                    disabled
                    value={`${viewingAccount.name} (Available: ₹${viewingAccount.currentBalance.toLocaleString('en-IN')})`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Destination Account <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={transferData.targetAccountName}
                    onChange={(val) => setTransferData({ ...transferData, targetAccountName: val })}
                    options={accounts.filter((a) => a.id !== viewingAccount.id).map((a) => a.name)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Transfer Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 10000"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-900 focus:outline-none focus:border-blue-500 font-semibold text-sm shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">Transfer Reference / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Cash replenishment for daily operations"
                    value={transferData.reference}
                    onChange={(e) => setTransferData({ ...transferData, reference: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium text-sm shadow-2xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    Execute Transfer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Record Balance Adjustment Modal */}
        {showAdjustmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Record Balance Adjustment</h2>
                  <p className="text-sm text-gray-500 mt-1">Post manual credit or debit adjustment to account ledger.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <IoCloseOutline size={24} />
                </button>
              </div>

              <form onSubmit={handleExecuteAdjustment} className="p-6 sm:p-7 space-y-4.5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Account</label>
                  <input
                    type="text"
                    disabled
                    value={`${viewingAccount.name} (Current: ₹${viewingAccount.currentBalance.toLocaleString('en-IN')})`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Adjustment Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={adjustmentData.type}
                    onChange={(val) => setAdjustmentData({ ...adjustmentData, type: val })}
                    options={['CREDIT (+)', 'DEBIT (-)']}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Adjustment Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={adjustmentData.amount}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-900 focus:outline-none focus:border-blue-500 font-semibold text-sm shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    Reason / Category <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={adjustmentData.reason}
                    onChange={(val) => setAdjustmentData({ ...adjustmentData, reason: val })}
                    options={[
                      'Reconciliation Adjustment',
                      'Bank Charges & Fees',
                      'Interest Income',
                      'Cash Shortage',
                      'Cash Excess',
                      'Audit Correction'
                    ]}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">Reference / Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Approved by Branch Auditor"
                    value={adjustmentData.reference}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, reference: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium text-sm shadow-2xs resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAdjustmentModal(false)}
                    className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    Record Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Download Statement Modal */}
        {showStatementModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Download Account Statement</h2>
                  <p className="text-sm text-gray-500 mt-1">Generate formal ledger statement report.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatementModal(false)}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <IoCloseOutline size={24} />
                </button>
              </div>

              <form onSubmit={handleDownloadStatement} className="p-6 sm:p-7 space-y-4.5 text-sm">
                <div>
                  <label className="block font-bold text-gray-700 mb-2">Account</label>
                  <input
                    type="text"
                    disabled
                    value={`${viewingAccount.name} — ${viewingAccount.branch}`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-gray-700 font-semibold cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">Export Format</label>
                  <CustomSelect
                    value={statementData.format}
                    onChange={(val) => setStatementData({ ...statementData, format: val })}
                    options={['PDF Document (*.pdf)', 'CSV Spreadsheet (*.csv)', 'Excel Workbook (*.xlsx)']}
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={statementData.fromDate}
                    onChange={(e) => setStatementData({ ...statementData, fromDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 font-medium text-sm focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={statementData.toDate}
                    onChange={(e) => setStatementData({ ...statementData, toDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 font-medium text-sm focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowStatementModal(false)}
                    className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <IoDownloadOutline size={17} />
                    <span>Generate & Download</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans w-full pb-10">
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
          <p className="text-lg font-extrabold text-gray-900 tabular-nums">
            ₹{totalCash.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Petty Cash */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Petty Cash</p>
          <p className="text-lg font-extrabold text-gray-900 tabular-nums">
            ₹{totalPettyCash.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Bank */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Bank</p>
          <p className="text-lg font-extrabold text-gray-900 tabular-nums">
            ₹{totalBank.toLocaleString('en-IN')}
          </p>
        </div>

        {/* UPI */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">UPI</p>
          <p className="text-lg font-extrabold text-gray-900 tabular-nums">
            ₹{totalUpi.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card Receivable */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Card Receivable</p>
          <p className="text-lg font-extrabold text-purple-600 tabular-nums">
            ₹{cardReceivable.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Food Delivery Receivable */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Food Delivery Receivable</p>
          <p className="text-lg font-extrabold text-purple-600 tabular-nums">
            ₹{foodDeliveryReceivable.toLocaleString('en-IN')}
          </p>
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
              options={['All', 'Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
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
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Account</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Purpose</th>
                <th className="py-3.5 px-4">Opening Balance</th>
                <th className="py-3.5 px-4">Current Balance</th>
                <th className="py-3.5 px-4">Active</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs bg-white">
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                    {/* Account Name */}
                    <td
                      onClick={() => handleViewAccount(acc)}
                      className="py-3.5 px-4 font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      {acc.name}
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">{acc.branch}</td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {acc.type}
                      </span>
                    </td>

                    {/* Purpose */}
                    <td className="py-3.5 px-4 font-semibold text-gray-500 uppercase tracking-wide text-[11px]">
                      {acc.purpose}
                    </td>

                    {/* Opening Balance */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums">
                      ₹{acc.openingBalance.toLocaleString('en-IN')}
                    </td>

                    {/* Current Balance */}
                    <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums">
                      ₹{acc.currentBalance.toLocaleString('en-IN')}
                    </td>

                    {/* Active Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>ACTIVE</span>
                      </span>
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                    No financial accounts found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Branch */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAccount.branch}
                    onChange={(val) => setNewAccount({ ...newAccount, branch: val })}
                    options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                  />
                </div>

                {/* Name */}
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

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Account Type <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAccount.type}
                    onChange={(val) => setNewAccount({ ...newAccount, type: val })}
                    options={['CASH', 'PETTY_CASH', 'UPI', 'BANK', 'RECEIVABLE']}
                  />
                </div>

                {/* Account Purpose */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Account Purpose <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={newAccount.purpose}
                    onChange={(val) => setNewAccount({ ...newAccount, purpose: val })}
                    options={['GENERAL', 'CASH', 'UPI', 'CARD_RECEIVABLE', 'FOOD_DELIVERY_RECEIVABLE']}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Options change based on account type.</p>
                </div>

                {/* Opening Balance Date */}
                <div className="relative" ref={datePickerRef}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Opening Balance Date <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendarPopover(!showCalendarPopover)}
                    className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-xl px-4 py-2.5 bg-white text-gray-800 focus:outline-none hover:border-blue-400 font-medium shadow-2xs text-left cursor-pointer"
                  >
                    <span>
                      {newAccount.openingBalanceDate
                        ? newAccount.openingBalanceDate.split('-').reverse().join('/')
                        : '20/09/2026'}
                    </span>
                    <IoCalendarOutline className="text-gray-400 text-base shrink-0" />
                  </button>

                  {showCalendarPopover && (
                    <div className="absolute right-0 z-50 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-2">
                      <Calendar
                        mode="single"
                        selected={newAccount.openingBalanceDate ? new Date(newAccount.openingBalanceDate) : new Date()}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            setNewAccount({
                              ...newAccount,
                              openingBalanceDate: `${year}-${month}-${day}`
                            });
                            setShowCalendarPopover(false);
                          }
                        }}
                        initialFocus
                      />
                    </div>
                  )}
                </div>

                {/* Active */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Active</label>
                  <CustomSelect
                    value={newAccount.isActive}
                    onChange={(val) => setNewAccount({ ...newAccount, isActive: val })}
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
                  {editingAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default FinancialAccounts;
