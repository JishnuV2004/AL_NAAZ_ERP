import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoSearchOutline,
  IoAddOutline,
  IoCartOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoReceiptOutline,
  IoListOutline,
  IoEyeOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCloseOutline,
  IoBusinessOutline,
  IoDocumentTextOutline,
  IoWalletOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { purchaseService } from '../../services/purchaseService';
import { supplierService } from '../../services/supplierService';
import { inventoryService } from '../../services/inventoryService';
import { accountService } from '../../services/accountService';

const defaultForm = {
  branch: 1,
  supplier: '',
  purchase_date: new Date().toISOString().split('T')[0],
  invoice_number: '',
  remarks: '',
  initial_payment_amount: '',
  initial_payment_account: '',
  items: [
    { product: '', quantity: '1', total_price: '0' }
  ]
};

const Purchases = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const autoOpenedRef = useRef(false);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Form Dropdown states
  const [suppliersList, setSuppliersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [accountsList, setAccountsList] = useState([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Details Modal State
  const [viewingPurchase, setViewingPurchase] = useState(null);

  const loadPurchases = async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await purchaseService.fetchPurchases(pageToLoad, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(response)) {
        list = response;
        count = response.length;
      } else if (response && Array.isArray(response.results)) {
        list = response.results;
        count = typeof response.count === 'number' ? response.count : response.results.length;
      }

      setPurchases(list);
      setTotalCount(count);
      setPage(pageToLoad);
    } catch (err) {
      console.error('Failed to load purchases list from API:', err);
      toast.error('Failed to load purchases');
      setPurchases([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFormDropdowns = async () => {
    try {
      const [supRes, prodRes, accRes] = await Promise.all([
        supplierService.fetchSuppliers(1, 100).catch(() => []),
        inventoryService.fetchProducts(1, 100).catch(() => []),
        accountService.fetchAccounts().catch(() => [])
      ]);

      if (Array.isArray(supRes)) setSuppliersList(supRes);
      else if (supRes && Array.isArray(supRes.results)) setSuppliersList(supRes.results);

      if (Array.isArray(prodRes)) setProductsList(prodRes);
      else if (prodRes && Array.isArray(prodRes.results)) setProductsList(prodRes.results);

      if (Array.isArray(accRes)) setAccountsList(accRes);
      else if (accRes && Array.isArray(accRes.results)) setAccountsList(accRes.results);
    } catch (err) {
      console.error('Failed to load dropdown data:', err);
    }
  };

  useEffect(() => {
    loadPurchases(1);
    loadFormDropdowns();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      ...defaultForm,
      supplier: suppliersList.length > 0 ? suppliersList[0].id : '',
      initial_payment_account: accountsList.length > 0 ? accountsList[0].id : '',
      items: [
        { product: productsList.length > 0 ? productsList[0].id : '', quantity: '1', total_price: '0' }
      ]
    });
    setIsModalOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpen =
      location.state?.openModal ||
      location.state?.openAddModal ||
      params.get('create') === 'true' ||
      params.get('new') === 'true';

    if (shouldOpen && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      handleOpenAddModal();
      if (params.get('create') || params.get('new')) {
        params.delete('create');
        params.delete('new');
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        navigate(`/procurement/purchases${newSearch}`, { replace: true, state: {} });
      }
    }
  }, [location, suppliersList, accountsList, productsList, navigate]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleAddItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product: productsList.length > 0 ? productsList[0].id : '', quantity: '1', total_price: '0' }
      ]
    });
  };

  const handleRemoveItemRow = (index) => {
    if (formData.items.length <= 1) return;
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (!formData.supplier) {
      toast.error('Please select a supplier');
      return;
    }
    if (!formData.invoice_number.trim()) {
      toast.error('Invoice number is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        branch: parseInt(formData.branch, 10) || 1,
        supplier: parseInt(formData.supplier, 10),
        purchase_date: formData.purchase_date,
        invoice_number: formData.invoice_number.trim(),
        remarks: formData.remarks ? formData.remarks.trim() : '',
        items: formData.items.map(it => ({
          product: parseInt(it.product, 10) || 1,
          quantity: String(it.quantity || '1'),
          total_price: String(it.total_price || '0')
        }))
      };

      if (formData.initial_payment_amount && parseFloat(formData.initial_payment_amount) > 0) {
        payload.initial_payment = {
          amount: String(formData.initial_payment_amount),
          payment_account: parseInt(formData.initial_payment_account, 10) || (formData.initial_payment_account ? String(formData.initial_payment_account) : '1')
        };
      }

      // Unique Idempotency-Key
      const idempotencyKey = `purchases-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      await purchaseService.createPurchase(payload, idempotencyKey);
      toast.success('Purchase order created successfully!');
      setIsModalOpen(false);
      loadPurchases(page);
    } catch (err) {
      console.error('Failed to create purchase:', err);
      toast.error('Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate purchase total
  const getPurchaseTotal = (items = []) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.total_price) || 0), 0);
  };

  // Filtering for table display
  const filteredPurchases = purchases.filter(po => {
    const invStr = (po.invoice_number || '').toLowerCase();
    const supStr = (po.supplier_name || '').toLowerCase();
    const remStr = (po.remarks || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = !query || invStr.includes(query) || supStr.includes(query) || remStr.includes(query);
    const matchesPayment = paymentFilter === 'All' || po.payment_status === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  const totalSpend = purchases.reduce((sum, po) => sum + getPurchaseTotal(po.items), 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Procurement</span> &gt; <span className="text-gray-700 font-bold">Purchase Orders</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Purchase Orders Directory</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage procurement purchases, supplier invoices, line items, and payment status.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/procurement/suppliers')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Suppliers Master
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/creditpurchases')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Credit Purchases
          </button>
          <button
            type="button"
            onClick={() => navigate('/procurement/supplierpayments')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Supplier Payments
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Purchases Count</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalCount} Orders</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Master Procurement Cycle</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCartOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Page Purchases Spend</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Sum of loaded orders</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        <div
          onClick={() => navigate('/procurement/supplierpayments')}
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-purple-300 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Supplier Payments</p>
            <h3 className="text-sm font-bold text-purple-700">Make Payment &rarr;</h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">Settle outstanding invoices</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoReceiptOutline size={24} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search invoice #, supplier name, remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium">Payment Status:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-blue-500"
            >
              <option value="All">All Payments</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="UNPAID">UNPAID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table - Fixed Container Height for 10 Items */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div className="overflow-x-auto min-h-[480px] w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                <th className="py-3.5 px-4">Invoice # & Date</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Items Purchased</th>
                <th className="py-3.5 px-4 text-right">Total Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Payment Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs bg-white">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse h-[54px]">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-24 ml-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredPurchases.length > 0 ? (
                filteredPurchases.map((po) => {
                  const total = getPurchaseTotal(po.items || []);
                  return (
                    <tr key={po.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                      {/* Invoice & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 font-mono flex items-center gap-1.5">
                          <IoDocumentTextOutline className="text-blue-500 shrink-0" size={14} />
                          <span>{po.invoice_number || `PO-${po.id}`}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                          {po.purchase_date}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-[11px] shrink-0">
                            {po.supplier_name ? po.supplier_name.charAt(0).toUpperCase() : 'S'}
                          </span>
                          <span>{po.supplier_name || `Supplier #${po.supplier || 'N/A'}`}</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        {po.items && po.items.length > 0 ? (
                          <span className="capitalize">
                            {po.items.map((item) => item.product_name || 'Item').join(', ')}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No items</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full ${
                          po.payment_status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : po.payment_status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {po.payment_status || 'UNPAID'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingPurchase(po)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="View Purchase Details"
                          >
                            <IoEyeOutline size={14} /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400 font-medium">
                    No purchase records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {(() => {
          const totalItems = totalCount || purchases.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
          const startItem = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
          const endItem = Math.min(page * pageSize, totalItems);

          return (
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
              <div>
                Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                <span className="font-bold text-gray-800">{totalItems}</span> purchases
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  disabled={page === 1 || loading}
                  onClick={() => loadPurchases(page - 1)}
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
                      disabled={loading}
                      onClick={() => loadPurchases(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                        page === pageNum
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
                  disabled={page >= totalPages || loading}
                  onClick={() => loadPurchases(page + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <IoChevronForwardOutline size={14} />
                </button>
              </div>
            </div>
          );
        })()}
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={Boolean(viewingPurchase)}
        onClose={() => setViewingPurchase(null)}
        title={`Purchase Invoice: ${viewingPurchase?.invoice_number || `PO-${viewingPurchase?.id}`}`}
      >
        {viewingPurchase && (
          <div className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Supplier</p>
                <p className="font-bold text-gray-900 text-sm">{viewingPurchase.supplier_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Purchase Date</p>
                <p className="font-bold text-gray-900 text-sm">{viewingPurchase.purchase_date}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Payment Status</p>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                  viewingPurchase.payment_status === 'PAID'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : viewingPurchase.payment_status === 'PARTIAL'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {viewingPurchase.payment_status || 'UNPAID'}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Remarks</p>
                <p className="font-medium text-gray-700">{viewingPurchase.remarks || 'No remarks'}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase text-[11px] mb-2">Purchased Line Items</h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 text-[11px]">
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 text-center">Unit</th>
                      <th className="p-2.5 text-right">Qty</th>
                      <th className="p-2.5 text-right">Unit Price (₹)</th>
                      <th className="p-2.5 text-right">Total Price (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                    {(viewingPurchase.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="p-2.5 font-bold">{item.product_name}</td>
                        <td className="p-2.5 text-center">{item.unit || 'KG'}</td>
                        <td className="p-2.5 text-right font-mono">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono">₹{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">₹{parseFloat(item.total_price || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setViewingPurchase(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Purchase Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Purchase Order"
      >
        <form onSubmit={handleCreatePurchase} className="space-y-4 font-sans text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier *</label>
              <select
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white font-medium"
              >
                <option value="">-- Select Supplier --</option>
                {suppliersList.map(sup => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
                placeholder="e.g. INV-2026-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Remarks</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
                placeholder="e.g. Purchase order remarks"
              />
            </div>
          </div>

          {/* Initial Payment Section (Optional) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
              <IoWalletOutline size={15} className="text-blue-600" />
              <span>Initial Payment (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Initial Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.initial_payment_amount}
                  onChange={(e) => setFormData({ ...formData, initial_payment_amount: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium font-mono"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Payment Account</label>
                <select
                  value={formData.initial_payment_account}
                  onChange={(e) => setFormData({ ...formData, initial_payment_account: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium"
                >
                  <option value="">-- Select Payment Account --</option>
                  {accountsList.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name || `Account #${acc.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-12 gap-2.5 mb-2 px-0.5 text-xs font-bold text-gray-700">
              <div className="col-span-5">Product</div>
              <div className="col-span-3">Quantity</div>
              <div className="col-span-3">Total Price (₹)</div>
              <div className="col-span-1 text-center"></div>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {formData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2.5 items-center">
                  <div className="col-span-5">
                    <select
                      required
                      value={item.product}
                      onChange={(e) => handleItemChange(idx, 'product', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium transition-all"
                    >
                      <option value="">-- Select Product --</option>
                      {productsList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.unit || 'KG'})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      placeholder="Qty"
                      min="0.01"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium font-mono transition-all"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      required
                      placeholder="Total Price"
                      min="0"
                      step="any"
                      value={item.total_price}
                      onChange={(e) => handleItemChange(idx, 'total_price', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-medium font-mono transition-all"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={formData.items.length <= 1}
                      className="w-9 h-9 rounded-xl border border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Remove Item"
                    >
                      <IoCloseOutline size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span className="text-gray-400 text-sm font-normal">+</span> Add Item
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Saving...' : 'Create Purchase'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;
