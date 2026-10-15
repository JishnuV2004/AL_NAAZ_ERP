import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoTrashOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCubeOutline
} from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { inventoryService } from '../../services/inventoryService';

const defaultForm = {
  name: '',
  category: 'Vegetables',
  unit: 'KG',
  minStock: '10.00',
  is_active: true
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProducts = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await inventoryService.fetchProducts(pageToLoad, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(response)) {
        list = response;
        count = response.length;
      } else if (response && Array.isArray(response.results)) {
        list = response.results;
        count = typeof response.count === 'number' ? response.count : response.results.length;
      }

      setProducts(list);
      setTotalCount(count);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to load products list from API:', err);
      toast.error('Failed to load products');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Vegetables',
      unit: product.unit || 'KG',
      minStock: product.minimum_stock !== undefined ? product.minimum_stock : '10.00',
      is_active: product.is_active !== undefined ? product.is_active : true
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        unit: formData.unit,
        minStock: formData.minStock,
        status: formData.is_active ? 'Active' : 'Inactive'
      };

      if (editingProduct) {
        await inventoryService.updateProduct(editingProduct.id, payload);
      } else {
        await inventoryService.addProduct(payload);
      }

      setIsModalOpen(false);
      loadProducts(page);
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await inventoryService.deleteProduct(productToDelete.id);
      setDeleteModalOpen(false);
      setProductToDelete(null);
      loadProducts(page);
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Client side filtering over loaded page results
  const filteredProducts = products.filter((p) => {
    const nameStr = (p.name || '').toLowerCase();
    const catStr = (p.category || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = !query || nameStr.includes(query) || catStr.includes(query);
    const matchesCat = categoryFilter === 'All' || catStr === categoryFilter.toLowerCase();
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && p.is_active) ||
      (statusFilter === 'Inactive' && !p.is_active);

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700 font-bold">Products Catalog</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage master product inventory items, minimum safety levels, and measurement units.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/inventory/categories')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/stock')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Live Stock
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/lowstock')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Low Stock Alerts
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search product name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Vegetable">Vegetables</option>
              <option value="Grains">Grains</option>
              <option value="Meat & Poultry">Meat & Poultry</option>
              <option value="Cooking">Cooking</option>
              <option value="Beverages">Beverages</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

      {/* Products Table - Fixed Height Container for 10 Items */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div className="overflow-x-auto min-h-[480px] w-full">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Unit</th>
                <th className="py-3.5 px-4 text-center">Minimum Stock</th>
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
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-gray-900 capitalize">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <IoCubeOutline size={15} />
                        </span>
                        <span>{product.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 font-medium text-gray-700 capitalize">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold text-[11px]">
                        {product.category || 'General'}
                      </span>
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-800">
                      {product.unit}
                    </td>

                    {/* Minimum Stock */}
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-gray-800">
                      {parseFloat(product.minimum_stock || 0).toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full ${
                        product.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}>
                        {product.is_active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        <span>{product.is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <FiEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(product)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
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
                    No products found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {(() => {
          const totalItems = totalCount || products.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
          const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
          const endItem = Math.min(page * pageSize, totalItems);

          return (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
              <div>
                Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                <span className="font-bold text-gray-800">{totalItems}</span> products
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={page === 1 || loading}
                  onClick={() => loadProducts(page - 1)}
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
                      onClick={() => loadProducts(pageNum)}
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
                  onClick={() => loadProducts(page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <IoChevronForwardOutline size={14} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product Details' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
              placeholder="e.g. Tomato"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium capitalize"
              >
                <option value="vegetable">Vegetables</option>
                <option value="grains">Grains</option>
                <option value="meat & poultry">Meat & Poultry</option>
                <option value="cooking">Cooking</option>
                <option value="beverages">Beverages</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Measurement Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
              >
                <option value="KG">KG</option>
                <option value="L">LITER (L)</option>
                <option value="Pack">Pack</option>
                <option value="Piece">Piece / PCS</option>
                <option value="BOX">BOX</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Minimum Stock Alert Threshold</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium font-mono"
              placeholder="e.g. 15.00"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase">Active Status</label>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {formData.is_active ? 'Product is active in inventory catalog' : 'Product is inactive / disabled'}
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
              {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Product Deletion"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-gray-600 font-medium">
            Are you sure you want to delete the product <span className="font-bold text-gray-900">"{productToDelete?.name}"</span>?
          </p>
          <p className="text-gray-400 text-[11px]">
            This action will remove the product record from the inventory catalog.
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
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
