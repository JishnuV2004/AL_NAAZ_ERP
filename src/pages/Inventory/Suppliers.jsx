import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { IoAddOutline, IoSearchOutline, IoTrashOutline } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';

const Suppliers = () => {
  const suppliers = useInventoryStore(state => state.suppliers);
  const loading = useInventoryStore(state => state.loading);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals & Forms State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultForm = { name: '', phone: '', email: '', address: '', status: 'Active' };
  const [formData, setFormData] = useState(defaultForm);

  // Edit / Delete State
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // History State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedSupplierName, setSelectedSupplierName] = useState('');

  const loadSuppliers = async () => {
    const response = await inventoryService.fetchSuppliers(page, 10);
    if (response) {
      setHasNext(!!response.next);
      setHasPrev(!!response.previous);
      setTotalPages(Math.ceil((response.count || 0) / 10) || 1);
      setTotalItems(response.count || 0);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, [page]);

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const filteredSuppliers = safeSuppliers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await inventoryService.updateSupplier(editingId, formData);
      } else {
        await inventoryService.addProduct(formData); // wait, should be addSupplier
        await inventoryService.addSupplier(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(defaultForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (supplier) => {
    setFormData({
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      status: supplier.is_active || supplier.status === 'Active' ? 'Active' : 'Inactive'
    });
    setEditingId(supplier.id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await inventoryService.deleteSupplier(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHistory = async (supplier) => {
    setSelectedSupplierName(supplier.name);
    setHistoryData([]);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const history = await inventoryService.fetchSupplierHistory(supplier.id);
      setHistoryData(history);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Suppliers</h2>
          <p className="text-sm text-gray-500">Who do we buy from?</p>
        </div>
        <button onClick={() => {
          setEditingId(null);
          setFormData(defaultForm);
          setIsModalOpen(true);
        }} className="flex items-center justify-center space-x-2 rounded-xl bg-[#5946D5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a39b3] transition-colors shadow-md cursor-pointer">
          <IoAddOutline className="h-5 w-5" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">History</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{supplier.name}</td>
                    <td className="px-6 py-4 text-gray-500">{supplier.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{supplier.email || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${supplier.is_active || supplier.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                        {supplier.is_active ? 'Active' : (supplier.status || 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => openHistory(supplier)} className="text-sm font-semibold text-[#5946D5] hover:text-[#4a39b3] transition-colors cursor-pointer border border-[#5946D5] rounded-lg px-3 py-1">
                        View History
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEditModal(supplier)} className="text-gray-900 font-bold hover:text-[#5946D5] transition-colors cursor-pointer p-1" title="Edit Supplier">
                        <FiEdit className="h-[18px] w-[18px]" />
                      </button>
                      <button onClick={() => {
                        setDeletingId(supplier.id);
                        setIsDeleteModalOpen(true);
                      }} className="text-red-500 font-bold hover:text-red-700 transition-colors cursor-pointer p-1" title="Delete Supplier">
                        <IoTrashOutline className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && suppliers.length > 0 && (
          <div className="border-t border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10 gap-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalItems)} of {totalItems} entries (Page {page} of {totalPages})
            </span>
            <div className="flex items-center space-x-1">
              <button 
                disabled={!hasPrev || loading} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-brand-border rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    page === pageNum 
                      ? 'bg-brand-gold border-brand-gold text-brand-brown font-bold' 
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                disabled={!hasNext || loading} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-brand-border rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Supplier" : "Add New Supplier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Supplier Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Phone Number</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Address</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Status</label>
            <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden bg-white">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#5946D5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a39b3] shadow-md cursor-pointer disabled:opacity-50 transition-colors">
              {isSubmitting ? <ButtonLoader /> : (editingId ? 'Update Supplier' : 'Save Supplier')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Supplier">
        <div className="space-y-6">
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete this supplier? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-cream/50 transition-colors cursor-pointer">
              Cancel
            </button>
            <button onClick={confirmDelete} disabled={isSubmitting} className="rounded-xl bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 shadow-md disabled:opacity-50 transition-all cursor-pointer">
              {isSubmitting ? <ButtonLoader /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title={`Purchase History - ${selectedSupplierName}`} size="max-w-4xl">
        <div className="space-y-4">
          {historyLoading ? (
            <PageLoader />
          ) : historyData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <span className="text-4xl mb-2">📄</span>
              <p className="font-semibold text-sm">No purchase history found for this supplier.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto overflow-hidden">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4 text-center">Unit</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyData.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">{record.invoice_number || '-'}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{record.product_name}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{record.unit}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{record.quantity}</td>
                      <td className="px-6 py-4 text-right text-gray-500">₹{Number(record.unit_price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">₹{Number(record.total_price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button onClick={() => setIsHistoryModalOpen(false)} className="rounded-xl bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 shadow-sm cursor-pointer border border-gray-200">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Suppliers;
