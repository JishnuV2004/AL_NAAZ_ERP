import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoTimeOutline,
  IoReceiptOutline,
  IoListOutline,
  IoEyeOutline,
  IoTrashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const initialPurchases = [
  {
    id: 'po-101',
    poNumber: 'PO-2026-0891',
    orderDate: '2026-09-24',
    supplierId: 's1',
    supplierName: 'Fresh Farms Produce Ltd',
    itemsCount: 4,
    totalAmount: 28500,
    status: 'Received',
    paymentStatus: 'Paid',
    expectedDelivery: '2026-09-25'
  },
  {
    id: 'po-102',
    poNumber: 'PO-2026-0892',
    orderDate: '2026-09-23',
    supplierId: 's2',
    supplierName: 'Gulf General Trading Co',
    itemsCount: 6,
    totalAmount: 64200,
    status: 'Pending Receiving',
    paymentStatus: 'Unpaid',
    expectedDelivery: '2026-09-26'
  },
  {
    id: 'po-103',
    poNumber: 'PO-2026-0893',
    orderDate: '2026-09-22',
    supplierId: 's3',
    supplierName: 'Prime Poultry & Meats',
    itemsCount: 3,
    totalAmount: 35000,
    status: 'Received',
    paymentStatus: 'Paid',
    expectedDelivery: '2026-09-23'
  },
  {
    id: 'po-104',
    poNumber: 'PO-2026-0894',
    orderDate: '2026-09-21',
    supplierId: 's4',
    supplierName: 'Crown Dairy Products',
    itemsCount: 5,
    totalAmount: 18200,
    status: 'Approved',
    paymentStatus: 'Unpaid',
    expectedDelivery: '2026-09-27'
  },
  {
    id: 'po-105',
    poNumber: 'PO-2026-0895',
    orderDate: '2026-09-20',
    supplierId: 's5',
    supplierName: 'Apex Packaging Solutions',
    itemsCount: 2,
    totalAmount: 12500,
    status: 'Received',
    paymentStatus: 'Partial',
    expectedDelivery: '2026-09-21'
  }
];

const defaultForm = {
  supplierName: 'Fresh Farms Produce Ltd',
  expectedDelivery: '',
  itemsSummary: 'Vegetables & Ingredients Bundle',
  totalAmount: ''
};

const Purchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState(initialPurchases);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  const filteredPurchases = purchases.filter(po => {
    const matchesSearch =
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || po.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalPOCount = purchases.length;
  const pendingCount = purchases.filter(po => po.status === 'Pending Receiving' || po.status === 'Approved').length;
  const totalSpend = purchases.reduce((sum, po) => sum + po.totalAmount, 0);
  const unpaidSpend = purchases
    .filter(po => po.paymentStatus === 'Unpaid' || po.paymentStatus === 'Partial')
    .reduce((sum, po) => sum + po.totalAmount, 0);

  const handleCreatePO = (e) => {
    e.preventDefault();
    const newPO = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-0${896 + purchases.length}`,
      orderDate: new Date().toISOString().split('T')[0],
      supplierId: 's1',
      supplierName: formData.supplierName,
      itemsCount: 4,
      totalAmount: parseFloat(formData.totalAmount) || 25000,
      status: 'Approved',
      paymentStatus: 'Unpaid',
      expectedDelivery: formData.expectedDelivery || '2026-09-28'
    };
    setPurchases(prev => [newPO, ...prev]);
    toast.success(`Purchase Order ${newPO.poNumber} created successfully!`);
    setIsModalOpen(false);
    setFormData(defaultForm);
  };

  const handleStatusChange = (id, newStatus) => {
    setPurchases(prev =>
      prev.map(po => {
        if (po.id === id) {
          return { ...po, status: newStatus };
        }
        return po;
      })
    );
    toast.success(`Order status updated to ${newStatus}`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Purchase Orders</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Purchase Orders (POs)</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Issue, approve, and track vendor procurement purchase orders and delivery status.
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
            onClick={() => navigate('/procurement/purchaseitems')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Line Items Purchased
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
            onClick={() => navigate('/inventory/stock')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Live Inventory
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> New PO
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total POs Issued</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalPOCount} Orders</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Procurement Cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Pending Delivery / Receiving</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{pendingCount} POs</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">In transit / Awaiting Goods</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoTimeOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Procurement Cost</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalSpend.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Completed & Pending</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/procurement/creditpurchases')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Unpaid Credit POs</p>
            <h3 className="text-2xl font-bold text-rose-600 tabular-nums font-mono">
              ₹{unpaidSpend.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">View Credit Invoices &rarr;</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search PO # or supplier name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Order Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Received">Received</option>
              <option value="Pending Receiving">Pending Receiving</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Payment Status:</span>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
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
                <th className="py-3.5 px-4">PO Ref & Date</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Items</th>
                <th className="py-3.5 px-4 text-right">Total Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Delivery Status</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-xs">
                    No purchase orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(po => (
                  <tr key={po.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 font-mono">{po.poNumber}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{po.orderDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-900">{po.supplierName}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-800">{po.itemsCount} SKUs</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      ₹{po.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        po.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        po.status === 'Pending Receiving' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        po.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                        po.paymentStatus === 'Unpaid' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/procurement/purchaseitems?po=${po.poNumber}`)}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                          title="View Line Items"
                        >
                          <IoListOutline size={13} /> Items
                        </button>
                        {po.status !== 'Received' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(po.id, 'Received')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Mark Goods Received"
                          >
                            Receive
                          </button>
                        )}
                        {po.paymentStatus !== 'Paid' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/procurement/supplierpayments?supplierId=${po.supplierId}`)}
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Pay PO"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Purchase Order (PO)"
      >
        <form onSubmit={handleCreatePO} className="space-y-4 font-sans text-xs">
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

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expected Delivery Date</label>
            <input
              type="date"
              required
              value={formData.expectedDelivery}
              onChange={e => setFormData({ ...formData, expectedDelivery: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Order Summary / Items Description</label>
            <input
              type="text"
              required
              value={formData.itemsSummary}
              onChange={e => setFormData({ ...formData, itemsSummary: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              placeholder="e.g. 50kg Tomatoes, 20L Oil, 10kg Onions"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estimated Total Cost (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="0.01"
              value={formData.totalAmount}
              onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer"
            >
              Issue Purchase Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;
