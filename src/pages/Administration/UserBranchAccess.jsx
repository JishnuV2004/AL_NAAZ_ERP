import React, { useState } from 'react';
import { Search, Save, MapPin, User, Check, Building2 } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Rahul Kumar', role: 'Branch Manager', email: 'rahul.k@alnaazgroup.com' },
  { id: 2, name: 'Priya Patel', role: 'Cashier', email: 'priya.p@alnaazgroup.com' },
  { id: 3, name: 'John Davis', role: 'Kitchen Manager', email: 'john.d@alnaazgroup.com' },
  { id: 4, name: 'Sayed Abbas', role: 'Branch Manager', email: 'sayed.a@alnaazgroup.com' },
  { id: 5, name: 'Admin User', role: 'Super Admin', email: 'admin@alnaazgroup.com' },
];

const mockBranches = [
  { id: 'koc_01', name: 'Kochi Main', code: 'KOC-01', location: 'Kerala' },
  { id: 'cal_01', name: 'Calicut Center', code: 'CAL-01', location: 'Kerala' },
  { id: 'tvm_01', name: 'Trivandrum South', code: 'TVM-01', location: 'Kerala' },
  { id: 'dxb_01', name: 'Dubai Marina', code: 'DXB-01', location: 'UAE' },
  { id: 'blr_01', name: 'Bangalore Hub', code: 'BLR-01', location: 'Karnataka' },
];

const UserBranchAccess = () => {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [searchUser, setSearchUser] = useState('');
  
  // Track assigned branches for the selected user
  const [assignedBranches, setAssignedBranches] = useState({
    1: ['koc_01', 'cal_01'],
    2: ['cal_01'],
    3: ['blr_01'],
    4: ['dxb_01'],
    5: ['koc_01', 'cal_01', 'tvm_01', 'dxb_01', 'blr_01']
  });
  
  // Track primary branch
  const [primaryBranch, setPrimaryBranch] = useState({
    1: 'koc_01',
    2: 'cal_01',
    3: 'blr_01',
    4: 'dxb_01',
    5: 'koc_01'
  });

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const currentUserBranches = assignedBranches[selectedUser.id] || [];
  const currentPrimary = primaryBranch[selectedUser.id] || null;

  const toggleBranchAccess = (branchId) => {
    setAssignedBranches(prev => {
      const current = prev[selectedUser.id] || [];
      const updated = current.includes(branchId)
        ? current.filter(id => id !== branchId)
        : [...current, branchId];
        
      return { ...prev, [selectedUser.id]: updated };
    });
  };

  const setAsPrimary = (branchId) => {
    // Only allow if they have access to this branch
    if (currentUserBranches.includes(branchId)) {
      setPrimaryBranch(prev => ({ ...prev, [selectedUser.id]: branchId }));
    }
  };

  const toggleAll = () => {
    setAssignedBranches(prev => {
      const isAllSelected = (prev[selectedUser.id] || []).length === mockBranches.length;
      return {
        ...prev,
        [selectedUser.id]: isAllSelected ? [] : mockBranches.map(b => b.id)
      };
    });
  };

  const isAllSelected = currentUserBranches.length === mockBranches.length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">User Branch Access</h1>
          <p className="text-sm text-gray-500 mt-1">Assign users to specific physical locations to isolate data access</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Save size={18} /> Save Assignments
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Column: Users List */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-3">Select User</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 transition-all text-sm font-medium"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                  selectedUser.id === user.id 
                    ? 'bg-blue-50 border border-blue-100' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  selectedUser.id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'
                }`}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${selectedUser.id === user.id ? 'text-blue-900' : 'text-gray-900'}`}>{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Branch Assignment */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                  <User size={14} /> {selectedUser.role}
                  <span className="text-gray-300">|</span>
                  <MapPin size={14} /> {(assignedBranches[selectedUser.id] || []).length} Branches Assigned
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 text-lg">Branch Access Matrix</h3>
              <button 
                onClick={toggleAll}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm ${
                  isAllSelected ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isAllSelected ? 'Revoke All Access' : 'Grant All Access'}
              </button>
            </div>

            <div className="grid gap-4">
              {mockBranches.map(branch => {
                const hasAccess = currentUserBranches.includes(branch.id);
                const isPrimary = currentPrimary === branch.id;

                return (
                  <div 
                    key={branch.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                      hasAccess ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={hasAccess}
                          onChange={() => toggleBranchAccess(branch.id)}
                        />
                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                          hasAccess ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                        }`}>
                          {hasAccess && <Check size={14} className="text-white" />}
                        </div>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          hasAccess ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{branch.name}</h4>
                          <p className="text-xs text-gray-500">Code: {branch.code} &bull; {branch.location}</p>
                        </div>
                      </div>
                    </div>

                    {hasAccess && (
                      <button 
                        onClick={() => setAsPrimary(branch.id)}
                        disabled={isPrimary}
                        className={`sm:ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isPrimary 
                            ? 'bg-blue-100 text-blue-700 cursor-default' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {isPrimary ? 'Primary Branch' : 'Set as Primary'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBranchAccess;
