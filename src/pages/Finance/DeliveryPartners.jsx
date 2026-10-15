import React, { useState, useEffect, useRef } from 'react';
import {
  IoAddOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoChevronDownOutline,
  IoTrashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { deliveryPartnerService } from '../../services/deliveryPartnerService';
import { accountService } from '../../services/accountService';
import ConfirmDialog from '../../components/employees/ConfirmDialog';

// Custom Select Component for crisp form dropdowns
const CustomSelect = ({ value, onChange, options, placeholder = 'Select...', className = '' }) => {
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

  const formattedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: opt.label || opt.name, value: opt.value ?? opt.id };
    }
    return { label: String(opt), value: opt };
  });

  const selectedItem = formattedOptions.find((opt) => String(opt.value) === String(value));
  const isValueEmpty = value === '' || value === null || value === undefined;
  const displayText = selectedItem ? selectedItem.label : placeholder;
  const isPlaceholder = isValueEmpty || (selectedItem && String(selectedItem.value) === '');

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-2xs cursor-pointer"
      >
        <span className={`truncate ${isPlaceholder ? 'text-gray-400 font-normal' : 'text-gray-800 font-semibold'}`}>
          {displayText}
        </span>
        <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} size={13} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 font-sans max-h-60 overflow-y-auto">
          {formattedOptions.length > 0 ? (
            formattedOptions.map((opt, idx) => (
              <button
                key={opt.value ?? idx}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  String(value) === String(opt.value) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {String(value) === String(opt.value) && <IoCheckmarkCircleOutline size={14} className="text-blue-600 shrink-0 ml-1" />}
              </button>
            ))
          ) : (
            <div className="px-3.5 py-2 text-xs text-gray-400 font-medium">No options available</div>
          )}
        </div>
      )}
    </div>
  );
};

// Initial Delivery Partners Data
const INITIAL_PARTNERS = [
  {
    id: 1,
    partner: 'Swiggy',
    branch: 'Kochi — Main Mandi',
    status: 'ACTIVE',
    contact: 'partner-swiggy@al-naaz.com',
    currentCommission: '18%',
    effectiveDate: '01 Jun 2026'
  },
  {
    id: 2,
    partner: 'Zomato',
    branch: 'Kochi — Main Mandi',
    status: 'ACTIVE',
    contact: 'partner-zomato@al-naaz.com',
    currentCommission: '20%',
    effectiveDate: '15 Jul 2026'
  },
  {
    id: 3,
    partner: 'MandiEats',
    branch: 'Kochi — Main Mandi',
    status: 'INACTIVE',
    contact: 'ops@mandieats.in',
    currentCommission: '15%',
    effectiveDate: '01 Mar 2026'
  }
];

// Initial Commission Rates History Data
const INITIAL_RATES = [
  {
    id: 1,
    deliveryPartner: 1,
    rate: '18%',
    effectiveFrom: '01 Jun 2026',
    effectiveTo: 'ACTIVE',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 2,
    deliveryPartner: 1,
    rate: '16%',
    effectiveFrom: '01 Jan 2026',
    effectiveTo: '31 May 2026',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 3,
    deliveryPartner: 2,
    rate: '20%',
    effectiveFrom: '15 Jul 2026',
    effectiveTo: 'ACTIVE',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 4,
    deliveryPartner: 2,
    rate: '22%',
    effectiveFrom: '01 Jan 2026',
    effectiveTo: '14 Jul 2026',
    createdBy: 'Sana Iqbal'
  },
  {
    id: 5,
    deliveryPartner: 3,
    rate: '15%',
    effectiveFrom: '01 Mar 2026',
    effectiveTo: 'ACTIVE',
    createdBy: 'Farhan Rasheed'
  }
];

const DeliveryPartners = () => {
  const [activeTab, setActiveTab] = useState('partners'); // 'partners' | 'rates'

  // Partners State
  const [partners, setPartners] = useState([]);
  const [branchesList, setBranchesList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const [submitting, setSubmitting] = useState(false);

  // Rates State
  const [rates, setRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesCurrentPage, setRatesCurrentPage] = useState(1);
  const [ratesTotalCount, setRatesTotalCount] = useState(0);

  // Modals & Confirmation Popups
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingPartner, setViewingPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [confirmEditPartner, setConfirmEditPartner] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingPartner, setTogglingPartner] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  // New Partner Form State
  const [newPartner, setNewPartner] = useState({
    partner: '',
    branch: '',
    contact: '',
    commission: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const loadBranches = async () => {
    try {
      const data = await accountService.fetchBranches();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setBranchesList(list);
      if (list.length > 0) {
        setNewPartner((prev) => ({
          ...prev,
          branch: prev.branch || list[0].id
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch branches:', err);
    }
  };

  const loadDeliveryPartners = async (page = 1) => {
    setLoading(true);
    let mapped = [];
    try {
      const data = await deliveryPartnerService.fetchDeliveryPartners(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setTotalCount(count);
      setCurrentPage(page);

      if (list.length > 0) {
        mapped = list.map((item) => {
          const dateStr = item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : '';

          let matchedBranchName = item.branch_name;
          if (!matchedBranchName && branchesList.length > 0) {
            const foundBranch = branchesList.find((b) => b.id === item.branch);
            if (foundBranch) matchedBranchName = foundBranch.name;
          }

          return {
            id: item.id,
            partner: item.name,
            branch: matchedBranchName || 'Al Naaz Kayamkulam',
            branch_id: item.branch,
            status: item.is_active ? 'ACTIVE' : 'INACTIVE',
            is_active: item.is_active,
            contact: item.contact || `ops@${(item.name || '').toLowerCase().replace(/\s+/g, '')}.com`,
            currentCommission: item.current_commission || item.commission || '18%',
            effectiveDate: dateStr || '12 Sep 2026'
          };
        });
        setPartners(mapped);
      } else {
        setPartners([]);
      }
    } catch (err) {
      console.warn('Failed to fetch delivery partners from API, using fallback data:', err);
      setPartners(INITIAL_PARTNERS);
      setTotalCount(INITIAL_PARTNERS.length);
      mapped = INITIAL_PARTNERS;
    } finally {
      setLoading(false);
    }
    return mapped;
  };

  const loadCommissionRates = async (page = 1) => {
    setLoadingRates(true);
    try {
      const data = await deliveryPartnerService.fetchCommissionRates(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setRatesTotalCount(count);
      setRatesCurrentPage(page);

      if (list.length > 0) {
        const mapped = list.map((item) => {
          const rateStr =
            item.commission_rate !== undefined && item.commission_rate !== null
              ? `${parseFloat(item.commission_rate)}%`
              : '0%';

          const effTo = item.effective_to ? item.effective_to : 'ACTIVE';

          const createdByStr = item.created_by_name
            ? item.created_by_name
            : item.created_by === 1
            ? 'admin'
            : `User #${item.created_by}`;

          return {
            id: item.id,
            deliveryPartner: item.delivery_partner !== undefined && item.delivery_partner !== null ? item.delivery_partner : 'N/A',
            rate: rateStr,
            rateRaw: item.commission_rate,
            effectiveFrom: item.effective_from || 'N/A',
            effectiveTo: effTo,
            createdBy: createdByStr,
            createdAt: item.created_at
          };
        });
        setRates(mapped);
      } else {
        setRates([]);
      }
    } catch (err) {
      console.warn('Failed to fetch commission rates from API, using fallback data:', err);
      setRates(INITIAL_RATES);
      setRatesTotalCount(INITIAL_RATES.length);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await loadBranches();
      const currentPartners = await loadDeliveryPartners(1);
      loadCommissionRates(1, currentPartners);
    };
    initData();
  }, []);

  // Confirm and Toggle Active/Inactive Status
  const handleConfirmToggleStatus = async () => {
    if (!togglingPartner) return;
    setIsToggling(true);
    try {
      const updatedStatus = !togglingPartner.is_active;
      const payload = {
        branch: togglingPartner.branch_id || (branchesList[0]?.id ?? 1),
        name: togglingPartner.partner,
        is_active: updatedStatus
      };
      await deliveryPartnerService.updateDeliveryPartner(togglingPartner.id, payload);
      toast.success(`${togglingPartner.partner} status updated to ${updatedStatus ? 'ACTIVE' : 'INACTIVE'}`);
      setTogglingPartner(null);
      await loadDeliveryPartners(currentPage);
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update partner status');
    } finally {
      setIsToggling(false);
    }
  };

  // Add Partner Handler
  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!newPartner.partner.trim()) {
      toast.error('Please enter a delivery partner name');
      return;
    }

    setSubmitting(true);
    try {
      const selectedBranchId = parseInt(newPartner.branch, 10) || (branchesList[0]?.id ?? 1);
      const payload = {
        branch: selectedBranchId,
        name: newPartner.partner.trim(),
        is_active: true
      };
      await deliveryPartnerService.createDeliveryPartner(payload);
      toast.success(`Delivery Partner ${newPartner.partner} added successfully!`);
      setShowAddModal(false);
      setNewPartner({
        partner: '',
        branch: branchesList[0]?.id || '',
        contact: '',
        commission: '',
        effectiveDate: new Date().toISOString().split('T')[0]
      });
      await loadDeliveryPartners(1);
    } catch (err) {
      console.error('Failed to create delivery partner:', err);
      let msg = 'Failed to add delivery partner';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key}: ${valStr}`;
          });
          if (fieldErrors.length > 0) {
            msg = fieldErrors.join(' | ');
          }
        }
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Partner Modal
  const handleOpenEdit = (p) => {
    setEditingPartner({
      id: p.id,
      partner: p.partner,
      branch_id: p.branch_id || (branchesList[0]?.id ?? 1),
      is_active: p.is_active !== undefined ? p.is_active : p.status === 'ACTIVE'
    });
  };

  // Save Edit Form -> Open Confirmation Dialog
  const handleSaveEditPartner = (e) => {
    e.preventDefault();
    if (!editingPartner || !editingPartner.partner.trim()) {
      toast.error('Please enter a delivery partner name');
      return;
    }
    setConfirmEditPartner(editingPartner);
  };

  // Confirm Update API (PATCH /api/delivery-partners/:id/)
  const handleConfirmUpdatePartner = async () => {
    if (!confirmEditPartner) return;
    setIsUpdating(true);
    try {
      const payload = {
        branch: parseInt(confirmEditPartner.branch_id, 10) || 1,
        name: confirmEditPartner.partner.trim(),
        is_active: Boolean(confirmEditPartner.is_active)
      };
      await deliveryPartnerService.updateDeliveryPartner(confirmEditPartner.id, payload);
      toast.success(`Delivery Partner ${confirmEditPartner.partner} updated successfully!`);
      setConfirmEditPartner(null);
      setEditingPartner(null);
      await loadDeliveryPartners(currentPage);
    } catch (err) {
      console.error('Failed to update delivery partner:', err);
      let msg = 'Failed to update delivery partner';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key}: ${valStr}`;
          });
          if (fieldErrors.length > 0) {
            msg = fieldErrors.join(' | ');
          }
        }
      }
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm Delete API (DELETE /api/delivery-partners/:id/)
  const handleConfirmDelete = async () => {
    if (!deletingPartner) return;
    setIsDeleting(true);
    try {
      await deliveryPartnerService.deleteDeliveryPartner(deletingPartner.id);
      toast.success(`Delivery Partner "${deletingPartner.partner}" deleted successfully!`);
      setDeletingPartner(null);
      await loadDeliveryPartners(currentPage);
    } catch (err) {
      console.error('Failed to delete delivery partner:', err);
      let msg = 'Failed to delete delivery partner';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') msg = err.response.data;
        else if (err.response.data.detail) msg = err.response.data.detail;
      }
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 font-sans w-full pb-10">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            {activeTab === 'partners' ? 'Delivery Partners' : 'Commission Rates'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeTab === 'partners'
              ? 'Admin-level management of food delivery platforms and their commission rates.'
              : 'All effective commission periods across delivery partners — /api/delivery-partner-rates/'}
          </p>
        </div>

        {activeTab === 'partners' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <IoAddOutline size={16} />
            <span>+ Add Partner</span>
          </button>
        )}
      </div>

      {/* Main Outer Container with Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Underlined Tab Switcher */}
        <div className="flex px-6 border-b border-gray-200 bg-white overflow-x-auto">
          {[
            { id: 'partners', label: 'Delivery Partners' },
            { id: 'rates', label: 'Commission Rates' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-4 text-sm transition-colors relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-600 font-bold'
                  : 'text-gray-500 font-semibold hover:text-gray-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* --- TAB 1: DELIVERY PARTNERS VIEW --- */}
        {activeTab === 'partners' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Delivery Partners Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
              <div className="overflow-x-auto min-h-[480px] w-full">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Partner</th>
                      <th className="py-3.5 px-4">Branch</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Current Commission</th>
                      <th className="py-3.5 px-4">Effective Date</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {loading ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={i} className="animate-pulse h-[54px]">
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : partners.length > 0 ? (
                      partners.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Partner Name */}
                          <td className="py-3.5 px-4 font-bold text-gray-900">{p.partner}</td>

                          {/* Branch */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{p.branch}</td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {p.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>ACTIVE</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                <span>INACTIVE</span>
                              </span>
                            )}
                          </td>

                          {/* Contact Email */}
                          <td className="py-3.5 px-4 font-medium text-gray-600">{p.contact}</td>

                          {/* Current Commission */}
                          <td className="py-3.5 px-4 font-bold text-gray-900 tabular-nums">{p.currentCommission}</td>

                          {/* Effective Date */}
                          <td className="py-3.5 px-4 font-medium text-gray-800">{p.effectiveDate}</td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* View */}
                              <button
                                type="button"
                                onClick={() => setViewingPartner(p)}
                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                                title="View Details"
                              >
                                <IoEyeOutline size={15} />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(p)}
                                className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                                title="Edit Partner"
                              >
                                <IoPencilOutline size={15} />
                              </button>

                              {/* Activate / Deactivate Toggle Icon */}
                              <button
                                type="button"
                                onClick={() => setTogglingPartner(p)}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-gray-200 ${
                                  p.is_active
                                    ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                    : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={p.is_active ? 'Deactivate Partner' : 'Activate Partner'}
                              >
                                {p.is_active ? <IoPauseOutline size={15} /> : <IoPlayOutline size={15} />}
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeletingPartner(p)}
                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                                title="Delete Partner"
                              >
                                <IoTrashOutline size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-gray-400 font-medium">
                          No delivery partners found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const totalItems = totalCount || partners.length;
                const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
                const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
                const endItem = Math.min(currentPage * pageSize, totalItems);

                return (
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                    <div>
                      Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                      <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                      <span className="font-bold text-gray-800">{totalItems}</span> partners
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={currentPage === 1 || loading}
                        onClick={() => loadDeliveryPartners(currentPage - 1)}
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
                            onClick={() => loadDeliveryPartners(pageNum)}
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
                        disabled={currentPage >= totalPages || loading}
                        onClick={() => loadDeliveryPartners(currentPage + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <IoChevronForwardOutline size={14} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* --- TAB 2: COMMISSION RATES VIEW --- */}
        {activeTab === 'rates' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Commission Rates Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
              <div className="overflow-x-auto min-h-[480px] w-full">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Delivery Partner</th>
                      <th className="py-3.5 px-4">Rate</th>
                      <th className="py-3.5 px-4">Effective From</th>
                      <th className="py-3.5 px-4">Effective To</th>
                      <th className="py-3.5 px-4">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {loadingRates ? (
                      [...Array(10)].map((_, i) => (
                        <tr key={i} className="animate-pulse h-[54px]">
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                        </tr>
                      ))
                    ) : rates.length > 0 ? (
                      rates.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                          {/* Delivery Partner */}
                          <td className="py-3.5 px-4 font-semibold text-gray-900">{r.deliveryPartner}</td>

                          {/* Rate */}
                          <td className="py-3.5 px-4 font-extrabold text-gray-900 tabular-nums">{r.rate}</td>

                          {/* Effective From */}
                          <td className="py-3.5 px-4 font-medium text-gray-800">{r.effectiveFrom}</td>

                          {/* Effective To */}
                          <td className="py-3.5 px-4">
                            {r.effectiveTo === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>ACTIVE</span>
                              </span>
                            ) : (
                              <span className="font-medium text-gray-700">{r.effectiveTo}</span>
                            )}
                          </td>

                          {/* Created By */}
                          <td className="py-3.5 px-4 font-medium text-gray-700">{r.createdBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">
                          No commission rates found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const totalItems = ratesTotalCount || rates.length;
                const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
                const startItem = totalItems > 0 ? (ratesCurrentPage - 1) * pageSize + 1 : 0;
                const endItem = Math.min(ratesCurrentPage * pageSize, totalItems);

                return (
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                    <div>
                      Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
                      <span className="font-bold text-gray-800">{endItem}</span> of{' '}
                      <span className="font-bold text-gray-800">{totalItems}</span> rates
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        type="button"
                        disabled={ratesCurrentPage === 1 || loadingRates}
                        onClick={() => loadCommissionRates(ratesCurrentPage - 1)}
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
                            disabled={loadingRates}
                            onClick={() => loadCommissionRates(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                              ratesCurrentPage === pageNum
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
                        disabled={ratesCurrentPage >= totalPages || loadingRates}
                        onClick={() => loadCommissionRates(ratesCurrentPage + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <IoChevronForwardOutline size={14} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        )}

      </div>

      {/* Add Delivery Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Add Delivery Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Partner Platform Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy / Zomato"
                  value={newPartner.partner}
                  onChange={(e) => setNewPartner({ ...newPartner, partner: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={newPartner.branch}
                  onChange={(val) => setNewPartner({ ...newPartner, branch: val })}
                  options={
                    branchesList.length > 0
                      ? branchesList.map((b) => ({ label: b.name, value: b.id }))
                      : [{ label: 'Al Naaz Kayamkulam', value: 1 }]
                  }
                  placeholder="Select Branch"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Partner</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 font-sans">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Edit Delivery Partner</h3>
              <button onClick={() => setEditingPartner(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditPartner} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Partner Platform Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingPartner.partner}
                  onChange={(e) => setEditingPartner({ ...editingPartner, partner: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3.5 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={editingPartner.branch_id}
                  onChange={(val) => setEditingPartner({ ...editingPartner, branch_id: val })}
                  options={
                    branchesList.length > 0
                      ? branchesList.map((b) => ({ label: b.name, value: b.id }))
                      : [{ label: 'Al Naaz Kayamkulam', value: 1 }]
                  }
                  placeholder="Select Branch"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Partner Modal */}
      {viewingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">{viewingPartner.partner} Platform Details</h3>
                <p className="text-xs text-gray-500">{viewingPartner.branch}</p>
              </div>
              <button onClick={() => setViewingPartner(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-800 font-semibold">Active Commission Rate</p>
                  <p className="text-xl font-extrabold text-blue-900 tabular-nums">
                    {viewingPartner.currentCommission}
                  </p>
                </div>
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md ${
                  viewingPartner.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                }`}>
                  {viewingPartner.status}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Contact Email:</span>
                  <span className="font-semibold text-gray-900">{viewingPartner.contact}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-50 text-gray-700">
                  <span>Effective From:</span>
                  <span className="font-bold text-gray-900">{viewingPartner.effectiveDate}</span>
                </div>
                <div className="flex justify-between py-1.5 text-gray-700">
                  <span>Branch:</span>
                  <span className="font-bold text-gray-900">{viewingPartner.branch}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setViewingPartner(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Edit Partner Popup */}
      <ConfirmDialog
        isOpen={!!confirmEditPartner}
        onClose={() => setConfirmEditPartner(null)}
        onConfirm={handleConfirmUpdatePartner}
        title="Confirm Partner Update"
        message={`Are you sure you want to save changes for delivery partner "${confirmEditPartner?.partner}"?`}
        confirmText="Update Partner"
        isDestructive={false}
        isProcessing={isUpdating}
      />

      {/* Confirm Delete Partner Popup */}
      <ConfirmDialog
        isOpen={!!deletingPartner}
        onClose={() => setDeletingPartner(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Delivery Partner"
        message={`Are you sure you want to delete delivery partner "${deletingPartner?.partner}"? This operation cannot be undone.`}
        confirmText="Delete Partner"
        isDestructive={true}
        isProcessing={isDeleting}
      />

      {/* Confirm Toggle Status Popup */}
      <ConfirmDialog
        isOpen={!!togglingPartner}
        onClose={() => setTogglingPartner(null)}
        onConfirm={handleConfirmToggleStatus}
        title={togglingPartner?.is_active ? "Deactivate Delivery Partner" : "Activate Delivery Partner"}
        message={`Are you sure you want to ${togglingPartner?.is_active ? 'deactivate' : 'activate'} delivery partner "${togglingPartner?.partner}"?`}
        confirmText={togglingPartner?.is_active ? "Deactivate" : "Activate"}
        isDestructive={togglingPartner?.is_active}
        isProcessing={isToggling}
      />

    </div>
  );
};

export default DeliveryPartners;
