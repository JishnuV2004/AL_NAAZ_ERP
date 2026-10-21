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
  IoInformationCircleOutline,
  IoShieldCheckmarkOutline,
  IoPieChartOutline,
  IoCubeOutline,
  IoPeopleOutline,
  IoRefreshOutline
} from 'react-icons/io5';

const getDropdownModuleInfo = (module = '') => {
  const mod = String(module || '').toLowerCase();
  if (mod.includes('expense') || mod.includes('finance')) {
    return { label: 'Finance', icon: IoReceiptOutline, bg: 'bg-rose-50 text-rose-700 border-rose-200' };
  }
  if (mod.includes('budget')) {
    return { label: 'Budget', icon: IoPieChartOutline, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (mod.includes('petty')) {
    return { label: 'Petty Cash', icon: IoCashOutline, bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
  if (mod.includes('stock') || mod.includes('inventory') || mod.includes('purchase')) {
    return { label: 'Stock', icon: IoCubeOutline, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }
  if (mod.includes('hr') || mod.includes('attendance') || mod.includes('salary') || mod.includes('advance')) {
    return { label: 'HR', icon: IoPeopleOutline, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
  }
  return { label: module || 'System', icon: IoShieldCheckmarkOutline, bg: 'bg-blue-50 text-blue-700 border-blue-200' };
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
    markingAllAsRead,
    setSelectedNotification
  } = useNotificationStore();

  // Show top 5 latest notifications
  const recentNotifications = notifications.slice(0, 5);

  const handleItemClick = (notification) => {
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

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white shadow-2xl z-50 overflow-hidden animate-fade-in origin-top-right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3.5 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h4 className="text-sm font-bold text-gray-900">
            Notifications
          </h4>
          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-extrabold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            disabled={markingAllAsRead}
            onClick={handleMarkAllRead}
            className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 disabled:opacity-50 transition-colors cursor-pointer"
            title="Mark all as read"
          >
            {markingAllAsRead ? (
              <>
                <IoRefreshOutline className="h-4 w-4 animate-spin" />
                <span>Marking...</span>
              </>
            ) : (
              <>
                <IoCheckmarkDoneOutline className="h-4 w-4" />
                <span>Mark all read</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
        {recentNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-2">
              <IoNotificationsOffOutline className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-gray-900">All caught up</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              There are no new notifications.
            </p>
          </div>
        ) : (
          recentNotifications.map((n) => {
            const moduleInfo = getDropdownModuleInfo(n.category || n.module);
            const ModuleIcon = moduleInfo.icon;

            const isRead = Boolean(n.is_read === true || n.is_read === 'true' || n.is_read === 1);

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`group flex items-start space-x-3 p-3.5 transition-colors cursor-pointer ${
                  isRead
                    ? 'hover:bg-gray-50 bg-white'
                    : 'bg-blue-50/30 hover:bg-blue-50/60'
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
                        isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'
                      }`}
                    >
                      {n.title}
                    </p>
                    {!isRead && (
                      <IoEllipse className="h-2 w-2 text-blue-600 fill-current shrink-0" />
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
                    <span className="truncate pr-2 font-medium">
                      {n.module || 'SYSTEM'}{n.object_id ? ` • #${n.object_id}` : ''}
                    </span>
                    <span className="font-medium text-gray-400 shrink-0">
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
      <div className="border-t border-gray-200 bg-gray-50 p-2.5 text-center">
        <button
          type="button"
          onClick={handleViewAll}
          className="inline-flex items-center justify-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1 cursor-pointer w-full"
        >
          <span>View all notifications</span>
          <IoArrowForwardOutline className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
