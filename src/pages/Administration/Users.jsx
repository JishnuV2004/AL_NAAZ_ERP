import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, UserPlus, Users as UsersIcon, ShieldCheck, Clock, 
  Eye, Edit, MapPin, UserX, UserCheck, Trash2, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { getUsers, toggleUserStatus, deleteUser } from '../../api/users.api';
import toast from 'react-hot-toast';
import EditUserModal from '../../components/modals/EditUserModal';
import AddUserModal from '../../components/modals/AddUserModal';

const Users = () => {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [editModalUser, setEditModalUser] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState(null);

  const fetchUsersData = async (showRefreshToast = false) => {
    try {
      setApiError(false);
      setErrorMessage('');
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      const data = await getUsers();
      setUsersList(data || []);

      if (showRefreshToast) {
        toast.success('User list refreshed');
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setApiError(true);
      setErrorMessage(err.message || 'Unable to load user data from API');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  // Status Filter Tabs & metrics
  const activeCount = usersList.filter(u => u.status === 'Active' || u.is_active === true).length;
  const pendingCount = usersList.filter(u => u.status === 'Pending').length;
  const suspendedCount = usersList.filter(u => u.status === 'Suspended' || u.is_active === false).length;

  const filteredUsers = usersList.filter(user => {
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.branch && user.branch.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = 
      selectedStatusTab === 'All' || 
      (selectedStatusTab === 'Active' && user.is_active) ||
      (selectedStatusTab === 'Suspended' && !user.is_active) ||
      (selectedStatusTab === 'Pending' && user.status === 'Pending');

    return matchesSearch && matchesTab;
  });

  const handleToggleStatus = async (user) => {
    setTogglingUserId(user.id);
    try {
      await toggleUserStatus(user.id, user.is_active);
      const nextActive = !user.is_active;
      const nextStatus = nextActive ? 'Active' : 'Suspended';
      
      setUsersList(prev => prev.map(u => {
        if (u.id === user.id) {
          return { ...u, is_active: nextActive, status: nextStatus };
        }
        return u;
      }));

      toast.success(`User "${user.name}" status updated to ${nextStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModalUser || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteModalUser.id);
      setUsersList(prev => prev.filter(u => u.id !== deleteModalUser.id));
      toast.success(`User "${deleteModalUser.name || deleteModalUser.username}" has been deleted`);
      setDeleteModalUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      const apiErrMsg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to delete user account';
      toast.error(`Delete failed: ${apiErrMsg}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusTab]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">System Users</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage employee access, roles, and account security</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fetchUsersData(true)}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm cursor-pointer"
            title="Refresh User Data"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : ''} />
          </button>
          <button 
            onClick={() => navigate('/administration/userbranchaccess')}
            className="px-3.5 py-2 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm cursor-pointer"
          >
            <MapPin size={16} /> Branch Access
          </button>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm cursor-pointer"
          >
            <UserPlus size={16} /> Invite User
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[130px]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <UsersIcon size={20} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-xs font-semibold leading-tight">Total Accounts</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-2xl font-bold text-slate-800 tracking-tight mb-0.5 truncate">{usersList.length}</div>
            <p className="text-xs font-medium text-[#94a3b8] truncate">Registered system users</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[130px]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-xs font-semibold leading-tight">Active Users</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-2xl font-bold text-slate-800 tracking-tight mb-0.5 truncate">{activeCount}</div>
            <p className="text-xs font-medium text-[#94a3b8] truncate">Active access status</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[130px]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Clock size={20} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-xs font-semibold leading-tight">Pending & Suspended</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-2xl font-bold text-slate-800 tracking-tight mb-0.5 truncate">
              {pendingCount + suspendedCount}
            </div>
            <p className="text-xs font-medium text-[#94a3b8] truncate">{pendingCount} Pending • {suspendedCount} Suspended</p>
          </div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col min-h-[560px] justify-between overflow-hidden">
        <div>
          {/* Filter and Search Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center bg-gray-100/80 p-1 rounded-xl w-fit text-xs font-semibold">
              {['All', 'Active', 'Pending', 'Suspended'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedStatusTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedStatusTab === tab
                      ? 'bg-white text-gray-900 shadow-xs font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by name, email, role, or branch..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-900 transition-all text-xs font-medium"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-5">Role & Branch</th>
                    <th className="py-3.5 px-5">Created Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="animate-pulse">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0"></div>
                          <div className="space-y-1.5">
                            <div className="h-4 w-36 bg-gray-200 rounded"></div>
                            <div className="h-3 w-48 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 bg-gray-200 rounded"></div>
                          <div className="h-3 w-20 bg-gray-100 rounded"></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-7 h-7 rounded-lg bg-gray-100"></div>
                          <div className="w-7 h-7 rounded-lg bg-gray-100"></div>
                          <div className="w-7 h-7 rounded-lg bg-gray-100"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-5">Role & Branch</th>
                    <th className="py-3.5 px-5">Created Date</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {paginatedUsers.length > 0 ? (
                    <>
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div 
                              onClick={() => navigate(`/administration/users/${user.id}`)}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                {user.avatar}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="text-xs font-bold text-gray-900">{user.role}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={12} className="text-gray-400" /> {user.branch}
                            </p>
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="text-xs text-gray-500 font-mono">{user.createdAt}</p>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              user.is_active ? 'bg-[#dcfce7] text-[#16a34a]' : 'bg-[#fee2e2] text-[#ef4444]'
                            }`}>
                              {user.is_active ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => navigate(`/administration/users/${user.id}`)}
                                title="View Details"
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => setEditModalUser(user)}
                                title="Edit User Profile"
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
                              >
                                <Edit size={15} />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(user)}
                                disabled={togglingUserId === user.id}
                                title={user.is_active ? 'Suspend User' : 'Activate User'}
                                className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                                  user.is_active 
                                    ? 'text-amber-600 hover:bg-amber-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                              >
                                {togglingUserId === user.id ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : user.is_active ? (
                                  <UserX size={15} />
                                ) : (
                                  <UserCheck size={15} />
                                )}
                              </button>

                              <button
                                onClick={() => setDeleteModalUser(user)}
                                title="Delete User"
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500 hover:text-red-700 cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {Array.from({ length: Math.max(0, itemsPerPage - paginatedUsers.length) }).map((_, idx) => (
                        <tr key={`empty-${idx}`}>
                          <td colSpan="5" className="py-3.5 px-5 text-transparent select-none">&nbsp;</td>
                        </tr>
                      ))}
                    </>
                  ) : apiError ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center font-bold shadow-xs">
                            <AlertCircle size={24} />
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-base">Unable to Load Users from Server</p>
                            <p className="text-gray-500 text-xs mt-1">{errorMessage || 'The server API did not return user data.'}</p>
                          </div>
                          <button
                            onClick={() => fetchUsersData(true)}
                            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-xs mt-2 cursor-pointer"
                          >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Retry Connection
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-bold">
                            <UsersIcon size={24} />
                          </div>
                          <div>
                            <p className="text-gray-900 font-bold text-base">No Users Found</p>
                            <p className="text-gray-500 text-xs mt-1">No user accounts are registered in the database yet.</p>
                          </div>
                          <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-xs mt-2 cursor-pointer"
                          >
                            <UserPlus size={14} /> Invite First User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <UsersIcon size={40} className="text-gray-300 mb-3" />
                          <p className="text-gray-500 font-medium text-xs">No users found matching your search query or tab filter</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-gray-500 bg-white mt-auto">
          <p>
            Showing {filteredUsers.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of{' '}
            {filteredUsers.length} entries
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

      {/* Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl border border-gray-100 space-y-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              {isDeleting ? <Loader2 size={24} className="animate-spin" /> : <Trash2 size={24} />}
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete User Account</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to remove <span className="font-bold text-gray-900">{deleteModalUser.name}</span> ({deleteModalUser.email})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editModalUser}
        onClose={() => setEditModalUser(null)}
        user={editModalUser}
        onUserUpdated={() => fetchUsersData()}
      />

      {/* Invite User Modal */}
      <AddUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onUserCreated={() => fetchUsersData()}
      />
    </div>
  );
};

export default Users;
