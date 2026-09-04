import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, UserPlus, MoreVertical, Users as UsersIcon, ShieldCheck, Clock, 
  Eye, Edit, MapPin, UserX, UserCheck, Trash2, Filter, ChevronRight
} from 'lucide-react';
import { mockUsers as initialMockUsers } from './mockUsersData';
import toast from 'react-hot-toast';

const Users = () => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState(initialMockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  // Status Filter Tabs & metrics
  const activeCount = usersList.filter(u => u.status === 'Active').length;
  const pendingCount = usersList.filter(u => u.status === 'Pending').length;
  const suspendedCount = usersList.filter(u => u.status === 'Suspended').length;

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.branch.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedStatusTab === 'All' || user.status === selectedStatusTab;

    return matchesSearch && matchesTab;
  });

  const handleToggleStatus = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        toast.success(`User "${u.name}" status updated to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    setOpenDropdownId(null);
  };

  const handleDeleteUser = () => {
    if (!deleteModalUser) return;
    setUsersList(prev => prev.filter(u => u.id !== deleteModalUser.id));
    toast.success(`User "${deleteModalUser.name}" has been removed`);
    setDeleteModalUser(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">System Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee access, roles, and account security</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/administration/userbranchaccess')}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <MapPin size={16} /> Branch Access
          </button>
          <button 
            onClick={() => navigate('/administration/users/new')}
            className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <UserPlus size={18} /> Invite User
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <UsersIcon size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Accounts</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{usersList.length}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Registered system users</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Active Users</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{activeCount}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Active access status</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Clock size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Pending & Suspended</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">
              {pendingCount + suspendedCount}
            </div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">{pendingCount} Pending • {suspendedCount} Suspended</p>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
        {/* Filter and Search Bar */}
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl w-fit text-xs font-semibold">
            {['All', 'Active', 'Pending', 'Suspended'].map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  selectedStatusTab === tab
                    ? 'bg-white text-gray-900 shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, role, or branch..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role & Branch</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div 
                        onClick={() => navigate(`/administration/users/${user.id}`)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{user.role}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-gray-400" /> {user.branch}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-500">{user.lastLogin}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'Active' ? 'bg-[#dcfce7] text-[#16a34a]' : 
                        user.status === 'Suspended' ? 'bg-[#fee2e2] text-[#ef4444]' : 
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/administration/users/${user.id}`)}
                          title="View Details"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => navigate(`/administration/users/${user.id}/edit`)}
                          title="Edit User"
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                        >
                          <Edit size={17} />
                        </button>

                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {openDropdownId === user.id && (
                            <div 
                              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 text-left"
                              onMouseLeave={() => setOpenDropdownId(null)}
                            >
                              <button
                                onClick={() => {
                                  navigate(`/administration/users/${user.id}`);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye size={14} /> View Details
                              </button>

                              <button
                                onClick={() => {
                                  navigate(`/administration/users/${user.id}/edit`);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} /> Edit Profile
                              </button>

                              <button
                                onClick={() => {
                                  navigate('/administration/userbranchaccess');
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <MapPin size={14} /> Manage Branch Access
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user.id)}
                                className={`w-full px-4 py-2 text-xs font-medium hover:bg-gray-50 flex items-center gap-2 ${
                                  user.status === 'Active' ? 'text-amber-600' : 'text-green-600'
                                }`}
                              >
                                {user.status === 'Active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                              </button>

                              <div className="border-t border-gray-100 my-1"></div>

                              <button
                                onClick={() => {
                                  setDeleteModalUser(user);
                                  setOpenDropdownId(null);
                                }}
                                className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} /> Remove User
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon size={40} className="text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">No users found matching "{searchQuery}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
          <p>Showing 1 to {filteredUsers.length} of {usersList.length} users</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs">Previous</button>
            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-xs">Next</button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete User Account</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to remove <span className="font-bold text-gray-900">{deleteModalUser.name}</span> ({deleteModalUser.email})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
