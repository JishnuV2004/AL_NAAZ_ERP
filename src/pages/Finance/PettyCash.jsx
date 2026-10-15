import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPencilOutline,
  IoSwapHorizontalOutline,
  IoWalletOutline,
  IoDownloadOutline,
  IoArrowBackOutline,
  IoCloseOutline,
  IoArrowForwardOutline,
  IoChevronBack,
  IoChevronForward
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { accountService } from '../../services/accountService';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9021',
    dateTime: '2026-09-24 14:10',
    description: 'Daily Sales Revenue Collection',
    type: 'CREDIT',
    amount: 42500,
    balance: 6180
  },
  {
    id: 'TXN-8845',
    dateTime: '2026-09-23 18:30',
    description: 'Supplier Payment Settlement — Fresh Fruits Ltd',
    type: 'DEBIT',
    amount: 15000,
    balance: -21320
  },
  {
    id: 'TXN-8720',
    dateTime: '2026-09-22 11:15',
    description: 'Store Expense Reimbursement — Utility Bills',
    type: 'DEBIT',
    amount: 3200,
    balance: -18120
  },
  {
    id: 'TXN-8510',
    dateTime: '2026-09-20 09:00',
    description: 'Account Opening / Initial Balance Setup',
    type: 'CREDIT',
    amount: 10000,
    balance: 10000
  }
];

const PettyCash = () => {
  const navigate = useNavigate();

  // Account Metadata State
  const [account, setAccount] = useState({
    id: 1,
    name: 'Petty Cash',
    typeTag: 'PETTY_CASH',
    status: 'ACTIVE',
    branch: 'Al Naaz Kayamkulam',
    purposeTag: 'GENERAL',
    currentBalance: 6180,
    openingBalance: 10000,
    created_by_name: 'admin',
    opening_balance_date: '2026-09-01'
  });

  const [loadingTxns, setLoadingTxns] = useState(false);

  useEffect(() => {
    const loadAccountDetails = async () => {
      setLoadingTxns(true);
      try {
        const [accRes, txnsRes, balRes] = await Promise.allSettled([
          accountService.getAccountById(1),
          accountService.getAccountTransactions(1),
          accountService.getAccountBalance(1)
        ]);

        if (accRes.status === 'fulfilled' && accRes.value) {
          const data = accRes.value;
          const liveBal = balRes.status === 'fulfilled' && balRes.value && (balRes.value.balance !== undefined && balRes.value.balance !== null)
            ? parseFloat(balRes.value.balance)
            : parseFloat(data.opening_balance || 10000);

          setAccount({
            id: data.id,
            name: data.name || 'Petty Cash',
            typeTag: data.account_type || 'PETTY_CASH',
            status: data.is_active !== false ? 'ACTIVE' : 'INACTIVE',
            branch: data.branch_name || 'Al Naaz Kayamkulam',
            purposeTag: data.account_purpose || 'GENERAL',
            currentBalance: liveBal,
            openingBalance: parseFloat(data.opening_balance || 10000),
            created_by_name: data.created_by_name || 'admin',
            opening_balance_date: data.opening_balance_date || '2026-09-01'
          });
        }

        if (txnsRes.status === 'fulfilled' && Array.isArray(txnsRes.value)) {
          const mapped = txnsRes.value.map((tx) => {
            const isCredit = tx.direction === 'IN';
            return {
              id: tx.reference || `TXN-${tx.id}`,
              dateTime: tx.created_at ? `${tx.created_at.slice(0, 10)} ${tx.created_at.slice(11, 16)}` : (tx.transaction_date || ''),
              description: tx.description || tx.transaction_type,
              type: isCredit ? 'CREDIT' : 'DEBIT',
              amount: parseFloat(tx.amount || 0),
              created_by_name: tx.created_by_name || 'admin'
            };
          });
          setTransactions(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch Petty Cash details/transactions for ID 1:', err);
      } finally {
        setLoadingTxns(false);
      }
    };
    loadAccountDetails();
  }, []);

  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const TXN_PAGE_SIZE = 10;
  const [txnPage, setTxnPage] = useState(1);

  const totalTxnPages = Math.max(1, Math.ceil(transactions.length / TXN_PAGE_SIZE));
  const indexOfLastTxn = txnPage * TXN_PAGE_SIZE;
  const indexOfFirstTxn = indexOfLastTxn - TXN_PAGE_SIZE;
  const currentTransactions = transactions.slice(indexOfFirstTxn, indexOfLastTxn);

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    name: account.name,
    branch: account.branch,
    purposeTag: account.purposeTag
  });

  const [transferForm, setTransferForm] = useState({
    targetAccount: 'Main Cash Drawer',
    amount: '',
    reference: ''
  });

  const [adjustmentForm, setAdjustmentForm] = useState({
    type: 'CREDIT',
    amount: '',
    reason: 'Reconciliation adjustment'
  });

  const netMovement = account.currentBalance - account.openingBalance;

  // Handlers
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setAccount((prev) => ({
      ...prev,
      name: editForm.name,
      branch: editForm.branch,
      purposeTag: editForm.purposeTag
    }));
    setShowEditModal(false);
    toast.success('Petty Cash account details updated!');
  };

  const handleExecuteTransfer = (e) => {
    e.preventDefault();
    const num = parseFloat(transferForm.amount) || 0;
    if (num <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const newBal = account.currentBalance - num;
    setAccount((prev) => ({ ...prev, currentBalance: newBal }));

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      dateTime: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`,
      description: `Fund Transfer to ${transferForm.targetAccount}`,
      type: 'DEBIT',
      amount: num,
      balance: newBal
    };
    setTransactions([newTxn, ...transactions]);
    setShowTransferModal(false);
    toast.success(`Transferred ₹${num.toLocaleString('en-IN')} to ${transferForm.targetAccount}`);
    setTransferForm({ targetAccount: 'Main Cash Drawer', amount: '', reference: '' });
  };

  const handleExecuteAdjustment = (e) => {
    e.preventDefault();
    const num = parseFloat(adjustmentForm.amount) || 0;
    if (num <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    const newBal = adjustmentForm.type === 'CREDIT' ? account.currentBalance + num : account.currentBalance - num;
    setAccount((prev) => ({ ...prev, currentBalance: newBal }));

    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      dateTime: `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`,
      description: adjustmentForm.reason || 'Ledger Adjustment',
      type: adjustmentForm.type,
      amount: num,
      balance: newBal
    };
    setTransactions([newTxn, ...transactions]);
    setShowAdjustmentModal(false);
    toast.success(`Recorded ${adjustmentForm.type} adjustment of ₹${num.toLocaleString('en-IN')}`);
    setAdjustmentForm({ type: 'CREDIT', amount: '', reason: 'Reconciliation adjustment' });
  };

  const handleDownloadReport = () => {
    toast.success('Downloading Petty Cash Account PDF Report...');
  };

  return (
    <div className="space-y-6 font-sans w-full pb-12">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight font-sans">
              {account.name}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-gray-100 text-gray-700 border border-gray-200">
              {account.typeTag}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>{account.status}</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Branch: <span className="font-semibold text-gray-800">{account.branch}</span> · Purpose Tag: <span className="font-semibold text-gray-800">{account.purposeTag}</span>
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <IoPencilOutline size={15} />
            <span>Edit Account</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Summary Cards Grid (Exact screenshot 4-box layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Current Available Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Current Available Balance</p>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums font-mono">
            ₹{account.currentBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">Reconciled balance</p>
        </div>

        {/* Card 2: Opening Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Opening Balance</p>
          <p className="text-2xl font-extrabold text-gray-900 tabular-nums font-mono">
            ₹{account.openingBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">Setup amount ({account.opening_balance_date || '2026-09-01'})</p>
        </div>

        {/* Card 3: Net Movement */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Net Movement</p>
          <p className={`text-2xl font-extrabold tabular-nums font-mono ${netMovement >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {netMovement >= 0 ? '+' : ''}₹{netMovement.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">Since account creation</p>
        </div>

        {/* Card 4: Created By */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Created By</p>
          <p className="text-lg font-bold text-gray-900 truncate">
            {account.created_by_name || 'admin'}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">{account.opening_balance_date || '2026-09-01'}</p>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Left: Transactions Table, Right: Account Management Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left Column (2 Cols): Recent Account Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden min-h-[580px] flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-gray-900 font-serif">Recent Account Transactions</h3>
              <span className="text-xs text-gray-500 font-medium">Real-time ledger audit log</span>
            </div>

            <div className="overflow-x-auto min-h-[480px]">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                    <th className="p-3.5">Txn Ref #</th>
                    <th className="p-3.5">Date & Time</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5 text-center">Type</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs bg-white">
                  {loadingTxns ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i} className="animate-pulse h-[48px]">
                        <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                        <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                        <td className="p-3.5"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                        <td className="p-3.5 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto"></div></td>
                        <td className="p-3.5 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : currentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-slate-400 font-medium">
                        No transactions recorded for this account.
                      </td>
                    </tr>
                  ) : (
                    currentTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors h-[48px]">
                        <td className="p-3.5 font-mono font-bold text-blue-600">{txn.id}</td>
                        <td className="p-3.5 font-medium text-slate-700">{txn.dateTime}</td>
                        <td className="p-3.5 font-medium text-slate-900">{txn.description}</td>
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
                          className={`p-3.5 text-right font-mono font-bold ${
                            txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer */}
          {transactions.length > 0 && (
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{indexOfFirstTxn + 1}</span> to{' '}
                <span className="font-bold text-slate-800">
                  {Math.min(indexOfLastTxn, transactions.length)}
                </span>{' '}
                of <span className="font-bold text-slate-800">{transactions.length}</span> entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={txnPage === 1}
                  onClick={() => setTxnPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <IoChevronBack size={14} />
                  <span>Previous</span>
                </button>
                {Array.from({ length: totalTxnPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setTxnPage(pNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        txnPage === pNum
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
                  disabled={txnPage >= totalTxnPages}
                  onClick={() => setTxnPage((p) => Math.min(totalTxnPages, p + 1))}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <span>Next</span>
                  <IoChevronForward size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col Sidebar): Account Management Box */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4 font-sans">
          <h2 className="text-base font-bold text-slate-900 tracking-tight font-serif">
            Account Management
          </h2>

          <div className="space-y-2.5">
            {/* Transfer Funds Button */}
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
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

            {/* Record Adjustment Button */}
            <button
              type="button"
              onClick={() => setShowAdjustmentModal(true)}
              className="w-full flex items-center justify-between p-3.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-emerald-600 font-bold">
                  <IoWalletOutline size={18} />
                </div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  Record Adjustment
                </span>
              </div>
              <IoArrowForwardOutline size={14} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

      </div>

      {/* --- MODAL 1: EDIT ACCOUNT --- */}
      {showEditModal && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Petty Cash Account">
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Branch</label>
              <select
                value={editForm.branch}
                onChange={e => setEditForm({ ...editForm, branch: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
              >
                <option value="Kochi — Main Mandi">Kochi — Main Mandi</option>
                <option value="Kozhikode Branch">Kozhikode Branch</option>
                <option value="Trivandrum Branch">Trivandrum Branch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purpose Tag</label>
              <select
                value={editForm.purposeTag}
                onChange={e => setEditForm({ ...editForm, purposeTag: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
              >
                <option value="CASH">CASH</option>
                <option value="GENERAL">GENERAL</option>
                <option value="OPERATIONAL">OPERATIONAL</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium text-xs cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- MODAL 2: TRANSFER FUNDS --- */}
      {showTransferModal && (
        <Modal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} title="Transfer Funds from Petty Cash">
          <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destination Account</label>
              <select
                value={transferForm.targetAccount}
                onChange={e => setTransferForm({ ...transferForm, targetAccount: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
              >
                <option value="Main Cash Drawer">Main Cash Drawer</option>
                <option value="HDFC Current A/C">HDFC Current A/C</option>
                <option value="UPI Collections">UPI Collections</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transfer Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={transferForm.amount}
                onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono font-bold"
                placeholder="e.g. 2000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference / Note</label>
              <input
                type="text"
                value={transferForm.reference}
                onChange={e => setTransferForm({ ...transferForm, reference: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                placeholder="e.g. Excess cash return to main vault"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium text-xs cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs"
              >
                Execute Transfer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- MODAL 3: RECORD ADJUSTMENT --- */}
      {showAdjustmentModal && (
        <Modal isOpen={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)} title="Record Ledger Adjustment">
          <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs font-sans">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adjustment Type</label>
              <select
                value={adjustmentForm.type}
                onChange={e => setAdjustmentForm({ ...adjustmentForm, type: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
              >
                <option value="CREDIT">CREDIT (+ Add to Balance)</option>
                <option value="DEBIT">DEBIT (- Deduct from Balance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adjustment Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={adjustmentForm.amount}
                onChange={e => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono font-bold"
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason for Adjustment</label>
              <input
                type="text"
                required
                value={adjustmentForm.reason}
                onChange={e => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                placeholder="e.g. Audit reconciliation discrepancy correction"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-medium text-xs cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-xs"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default PettyCash;
