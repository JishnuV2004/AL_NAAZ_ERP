import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { FiEdit } from 'react-icons/fi';
import { IoAddOutline, IoSearchOutline, IoTrashOutline } from 'react-icons/io5';

const defaultForm = {
  name: '',
  category: 'Vegetables',
  unit: 'KG',
  minStock: 10,
  status: 'Active'
};

const initialMockProducts = [
  { id: 1, name: 'Basmati Rice 1121', category: 'Grains', unit: 'KG', minStock: 100, is_active: true, status: 'Active' },
  { id: 2, name: 'Sunflower Cooking Oil', category: 'Cooking', unit: 'L', minStock: 50, is_active: true, status: 'Active' },
  { id: 3, name: 'Fresh Chicken Whole', category: 'Meat & Poultry', unit: 'KG', minStock: 30, is_active: true, status: 'Active' },
  { id: 4, name: 'Red Onions Nashik', category: 'Vegetables', unit: 'KG', minStock: 40, is_active: true, status: 'Active' },
  { id: 5, name: 'Whole Milk 1L', category: 'Beverages', unit: 'Pack', minStock: 25, is_active: true, status: 'Active' },
  { id: 6, name: 'Mutton Curry Cut', category: 'Meat & Poultry', unit: 'KG', minStock: 15, is_active: true, status: 'Active' },
  { id: 7, name: 'Tomato Hybrid', category: 'Vegetables', unit: 'KG', minStock: 35, is_active: true, status: 'Active' }
];

const Products = () => {
  const navigate = useNavigate();
  const { products: storeProducts, loading: storeLoading, fetchProducts, addProduct, updateProduct, deleteProduct } = useInventoryStore();

  const [productsList, setProductsList] = useState(initialMockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        if (fetchProducts) {
          const res = await fetchProducts();
          if (isMounted && res && res.length > 0) {
            setProductsList(res);
          }
        }
      } catch (e) {
        console.warn('API error fetching products, using mock:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const activeProducts = (storeProducts && storeProducts.length > 0) ? storeProducts : productsList;

  const filteredProducts = activeProducts.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || '',
      category: product.category || 'Vegetables',
      unit: product.unit || 'KG',
      minStock: product.minimum_stock || product.minStock || 10,
      status: product.is_active || product.status === 'Active' ? 'Active' : 'Inactive'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        if (updateProduct) {
          await updateProduct(editingId, formData);
        }
        setProductsList(prev => prev.map(p => p.id === editingId ? {
          ...p,
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          minStock: parseFloat(formData.minStock),
          minimum_stock: parseFloat(formData.minStock),
          status: formData.status,
          is_active: formData.status === 'Active'
        } : p));
      } else {
        const newProd = {
          id: Date.now(),
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          minStock: parseFloat(formData.minStock),
          minimum_stock: parseFloat(formData.minStock),
          status: formData.status,
          is_active: formData.status === 'Active'
        };
        if (addProduct) {
          await addProduct(formData);
        }
        setProductsList(prev => [newProd, ...prev]);
      }
      setIsModalOpen(false);
      setFormData(defaultForm);
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      if (deleteProduct) {
        await deleteProduct(deletingId);
      }
      setProductsList(prev => prev.filter(p => p.id !== deletingId));
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting product:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700">Products Catalog</span>
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
            onClick={() => {
              setEditingId(null);
              setFormData(defaultForm);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-2xs cursor-pointer"
          >
            <IoAddOutline className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-xs gap-4">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <IoSearchOutline className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-700 font-medium outline-none focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Grains">Grains</option>
            <option value="Meat & Poultry">Meat & Poultry</option>
            <option value="Cooking">Cooking</option>
            <option value="Beverages">Beverages</option>
          </select>
        </div>
      </div>

      {/* Table & Pagination */}
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
                  <th className="px-6 py-4 text-center">Min Stock Alert</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-xs text-gray-400">
                      No products found matching criteria.
                    </td>
                  </tr>
                ) : (
                  currentProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-500">{product.category}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-900">{product.unit}</td>
                      <td className="px-6 py-4 text-center text-gray-500">{product.minimum_stock || product.minStock || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${product.is_active || product.status === 'Active' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                          {product.is_active || product.status === 'Active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => openEditModal(product)} className="text-gray-900 font-bold hover:text-blue-600 transition-colors cursor-pointer p-1" title="Edit Product">
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => {
                          setDeletingId(product.id);
                          setIsDeleteModalOpen(true);
                        }} className="text-red-500 font-bold hover:text-red-700 transition-colors cursor-pointer p-1" title="Delete Product">
                          <IoTrashOutline className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredProducts.length > 0 && (
          <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4">
            <span className="text-xs font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} entries (Page {currentPage} of {totalPages})
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 border-blue-600 text-white font-bold'
                      : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Category</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-blue-500 outline-none bg-white"
              >
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
              <select
                required
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-blue-500 outline-none bg-white"
              >
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
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.minStock}
                onChange={e => setFormData({ ...formData, minStock: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Status</label>
              <select
                required
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-xs focus:border-blue-500 outline-none bg-white"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs cursor-pointer disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? <ButtonLoader /> : (editingId ? 'Update Product' : 'Save Product')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Product">
        <div className="space-y-6">
          <p className="text-gray-500 text-xs">
            Are you sure you want to delete this product? This action cannot be undone and may affect your stock ledger.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? <ButtonLoader /> : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Products;
