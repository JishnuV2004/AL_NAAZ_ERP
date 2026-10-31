import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, MapPin, Store, CheckCircle, XCircle, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../../config/axios';
import toast from 'react-hot-toast';

const Branches = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add / Edit Modal State
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

  // Delete Confirmation Modal State
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/branches/');
        const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
        setBranches(data);
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
        const response = await api.patch(`/branches/${editingBranchId}/`, newBranch);
        setBranches(branches.map(b => b.id === editingBranchId ? response.data : b));
        toast.success(`Branch "${newBranch.name}" updated successfully!`);
      } else {
        const response = await api.post('/branches/', newBranch);
        setBranches([...branches, response.data]);
        toast.success(`Branch "${newBranch.name}" created successfully!`);
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
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || `Failed to ${editingBranchId ? 'update' : 'add'} branch`;
      toast.error(errorMsg);
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
      is_active: branch.is_active !== undefined ? branch.is_active : true
    });
    setIsAddModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!branchToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await api.delete(`/branches/${branchToDelete.id}/`);
      setBranches(prev => prev.filter(b => b.id !== branchToDelete.id));
      toast.success(`Branch "${branchToDelete.name}" deleted successfully!`);
      setBranchToDelete(null);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to delete branch';
      toast.error(`Delete failed: ${errorMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalBranches = branches.length;
  const activeBranches = branches.filter(b => b.is_active).length;
  const inactiveBranches = totalBranches - activeBranches;

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBranches = filteredBranches.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Branches</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage and monitor all your physical branch locations</p>
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
          className="px-4 py-2 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm cursor-pointer"
        >
          <Plus size={16} /> Add New Branch
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs animate-pulse min-h-[120px] flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0"></div>
                <div className="h-4 bg-gray-200 rounded-md w-28"></div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-7 bg-gray-200 rounded-md w-16"></div>
                <div className="h-3 bg-gray-200 rounded-md w-24"></div>
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[130px]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Store size={20} />
                </div>
                <div className="flex flex-col items-start pt-0.5">
                  <span className="text-[#475569] text-xs font-semibold leading-tight">Total Branches</span>
                </div>
              </div>
              <div className="mt-auto min-w-0">
                <div className="font-sans text-2xl font-bold text-slate-800 tracking-tight mb-0.5 truncate">{totalBranches}</div>
                <p className="text-xs font-medium text-[#94a3b8] truncate">All locations</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[130px]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div className="flex flex-col items-start pt-0.5">
                  <span className="text-[#475569] text-xs font-semibold leading-tight">Active Branches</span>
                </div>
              </div>
              <div className="mt-auto min-w-0">
                <div className="font-sans text-2xl font-bold text-slate-800 tracking-tight mb-0.5 truncate">{activeBranches}</div>
                <p className="text-xs font-medium text-[#94a3b8] truncate">Currently operating</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[130px]">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                  <XCircle size={20} />
                </div>
                <div className="flex flex-col items-start pt-0.5">
                  <span className="text-[#475569] text-xs font-semibold leading-tight">Inactive Branches</span>
                </div>
              </div>
              <div className="mt-auto min-w-0">
                <div className="font-sans text-2xl font-bold text-slate-800 tracking-tight mb-0.5 truncate">{inactiveBranches}</div>
                <p className="text-xs font-medium text-[#94a3b8] truncate">Closed or suspended</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col min-h-[560px] justify-between">
        <div>
          {/* Table Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search branches by name, code, or location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 transition-all text-xs font-medium"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-xs uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
                  <th className="py-3 px-5 text-left">Branch Details</th>
                  <th className="py-3 px-5 text-left">Location</th>
                  <th className="py-3 px-5 text-left">Users / Contact</th>
                  <th className="py-3 px-5 text-left">Email</th>
                  <th className="py-3 px-5 text-left">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-200 shrink-0"></div>
                          <div className="space-y-1.5">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gray-200 shrink-0"></div>
                          <div className="h-3.5 bg-gray-200 rounded w-36"></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="space-y-1.5">
                          <div className="h-3.5 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-3.5 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                          <div className="w-7 h-7 bg-gray-200 rounded-lg"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-red-500 font-medium">
                      {error}
                    </td>
                  </tr>
                ) : paginatedBranches.length > 0 ? (
                  <>
                    {paginatedBranches.map((branch) => (
                      <tr key={branch.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                              <Building2 size={17} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{branch.name}</p>
                              <p className="text-xs text-gray-500 font-mono">Code: {branch.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <MapPin size={15} className="text-gray-400 shrink-0" />
                            <span className="text-xs font-medium text-gray-700">{branch.address}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-xs font-bold text-gray-900">{branch.user_count || (Array.isArray(branch.users) ? branch.users.length : 0)} Users</p>
                          <p className="text-xs text-gray-500">{branch.phone}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <p className="text-xs text-gray-600 font-medium">{branch.email}</p>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            branch.is_active 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {branch.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleEditClick(branch)}
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={15} />
                            </button>
                            <button 
                              onClick={() => setBranchToDelete(branch)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600 cursor-pointer"
                              title="Delete Branch"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {Array.from({ length: Math.max(0, itemsPerPage - paginatedBranches.length) }).map((_, idx) => (
                      <tr key={`empty-${idx}`}>
                        <td colSpan="6" className="py-3.5 px-5 text-transparent select-none">&nbsp;</td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 size={36} className="text-gray-300 mb-2" />
                        <p className="text-gray-500 text-xs font-medium">No branches found matching "{searchQuery}"</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
          
        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-gray-500 bg-white mt-auto">
          <p>
            Showing {filteredBranches.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredBranches.length)} of{' '}
            {filteredBranches.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded border border-gray-200 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === idx + 1
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded border border-gray-200 text-xs font-semibold hover:bg-gray-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingBranchId ? 'Edit Branch' : 'Add New Branch'}</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Branch Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={newBranch.name} 
                    onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gray-900 text-sm font-medium transition-all"
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Branch Code *</label>
                  <input 
                    required 
                    type="text" 
                    value={newBranch.code} 
                    onChange={e => setNewBranch({...newBranch, code: e.target.value})}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gray-900 text-sm font-medium transition-all"
                    placeholder="Enter branch code"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Address *</label>
                <input 
                  required 
                  type="text" 
                  value={newBranch.address} 
                  onChange={e => setNewBranch({...newBranch, address: e.target.value})}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gray-900 text-sm font-medium transition-all"
                  placeholder="Enter branch address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone *</label>
                  <input 
                    required 
                    type="tel" 
                    value={newBranch.phone} 
                    onChange={e => setNewBranch({...newBranch, phone: e.target.value})}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gray-900 text-sm font-medium transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    value={newBranch.email} 
                    onChange={e => setNewBranch({...newBranch, email: e.target.value})}
                    className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-gray-900 text-sm font-medium transition-all"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Branch is Active Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">Branch is active</label>
                  <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                    {newBranch.is_active
                      ? 'Branch is active and available for operations'
                      : 'Branch is inactive / closed'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-bold ${newBranch.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {newBranch.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={newBranch.is_active}
                    onClick={() => setNewBranch(prev => ({ ...prev, is_active: !prev.is_active }))}
                    className={`relative inline-flex h-6 w-11 p-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out outline-none focus:outline-none ${
                      newBranch.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        newBranch.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (editingBranchId ? 'Update Branch' : 'Save Branch')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 font-sans">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-base font-bold text-gray-900 text-center mb-1">
              Delete Branch?
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-gray-800">"{branchToDelete.name}"</span> ({branchToDelete.code})? This will permanently remove this location from the system.
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) setBranchToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Branch</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
