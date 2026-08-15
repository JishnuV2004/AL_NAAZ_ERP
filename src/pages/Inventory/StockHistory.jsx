import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { IoSearchOutline } from 'react-icons/io5';
import { PageLoader } from '../../components/common/Loader';

const StockHistory = () => {
  const ledger = useInventoryStore(state => state.ledger);
  const products = useInventoryStore(state => state.products);
  const loading = useInventoryStore(state => state.loading);

  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    inventoryService.fetchProducts();
  }, []);

  const safeProducts = Array.isArray(products) ? products : [];
  const getProductName = (id) => safeProducts.find(p => p.id === id)?.name || 'Unknown Product';
  const getProductUnit = (id) => safeProducts.find(p => p.id === id)?.unit || '';

  const safeLedger = Array.isArray(ledger) ? ledger : [];
  const filteredLedger = safeLedger.filter(entry => {
    const type = entry.movement_type || entry.type;
    if (filterType !== 'ALL' && type !== filterType) return false;

    if (searchTerm) {
      const pName = (entry.product_name || getProductName(entry.productId)).toLowerCase();
      if (!pName.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredLedger.length / itemsPerPage) || 1;
  const currentLedger = filteredLedger.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'PURCHASE': return 'text-emerald-700 bg-emerald-50 border border-emerald-100';
      case 'USAGE': return 'text-amber-700 bg-amber-50 border border-amber-200';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const formatQuantity = (qty) => {
    return qty > 0 ? `+${qty}` : qty;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-gray-900">Stock History</h2>
        <p className="text-sm text-gray-500">Where did the stock come from, and where did it go?</p>
      </div>

      <div className="flex flex-col gap-3">
        <select
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-sans text-sm text-gray-900 outline-hidden focus:border-[#5946D5] focus:ring-1 focus:ring-[#5946D5]"
        >
          <option value="">All products</option>
          {products.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-sans text-sm text-gray-900 outline-hidden focus:border-[#5946D5] focus:ring-1 focus:ring-[#5946D5]"
        >
          <option value="ALL">All movement types</option>
          <option value="PURCHASE">Purchases Only</option>
          <option value="USAGE">Usage Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : filteredLedger.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <span className="text-4xl mb-2">📊</span>
            <p className="font-semibold text-sm">No ledger history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Quantity</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentLedger.map(entry => {
                  const date = entry.movement_date || entry.date;
                  const productName = entry.product_name || getProductName(entry.productId);
                  const type = entry.movement_type || entry.type;
                  const unit = entry.unit || getProductUnit(entry.productId);
                  const balance = entry.balance_after || entry.balance;

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-500">
                        {date}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-bold">{productName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTypeStyle(type)}`}>
                          {type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold font-mono ${Number(entry.quantity) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {formatQuantity(entry.quantity)} {unit}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 font-mono">
                        {balance} {unit}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {entry.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredLedger.length > 0 && (
          <div className="border-t border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10 gap-4">
            <span className="text-sm font-medium text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLedger.length)} of {filteredLedger.length} entries (Page {currentPage} of {totalPages})
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
    </div>
  );
};

export default StockHistory;
