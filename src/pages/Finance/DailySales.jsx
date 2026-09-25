import React, { useState, useEffect, useRef } from 'react';
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
  IoCashOutline,
  IoArrowBackOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Calendar } from '../../components/ui/calendar';

// Custom Dropdown Select
const CustomSelect = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className="truncate">{value || 'Select...'}</span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} size={13} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans max-h-60 overflow-y-auto">
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

const INITIAL_SALES = [
  {
    id: 5,
    saleCode: '#5',
    businessDate: getTodayDateString(),
    formattedDate: formatDisplayDate(getTodayDateString()),
    branch: 'Kochi — Main Mandi',
    totalGross: 42500,
    paymentMethods: ['Cash', 'UPI', 'Card', 'Food Delivery'],
    amounts: { cash: 18000, upi: 12000, card: 7500, foodDelivery: 5000 },
    status: 'DRAFT',
    createdBy: 'Sana Iqbal',
    createdAt: `${getTodayDateString()} 12:00`
  },
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
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedStatus, setSelectedStatus] = useState('All');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  // Calendar popover state & refs for Filter Bar and Form Modal
  const [showFilterCalendarPopover, setShowFilterCalendarPopover] = useState(false);
  const filterDatePickerRef = useRef(null);

  const [showFormCalendarPopover, setShowFormCalendarPopover] = useState(false);
  const formDatePickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDatePickerRef.current && !filterDatePickerRef.current.contains(event.target)) {
        setShowFilterCalendarPopover(false);
      }
      if (formDatePickerRef.current && !formDatePickerRef.current.contains(event.target)) {
        setShowFormCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    branch: 'Kochi — Main Mandi',
    businessDate: getTodayDateString(),
    status: 'DRAFT'
  });

  const [paymentRows, setPaymentRows] = useState([
    { id: 1, method: 'CASH', amount: '', deliveryPartner: '—' }
  ]);

  const handleAddPaymentRow = () => {
    setPaymentRows((prev) => [
      ...prev,
      { id: Date.now(), method: 'CASH', amount: '', deliveryPartner: '—' }
    ]);
  };

  const handleRemovePaymentRow = (id) => {
    if (paymentRows.length > 1) {
      setPaymentRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handlePaymentRowChange = (id, field, value) => {
    setPaymentRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = { ...r, [field]: value };
          if (field === 'method') {
            if (value === 'FOOD_DELIVERY') {
              updated.deliveryPartner = 'Swiggy';
            } else {
              updated.deliveryPartner = '—';
            }
          }
          return updated;
        }
        return r;
      })
    );
  };

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

  const handleStartCreate = () => {
    setEditingSale(null);
    setFormData({
      branch: 'Kochi — Main Mandi',
      businessDate: getTodayDateString(),
      status: 'DRAFT'
    });
    setPaymentRows([{ id: 1, method: 'CASH', amount: '', deliveryPartner: '—' }]);
    setShowCreateModal(true);
  };

  const handleStartEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      branch: sale.branch,
      businessDate: sale.businessDate,
      status: sale.status || 'DRAFT'
    });

    const rows = [];
    if (sale.amounts) {
      if (sale.amounts.cash > 0) {
        rows.push({ id: 1, method: 'CASH', amount: String(sale.amounts.cash), deliveryPartner: '—' });
      }
      if (sale.amounts.upi > 0) {
        rows.push({ id: 2, method: 'UPI', amount: String(sale.amounts.upi), deliveryPartner: '—' });
      }
      if (sale.amounts.card > 0) {
        rows.push({ id: 3, method: 'CARD', amount: String(sale.amounts.card), deliveryPartner: '—' });
      }
      if (sale.amounts.foodDelivery > 0) {
        rows.push({
          id: 4,
          method: 'FOOD_DELIVERY',
          amount: String(sale.amounts.foodDelivery),
          deliveryPartner: sale.deliveryPartner || 'Swiggy'
        });
      }
    }

    if (rows.length === 0) {
      rows.push({ id: 1, method: 'CASH', amount: '', deliveryPartner: '—' });
    }

    setPaymentRows(rows);
    setShowCreateModal(true);
  };

  const handleDeleteSale = (id) => {
    setSalesList((prev) => prev.filter((s) => s.id !== id));
    toast.success(`Daily Sale #${id} deleted.`);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    let cash = 0, upi = 0, card = 0, foodDelivery = 0;
    const paymentMethodsSet = new Set();
    let deliveryPartnerVal = '—';

    paymentRows.forEach((r) => {
      const amt = parseFloat(r.amount) || 0;
      if (r.method === 'CASH') { cash += amt; paymentMethodsSet.add('Cash'); }
      if (r.method === 'UPI') { upi += amt; paymentMethodsSet.add('UPI'); }
      if (r.method === 'CARD') { card += amt; paymentMethodsSet.add('Card'); }
      if (r.method === 'FOOD_DELIVERY') {
        foodDelivery += amt;
        paymentMethodsSet.add('Food Delivery');
        if (r.deliveryPartner && r.deliveryPartner !== '—') {
          deliveryPartnerVal = r.deliveryPartner;
        }
      }
    });

    const totalGross = cash + upi + card + foodDelivery;

    if (totalGross <= 0) {
      toast.error('Please enter valid sale amounts (greater than 0)');
      return;
    }

    if (editingSale) {
      const updatedList = salesList.map((s) => {
        if (s.id === editingSale.id) {
          const updated = {
            ...s,
            branch: formData.branch,
            businessDate: formData.businessDate,
            formattedDate: formatDisplayDate(formData.businessDate),
            totalGross: totalGross,
            paymentMethods: Array.from(paymentMethodsSet),
            amounts: { cash, upi, card, foodDelivery },
            deliveryPartner: deliveryPartnerVal
          };
          if (viewingSale && viewingSale.id === editingSale.id) {
            setViewingSale(updated);
          }
          return updated;
        }
        return s;
      });
      setSalesList(updatedList);
      setShowCreateModal(false);
      setEditingSale(null);
      toast.success(`Daily Sale ${editingSale.saleCode} updated successfully!`);
    } else {
      const newId = salesList.length > 0 ? Math.max(...salesList.map((s) => s.id)) + 1 : 1;
      const newRecord = {
        id: newId,
        saleCode: `#${newId}`,
        businessDate: formData.businessDate,
        formattedDate: formatDisplayDate(formData.businessDate),
        branch: formData.branch,
        totalGross: totalGross,
        paymentMethods: Array.from(paymentMethodsSet),
        amounts: { cash, upi, card, foodDelivery },
        deliveryPartner: deliveryPartnerVal,
        status: 'DRAFT',
        createdBy: 'Sana Iqbal',
        createdAt: `${formData.businessDate} 21:00`
      };

      setSalesList([newRecord, ...salesList]);
      setShowCreateModal(false);
      toast.success(`Daily Sale #${newId} recorded successfully as Draft!`);
    }

    setFormData({
      branch: 'Kochi — Main Mandi',
      businessDate: getTodayDateString(),
      status: 'DRAFT'
    });
    setPaymentRows([{ id: 1, method: 'CASH', amount: '', deliveryPartner: '—' }]);
  };

  if (viewingSale) {
    return (
      <div className="space-y-6 font-sans w-full pb-10 animate-in fade-in duration-150">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => setViewingSale(null)}
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-bold transition-colors cursor-pointer"
          >
            <IoArrowBackOutline size={18} />
            <span>Back to Daily Sales</span>
          </button>
        </div>

        {/* Top Page Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Daily Sale {viewingSale.saleCode}
              </h1>
              {viewingSale.status === 'DRAFT' ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  DRAFT
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  POSTED
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              {viewingSale.branch} · {viewingSale.formattedDate}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleStartEdit(viewingSale)}
              className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <IoPencilOutline size={14} />
              <span>Edit</span>
            </button>

            {viewingSale.status === 'DRAFT' && (
              <button
                type="button"
                onClick={() => {
                  setSalesList(salesList.map((s) => (s.id === viewingSale.id ? { ...s, status: 'POSTED' } : s)));
                  setViewingSale({ ...viewingSale, status: 'POSTED' });
                  toast.success(`Sale ${viewingSale.saleCode} posted successfully!`);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <IoCheckmarkCircleOutline size={14} />
                <span>Post Sale</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSalesList(salesList.filter((s) => s.id !== viewingSale.id));
                setViewingSale(null);
                toast.success(`Sale ${viewingSale.saleCode} deleted.`);
              }}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <IoTrashOutline size={14} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sale Details Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Sale Details</h3>
                {viewingSale.status === 'DRAFT' ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    DRAFT
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    POSTED
                  </span>
                )}
              </div>

              <div className="divide-y divide-gray-100 text-xs">
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-gray-500 font-medium">Sale ID</span>
                  <span className="font-bold text-gray-900">{viewingSale.saleCode}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-gray-500 font-medium">Branch</span>
                  <span className="font-bold text-gray-900">{viewingSale.branch}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-gray-500 font-medium">Business Date</span>
                  <span className="font-bold text-gray-900">{viewingSale.formattedDate}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-gray-500 font-medium">Total Gross</span>
                  <span className="font-extrabold text-gray-900 text-sm tabular-nums">
                    ₹{(viewingSale.totalGross || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-gray-500 font-medium">Created By</span>
                  <span className="font-semibold text-gray-800">{viewingSale.createdBy || 'Sana Iqbal'}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-gray-500 font-medium">Created At</span>
                  <span className="font-medium text-gray-600">{viewingSale.createdAt || '2026-09-20 21:40'}</span>
                </div>
              </div>
            </div>

            {/* Payments Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">Payments</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                      <th className="py-3 px-5">Payment ID</th>
                      <th className="py-3 px-5">Method</th>
                      <th className="py-3 px-5">Amount</th>
                      <th className="py-3 px-5">Delivery Partner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {/* Cash */}
                    <tr className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900">#1</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Cash
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-gray-900 tabular-nums">
                        ₹{(viewingSale.amounts?.cash ?? 18400).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 font-medium">—</td>
                    </tr>

                    {/* UPI */}
                    <tr className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900">#2</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          UPI
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-gray-900 tabular-nums">
                        ₹{(viewingSale.amounts?.upi ?? 9200).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 font-medium">—</td>
                    </tr>

                    {/* Card */}
                    <tr className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900">#3</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          Card
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-gray-900 tabular-nums">
                        ₹{(viewingSale.amounts?.card ?? 5000).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 text-gray-400 font-medium">—</td>
                    </tr>

                    {/* Food Delivery */}
                    <tr className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900">#4</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          Food Delivery
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-gray-900 tabular-nums">
                        ₹{(viewingSale.amounts?.foodDelivery ?? 3100).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-gray-700">
                        {viewingSale.deliveryPartner || 'Swiggy'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (1 Col Sidebar) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900">What happens on posting</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Posting this sale will create the corresponding revenue transactions below. This action cannot be undone through the normal sales workflow.
              </p>

              <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-600 text-[11px]">CASH</span>
                  <span className="font-extrabold text-emerald-600 tabular-nums">
                    + ₹{(viewingSale.amounts?.cash ?? 18400).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-600 text-[11px]">UPI</span>
                  <span className="font-extrabold text-emerald-600 tabular-nums">
                    + ₹{(viewingSale.amounts?.upi ?? 9200).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-600 text-[11px]">CARD RECEIVABLE</span>
                  <span className="font-extrabold text-emerald-600 tabular-nums">
                    + ₹{(viewingSale.amounts?.card ?? 5000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-600 text-[11px]">FOOD DELIVERY RECEIVABLE</span>
                  <span className="font-extrabold text-emerald-600 tabular-nums">
                    + ₹{(viewingSale.amounts?.foodDelivery ?? 3100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          onClick={handleStartCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
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

          <div className="relative" ref={filterDatePickerRef}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Business Date</label>
            <button
              type="button"
              onClick={() => setShowFilterCalendarPopover(!showFilterCalendarPopover)}
              className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IoCalendarOutline size={15} className="text-blue-600" />
                <span className="font-bold">
                  {selectedDate ? formatDisplayDate(selectedDate) : 'Select Date'}
                </span>
              </div>
              <IoChevronDownOutline
                className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${
                  showFilterCalendarPopover ? 'rotate-180' : ''
                }`}
                size={13}
              />
            </button>

            {showFilterCalendarPopover && (
              <div className="absolute left-0 mt-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <Calendar
                  value={selectedDate}
                  onChange={(newDate) => {
                    setSelectedDate(newDate);
                    setShowFilterCalendarPopover(false);
                  }}
                />
              </div>
            )}
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
                              onClick={() => handleStartEdit(sale)}
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
                              <IoCheckmarkCircleOutline size={15} />
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/40">
              <div>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  {editingSale ? `Edit Daily Sale ${editingSale.saleCode}` : 'Create Daily Sale'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {editingSale
                    ? 'Modify the business date and payment breakdown for this sale.'
                    : 'Enter the business date and payment breakdown collected for the day.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingSale(null);
                }}
                className="text-gray-400 hover:text-gray-700 cursor-pointer pt-1"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="p-6 space-y-5">
              {/* Row 1: Branch & Business Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Branch <span className="text-rose-500">*</span>
                  </label>
                  <CustomSelect
                    value={formData.branch}
                    onChange={(val) => setFormData({ ...formData, branch: val })}
                    options={['Kochi — Main Mandi', 'Kozhikode Branch', 'Trivandrum Branch']}
                  />
                </div>

                <div className="relative" ref={formDatePickerRef}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Business Date <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFormCalendarPopover(!showFormCalendarPopover)}
                    className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <IoCalendarOutline size={15} className="text-blue-600" />
                      <span className="font-bold">
                        {formatDisplayDate(formData.businessDate) || 'Select Date'}
                      </span>
                    </div>
                    <IoChevronDownOutline
                      className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${
                        showFormCalendarPopover ? 'rotate-180' : ''
                      }`}
                      size={13}
                    />
                  </button>

                  {showFormCalendarPopover && (
                    <div className="absolute left-0 mt-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <Calendar
                        value={formData.businessDate}
                        onChange={(newDate) => {
                          setFormData({ ...formData, businessDate: newDate });
                          setShowFormCalendarPopover(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payments Section */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-gray-900">Payments</h4>

                {/* Column Headers */}
                <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-gray-600 px-0.5">
                  <div className="col-span-4">Method</div>
                  <div className="col-span-4">Amount (₹)</div>
                  <div className="col-span-3">Delivery Partner</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Payment Rows */}
                {paymentRows.map((row) => (
                  <div key={row.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-4">
                      <CustomSelect
                        value={row.method}
                        onChange={(val) => handlePaymentRowChange(row.id, 'method', val)}
                        options={['CASH', 'UPI', 'CARD', 'FOOD_DELIVERY']}
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) => handlePaymentRowChange(row.id, 'amount', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium shadow-2xs"
                      />
                    </div>

                    <div className="col-span-3">
                      {row.method === 'FOOD_DELIVERY' ? (
                        <CustomSelect
                          value={row.deliveryPartner === '—' ? 'Swiggy' : row.deliveryPartner}
                          onChange={(val) => handlePaymentRowChange(row.id, 'deliveryPartner', val)}
                          options={['Swiggy', 'Zomato', 'MandiEats']}
                        />
                      ) : (
                        <div className="w-full text-xs border border-gray-100 rounded-xl px-3 py-2 bg-gray-50 text-gray-400 font-medium">
                          —
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentRow(row.id)}
                        className={`p-2 border rounded-xl transition-colors ${
                          paymentRows.length > 1
                            ? 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-400 hover:text-rose-600 cursor-pointer'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                        disabled={paymentRows.length <= 1}
                      >
                        <IoCloseOutline size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                <div>
                  <button
                    type="button"
                    onClick={handleAddPaymentRow}
                    className="px-3.5 py-1.5 bg-white text-gray-800 border border-gray-200 hover:border-gray-300 rounded-xl transition-colors text-xs font-semibold shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <IoAddOutline size={14} />
                    <span>+ Add Payment</span>
                  </button>
                </div>
              </div>

              {/* Total Gross Box */}
              <div className="p-4 bg-white rounded-2xl border border-dashed border-gray-300 flex items-center justify-between shadow-2xs">
                <span className="text-xs font-semibold text-gray-500">Total Gross</span>
                <span className="text-lg font-extrabold text-gray-900 tabular-nums">
                  ₹{paymentRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingSale(null);
                  }}
                  className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingSale ? 'Update Sale' : 'Save Draft'}
                </button>
              </div>

              {/* Validation notice pill */}
              <div className="p-3 bg-gray-100 text-gray-500 text-[11px] font-medium rounded-xl border border-gray-200/80 leading-relaxed">
                Validation: amount must be greater than 0 · Food Delivery requires an active delivery partner belonging to the same branch · Delivery partner must not be supplied for Cash / UPI / Card.
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default DailySales;
