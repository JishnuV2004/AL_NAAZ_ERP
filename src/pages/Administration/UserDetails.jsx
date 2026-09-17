import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Shield, MapPin, Mail, Phone, Calendar, Clock, 
  Building2, Key, Activity, UserCheck, UserX, Loader2
} from 'lucide-react';
import { getUserById, toggleUserStatus } from '../../api/users.api';
import toast from 'react-hot-toast';
import EditUserModal from '../../components/modals/EditUserModal';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadUserData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const uData = await getUserById(id);
      setUser(uData);
    } catch (err) {
      console.error('Failed to load user details:', err);
      toast.error('Failed to load user profile');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [id]);

  const handleStatusToggle = async () => {
    if (!user) return;
    try {
      await toggleUserStatus(user.id, user.is_active);
      const nextActive = !user.is_active;
      const nextStatus = nextActive ? 'Active' : 'Suspended';
      setUser(prev => ({ ...prev, is_active: nextActive, status: nextStatus }));
      toast.success(`User status changed to ${nextStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 font-sans w-full animate-pulse">
        {/* Back button & Action Bar Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-gray-200 rounded-xl"></div>
            <div className="h-9 w-28 bg-gray-200 rounded-xl"></div>
          </div>
        </div>

        {/* Header Profile Card Skeleton */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0"></div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-6 w-44 bg-gray-200 rounded-md"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-60 bg-gray-100 rounded-md"></div>
            </div>
          </div>

          <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
            <div className="space-y-1">
              <div className="h-3 w-24 bg-gray-100 rounded-md"></div>
              <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
            </div>
            <div className="space-y-1">
              <div className="h-3 w-24 bg-gray-100 rounded-md"></div>
              <div className="h-5 w-36 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex border-b border-gray-200 gap-6 pb-2.5">
          <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
          <div className="h-5 w-36 bg-gray-100 rounded-md"></div>
          <div className="h-5 w-28 bg-gray-100 rounded-md"></div>
        </div>

        {/* Overview Tab Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded-md mb-4"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-24 bg-gray-100 rounded-md"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded-md mb-6"></div>
            
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full bg-gray-100 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4 font-sans w-full text-center py-16">
        <h2 className="text-2xl font-bold text-gray-800">User Not Found</h2>
        <p className="text-gray-500 text-sm">The requested user account does not exist.</p>
        <button
          onClick={() => navigate('/administration/users')}
          className="px-4 py-2 bg-gray-900 text-white rounded-xl font-medium text-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans w-full">
      {/* Back button & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => navigate('/administration/users')}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Back to Users
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleStatusToggle}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 border ${
              user.is_active
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            {user.is_active ? (
              <>
                <UserX size={16} /> Suspend User
              </>
            ) : (
              <>
                <UserCheck size={16} /> Activate User
              </>
            )}
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-xs">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.is_active ? 'Active' : 'Suspended'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-3">
              <span>{user.email}</span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold text-gray-700">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider">Primary Branch</span>
            <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <Building2 size={14} className="text-gray-500" /> {user.branch}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-gray-400 font-medium block uppercase tracking-wider">Last Activity</span>
            <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <Clock size={14} className="text-gray-500" /> {user.lastLogin}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Info
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'branches'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Branch Access ({user.assignedBranches?.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'activity'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Security & Logs
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact & Detail Information */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-xs space-y-3.5">
            <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2.5">User Information</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Email Address</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Phone Number</p>
                <p className="text-sm font-medium text-gray-900">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">System Role</p>
                <p className="text-sm font-medium text-gray-900">{user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Account Created</p>
                <p className="text-sm font-medium text-gray-900">{user.createdAt}</p>
              </div>
            </div>
          </div>

          {/* Quick Management Links */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Administration Controls</h3>
              <p className="text-sm text-gray-500 mb-6">Manage user roles, branch locations, and system permissions matrix.</p>
              
              <div className="space-y-3">
                <Link
                  to="/administration/userbranchaccess"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={18} className="text-gray-700" />
                    <span className="text-sm font-semibold text-gray-900">Configure Branch Access</span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold">Manage &rarr;</span>
                </Link>

                <Link
                  to="/administration/permissions"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-gray-700" />
                    <span className="text-sm font-semibold text-gray-900">View Role Permissions Matrix</span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold">Matrix &rarr;</span>
                </Link>

                <Link
                  to="/administration/roles"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gray-900 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-gray-700" />
                    <span className="text-sm font-semibold text-gray-900">Manage Role Definitions</span>
                  </div>
                  <span className="text-xs text-blue-600 font-bold">Roles &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Assigned Branch Locations</h3>
              <p className="text-xs text-gray-500">Branches that this user has authorization to access and view data for.</p>
            </div>
            <Link
              to="/administration/userbranchaccess"
              className="px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Modify Access
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {(user.assignedBranches || [user.branch]).map((bName, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{bName}</h4>
                    <p className="text-xs text-gray-500">{bName === user.branch ? 'Primary Branch' : 'Secondary Branch'}</p>
                  </div>
                </div>
                {bName === user.branch && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold text-[10px] rounded-full uppercase">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Recent Security Activity</h3>
          
          <div className="divide-y divide-gray-100">
            {(user.activityLogs || []).map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-400">IP: {log.ip}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 font-medium">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Popup Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        userId={id}
        onUserUpdated={() => loadUserData(true)}
      />
    </div>
  );
};

export default UserDetails;
