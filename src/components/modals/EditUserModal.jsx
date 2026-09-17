import React, { useState, useEffect } from 'react';
import { X, Save, Check, UserCheck, Loader2 } from 'lucide-react';
import { updateUser, getUserById } from '../../api/users.api';
import toast from 'react-hot-toast';

const EditUserModal = ({ isOpen, onClose, user, userId, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'STAFF',
    primaryBranch: 'Al Naaz Kayamkulam',
    assignedBranches: ['Al Naaz Kayamkulam'],
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    const populateData = (u) => {
      setFormData({
        name: u.name || u.username || '',
        email: u.email || '',
        phone: u.phone || '',
        role: u.rawRole || u.role || 'STAFF',
        primaryBranch: u.branch || 'Al Naaz Kayamkulam',
        assignedBranches: u.assignedBranches || (u.branch ? [u.branch] : ['Al Naaz Kayamkulam']),
        status: u.is_active !== undefined ? (u.is_active ? 'Active' : 'Suspended') : (u.status || 'Active')
      });
    };

    if (user) {
      populateData(user);
    } else if (userId) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const u = await getUserById(userId);
          if (u) populateData(u);
        } catch (err) {
          console.error('Failed to load user for edit modal:', err);
          toast.error('Failed to load user details');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [isOpen, user, userId]);

  if (!isOpen) return null;

  const handleBranchToggle = (branchName) => {
    setFormData((prev) => {
      const current = prev.assignedBranches;
      const exists = current.includes(branchName);
      let updated = exists ? current.filter((b) => b !== branchName) : [...current, branchName];
      if (updated.length === 0) {
        updated = [prev.primaryBranch];
      }
      return { ...prev, assignedBranches: updated };
    });
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

    const targetId = user?.id || userId;
    setSubmitting(true);

    try {
      const updatedUser = await updateUser(targetId, formData);
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
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
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
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                >
                  <option value="STAFF">Staff (STAFF)</option>
                  <option value="MANAGER">Branch Manager (MANAGER)</option>
                  <option value="SUPERADMIN">Super Admin (SUPERADMIN)</option>
                  <option value="CASHIER">Cashier (CASHIER)</option>
                  <option value="KITCHEN">Kitchen Staff (KITCHEN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Primary Branch
                </label>
                <select
                  value={formData.primaryBranch}
                  onChange={(e) => {
                    const pBranch = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      primaryBranch: pBranch,
                      assignedBranches: prev.assignedBranches.includes(pBranch) ? prev.assignedBranches : [...prev.assignedBranches, pBranch]
                    }));
                  }}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                >
                  <option value="Al Naaz Kayamkulam">Al Naaz Kayamkulam (KYLM)</option>
                  <option value="Al Naaz Kochi">Al Naaz Kochi (KOCHI)</option>
                  <option value="Calicut Center">Calicut Center (CAL)</option>
                </select>
              </div>
            </div>

            {/* Branch Access */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Assigned Branch Access
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {['Al Naaz Kayamkulam', 'Al Naaz Kochi', 'Calicut Center'].map((bName) => {
                  const isChecked = formData.assignedBranches.includes(bName);
                  return (
                    <button
                      type="button"
                      key={bName}
                      onClick={() => handleBranchToggle(bName)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all text-xs font-medium ${
                        isChecked
                          ? 'border-gray-900 bg-gray-50 font-bold text-gray-900'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isChecked && <Check size={10} />}
                      </div>
                      <span className="truncate">{bName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
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
