import React, { useState, useEffect } from 'react';
import { X, Save, Check, UserCheck, Loader2 } from 'lucide-react';
import { updateUser, getUserById, getBranches, assignUserToBranch, removeUserFromBranch } from '../../api/users.api';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, user, userId, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    status: 'Active'
  });

  const [branchesList, setBranchesList] = useState([]);
  const [assignedBranchIds, setAssignedBranchIds] = useState([]);
  const [initialBranchIds, setInitialBranchIds] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const targetUserId = Number(user?.id || userId);

    const initModal = async () => {
      setLoading(true);
      setLoadingBranches(true);
      try {
        const [uData, branchesData] = await Promise.all([
          user ? Promise.resolve(user) : (userId ? getUserById(userId) : null),
          getBranches().catch(() => [])
        ]);

        const rawBranches = Array.isArray(branchesData) ? branchesData : (branchesData?.results || []);
        setBranchesList(rawBranches);

        if (uData) {
          setFormData({
            name: uData.name || uData.username || '',
            email: uData.email || '',
            phone: uData.phone || '',
            role: uData.rawRole || uData.role || 'STAFF',
            status: uData.is_active !== undefined ? (uData.is_active ? 'Active' : 'Suspended') : (uData.status || 'Active')
          });

          // Determine currently assigned branches from organization branches API
          const assignedIdsFromBranches = rawBranches
            .filter((b) => Array.isArray(b.users) && b.users.includes(targetUserId))
            .map((b) => b.id);

          // Also check uData.raw?.branches or uData.branches if already loaded
          const rawUserBranches = uData.raw?.branches || uData.branches || [];
          const additionalIds = Array.isArray(rawUserBranches)
            ? rawUserBranches
                .map((b) => (typeof b === 'object' ? b.id : Number(b)))
                .filter((id) => !isNaN(id) && rawBranches.some((rb) => rb.id === id))
            : [];

          const mergedIds = Array.from(new Set([...assignedIdsFromBranches, ...additionalIds]));
          setAssignedBranchIds(mergedIds);
          setInitialBranchIds(mergedIds);
        }
      } catch (err) {
        console.error('Failed to load user or branches data for edit modal:', err);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
        setLoadingBranches(false);
      }
    };

    initModal();
  }, [isOpen, user, userId]);

  if (!isOpen) return null;

  const handleBranchToggle = (branchId) => {
    setAssignedBranchIds((prev) =>
      prev.includes(branchId) ? prev.filter((id) => id !== branchId) : [...prev, branchId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    const targetId = Number(user?.id || userId);
    setSubmitting(true);

    try {
      // 1. Update basic user profile
      const updatedUser = await updateUser(targetId, formData);

      // 2. Synchronize branch assignments with the organization branches API
      const toAdd = assignedBranchIds.filter((id) => !initialBranchIds.includes(id));
      const toRemove = initialBranchIds.filter((id) => !assignedBranchIds.includes(id));

      if (toAdd.length > 0 || toRemove.length > 0) {
        for (const bId of toAdd) {
          try {
            await assignUserToBranch(bId, targetId);
          } catch (branchErr) {
            console.error(`Failed to assign user to branch #${bId}:`, branchErr);
          }
        }
        for (const bId of toRemove) {
          try {
            await removeUserFromBranch(bId, targetId);
          } catch (branchErr) {
            console.error(`Failed to remove user from branch #${bId}:`, branchErr);
          }
        }
      }

      toast.success(`User "${formData.name}" profile updated!`);
      if (onUserUpdated) {
        onUserUpdated(updatedUser || { ...formData, id: targetId, is_active: formData.status === 'Active' });
      }
      onClose();
    } catch (err) {
      console.error('Error updating user:', err);
      toast.error('Failed to update user profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">Edit User Profile</h2>
              <p className="text-xs text-gray-500">Update account details, role, and branch access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 className="animate-spin text-gray-600" size={32} />
            <p className="text-sm font-medium text-gray-500">Fetching user data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name / Username *
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  className={`w-full px-3.5 py-2 bg-gray-50 border ${
                    errors.name ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full px-3.5 py-2 bg-gray-50 border ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  System Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium cursor-pointer"
                >
                  <option value="STAFF">Staff (STAFF)</option>
                  <option value="MANAGER">Manager (MANAGER)</option>
                  {formData.role && !['STAFF', 'MANAGER'].includes(formData.role) && (
                    <option value={formData.role}>{formData.role}</option>
                  )}
                </select>
              </div>

              {/* Account Status Toggle Switch */}
              <div className="sm:col-span-2 flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">Account Status</label>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {formData.status === 'Active'
                      ? 'Account is active and able to sign in'
                      : 'Account is suspended and login access is disabled'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${formData.status === 'Active' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {formData.status === 'Active' ? 'Active' : 'Suspended'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.status === 'Active'}
                    onClick={() => setFormData((prev) => ({
                      ...prev,
                      status: prev.status === 'Active' ? 'Suspended' : 'Active'
                    }))}
                    className={`relative inline-flex h-6 w-11 p-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none focus:outline-none ${
                      formData.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        formData.status === 'Active' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Assigned Branch Access (Actual Organization Branches) */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Assigned Branch Access
                  </label>
                  <p className="text-[11px] text-gray-400">Select which organization branch locations this user can access.</p>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {assignedBranchIds.length} of {branchesList.length} selected
                </span>
              </div>

              {loadingBranches ? (
                <div className="py-6 flex items-center justify-center text-gray-400 gap-2">
                  <Loader2 size={16} className="animate-spin text-gray-600" />
                  <span className="text-xs">Loading organization branches...</span>
                </div>
              ) : branchesList.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No organization branches found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {branchesList.map((branch) => {
                    const isChecked = assignedBranchIds.includes(branch.id);
                    return (
                      <button
                        type="button"
                        key={branch.id}
                        onClick={() => handleBranchToggle(branch.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs font-medium cursor-pointer ${
                          isChecked
                            ? 'border-gray-900 bg-gray-50 font-bold text-gray-900 shadow-xs'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check size={10} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-tight">{branch.name}</p>
                          {branch.code && (
                            <span className="text-[10px] text-gray-400 font-normal">({branch.code})</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit buttons */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;
