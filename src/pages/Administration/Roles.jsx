import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Users as UsersIcon, Plus, RefreshCw, Search,
  CheckCircle2, XCircle, Building2, Mail, Phone, Calendar, 
  ArrowUpRight, UserCheck, ShieldAlert, ChevronRight, UserPlus
} from 'lucide-react';
import { 
  IoChevronBackOutline, 
  IoChevronForwardOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { getUsers } from '../../api/users.api';
import AddUserModal from '../../components/modals/AddUserModal';
import toast from 'react-hot-toast';

// Role configurations with tailored descriptions & theme styling
const ROLE_DEFINITIONS = {
  STAFF: {
    key: 'STAFF',
    name: 'Staff',
    code: 'STAFF',
    description: 'Standard operational permissions for store staff, kitchen workflows, attendance tracking, and POS activity.',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200/80',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100/70',
    iconColor: 'text-emerald-600',
    pillColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    activeBorder: 'border-emerald-300 ring-2 ring-emerald-100 shadow-xs bg-emerald-50/15'
  },
  MANAGER: {
    key: 'MANAGER',
    name: 'Manager',
    code: 'MANAGER',
    description: 'Administrative access for branch operations, employee assignments, sales ledger visibility, and approvals.',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200/80',
    textColor: 'text-amber-800',
    badgeBg: 'bg-amber-100/70',
    iconColor: 'text-amber-600',
    pillColor: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    activeBorder: 'border-amber-300 ring-2 ring-amber-100 shadow-xs bg-amber-50/15'
  },
  SUPERADMIN: {
    key: 'SUPERADMIN',
    name: 'Super Admin',
    code: 'SUPERADMIN',
    description: 'Full unconstrained platform authority across all modules, branch settings, financials, and security configs.',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-200/80',
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-100/70',
    iconColor: 'text-purple-600',
    pillColor: 'bg-purple-50 text-purple-700 border border-purple-200/80',
    activeBorder: 'border-purple-300 ring-2 ring-purple-100 shadow-xs bg-purple-50/15'
  }
};

const Roles = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Pagination for assigned users list
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch users from API: GET /api/users/users/
  const fetchUsers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users from API:', err);
      toast.error('Failed to load roles and user assignments');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Compute distinct roles present in API response or defined in system
  const roleGroups = useMemo(() => {
    const map = {};

    // Initialize with standard system roles
    Object.keys(ROLE_DEFINITIONS).forEach((roleKey) => {
      // Only keep STAFF and MANAGER as standard active templates
      if (roleKey === 'STAFF' || roleKey === 'MANAGER') {
        map[roleKey] = {
          ...ROLE_DEFINITIONS[roleKey],
          users: [],
          activeCount: 0
        };
      }
    });

    // Populate with real users from API
    users.forEach((u) => {
      const rawRole = (u.rawRole || u.role || 'STAFF').toUpperCase();
      if (!map[rawRole]) {
        map[rawRole] = {
          key: rawRole,
          name: rawRole === 'STAFF' ? 'Staff' : rawRole === 'MANAGER' ? 'Manager' : rawRole,
          code: rawRole,
          description: `Custom system role for ${rawRole} accounts.`,
          bgLight: 'bg-blue-50',
          borderLight: 'border-blue-200/80',
          textColor: 'text-blue-700',
          badgeBg: 'bg-blue-100/70',
          iconColor: 'text-blue-600',
          pillColor: 'bg-blue-50 text-blue-700 border border-blue-200/80',
          users: [],
          activeCount: 0
        };
      }
      map[rawRole].users.push(u);
      if (u.is_active !== false) {
        map[rawRole].activeCount += 1;
      }
    });

    return Object.values(map);
  }, [users]);

  // Filter users based on selected role tab and search query
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const rawRole = (u.rawRole || u.role || '').toUpperCase();
      const matchesRole = selectedRoleFilter === 'ALL' || rawRole === selectedRoleFilter;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRole;

      const nameMatch = (u.name || '').toLowerCase().includes(q);
      const usernameMatch = (u.username || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const phoneMatch = (u.phone || '').toLowerCase().includes(q);
      const roleMatch = rawRole.toLowerCase().includes(q);
      const branchMatch = Array.isArray(u.assignedBranches)
        ? u.assignedBranches.some((b) => String(b).toLowerCase().includes(q))
        : false;

      return matchesRole && (nameMatch || usernameMatch || emailMatch || phoneMatch || roleMatch || branchMatch);
    });
  }, [users, selectedRoleFilter, searchQuery]);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedRoleFilter, searchQuery]);

  // Pagination calculation
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems > 0 ? (page - 1) * pageSize : 0;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
  const endItem = Math.min(startIndex + pageSize, totalItems);
  const emptyRowsCount = loading ? 0 : Math.max(0, pageSize - paginatedUsers.length);

  return (
    <div className="space-y-6 font-sans w-full pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Administration</span> &gt; <span className="text-gray-700">Roles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Role Management & Access
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            System roles configured from active user access levels and branch assignments
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
            className="px-3.5 py-2 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-2xs text-xs cursor-pointer disabled:opacity-50"
            title="Refresh roles from API"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/administration/users')}
            className="px-3.5 py-2 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-2xs text-xs cursor-pointer"
          >
            <UsersIcon size={14} />
            Users Directory
          </button>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="px-4 py-2 rounded-xl font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-xs text-xs cursor-pointer"
          >
            <UserPlus size={15} />
            Invite User
          </button>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-xs animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-gray-200"></div>
                <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="w-32 h-5 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-100 rounded"></div>
                <div className="w-4/5 h-3 bg-gray-100 rounded"></div>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          roleGroups.map((role) => {
            const isSelected = selectedRoleFilter === role.key;

            return (
              <div
                key={role.key}
                onClick={() => setSelectedRoleFilter(isSelected ? 'ALL' : role.key)}
                className={`bg-white rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden relative group outline-none ${
                  isSelected
                    ? role.activeBorder || 'border-blue-300 ring-2 ring-blue-100 shadow-xs bg-blue-50/15'
                    : 'border-gray-200/90 shadow-xs hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="p-5 flex-1 flex flex-col">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${role.bgLight} ${role.iconColor} border ${role.borderLight}`}>
                      <Shield size={20} />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${role.pillColor}`}>
                      {role.code}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="mb-4">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                      <span>{role.name}</span>
                      <span className="text-xs font-medium text-gray-400 font-mono">
                        ({role.users.length})
                      </span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {/* Assigned Users Avatars Preview */}
                  <div className="mt-auto pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Assigned Users
                      </span>
                      <span className="text-xs font-bold text-gray-900">
                        {role.users.length} {role.users.length === 1 ? 'User' : 'Users'}
                      </span>
                    </div>

                    {role.users.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {role.users.slice(0, 4).map((u) => (
                          <div
                            key={u.id}
                            title={`${u.username || u.name} (${u.email})`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-[11px] text-gray-700 font-medium"
                          >
                            <span className="w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold flex items-center justify-center">
                              {(u.username || u.name || 'U').charAt(0).toUpperCase()}
                            </span>
                            <span className="max-w-[90px] truncate">{u.username || u.name}</span>
                          </div>
                        ))}
                        {role.users.length > 4 && (
                          <span className="text-[11px] font-bold text-gray-400 px-1.5">
                            +{role.users.length - 4} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No users currently assigned</p>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    {role.activeCount} Active / {role.users.length - role.activeCount} Inactive
                  </span>
                  <span className="font-semibold text-gray-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
                    <span>{isSelected ? 'Viewing Users' : 'Filter by Role'}</span>
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Users Assigned to Roles Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden min-h-[580px] flex flex-col justify-between w-full">
        <div>
          {/* Controls Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  selectedRoleFilter === 'ALL'
                    ? 'bg-gray-900 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                }`}
              >
                All Users ({users.length})
              </button>
              {roleGroups.map((role) => (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => setSelectedRoleFilter(role.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedRoleFilter === role.key
                      ? 'bg-gray-900 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                  }`}
                >
                  <span>{role.name}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    selectedRoleFilter === role.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {role.users.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search user by name, email, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-xs text-gray-900 font-medium outline-none focus:ring-1 focus:ring-gray-900 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[480px] w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200/90 text-[11px] font-bold text-gray-500 uppercase tracking-wider h-[46px]">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5 text-center">Assigned Role</th>
                  <th className="px-5 py-3.5">Email & Contact</th>
                  <th className="px-5 py-3.5">Assigned Branches</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Created Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, idx) => (
                    <tr key={`skeleton-${idx}`} className="animate-pulse h-[48px]">
                      <td className="px-5 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-200"></div>
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-16 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <div className="h-5.5 w-20 bg-gray-200 rounded-full mx-auto"></div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="h-3.5 w-36 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-5 py-2.5">
                        <div className="h-4 w-28 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <div className="h-5 w-16 bg-gray-200 rounded-full mx-auto"></div>
                      </td>
                      <td className="px-5 py-2.5 hidden md:table-cell">
                        <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="h-7 w-14 bg-gray-200 rounded-lg ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedUsers.length > 0 ? (
                  <>
                    {paginatedUsers.map((user) => {
                      const rawRole = (user.rawRole || user.role || 'STAFF').toUpperCase();
                      const roleConfig = ROLE_DEFINITIONS[rawRole] || {
                        name: user.role || rawRole,
                        pillColor: 'bg-gray-100 text-gray-700 border border-gray-200'
                      };

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/70 transition-colors group h-[48px]"
                        >
                          {/* User info */}
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gray-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block text-xs">
                                  {user.username || user.name}
                                </span>
                                <span className="text-[11px] text-gray-400 font-mono">
                                  ID: #{user.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-5 py-2.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${roleConfig.pillColor}`}>
                              <Shield size={12} />
                              <span>{rawRole}</span>
                            </span>
                          </td>

                          {/* Email & Phone */}
                          <td className="px-5 py-2.5">
                            <div className="space-y-0.5">
                              <div className="text-gray-800 font-medium text-xs flex items-center gap-1.5">
                                <Mail size={12} className="text-gray-400" />
                                <span className="truncate max-w-[200px]">{user.email}</span>
                              </div>
                              {user.phone && user.phone !== 'N/A' && (
                                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 font-mono">
                                  <Phone size={11} className="text-gray-400" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Assigned Branches */}
                          <td className="px-5 py-2.5">
                            {user.branches && user.branches.length > 0 ? (
                              <div className="flex items-center gap-1 flex-wrap">
                                {user.branches.map((b, bIdx) => {
                                  const bName = typeof b === 'object' ? b.name : b;
                                  const bCode = typeof b === 'object' && b.code ? b.code : null;
                                  return (
                                    <span
                                      key={bIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-200/60"
                                    >
                                      <Building2 size={11} />
                                      <span>{bName}</span>
                                      {bCode && <span className="font-mono text-[10px] text-blue-500 font-bold">({bCode})</span>}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px] italic">
                                No branch assigned
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-2.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              user.is_active
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                              <span>{user.is_active ? 'Active' : 'Inactive'}</span>
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="px-5 py-2.5 text-gray-600 hidden md:table-cell font-mono text-[11px]">
                            {user.raw?.created_at
                              ? new Date(user.raw.created_at).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : user.createdAt || '—'}
                          </td>

                          {/* Action */}
                          <td className="px-5 py-2.5 text-right">
                            <Link
                              to={`/administration/users/${user.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-700 text-xs font-semibold transition-all cursor-pointer"
                            >
                              <span>View</span>
                              <ArrowUpRight size={12} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {/* Empty placeholder rows to maintain 10-row size */}
                    {emptyRowsCount > 0 &&
                      Array.from({ length: emptyRowsCount }).map((_, idx) => (
                        <tr key={`empty-${idx}`} className="h-[48px] border-b border-gray-100/40">
                          <td colSpan={7} className="px-5 py-2.5 text-transparent select-none">
                            &nbsp;
                          </td>
                        </tr>
                      ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan={7} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
                          <ShieldAlert size={24} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">No users found</h4>
                        <p className="text-xs text-gray-500 max-w-sm mb-4">
                          {searchQuery || selectedRoleFilter !== 'ALL'
                            ? 'No users match your role filter or search criteria.'
                            : 'No user accounts recorded under this system role.'}
                        </p>
                        {(searchQuery || selectedRoleFilter !== 'ALL') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoleFilter('ALL');
                              setSearchQuery('');
                            }}
                            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Standard Project Pagination Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium mt-auto">
            <div>
              Showing <span className="font-bold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className="font-bold text-gray-800">{endItem}</span> of{' '}
              <span className="font-bold text-gray-800">{totalItems}</span> users
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Previous Page"
              >
                <IoChevronBackOutline size={14} />
              </button>

              {totalPages <= 7 ? (
                Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      disabled={loading}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-xs font-bold'
                          : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              ) : (
                (() => {
                  let pages = [];
                  if (page <= 4) {
                    pages = [1, 2, 3, 4, 5, '...', totalPages];
                  } else if (page >= totalPages - 3) {
                    pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
                  }
                  return pages.map((pageItem, idx) => {
                    if (pageItem === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={pageItem}
                        type="button"
                        disabled={loading}
                        onClick={() => setPage(pageItem)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          page === pageItem
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageItem}
                      </button>
                    );
                  });
                })()
              )}

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Next Page"
              >
                <IoChevronForwardOutline size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      <AddUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onUserCreated={() => fetchUsers(true)}
      />
    </div>
  );
};

export default Roles;

