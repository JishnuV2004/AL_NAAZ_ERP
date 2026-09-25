import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoReceiptOutline,
  IoCheckmarkCircleOutline,
  IoWalletOutline,
  IoCardOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoArrowForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const initialPayments = [
  {
    id: 'pay-101',
    refNumber: 'PAY-2026-901',
    paymentDate: '2026-09-24',
    supplierId: 's3',
    supplierName: 'Prime Poultry & Meats',
    poRef: 'PO-2026-0893',
    paymentMethod: 'Bank Transfer (NEFT)',
    transactionRef: 'NEFT982341203',
    amount: 35000,
    status: 'Completed'
  },
  {
    id: 'pay-102',
    refNumber: 'PAY-2026-902',
    paymentDate: '2026-09-20',
    supplierId: 's1',
    supplierName: 'Fresh Farms Produce Ltd',
    poRef: 'INV-2026-398',
    paymentMethod: 'UPI / Corporate Wallet',
    transactionRef: 'UPI2026092019',
    amount: 25000,
    status: 'Completed'
  },
  {
    id: 'pay-103',
    refNumber: 'PAY-2026-903',
    paymentDate: '2026-09-18',
    supplierId: 's5',
    supplierName: 'Apex Packaging Solutions',
    poRef: 'INV-2026-404',
    paymentMethod: 'Cheque',
    transactionRef: 'CHQ-550123',
    amount: 5000,
    status: 'Completed'
  },
  {
    id: 'pay-104',
    refNumber: 'PAY-2026-904',
    paymentDate: '2026-09-15',
    supplierId: 's2',
    supplierName: 'Gulf General Trading Co',
    poRef: 'INV-2026-390',
    paymentMethod: 'Bank Transfer (RTGS)',
    transactionRef: 'RTGS2026091588',
    amount: 75000,
    status: 'Completed'
  }
];

const defaultForm = {
  supplierName: 'Fresh Farms Produce Ltd',
  poRef: 'INV-2026-401',
  paymentMethod: 'Bank Transfer (NEFT)',
  transactionRef: '',
  amount: '',
  paymentDate: new Date().toISOString().split('T')[0]
};

const SupplierPayments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedSupplier = searchParams.get('supplierId') || '';

  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState(preselectedSupplier);
  const [methodFilter, setMethodFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const filteredPayments = payments.filter(pay => {
    const matchesSearch =
      pay.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.poRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'All' || pay.paymentMethod.includes(methodFilter);
    return matchesSearch && matchesMethod;
  });

  const totalPaymentsCount = payments.length;
  const totalAmountCleared = payments.reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const newPayment = {
      id: `pay-${Date.now()}`,
      refNumber: `PAY-2026-${905 + payments.length}`,
      paymentDate: formData.paymentDate,
      supplierId: 's1',
      supplierName: formData.supplierName,
      poRef: formData.poRef || 'INV-2026-GEN',
      paymentMethod: formData.paymentMethod,
      transactionRef: formData.transactionRef || `TXN-${Math.floor(Math.random() * 900000 + 100000)}`,
      amount: parseFloat(formData.amount) || 10000,
      status: 'Completed'
    };
    setPayments(prev => [newPayment, ...prev]);
    toast.success(`Payment ${newPayment.refNumber} recorded & balance updated!`);
    setIsModalOpen(false);
    setFormData(defaultForm);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Supplier Payments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Payments Made to Vendors</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Record bank transfers, cheques, and cash disbursements against supplier credit invoices.
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
            onClick={() => navigate('/procurement/creditpurchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Credit Invoices
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
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Payments Executed</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalPaymentsCount} Payments</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Settled Transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Funds Disbursed</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalAmountCleared.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Vendor Account Settlements</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/procurement/supplierledger')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Audit Supplier Statement</p>
            <h3 className="text-sm font-bold text-purple-700">Open Vendor Ledger</h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Complete Debit/Credit History &rarr;</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search payment ref, supplier, transaction ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Payment Method:</span>
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Methods</option>
              <option value="Bank">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI / Digital</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
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
                <th className="py-3.5 px-4">Payment Ref & Date</th>
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Invoice / PO Ref</th>
                <th className="py-3.5 px-4">Payment Mode & Txn ID</th>
                <th className="py-3.5 px-4 text-right">Amount Paid (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-xs">
                    No supplier payment records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 font-mono">{pay.refNumber}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{pay.paymentDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{pay.supplierName}</td>
                    <td className="py-3.5 px-4 font-mono text-blue-600 font-semibold">{pay.poRef}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{pay.paymentMethod}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{pay.transactionRef}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/procurement/supplierledger?supplierId=${pay.supplierId}`)}
                          className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Ledger
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

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Supplier Payment Clearance"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Supplier</label>
            <select
              value={formData.supplierName}
              onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
            >
              <option value="Fresh Farms Produce Ltd">Fresh Farms Produce Ltd</option>
              <option value="Gulf General Trading Co">Gulf General Trading Co</option>
              <option value="Prime Poultry & Meats">Prime Poultry & Meats</option>
              <option value="Crown Dairy Products">Crown Dairy Products</option>
              <option value="Apex Packaging Solutions">Apex Packaging Solutions</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Invoice / PO Ref</label>
              <input
                type="text"
                required
                value={formData.poRef}
                onChange={e => setFormData({ ...formData, poRef: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
                placeholder="INV-2026-401"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              >
                <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT)</option>
                <option value="Bank Transfer (RTGS)">Bank Transfer (RTGS)</option>
                <option value="UPI / Corporate Wallet">UPI / Corporate Wallet</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Transaction Ref / Cheque #</label>
              <input
                type="text"
                required
                value={formData.transactionRef}
                onChange={e => setFormData({ ...formData, transactionRef: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
                placeholder="e.g. TXN-998877"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={formData.paymentDate}
                onChange={e => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Amount Paid (₹)</label>
            <input
              type="number"
              required
              min="1"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
              placeholder="e.g. 25000"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer"
            >
              Execute Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupplierPayments;
