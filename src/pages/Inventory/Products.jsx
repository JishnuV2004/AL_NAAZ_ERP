import React, { useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { IoAddOutline, IoSearchOutline, IoTrashOutline } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import Modal from '../../components/common/Modal';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';

const Products = () => {
  const products = useInventoryStore(state => state.products) || [];
  const loading = useInventoryStore(state => state.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  React.useEffect(() => {
    inventoryService.fetchProducts();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const defaultForm = { name: '', category: 'Vegetables', unit: 'KG', minStock: 0, status: 'Active' };
  const [formData, setFormData] = useState(defaultForm);

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await inventoryService.updateProduct(editingId, formData);
      } else {
        await inventoryService.addProduct(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(defaultForm);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product) => {
    // Convert backend categories to proper case for the select dropdown
    const categoryMap = {
      'vegetables': 'Vegetables',
      'grains': 'Grains',
      'meat & poultry': 'Meat & Poultry',
      'cooking': 'Cooking',
      'beverages': 'Beverages',
      'other': 'Other'
    };

    setFormData({
      name: product.name || '',
      category: categoryMap[product.category?.toLowerCase()] || 'Other',
      unit: product.unit || 'KG',
      minStock: product.minimum_stock || product.minStock || 0,
      status: product.is_active || product.status === 'Active' ? 'Active' : 'Inactive'
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await inventoryService.deleteProduct(deletingId);
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm gap-4">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
            <IoSearchOutline className="h-5 w-5" />
          </div>
          <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-xl border border-brand-border bg-brand-cream/30 py-2.5 pl-11 pr-4 font-sans text-sm text-brand-text outline-hidden focus:border-brand-gold focus:ring-1 focus:ring-brand-gold" />
        </div>
        <button onClick={() => {
          setEditingId(null);
          setFormData(defaultForm);
          setIsModalOpen(true);
        }} className="flex items-center justify-center space-x-2 rounded-xl bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-brown hover:bg-brand-gold-hover transition-colors shadow-md cursor-pointer">
          <IoAddOutline className="h-5 w-5" />
          <span>Add Product</span>
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
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Unit</th>
                  <th className="px-6 py-4 text-center">Min Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">{product.unit}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{product.minimum_stock || product.minStock || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${product.is_active || product.status === 'Active' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                        {product.is_active ? 'Active' : (product.status || 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openEditModal(product)} className="text-gray-900 font-bold hover:text-[#5946D5] transition-colors cursor-pointer p-1" title="Edit Product">
                        <FiEdit className="h-[18px] w-[18px]" />
                      </button>
                      <button onClick={() => {
                        setDeletingId(product.id);
                        setIsDeleteModalOpen(true);
                      }} className="text-red-500 font-bold hover:text-red-700 transition-colors cursor-pointer p-1" title="Delete Product">
                        <IoTrashOutline className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="border-t border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10 gap-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries (Page {currentPage} of {totalPages})
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-brand-border rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${currentPage === pageNum
                      ? 'bg-brand-gold border-brand-gold text-brand-brown font-bold'
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-brand-border rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Product Name</label>
            <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Category</label>
              <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden bg-white">
                <option>Vegetables</option>
                <option>Grains</option>
                <option>Meat & Poultry</option>
                <option>Cooking</option>
                <option>Beverages</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Unit</label>
              <select required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden bg-white">
                <option>KG</option>
                <option>L</option>
                <option>Pack</option>
                <option>Piece</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Minimum Stock Alert</label>
              <input type="number" required min="0" step="0.01" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Status</label>
              <select required value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden bg-white">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#5946D5] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4a39b3] shadow-md cursor-pointer disabled:opacity-50 transition-colors">
              {isSubmitting ? <ButtonLoader /> : (editingId ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Product">
        <div className="space-y-6">
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete this product? This action cannot be undone and may affect your stock ledger.
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
    </div>
  );
};

export default Products;
