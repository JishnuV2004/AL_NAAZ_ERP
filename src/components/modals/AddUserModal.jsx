import React, { useState, useEffect } from 'react';
import { 
  X, UserPlus, Mail, Phone, Shield, Building2, Check, Send, 
  Loader2, Key, CheckCircle2, Lock, Eye, EyeOff, ArrowRight
} from 'lucide-react';
import { createUser, getBranches, assignUserToBranch } from '../../api/users.api';
import toast from 'react-hot-toast';

const AddUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [branchesList, setBranchesList] = useState([]);

  // Step 1 Form Data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'STAFF'
  });

  // Step 2 Branch Selection
  const [selectedBranchIds, setSelectedBranchIds] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    // Reset modal state on open
    setStep(1);
    setCreatedUser(null);
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'STAFF'
    });
    setErrors({});

    const fetchBranchesData = async () => {
      try {
        const bList = await getBranches();
        setBranchesList(bList);
        if (bList.length > 0) {
          setSelectedBranchIds([bList[0].id]);
        }
      } catch (err) {
        console.error('Failed to load branches for modal:', err);
      }
    };
    fetchBranchesData();
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Step 1: Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Username / Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setSubmitting(true);
    try {
      const newUser = await createUser(formData);
      setCreatedUser(newUser);
      toast.success(`User "${newUser.name || formData.username}" created successfully!`);
      if (onUserCreated) onUserCreated(newUser);
      // Proceed to optional step 2 (Branch assignment)
      setStep(2);
    } catch (err) {
      console.error('Error creating user:', err);
      const apiErrMsg =
        err.response?.data?.username?.[0] ||
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to create user account';
      toast.error(`Creation failed: ${apiErrMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Branch Toggle for Step 2
  const handleBranchToggle = (branchId) => {
    setSelectedBranchIds((prev) => {
      const exists = prev.includes(branchId);
      if (exists) {
        return prev.filter((id) => id !== branchId);
      } else {
        return [...prev, branchId];
      }
    });
  };

  // Handle Step 2: Save Branch Access
  const handleSaveBranches = async () => {
    if (!createdUser) {
      onClose();
      return;
    }

    if (selectedBranchIds.length === 0) {
      toast.error('Please select at least one branch or click Skip & Finish');
      return;
    }

    setSubmitting(true);
    try {
      for (const bId of selectedBranchIds) {
        await assignUserToBranch(bId, createdUser.id);
      }
      toast.success('User assigned to branch successfully!');
      if (onUserCreated) onUserCreated(createdUser);
      onClose();
    } catch (err) {
      console.error('Failed to assign branch:', err);
      const apiErrMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to assign branch';
      toast.error(apiErrMsg);
      onClose();
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
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-gray-900">Invite & Create User</h2>
              <p className="text-xs text-gray-500">Register new system user account and assign access rights</p>
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <div className={`flex items-center gap-2 text-xs font-bold ${
            step === 1 ? 'text-gray-900' : 'text-green-600'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 1 ? 'bg-gray-900 text-white' : 'bg-green-100 text-green-700'
            }`}>
              {step === 1 ? '1' : <Check size={14} />}
            </div>
            <span>1. Account Registration</span>
          </div>

          <div className="w-8 h-0.5 bg-gray-200"></div>

          <div className={`flex items-center gap-2 text-xs font-bold ${
            step === 2 ? 'text-gray-900' : 'text-gray-400'
          }`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step === 2 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span>2. Assign Branch (Optional)</span>
          </div>
        </div>

        {/* Step 1: User Account Creation Form */}
        {step === 1 && (
          <form onSubmit={handleCreateUser} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username / Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Username / Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. jishnu"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    if (errors.username) setErrors({ ...errors, username: '' });
                  }}
                  className={`w-full px-3.5 py-2 bg-gray-50 border ${
                    errors.username ? 'border-red-500' : 'border-gray-200'
                  } rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium`}
                />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. user@gmail.com"
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

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password (Optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Defaults to Alnaaz@123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3.5 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Leave empty to use default secure password.</p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                />
              </div>

              {/* System Role */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  System Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full sm:w-1/2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
                >
                  <option value="STAFF">Staff (STAFF)</option>
                  <option value="MANAGER">Branch Manager (MANAGER)</option>
                  <option value="SUPERADMIN">Super Admin (SUPERADMIN)</option>
                  <option value="CASHIER">Cashier (CASHIER)</option>
                  <option value="KITCHEN">Kitchen Staff (KITCHEN)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
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
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {submitting ? 'Creating...' : 'Create User Account'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Branch Assignment (Optional) */}
        {step === 2 && createdUser && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* User Created Banner */}
            <div className="bg-green-50/80 border border-green-200 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-green-900 text-sm">User Created Successfully!</h3>
                <p className="text-xs text-green-700 mt-0.5">
                  Account <span className="font-bold">{createdUser.name || createdUser.username}</span> ({createdUser.email}) with role <span className="font-bold">{createdUser.role}</span> is active.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
                  <Building2 className="text-gray-900" size={20} /> Assign Branch Access
                </h3>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase">
                  Optional
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select branches to authorize user access. You can also skip this and assign branches later.
              </p>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {branchesList.map((branch) => {
                  const isChecked = selectedBranchIds.includes(branch.id);
                  return (
                    <button
                      type="button"
                      key={branch.id}
                      onClick={() => handleBranchToggle(branch.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'border-gray-900 bg-gray-50 font-bold text-gray-900 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isChecked && <Check size={10} />}
                      </div>
                      <div>
                        <span className="text-xs font-bold block text-gray-900">{branch.name}</span>
                        {branch.code && <span className="text-[10px] text-gray-400 font-mono">({branch.code})</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                >
                  Skip & Finish
                </button>

                <button
                  type="button"
                  onClick={handleSaveBranches}
                  disabled={submitting}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {submitting ? 'Saving...' : 'Save Branch Access'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUserModal;
