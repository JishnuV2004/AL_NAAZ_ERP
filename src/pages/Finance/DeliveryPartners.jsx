import React, { useState } from 'react';
import {
  IoAddOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoCloseOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

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
    partner: 'Swiggy',
    rate: '18%',
    effectiveFrom: '01 Jun 2026',
    effectiveTo: 'ACTIVE',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 2,
    partner: 'Swiggy',
    rate: '16%',
    effectiveFrom: '01 Jan 2026',
    effectiveTo: '31 May 2026',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 3,
    partner: 'Zomato',
    rate: '20%',
    effectiveFrom: '15 Jul 2026',
    effectiveTo: 'ACTIVE',
    createdBy: 'Farhan Rasheed'
  },
  {
    id: 4,
    partner: 'Zomato',
    rate: '22%',
    effectiveFrom: '01 Jan 2026',
    effectiveTo: '14 Jul 2026',
    createdBy: 'Sana Iqbal'
  },
  {
    id: 5,
    partner: 'MandiEats',
    rate: '15%',
    effectiveFrom: '01 Mar 2026',
    effectiveTo: 'ACTIVE',
    createdBy: 'Farhan Rasheed'
  }
];

const DeliveryPartners = () => {
  const [activeTab, setActiveTab] = useState('partners'); // 'partners' | 'rates'

  // Partners State
  const [partners, setPartners] = useState(INITIAL_PARTNERS);
  const [rates, setRates] = useState(INITIAL_RATES);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingPartner, setViewingPartner] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);

  // New Partner Form State
  const [newPartner, setNewPartner] = useState({
    partner: '',
    branch: 'Kochi — Main Mandi',
    contact: '',
    commission: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // Toggle Active/Inactive Status
  const handleToggleStatus = (id) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          toast.success(`${p.partner} status updated to ${newStatus}`);
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  // Add Partner Handler
  const handleAddPartner = (e) => {
    e.preventDefault();
    if (!newPartner.partner.trim()) {
      toast.error('Please enter a delivery partner name');
      return;
    }

    const nextId = partners.length > 0 ? Math.max(...partners.map((p) => p.id)) + 1 : 1;
    const formattedDateStr = new Date(newPartner.effectiveDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const commStr = newPartner.commission.includes('%') ? newPartner.commission : `${newPartner.commission}%`;

    const partnerRecord = {
      id: nextId,
      partner: newPartner.partner.trim(),
      branch: newPartner.branch,
      status: 'ACTIVE',
      contact: newPartner.contact.trim() || `contact@${newPartner.partner.toLowerCase().replace(/\s+/g, '')}.com`,
      currentCommission: commStr,
      effectiveDate: formattedDateStr
    };

    const rateRecord = {
      id: rates.length + 1,
      partner: newPartner.partner.trim(),
      rate: commStr,
      effectiveFrom: formattedDateStr,
      effectiveTo: 'ACTIVE',
      createdBy: 'Admin User'
    };

    setPartners([...partners, partnerRecord]);
    setRates([rateRecord, ...rates]);
    setShowAddModal(false);
    toast.success(`Delivery Partner ${partnerRecord.partner} added successfully!`);

    setNewPartner({
      partner: '',
      branch: 'Kochi — Main Mandi',
      contact: '',
      commission: '',
      effectiveDate: new Date().toISOString().split('T')[0]
    });
  };

  // Edit Partner Commission Handler
  const handleSaveEditPartner = (e) => {
    e.preventDefault();
    if (!editingPartner) return;

    setPartners((prev) =>
      prev.map((p) => (p.id === editingPartner.id ? editingPartner : p))
    );

    // Also push a new rate record if commission changed
    const commStr = editingPartner.currentCommission.includes('%')
      ? editingPartner.currentCommission
      : `${editingPartner.currentCommission}%`;

    const newRateRecord = {
      id: rates.length + 1,
      partner: editingPartner.partner,
      rate: commStr,
      effectiveFrom: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      effectiveTo: 'ACTIVE',
      createdBy: 'Admin User'
    };

    setRates([newRateRecord, ...rates]);
    toast.success(`Updated ${editingPartner.partner} commission to ${commStr}`);
    setEditingPartner(null);
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
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
                    {partners.map((p) => (
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
                              onClick={() => setEditingPartner(p)}
                              className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-gray-200"
                              title="Edit Partner"
                            >
                              <IoPencilOutline size={15} />
                            </button>

                            {/* Toggle Pause/Play */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p.id)}
                              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-gray-200"
                              title={p.status === 'ACTIVE' ? 'Pause Partner' : 'Activate Partner'}
                            >
                              {p.status === 'ACTIVE' ? <IoPauseOutline size={15} /> : <IoPlayOutline size={15} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- TAB 2: COMMISSION RATES VIEW --- */}
        {activeTab === 'rates' && (
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Commission Rates Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                      <th className="py-3.5 px-4">Partner</th>
                      <th className="py-3.5 px-4">Rate</th>
                      <th className="py-3.5 px-4">Effective From</th>
                      <th className="py-3.5 px-4">Effective To</th>
                      <th className="py-3.5 px-4">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs bg-white">
                    {rates.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/70 transition-colors h-[54px]">
                        {/* Partner */}
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{r.partner}</td>

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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Add Delivery Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">+ Add Delivery Partner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Partner Platform Name</label>
                <input
                  type="text"
                  placeholder="e.g. UberEats / Dunzo"
                  value={newPartner.partner}
                  onChange={(e) => setNewPartner({ ...newPartner, partner: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  placeholder="partner-ops@platform.com"
                  value={newPartner.contact}
                  onChange={(e) => setNewPartner({ ...newPartner, contact: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="text"
                    placeholder="e.g. 18%"
                    value={newPartner.commission}
                    onChange={(e) => setNewPartner({ ...newPartner, commission: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={newPartner.effectiveDate}
                    onChange={(e) => setNewPartner({ ...newPartner, effectiveDate: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-base font-bold text-gray-900">Edit {editingPartner.partner}</h3>
              <button onClick={() => setEditingPartner(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditPartner} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={editingPartner.contact}
                  onChange={(e) => setEditingPartner({ ...editingPartner, contact: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Current Commission Rate (%)</label>
                <input
                  type="text"
                  value={editingPartner.currentCommission}
                  onChange={(e) => setEditingPartner({ ...editingPartner, currentCommission: e.target.value })}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Update Partner
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

    </div>
  );
};

export default DeliveryPartners;
