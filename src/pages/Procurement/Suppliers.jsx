import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoBusinessOutline,
  IoWalletOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoReceiptOutline,
  IoDocumentTextOutline,
  IoTrashOutline
} from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const initialSuppliers = [
  {
    id: 's1',
    code: 'SUP-001',
    name: 'Fresh Farms Produce Ltd',
    contactPerson: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'orders@freshfarms.in',
    category: 'Fresh Vegetables & Fruits',
    paymentTerms: 'NET 30',
    balance: 45000,
    status: 'Active',
    rating: 4.8
  },
  {
    id: 's2',
    code: 'SUP-002',
    name: 'Gulf General Trading Co',
    contactPerson: 'Mohammed Al-Hashimi',
    phone: '+91 98123 45678',
    email: 'sales@gulfgeneral.com',
    category: 'Grains & Spices',
    paymentTerms: 'NET 15',
    balance: 128500,
    status: 'Active',
    rating: 4.6
  },
  {
    id: 's3',
    code: 'SUP-003',
    name: 'Prime Poultry & Meats',
    contactPerson: 'Vikram Singh',
    phone: '+91 97654 32109',
    email: 'supply@primepoultry.co',
    category: 'Meat & Seafood',
    paymentTerms: 'Cash on Delivery',
    balance: 0,
    status: 'Active',
    rating: 4.9
  },
  {
    id: 's4',
    code: 'SUP-004',
    name: 'Crown Dairy Products',
    contactPerson: 'Anjali Verma',
    phone: '+91 99887 76655',
    email: 'info@crowndairy.in',
    category: 'Dairy & Beverages',
    paymentTerms: 'NET 30',
    balance: 32000,
    status: 'Active',
    rating: 4.5
  },
  {
    id: 's5',
    code: 'SUP-005',
    name: 'Apex Packaging Solutions',
    contactPerson: 'Sanjay Gupta',
    phone: '+91 95432 10987',
    email: 'orders@apexpack.com',
    category: 'Packaging & Disposables',
    paymentTerms: 'NET 45',
    balance: 18500,
    status: 'Active',
    rating: 4.2
  },
  {
    id: 's6',
    code: 'SUP-006',
    name: 'Al-Madina Spice Imports',
    contactPerson: 'Tariq Mansoor',
    phone: '+91 91234 56789',
    email: 'tariq@almadina.com',
    category: 'Grains & Spices',
    paymentTerms: 'NET 15',
    balance: 0,
    status: 'Inactive',
    rating: 3.9
  }
];

const defaultForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  category: 'Fresh Vegetables & Fruits',
  paymentTerms: 'NET 30',
  status: 'Active'
};

const Suppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTerms, setSelectedTerms] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesTerms = selectedTerms === 'All' || s.paymentTerms === selectedTerms;
    return matchesSearch && matchesCategory && matchesTerms;
  });

  const totalActive = suppliers.filter(s => s.status === 'Active').length;
  const totalBalance = suppliers.reduce((sum, s) => sum + s.balance, 0);
  const suppliersWithBalance = suppliers.filter(s => s.balance > 0).length;

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email,
      category: sup.category,
      paymentTerms: sup.paymentTerms,
      status: sup.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...formData } : s));
      toast.success('Supplier updated successfully');
    } else {
      const newSup = {
        id: `s${Date.now()}`,
        code: `SUP-00${suppliers.length + 1}`,
        ...formData,
        balance: 0,
        rating: 5.0
      };
      setSuppliers(prev => [newSup, ...prev]);
      toast.success('New supplier added successfully');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast.success('Supplier deleted');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Module Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Suppliers Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Vendor & Supplier Master</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage approved suppliers, payment terms, and outstanding vendor liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Purchase Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/creditpurchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Credit Purchases
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierpayments')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Payments Made
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
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> Add Supplier
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Active Vendors</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalActive} Vendors</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Approved Supply Chain</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoBusinessOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Outstanding Payables</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalBalance.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">{suppliersWithBalance} Suppliers to pay</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Suppliers Registered</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{suppliers.length} Master Vendors</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Active & Inactive</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/procurement/supplierpayments')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Quick Pay Vendor</p>
            <h3 className="text-sm font-bold text-purple-700">Record Clearance</h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Settle Credit Invoices &rarr;</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search code, supplier name, contact..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Fresh Vegetables & Fruits">Fresh Vegetables & Fruits</option>
              <option value="Grains & Spices">Grains & Spices</option>
              <option value="Meat & Seafood">Meat & Seafood</option>
              <option value="Dairy & Beverages">Dairy & Beverages</option>
              <option value="Packaging & Disposables">Packaging & Disposables</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Payment Terms:</span>
            <select
              value={selectedTerms}
              onChange={e => setSelectedTerms(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Terms</option>
              <option value="NET 30">NET 30</option>
              <option value="NET 15">NET 15</option>
              <option value="NET 45">NET 45</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
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
                <th className="py-3.5 px-4">Code & Supplier</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Terms</th>
                <th className="py-3.5 px-4 text-right">Outstanding (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-xs">
                    No suppliers found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(sup => (
                  <tr key={sup.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{sup.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{sup.code}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-gray-800">{sup.contactPerson}</div>
                      <div className="text-[11px] text-gray-400">{sup.phone} • {sup.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-600">{sup.category}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-semibold">
                        {sup.paymentTerms}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={sup.balance > 0 ? 'text-rose-600' : 'text-gray-400'}>
                        ₹{sup.balance.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sup.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sup.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/procurement/supplierledger?supplierId=${sup.id}`)}
                          className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                          title="View Ledger Statement"
                        >
                          Ledger
                        </button>
                        {sup.balance > 0 && (
                          <button
                            type="button"
                            onClick={() => navigate(`/procurement/supplierpayments?supplierId=${sup.id}`)}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Pay Supplier"
                          >
                            Pay
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sup)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Supplier"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sup.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Supplier"
                        >
                          <IoTrashOutline size={15} />
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

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Details' : 'Add New Approved Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier Company Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              placeholder="e.g. Fresh Farms Produce Ltd"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                placeholder="Manager Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              placeholder="orders@supplier.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supply Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              >
                <option value="Fresh Vegetables & Fruits">Fresh Vegetables & Fruits</option>
                <option value="Grains & Spices">Grains & Spices</option>
                <option value="Meat & Seafood">Meat & Seafood</option>
                <option value="Dairy & Beverages">Dairy & Beverages</option>
                <option value="Packaging & Disposables">Packaging & Disposables</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              >
                <option value="NET 30">NET 30 (30 Days Credit)</option>
                <option value="NET 15">NET 15 (15 Days Credit)</option>
                <option value="NET 45">NET 45 (45 Days Credit)</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vendor Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
            >
              <option value="Active">Active Approved Vendor</option>
              <option value="Inactive">Inactive / Suspended</option>
            </select>
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
              {editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
