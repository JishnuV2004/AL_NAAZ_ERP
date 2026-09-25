import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoSearchOutline,
  IoFolderOutline,
  IoCubeOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoArrowForwardOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoTrashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const initialCategories = [
  {
    id: 1,
    name: 'Vegetables & Fresh Produce',
    code: 'CAT-VEG',
    productCount: 24,
    reorderAlerts: 3,
    totalValue: '₹ 1,45,000',
    description: 'Fresh vegetables, herbs, onions, tomatoes, and kitchen produce',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Meat & Poultry',
    code: 'CAT-MEAT',
    productCount: 12,
    reorderAlerts: 2,
    totalValue: '₹ 4,20,000',
    description: 'Mutton, chicken, Mandi meat cuts, and fresh livestock stock',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Rice, Grains & Pulses',
    code: 'CAT-[#03]',
    productCount: 18,
    reorderAlerts: 1,
    totalValue: '₹ 8,75,000',
    description: 'Basmati rice, Mandi rice stock, lentils, and dry grains',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Cooking Oils & Spices',
    code: 'CAT-OIL',
    productCount: 30,
    reorderAlerts: 0,
    totalValue: '₹ 3,10,000',
    description: 'Sunflower oil, ghee, Mandi special spices, and seasonings',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Beverages & Dairy',
    code: 'CAT-BEV',
    productCount: 15,
    reorderAlerts: 4,
    totalValue: '₹ 1,25,000',
    description: 'Soft drinks, mineral water, milk, curd, and laban',
    status: 'Active'
  }
];

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active'
  });

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalCategories: categories.length,
    totalProducts: categories.reduce((sum, c) => sum + c.productCount, 0),
    lowStockAlerts: categories.reduce((sum, c) => sum + c.reorderAlerts, 0),
    activeCount: categories.filter((c) => c.status === 'Active').length
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', code: `CAT-0${categories.length + 1}`, description: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      code: cat.code,
      description: cat.description,
      status: cat.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    if (editingId) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
      );
      toast.success('Category updated successfully!');
    } else {
      const newCat = {
        id: Date.now(),
        name: formData.name,
        code: formData.code || `CAT-${Math.floor(100 + Math.random() * 900)}`,
        productCount: 0,
        reorderAlerts: 0,
        totalValue: '₹ 0.00',
        description: formData.description || 'General category item',
        status: formData.status
      };
      setCategories([newCat, ...categories]);
      toast.success('New category added successfully!');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success('Category removed.');
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
            Organize inventory items into categories, track stock distribution, and manage safety reorder limits.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.totalCategories}</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">{stats.activeCount} Active Status</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoFolderOutline size={24} />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Cataloged Products</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.totalProducts} Items</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Across All Categories</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCubeOutline size={24} />
          </div>
        </div>

        {/* Reorder Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Reorder Alerts</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.lowStockAlerts} Alerts</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Requires Stock Purchase</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        {/* Quick Link to Low Stock */}
        <div
          onClick={() => navigate('/inventory/lowstock')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Low Stock Dashboard</p>
            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-1">
              View Alerts <IoArrowForwardOutline size={14} />
            </h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Safety Threshold Audit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Search Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative max-w-md">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search category by name, code, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">Code</th>
                <th className="p-3.5">Category Name</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-center">Products</th>
                <th className="p-3.5 text-center">Low Stock Alerts</th>
                <th className="p-3.5 text-right">Category Value</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center pr-5">Actions & Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-gray-700 whitespace-nowrap">
                      {cat.code}
                    </td>

                    <td className="p-3.5 font-bold text-gray-900 whitespace-nowrap">
                      {cat.name}
                    </td>

                    <td className="p-3.5 text-gray-500 max-w-[250px] truncate" title={cat.description}>
                      {cat.description}
                    </td>

                    <td className="p-3.5 text-center font-bold text-gray-900 whitespace-nowrap">
                      {cat.productCount} Items
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      {cat.reorderAlerts > 0 ? (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 text-amber-800">
                          {cat.reorderAlerts} Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-md bg-emerald-50 text-emerald-700">
                          Optimal
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                      {cat.totalValue}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cat.status}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate('/inventory/products')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="View Category Products"
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
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <IoTrashOutline size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No categories found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Add / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Vegetables & Produce"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Category Code</label>
                <input
                  type="text"
                  placeholder="e.g., CAT-VEG"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Brief description of inventory items in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
