import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoDocumentTextOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoSwapHorizontalOutline,
  IoCubeOutline,
  IoCartOutline,
  IoDownloadOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const initialLedgerData = [
  {
    id: 'TXN-LDG-901',
    date: '2026-09-24 14:30',
    productName: 'Basmati Rice (Premium Long Grain)',
    sku: 'SKU-RICE-01',
    category: 'Rice, Grains & Pulses',
    type: 'Inward (PO Received)',
    qtyChange: +100,
    balance: 450,
    unit: 'KG',
    refNo: 'PO-2026-8821',
    performedBy: 'Store Keeper - Rahul'
  },
  {
    id: 'TXN-LDG-902',
    date: '2026-09-24 11:15',
    productName: 'Fresh Mutton Cuts',
    sku: 'SKU-MEAT-02',
    category: 'Meat & Poultry',
    type: 'Outward (Kitchen Usage)',
    qtyChange: -25,
    balance: 85,
    unit: 'KG',
    refNo: 'KIT-REQ-4402',
    performedBy: 'Head Cook'
  },
  {
    id: 'TXN-LDG-903',
    date: '2026-09-23 16:45',
    productName: 'Mandi Special Spice Mix',
    sku: 'SKU-SPICE-04',
    category: 'Cooking Oils & Spices',
    type: 'Stock Adjustment (Loss)',
    qtyChange: -2,
    balance: 18,
    unit: 'KG',
    refNo: 'ADJ-SPI-009',
    performedBy: 'Inventory Admin'
  },
  {
    id: 'TXN-LDG-904',
    date: '2026-09-22 09:20',
    productName: 'Cooking Sunflower Oil (15L Tin)',
    sku: 'SKU-OIL-15L',
    category: 'Cooking Oils & Spices',
    type: 'Inward (PO Received)',
    qtyChange: +10,
    balance: 16,
    unit: 'Tin',
    refNo: 'PO-2026-8799',
    performedBy: 'Store Keeper - Rahul'
  },
  {
    id: 'TXN-LDG-905',
    date: '2026-09-21 18:00',
    productName: 'Onions (Red Medium)',
    sku: 'SKU-VEG-09',
    category: 'Vegetables & Fresh Produce',
    type: 'Outward (Kitchen Usage)',
    qtyChange: -40,
    balance: 320,
    unit: 'KG',
    refNo: 'KIT-REQ-4389',
    performedBy: 'Head Cook'
  }
];

const StockLedger = () => {
  const navigate = useNavigate();
  const [ledgerData] = useState(initialLedgerData);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState('This Month');

  // Filtered List
  const filteredLedger = ledgerData.filter((item) => {
    if (typeFilter !== 'All' && !item.type.includes(typeFilter)) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = item.productName.toLowerCase().includes(q);
      const skuMatch = item.sku.toLowerCase().includes(q);
      const refMatch = item.refNo.toLowerCase().includes(q);
      const idMatch = item.id.toLowerCase().includes(q);
      if (!nameMatch && !skuMatch && !refMatch && !idMatch) return false;
    }

    return true;
  });

  const totalInward = ledgerData
    .filter((i) => i.qtyChange > 0)
    .reduce((sum, i) => sum + i.qtyChange, 0);

  const totalOutward = ledgerData
    .filter((i) => i.qtyChange < 0)
    .reduce((sum, i) => sum + Math.abs(i.qtyChange), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
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
          <button
            type="button"
            onClick={() => toast.success(`Exporting Stock Ledger Report for ${dateRange}...`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoDownloadOutline size={16} /> Export Ledger PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Inward */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Inward Received</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">+{totalInward} Units</h3>
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
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">-{totalOutward} Units</h3>
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
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{ledgerData.length} Log Entries</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Audited Transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={24} />
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
              placeholder="Search by Txn ID, product, SKU or reference PO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Movement Type Filter */}
          <div className="flex items-center gap-2">
            <IoFilterOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Movements</option>
              <option value="Inward">Inward (Received)</option>
              <option value="Outward">Outward (Usage)</option>
              <option value="Adjustment">Adjustments</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <IoCalendarOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

        </div>

        {/* Stock Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">Txn ID</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Movement Type</th>
                <th className="p-3.5 text-center">Qty Change</th>
                <th className="p-3.5 text-center">Closing Balance</th>
                <th className="p-3.5">Ref / PO #</th>
                <th className="p-3.5 pr-5">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredLedger.length > 0 ? (
                filteredLedger.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-gray-700 whitespace-nowrap">
                      {row.id}
                    </td>

                    <td className="p-3.5 font-mono text-gray-600 whitespace-nowrap">
                      {row.date}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => navigate('/inventory/products')}
                        className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                        title="View Product Details"
                      >
                        {row.productName}
                      </button>
                      <span className="text-[11px] text-gray-400 font-mono block">
                        {row.sku} • {row.category}
                      </span>
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          row.qtyChange > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {row.qtyChange > 0 ? <IoArrowDownOutline size={12} /> : <IoArrowUpOutline size={12} />}
                        {row.type}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-extrabold whitespace-nowrap">
                      <span className={row.qtyChange > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {row.qtyChange > 0 ? `+${row.qtyChange}` : row.qtyChange} {row.unit}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-gray-900 whitespace-nowrap">
                      {row.balance} {row.unit}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      {row.refNo.startsWith('PO-') ? (
                        <button
                          type="button"
                          onClick={() => navigate('/procurement/purchases')}
                          className="font-mono font-bold text-blue-600 hover:underline cursor-pointer"
                          title="View Purchase Order in Procurement"
                        >
                          {row.refNo}
                        </button>
                      ) : (
                        <span className="font-mono text-gray-600">{row.refNo}</span>
                      )}
                    </td>

                    <td className="p-3.5 pr-5 text-gray-600 font-medium whitespace-nowrap">
                      {row.performedBy}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No stock ledger transactions found.
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

export default StockLedger;
