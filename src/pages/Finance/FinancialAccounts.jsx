import React, { useState } from 'react';
import {
  IoAddOutline,
  IoChevronDownOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoWalletOutline,
  IoCardOutline,
  IoBusinessOutline,
  IoQrCodeOutline
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
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans">
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

const FinancialAccounts = () => {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [branchFilter, setBranchFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [purposeFilter, setPurposeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    branch: 'Kochi — Main Mandi',
    type: 'CASH',
    purpose: 'CASH',
    openingBalance: ''
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

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newAccount.name.trim()) {
      toast.error('Please enter account name');
      return;
    }

    const openBal = parseFloat(newAccount.openingBalance) || 0;
    const newAcc = {
      id: accounts.length + 1,
      name: newAccount.name,
      branch: newAccount.branch,
      type: newAccount.type,
      purpose: newAccount.purpose,
      openingBalance: openBal,
      currentBalance: openBal,
      status: 'ACTIVE'
    };

    setAccounts([...accounts, newAcc]);
    setShowCreateModal(false);
    toast.success(`Financial Account '${newAccount.name}' created successfully!`);
    setNewAccount({
      name: '',
      branch: 'Kochi — Main Mandi',
      type: 'CASH',
      purpose: 'CASH',
      openingBalance: ''
    });
  };

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
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <IoAddOutline size={16} />
          <span>+ Create Account</span>
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
                    <td className="py-3.5 px-4 font-bold text-gray-900">{acc.name}</td>

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
                        onClick={() => setViewingAccount(acc)}
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Create Financial Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g. Petty Cash Kochi"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
                <CustomSelect
                  value={newAccount.branch}
                  onChange={(val) => setNewAccount({ ...newAccount, branch: val })}
                  options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Account Type</label>
                  <CustomSelect
                    value={newAccount.type}
                    onChange={(val) => setNewAccount({ ...newAccount, type: val })}
                    options={['CASH', 'PETTY_CASH', 'UPI', 'BANK', 'RECEIVABLE']}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Purpose</label>
                  <CustomSelect
                    value={newAccount.purpose}
                    onChange={(val) => setNewAccount({ ...newAccount, purpose: val })}
                    options={['CASH', 'UPI', 'GENERAL', 'CARD_RECEIVABLE', 'FOOD_DELIVERY_RECEIVABLE']}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Opening Balance (₹)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newAccount.openingBalance}
                  onChange={(e) => setNewAccount({ ...newAccount, openingBalance: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Account Drawer / Modal */}
      {viewingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">{viewingAccount.name}</h3>
                <p className="text-xs text-gray-500">{viewingAccount.branch}</p>
              </div>
              <button onClick={() => setViewingAccount(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-800 font-semibold">Current Available Balance</p>
                  <p className="text-xl font-extrabold text-emerald-900 tabular-nums">
                    ₹{viewingAccount.currentBalance.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  {viewingAccount.status}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Account Type:</span>
                  <span className="font-bold">{viewingAccount.type}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Purpose Tag:</span>
                  <span className="font-bold">{viewingAccount.purpose}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Opening Balance:</span>
                  <span className="font-bold">₹{viewingAccount.openingBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-700">
                  <span>Assigned Branch:</span>
                  <span className="font-bold">{viewingAccount.branch}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingAccount(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAccounts;
