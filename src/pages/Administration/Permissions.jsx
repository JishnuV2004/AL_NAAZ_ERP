import React, { useState } from 'react';
import { ChevronDown, Check, Save, ShieldAlert, AlertTriangle } from 'lucide-react';

const ROLES = [
  { id: 'branch_manager', name: 'Branch Manager' },
  { id: 'cashier', name: 'Cashier' },
  { id: 'kitchen_staff', name: 'Kitchen Staff' },
  { id: 'auditor', name: 'Auditor' }
];

const MODULES = [
  { id: 'dashboard', name: 'Dashboard & Analytics' },
  { id: 'organization', name: 'Organization Setup' },
  { id: 'administration', name: 'Administration' },
  { id: 'hr', name: 'Human Resources' },
  { id: 'attendance', name: 'Attendance & Time' },
  { id: 'payroll', name: 'Payroll & Salary' },
  { id: 'inventory', name: 'Inventory & Stock' },
  { id: 'finance', name: 'Finance & Accounts' }
];

const ACTIONS = [
  { id: 'view', name: 'View' },
  { id: 'create', name: 'Create' },
  { id: 'edit', name: 'Edit' },
  { id: 'delete', name: 'Delete' },
  { id: 'approve', name: 'Approve' }
];

// Mock permission matrix state
const initialPermissions = {
  branch_manager: {
    dashboard: { view: true, create: false, edit: false, delete: false, approve: false },
    organization: { view: true, create: false, edit: false, delete: false, approve: false },
    administration: { view: false, create: false, edit: false, delete: false, approve: false },
    hr: { view: true, create: true, edit: true, delete: false, approve: true },
    attendance: { view: true, create: true, edit: true, delete: false, approve: true },
    payroll: { view: true, create: false, edit: false, delete: false, approve: false },
    inventory: { view: true, create: true, edit: true, delete: true, approve: true },
    finance: { view: true, create: true, edit: true, delete: false, approve: false },
  }
};

const Permissions = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [permissions, setPermissions] = useState(initialPermissions);

  const handleToggle = (roleId, moduleId, actionId) => {
    setPermissions(prev => {
      const rolePerms = prev[roleId] || {};
      const modulePerms = rolePerms[moduleId] || { view: false, create: false, edit: false, delete: false, approve: false };
      
      return {
        ...prev,
        [roleId]: {
          ...rolePerms,
          [moduleId]: {
            ...modulePerms,
            [actionId]: !modulePerms[actionId]
          }
        }
      };
    });
  };

  const currentPerms = permissions[selectedRole.id] || {};

  return (
    <div className="space-y-4 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">Permissions Matrix</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Configure fine-grained access controls for each organizational role</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative z-20 w-full sm:w-auto">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between gap-3 px-3.5 py-2 bg-white border border-gray-200 rounded-xl shadow-xs min-w-[220px] text-left hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Editing Role</span>
                <span className="block text-xs sm:text-sm font-bold text-gray-900">{selectedRole.name}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-1.5 right-0 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm text-left hover:bg-gray-50 transition-colors cursor-pointer ${selectedRole.id === role.id ? 'bg-gray-50/50' : ''}`}
                  >
                    <span className={`font-medium ${selectedRole.id === role.id ? 'text-gray-900' : 'text-gray-700'}`}>{role.name}</span>
                    {selectedRole.id === role.id && <Check size={16} className="text-gray-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="w-full sm:w-auto px-4 py-2 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm whitespace-nowrap cursor-pointer">
            <Save size={16} /> Save Matrix
          </button>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex items-start gap-3">
        <AlertTriangle size={18} className="text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-orange-900 text-xs sm:text-sm">Warning: Security Implications</h4>
          <p className="text-xs text-orange-800 mt-0.5">Changes made to this matrix take effect immediately upon saving. Ensure you do not accidentally grant administrative access (like "Delete" or "Approve") to low-level roles.</p>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-5 text-xs font-bold text-gray-900 border-b border-gray-100 w-1/3">
                  System Module
                </th>
                {ACTIONS.map(action => (
                  <th key={action.id} className="py-3 px-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    {action.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MODULES.map((module) => (
                <tr key={module.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="py-3 px-5 text-xs sm:text-sm font-medium text-gray-900">
                    {module.name}
                  </td>
                  {ACTIONS.map(action => {
                    const isGranted = currentPerms[module.id]?.[action.id] || false;
                    
                    return (
                      <td key={action.id} className="py-3 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={isGranted}
                            onChange={() => handleToggle(selectedRole.id, module.id, action.id)}
                          />
                          <div className={`w-10 h-5.5 rounded-full peer peer-focus:outline-none transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all ${
                            isGranted 
                              ? 'bg-gray-900 after:translate-x-full after:border-white' 
                              : 'bg-gray-200'
                          }`}></div>
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
