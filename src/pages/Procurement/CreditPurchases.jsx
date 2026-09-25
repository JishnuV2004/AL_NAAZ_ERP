import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoReceiptOutline,
  IoWalletOutline,

  IoCheckmarkCircleOutline,
  IoCalendarOutline,
  IoArrowForwardOutline,
  IoWarningOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const initialInvoices = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-401',
    poNumber: 'PO-2026-0891',
    supplierId: 's1',
    supplierName: 'Fresh Farms Produce Ltd',
    invoiceDate: '2026-08-25',
    dueDate: '2026-09-24',
    totalAmount: 45000,
    paidAmount: 0,
    balance: 45000,
    status: 'Overdue'
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-402',
    poNumber: 'PO-2026-0892',
    supplierId: 's2',
    supplierName: 'Gulf General Trading Co',
    invoiceDate: '2026-09-10',
    dueDate: '2026-09-25',
    totalAmount: 128500,
    paidAmount: 0,
    balance: 128500,
    status: 'Due Today'
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-403',
    poNumber: 'PO-2026-0894',
    supplierId: 's4',
    supplierName: 'Crown Dairy Products',
    invoiceDate: '2026-09-15',
    dueDate: '2026-10-15',
    totalAmount: 32000,
    paidAmount: 0,
    balance: 32000,
    status: 'Current'
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-404',
    poNumber: 'PO-2026-0895',
    supplierId: 's5',
    supplierName: 'Apex Packaging Solutions',
    invoiceDate: '2026-09-01',
    dueDate: '2026-10-15',
    totalAmount: 18500,
    paidAmount: 5000,
    balance: 13500,
    status: 'Partial'
  }
];

const defaultForm = {
  invoiceNumber: '',
  poNumber: 'PO-2026-0896',
  supplierName: 'Fresh Farms Produce Ltd',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  totalAmount: ''
};

const CreditPurchases = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const totalBalance = invoices.reduce((sum, i) => sum + i.balance, 0);
  const overdueBalance = invoices
    .filter(i => i.status === 'Overdue' || i.status === 'Due Today')
    .reduce((sum, i) => sum + i.balance, 0);

  const handleAddInvoice = (e) => {
    e.preventDefault();
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: formData.invoiceNumber || `INV-2026-${500 + invoices.length}`,
      poNumber: formData.poNumber,
      supplierId: 's1',
      supplierName: formData.supplierName,
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate || '2026-10-25',
      totalAmount: parseFloat(formData.totalAmount) || 25000,
      paidAmount: 0,
      balance: parseFloat(formData.totalAmount) || 25000,
      status: 'Current'
    };
    setInvoices(prev => [newInv, ...prev]);
    toast.success(`Credit Invoice ${newInv.invoiceNumber} logged!`);
    setIsModalOpen(false);
    setFormData(defaultForm);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Credit Purchases</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Credit Invoices & Payables</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage vendor credit purchases, credit period aging, and upcoming payable due dates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers
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
            onClick={() => navigate('/procurement/supplierpayments')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Payments
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierledger')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Ledger
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> Log Credit Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Active Credit Invoices</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalInvoices} Invoices</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Pending Clearance</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Outstanding Credit</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Total Liability</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Overdue / Immediate Due</p>
            <h3 className="text-2xl font-bold text-rose-600 tabular-nums font-mono">
              ₹{overdueBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Action Needed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search invoice #, PO #, supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Aging Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Current">Current (Within Term)</option>
              <option value="Due Today">Due Today</option>
              <option value="Overdue">Overdue</option>
              <option value="Partial">Partial Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice # & PO</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Invoice Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Invoice Amount (₹)</th>
                <th className="py-3.5 px-4 text-right">Balance Due (₹)</th>
                <th className="py-3.5 px-4 text-center">Aging Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-400 text-xs">
                    No credit invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 font-mono">{inv.invoiceNumber}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{inv.poNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{inv.supplierName}</td>
                    <td className="py-3.5 px-4 text-gray-600">{inv.invoiceDate}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600">
                      ₹{inv.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'Current' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        inv.status === 'Due Today' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/procurement/supplierpayments?supplierId=${inv.supplierId}`)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Settle Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Credit Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Vendor Credit Invoice"
      >
        <form onSubmit={handleAddInvoice} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Invoice Number</label>
            <input
              type="text"
              required
              value={formData.invoiceNumber}
              onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
              placeholder="e.g. INV-2026-405"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">PO Reference</label>
              <input
                type="text"
                required
                value={formData.poNumber}
                onChange={e => setFormData({ ...formData, poNumber: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier</label>
              <select
                value={formData.supplierName}
                onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              >
                <option value="Fresh Farms Produce Ltd">Fresh Farms Produce Ltd</option>
                <option value="Gulf General Trading Co">Gulf General Trading Co</option>
                <option value="Crown Dairy Products">Crown Dairy Products</option>
                <option value="Apex Packaging Solutions">Apex Packaging Solutions</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={formData.invoiceDate}
                onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Due Date</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Credit Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={formData.totalAmount}
              onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
              placeholder="e.g. 45000"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer"
            >
              Save Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CreditPurchases;
