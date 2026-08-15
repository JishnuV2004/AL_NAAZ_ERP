import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

const StockUsage = () => {
  const products = useInventoryStore(state => state.products);
  const usages = useInventoryStore(state => state.usages) || [];
  const loading = useInventoryStore(state => state.loading);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadUsages = async () => {
    const response = await inventoryService.fetchUsages(page, 5);
    if (response) {
      setHasNext(!!response.next);
      setHasPrev(!!response.previous);
      setTotalPages(Math.ceil((response.count || 0) / 5) || 1);
      setTotalItems(response.count || 0);
    }
  };

  useEffect(() => {
    inventoryService.fetchProducts();
  }, []);

  useEffect(() => {
    loadUsages();
  }, [page]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    quantity: '',
    remarks: ''
  });

  const selectedProduct = products.find(p => p.id === formData.productId);

  const getProductName = (id) => {
    if (!products) return 'Unknown';
    const p = (Array.isArray(products) ? products : []).find(p => p.id === id);
    return p ? p.name : 'Unknown Product';
  };

  const getProductUnit = (id) => {
    if (!products) return '';
    const p = (Array.isArray(products) ? products : []).find(p => p.id === id);
    return p ? p.unit : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || formData.quantity <= 0) return;

    setIsSubmitting(true);
    try {
      await inventoryService.recordUsage(formData);
      setFormData({
        ...formData,
        productId: '',
        quantity: '',
        remarks: ''
      });
      if (page === 1) loadUsages(); else setPage(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-4 space-y-8 pb-8">
      {/* Form Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-900">Record Stock Usage</h2>
          <p className="text-xs text-gray-500">Log daily or weekly consumption of inventory items.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Usage Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Product</label>
              <select
                required
                value={formData.productId}
                onChange={e => setFormData({...formData, productId: e.target.value})}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden bg-white"
              >
                <option value="">Select product...</option>
                {(Array.isArray(products) ? products : []).filter(p => p.is_active || p.status === 'Active').map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              
              {selectedProduct && selectedProduct.currentStock !== undefined && (
                <div className={`mt-2 text-xs font-bold ${selectedProduct.currentStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  Available Stock: {selectedProduct.currentStock} {selectedProduct.unit}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Usage Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  required min="0.01" step="0.01"
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden"
                  placeholder="0.00"
                />
                {selectedProduct && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-sm text-gray-500 font-bold">
                    {selectedProduct.unit}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase mb-1.5">Remarks</label>
              <textarea
                rows="1"
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
                placeholder="e.g. Kitchen use, damaged, etc."
                className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !formData.productId}
              className="w-full flex items-center justify-center rounded-xl bg-brand-gold px-6 py-3 text-sm font-bold text-brand-brown hover:bg-brand-gold-hover shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? <ButtonLoader /> : 'Record Usage'}
            </button>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-900">Recent usage</h2>
        </div>
        
        {loading && usages.length === 0 ? (
          <PageLoader />
        ) : usages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <span className="text-4xl mb-2">📊</span>
            <p className="font-semibold text-sm">No usage records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-gray-100/20 text-gray-500 text-[10px] font-bold tracking-widest uppercase border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-right">Used</th>
                  <th className="px-6 py-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usages.map((usage, i) => (
                  <tr key={usage.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500 font-mono">
                      {new Date(usage.usage_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {getProductName(usage.product)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      {usage.quantity} {getProductUnit(usage.product)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {usage.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && usages.length > 0 && (
          <div className="border-t border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10 gap-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(page - 1) * 5 + 1} to {Math.min(page * 5, totalItems)} of {totalItems} entries (Page {page} of {totalPages})
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
    </div>
  );
};

export default StockUsage;
