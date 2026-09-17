import React, { useState, useEffect } from 'react';
import { Search, Save, MapPin, User, Check, Building2, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { getUsers, getBranches, assignUserToBranch, removeUserFromBranch, patchUser } from '../../api/users.api';
import toast from 'react-hot-toast';

const UserBranchAccessSkeleton = () => {
  return (
    <div className="space-y-4 font-sans w-full animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-96 bg-gray-100 rounded-md mt-1.5"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-200 rounded-xl"></div>
          <div className="h-9 w-36 bg-gray-200 rounded-xl"></div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)] min-h-[550px]">
        {/* Left Column Skeleton: Users List */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="h-9 w-full bg-gray-100 rounded-xl"></div>
          </div>
          <div className="p-2 space-y-2 flex-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton: Branch Matrix */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* Top User Info Bar Skeleton */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
              <div className="space-y-2">
                <div className="h-5 w-40 bg-gray-200 rounded"></div>
                <div className="h-3 w-64 bg-gray-100 rounded"></div>
              </div>
            </div>
            <div className="h-9 w-32 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Matrix Content Skeleton */}
          <div className="p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-48 bg-gray-200 rounded"></div>
            </div>

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded bg-gray-200"></div>
                  <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-gray-200 rounded"></div>
                    <div className="h-3 w-28 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="h-7 w-28 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserBranchAccess = () => {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  
  // Track assigned branch IDs per user ID in UI state
  const [assignedBranches, setAssignedBranches] = useState({});
  // Track original assigned branch IDs per user ID (loaded from backend)
  const [originalAssigned, setOriginalAssigned] = useState({});
  // Track primary branch per user ID
  const [primaryBranch, setPrimaryBranch] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, branchesData] = await Promise.all([getUsers(), getBranches()]);
      setUsers(usersData);
      setBranches(branchesData);

      if (usersData.length > 0) {
        setSelectedUser(usersData[0]);

        const initialAssigned = {};
        const initialPrimary = {};

        usersData.forEach(u => {
          let mappedIds = [];

          // 1. Primary check: branch.users array from GET /branches/ API (e.g. users: [3, 7])
          branchesData.forEach(branch => {
            if (Array.isArray(branch.users) && branch.users.includes(u.id)) {
              mappedIds.push(branch.id);
            }
          });

          // 2. Secondary check: user's raw branches array
          const rawUserBranches = u.raw?.branches || u.branches || [];
          if (Array.isArray(rawUserBranches)) {
            rawUserBranches.forEach(b => {
              if (typeof b === 'object' && b.id) {
                mappedIds.push(b.id);
              } else if (typeof b === 'number') {
                mappedIds.push(b);
              } else if (typeof b === 'string') {
                const found = branchesData.find(br => br.name === b || br.code === b);
                if (found) mappedIds.push(found.id);
              }
            });
          }

          // 3. Fallback check: assignedBranches string names
          if (Array.isArray(u.assignedBranches)) {
            u.assignedBranches.forEach(bName => {
              const found = branchesData.find(br => br.name === bName || br.code === bName);
              if (found) mappedIds.push(found.id);
            });
          }

          const uniqueIds = [...new Set(mappedIds)];
          const defaultBranchId = branchesData.length > 0 ? branchesData[0].id : 1;
          initialAssigned[u.id] = uniqueIds;
          initialPrimary[u.id] = uniqueIds.length > 0 ? uniqueIds[0] : defaultBranchId;
        });

        setAssignedBranches(initialAssigned);
        setOriginalAssigned(JSON.parse(JSON.stringify(initialAssigned)));
        setPrimaryBranch(initialPrimary);
      }
    } catch (err) {
      console.error('Failed to load users or branches for branch access:', err);
      toast.error('Failed to load branch access data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const currentUserId = selectedUser?.id;
  const currentUserBranches = currentUserId ? assignedBranches[currentUserId] || [] : [];
  const currentPrimary = currentUserId ? primaryBranch[currentUserId] || null : null;

  // Toggle Branch Access for Current User in UI local state (Only sent to backend on Save Assignments click)
  const toggleBranch = (branchId) => {
    if (!currentUserId) return;
    setAssignedBranches(prev => {
      const current = prev[currentUserId] || [];
      const exists = current.includes(branchId);
      const updated = exists
        ? current.filter(id => id !== branchId)
        : [...current, branchId];
      return { ...prev, [currentUserId]: updated };
    });
  };

  const setAsPrimary = (branchId) => {
    if (!currentUserId) return;
    if (currentUserBranches.includes(branchId)) {
      setPrimaryBranch(prev => ({ ...prev, [currentUserId]: branchId }));
      toast.success('Primary branch updated');
    }
  };

  // Bulk Grant or Revoke All Branches for current user in UI local state
  const toggleAll = () => {
    if (!currentUserId) return;
    const isAllSelected = currentUserBranches.length === branches.length;
    setAssignedBranches(prev => ({
      ...prev,
      [currentUserId]: isAllSelected ? [] : branches.map(b => b.id)
    }));
  };

  // Save Assignments Button Handler: Executes POST /branches/:branchId/assign-user/ and remove-user/ APIs
  const handleSaveAssignments = async () => {
    if (!selectedUser) return;
    const userId = selectedUser.id;
    const currentAssignedIds = assignedBranches[userId] || [];
    const origAssignedIds = originalAssigned[userId] || [];

    const toAdd = currentAssignedIds.filter(id => !origAssignedIds.includes(id));
    const toRemove = origAssignedIds.filter(id => !currentAssignedIds.includes(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      toast.info(`No changes in branch assignments for ${selectedUser.name}.`);
      return;
    }

    setSaving(true);
    try {
      // 1. Process assignments: POST /api/branches/{branch_id}/assign-user/ { "user_id": userId }
      for (const bId of toAdd) {
        const targetBranch = branches.find(b => b.id === bId);
        const res = await assignUserToBranch(bId, userId);
        const successMsg = res?.message 
          ? `${res.message}${res.user ? ` (${res.user} - ${res.branch})` : ''}`
          : `User assigned to ${targetBranch?.name || 'branch'} successfully.`;
        toast.success(successMsg);
      }

      // 2. Process removals: POST /api/branches/{branch_id}/remove-user/ { "user_id": userId }
      for (const bId of toRemove) {
        const targetBranch = branches.find(b => b.id === bId);
        const res = await removeUserFromBranch(bId, userId);
        const successMsg = res?.message 
          ? `${res.message}${res.user ? ` (${res.user} - ${res.branch})` : ''}`
          : `User removed from ${targetBranch?.name || 'branch'} successfully.`;
        toast.success(successMsg);
      }

      // Update original snapshot reference to current state
      setOriginalAssigned(prev => ({ ...prev, [userId]: [...currentAssignedIds] }));

      // Update branches array state
      setBranches(prev =>
        prev.map(b => {
          let updatedUsers = [...(b.users || [])];
          if (toAdd.includes(b.id)) {
            updatedUsers = [...new Set([...updatedUsers, userId])];
          }
          if (toRemove.includes(b.id)) {
            updatedUsers = updatedUsers.filter(uId => uId !== userId);
          }
          return { ...b, users: updatedUsers, user_count: updatedUsers.length };
        })
      );

    } catch (err) {
      console.error('Error saving branch assignments:', err);
      const apiErrMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to save branch assignments';
      toast.error(apiErrMsg);
    } finally {
      setSaving(false);
    }
  };

  const isAllSelected = branches.length > 0 && currentUserBranches.length === branches.length;

  if (loading) {
    return <UserBranchAccessSkeleton />;
  }

  return (
    <div className="space-y-4 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-tight">User Branch Access</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Assign users to specific physical locations to isolate data access</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={loadData}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium shadow-2xs cursor-pointer"
            title="Refresh Users & Branches"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={handleSaveAssignments}
            disabled={saving}
            className="px-4 py-2 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs sm:text-sm disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Syncing...' : 'Save Assignments'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-180px)] min-h-[550px]">
        {/* Left Column: Users List */}
        <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl shadow-xs border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 mb-2.5 text-sm">Select User</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-300 transition-all text-xs font-medium"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredUsers.map(user => {
              const userAssignedCount = (assignedBranches[user.id] || []).length;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                    selectedUser?.id === user.id 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    selectedUser?.id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'
                  }`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-bold truncate ${selectedUser?.id === user.id ? 'text-blue-900' : 'text-gray-900'}`}>{user.name}</p>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[11px] text-gray-500 truncate">{user.role}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                        {userAssignedCount} B
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Branch Access Matrix */}
        {selectedUser ? (
          <div className="flex-1 bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {selectedUser.avatar}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <User size={13} /> {selectedUser.role}
                      <span className="text-gray-300">|</span>
                      <MapPin size={13} /> {currentUserBranches.length} Branches Assigned
                      <span className="text-gray-300">|</span>
                      <span className="text-xs font-mono text-gray-400">User ID: #{selectedUser.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={toggleAll}
                    disabled={saving}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                      isAllSelected ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {isAllSelected ? 'Revoke All Access' : 'Grant All Access'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Branch Access Matrix</h3>
                  <p className="text-xs text-gray-500">Select branches to grant access, then click Save Assignments to sync changes</p>
                </div>
              </div>

              <div className="grid gap-4">
                {branches.map(branch => {
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
                            onChange={() => toggleBranch(branch.id)}
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
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-900">{branch.name}</h4>
                              <span className="text-[10px] font-mono text-gray-400 font-bold">Branch ID: #{branch.id}</span>
                            </div>
                            <p className="text-xs text-gray-500">Code: {branch.code || branch.name} &bull; {branch.location || 'Active Branch'}</p>
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
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer'
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
        ) : (
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-medium">
            Select a user to manage branch access
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBranchAccess;

