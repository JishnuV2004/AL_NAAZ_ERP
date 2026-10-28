import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { financeService } from '../../services/financeService';
import {
  IoAddOutline,
  IoSearchOutline,
  IoRefreshOutline,
  IoFolderOutline,
  IoReceiptOutline,
  IoWalletOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoCloseOutline,
  IoAlertCircleOutline,
  IoLayersOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', is_active: true });
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Status Toggle Loading State
  const [togglingId, setTogglingId] = useState(null);

  const fetchCategories = async (currentPage = page, silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch categories using page & pageSize
      const data = await financeService.fetchCategories(currentPage, pageSize);
      if (data && data.results) {
        setCategories(data.results);
        setTotalCount(data.count || data.results.length);
      } else if (Array.isArray(data)) {
        setCategories(data);
        setTotalCount(data.length);
      } else {
        setCategories([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      toast.error('Failed to load categories from server.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  // Client-side filtering when searching or filtering by status
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = searchTerm.trim() === '' ||
        (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && cat.is_active) ||
        (statusFilter === 'INACTIVE' && !cat.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  // Statistics
  const totalStats = totalCount || categories.length;
  const activeStats = categories.filter(c => c.is_active).length;
  const inactiveStats = categories.filter(c => !c.is_active).length;

  // Pagination calculation matching standard project model
  const isFiltered = searchTerm.trim() !== '' || statusFilter !== 'ALL';
  const totalItems = isFiltered ? filteredCategories.length : (totalCount || categories.length);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems > 0 ? (page - 1) * pageSize : 0;
  const endItem = Math.min(startIndex + (isFiltered ? filteredCategories.length : categories.length), totalItems);

  // Number of empty filler rows needed to preserve consistent 10-row table height
  const emptyRowsCount = loading
    ? 0
    : Math.max(0, pageSize - filteredCategories.length);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', is_active: true });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name || '', is_active: cat.is_active !== undefined ? cat.is_active : true });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    try {
      if (editingCategory) {
        await financeService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          is_active: formData.is_active
        });
        toast.success(`Category "${formData.name.trim()}" updated successfully.`);
      } else {
        await financeService.createCategory({
          name: formData.name.trim(),
          is_active: formData.is_active
        });
        toast.success(`Category "${formData.name.trim()}" created successfully.`);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', is_active: true });
      fetchCategories(page, true);
    } catch (err) {
      console.error('Error saving category:', err);
      const errMsg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to save category. Please try again.';
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (cat) => {
    setTogglingId(cat.id);
    try {
      const newStatus = !cat.is_active;
      await financeService.updateCategory(cat.id, {
        name: cat.name,
        is_active: newStatus
      });
      toast.success(`Category "${cat.name}" marked as ${newStatus ? 'Active' : 'Inactive'}.`);
      setCategories(prev =>
        prev.map(item => item.id === cat.id ? { ...item, is_active: newStatus } : item)
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
      toast.error('Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Category
  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await financeService.deleteCategory(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.name}" deleted successfully.`);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories(page, true);
    } catch (err) {
      console.error('Failed to delete category:', err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Failed to delete category. If used by an existing expense, please deactivate instead.';
      toast.error(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Finance</span> &gt; <span className="text-gray-700">Categories</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Expense Categories</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage expense categories, track active classifications, and organize expenditure accounting.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchCategories(page)}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#C9A227] hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh categories from API"
          >
            <IoRefreshOutline size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/finance/expenses')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#C9A227] hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoReceiptOutline size={16} /> Expenses
          </button>
          <button
            type="button"
            onClick={() => navigate('/finance/pettycash')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-[#C9A227] hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoWalletOutline size={16} /> Petty Cash
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#C9A227] hover:bg-[#b59122] text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Categories */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoLayersOutline size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Categories</div>
            <div className="text-xl font-extrabold text-gray-900 mt-0.5">
              {loading ? <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span> : totalCount || totalStats}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">All recorded classifications</div>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Categories</div>
            <div className="text-xl font-extrabold text-gray-900 mt-0.5">
              {loading ? <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span> : activeStats}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">Available for expense logging</div>
          </div>
        </div>

        {/* Inactive Categories */}
        <div className="bg-white p-4.5 rounded-2xl border border-gray-200/90 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center shrink-0">
            <IoCloseCircleOutline size={22} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inactive Categories</div>
            <div className="text-xl font-extrabold text-gray-900 mt-0.5">
              {loading ? <span className="inline-block w-8 h-5 bg-gray-200 animate-pulse rounded"></span> : inactiveStats}
            </div>
            <div className="text-[11px] text-gray-500 font-medium">Archived / disabled from dropdowns</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category by name..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200/80 rounded-xl text-xs text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-[#C9A227] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <IoCloseOutline size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            All ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80'
            }`}
          >
            Active ({activeStats})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              statusFilter === 'INACTIVE'
                ? 'bg-gray-700 text-white shadow-2xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            Inactive ({inactiveStats})
          </button>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 font-semibold transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table - Fixed Height Container for 10 Items */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div className="overflow-x-auto min-h-[480px] w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200/90 text-[11px] font-bold text-gray-500 uppercase tracking-wider h-[46px]">
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 hidden sm:table-cell">Created Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                Array.from({ length: pageSize }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse h-[48px]">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-200"></div>
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-36 bg-gray-200 rounded"></div>
                          <div className="h-3 w-16 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      <div className="h-5.5 w-20 bg-gray-200 rounded-full mx-auto"></div>
                    </td>
                    <td className="px-5 py-2.5 hidden sm:table-cell">
                      <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="h-7 w-16 bg-gray-200 rounded-lg ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCategories.length > 0 ? (
                <>
                  {filteredCategories.map((cat) => {
                    const isToggling = togglingId === cat.id;

                    return (
                      <tr
                        key={cat.id}
                        className="hover:bg-slate-50/70 transition-colors group h-[48px]"
                      >
                        {/* Name */}
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                              cat.is_active
                                ? 'bg-amber-50 text-[#C9A227] border border-amber-200/60'
                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                            }`}>
                              {cat.name ? cat.name.charAt(0) : 'C'}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block text-xs">
                                {cat.name}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono">
                                ID: #{cat.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cat)}
                            disabled={isToggling}
                            title="Click to toggle status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                            } ${isToggling ? 'opacity-50 pointer-events-none' : ''}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cat.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            ></span>
                            <span>{cat.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Created Date */}
                        <td className="px-5 py-2.5 text-gray-600 hidden sm:table-cell font-mono text-[11px]">
                          {cat.created_at
                            ? new Date(cat.created_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '—'}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <IoPencilOutline size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(cat)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Empty filler rows to preserve exact 10-row table height */}
                  {emptyRowsCount > 0 &&
                    Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="h-[48px] border-b border-gray-100/40">
                        <td colSpan={4} className="px-5 py-2.5 text-transparent select-none">
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                </>
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                        <IoFolderOutline size={28} />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">No expense categories found</h3>
                      <p className="text-xs text-gray-500 max-w-sm mb-4">
                        {searchTerm || statusFilter !== 'ALL'
                          ? 'No categories match your search criteria. Try resetting your filter.'
                          : 'No expense categories have been created yet. Add categories to classify business expenses.'}
                      </p>
                      {searchTerm || statusFilter !== 'ALL' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                        >
                          Clear Search & Filters
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenAdd}
                          className="px-4 py-2 bg-[#C9A227] hover:bg-[#b59122] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <IoAddOutline size={16} /> Add First Category
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Standard Project Pagination Footer */}
        {!loading && filteredCategories.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium mt-auto">
            <div>
              Showing <span className="font-bold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className="font-bold text-gray-800">{endItem}</span> of{' '}
              <span className="font-bold text-gray-800">{totalItems}</span> entries
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Previous Page"
              >
                <IoChevronBackOutline size={14} />
              </button>

              {totalPages <= 7 ? (
                Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      disabled={loading}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              ) : (
                (() => {
                  let pages = [];
                  if (page <= 4) {
                    pages = [1, 2, 3, 4, 5, '...', totalPages];
                  } else if (page >= totalPages - 3) {
                    pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                  }
                  return pages.map((pageItem, idx) => {
                    if (pageItem === '...') {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={pageItem}
                        type="button"
                        disabled={loading}
                        onClick={() => setPage(pageItem)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          page === pageItem
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageItem}
                      </button>
                    );
                  });
                })()
              )}

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Next Page"
              >
                <IoChevronForwardOutline size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C9A227] flex items-center justify-center">
                  <IoFolderOutline size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {editingCategory ? 'Edit Expense Category' : 'Add New Expense Category'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {editingCategory
                      ? 'Update category name and active availability status.'
                      : 'Define a new category to organize expenses in the ledger.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                  <IoAlertCircleOutline size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Employee Food, Office Supplies, Fuel..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] rounded-xl text-xs text-gray-900 font-medium placeholder-gray-400 outline-none transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Unique descriptive name for the expense type.
                </p>
              </div>

              {/* Status Toggle */}
              <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-800 block">
                    Category is Active
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Active categories appear in expense entry dropdowns.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#C9A227]"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#C9A227] hover:bg-[#b59122] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 font-sans">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <IoTrashOutline size={22} />
            </div>

            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              Delete Category?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{categoryToDelete.name}"</span>?
              If this category is attached to previous expense records, consider deactivating it instead.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setCategoryToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
