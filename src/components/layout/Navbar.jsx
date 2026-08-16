import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = (user?.role || '').toUpperCase() !== 'STAFF';

  // Format current date matching screenshot layout (e.g. Monday, 10 August 2026)
  const formatDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('notifications')) return 'Notification Center';
    if (path.includes('inventory')) return 'Inventory & Stock';
    if (path.includes('grocery')) return 'Grocery & Supplies';
    if (path.includes('expense') || path.includes('finance')) return 'Finance & Expenses';
    if (path.includes('attendance')) return 'Attendance Ledger';
    if (path.includes('salary')) return 'Staff Salaries';
    if (path.includes('advance')) return 'Salary Advances';
    return 'Welcome To AL NAAZ';
  };

  return (
    <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <span className="text-[11px] font-sans font-semibold tracking-[0.2em] text-brand-text-muted uppercase">
           Al Naaz Mandi Hotel
        </span>
        <div className="flex items-center space-x-2 mt-0.5">
          {/* Decorative Star Icon similar to design */}
          <span className="text-xl text-brand-gold">✦</span>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold tracking-wide text-brand-text">
            {getPageTitle()}
          </h2>
        </div>
        <p className="mt-1 font-sans text-xs font-medium text-brand-text-muted">
          {formatDate()}
        </p>
      </div>

      {/* Right side controls: Notification Bell & Status Indicator */}
      <div className="mt-4 md:mt-0 flex items-center space-x-3.5">
        {/* Notification Bell (Admin Only) */}
        {isAdmin && <NotificationBell />}

        {/* Soft shadow container showing active indicators */}
        <div className="hidden lg:flex items-center space-x-2 rounded-full border border-brand-border bg-white px-4 py-2 text-xs font-semibold text-brand-text shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>System Online</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

