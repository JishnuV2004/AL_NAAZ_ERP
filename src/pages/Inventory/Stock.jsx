import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoCubeOutline,
  IoWarningOutline,
  IoSwapHorizontalOutline,
  IoAddOutline,
  IoRemoveOutline,
  IoDownloadOutline,
  IoCartOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const initialStockData = [
  {
    id: 101,
    name: 'Basmati Rice (Premium Long Grain)',
    sku: 'SKU-RICE-01',
    category: 'Rice, Grains & Pulses',
    quantity: 450,
    unit: 'KG',
    minStock: 100,
    location: 'Central Storage - Bin A1',
    unitPrice: 110.00,
    status: 'In Stock'
  },
  {
    id: 102,
    name: 'Mandi Special Spice Mix',
    sku: 'SKU-SPICE-04',
    category: 'Cooking Oils & Spices',
    quantity: 18,
    unit: 'KG',
    minStock: 25,
    location: 'Kitchen Pantry - Shelf 3',
    unitPrice: 450.00,
    status: 'Low Stock'
  },
  {
    id: 103,
    name: 'Fresh Mutton Cuts',
    sku: 'SKU-MEAT-02',
    category: 'Meat & Poultry',
    quantity: 85,
    unit: 'KG',
    minStock: 50,
    location: 'Cold Storage Room 1',
    unitPrice: 650.00,
    status: 'In Stock'
  },
  {
    id: 104,
    name: 'Cooking Sunflower Oil (15L Tin)',
    sku: 'SKU-OIL-15L',
    category: 'Cooking Oils & Spices',
    quantity: 6,
    unit: 'Tin',
    minStock: 10,
    location: 'Dry Goods Storage',
    unitPrice: 2100.00,
    status: 'Low Stock'
  },
  {
    id: 105,
    name: 'Onions (Red Medium)',
    sku: 'SKU-VEG-09',
    category: 'Vegetables & Fresh Produce',
    quantity: 320,
    unit: 'KG',
    minStock: 80,
    location: 'Produce Rack B',
    unitPrice: 32.00,
    status: 'In Stock'
  },
  {
    id: 106,
    name: 'Mineral Water 500ml Cases',
    sku: 'SKU-BEV-12',
    category: 'Beverages & Dairy',
    quantity: 0,
    unit: 'Case',
    minStock: 15,
    location: 'Beverage Rack C',
    unitPrice: 240.00,
    status: 'Out of Stock'
  }
];

const Stock = () => {
  const navigate = useNavigate();
  const [stockItems, setStockItems] = useState(initialStockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Adjust Stock Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustType, setAdjustType] = useState('Add'); // 'Add' or 'Reduce'
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustNotes, setAdjustNotes] = useState('');

  // Stats calculation
  const totalItems = stockItems.length;
  const totalValue = stockItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const lowStockCount = stockItems.filter((i) => i.quantity > 0 && i.quantity <= i.minStock).length;
  const outOfStockCount = stockItems.filter((i) => i.quantity === 0).length;

  // Filtered List
  const filteredStock = stockItems.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(q);
      const skuMatch = item.sku.toLowerCase().includes(q);
      const locMatch = item.location.toLowerCase().includes(q);
      if (!nameMatch && !skuMatch && !locMatch) return false;
    }

    return true;
  });

  const getStatusBadge = (item) => {
    if (item.quantity === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-rose-100 text-rose-800 uppercase border border-rose-200">
          Out of Stock
        </span>
      );
    }
    if (item.quantity <= item.minStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-amber-100 text-amber-800 uppercase border border-amber-200">
          Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 uppercase border border-emerald-200">
        In Stock
      </span>
    );
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const changeQty = parseInt(adjustQty, 10) || 0;
    if (changeQty <= 0) {
      toast.error('Quantity must be greater than 0.');
      return;
    }

    setStockItems((prev) =>
      prev.map((item) => {
        if (item.id === selectedItem.id) {
          const newQty = adjustType === 'Add' ? item.quantity + changeQty : Math.max(0, item.quantity - changeQty);
          let newStatus = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= item.minStock) newStatus = 'Low Stock';

          return { ...item, quantity: newQty, status: newStatus };
        }
        return item;
      })
    );

    toast.success(`Stock for ${selectedItem.name} updated successfully!`);
    setSelectedItem(null);
    setAdjustQty(1);
    setAdjustNotes('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Inventory</span> &gt; <span className="text-gray-700">Live Stock</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Live Stock Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Monitor real-time warehouse inventory, track stock levels, and audit storage locations.
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
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Stock Items</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalItems} SKUs</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Monitored Items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCubeOutline size={24} />
          </div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Stock Valuation</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Warehouse Holding Value</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        {/* Low Stock Items */}
        <div
          onClick={() => setStatusFilter('Low Stock')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Low Stock Warning</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{lowStockCount} Items</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Below Reorder Threshold</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={() => setStatusFilter('Out of Stock')}
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
              placeholder="Search stock item by name, SKU or storage location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Category Filter */}
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">SKU / Code</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Available Stock</th>
                <th className="p-3.5 text-center">Min Safety Stock</th>
                <th className="p-3.5">Storage Location</th>
                <th className="p-3.5 text-right">Unit Price</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center pr-5">Actions & ERP Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredStock.length > 0 ? (
                filteredStock.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-gray-700 whitespace-nowrap">
                      {item.sku}
                    </td>

                    {/* Product Name with Link */}
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

                    <td className="p-3.5 text-center font-bold text-gray-900 whitespace-nowrap">
                      <span className="font-mono text-sm">{item.quantity}</span> {item.unit}
                    </td>

                    <td className="p-3.5 text-center text-gray-500 whitespace-nowrap">
                      {item.minStock} {item.unit}
                    </td>

                    <td className="p-3.5 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                      {item.location}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-center whitespace-nowrap">
                      {getStatusBadge(item)}
                    </td>

                    <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setAdjustType('Add');
                            setAdjustQty(1);
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
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No stock items found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
                <p className="font-bold text-gray-900">{selectedItem.name}</p>
                <p className="text-[11px] text-gray-500 font-mono">
                  Current Quantity: <strong className="text-gray-800">{selectedItem.quantity} {selectedItem.unit}</strong>
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('Add')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      adjustType === 'Add'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <IoAddOutline size={16} /> Add Stock (Inward)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('Reduce')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      adjustType === 'Reduce'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <IoRemoveOutline size={16} /> Reduce Stock (Damage/Loss)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity ({selectedItem.unit})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Adjustment Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Received shipment PO-8890 or Damaged during transport"
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
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Adjustment
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
