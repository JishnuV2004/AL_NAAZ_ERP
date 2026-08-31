import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Users as UsersIcon, ShieldCheck, Clock, UserPlus, Filter } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@alnaazgroup.com', role: 'Super Admin', branch: 'All Branches', status: 'Active', lastLogin: '10 mins ago', avatar: 'A' },
  { id: 2, name: 'Rahul Kumar', email: 'rahul.k@alnaazgroup.com', role: 'Branch Manager', branch: 'Kochi Main', status: 'Active', lastLogin: '2 hours ago', avatar: 'R' },
  { id: 3, name: 'Priya Patel', email: 'priya.p@alnaazgroup.com', role: 'Cashier', branch: 'Calicut Center', status: 'Active', lastLogin: '1 day ago', avatar: 'P' },
  { id: 4, name: 'John Davis', email: 'john.d@alnaazgroup.com', role: 'Kitchen Manager', branch: 'Bangalore Hub', status: 'Suspended', lastLogin: '2 weeks ago', avatar: 'J' },
  { id: 5, name: 'Sayed Abbas', email: 'sayed.a@alnaazgroup.com', role: 'Branch Manager', branch: 'Dubai Marina', status: 'Pending', lastLogin: 'Never', avatar: 'S' },
];

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">System Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee access, roles, and account security</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <UserPlus size={18} /> Invite User
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <UsersIcon size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Users</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">42</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Registered accounts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Active Sessions</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">18</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Currently online</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <Clock size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Pending Invites</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">4</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Awaiting registration</p>
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
              placeholder="Search users by name, email, or role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter size={16} /> Filter
            </button>
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold shrink-0">
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-900">{user.role}</p>
                      <p className="text-xs text-gray-500">{user.branch}</p>
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
                    <td className="py-4 px-6 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                        <MoreVertical size={18} />
                      </button>
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
        
        {/* Pagination (Visual Only) */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
          <p>Showing 1 to {filteredUsers.length} of {mockUsers.length} users</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 bg-gray-900 text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
