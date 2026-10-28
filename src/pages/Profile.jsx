import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Shield, Lock, Key, Eye, EyeOff, 
  Building2, Calendar, CheckCircle2, AlertCircle, Save, 
  LogOut, Loader2, Check, RefreshCw, Edit3, X, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Skeleton Loader Component for Profile Content (Banner & Form Grid only - not the top header area)
const ProfileContentSkeleton = () => {
  return (
    <div className="space-y-6 font-sans w-full animate-pulse">
      {/* 1. Top Banner Card Skeleton */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
        <div className="h-28 bg-slate-200 relative px-6 flex items-end">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
            <div className="h-6 w-20 bg-slate-300 rounded-full"></div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-22 h-22 rounded-2xl bg-white p-1 shadow-md border border-gray-100 shrink-0">
                <div className="w-full h-full rounded-xl bg-gray-300"></div>
              </div>

              <div className="pb-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-40 bg-gray-300 rounded-md"></div>
                  <div className="h-4 w-12 bg-gray-200 rounded-md"></div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-4 w-44 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-md"></div>
                  <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right pb-1 space-y-2">
              <div className="h-3 w-32 bg-gray-200 rounded-md sm:ml-auto"></div>
              <div className="flex items-center sm:justify-end gap-2">
                <div className="h-6 w-36 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-200"></div>
              <div className="space-y-1.5">
                <div className="h-5 w-44 bg-gray-300 rounded-md"></div>
                <div className="h-3 w-64 bg-gray-100 rounded-md"></div>
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-xl"></div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-28 bg-gray-200 rounded-md"></div>
                <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-10 w-full bg-gray-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-200"></div>
              <div className="space-y-1.5">
                <div className="h-5 w-40 bg-gray-300 rounded-md"></div>
                <div className="h-3 w-56 bg-gray-100 rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-28 w-full bg-gray-100 rounded-2xl"></div>
            <div className="h-10 w-full bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  // Profile data state - starts null, only populated when response arrives
  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Edit Mode States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'profile' | 'password'
    title: '',
    message: '',
    confirmText: '',
    isDestructive: false
  });

  // Fetch current user profile strictly from GET /users/profile/
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setFetchError(null);
    try {
      const data = await authService.getProfile();
      if (data) {
        const normalized = {
          id: data.id,
          username: data.username || '',
          email: data.email || '',
          phone: data.phone !== undefined ? data.phone : '',
          role: data.role || '',
          branches: Array.isArray(data.branches) ? data.branches : [],
          is_active: data.is_active !== undefined ? data.is_active : true,
          created_at: data.created_at || ''
        };
        setProfile(normalized);
        setOriginalProfile(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch profile API:', err);
      setFetchError(err.message || 'Unable to connect to profile service');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle profile form input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Start Profile Editing
  const handleStartEditProfile = () => {
    setOriginalProfile({ ...profile });
    setIsEditingProfile(true);
  };

  // Cancel Profile Editing (revert changes)
  const handleCancelEditProfile = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
    setIsEditingProfile(false);
  };

  // Trigger Profile Update Confirmation Modal
  const handleProfileFormSubmit = (e) => {
    e.preventDefault();
    if (!profile) return;

    if (!profile.username?.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    if (!profile.email?.trim()) {
      toast.error('Email cannot be empty');
      return;
    }

    setConfirmModal({
      isOpen: true,
      type: 'profile',
      title: 'Confirm Profile Update',
      message: 'Are you sure you want to update your profile details? This will update your personal information.',
      confirmText: 'Yes, Save Changes',
      isDestructive: false
    });
  };

  // Actual execution after confirmation popup for Profile update
  const executeProfileUpdate = async () => {
    setUpdatingProfile(true);
    try {
      const updated = await authService.updateProfile({
        username: profile.username,
        email: profile.email,
        phone: profile.phone
      });
      if (updated) {
        const next = {
          ...profile,
          username: updated.username !== undefined ? updated.username : profile.username,
          email: updated.email !== undefined ? updated.email : profile.email,
          phone: updated.phone !== undefined ? updated.phone : profile.phone,
          role: updated.role !== undefined ? updated.role : profile.role,
          branches: updated.branches !== undefined ? updated.branches : profile.branches,
          is_active: updated.is_active !== undefined ? updated.is_active : profile.is_active,
          created_at: updated.created_at !== undefined ? updated.created_at : profile.created_at
        };
        setProfile(next);
        setOriginalProfile(next);
      }
      setIsEditingProfile(false);
      setConfirmModal({ isOpen: false, type: null });
      toast.success('Profile details saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Start Password Editing
  const handleStartEditPassword = () => {
    setIsEditingPassword(true);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordErrors({});
    setPasswordSuccessMsg('');
  };

  // Cancel Password Editing
  const handleCancelEditPassword = () => {
    setIsEditingPassword(false);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setPasswordErrors({});
  };

  // Password validation
  const validatePasswordForm = () => {
    const errs = {};
    if (!passwordForm.current_password) {
      errs.current_password = 'Current password is required';
    }
    if (!passwordForm.new_password) {
      errs.new_password = 'New password is required';
    } else if (passwordForm.new_password.length < 8) {
      errs.new_password = 'Password must be at least 8 characters long';
    } else if (passwordForm.new_password === passwordForm.current_password) {
      errs.new_password = 'New password cannot be the same as current password';
    }

    if (!passwordForm.confirm_password) {
      errs.confirm_password = 'Confirm password is required';
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      errs.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Trigger Password Confirmation Modal
  const handlePasswordFormSubmit = (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setConfirmModal({
      isOpen: true,
      type: 'password',
      title: 'Confirm Password Change',
      message: 'Are you sure you want to change your password? For security, you will be signed out and required to log in again with your new password.',
      confirmText: 'Confirm & Change Password',
      isDestructive: true
    });
  };

  // Actual execution after confirmation popup for Password change
  const executePasswordChange = async () => {
    setChangingPassword(true);
    setPasswordSuccessMsg('');
    try {
      const response = await authService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });

      const successText = response?.message || 'Password changed successfully. Please log in again.';
      setPasswordSuccessMsg(successText);
      setConfirmModal({ isOpen: false, type: null });
      toast.success(successText, { duration: 5000 });

      // Clear password inputs
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordErrors({});
      setIsEditingPassword(false);

      // Redirect to login after 2.5 seconds so user can read message
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2500);
    } catch (err) {
      setConfirmModal({ isOpen: false, type: null });
      const msg = err.message || 'Failed to change password';
      if (msg.toLowerCase().includes('current')) {
        setPasswordErrors((prev) => ({ ...prev, current_password: msg }));
      } else if (msg.toLowerCase().includes('new') || msg.toLowerCase().includes('characters')) {
        setPasswordErrors((prev) => ({ ...prev, new_password: msg }));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  // Role badge colour mapping
  const getRoleBadge = (role) => {
    const r = (role || '').toUpperCase();
    if (r.includes('ADMIN')) {
      return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    if (r.includes('MANAGER')) {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  // Helper date formatter for real created_at date
  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : '';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans max-w-6xl mx-auto">
      
      {/* 1. Header & Breadcrumb - Static, always visible immediately without skeleton */}
      <div>
        <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
          <span>Home</span> &gt; <span className="text-gray-700">User Profile</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Manage your personal account details, contact information, and security credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-gray-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* 2. Dynamic Content Area */}
      {loadingProfile ? (
        <ProfileContentSkeleton />
      ) : fetchError && !profile ? (
        <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-gray-200 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Failed to Load Profile</h3>
            <p className="text-xs text-gray-500 mt-1">{fetchError}</p>
          </div>
          <button
            type="button"
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw size={14} /> Retry Loading Profile
          </button>
        </div>
      ) : (
        <>
          {/* Top Banner Card (Real Data Only) */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
            {/* Banner Decorative Header */}
            <div className="h-28 bg-gradient-to-r from-slate-900 via-[#1E2336] to-slate-800 relative px-6 flex items-end">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {profile.role && (
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleBadge(profile.role)}`}>
                    {profile.role}
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {profile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Profile Info Row */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-10">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  {/* Avatar Circle */}
                  <div className="w-22 h-22 rounded-2xl bg-white p-1 shadow-md border border-gray-100 shrink-0">
                    <div className="w-full h-full rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center uppercase shadow-inner">
                      {(profile.username || 'U').charAt(0)}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="pb-1">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {profile.username}
                      {profile.id && (
                        <span className="text-xs font-normal text-gray-400 font-mono">#{profile.id}</span>
                      )}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                      {profile.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={13} className="text-gray-400" /> {profile.email}
                        </span>
                      )}
                      {profile.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={13} className="text-gray-400" /> {profile.phone}
                        </span>
                      ) : null}
                      {formattedDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" /> Member since {formattedDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Branch Access preview */}
                <div className="text-left sm:text-right pb-1">
                  <span className="text-[11px] font-bold uppercase text-gray-400 block tracking-wider mb-1">
                    Branch Access
                  </span>
                  <div className="flex items-center sm:justify-end gap-1.5 flex-wrap">
                    {profile.branches && profile.branches.length > 0 ? (
                      profile.branches.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Building2 size={12} /> {typeof b === 'object' ? b.name : b}
                        </span>
                      ))
                    ) : (
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <Building2 size={12} /> None Assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Profile Settings & Change Password */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (7 Cols): Account Information Form */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {isEditingProfile 
                        ? 'Edit your username and contact details below.' 
                        : 'Your personal and account contact information.'}
                    </p>
                  </div>
                </div>

                {/* Edit / Cancel Toggle Button */}
                {!isEditingProfile ? (
                  <button
                    type="button"
                    onClick={handleStartEditProfile}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit Profile
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEditProfile}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileFormSubmit} className="space-y-4">
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={profile.username}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      required
                      placeholder="Enter username"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isEditingProfile 
                          ? 'bg-white border border-blue-300 ring-2 ring-blue-500/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' 
                          : 'bg-gray-50/80 border border-gray-200 text-gray-700 cursor-not-allowed select-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Address Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      required
                      placeholder="name@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isEditingProfile 
                          ? 'bg-white border border-blue-300 ring-2 ring-blue-500/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' 
                          : 'bg-gray-50/80 border border-gray-200 text-gray-700 cursor-not-allowed select-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone Number Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditingProfile}
                      placeholder={isEditingProfile ? "e.g. 9876543210" : "Not specified"}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isEditingProfile 
                          ? 'bg-white border border-blue-300 ring-2 ring-blue-500/10 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500' 
                          : 'bg-gray-50/80 border border-gray-200 text-gray-700 cursor-not-allowed select-none'
                      }`}
                    />
                  </div>
                </div>

                {/* Read-only System Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      System Role
                    </label>
                    <div className="px-3.5 py-2.5 bg-gray-100/70 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-2">
                      <Shield size={15} className="text-gray-500" />
                      <span>{profile.role || 'N/A'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Account Status
                    </label>
                    <div className="px-3.5 py-2.5 bg-gray-100/70 border border-gray-200 rounded-xl text-xs font-bold text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span>{profile.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Save & Cancel Buttons - ONLY shown when isEditingProfile is true */}
                {isEditingProfile && (
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3 animate-in fade-in duration-200">
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {updatingProfile ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column (5 Cols): Change Password Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200/90 shadow-xs p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <Lock size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Change Password</h3>
                    <p className="text-xs text-gray-500 font-medium">Update your account login password.</p>
                  </div>
                </div>

                {/* Edit Password Toggle Button */}
                {!isEditingPassword ? (
                  <button
                    type="button"
                    onClick={handleStartEditPassword}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Key size={14} /> Change Password
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCancelEditPassword}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <X size={14} /> Cancel
                  </button>
                )}
              </div>

              {/* Success Banner if changed */}
              {passwordSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-emerald-900">Success!</p>
                    <p className="mt-0.5">{passwordSuccessMsg}</p>
                    <p className="text-[11px] text-emerald-700 mt-1">Redirecting to login page in a few seconds...</p>
                  </div>
                </div>
              )}

              {/* When NOT in editing mode: Security summary card */}
              {!isEditingPassword ? (
                <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/70 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                        Password Protected
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Your account password is encrypted and secured. Click the button below to update your login password.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartEditPassword}
                    className="w-full py-2.5 bg-white hover:bg-gray-100 border border-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Key size={15} /> Change Account Password
                  </button>
                </div>
              ) : (
                /* When in editing mode: Password inputs form */
                <form onSubmit={handlePasswordFormSubmit} className="space-y-4 animate-in fade-in duration-200">
                  {/* Current Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Key size={16} />
                      </div>
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="current_password"
                        value={passwordForm.current_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, current_password: e.target.value });
                          if (passwordErrors.current_password) {
                            setPasswordErrors({ ...passwordErrors, current_password: null });
                          }
                        }}
                        required
                        placeholder="Enter current password"
                        className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                          passwordErrors.current_password
                            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30'
                            : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.current_password && (
                      <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {passwordErrors.current_password}
                      </p>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="new_password"
                        value={passwordForm.new_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, new_password: e.target.value });
                          if (passwordErrors.new_password) {
                            setPasswordErrors({ ...passwordErrors, new_password: null });
                          }
                        }}
                        required
                        placeholder="Enter new password (min. 8 chars)"
                        className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                          passwordErrors.new_password
                            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30'
                            : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {passwordErrors.new_password}
                      </p>
                    )}
                  </div>

                  {/* Confirm New Password Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock size={16} />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirm_password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => {
                          setPasswordForm({ ...passwordForm, confirm_password: e.target.value });
                          if (passwordErrors.confirm_password) {
                            setPasswordErrors({ ...passwordErrors, confirm_password: null });
                          }
                        }}
                        required
                        placeholder="Re-enter new password"
                        className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${
                          passwordErrors.confirm_password
                            ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/30'
                            : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordErrors.confirm_password && (
                      <p className="text-xs text-rose-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {passwordErrors.confirm_password}
                      </p>
                    )}
                  </div>

                  {/* Password Requirement Guidelines */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Security Requirements:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          passwordForm.new_password.length >= 8 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Check size={10} />
                        </span>
                        <span>Minimum 8 characters length</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                          passwordForm.new_password && passwordForm.new_password === passwordForm.confirm_password 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Check size={10} />
                        </span>
                        <span>Both new passwords must match exactly</span>
                      </li>
                    </ul>
                  </div>

                  {/* Password Change Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleCancelEditPassword}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {changingPassword ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Updating...
                        </>
                      ) : (
                        <>
                          <Key size={16} /> Update Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </>
      )}

      {/* Universal Action Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div 
            className="fixed inset-0" 
            onClick={() => !updatingProfile && !changingPassword && setConfirmModal({ isOpen: false, type: null })}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                confirmModal.isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {confirmModal.isDestructive ? <Lock size={24} /> : <AlertCircle size={24} />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                disabled={updatingProfile || changingPassword}
                onClick={() => setConfirmModal({ isOpen: false, type: null })}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingProfile || changingPassword}
                onClick={() => {
                  if (confirmModal.type === 'profile') {
                    executeProfileUpdate();
                  } else if (confirmModal.type === 'password') {
                    executePasswordChange();
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                  confirmModal.isDestructive 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {(updatingProfile || changingPassword) ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Check size={15} /> {confirmModal.confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
