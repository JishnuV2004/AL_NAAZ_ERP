import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit3, Shield, MapPin, Mail, Phone, Calendar, Clock, 
  CheckCircle2, XCircle, AlertCircle, Building2, Key, Activity, UserCheck, UserX
} from 'lucide-react';
import { mockUsers } from './mockUsersData';
import toast from 'react-hot-toast';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = mockUsers.find((u) => u.id === parseInt(id, 10)) || mockUsers[0];
  const [userStatus, setUserStatus] = useState(user.status);
  const [activeTab, setActiveTab] = useState('overview');

  const handleStatusToggle = () => {
    const newStatus = userStatus === 'Active' ? 'Suspended' : 'Active';
    setUserStatus(newStatus);
    toast.success(`User status changed to ${newStatus}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              userStatus === 'Active'
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
          >
            {userStatus === 'Active' ? (
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
            onClick={() => navigate(`/administration/users/${user.id}/edit`)}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-bold shrink-0 shadow-md">
            {user.avatar}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                userStatus === 'Active' ? 'bg-green-100 text-green-700' :
                userStatus === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {userStatus}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
              <span>{user.email}</span>
              <span className="text-gray-300">•</span>
              <span className="font-semibold text-gray-700">{user.role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="text-xs text-gray-400 font-medium block uppercase tracking-wider">Primary Branch</span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <Building2 size={15} className="text-gray-500" /> {user.branch}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium block uppercase tracking-wider">Last Activity</span>
            <span className="text-sm font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <Clock size={15} className="text-gray-500" /> {user.lastLogin}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview & Info
        </button>
        <button
          onClick={() => setActiveTab('branches')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'branches'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Branch Access ({user.assignedBranches?.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact & Detail Information */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">User Information</h3>
            
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
                <p className="text-sm font-medium text-gray-900">{user.phone || '+91 98765 43210'}</p>
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
                <p className="text-sm font-medium text-gray-900">{user.createdAt || '2025-01-10'}</p>
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
    </div>
  );
};

export default UserDetails;
