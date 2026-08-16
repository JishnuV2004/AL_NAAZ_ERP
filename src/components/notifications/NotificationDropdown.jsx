import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import {
  IoCheckmarkDoneOutline,
  IoArrowForwardOutline,
  IoNotificationsOffOutline,
  IoEllipse,
  IoReceiptOutline,
  IoWalletOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoBasketOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';

const getDropdownModuleInfo = (module = '') => {
  const mod = (module || '').toLowerCase();
  if (mod.includes('expense')) {
    return { label: 'Expense', icon: IoReceiptOutline, bg: 'bg-red-50 text-red-700 border-red-200' };
  }
  if (mod.includes('petty')) {
    return { label: 'Petty Cash', icon: IoCashOutline, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (mod.includes('advance')) {
    return { label: 'Advance', icon: IoWalletOutline, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  if (mod.includes('salary')) {
    return { label: 'Salary', icon: IoCashOutline, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
  }
  if (mod.includes('attendance')) {
    return { label: 'Attendance', icon: IoCalendarOutline, bg: 'bg-teal-50 text-teal-700 border-teal-200' };
  }
  if (mod.includes('inventory') || mod.includes('purchase')) {
    return { label: 'Inventory', icon: IoBasketOutline, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  return { label: module || 'System', icon: IoInformationCircleOutline, bg: 'bg-gray-50 text-gray-700 border-gray-200' };
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffSec = Math.floor((new Date() - date) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    setSelectedNotification
  } = useNotificationStore();

  // Show top 5 latest notifications
  const recentNotifications = notifications.slice(0, 5);

  const handleItemClick = (notification) => {
    markAsRead(notification.id);
    onClose();
    if (notification.target_route) {
      navigate(notification.target_route);
    } else {
      setSelectedNotification(notification);
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate('/notifications');
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3.5 bg-[#F9FAFB]">
        <div className="flex items-center space-x-2">
          <h4 className="font-serif text-sm font-bold text-[#111827]">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="rounded-full bg-brand-gold px-2 py-0.5 text-[10px] font-extrabold text-brand-brown">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 text-[11px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
            title="Mark all as read"
          >
            <IoCheckmarkDoneOutline className="h-4 w-4 text-brand-gold" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F3F4F6]">
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2">
              <IoNotificationsOffOutline className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-[#111827]">All caught up</p>
            <p className="text-[11px] text-[#6B7280] mt-0.5">
              There are no new notifications.
            </p>
          </div>
        ) : (
          recentNotifications.map((n) => {
            const moduleInfo = getDropdownModuleInfo(n.module);
            const ModuleIcon = moduleInfo.icon;

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`group flex items-start space-x-3 p-3.5 transition-colors cursor-pointer ${
                  n.is_read
                    ? 'hover:bg-[#F9FAFB] bg-white'
                    : 'bg-amber-50/40 hover:bg-amber-50/70'
                }`}
              >
                {/* Module Icon */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${moduleInfo.bg}`}
                >
                  <ModuleIcon className="h-4 w-4" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`text-xs truncate ${
                        n.is_read ? 'font-medium text-[#374151]' : 'font-bold text-[#111827]'
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <IoEllipse className="h-2 w-2 text-brand-gold fill-current shrink-0" />
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#6B7280]">
                    <span>
                      {n.user || 'staff1'} • {n.module || 'Expense'}
                    </span>
                    <span className="font-medium text-[#9CA3AF]">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer link */}
      <div className="border-t border-[#E5E7EB] bg-[#F9FAFB] p-2.5 text-center">
        <button
          onClick={handleViewAll}
          className="inline-flex items-center justify-center space-x-1 text-xs font-bold text-brand-brown hover:text-brand-gold transition-colors py-1 cursor-pointer w-full"
        >
          <span>View all notifications</span>
          <IoArrowForwardOutline className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
