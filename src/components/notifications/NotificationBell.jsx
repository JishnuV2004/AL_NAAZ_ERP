import React, { useState, useRef, useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationDropdown from './NotificationDropdown';
import { IoNotificationsOutline } from 'react-icons/io5';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { unreadCount, fetchNotifications, fetchStats, fetchUnreadCount } = useNotificationStore();

  // Load initial notification data
  useEffect(() => {
    if (typeof fetchNotifications === 'function') fetchNotifications();
    if (typeof fetchUnreadCount === 'function') fetchUnreadCount();
    if (typeof fetchStats === 'function') fetchStats();
  }, [fetchNotifications, fetchUnreadCount, fetchStats]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="View notifications"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-2xs'
        }`}
      >
        <IoNotificationsOutline className="h-5 w-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 font-sans text-[10px] font-extrabold text-white ring-2 ring-white shadow-2xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
