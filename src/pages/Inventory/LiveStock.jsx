import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { IoSearchOutline, IoCartOutline } from 'react-icons/io5';
import { PageLoader } from '../../components/common/Loader';

const LiveStock = () => {
  const navigate = useNavigate();
  const liveStock = useInventoryStore(state => state.liveStock);
  const loading = useInventoryStore(state => state.loading);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await inventoryService.fetchLiveStock();
      setIsInitialLoad(false);
    };
    loadData();
  }, []);

  const safeLiveStock = Array.isArray(liveStock) ? liveStock : [];
  const filteredProducts = safeLiveStock.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'OUT') return <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">OUT OF STOCK</span>;
    if (s === 'LOW') return <span className="rounded bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">LOW STOCK</span>;
    return <span className="rounded bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">{s || 'IN STOCK'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
            <IoSearchOutline className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-brand-border bg-brand-cream/30 py-2.5 pl-11 pr-4 font-sans text-sm text-brand-text outline-hidden focus:border-brand-gold focus:ring-1 focus:ring-brand-gold"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isInitialLoad || loading ? (
          <PageLoader />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <span className="text-4xl mb-2">📦</span>
            <p className="font-semibold text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-[#F8F9FA] text-gray-600 text-xs font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Current Stock</th>
                  <th className="px-6 py-4 text-center">Minimum Stock</th>
                  <th className="px-6 py-4 text-center">Unit</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.product || product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{product.product_name || product.name}</td>
                    <td className="px-6 py-4 text-center font-extrabold text-gray-900 tabular-nums">
                      {product.current_stock ?? product.currentStock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-semibold tabular-nums">
                      {product.minimum_stock ?? product.minStock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">{product.unit}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/procurement/purchases')}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <IoCartOutline size={14} /> Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveStock;
