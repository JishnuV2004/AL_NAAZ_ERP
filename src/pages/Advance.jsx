import React, { useState, useEffect } from 'react';
import { useAdvanceStore } from '../store/advanceStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { advanceService } from '../services/advanceService';
import { IoAddOutline, IoSearchOutline, IoWalletOutline } from 'react-icons/io5';
import Modal from '../components/common/Modal';
import { PageLoader, ButtonLoader } from '../components/common/Loader';

const Advance = () => {
  const { advances, loading } = useAdvanceStore();
  const { staff } = useAttendanceStore();
  const stats = useAdvanceStore((state) => state.getStats());

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    staffId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    advanceService.fetchAdvances();
    // Default the selected staff to first option if available
    if (staff.length > 0 && !formData.staffId) {
      setFormData((prev) => ({ ...prev, staffId: staff[0].id }));
    }
  }, [staff]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.staffId) errors.staffId = 'Staff selection is required';
    if (!formData.amount || Number(formData.amount) <= 0) errors.amount = 'Invalid advance amount';
    if (!formData.reason.trim()) errors.reason = 'Reason for advance is required';
    if (!formData.date) errors.date = 'Date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedMember = staff.find((s) => s.id === formData.staffId);
      const submissionData = {
        ...formData,
        staffName: selectedMember ? selectedMember.name : 'Unknown Staff'
      };

      await advanceService.addAdvance(submissionData);
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        staffId: staff[0]?.id || '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: ''
      });
    } catch (err) {
      console.error('[Add Advance Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Partial':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Paid Back':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // Filter advances by Search
  const filteredAdvances = advances.filter((adv) => {
    const term = searchTerm.toLowerCase();
    return (
      adv.staffName.toLowerCase().includes(term) ||
      adv.reason.toLowerCase().includes(term) ||
      adv.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Advances Given */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Total Advance Given</span>
          <p className="mt-2 font-serif text-3xl font-bold text-gray-900">₹{stats.totalGiven.toLocaleString()}</p>
          <span className="mt-1 block text-xs text-gray-500">All-time loan volumes</span>
        </div>

        {/* Remaining to Deduct */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Outstanding Balance</span>
          <p className="mt-2 font-serif text-3xl font-bold text-[#1E5E45]">₹{stats.totalRemaining.toLocaleString()}</p>
          <span className="mt-1 block text-xs text-gray-500">Balance awaiting payroll deduction</span>
        </div>

        {/* Active Staff with Advance */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Active Debtors</span>
          <p className="mt-2 font-serif text-3xl font-bold text-amber-600">{stats.activeAdvancesCount}</p>
          <span className="mt-1 block text-xs text-gray-500">Staff with pending balances</span>
        </div>
      </div>

      {/* 2. Controls header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
            <IoSearchOutline className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search staff or reason..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 font-sans text-sm text-gray-900 outline-hidden focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
          />
        </div>

        {/* Add Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 rounded-xl bg-[#1E5E45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5E45]-hover transition-colors shadow-md hover:shadow-sm cursor-pointer"
        >
          <IoAddOutline className="h-5 w-5" />
          <span>Record Advance</span>
        </button>
      </div>

      {/* 3. Table lists */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : filteredAdvances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-2">
            <span className="text-4xl">💰</span>
            <p className="font-semibold text-sm">No advances logged</p>
            <p className="text-xs">Use the button above to record a salary advance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-gray-100-dark/50 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4 text-right">Advance Amount</th>
                  <th className="px-6 py-4 text-right">Outstanding Balance</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{adv.staffName}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(adv.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-500">₹{adv.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">₹{adv.remaining.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(adv.status)}`}>
                        {adv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs font-medium max-w-[200px] truncate" title={adv.reason}>
                      {adv.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Record Advance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Salary Advance">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Select Staff member */}
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Select Staff Member
            </label>
            <select
              name="staffId"
              value={formData.staffId}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
            {formErrors.staffId && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.staffId}</p>}
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Issue Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Advance Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full rounded-xl border ${formErrors.amount ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]`}
                placeholder="e.g. 5000"
                min="1"
              />
              {formErrors.amount && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.amount}</p>}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Reason / Notes
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows="3"
              className={`w-full rounded-xl border ${formErrors.reason ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]`}
              placeholder="e.g. Emergency family expense, deducted in next salary run"
            />
            {formErrors.reason && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.reason}</p>}
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100-dark transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#1E5E45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5E45]-hover transition-colors shadow-md hover:shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <ButtonLoader /> : 'Record Advance'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Advance;
