import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { IoAddOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', is_active: true });

  const fetchCategories = async (currentPage = page) => {
    setLoading(true);
    const data = await financeService.fetchCategories(currentPage, 10);
    if (data && data.results) {
      setCategories(data.results);
      setTotalPages(Math.ceil((data.count || 0) / 10) || 1);
      setTotalItems(data.count || 0);
    } else if (Array.isArray(data)) {
      setCategories(data);
      setTotalPages(1);
      setTotalItems(data.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories(page);
  }, [page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await financeService.updateCategory(editingCategory.id, formData);
        toast.success("Category updated");
      } else {
        await financeService.createCategory(formData);
        toast.success("Category created");
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', is_active: true });
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, is_active: cat.is_active });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await financeService.deleteCategory(id);
        toast.success("Category deleted");
        fetchCategories();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">Categories</h2>
          <p className="text-sm text-gray-500">Categories are deactivated, not deleted, once used by an expense.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-brown hover:bg-brand-gold-hover transition-colors shadow-sm cursor-pointer"
        >
          <IoAddOutline className="h-4 w-4" />
          <span>Add category</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-2">📁</span>
            <p className="font-medium text-sm">No categories found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => {
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4">
                        {cat.is_active ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-900">
                        {new Date(cat.created_at || new Date()).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2 flex justify-center">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-4 py-1.5 bg-white border border-red-300 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Pad empty rows to maintain table height */}
                {categories.length > 0 && categories.length < 10 && (
                  Array.from({ length: 10 - categories.length }).map((_, i) => (
                    <tr key={`empty-${i}`} className="h-[73px]">
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && categories.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="sr-only">Previous</span>
                    &larr;
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 cursor-pointer ${page === i + 1 ? 'z-10 bg-brand-gold text-brand-brown focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="sr-only">Next</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? "Edit Category" : "Add Category"} size="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Category Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1E5E45] outline-none"
              placeholder="e.g. Employee food"
            />
          </div>

          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-[#1E5E45] rounded border-gray-300 focus:ring-[#1E5E45]"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">Category is active</label>
          </div>

          <div className="flex justify-end pt-4 gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-brand-gold text-sm font-bold text-brand-brown hover:bg-brand-gold-hover shadow-sm cursor-pointer disabled:opacity-50 transition-colors flex justify-center min-w-[120px]"
            >
              {isSubmitting ? <ButtonLoader /> : (editingCategory ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
