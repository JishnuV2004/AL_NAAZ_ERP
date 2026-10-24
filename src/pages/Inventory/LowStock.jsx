import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoWarningOutline,
  IoCartOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCubeOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoBusinessOutline,
  IoArrowForwardOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { inventoryService } from '../../services/inventoryService';

const LowStock = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');

  const loadLowStock = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await inventoryService.fetchLowStock();
      setItems(Array.isArray(data) ? data : []);
      if (isRefresh) {
        toast.success('Low stock data updated successfully');
      }
    } catch (err) {
      console.error('Error fetching low stock:', err);
      toast.error('Failed to load low stock items');
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLowStock();
  }, [loadLowStock]);

  // Extract unique branches for filter dropdown
  const uniqueBranches = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (item.branch && item.branch_name) {
        map.set(String(item.branch), item.branch_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);

  // Filter items based on search, status, and branch
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Branch filter
      if (branchFilter !== 'ALL' && String(item.branch) !== String(branchFilter)) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL') {
        const itemStatus = String(item.status || '').toUpperCase();
        if (statusFilter === 'OUT_OF_STOCK') {
          if (itemStatus !== 'OUT_OF_STOCK' && Number(item.current_stock) !== 0) {
            return false;
          }
        } else if (statusFilter === 'LOW_STOCK') {
          if (itemStatus !== 'LOW_STOCK' && (Number(item.current_stock) <= 0 || Number(item.current_stock) > Number(item.minimum_stock))) {
            return false;
          }
        }
      }

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const nameMatch = item.product_name?.toLowerCase().includes(q);
        const branchMatch = item.branch_name?.toLowerCase().includes(q);
        const idMatch = String(item.product).includes(q);
        const unitMatch = item.unit?.toLowerCase().includes(q);
        if (!nameMatch && !branchMatch && !idMatch && !unitMatch) {
          return false;
        }
      }

      return true;
    });
  }, [items, branchFilter, statusFilter, searchTerm]);

  // Statistics
  const totalLowStock = items.length;
  const outOfStockCount = items.filter(
    (i) => String(i.status).toUpperCase() === 'OUT_OF_STOCK' || Number(i.current_stock) === 0
  ).length;
  const lowStockCount = items.filter(
    (i) =>
      String(i.status).toUpperCase() === 'LOW_STOCK' ||
      (Number(i.current_stock) > 0 && Number(i.current_stock) <= Number(i.minimum_stock))
  ).length;
  const totalDeficitUnits = items.reduce((acc, curr) => {
    const min = Number(curr.minimum_stock) || 0;
    const cur = Number(curr.current_stock) || 0;
    return acc + Math.max(0, min - cur);
  }, 0);


  const getStatusBadge = (status, currentStock) => {
    const s = String(status || '').toUpperCase();
    const isOut = s === 'OUT_OF_STOCK' || Number(currentStock) === 0;

    if (isOut) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          <IoCloseCircleOutline size={13} className="shrink-0" />
          OUT OF STOCK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
        <IoAlertCircleOutline size={13} className="shrink-0" />
        LOW STOCK
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span
              onClick={() => navigate('/inventory/stock')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Inventory
            </span>
            <span>&gt;</span>
            <span className="text-gray-700">Low Stock Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Low Stock & Safety Audit
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Automated reorder alerts, safety buffer threshold audits, and procurement purchase triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadLowStock(true)}
            disabled={loading || refreshing}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh low stock list"
          >
            <IoRefreshOutline
              size={16}
              className={refreshing ? 'animate-spin text-blue-600' : ''}
            />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/stock')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCubeOutline size={16} /> Live Stock
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases?create=true', { state: { openModal: true } })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCartOutline size={17} /> Purchase
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Low Stock Alerts */}
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'ALL'
              ? 'border-blue-400 ring-2 ring-blue-100'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Alert Items</p>
            {loading ? (
              <div className="h-7 w-28 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {totalLowStock} Products
              </h3>
            )}
            <p className="text-[10px] font-medium text-amber-600 mt-1">
              Below Safety Threshold
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'border-rose-400 ring-2 ring-rose-100'
              : 'border-gray-200 hover:border-rose-300'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Critical Out of Stock</p>
            {loading ? (
              <div className="h-7 w-28 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {outOfStockCount} Products
              </h3>
            )}
            <p className="text-[10px] font-medium text-rose-600 mt-1">
              Immediate Reorder Needed
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoCloseCircleOutline size={24} />
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className={`bg-white p-5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            statusFilter === 'LOW_STOCK'
              ? 'border-amber-400 ring-2 ring-amber-100'
              : 'border-gray-200 hover:border-amber-300'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Low Stock Warning</p>
            {loading ? (
              <div className="h-7 w-28 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                {lowStockCount} Products
              </h3>
            )}
            <p className="text-[10px] font-medium text-amber-600 mt-1">
              Approaching Critical Level
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoAlertCircleOutline size={24} />
          </div>
        </div>

        {/* Total Deficit Units */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Unit Deficit</p>
            {loading ? (
              <div className="h-7 w-28 bg-slate-200 rounded-lg animate-pulse my-0.5"></div>
            ) : (
              <h3 className="text-2xl font-bold text-gray-900 tabular-nums">
                +{totalDeficitUnits.toLocaleString()}
              </h3>
            )}
            <p className="text-[10px] font-medium text-blue-600 mt-1">
              Units Needed to Restock
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCubeOutline size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative sm:col-span-6">
            <IoSearchOutline
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search products by name, ID, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 sm:col-span-3">
            <IoFilterOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="LOW_STOCK">Low Stock Only</option>
              <option value="OUT_OF_STOCK">Out of Stock Only</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-2 sm:col-span-3">
            <IoBusinessOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">All Branches</option>
              {uniqueBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Low Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">Product Name</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5 text-center">Current Stock</th>
                <th className="p-3.5 text-center">Safety Threshold</th>
                <th className="p-3.5 text-center">Shortage / Deficit</th>
                <th className="p-3.5 pr-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse h-[52px]">
                    <td className="p-3.5 pl-5">
                      <div className="h-4 bg-slate-200 rounded w-44"></div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                        <div className="h-4 bg-slate-200 rounded w-28"></div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                    </td>
                    <td className="p-3.5 pr-5 text-center">
                      <div className="h-5 bg-slate-200 rounded-full w-24 mx-auto"></div>
                    </td>
                  </tr>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const current = Number(item.current_stock) || 0;
                  const min = Number(item.minimum_stock) || 0;
                  const deficit = Math.max(0, min - current);
                  const isOut = current === 0 || String(item.status).toUpperCase() === 'OUT_OF_STOCK';

                  return (
                    <tr
                      key={`${item.product}-${item.branch}`}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Product Name */}
                      <td className="p-3.5 pl-5">
                        <button
                          type="button"
                          onClick={() => navigate('/inventory/products')}
                          className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                          title="View product in catalog"
                        >
                          {item.product_name || `Product #${item.product}`}
                        </button>
                      </td>

                      {/* Branch */}
                      <td className="p-3.5 text-gray-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          {item.branch_name || `Branch #${item.branch}`}
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5 text-center font-bold whitespace-nowrap">
                        <span
                          className={
                            isOut
                              ? 'text-rose-600 font-mono text-sm font-black'
                              : 'text-amber-600 font-mono text-sm'
                          }
                        >
                          {current} {item.unit || ''}
                        </span>
                      </td>

                      {/* Safety Threshold */}
                      <td className="p-3.5 text-center text-gray-600 font-mono font-medium whitespace-nowrap">
                        {min} {item.unit || ''}
                      </td>

                      {/* Shortage / Deficit */}
                      <td className="p-3.5 text-center font-bold text-blue-600 font-mono whitespace-nowrap">
                        +{deficit} {item.unit || ''}
                      </td>

                      {/* Status Badge */}
                      <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                        {getStatusBadge(item.status, item.current_stock)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <IoCheckmarkCircleOutline size={28} />
                      </div>
                      <p className="font-bold text-gray-800 text-sm">No Low Stock Items Found</p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        {searchTerm || statusFilter !== 'ALL' || branchFilter !== 'ALL'
                          ? 'No products matched your active filters. Try clearing or relaxing the filters.'
                          : 'All products currently have stock levels above their minimum safety thresholds.'}
                      </p>
                      {(searchTerm || statusFilter !== 'ALL' || branchFilter !== 'ALL') && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('ALL');
                            setBranchFilter('ALL');
                          }}
                          className="mt-3 text-xs text-blue-600 hover:underline font-semibold"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LowStock;
