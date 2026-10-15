import React, { useState, useEffect, useRef } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService, generateUUID } from '../../services/inventoryService';
import { accountService } from '../../services/accountService';
import { Calendar } from '../../components/ui/calendar';
import {
  IoAddOutline,
  IoRemoveOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoCalendarOutline,
  IoFilterOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

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

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_ADJUSTMENTS = [
  {
    id: 4109,
    adjustmentCode: 'ADJ-4109',
    date: '2026-09-24',
    product: 'Tomato',
    type: 'Increase',
    quantity: 3,
    reason: 'nothing',
    branch: 'Branch A',
    createdBy: 'Admin'
  },
  {
    id: 2,
    adjustmentCode: 'ADJ-0002',
    date: '2026-09-24',
    product: 'Tomato',
    type: 'Decrease',
    quantity: -3,
    reason: 'Physical count mismatch',
    branch: 'Main Branch',
    createdBy: 'Admin'
  },
  {
    id: 1,
    adjustmentCode: 'ADJ-0001',
    date: '2026-09-19',
    product: 'Cooking Oil',
    type: 'Decrease',
    quantity: -2,
    reason: 'Damaged during storage',
    branch: 'Main Branch',
    createdBy: 'Admin'
  }
];

const StockAdjustments = () => {
  const products = useInventoryStore((state) => state.products) || [];
  const loading = useInventoryStore((state) => state.loading);

  const [adjustmentsList, setAdjustmentsList] = useState([]);
  const [branchesList, setBranchesList] = useState([]);
  const [productOptions, setProductOptions] = useState([
    { id: 1, name: 'tomato', unit: 'KG' },
    { id: 3, name: 'apple', unit: 'KG' },
    { id: 4, name: 'meat', unit: 'KG' }
  ]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);

  // Filters state (matching image top bar controls)
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [selectedType, setSelectedType] = useState('All Types');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
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

  const [formData, setFormData] = useState({
    branch: '',
    productId: '',
    type: 'Increase',
    quantity: '1',
    date: getTodayDateString(),
    reason: ''
  });

  const loadBranches = async () => {
    try {
      const res = await accountService.fetchBranches();
      const list = Array.isArray(res) ? res : (res?.results || []);
      if (list.length > 0) {
        setBranchesList(list);
      } else {
        setBranchesList([{ id: 1, name: 'Al Naaz Kayamkulam' }]);
      }
    } catch (err) {
      console.warn('Failed to load branches:', err);
      setBranchesList([{ id: 1, name: 'Al Naaz Kayamkulam' }]);
    }
  };

  const loadProductOptions = async () => {
    try {
      const res = await inventoryService.fetchProducts(1, 100);
      const prods = Array.isArray(res) ? res : (res?.results || []);
      if (prods.length > 0) {
        setProductOptions(prods);
        return;
      }
    } catch (e) {}

    try {
      const stockRes = await inventoryService.fetchStock();
      if (Array.isArray(stockRes) && stockRes.length > 0) {
        const mappedStock = stockRes.map((s) => ({
          id: s.product || s.id,
          name: s.product_name || s.name,
          unit: s.unit
        }));
        setProductOptions(mappedStock);
      }
    } catch (e) {}
  };

  const loadAdjustments = async (pageToLoad = 1) => {
    setTableLoading(true);
    try {
      const data = await inventoryService.fetchAdjustments(pageToLoad, pageSize);
      const rawResults = Array.isArray(data) ? data : (data?.results || []);
      const count = typeof data?.count === 'number' ? data.count : rawResults.length;

      if (rawResults.length > 0) {
        const mapped = rawResults.map((item) => {
          const adjType = (item.adjustment_type || item.type || '').toUpperCase();
          const isIncrease = adjType === 'INCREASE' || (adjType === '' && parseFloat(item.quantity || 0) > 0);
          const absQty = Math.abs(parseFloat(item.quantity || 0));
          return {
            id: item.id,
            adjustmentCode: item.adjustment_code || `ADJ-${String(item.id).padStart(4, '0')}`,
            date: item.adjustment_date || item.date || (item.created_at ? item.created_at.slice(0, 10) : getTodayDateString()),
            productId: item.product,
            productName: item.product_name,
            product: item.product_name || item.product,
            type: isIncrease ? 'Increase' : 'Decrease',
            quantity: isIncrease ? absQty : -absQty,
            reason: item.reason || '',
            branchId: item.branch,
            branchName: item.branch_name,
            branch: item.branch_name || (item.branch ? `Branch #${item.branch}` : 'Main Branch'),
            createdBy: item.created_by_name || (item.created_by === 1 ? 'Admin' : (item.created_by ? `User #${item.created_by}` : 'Admin'))
          };
        });
        setAdjustmentsList(mapped);
        setTotalCount(count);
      } else {
        setAdjustmentsList([]);
        setTotalCount(count);
      }
      setCurrentPage(pageToLoad);
    } catch (err) {
      console.warn('Failed to load stock adjustments:', err);
      if (adjustmentsList.length === 0) {
        setAdjustmentsList(INITIAL_ADJUSTMENTS);
        setTotalCount(INITIAL_ADJUSTMENTS.length);
      }
    } finally {
      setTableLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPagesCount || tableLoading) return;
    loadAdjustments(newPage);
  };

  useEffect(() => {
    loadBranches();
    loadProductOptions();
    loadAdjustments(1);
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      loadAdjustments(1);
    }
  }, [selectedBranch, selectedProduct, selectedType, startDate, endDate]);

  const getDisplayProduct = (item) => {
    if (item.productName) return item.productName;
    const pId = item.productId ?? item.product;
    if (typeof item.product === 'string' && isNaN(item.product) && !item.product.startsWith('Product #')) {
      return item.product;
    }
    const foundInOptions = productOptions.find((p) => String(p.id) === String(pId));
    if (foundInOptions) return foundInOptions.name || foundInOptions.product_name;

    const foundInProducts = (Array.isArray(products) ? products : []).find(
      (p) => String(p.id) === String(pId)
    );
    if (foundInProducts) return foundInProducts.name || foundInProducts.product_name;

    return pId ? `Product #${pId}` : 'Product';
  };

  const getDisplayBranch = (item) => {
    if (item.branchName) return item.branchName;
    const bId = item.branchId ?? item.branch;
    if (typeof item.branch === 'string' && isNaN(item.branch) && !item.branch.startsWith('Branch #')) {
      return item.branch;
    }
    const found = branchesList.find((b) => String(b.id) === String(bId));
    if (found) return found.name || found.branch_name;
    return bId ? `Branch #${bId}` : 'Main Branch';
  };

  const handleOpenModal = () => {
    const defaultBranch = branchesList.length > 0 ? String(branchesList[0].id) : '1';
    const defaultProd = productOptions.length > 0 ? String(productOptions[0].id) : '1';
    setFormData({
      branch: defaultBranch,
      productId: defaultProd,
      type: 'Increase',
      quantity: '1',
      date: getTodayDateString(),
      reason: ''
    });
    setShowCalendarPopover(false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId || !formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }

    if (!formData.branch) {
      toast.error('Please select a branch');
      return;
    }

    const qtyNum = parseFloat(formData.quantity);
    const prodId = parseInt(formData.productId, 10) || 1;
    const branchId = parseInt(formData.branch, 10) || 1;

    const selectedProdObj = productOptions.find(
      (p) => String(p.id) === String(prodId)
    ) || (Array.isArray(products) ? products : []).find(
      (p) => String(p.id) === String(prodId)
    );
    const prodName = selectedProdObj ? (selectedProdObj.name || selectedProdObj.product_name) : `Product #${prodId}`;

    const selectedBranchObj = branchesList.find((b) => String(b.id) === String(branchId));
    const branchName = selectedBranchObj ? (selectedBranchObj.name || selectedBranchObj.branch_name) : `Branch #${branchId}`;

    const payload = {
      branch: branchId,
      product: prodId,
      adjustment_type: formData.type === 'Decrease' ? 'DECREASE' : 'INCREASE',
      quantity: String(qtyNum),
      adjustment_date: formData.date || getTodayDateString()
    };

    if (formData.reason && formData.reason.trim()) {
      payload.reason = formData.reason.trim();
    }

    // Each action generates a fresh, different random Idempotency-Key
    const idempotencyKey = generateUUID();

    setSubmitting(true);
    try {
      const res = await inventoryService.createAdjustment(payload, idempotencyKey);

      const isIncrease = (res?.adjustment_type || payload.adjustment_type) === 'INCREASE';
      const dispQty = parseFloat(res?.quantity || payload.quantity) || 0;

      const newRecord = {
        id: res?.id || Date.now(),
        adjustmentCode: `ADJ-${String(res?.id || 1).padStart(4, '0')}`,
        date: res?.adjustment_date || payload.adjustment_date,
        productId: res?.product || payload.product,
        productName: prodName,
        product: prodName,
        type: isIncrease ? 'Increase' : 'Decrease',
        quantity: isIncrease ? dispQty : -dispQty,
        reason: res?.reason || payload.reason || '',
        branchId: res?.branch || payload.branch,
        branchName: branchName,
        branch: branchName,
        createdBy: res?.created_by_name || (res?.created_by === 1 ? 'Admin' : (res?.created_by ? `User #${res.created_by}` : 'Admin'))
      };

      setAdjustmentsList((prev) => [newRecord, ...prev.filter((x) => x.id !== newRecord.id)]);
      setTotalCount((prev) => prev + 1);
      setShowModal(false);
      loadAdjustments(currentPage);
    } catch (err) {
      console.error('Failed to create adjustment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredAdjustments = adjustmentsList.filter((item) => {
    const itemBranchName = getDisplayBranch(item);
    const itemProductName = getDisplayProduct(item);

    if (selectedBranch !== 'All Branches' && itemBranchName !== selectedBranch) return false;
    if (selectedProduct !== 'All Products' && itemProductName !== selectedProduct) return false;
    if (selectedType !== 'All Types' && item.type !== selectedType) return false;
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    return true;
  });

  const totalItemsCount = totalCount || filteredAdjustments.length;
  const totalPagesCount = Math.max(1, Math.ceil(totalItemsCount / pageSize));
  const startItem = totalItemsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItemsCount);
  const emptyRowsCount = tableLoading ? 0 : Math.max(0, pageSize - filteredAdjustments.length);

  const selectedProdModalObj = productOptions.find(
    (p) => String(p.id) === String(formData.productId)
  ) || (Array.isArray(products) ? products : []).find(
    (p) => String(p.id) === String(formData.productId)
  );
  const selectedProductUnit = selectedProdModalObj?.unit || 'KG';

  return (
    <div className="space-y-6 font-sans w-full pb-10 animate-in fade-in duration-150">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
            <span>Inventory</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Stock Adjustments</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Adjustments</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Track manual inventory adjustments, stock reconciliation, damaged items, and count mismatches.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <IoAddOutline size={16} />
          <span>New Adjustment</span>
        </button>
      </div>

      {/* 2. Filter Controls Bar (Matching User Image Layout) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs cursor-pointer"
            >
              <option value="All Branches">All Branches</option>
              {branchesList.map((b) => (
                <option key={b.id} value={b.name || b.branch_name}>
                  {b.name || b.branch_name || `Branch #${b.id}`}
                </option>
              ))}
              {branchesList.length === 0 && (
                <>
                  <option value="Main Branch">Main Branch</option>
                  <option value="Branch A">Branch A</option>
                </>
              )}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs cursor-pointer"
            >
              <option value="All Products">All Products</option>
              {productOptions.map((p) => (
                <option key={p.id} value={p.name || p.product_name}>
                  {p.name || p.product_name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
            />
          </div>
        </div>

        {(selectedBranch !== 'All Branches' || selectedProduct !== 'All Products' || selectedType !== 'All Types' || startDate || endDate) && (
          <div className="pt-1">
            <button
              onClick={() => {
                setSelectedBranch('All Branches');
                setSelectedProduct('All Products');
                setSelectedType('All Types');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 3. Main Data Table Card with Min-Height & Pagination Footer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div>
          {/* Table matching user image exact structure */}
          <div className="overflow-x-auto min-h-[480px] w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                  <th className="py-3.5 px-5">Adjustment #</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Quantity</th>
                  <th className="py-3.5 px-5">Reason</th>
                  <th className="py-3.5 px-5">Branch</th>
                  <th className="py-3.5 px-5">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs bg-white">
                {tableLoading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse h-[52px]">
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-5 bg-slate-200 rounded-full w-16"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-12"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-36"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-20"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredAdjustments.length > 0 ? (
                  <>
                    {filteredAdjustments.map((item) => {
                      const isIncrease = item.type === 'Increase';
                      const formattedQty = isIncrease ? `+${Math.abs(item.quantity)}` : `-${Math.abs(item.quantity)}`;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                          {/* Adjustment # */}
                          <td className="py-3.5 px-5 font-semibold text-gray-900">
                            {item.adjustmentCode}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-5 text-gray-700 font-medium">
                            {item.date}
                          </td>

                          {/* Product */}
                          <td className="py-3.5 px-5 font-bold text-gray-900">
                            {getDisplayProduct(item)}
                          </td>

                          {/* Type (Pill Badge matching user image) */}
                          <td className="py-3.5 px-5">
                            {isIncrease ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Increase
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-900/10 text-amber-600 border border-amber-500/30">
                                Decrease
                              </span>
                            )}
                          </td>

                          {/* Quantity (+3 green / -3 red) */}
                          <td className={`py-3.5 px-5 font-bold tabular-nums ${isIncrease ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formattedQty}
                          </td>

                          {/* Reason */}
                          <td className="py-3.5 px-5 text-gray-600 font-medium">
                            {item.reason || '—'}
                          </td>

                          {/* Branch */}
                          <td className="py-3.5 px-5 text-gray-800 font-medium">
                            {getDisplayBranch(item)}
                          </td>

                          {/* Created By */}
                          <td className="py-3.5 px-5 text-gray-800 font-semibold">
                            {item.createdBy || 'Admin'}
                          </td>
                        </tr>
                      );
                    })}
                    {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="h-[52px] border-b border-gray-100/40">
                        <td colSpan="8">&nbsp;</td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-gray-400 font-medium">
                      No stock adjustment records found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Pagination Controls (Matching image footer: "Showing 1–3 of 3") */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
          <div>
            Showing <span className="font-bold text-gray-800">{startItem}–{endItem}</span> of{' '}
            <span className="font-bold text-gray-800">{totalItemsCount}</span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              disabled={currentPage === 1 || tableLoading}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-semibold"
            >
              Previous
            </button>

            {Array.from({ length: totalPagesCount }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  type="button"
                  disabled={tableLoading}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                    currentPage === pageNum
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
              disabled={currentPage >= totalPagesCount || tableLoading}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-semibold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 5. New Stock Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">New Stock Adjustment</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1 font-sans">
              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs cursor-pointer"
                >
                  <option value="">Select branch</option>
                  {branchesList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name || b.branch_name || `Branch #${b.id}`}
                    </option>
                  ))}
                  {branchesList.length === 0 && (
                    <>
                      <option value="1">Main Branch</option>
                      <option value="2">Branch A</option>
                    </>
                  )}
                </select>
              </div>

              {/* Product */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs cursor-pointer"
                >
                  <option value="">Select product</option>
                  {productOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.product_name} {p.unit ? `(${p.unit})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Adjustment Action */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Adjustment Action <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'Increase' })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      formData.type === 'Increase'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <IoAddOutline size={16} /> Increase (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'Decrease' })}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      formData.type === 'Decrease'
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity ({selectedProductUnit}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-bold shadow-2xs"
                />
              </div>

              {/* Date */}
              <div className="relative" ref={calendarRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Adjustment Date <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleToggleCalendar}
                  className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <IoCalendarOutline size={15} className="text-blue-600" />
                    <span className="font-semibold text-gray-800">
                      {formData.date ? formatDisplayDate(formData.date) : 'Select Date'}
                    </span>
                  </div>
                  <IoChevronDownOutline
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${
                      showCalendarPopover ? 'rotate-180' : ''
                    }`}
                    size={13}
                  />
                </button>

                {showCalendarPopover && (
                  <div
                    className={`absolute left-0 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-2xl rounded-2xl bg-white border border-gray-100 p-1 ${
                      popoverPlacement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
                    }`}
                  >
                    <Calendar
                      value={formData.date || getTodayDateString()}
                      onChange={(newDate) => {
                        setFormData({ ...formData, date: newDate });
                        setShowCalendarPopover(false);
                      }}
                      onClose={() => setShowCalendarPopover(false)}
                    />
                  </div>
                )}
              </div>

              {/* Adjustment Reason / Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Adjustment Reason / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g., Physical count adjustment or Damaged"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Adjustment'
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

export default StockAdjustments;
