import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Shield, Building2, Check, UserCheck } from 'lucide-react';
import { mockUsers, mockRolesList, mockBranchesList } from './mockUsersData';
import toast from 'react-hot-toast';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = mockUsers.find((u) => u.id === parseInt(id, 10)) || mockUsers[0];

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '+91 98765 43210',
    role: user.role,
    primaryBranch: user.branch,
    assignedBranches: user.assignedBranches || [user.branch],
    status: user.status
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 98765 43210',
        role: user.role,
        primaryBranch: user.branch,
        assignedBranches: user.assignedBranches || [user.branch],
        status: user.status
      });
    }
  }, [user]);

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

  const handleSubmit = (e) => {
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

    toast.success(`User "${formData.name}" profile updated!`);
    navigate(`/administration/users/${user.id}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <button
          onClick={() => navigate(`/administration/users/${user.id}`)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} /> Back to User Details
        </button>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edit Mode</span>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="text-gray-900" size={26} /> Edit User Account
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update user information, access permissions, primary branch, and account status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-4 py-2.5 bg-gray-50 border ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                } rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full px-4 py-2.5 bg-gray-50 border ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                } rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                System Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
              >
                {mockRolesList.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending">Pending Invite</option>
              </select>
            </div>
          </div>

          {/* Branch Access */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Branch Authorization</h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
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
                className="w-full md:w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
              >
                {mockBranchesList.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                Assigned Branches Access
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {mockBranchesList.map((b) => {
                  const isChecked = formData.assignedBranches.includes(b.name);
                  return (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => handleBranchToggle(b.name)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'border-gray-900 bg-gray-50 font-bold text-gray-900'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                        isChecked ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isChecked && <Check size={12} />}
                      </div>
                      <span className="text-sm">{b.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/administration/users/${user.id}`)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors shadow-sm flex items-center gap-2"
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
