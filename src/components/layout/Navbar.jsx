import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, ChevronDown, Building2, Clock, Calendar } from 'lucide-react';

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

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden">
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Date & Time Clock Widget */}
        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 bg-gray-50/90 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar size={14} className="text-blue-600 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-gray-300 font-normal">|</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-blue-600 shrink-0" />
            <span className="font-mono text-gray-900 font-bold tracking-tight">{formattedTime}</span>
          </div>
        </div>

        {/* Branch Selector */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
          <Building2 size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Main Branch</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
          <div className="flex flex-col text-right hidden md:block">
            <span className="text-sm font-bold text-gray-900 block leading-tight">{user?.name || 'Abdul Rahman'}</span>
            <span className="text-xs text-gray-500">{user?.role || 'Super Admin'}</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-500">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
