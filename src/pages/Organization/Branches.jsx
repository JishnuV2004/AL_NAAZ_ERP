import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MoreVertical, MapPin, Store, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import api from '../../config/axios';

const Branches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBranch, setNewBranch] = useState({
    company: 1,
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('https://al-naaz.onrender.com/api/branches/');
        setBranches(response.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const filteredBranches = branches.filter(branch => 
    (branch.name && branch.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (branch.code && branch.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (branch.address && branch.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (branch.email && branch.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveBranch = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingBranchId) {
        const response = await api.patch(`https://al-naaz.onrender.com/api/branches/${editingBranchId}/`, newBranch);
        setBranches(branches.map(b => b.id === editingBranchId ? response.data : b));
      } else {
        const response = await api.post('https://al-naaz.onrender.com/api/branches/', newBranch);
        setBranches([...branches, response.data]);
      }
      setIsAddModalOpen(false);
      setEditingBranchId(null);
      setNewBranch({
        company: 1,
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
        is_active: true
      });
    } catch (err) {
      alert(`Failed to ${editingBranchId ? 'update' : 'add'} branch: ` + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (branch) => {
    setEditingBranchId(branch.id);
    setNewBranch({
      company: branch.company || 1,
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      phone: branch.phone || '',
      email: branch.email || '',
      is_active: branch.is_active
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteBranch = async (id) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await api.delete(`https://al-naaz.onrender.com/api/branches/${id}/`);
        setBranches(branches.filter(b => b.id !== id));
      } catch (err) {
        alert('Failed to delete branch: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.is_active).length;
  const inactiveBranches = totalBranches - activeBranches;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Branches</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all your physical branch locations</p>
        </div>
        <button 
          onClick={() => {
            setEditingBranchId(null);
            setNewBranch({
              company: 1,
              name: '',
              code: '',
              address: '',
              phone: '',
              email: '',
              is_active: true
            });
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Add New Branch
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Store size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Branches</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{totalBranches}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">All locations</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <CheckCircle size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Active Branches</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{activeBranches}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Currently operating</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <XCircle size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Inactive Branches</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{inactiveBranches}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Closed or suspended</p>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search branches by name, code, or location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch Details</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Users / Contact</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{branch.name}</p>
                          <p className="text-xs text-gray-500">Code: {branch.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{branch.address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{branch.user_count || 0} Users</p>
                      <p className="text-xs text-gray-500">{branch.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{branch.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        branch.is_active 
                          ? 'bg-[#dcfce7] text-[#16a34a]' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(branch)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-500"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 size={40} className="text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No branches found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination (Visual Only) */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
          <p>Showing 1 to {filteredBranches.length} of {totalBranches} branches</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingBranchId ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700">Branch Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newBranch.name} 
                    onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                    placeholder="e.g. Al Naaz Kollam"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700">Branch Code</label>
                  <input 
                    required 
                    type="text" 
                    value={newBranch.code} 
                    onChange={e => setNewBranch({...newBranch, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                    placeholder="e.g. KL2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Address</label>
                <input 
                  required 
                  type="text" 
                  value={newBranch.address} 
                  onChange={e => setNewBranch({...newBranch, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                  placeholder="e.g. Kollam, Kerala"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <input 
                    required 
                    type="tel" 
                    value={newBranch.phone} 
                    onChange={e => setNewBranch({...newBranch, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                    placeholder="e.g. 0987654321"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <input 
                    required 
                    type="email" 
                    value={newBranch.email} 
                    onChange={e => setNewBranch({...newBranch, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 text-sm"
                    placeholder="e.g. alnaazkollam@gmail.com"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={newBranch.is_active}
                  onChange={e => setNewBranch({...newBranch, is_active: e.target.checked})}
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Branch is active
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
