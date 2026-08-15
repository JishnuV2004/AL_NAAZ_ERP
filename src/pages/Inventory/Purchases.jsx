import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { IoAddOutline, IoTrashOutline, IoCloseOutline } from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';

const Purchases = () => {
  const purchases = useInventoryStore(state => state.purchases);
  const suppliers = useInventoryStore(state => state.suppliers);
  const products = useInventoryStore(state => state.products);
  const loading = useInventoryStore(state => state.loading);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const safePurchases = Array.isArray(purchases) ? purchases : [];
  const totalPages = Math.ceil(safePurchases.length / itemsPerPage) || 1;
  const currentPurchases = safePurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    inventoryService.fetchSuppliers(1, 100);
    inventoryService.fetchProducts();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    supplier: '',
    invoice_number: '',
    items: []
  });

  const getSupplierName = (id) => suppliers.find(s => s.id === id)?.name || 'Unknown Supplier';
  const getProductName = (id) => products.find(p => p.id === id)?.name || 'Unknown Product';
  const getProductUnit = (id) => products.find(p => p.id === id)?.unit || '';

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', quantity: 0, total_price: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier || formData.items.length === 0) return;

    // Validate items
    for (let item of formData.items) {
      if (!item.product || item.quantity <= 0 || item.total_price <= 0) return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        items: formData.items.map(item => ({
          ...item,
          unit_price: (Number(item.total_price) / Number(item.quantity)).toFixed(2)
        }))
      };
      await inventoryService.addPurchase(payload);
      setIsModalOpen(false);
      setFormData({
        purchase_date: new Date().toISOString().split('T')[0],
        supplier: '',
        invoice_number: '',
        items: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-end bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 rounded-xl bg-brand-gold px-5 py-2.5 text-sm font-semibold text-brand-brown hover:bg-brand-gold-hover transition-colors shadow-md cursor-pointer"
        >
          <IoAddOutline className="h-5 w-5" />
          <span>New Purchase</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : safePurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <span className="text-4xl mb-2">📄</span>
            <p className="font-semibold text-sm">No purchase history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Items Summary</th>
                  <th className="px-6 py-4 text-right">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPurchases.map(purchase => (
                  <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {new Date(purchase.purchase_date || purchase.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{getSupplierName(purchase.supplier || purchase.supplierId)}</td>
                    <td className="px-6 py-4 text-gray-500">{purchase.invoice_number || purchase.invoice || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {purchase.items.map((item, i) => (
                        <div key={i} className="mb-1">
                          {item.quantity} {getProductUnit(item.product || item.productId)} {getProductName(item.product || item.productId)}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                      ₹{purchase.items.reduce((sum, item) => sum + Number(item.total_price || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && safePurchases.length > 0 && (
          <div className="border-t border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10 gap-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, safePurchases.length)} of {safePurchases.length} entries (Page {currentPage} of {totalPages})
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
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    currentPage === pageNum 
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record New Purchase" size="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Supplier</label>
              <select
                required
                value={formData.supplier}
                onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden bg-white"
              >
                <option value="">Select supplier</option>
                {(Array.isArray(suppliers) ? suppliers : []).filter(s => s.is_active || s.status === 'Active').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Purchase Date</label>
              <input
                type="date"
                required
                value={formData.purchase_date}
                onChange={e => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">Invoice Number (optional)</label>
              <input
                type="text"
                placeholder="e.g. INV-2203"
                value={formData.invoice_number}
                onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-[#5946D5] outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Products</label>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <select
                    required
                    value={item.product}
                    onChange={e => handleItemChange(index, 'product', e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-hidden bg-white focus:border-[#5946D5]"
                  >
                    <option value="">Select product</option>
                    {(Array.isArray(products) ? products : []).filter(p => p.is_active || p.status === 'Active').map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    required min="0.01" step="0.01"
                    value={item.quantity || ''}
                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-hidden focus:border-[#5946D5]"
                  />
                  <input
                    type="number"
                    placeholder="Total price"
                    required min="0.01" step="0.01"
                    value={item.total_price || ''}
                    onChange={e => handleItemChange(index, 'total_price', e.target.value)}
                    className="w-32 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-hidden focus:border-[#5946D5]"
                  />
                  <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-500 hover:text-red-500 p-1">
                    <IoCloseOutline className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 text-sm font-semibold text-[#5946D5] hover:text-[#4a39b3]"
            >
              + Add Product
            </button>
            <p className="mt-2 text-xs text-gray-500">Unit price is calculated automatically from quantity and total price.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text hover:bg-brand-cream/50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || formData.items.length === 0}
              className="rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-semibold text-brand-brown hover:bg-brand-gold-hover shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? <ButtonLoader /> : 'Save Purchase'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;
