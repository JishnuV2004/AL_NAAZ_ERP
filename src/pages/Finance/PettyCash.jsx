import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoPencilOutline,
  IoSwapHorizontalOutline,
  IoWalletOutline,
  IoDownloadOutline,
  IoArrowBackOutline,
  IoCloseOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

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
    id: 'ACC-002',
    name: 'Petty Cash',
    typeTag: 'PETTY_CASH',
    status: 'ACTIVE',
    branch: 'Kochi — Main Mandi',
    purposeTag: 'CASH',
    currentBalance: 6180,
    openingBalance: 10000
  });

  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

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
          <p className="text-[11px] text-gray-400 font-medium">Reconciled real-time balance</p>
        </div>

        {/* Card 2: Opening Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Opening Balance</p>
          <p className="text-2xl font-extrabold text-gray-900 tabular-nums font-mono">
            ₹{account.openingBalance.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">Initial ledger setup amount</p>
        </div>

        {/* Card 3: Net Movement */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Net Movement</p>
          <p className={`text-2xl font-extrabold tabular-nums font-mono ${netMovement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {netMovement >= 0 ? '+' : ''}₹{netMovement.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">Since account creation</p>
        </div>

        {/* Card 4: Account Classification */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-gray-500">Account Classification</p>
          <p className="text-lg font-bold text-gray-900 uppercase truncate">
            {account.typeTag} / {account.purposeTag}
          </p>
          <p className="text-[11px] text-gray-400 font-medium">System purpose configuration</p>
        </div>
      </div>

      {/* 3. Main 2-Column Section (Left: Transactions Table, Right: Account Management Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Recent Account Ledger Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-gray-900">Recent Account Ledger Transactions</h3>
                <p className="text-xs text-gray-500 mt-0.5">Automated debit and credit activity logged to this financial account.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/finance/financialledger')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
              >
                View Full Audit Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="py-3.5 px-4">DATE & TIME</th>
                    <th className="py-3.5 px-4">TXN ID / REF</th>
                    <th className="py-3.5 px-4">DESCRIPTION</th>
                    <th className="py-3.5 px-4">TYPE</th>
                    <th className="py-3.5 px-4 text-right">AMOUNT</th>
                    <th className="py-3.5 px-4 text-right">BALANCE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                      <td className="py-3.5 px-4 font-medium text-gray-500 font-mono whitespace-nowrap">{txn.dateTime}</td>
                      <td className="py-3.5 px-4 font-extrabold text-gray-900 font-mono">{txn.id}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">{txn.description}</td>
                      <td className="py-3.5 px-4">
                        {txn.type === 'CREDIT' ? (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                            + CREDIT
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                            - DEBIT
                          </span>
                        )}
                      </td>
                      <td className={`py-3.5 px-4 text-right font-mono font-bold tabular-nums ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-gray-900 tabular-nums">
                        ₹{txn.balance.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col Sidebar): Account Management & Audit Cards */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: Account Management (Matching Screenshot Right Side) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 font-sans">
            <h3 className="text-base font-serif font-bold text-gray-900">Account Management</h3>
            
            <div className="space-y-2.5">
              {/* Transfer Funds Button */}
              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className="w-full py-3 px-4 bg-gray-50/80 hover:bg-blue-50/60 border border-gray-200/80 hover:border-blue-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
              >
                <span className="flex items-center gap-3">
                  <IoSwapHorizontalOutline className="text-blue-600 group-hover:scale-110 transition-transform" size={18} />
                  <span>Transfer Funds</span>
                </span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              {/* Record Adjustment Button */}
              <button
                type="button"
                onClick={() => setShowAdjustmentModal(true)}
                className="w-full py-3 px-4 bg-gray-50/80 hover:bg-emerald-50/60 border border-gray-200/80 hover:border-emerald-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
              >
                <span className="flex items-center gap-3">
                  <IoWalletOutline className="text-emerald-600 group-hover:scale-110 transition-transform" size={18} />
                  <span>Record Adjustment</span>
                </span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>

              {/* Download PDF Report Button */}
              <button
                type="button"
                onClick={handleDownloadReport}
                className="w-full py-3 px-4 bg-gray-50/80 hover:bg-purple-50/60 border border-gray-200/80 hover:border-purple-200 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-between transition-all cursor-pointer shadow-2xs group"
              >
                <span className="flex items-center gap-3">
                  <IoDownloadOutline className="text-purple-600 group-hover:scale-110 transition-transform" size={18} />
                  <span>Download PDF Report</span>
                </span>
                <span className="text-gray-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Card 2: System & Audit Info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3.5 font-sans">
            <h3 className="text-base font-serif font-bold text-gray-900">System & Audit Info</h3>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Account ID</span>
                <span className="font-mono font-bold text-gray-900">{account.id}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Branch Location</span>
                <span className="font-bold text-gray-900">{account.branch}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Purpose Tag</span>
                <span className="font-bold text-gray-900">{account.purposeTag}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 font-medium">Audit Status</span>
                <span className="font-bold text-emerald-600">Reconciled & Active</span>
              </div>
            </div>
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
