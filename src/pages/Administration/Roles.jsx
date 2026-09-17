import React from 'react';
import { Shield, Plus, Users, Settings, MoreVertical, Edit2 } from 'lucide-react';

const mockRoles = [
  {
    id: 1,
    name: 'Super Admin',
    description: 'Full system access including all branches, billing configurations, and user management.',
    usersCount: 2,
    badgeColor: 'bg-red-50',
    iconColor: 'text-red-600'
  },
  {
    id: 2,
    name: 'Branch Manager',
    description: 'Complete access to their assigned branch operations, including inventory, staff, and local reports.',
    usersCount: 8,
    badgeColor: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    id: 3,
    name: 'Cashier',
    description: 'Access to POS system, daily cash drawer operations, and basic daily reporting.',
    usersCount: 24,
    badgeColor: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    id: 4,
    name: 'Kitchen Staff',
    description: 'View-only access to active orders, kitchen display systems, and inventory requests.',
    usersCount: 36,
    badgeColor: 'bg-orange-50',
    iconColor: 'text-orange-600'
  },
  {
    id: 5,
    name: 'Auditor',
    description: 'Read-only access to all financial records, tax reports, and historical data across branches.',
    usersCount: 3,
    badgeColor: 'bg-purple-50',
    iconColor: 'text-purple-600'
  }
];

const Roles = () => {
  return (
    <div className="space-y-4 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Role Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Define user roles and structure organizational access levels</p>
        </div>
        <button className="px-4 py-2 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm cursor-pointer">
          <Plus size={16} /> Create New Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {mockRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${role.badgeColor}`}>
                  <Shield size={20} className={role.iconColor} />
                </div>
                <button className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-900 cursor-pointer">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1.5">{role.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed flex-1">{role.description}</p>
              
              <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-700 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                <Users size={15} className="text-gray-400" />
                <span>{role.usersCount} Assigned Users</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 p-3 px-4 bg-gray-50/30 flex items-center justify-between">
              <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                <Settings size={15} /> Manage Permissions
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                <Edit2 size={15} /> Edit Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roles;
