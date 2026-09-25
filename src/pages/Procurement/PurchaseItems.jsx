import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  IoSearchOutline,
  IoCubeOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoArrowForwardOutline,
  IoListOutline,
  IoReceiptOutline,
  IoBusinessOutline
} from 'react-icons/io5';

const initialItems = [
  {
    id: 'pi-1',
    poNumber: 'PO-2026-0891',
    itemName: 'Basmati Rice 1121',
    category: 'Grains & Spices',
    supplierName: 'Gulf General Trading Co',
    unitPrice: 110,
    quantity: 200,
    unit: 'KG',
    totalCost: 22000,
    receivedDate: '2026-09-24',
    status: 'Received'
  },
  {
    id: 'pi-2',
    poNumber: 'PO-2026-0891',
    itemName: 'Red Onions Nashik',
    category: 'Fresh Vegetables & Fruits',
    supplierName: 'Fresh Farms Produce Ltd',
    unitPrice: 35,
    quantity: 150,
    unit: 'KG',
    totalCost: 5250,
    receivedDate: '2026-09-24',
    status: 'Received'
  },
  {
    id: 'pi-3',
    poNumber: 'PO-2026-0892',
    itemName: 'Sunflower Cooking Oil',
    category: 'Grains & Spices',
    supplierName: 'Gulf General Trading Co',
    unitPrice: 140,
    quantity: 100,
    unit: 'L',
    totalCost: 14000,
    receivedDate: '2026-09-25',
    status: 'Pending Receiving'
  },
  {
    id: 'pi-4',
    poNumber: 'PO-2026-0893',
    itemName: 'Fresh Chicken Whole',
    category: 'Meat & Seafood',
    supplierName: 'Prime Poultry & Meats',
    unitPrice: 220,
    quantity: 120,
    unit: 'KG',
    totalCost: 26400,
    receivedDate: '2026-09-23',
    status: 'Received'
  },
  {
    id: 'pi-5',
    poNumber: 'PO-2026-0894',
    itemName: 'Whole Milk 1L',
    category: 'Dairy & Beverages',
    supplierName: 'Crown Dairy Products',
    unitPrice: 65,
    quantity: 200,
    unit: 'Pack',
    totalCost: 13000,
    receivedDate: '2026-09-27',
    status: 'Approved'
  },
  {
    id: 'pi-6',
    poNumber: 'PO-2026-0895',
    itemName: 'Takeaway Food Containers 500ml',
    category: 'Packaging & Disposables',
    supplierName: 'Apex Packaging Solutions',
    unitPrice: 8.5,
    quantity: 1000,
    unit: 'Piece',
    totalCost: 8500,
    receivedDate: '2026-09-21',
    status: 'Received'
  }
];

const PurchaseItems = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterPO = searchParams.get('po') || '';

  const [items] = useState(initialItems);
  const [searchTerm, setSearchTerm] = useState(filterPO);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = items.filter(item => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalLineItems = items.length;
  const totalSpend = items.reduce((sum, i) => sum + i.totalCost, 0);
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Module Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700">Line Items Purchased</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Purchase Line Items Audit</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Detailed unit cost, quantity breakdowns, and raw material line items across all purchase orders.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/procurement/purchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Purchase Orders
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers Master
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/products')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Master Products
          </button>
          <button
            type="button"
            onClick={() => navigate('/inventory/stockledger')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Stock Audit Ledger
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Line Items Tracked</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalLineItems} Lines</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Order Breakdown</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoListOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Volume Quantity</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              {totalQty.toLocaleString('en-IN')} Units
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">KG, Liters, Packs, Pcs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCubeOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Procurement Spend</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalSpend.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-indigo-600 mt-1">Purchased Line Items</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search item, PO #, or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Fresh Vegetables & Fruits">Fresh Vegetables & Fruits</option>
              <option value="Grains & Spices">Grains & Spices</option>
              <option value="Meat & Seafood">Meat & Seafood</option>
              <option value="Dairy & Beverages">Dairy & Beverages</option>
              <option value="Packaging & Disposables">Packaging & Disposables</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Item Name & Category</th>
                <th className="py-3.5 px-4">PO Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-right">Unit Price (₹)</th>
                <th className="py-3.5 px-4 text-center">Quantity</th>
                <th className="py-3.5 px-4 text-right">Total Cost (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-400 text-xs">
                    No purchase line items found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{item.itemName}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{item.category}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                      <button
                        type="button"
                        onClick={() => navigate(`/procurement/purchases`)}
                        className="hover:underline cursor-pointer"
                      >
                        {item.poNumber}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-800">{item.supplierName}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-gray-700">
                      ₹{item.unitPrice.toFixed(2)} / {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-900 font-mono">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                      ₹{item.totalCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'Pending Receiving' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseItems;
