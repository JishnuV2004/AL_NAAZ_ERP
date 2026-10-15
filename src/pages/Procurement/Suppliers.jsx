import React, { useState, useEffect } from 'react';
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
  IoTrashOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline
} from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { supplierService } from '../../services/supplierService';

const defaultForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  is_active: true
};

const Suppliers = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadSuppliers = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await supplierService.fetchSuppliers(pageToLoad, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(response)) {
        list = response;
        count = response.length;
      } else if (response && Array.isArray(response.results)) {
        list = response.results;
        count = typeof response.count === 'number' ? response.count : response.results.length;
      }

      setSuppliers(list);
      setTotalCount(count);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to load suppliers from API:', err);
      toast.error('Failed to load suppliers list');
      setSuppliers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers(1);
  }, []);

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      is_active: sup.is_active !== undefined ? sup.is_active : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone ? formData.phone.trim() : '',
        email: formData.email ? formData.email.trim() : '',
        address: formData.address ? formData.address.trim() : '',
        is_active: Boolean(formData.is_active)
      };

      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier.id, payload);
        toast.success('Supplier updated successfully');
      } else {
        await supplierService.createSupplier(payload);
        toast.success('Supplier created successfully');
      }
      setIsModalOpen(false);
      loadSuppliers(page);
    } catch (err) {
      console.error('Failed to save supplier:', err);
      toast.error(editingSupplier ? 'Failed to update supplier' : 'Failed to create supplier');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (sup) => {
    setSupplierToDelete(sup);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      await supplierService.deleteSupplier(supplierToDelete.id);
      toast.success(`Supplier "${supplierToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
      loadSuppliers(page);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      toast.error('Failed to delete supplier');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Suppliers for client-side search/status filter
  const filteredSuppliers = suppliers.filter((s) => {
    const nameStr = (s.name || '').toLowerCase();
    const phoneStr = (s.phone || '').toLowerCase();
    const emailStr = (s.email || '').toLowerCase();
    const addressStr = (s.address || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      !query ||
      nameStr.includes(query) ||
      phoneStr.includes(query) ||
      emailStr.includes(query) ||
      addressStr.includes(query);

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && s.is_active) ||
      (statusFilter === 'Inactive' && !s.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCount = suppliers.filter((s) => s.is_active).length;

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
            Manage approved suppliers, contact details, and procurement vendor profiles.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Suppliers</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalCount} Vendors</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Master Procurement List</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Active Suppliers</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{activeCount} Active</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Approved Supply Chain</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoBusinessOutline size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/finance/supplierpayables')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Supplier Payables</p>
            <h3 className="text-sm font-bold text-purple-700">View Payables &rarr;</h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Outstanding Invoices</p>
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
            placeholder="Search supplier name, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Supplier Table - Fixed Height Container for 10 Items */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div className="overflow-x-auto min-h-[480px] w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Supplier Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs bg-white">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[54px]">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xs shrink-0">
                          {sup.name ? sup.name.charAt(0).toUpperCase() : 'S'}
                        </span>
                        <span>{sup.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {sup.phone ? (
                        <div className="flex items-center gap-1.5">
                          <IoCallOutline className="text-gray-400 shrink-0" size={14} />
                          <span>{sup.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No phone</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {sup.email ? (
                        <div className="flex items-center gap-1.5">
                          <IoMailOutline className="text-gray-400 shrink-0" size={14} />
                          <span className="truncate max-w-[200px]">{sup.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No email</span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">
                      {sup.address ? (
                        <div className="flex items-center gap-1.5">
                          <IoLocationOutline className="text-gray-400 shrink-0" size={14} />
                          <span className="truncate max-w-[240px]">{sup.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No address</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full ${
                        sup.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {sup.is_active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        <span>{sup.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
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
                          onClick={() => handleOpenDelete(sup)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Supplier"
                        >
                          <IoTrashOutline size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    No suppliers found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {(() => {
          const totalItems = totalCount || suppliers.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
          const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
          const endItem = Math.min(page * pageSize, totalItems);

          return (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
              <div>
                Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                <span className="font-bold text-gray-800">{totalItems}</span> suppliers
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={page === 1 || loading}
                  onClick={() => loadSuppliers(page - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <IoChevronBackOutline size={14} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      disabled={loading}
                      onClick={() => loadSuppliers(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => loadSuppliers(page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <IoChevronForwardOutline size={14} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
              placeholder="e.g. ABC Traders"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
                placeholder="e.g. 1235678"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
                placeholder="e.g. abc@gmail.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
            <textarea
              rows="2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
              placeholder="e.g. abc bhavan kayamkulam"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Active Status</label>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {formData.is_active ? 'Supplier is active and available' : 'Supplier is inactive / suspended'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  formData.is_active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : editingSupplier ? 'Save Changes' : 'Create Supplier'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Supplier Deletion"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-gray-600 font-medium">
            Are you sure you want to delete the supplier <span className="font-bold text-gray-900">"{supplierToDelete?.name}"</span>?
          </p>
          <p className="text-gray-400 text-[11px]">
            This action will remove the supplier record from the system.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer shadow-xs"
            >
              {isDeleting ? 'Deleting...' : 'Delete Supplier'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
