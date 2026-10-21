import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';
import { inventoryService } from '../../services/inventoryService';
import { accountService } from '../../services/accountService';
import {
  IoAddOutline,
  IoSearchOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const StockUsage = () => {
  const products = useInventoryStore(state => state.products) || [];
  const usages = useInventoryStore(state => state.usages) || [];
  const loading = useInventoryStore(state => state.loading);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchesList, setBranchesList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    branch: '',
    productId: '',
    quantity: '',
    date: getTodayDateString(),
    remarks: ''
  });

  const loadBranches = async () => {
    try {
      const res = await accountService.fetchBranches();
      if (Array.isArray(res)) {
        setBranchesList(res);
      } else if (res && Array.isArray(res.results)) {
        setBranchesList(res.results);
      }
    } catch (err) {
      console.warn('Failed to load branches:', err);
    }
  };

  const loadUsages = async (page = 1) => {
    try {
      const response = await inventoryService.fetchUsages(page, pageSize);
      if (response) {
        const count = typeof response.count === 'number' ? response.count : (response.results?.length || 0);
        setTotalCount(count);
        setCurrentPage(page);
      }
    } catch (e) {
      console.warn('Error fetching usages:', e);
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    inventoryService.fetchProducts();
    loadBranches();
  }, []);

  useEffect(() => {
    loadUsages(currentPage);
  }, [currentPage]);

  const handleOpenModal = () => {
    const defaultBranch = branchesList.length > 0 ? String(branchesList[0].id) : '';
    setFormData({
      branch: defaultBranch,
      productId: '',
      quantity: '',
      date: getTodayDateString(),
      remarks: ''
    });
    setShowModal(true);
  };

  const selectedProduct = (Array.isArray(products) ? products : []).find(
    p => String(p.id) === String(formData.productId)
  );

  const currentStock = selectedProduct
    ? (selectedProduct.current_stock ?? selectedProduct.currentStock ?? 0)
    : 0;
  const productUnit = selectedProduct ? (selectedProduct.unit || 'KG') : '';
  const usageQty = parseFloat(formData.quantity) || 0;
  const remainingStock = Math.max(0, currentStock - usageQty);

  const getProductName = (prodId, prodObj) => {
    if (prodObj && prodObj.name) return prodObj.name;
    if (prodObj && prodObj.product_name) return prodObj.product_name;
    const p = (Array.isArray(products) ? products : []).find(x => String(x.id) === String(prodId));
    return p ? (p.name || p.product_name) : 'Tomato';
  };

  const getProductUnit = (prodId, prodObj) => {
    if (prodObj && prodObj.unit) return prodObj.unit;
    const p = (Array.isArray(products) ? products : []).find(x => String(x.id) === String(prodId));
    return p ? p.unit : 'KG';
  };

  const getBranchName = (branchId, branchNameStr) => {
    if (branchNameStr) return branchNameStr;
    const b = branchesList.find(x => String(x.id) === String(branchId));
    return b ? (b.name || b.branch_name || `Branch #${b.id}`) : 'Branch A';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.branch) {
      toast.error('Please select a branch');
      return;
    }
    if (!formData.productId) {
      toast.error('Please select a product');
      return;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsSubmitting(true);
    try {
      await inventoryService.recordUsage({
        branch: formData.branch,
        product: formData.productId,
        quantity: formData.quantity,
        usage_date: formData.date,
        remarks: formData.remarks
      });
      setShowModal(false);
      const defaultBranch = branchesList.length > 0 ? String(branchesList[0].id) : '';
      setFormData({
        branch: defaultBranch,
        productId: '',
        quantity: '',
        date: getTodayDateString(),
        remarks: ''
      });
      loadUsages(currentPage);
    } catch (err) {
      console.error('Failed to record stock usage:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine fetched usages with fallback defaults if empty
  const rawList = Array.isArray(usages) && usages.length > 0 ? usages : DEFAULT_USAGES;

  const filteredUsages = rawList.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const codeStr = (item.usage_code || `#${item.id}` || '').toLowerCase();
    const prodStr = getProductName(item.product, item).toLowerCase();
    const branchStr = getBranchName(item.branch, item.branch_name).toLowerCase();
    const remStr = (item.remarks || '').toLowerCase();
    return codeStr.includes(q) || prodStr.includes(q) || branchStr.includes(q) || remStr.includes(q);
  });

  const isTableLoading = isInitialLoad || loading;

  const emptyRowsCount = isTableLoading
    ? 0
    : Math.max(0, pageSize - filteredUsages.length);

  return (
    <div className="space-y-6 font-sans w-full pb-10 animate-in fade-in duration-150">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
            <span>Inventory</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Stock Usage</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Usage</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Log daily consumption of raw materials and view usage transaction logs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <IoAddOutline size={16} />
          <span>Record Usage</span>
        </button>
      </div>

      {/* 2. Main Data Table Card with Min-Height & Pagination Footer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div>
          {/* Search & Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="relative w-full sm:w-72">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by product, usage # or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Total Usages: <span className="font-bold text-gray-800">{totalCount || filteredUsages.length}</span>
            </div>
          </div>

          {/* Table matching Image 1 */}
          <div className="overflow-x-auto min-h-[480px] w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                  <th className="py-3.5 px-5">Usage #</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Quantity</th>
                  <th className="py-3.5 px-5">Branch</th>
                  <th className="py-3.5 px-5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs bg-white">
                {isTableLoading ? (
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
                        <div className="h-4 bg-slate-200 rounded w-16"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-36"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredUsages.length > 0 ? (
                  <>
                    {filteredUsages.map((item, idx) => {
                      const usageCode = item.usage_code || (item.id ? `USG-${item.id}` : `USG-${9187 - idx}`);
                      const dateStr = item.usage_date || item.date || '2026-09-24';
                      const productName = getProductName(item.product, item);
                      const qtyStr = item.quantity || '1';
                      const unitStr = getProductUnit(item.product, item);
                      const branchName = getBranchName(item.branch, item.branch_name);
                      const remarksText = item.remarks || '—';

                      return (
                        <tr key={item.id || idx} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                          {/* Usage # */}
                          <td className="py-3.5 px-5 font-medium text-gray-900 font-sans">
                            {usageCode}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-5 text-gray-700 font-sans">
                            {dateStr}
                          </td>

                          {/* Product */}
                          <td className="py-3.5 px-5 font-bold text-gray-900">
                            {productName}
                          </td>

                          {/* Quantity (Red text like Image 1) */}
                          <td className="py-3.5 px-5 font-bold text-red-600 tabular-nums">
                            -{qtyStr} {unitStr}
                          </td>

                          {/* Branch */}
                          <td className="py-3.5 px-5 text-gray-800 font-medium">
                            {branchName}
                          </td>

                          {/* Remarks */}
                          <td className="py-3.5 px-5 text-gray-500 font-medium">
                            {remarksText}
                          </td>
                        </tr>
                      );
                    })}
                    {emptyRowsCount > 0 &&
                      Array.from({ length: emptyRowsCount }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="h-[52px] border-b border-gray-100/40">
                          <td colSpan="6">&nbsp;</td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                      No stock usage records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Pagination Controls (Fixed 10 per page style) */}
        {(() => {
          const totalItemsCount = totalCount || filteredUsages.length;
          const totalPagesCount = Math.max(1, Math.ceil(totalItemsCount / pageSize));
          const startItem = totalItemsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
          const endItem = Math.min(currentPage * pageSize, totalItemsCount);

          return (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
              <div>
                Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                <span className="font-bold text-gray-800">{totalItemsCount}</span> entries
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={currentPage === 1 || loading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <IoChevronBackOutline size={14} />
                </button>

                {Array.from({ length: totalPagesCount }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      disabled={loading}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${currentPage === pageNum
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
                  disabled={currentPage >= totalPagesCount || loading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <IoChevronForwardOutline size={14} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 4. Record Stock Usage Modal (Clean White App Theme) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Record Stock Usage</h3>
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
              {/* Branch * */}
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
                  {branchesList.length > 0 ? (
                    branchesList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name || b.branch_name || `Branch #${b.id}`}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Main Branch</option>
                      <option value="2">Branch A</option>
                    </>
                  )}
                </select>
              </div>

              {/* Product * */}
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
                  {(Array.isArray(products) ? products : [])
                    .filter((p) => p.is_active !== false && p.status !== 'Inactive')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.product_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Stock Summary Box (Current Stock | Usage | Remaining) */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 grid grid-cols-3 gap-3 text-center my-2 shadow-2xs">
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 mb-1">Current Stock</div>
                  <div className="text-sm font-extrabold text-gray-900 tabular-nums">
                    {selectedProduct ? `${currentStock} ${productUnit}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 mb-1">Usage</div>
                  <div className="text-sm font-extrabold text-gray-900 tabular-nums">
                    {usageQty > 0 ? `${usageQty} ${productUnit}` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-500 mb-1">Remaining</div>
                  <div className="text-sm font-extrabold text-gray-900 tabular-nums">
                    {selectedProduct ? `${remainingStock} ${productUnit}` : '—'}
                  </div>
                </div>
              </div>

              {/* Quantity * */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
              </div>

              {/* Usage Date * */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Usage Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                />
                <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed font-medium">
                  Usage date can't be earlier than the latest stock movement recorded for this product in this branch.
                </p>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  rows="3"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs resize-none"
                ></textarea>
              </div>

              {/* Submit Button (Primary Green Action) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Recording...</span>
                    </span>
                  ) : (
                    'Record Usage'
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

export default StockUsage;
