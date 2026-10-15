import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoSearchOutline,
  IoFolderOutline,
  IoCubeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoArrowForwardOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoRefreshOutline,
  IoWarningOutline,
  IoFilterOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { inventoryService } from '../../services/inventoryService';

const defaultFormData = {
  name: '',
  description: '',
  is_active: true
};

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories from API: GET /api/product-categories/
  const loadCategories = async (showLoadingState = true) => {
    if (showLoadingState) setLoading(true);
    try {
      const data = await inventoryService.fetchProductCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories from server.');
      setCategories([]);
    } finally {
      if (showLoadingState) setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Format ISO timestamps nicely
  const formatDate = (isoString) => {
    if (!isoString) return '-';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  // Filter categories by search and status
  const filteredCategories = categories.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      String(c.id).includes(q);

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Active'
        ? c.is_active === true
        : c.is_active === false;

    return matchesSearch && matchesStatus;
  });

  // Reset to first page when search or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const indexOfLast = validPage * pageSize;
  const indexOfFirst = (validPage - 1) * pageSize;
  const currentCategories = filteredCategories.slice(indexOfFirst, indexOfLast);
  const emptyRowsCount = loading ? 0 : Math.max(0, pageSize - currentCategories.length);

  // Calculate statistics
  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.is_active).length;
  const inactiveCount = categories.filter((c) => !c.is_active).length;

  // Open modal to add category
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  // Open modal to edit category
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      is_active: cat.is_active !== undefined ? Boolean(cat.is_active) : true
    });
    setIsModalOpen(true);
  };

  // Submit Add or Edit: POST /product-categories/ or PATCH /product-categories/:id/
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      description: formData.description ? formData.description.trim() : '',
      is_active: Boolean(formData.is_active)
    };

    try {
      if (editingCategory) {
        // PATCH /api/product-categories/:id/
        const updated = await inventoryService.updateProductCategory(editingCategory.id, payload);
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...updated } : c))
        );
        toast.success(`Category "${updated.name || payload.name}" updated successfully!`);
      } else {
        // POST /api/product-categories/
        const created = await inventoryService.createProductCategory(payload);
        setCategories((prev) => [created, ...prev]);
        toast.success(`Category "${created.name || payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving category:', err);
      const errMsg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to save category. Please try again.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation
  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  // Confirm delete: DELETE /api/product-categories/:id/
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await inventoryService.deleteProductCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      toast.success(`Category "${categoryToDelete.name}" removed successfully.`);
      setDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to delete category:', err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete category.';
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700">Categories</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Product Categories</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Organize inventory items into categories, manage active status, and maintain product classifications.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadCategories(true)}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh categories from API"
          >
            <IoRefreshOutline size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/products')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCubeOutline size={16} /> Products Catalog
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/stock')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoFolderOutline size={16} /> Live Stock
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Categories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Categories</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
              {loading ? '-' : totalCount}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Classification Records</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoFolderOutline size={24} />
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Active Categories</p>
            <h3 className="text-2xl font-bold text-emerald-600 tabular-nums">
              {loading ? '-' : activeCount}
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Available in Inventory</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        {/* Inactive Categories */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Inactive Categories</p>
            <h3 className="text-2xl font-bold text-amber-600 tabular-nums">
              {loading ? '-' : inactiveCount}
            </h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Archived / Disabled</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoCloseCircleOutline size={24} />
          </div>
        </div>

        {/* Quick Link to Products Catalog */}
        <div
          onClick={() => navigate('/inventory/products')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all group"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Products Catalog</p>
            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Browse Products <IoArrowForwardOutline size={14} />
            </h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Manage Item Details</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoCubeOutline size={24} />
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search category by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold shrink-0">
              <IoFilterOutline size={15} /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Status ({totalCount})</option>
              <option value="Active">Active ({activeCount})</option>
              <option value="Inactive">Inactive ({inactiveCount})</option>
            </select>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-6 w-20">ID</th>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Created At</th>
                <th className="p-3.5 text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                Array.from({ length: pageSize }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse h-[57px]">
                    <td className="p-3.5 pl-6">
                      <div className="h-4 w-8 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-4 w-36 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="h-5 w-16 bg-gray-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="p-3.5 pr-6 text-center">
                      <div className="h-7 w-20 bg-gray-200 rounded-lg mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCategories.length > 0 ? (
                <>
                  {currentCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors h-[57px]">
                      {/* ID */}
                      <td className="p-3.5 pl-6 font-mono font-bold text-gray-500 whitespace-nowrap">
                        #{cat.id}
                      </td>

                      {/* Category Name */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {cat.name ? cat.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span className="font-bold text-gray-900 text-sm">
                            {cat.name}
                          </span>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="p-3.5 text-gray-500 max-w-[280px] truncate" title={cat.description || ''}>
                        {cat.description && cat.description.trim() !== '' ? (
                          cat.description
                        ) : (
                          <span className="text-gray-400 italic">No description</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        {cat.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="p-3.5 text-center font-mono text-gray-600 whitespace-nowrap">
                        {formatDate(cat.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate('/inventory/products')}
                            className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="View Products in Catalog"
                          >
                            <IoCubeOutline size={14} /> Products
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <IoCreateOutline size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(cat)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <IoTrashOutline size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[57px] border-b border-gray-100/40">
                      <td colSpan={6}>&nbsp;</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">
                    <IoFolderOutline size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-gray-700 text-sm">No categories found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {searchTerm
                        ? `No category matches "${searchTerm}".`
                        : 'Click "Add Category" to create your first product category.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 bg-white">
          <div>
            Showing <span className="font-bold text-gray-900">{filteredCategories.length > 0 ? indexOfFirst + 1 : 0}</span> to{' '}
            <span className="font-bold text-gray-900">{Math.min(indexOfLast, filteredCategories.length)}</span> of{' '}
            <span className="font-bold text-gray-900">{filteredCategories.length}</span> categories
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={validPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <IoChevronBackOutline size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                    validPage === pageNum
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
              disabled={validPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <IoChevronForwardOutline size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Add / Edit Category */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingCategory ? 'Edit Product Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g., Masala, Meat & Poultry, Oils..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of items in this category..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <label className="block text-xs font-bold text-gray-800">Category Active Status</label>
              <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                {formData.is_active
                  ? 'Active in products catalog and inventory stock'
                  : 'Inactive / disabled in product selection'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={formData.is_active}
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative inline-flex h-6 w-11 p-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none focus:outline-none focus:ring-0 ${
                  formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.is_active ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold select-none min-w-[42px] ${
                  formData.is_active ? 'text-emerald-700' : 'text-gray-500'
                }`}
              >
                {formData.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{editingCategory ? 'Saving Changes...' : 'Creating Category...'}</span>
                </>
              ) : (
                <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Confirm Category Deletion"
      >
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
            <IoWarningOutline size={20} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">Are you sure you want to delete this category?</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Category: <span className="font-bold">"{categoryToDelete?.name}"</span> (#{categoryToDelete?.id})
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-[11px]">
            This action will permanently delete the category from the database. Any products linked to this category may lose their categorization.
          </p>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-xs cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-white shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Category</span>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Categories;
