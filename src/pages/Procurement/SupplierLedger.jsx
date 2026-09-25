import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoSearchOutline,
  IoDownloadOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoBusinessOutline,
  IoFilterOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const initialLedgerEntries = [
  {
    id: 'led-1',
    date: '2026-08-01',
    txnRef: 'OPB-2026-001',
    supplierId: 's1',
    supplierName: 'Fresh Farms Produce Ltd',
    type: 'Opening Balance',
    description: 'Brought forward liability balance',
    debit: 20000,
    credit: 0,
    runningBalance: 20000
  },
  {
    id: 'led-2',
    date: '2026-08-15',
    txnRef: 'INV-2026-380',
    supplierId: 's1',
    supplierName: 'Fresh Farms Produce Ltd',
    type: 'Purchase Invoice',
    description: 'Bulk Vegetables PO-2026-0810',
    debit: 50000,
    credit: 0,
    runningBalance: 70000
  },
  {
    id: 'led-3',
    date: '2026-08-28',
    txnRef: 'PAY-2026-850',
    supplierId: 's1',
    supplierName: 'Fresh Farms Produce Ltd',
    type: 'Vendor Payment',
    description: 'NEFT Bank Transfer Clearing',
    debit: 0,
    credit: 25000,
    runningBalance: 45000
  },
  {
    id: 'led-4',
    date: '2026-09-01',
    txnRef: 'INV-2026-390',
    supplierId: 's2',
    supplierName: 'Gulf General Trading Co',
    type: 'Purchase Invoice',
    description: 'Grains & Cooking Oil PO-2026-0850',
    debit: 203500,
    credit: 0,
    runningBalance: 203500
  },
  {
    id: 'led-5',
    date: '2026-09-15',
    txnRef: 'PAY-2026-904',
    supplierId: 's2',
    supplierName: 'Gulf General Trading Co',
    type: 'Vendor Payment',
    description: 'RTGS Settlement INV-2026-390',
    debit: 0,
    credit: 75000,
    runningBalance: 128500
  },
  {
    id: 'led-6',
    date: '2026-09-18',
    txnRef: 'INV-2026-403',
    supplierId: 's4',
    supplierName: 'Crown Dairy Products',
    type: 'Purchase Invoice',
    description: 'Dairy Milk & Yogurt Delivery',
    debit: 32000,
    credit: 0,
    runningBalance: 32000
  },
  {
    id: 'led-7',
    date: '2026-09-24',
    txnRef: 'PAY-2026-901',
    supplierId: 's3',
    supplierName: 'Prime Poultry & Meats',
    type: 'Vendor Payment',
    description: 'NEFT Full Payment PO-2026-0893',
    debit: 0,
    credit: 35000,
    runningBalance: 0
  }
];

const SupplierLedger = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterSupplierId = searchParams.get('supplierId') || 'All';

  const [selectedSupplier, setSelectedSupplier] = useState(filterSupplierId);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLedger = initialLedgerEntries.filter(entry => {
    const matchesSupplier = selectedSupplier === 'All' || entry.supplierId === selectedSupplier;
    const matchesType = typeFilter === 'All' || entry.type === typeFilter;
    const matchesSearch =
      entry.txnRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSupplier && matchesType && matchesSearch;
  });

  const totalDebit = filteredLedger.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredLedger.reduce((sum, e) => sum + e.credit, 0);
  const netClosingBalance = totalDebit - totalCredit;

  const handleExportStatement = () => {
    toast.success('Downloading Supplier Ledger Statement (PDF/Excel)...');
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Supplier Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Vendor Account Statement & Ledger</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Complete debit/credit transaction history and running account balances per supplier.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers Master
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Purchase Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/creditpurchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Credit Invoices
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierpayments')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Payments
          </button>
          <button
            type="button"
            onClick={handleExportStatement}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoDownloadOutline size={16} /> Export Statement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Purchases / Debits</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalDebit.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Billed Credit Invoices</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Payments / Credits</p>
            <h3 className="text-2xl font-bold text-emerald-600 tabular-nums font-mono">
              ₹{totalCredit.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Cleared Disbursements</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Net Closing Payable Balance</p>
            <h3 className={`text-2xl font-bold tabular-nums font-mono ${netClosingBalance > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
              ₹{Math.max(0, netClosingBalance).toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Vendor Account Balance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Supplier Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-bold text-gray-700">Select Supplier:</span>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-purple-500"
            >
              <option value="All">All Suppliers</option>
              <option value="s1">Fresh Farms Produce Ltd</option>
              <option value="s2">Gulf General Trading Co</option>
              <option value="s3">Prime Poultry & Meats</option>
              <option value="s4">Crown Dairy Products</option>
              <option value="s5">Apex Packaging Solutions</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Txn Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Transactions</option>
              <option value="Purchase Invoice">Purchase Invoice</option>
              <option value="Vendor Payment">Vendor Payment</option>
              <option value="Opening Balance">Opening Balance</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search txn ref or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Txn Ref</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4 text-right">Debit / Billed (₹)</th>
                <th className="py-3.5 px-4 text-right">Credit / Paid (₹)</th>
                <th className="py-3.5 px-4 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-xs">
                    No supplier ledger transactions found matching filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 font-mono">{entry.txnRef}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{entry.date}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{entry.supplierName}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        entry.type === 'Purchase Invoice' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        entry.type === 'Vendor Payment' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-600">{entry.description}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">
                      ₹{entry.runningBalance.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierLedger;
