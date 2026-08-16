import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { authService } from '../../services/authService';
import { 
  IoBasketOutline, 
  IoReceiptOutline, 
  IoCalendarOutline, 
  IoCashOutline, 
  IoWalletOutline,
  IoNotificationsOutline,
  IoLogOutOutline 
} from 'react-icons/io5';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchStats = useNotificationStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, []);

  const isAdmin = (user?.role || '').toUpperCase() !== 'STAFF';

  const baseMenuItems = [
    { name: 'Inventory', path: '/inventory', icon: IoBasketOutline },
    { name: 'Finance', path: '/finance', icon: IoReceiptOutline },
    { name: 'Attendance', path: '/attendance', icon: IoCalendarOutline },
    { name: 'Salary', path: '/salary', icon: IoCashOutline },
    { name: 'Advance', path: '/advance', icon: IoWalletOutline },
  ];

  // Admin-only Notifications module
  const menuItems = isAdmin
    ? [
        ...baseMenuItems,
        {
          name: 'Notifications',
          path: '/notifications',
          icon: IoNotificationsOutline,
          unread: unreadCount
        }
      ]
    : baseMenuItems;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await authService.logout();
  };

  return (
    <aside className="group sticky top-0 h-screen shrink-0 z-50 flex w-20 hover:w-72 flex-col justify-between bg-brand-brown py-8 text-white shadow-xl transition-all duration-300 overflow-hidden">
      {/* Upper Section */}
      <div className="flex flex-col px-4 group-hover:px-6 transition-all duration-300">
        {/* Logo Container */}
        <div className="flex flex-col items-center border-b border-brand-border/10 pb-8 text-center min-h-[140px] justify-center relative">
          
          {/* Collapsed Icon */}
          <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-0 pointer-events-none">
            <span className="font-serif text-2xl font-bold tracking-widest text-brand-gold uppercase">A</span>
          </div>

          {/* Expanded Logo */}
          <div className="flex flex-col items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 whitespace-nowrap absolute top-0">
            <img 
              src="/logo/al-naaz-mandi-logo-transparent.png" 
              alt="Al Naaz Mandi Logo" 
              className="h-20 w-auto object-contain mb-2 drop-shadow-md"
            />
            <h1 className="font-serif text-lg font-bold tracking-widest text-brand-gold uppercase">
              Al Naaz Mandi
            </h1>
            <span className="text-[9px] tracking-[0.25em] text-brand-gold/60 uppercase">
              Foodie Paradise
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 flex flex-col space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center space-x-4 rounded-xl p-3 font-sans text-sm font-semibold tracking-wide border transition-all duration-200 ${
                    isActive
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold shadow-xs'
                      : 'border-transparent text-brand-text-muted hover:bg-white/5 hover:text-white'
                  }`
                }
                title={item.name}
              >
                <div className="relative shrink-0">
                  <Icon className="h-6 w-6" />
                  {/* Collapsed dot badge */}
                  {item.unread > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-brand-gold group-hover:hidden ring-2 ring-brand-brown" />
                  )}
                </div>
                <div className="flex items-center justify-between flex-1 whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100 overflow-hidden w-0 group-hover:w-auto">
                  <span>{item.name}</span>
                  {item.unread > 0 && (
                    <span className="ml-2 rounded-full bg-brand-gold px-2 py-0.5 font-sans text-[10px] font-extrabold text-brand-brown">
                      {item.unread > 99 ? '99+' : item.unread}
                    </span>
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Info */}
      <div className="flex flex-col border-t border-brand-border/10 pt-6 px-4 group-hover:px-6 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Avatar Circle */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-brown font-bold text-lg select-none" title="Profile">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            
            <div className="flex flex-col whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100 overflow-hidden w-0 group-hover:w-auto">
              <span className="text-sm font-bold text-white tracking-wide truncate max-w-[120px]">
                {user?.name || 'Admin'}
              </span>
              <span className="text-[11px] text-brand-text-muted font-medium truncate max-w-[120px]">
                {user?.role || 'Hotel Manager'}
              </span>
            </div>
          </div>

          {/* Logout Trigger */}
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Log Out"
            className="rounded-lg p-2 text-brand-text-muted hover:bg-white/5 hover:text-red-400 transition-all duration-300 opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
          >
            <IoLogOutOutline className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-cream border border-brand-border/40 p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-4 animate-fade-in-up">
            <h3 className="text-2xl font-serif font-bold tracking-wide text-brand-brown mb-2">Sign Out</h3>
            <p className="text-brand-text-muted text-sm mb-8 leading-relaxed">Are you sure you want to log out of the Al Naaz Admin Panel?</p>
            
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl border border-brand-border text-brand-brown font-bold text-sm hover:bg-brand-border/30 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
