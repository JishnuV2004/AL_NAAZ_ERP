import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { IoAddOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', is_active: true });

  const fetchCategories = async () => {
    setLoading(true);
    const data = await financeService.fetchCategories();
    if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-[#1E5E45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164a35] transition-colors shadow-sm cursor-pointer"
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
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => openEditModal(cat)}
                          className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1E5E45] outline-none" 
              placeholder="e.g. Employee food"
            />
          </div>
          
          <div className="flex items-center mt-2">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={formData.is_active} 
              onChange={e => setFormData({...formData, is_active: e.target.checked})} 
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
              className="px-5 py-2.5 rounded-xl bg-[#1E5E45] text-sm font-bold text-white hover:bg-[#164a35] shadow-sm cursor-pointer disabled:opacity-50 transition-colors flex justify-center min-w-[120px]"
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
