import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/inventoryService';
import {
  IoSearchOutline,
  IoDocumentTextOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoCubeOutline,
  IoCartOutline,
  IoEyeOutline,
  IoCloseOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const formatDateTime = (dateStr, createdAt) => {
  if (createdAt && createdAt.includes('T')) {
    const d = createdAt.slice(0, 10);
    const t = createdAt.slice(11, 16);
    return `${d} ${t}`;
  }
  return dateStr || '—';
};

const INITIAL_LEDGER_DATA = [
  {
    id: 13,
    branch: 1,
    product: 1,
    productName: 'tomato',
    unit: 'KG',
    movementType: 'USAGE',
    quantity: '-5.00',
    qtyNum: -5,
    balanceBefore: null,
    balanceAfter: '5.00',
    movementDate: '2026-09-24',
    referenceType: '',
    referenceId: 7,
    remarks: 'Usage #7',
    createdBy: null,
    createdByName: null,
    supplierName: null,
    totalPrice: null,
    unitPrice: null,
    createdAt: '2026-09-24T09:22:44.119465+05:30'
  },
  {
    id: 12,
    branch: 1,
    product: 1,
    productName: 'tomato',
    unit: 'KG',
    movementType: 'PURCHASE',
    quantity: '10.00',
    qtyNum: 10,
    balanceBefore: null,
    balanceAfter: '10.00',
    movementDate: '2026-09-16',
    referenceType: '',
    referenceId: 8,
    remarks: 'Purchase #8',
    createdBy: null,
    createdByName: null,
    supplierName: null,
    totalPrice: null,
    unitPrice: null,
    createdAt: '2026-09-16T22:07:05.830793+05:30'
  }
];

const StockLedger = () => {
  const navigate = useNavigate();
  const [ledgerData, setLedgerData] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal View state
  const [selectedEntry, setSelectedEntry] = useState(null);

  const loadLedger = async (pageToLoad = 1) => {
    setTableLoading(true);
    try {
      const data = await inventoryService.fetchLedger(pageToLoad, pageSize);
      const rawResults = Array.isArray(data) ? data : (data?.results || []);
      const count = typeof data?.count === 'number' ? data.count : rawResults.length;

      if (rawResults.length > 0) {
        const mapped = rawResults.map((item) => {
          const qty = parseFloat(item.quantity || 0);
          const rawType = item.movement_type || '';
          const cleanUnit = item.unit || 'KG';

          return {
            id: item.id,
            branch: item.branch,
            product: item.product,
            productName: item.product_name || `Product #${item.product || item.id}`,
            unit: cleanUnit,
            movementType: rawType,
            quantity: item.quantity,
            qtyNum: qty,
            balanceBefore: item.balance_before,
            balanceAfter: item.balance_after,
            movementDate: item.movement_date || '',
            referenceType: item.reference_type || '',
            referenceId: item.reference_id,
            remarks: item.remarks || '',
            createdBy: item.created_by,
            createdByName: item.created_by_name,
            supplierName: item.supplier_name,
            totalPrice: item.total_price,
            unitPrice: item.unit_price,
            createdAt: item.created_at || ''
          };
        });
        setLedgerData(mapped);
        setTotalCount(count);
      } else {
        setLedgerData([]);
        setTotalCount(count);
      }
      setCurrentPage(pageToLoad);
    } catch (err) {
      console.warn('Failed to load stock ledger:', err);
      if (ledgerData.length === 0) {
        setLedgerData(INITIAL_LEDGER_DATA);
        setTotalCount(INITIAL_LEDGER_DATA.length);
      }
    } finally {
      setTableLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadLedger(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPagesCount || tableLoading) return;
    loadLedger(newPage);
  };

  // Filtered List by search term
  const filteredLedger = ledgerData.filter((item) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = (item.productName || '').toLowerCase().includes(q);
      const refMatch = (item.remarks || '').toLowerCase().includes(q);
      const typeMatch = (item.movementType || '').toLowerCase().includes(q);
      const idMatch = String(item.id || '').includes(q);
      if (!nameMatch && !refMatch && !typeMatch && !idMatch) return false;
    }
    return true;
  });

  const totalInward = ledgerData
    .filter((i) => i.qtyNum > 0)
    .reduce((sum, i) => sum + i.qtyNum, 0);

  const totalOutward = ledgerData
    .filter((i) => i.qtyNum < 0)
    .reduce((sum, i) => sum + Math.abs(i.qtyNum), 0);

  const totalItemsCount = totalCount || filteredLedger.length;
  const totalPagesCount = Math.max(1, Math.ceil(totalItemsCount / pageSize));
  const startItem = totalItemsCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItemsCount);
  const emptyRowsCount = tableLoading ? 0 : Math.max(0, pageSize - filteredLedger.length);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150 font-sans">
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700">Stock Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Stock Audit Ledger</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Complete transaction history log of inventory receipts, kitchen consumption, and stock adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/inventory/stock')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCubeOutline size={16} /> Live Stock
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCartOutline size={16} /> Purchase Orders
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inward */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Inward Received</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">+{totalInward.toFixed(1)} Units</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">PO Inward Deliveries</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoArrowDownOutline size={24} />
          </div>
        </div>

        {/* Total Outward */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Outward Consumption</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">-{totalOutward.toFixed(1)} Units</h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Kitchen & Service Usage</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoArrowUpOutline size={24} />
          </div>
        </div>

        {/* Total Transactions */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Ledger Entries</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalItemsCount} Log Entries</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Audited Transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={24} />
          </div>
        </div>
      </div>

      {/* Main Container with Min-Height & Stable 10-Row Height */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div>
          {/* Search Toolbar (Movement and Date filters removed) */}
          <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by product name or remarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Total Entries: <span className="font-bold text-gray-800">{totalItemsCount}</span>
            </div>
          </div>

          {/* Stock Ledger Table */}
          <div className="overflow-x-auto min-h-[480px] w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-600 font-bold whitespace-nowrap">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Movement Type</th>
                  <th className="py-3.5 px-5 text-center">Quantity</th>
                  <th className="py-3.5 px-5 text-center">Balance After</th>
                  <th className="py-3.5 px-5">Remarks / Ref</th>
                  <th className="py-3.5 px-5 text-center pr-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-xs">
                {tableLoading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse h-[52px]">
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-24"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-5 bg-slate-200 rounded-full w-24"></div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 bg-slate-200 rounded w-28"></div>
                      </td>
                      <td className="py-3.5 px-5 pr-5 text-center">
                        <div className="h-7 bg-slate-200 rounded-lg w-16 mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLedger.length > 0 ? (
                  <>
                    {filteredLedger.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/80 transition-colors h-[52px]">
                        {/* Date */}
                        <td className="py-3.5 px-5 font-medium text-gray-700 whitespace-nowrap">
                          {row.movementDate || '—'}
                        </td>

                        {/* Product */}
                        <td className="py-3.5 px-5 font-bold text-gray-900 whitespace-nowrap">
                          {row.productName}
                        </td>

                        {/* Movement Type - Exactly actual response data */}
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {row.movementType ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                                row.movementType === 'PURCHASE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : row.movementType === 'USAGE'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : row.movementType === 'ADJUSTMENT'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}
                            >
                              {row.movementType}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Quantity */}
                        <td className="py-3.5 px-5 text-center font-mono font-extrabold whitespace-nowrap">
                          <span className={row.qtyNum > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {row.quantity} {row.unit}
                          </span>
                        </td>

                        {/* Balance After */}
                        <td className="py-3.5 px-5 text-center font-mono font-bold text-gray-900 whitespace-nowrap">
                          {row.balanceAfter !== null && row.balanceAfter !== undefined
                            ? `${row.balanceAfter} ${row.unit}`
                            : '—'}
                        </td>

                        {/* Remarks / Reference */}
                        <td className="py-3.5 px-5 text-gray-600 font-medium whitespace-nowrap">
                          {row.remarks || (row.referenceId ? `Ref #${row.referenceId}` : '—')}
                        </td>

                        {/* Action (View Details) */}
                        <td className="py-3.5 px-5 pr-5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(row)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-200 transition-colors font-semibold text-xs cursor-pointer shadow-2xs"
                            title="View all details"
                          >
                            <IoEyeOutline size={15} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {emptyRowsCount > 0 &&
                      Array.from({ length: emptyRowsCount }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="h-[52px] border-b border-gray-100/40">
                          <td colSpan={7}>&nbsp;</td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                      No stock ledger transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
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

      {/* View Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/70">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Stock Ledger Details
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Record #{selectedEntry.id} • {selectedEntry.movementDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Modal Body with All Response Data */}
            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1 font-sans">
              {/* Product & Movement Summary Banner */}
              <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                    Product
                  </span>
                  <p className="font-bold text-gray-900 text-sm">
                    {selectedEntry.productName}
                  </p>
                  <span className="text-[11px] text-gray-500 font-mono">
                    Product ID: #{selectedEntry.product} • Unit: {selectedEntry.unit}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Movement Type
                  </span>
                  {selectedEntry.movementType ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                        selectedEntry.movementType === 'PURCHASE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedEntry.movementType === 'USAGE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : selectedEntry.movementType === 'ADJUSTMENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {selectedEntry.movementType}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Quantity
                  </span>
                  <p
                    className={`text-base font-extrabold font-mono ${
                      selectedEntry.qtyNum > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {selectedEntry.quantity} {selectedEntry.unit}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Balance After
                  </span>
                  <p className="text-base font-extrabold font-mono text-gray-900">
                    {selectedEntry.balanceAfter !== null && selectedEntry.balanceAfter !== undefined
                      ? `${selectedEntry.balanceAfter} ${selectedEntry.unit}`
                      : '—'}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Balance Before
                  </span>
                  <p className="font-mono font-medium text-gray-700">
                    {selectedEntry.balanceBefore !== null && selectedEntry.balanceBefore !== undefined
                      ? `${selectedEntry.balanceBefore} ${selectedEntry.unit}`
                      : '—'}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Branch ID
                  </span>
                  <p className="font-medium text-gray-800">Branch #{selectedEntry.branch}</p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Movement Date
                  </span>
                  <p className="font-medium text-gray-800">{selectedEntry.movementDate || '—'}</p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Reference
                  </span>
                  <p className="font-medium text-gray-800">
                    {selectedEntry.referenceId
                      ? `${selectedEntry.referenceType || 'Ref'} #${selectedEntry.referenceId}`
                      : selectedEntry.referenceType || '—'}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Supplier Name
                  </span>
                  <p className="font-medium text-gray-800">{selectedEntry.supplierName || '—'}</p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Created By
                  </span>
                  <p className="font-medium text-gray-800">
                    {selectedEntry.createdByName ||
                      (selectedEntry.createdBy ? `User #${selectedEntry.createdBy}` : '—')}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Unit Price
                  </span>
                  <p className="font-mono font-medium text-gray-800">
                    {selectedEntry.unitPrice ? `₹${parseFloat(selectedEntry.unitPrice).toFixed(2)}` : '—'}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Total Price
                  </span>
                  <p className="font-mono font-bold text-gray-900">
                    {selectedEntry.totalPrice ? `₹${parseFloat(selectedEntry.totalPrice).toFixed(2)}` : '—'}
                  </p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Remarks
                  </span>
                  <p className="font-medium text-gray-800">{selectedEntry.remarks || '—'}</p>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-xl col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Created Timestamp
                  </span>
                  <p className="font-mono text-gray-600 text-[11px]">
                    {selectedEntry.createdAt
                      ? formatDateTime(selectedEntry.movementDate, selectedEntry.createdAt)
                      : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLedger;
