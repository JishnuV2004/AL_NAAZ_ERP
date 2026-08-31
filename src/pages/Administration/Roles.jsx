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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Define user roles and structure organizational access levels</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Plus size={18} /> Create New Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRoles.map((role) => (
          <div key={role.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.badgeColor}`}>
                  <Shield size={24} className={role.iconColor} />
                </div>
                <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-400 hover:text-gray-900">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{role.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">{role.description}</p>
              
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                <Users size={16} className="text-gray-400" />
                <span>{role.usersCount} Assigned Users</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 p-4 bg-gray-50/30 flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                <Settings size={16} /> Manage Permissions
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                <Edit2 size={16} /> Edit Role
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roles;
