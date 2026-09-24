import React, { useState } from 'react';
import {
  IoAddOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoPlayOutline,
  IoTrashOutline,
  IoCloseOutline,
  IoChevronDownOutline,
  IoCheckmarkCircleOutline,
  IoCalendarOutline,
  IoCashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

// Custom Dropdown Select
const CustomSelect = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className="truncate">{value || 'Select...'}</span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} size={13} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                value === opt ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const INITIAL_SALES = [
  {
    id: 4,
    saleCode: '#4',
    businessDate: '2026-09-20',
    formattedDate: '20 Sep 2026',
    branch: 'Kochi — Main Mandi',
    totalGross: 35700,
    paymentMethods: ['Cash', 'UPI', 'Card', 'Food Delivery'],
    amounts: { cash: 12000, upi: 10000, card: 8000, foodDelivery: 5700 },
    status: 'DRAFT',
    createdBy: 'Sana Iqbal',
    createdAt: '2026-09-20 21:40'
  },
  {
    id: 3,
    saleCode: '#3',
    businessDate: '2026-09-19',
    formattedDate: '19 Sep 2026',
    branch: 'Kochi — Main Mandi',
    totalGross: 37000,
    paymentMethods: ['Cash', 'UPI', 'Food Delivery'],
    amounts: { cash: 15000, upi: 14000, card: 0, foodDelivery: 8000 },
    status: 'POSTED',
    createdBy: 'Sana Iqbal',
    createdAt: '2026-09-19 22:05'
  },
  {
    id: 2,
    saleCode: '#2',
    businessDate: '2026-09-18',
    formattedDate: '18 Sep 2026',
    branch: 'Kochi — Main Mandi',
    totalGross: 27000,
    paymentMethods: ['Cash', 'Card'],
    amounts: { cash: 18000, upi: 0, card: 9000, foodDelivery: 0 },
    status: 'POSTED',
    createdBy: 'Rahim K.',
    createdAt: '2026-09-18 21:55'
  },
  {
    id: 1,
    saleCode: '#1',
    businessDate: '2026-09-17',
    formattedDate: '17 Sep 2026',
    branch: 'Kochi — Main Mandi',
    totalGross: 31400,
    paymentMethods: ['Cash', 'UPI'],
    amounts: { cash: 16400, upi: 15000, card: 0, foodDelivery: 0 },
    status: 'POSTED',
    createdBy: 'Sana Iqbal',
    createdAt: '2026-09-17 22:10'
  }
];

const DailySales = () => {
  const [salesList, setSalesList] = useState(INITIAL_SALES);
  const [selectedBranch, setSelectedBranch] = useState('Kochi — Main Mandi');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    branch: 'Kochi — Main Mandi',
    businessDate: new Date().toISOString().split('T')[0],
    cashAmount: '',
    upiAmount: '',
    cardAmount: '',
    foodDeliveryAmount: '',
    status: 'DRAFT'
  });

  const handleClearFilters = () => {
    setSelectedBranch('');
    setSelectedDate('');
    setSelectedStatus('All');
  };

  const filteredSales = salesList.filter((sale) => {
    if (selectedBranch && sale.branch !== selectedBranch) return false;
    if (selectedDate && sale.businessDate !== selectedDate) return false;
    if (selectedStatus !== 'All' && sale.status !== selectedStatus) return false;
    return true;
  });

  const handlePostSale = (id) => {
    setSalesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'POSTED' } : s))
    );
    toast.success(`Daily Sale #${id} successfully posted!`);
  };

  const handleDeleteSale = (id) => {
    setSalesList((prev) => prev.filter((s) => s.id !== id));
    toast.success(`Daily Sale #${id} deleted.`);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    const cash = parseFloat(formData.cashAmount) || 0;
    const upi = parseFloat(formData.upiAmount) || 0;
    const card = parseFloat(formData.cardAmount) || 0;
    const foodDelivery = parseFloat(formData.foodDeliveryAmount) || 0;
    const totalGross = cash + upi + card + foodDelivery;

    if (totalGross <= 0) {
      toast.error('Please enter valid sale amounts');
      return;
    }

    const paymentMethods = [];
    if (cash > 0) paymentMethods.push('Cash');
    if (upi > 0) paymentMethods.push('UPI');
    if (card > 0) paymentMethods.push('Card');
    if (foodDelivery > 0) paymentMethods.push('Food Delivery');

    const newId = salesList.length > 0 ? Math.max(...salesList.map((s) => s.id)) + 1 : 1;
    const newRecord = {
      id: newId,
      saleCode: `#${newId}`,
      businessDate: formData.businessDate,
      formattedDate: new Date(formData.businessDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      branch: formData.branch,
      totalGross: totalGross,
      paymentMethods: paymentMethods,
      amounts: { cash, upi, card, foodDelivery },
      status: formData.status,
      createdBy: 'Admin User',
      createdAt: `${formData.businessDate} 21:00`
    };

    setSalesList([newRecord, ...salesList]);
    setShowCreateModal(false);
    toast.success(`Daily Sale #${newId} recorded successfully!`);
    setFormData({
      branch: 'Kochi — Main Mandi',
      businessDate: new Date().toISOString().split('T')[0],
      cashAmount: '',
      upiAmount: '',
      cardAmount: '',
      foodDeliveryAmount: '',
      status: 'DRAFT'
    });
  };

  return (
    <div className="space-y-5 font-sans w-full pb-10">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-1">
            <span>Finance</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Daily Sales</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daily Sales</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Record end-of-day sales and post them to create revenue transactions.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <IoAddOutline size={16} />
          <span>+ New Daily Sale</span>
        </button>
      </div>

      {/* 2. Filter Bar Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
            <CustomSelect
              value={selectedBranch}
              onChange={setSelectedBranch}
              options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <CustomSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={['All', 'DRAFT', 'POSTED']}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* 3. Active Filters Pills */}
      {selectedBranch && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
            <span>Branch: {selectedBranch}</span>
            <button onClick={() => setSelectedBranch('')} className="hover:text-blue-900 cursor-pointer">
              <IoCloseOutline size={14} />
            </button>
          </span>
        </div>
      )}

      {/* 4. Main Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Sale ID</th>
                <th className="py-3.5 px-4">Business Date</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Total Gross</th>
                <th className="py-3.5 px-4">Payment Methods</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created By</th>
                <th className="py-3.5 px-4">Created At</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs bg-white">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                    {/* Sale ID */}
                    <td className="py-3.5 px-4 font-bold text-gray-900">{sale.saleCode}</td>

                    {/* Business Date */}
                    <td className="py-3.5 px-4 font-medium text-gray-800">{sale.formattedDate}</td>

                    {/* Branch */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">{sale.branch}</td>

                    {/* Total Gross */}
                    <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums">
                      ₹{sale.totalGross.toLocaleString('en-IN')}
                    </td>

                    {/* Payment Methods Badges */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {sale.paymentMethods.map((method) => {
                          let style = 'bg-gray-100 text-gray-700 border-gray-200';
                          if (method === 'Cash') style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          if (method === 'UPI') style = 'bg-blue-50 text-blue-700 border-blue-200';
                          if (method === 'Card') style = 'bg-purple-50 text-purple-700 border-purple-200';
                          if (method === 'Food Delivery') style = 'bg-amber-50 text-amber-700 border-amber-200';

                          return (
                            <span key={method} className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${style}`}>
                              {method}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {sale.status === 'DRAFT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>DRAFT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span>✓ POSTED</span>
                        </span>
                      )}
                    </td>

                    {/* Created By */}
                    <td className="py-3.5 px-4 font-medium text-gray-700">{sale.createdBy}</td>

                    {/* Created At */}
                    <td className="py-3.5 px-4 text-gray-500 font-mono">{sale.createdAt}</td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setViewingSale(sale)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                          title="View Details"
                        >
                          <IoEyeOutline size={15} />
                        </button>

                        {sale.status === 'DRAFT' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingSale(sale)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                              title="Edit Sale"
                            >
                              <IoPencilOutline size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePostSale(sale.id)}
                              className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                              title="Post Sale to Ledger"
                            >
                              <IoPlayOutline size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSale(sale.id)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                              title="Delete Record"
                            >
                              <IoTrashOutline size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-400 font-medium">
                    No daily sales records found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Footer API Notice */}
      <div className="inline-block px-3 py-1.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-lg border border-gray-200/60">
        API filter actually supported by backend: branch. Status / date filtering shown here is client-side only.
      </div>

      {/* Create New Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ New Daily Sale Entry</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Branch</label>
                <CustomSelect
                  value={formData.branch}
                  onChange={(val) => setFormData({ ...formData, branch: val })}
                  options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Business Date</label>
                <input
                  type="date"
                  value={formData.businessDate}
                  onChange={(e) => setFormData({ ...formData, businessDate: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cash Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.cashAmount}
                    onChange={(e) => setFormData({ ...formData, cashAmount: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">UPI Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.upiAmount}
                    onChange={(e) => setFormData({ ...formData, upiAmount: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Card Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.cardAmount}
                    onChange={(e) => setFormData({ ...formData, cardAmount: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Food Delivery (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.foodDeliveryAmount}
                    onChange={(e) => setFormData({ ...formData, foodDeliveryAmount: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Status</label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={['DRAFT', 'POSTED']}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Daily Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">Daily Sale Details {viewingSale.saleCode}</h3>
                <p className="text-xs text-gray-500">{viewingSale.branch} • {viewingSale.formattedDate}</p>
              </div>
              <button onClick={() => setViewingSale(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="font-bold text-blue-900 text-sm">Total Gross Revenue</span>
                <span className="font-extrabold text-blue-900 text-lg tabular-nums">₹{viewingSale.totalGross.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Payment Breakdown</p>
                <div className="flex justify-between py-1 border-b border-gray-50 text-gray-700">
                  <span>Cash</span>
                  <span className="font-bold">₹{(viewingSale.amounts?.cash || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 text-gray-700">
                  <span>UPI</span>
                  <span className="font-bold">₹{(viewingSale.amounts?.upi || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50 text-gray-700">
                  <span>Card</span>
                  <span className="font-bold">₹{(viewingSale.amounts?.card || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-gray-700">
                  <span>Food Delivery AR</span>
                  <span className="font-bold">₹{(viewingSale.amounts?.foodDelivery || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-gray-500 text-[11px]">
                <span>Status: <strong className="text-gray-800">{viewingSale.status}</strong></span>
                <span>Created By: <strong className="text-gray-800">{viewingSale.createdBy}</strong></span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingSale(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
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

export default DailySales;
