import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, Clock, Calendar } from 'lucide-react';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayName = currentTime.toLocaleDateString('en-US', { weekday: 'short' });
  const dateStr = currentTime.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const hours = currentTime.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  const pad = (n) => String(n).padStart(2, '0');
  const timeStr = `${pad(hours12)}:${pad(currentTime.getMinutes())}:${pad(currentTime.getSeconds())}`;

  const displayName = 
    (user?.name && user.name.trim()) ||
    (user?.username && user.username.trim()) ||
    (user?.first_name && user.first_name.trim()) ||
    (user?.email && user.email.split('@')[0]) ||
    'User';

  const displayRole = user?.role || user?.user_type || '';

  const avatarInitial = displayName.charAt(0).toUpperCase() || 'U';

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Date & Time Clock Widget */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-50/90 hover:bg-slate-100/80 transition-colors border border-slate-200/90 rounded-2xl shadow-2xs">
          {/* Date section */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Calendar size={13} className="text-blue-600" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5">{dayName}</span>
              <span className="text-xs font-bold text-slate-800 tracking-tight">{dateStr}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200/90"></div>

          {/* Time section */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Clock size={13} className="text-emerald-600" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-widest">LIVE</span>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xs font-black text-slate-900 tracking-tight">{timeStr}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{ampm}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Notification Bell & Dropdown */}
        <NotificationBell />

        {/* User Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4 group hover:opacity-90 transition-opacity cursor-pointer"
          title="View & Edit Profile"
        >
          <div className="flex flex-col text-right hidden md:block">
            <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors block leading-tight">
              {displayName}
            </span>
            {displayRole && <span className="text-xs text-gray-500">{displayRole}</span>}
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-50 border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center font-bold text-blue-600 group-hover:ring-2 group-hover:ring-blue-500/30 transition-all">
            {avatarInitial}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
