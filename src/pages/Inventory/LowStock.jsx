import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoWarningOutline,
  IoCartOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCubeOutline,
  IoArrowForwardOutline,
  IoRefreshOutline,
  IoCheckmarkCircleOutline,
  IoPersonOutline,
  IoDocumentTextOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const initialLowStockData = [
  {
    id: 1,
    name: 'Mandi Special Spice Mix',
    sku: 'SKU-SPICE-04',
    category: 'Cooking Oils & Spices',
    currentStock: 18,
    minThreshold: 25,
    reorderQty: 20,
    unit: 'KG',
    estimatedCost: '₹ 9,000.00',
    preferredSupplier: 'Al Naaz Spices & Commodities',
    status: 'Low Stock'
  },
  {
    id: 2,
    name: 'Cooking Sunflower Oil (15L Tin)',
    sku: 'SKU-OIL-15L',
    category: 'Cooking Oils & Spices',
    currentStock: 6,
    minThreshold: 10,
    reorderQty: 10,
    unit: 'Tin',
    estimatedCost: '₹ 21,000.00',
    preferredSupplier: 'Global Food Products Trading',
    status: 'Low Stock'
  },
  {
    id: 3,
    name: 'Mineral Water 500ml Cases',
    sku: 'SKU-BEV-12',
    category: 'Beverages & Dairy',
    currentStock: 0,
    minThreshold: 15,
    reorderQty: 30,
    unit: 'Case',
    estimatedCost: '₹ 7,200.00',
    preferredSupplier: 'Pure Springs Bottling Co.',
    status: 'Out of Stock'
  },
  {
    id: 4,
    name: 'Basmati Rice (Extra Long)',
    sku: 'SKU-RICE-02',
    category: 'Rice, Grains & Pulses',
    currentStock: 45,
    minThreshold: 100,
    reorderQty: 200,
    unit: 'KG',
    estimatedCost: '₹ 24,000.00',
    preferredSupplier: 'Punjab Grain Merchants',
    status: 'Critical Deficit'
  }
];

const LowStock = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialLowStockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(q);
      const skuMatch = item.sku.toLowerCase().includes(q);
      const supMatch = item.preferredSupplier.toLowerCase().includes(q);
      if (!nameMatch && !skuMatch && !supMatch) return false;
    }

    return true;
  });

  const totalLowStock = items.length;
  const outOfStockCount = items.filter((i) => i.currentStock === 0).length;

  const handleReorder = (item) => {
    toast.success(`Creating Purchase Order for ${item.name}... Routing to Procurement.`);
    navigate('/procurement/purchases');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700">Low Stock Dashboard</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Low Stock & Safety Audit</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Automated reorder alerts, safety buffer threshold audits, and direct Purchase Order triggers.
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
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoPersonOutline size={16} /> Preferred Suppliers
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCartOutline size={18} /> Bulk Create POs
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Low Stock */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Reorder Items</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalLowStock} SKUs</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Below Minimum Threshold</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Critical Out of Stock</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{outOfStockCount} SKUs</h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Zero Balance Remaining</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>

        {/* Preferred Suppliers Routing */}
        <div
          onClick={() => navigate('/procurement/suppliers')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-blue-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Supplier Network</p>
            <h3 className="text-sm font-bold text-blue-600 flex items-center gap-1">
              Procurement Center <IoArrowForwardOutline size={14} />
            </h3>
            <p className="text-[10px] font-medium text-gray-400 mt-1">Reorder PO Integration</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={24} />
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search low stock items by name, SKU or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2">
            <IoFilterOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Rice, Grains & Pulses">Rice, Grains & Pulses</option>
              <option value="Meat & Poultry">Meat & Poultry</option>
              <option value="Cooking Oils & Spices">Cooking Oils & Spices</option>
              <option value="Vegetables & Fresh Produce">Vegetables & Fresh Produce</option>
              <option value="Beverages & Dairy">Beverages & Dairy</option>
            </select>
          </div>

        </div>

        {/* Low Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">SKU / Code</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Current Stock</th>
                <th className="p-3.5 text-center">Safety Threshold</th>
                <th className="p-3.5 text-center">Suggested Reorder</th>
                <th className="p-3.5">Preferred Supplier</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center pr-5">Reorder PO Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-gray-700 whitespace-nowrap">
                      {item.sku}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => navigate('/inventory/products')}
                        className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                        title="View Product in Catalog"
                      >
                        {item.name}
                      </button>
                    </td>

                    <td className="p-3.5 text-gray-600 whitespace-nowrap">
                      {item.category}
                    </td>

                    <td className="p-3.5 text-center font-bold whitespace-nowrap">
                      <span className={item.currentStock === 0 ? 'text-rose-600 font-mono text-sm font-black' : 'text-amber-600 font-mono text-sm'}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>

                    <td className="p-3.5 text-center text-gray-500 font-mono whitespace-nowrap">
                      {item.minThreshold} {item.unit}
                    </td>

                    <td className="p-3.5 text-center font-bold text-blue-600 font-mono whitespace-nowrap">
                      +{item.reorderQty} {item.unit}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => navigate('/procurement/suppliers')}
                        className="font-medium text-gray-800 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                        title="View Supplier Profile"
                      >
                        {item.preferredSupplier}
                      </button>
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                          item.currentStock === 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleReorder(item)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1 mx-auto cursor-pointer"
                        title="Create Purchase Order for this item"
                      >
                        <IoCartOutline size={14} /> Reorder PO
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No low stock items found matching your criteria.
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
