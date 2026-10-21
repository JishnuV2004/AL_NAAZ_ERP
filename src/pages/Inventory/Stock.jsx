import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoCubeOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoCartOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import axiosInstance from '../../config/axios';
import { inventoryService, generateUUID } from '../../services/inventoryService';
import { accountService } from '../../services/accountService';
import { Calendar } from '../../components/ui/calendar';

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const y = parts[0];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return `${monthNamesShort[m]} ${d}, ${y}`;
};

const Stock = () => {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Branches State
  const [branchesList, setBranchesList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('1');

  // Adjust Stock Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustType, setAdjustType] = useState('Add'); // 'Add' or 'Reduce'
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustDate, setAdjustDate] = useState(new Date().toISOString().split('T')[0]);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const [popoverPlacement, setPopoverPlacement] = useState('top');
  const calendarRef = useRef(null);

  const handleToggleCalendar = () => {
    if (!showCalendarPopover) {
      if (calendarRef.current) {
        const rect = calendarRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 340) {
          setPopoverPlacement('top');
        } else {
          setPopoverPlacement('bottom');
        }
      } else {
        setPopoverPlacement('top');
      }
      setShowCalendarPopover(true);
    } else {
      setShowCalendarPopover(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch stock from API
  const loadStock = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/stock/');
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setStockItems(data || []);
    } catch (error) {
      console.warn('Failed to fetch stock from /api/stock/:', error);
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const res = await accountService.fetchBranches();
      const list = Array.isArray(res) ? res : (res?.results || []);
      if (list.length > 0) {
        setBranchesList(list);
        setSelectedBranchId(String(list[0].id));
      }
    } catch (err) {
      console.warn('Failed to fetch branches:', err);
    }
  };

  useEffect(() => {
    loadStock();
    loadBranches();
  }, []);

  // Stats calculation
  const totalItems = stockItems.length;
  const goodStockCount = stockItems.filter((i) => {
    const s = String(i.status || '').toUpperCase();
    const qty = parseFloat(i.current_stock) || 0;
    const min = parseFloat(i.minimum_stock) || 0;
    return s === 'GOOD' || s === 'IN_STOCK' || qty > min;
  }).length;
  const lowStockCount = stockItems.filter((i) => {
    const s = String(i.status || '').toUpperCase();
    const qty = parseFloat(i.current_stock) || 0;
    const min = parseFloat(i.minimum_stock) || 0;
    return s === 'LOW_STOCK' || s === 'LOW' || (qty > 0 && qty <= min);
  }).length;
  const outOfStockCount = stockItems.filter((i) => {
    const s = String(i.status || '').toUpperCase();
    const qty = parseFloat(i.current_stock) || 0;
    return s === 'OUT_OF_STOCK' || s === 'OUT' || qty === 0;
  }).length;

  // Available units for dropdown
  const availableUnits = [
    'All',
    ...Array.from(new Set(stockItems.map((i) => i.unit).filter(Boolean)))
  ];

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, unitFilter]);

  // Filtered List
  const filteredStock = stockItems.filter((item) => {
    if (statusFilter !== 'All') {
      const s = String(item.status || '').toUpperCase().replace(/\s+/g, '_');
      const target = statusFilter.toUpperCase().replace(/\s+/g, '_');
      const qty = parseFloat(item.current_stock) || 0;
      const min = parseFloat(item.minimum_stock) || 0;
      if (target === 'GOOD' && !(s === 'GOOD' || s === 'IN_STOCK' || qty > min)) return false;
      if (target === 'LOW_STOCK' && !(s === 'LOW_STOCK' || s === 'LOW' || (qty > 0 && qty <= min))) return false;
      if (target === 'OUT_OF_STOCK' && !(s === 'OUT_OF_STOCK' || s === 'OUT' || qty === 0)) return false;
    }

    if (unitFilter !== 'All' && item.unit !== unitFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = (item.product_name || '').toLowerCase().includes(q);
      const unitMatch = (item.unit || '').toLowerCase().includes(q);
      if (!nameMatch && !unitMatch) return false;
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStock.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const indexOfLast = validPage * pageSize;
  const indexOfFirst = (validPage - 1) * pageSize;
  const currentStockItems = filteredStock.slice(indexOfFirst, indexOfLast);
  const emptyRowsCount = pageSize - currentStockItems.length;

  const getStatusBadge = (status, currentStock, minStock) => {
    const s = String(status || '').toUpperCase().replace(/\s+/g, '_');
    const qty = parseFloat(currentStock) || 0;
    const min = parseFloat(minStock) || 0;

    if (s === 'OUT_OF_STOCK' || s === 'OUT' || qty === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-rose-100 text-rose-800 uppercase border border-rose-200">
          OUT OF STOCK
        </span>
      );
    }
    if (s === 'LOW_STOCK' || s === 'LOW' || (qty > 0 && qty <= min)) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-amber-100 text-amber-800 uppercase border border-amber-200">
          LOW STOCK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 uppercase border border-emerald-200">
        {s === 'GOOD' ? 'GOOD' : 'IN STOCK'}
      </span>
    );
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const changeQty = parseFloat(adjustQty) || 0;
    if (changeQty <= 0) {
      toast.error('Quantity must be greater than 0.');
      return;
    }

    const payload = {
      branch: parseInt(selectedBranchId, 10) || 1,
      product: parseInt(selectedItem.product || selectedItem.id, 10),
      adjustment_type: adjustType === 'Add' ? 'INCREASE' : 'DECREASE',
      quantity: String(changeQty),
      adjustment_date: adjustDate || new Date().toISOString().split('T')[0],
      reason: adjustNotes.trim() || (adjustType === 'Add' ? 'Stock addition' : 'Stock reduction')
    };

    // Each action generates a fresh, different random Idempotency-Key
    const idempotencyKey = generateUUID();

    setAdjustSubmitting(true);
    try {
      await inventoryService.createAdjustment(payload, idempotencyKey);
      await loadStock();
      setSelectedItem(null);
      setAdjustQty(1);
      setAdjustNotes('');
      setShowCalendarPopover(false);
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setAdjustSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">

      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700">Stock</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Stock Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Monitor real-time warehouse inventory, track stock levels, and audit minimum thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/inventory/stockusage')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoSwapHorizontalOutline size={16} /> Stock Usage
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/stockledger')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoDocumentTextOutline size={16} /> Stock Ledger
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/lowstock')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoWarningOutline size={18} /> Low Stock Alerts ({lowStockCount + outOfStockCount})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Items */}
        <div
          onClick={() => setStatusFilter('All')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Stock Items</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalItems} Products</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Monitored Inventory</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCubeOutline size={24} />
          </div>
        </div>

        {/* Good / In Stock */}
        <div
          onClick={() => setStatusFilter('GOOD')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Good Stock Levels</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              {goodStockCount} Items
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Adequate Inventory</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setStatusFilter('LOW_STOCK')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Low Stock Warning</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{lowStockCount} Items</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Below Minimum Stock</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Out of Stock</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{outOfStockCount} Items</h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Immediate Reorder Needed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3">

          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search stock item by product name or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-2">
            <IoFilterOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="All">All Units</option>
              {availableUnits.filter((u) => u !== 'All').map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="GOOD">Good / In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>

        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold whitespace-nowrap">
                <th className="py-3.5 px-5">Product</th>
                <th className="py-3.5 px-5 text-center">Current Stock</th>
                <th className="py-3.5 px-5 text-center">Minimum Stock</th>
                <th className="py-3.5 px-5 text-center">Unit</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse h-[52px]">
                    <td className="py-3.5 px-5"><div className="h-4 bg-slate-200 rounded w-28"></div></td>
                    <td className="py-3.5 px-5 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto"></div></td>
                    <td className="py-3.5 px-5 text-center"><div className="h-4 bg-slate-200 rounded w-14 mx-auto"></div></td>
                    <td className="py-3.5 px-5 text-center"><div className="h-4 bg-slate-200 rounded w-10 mx-auto"></div></td>
                    <td className="py-3.5 px-5 text-center"><div className="h-4 bg-slate-200 rounded w-20 mx-auto"></div></td>
                    <td className="py-3.5 px-5 text-center"><div className="h-4 bg-slate-200 rounded w-24 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredStock.length > 0 ? (
                <>
                  {currentStockItems.map((item) => (
                    <tr key={item.product || item.id} className="hover:bg-gray-50/80 transition-colors h-[52px]">
                      {/* Product */}
                      <td className="py-3.5 px-5 font-bold text-gray-900 capitalize">
                        <button
                          type="button"
                          onClick={() => navigate('/inventory/products')}
                          className="hover:text-blue-600 transition-colors text-left block truncate cursor-pointer font-semibold"
                          title="View Product in Catalog"
                        >
                          {item.product_name || `Product #${item.product}`}
                        </button>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-5 text-center font-extrabold text-gray-900 tabular-nums font-mono text-sm">
                        {parseFloat(item.current_stock) || 0}
                      </td>

                      {/* Minimum Stock */}
                      <td className="py-3.5 px-5 text-center text-gray-600 font-semibold tabular-nums">
                        {parseFloat(item.minimum_stock) || 0}
                      </td>

                      {/* Unit */}
                      <td className="py-3.5 px-5 text-center text-gray-600 font-medium">
                        {item.unit || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        {getStatusBadge(item.status, item.current_stock, item.minimum_stock)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustType('Add');
                              setAdjustQty(1);
                              setAdjustNotes('');
                              setAdjustDate(new Date().toISOString().split('T')[0]);
                              if (branchesList.length > 0 && !selectedBranchId) {
                                setSelectedBranchId(String(branchesList[0].id));
                              }
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Adjust Stock Quantity"
                          >
                            <IoAddOutline size={14} /> Adjust Stock
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate('/procurement/purchases')}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Create Purchase Order in Procurement"
                          >
                            <IoCartOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[52px] border-b border-gray-100/40">
                      <td colSpan="6">&nbsp;</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    No stock items found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredStock.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
            <div>
              Showing <span className="font-bold text-gray-900">{indexOfFirst + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{Math.min(indexOfLast, filteredStock.length)}</span> of{' '}
              <span className="font-bold text-gray-900">{filteredStock.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={validPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <IoChevronBackOutline size={14} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${validPage === pageNum
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={validPage >= totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <IoChevronForwardOutline size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal: Adjust Stock Quantity */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Adjust Stock Quantity</h3>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="py-4 space-y-4 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1">
                <p className="font-bold text-gray-900 capitalize">{selectedItem.product_name}</p>
                <p className="text-[11px] text-gray-500 font-mono">
                  Current Quantity:{' '}
                  <strong className="text-gray-800">
                    {parseFloat(selectedItem.current_stock) || 0} {selectedItem.unit}
                  </strong>
                </p>
              </div>

              {/* Branch */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  {branchesList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.branch_name || `Branch #${b.id}`}
                    </option>
                  ))}
                  {branchesList.length === 0 && (
                    <option value="1">Al Naaz Kayamkulam (Branch #1)</option>
                  )}
                </select>
              </div>

              {/* Action */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Adjustment Action <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('Add')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${adjustType === 'Add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <IoAddOutline size={16} /> Increase (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('Reduce')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${adjustType === 'Reduce'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <IoRemoveOutline size={16} /> Decrease (-)
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Quantity ({selectedItem.unit}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              {/* Adjustment Date */}
              <div className="relative" ref={calendarRef}>
                <label className="block font-semibold text-gray-700 mb-1">
                  Adjustment Date <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleToggleCalendar}
                  className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline size={15} className="text-blue-600" />
                    <span className="font-semibold text-gray-800">
                      {adjustDate ? formatDisplayDate(adjustDate) : 'Select Date'}
                    </span>
                  </div>
                  <IoChevronDownOutline
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${showCalendarPopover ? 'rotate-180' : ''
                      }`}
                    size={13}
                  />
                </button>

                {showCalendarPopover && (
                  <div
                    className={`absolute left-0 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 ${popoverPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                      }`}
                  >
                    <Calendar
                      value={adjustDate || new Date().toISOString().split('T')[0]}
                      onChange={(newDate) => {
                        setAdjustDate(newDate);
                        setShowCalendarPopover(false);
                      }}
                      onClose={() => setShowCalendarPopover(false)}
                    />
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Adjustment Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g., Physical count adjustment or Damaged"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {adjustSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Confirm Adjustment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Stock;
