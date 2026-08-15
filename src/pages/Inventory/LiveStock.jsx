import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { IoSearchOutline } from 'react-icons/io5';
import { PageLoader } from '../../components/common/Loader';

const LiveStock = () => {
  const liveStock = useInventoryStore(state => state.liveStock);
  const loading = useInventoryStore(state => state.loading);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    inventoryService.fetchLiveStock();
  }, []);

  const safeLiveStock = Array.isArray(liveStock) ? liveStock : [];
  const filteredProducts = safeLiveStock.filter(p => 
    p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === 'OUT') return <span className="rounded bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">OUT</span>;
    if (s === 'LOW') return <span className="rounded bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">LOW</span>;
    return <span className="rounded bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">{s || 'GOOD'}</span>;
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
        {loading ? (
          <PageLoader />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <span className="text-4xl mb-2">📦</span>
            <p className="font-semibold text-sm">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Minimum</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.product} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{product.product_name}</td>
                    <td className="px-6 py-4 text-gray-500">{product.unit}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {product.current_stock}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {product.minimum_stock}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
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
