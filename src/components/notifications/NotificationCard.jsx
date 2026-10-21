import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import {
  IoEyeOutline,
  IoArrowForwardOutline,
  IoReceiptOutline,
  IoCashOutline,
  IoCubeOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoNotificationsOutline,
  IoInformationCircleOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

// Format time as "9:58 AM" or "Oct 17, 2026 • 3:56 PM"
export const formatTimeDisplay = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const isSameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isSameDay) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  return (
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' • ' +
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  );
};

// Module config for icon and styling
const getModuleStyle = (moduleName = '') => {
  const mod = String(moduleName).toUpperCase();
  if (mod === 'FINANCE') {
    return {
      icon: IoReceiptOutline,
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Finance'
    };
  }
  if (mod === 'EMPLOYEES') {
    return {
      icon: IoPeopleOutline,
      bg: 'bg-purple-50 text-purple-600 border-purple-200',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      label: 'Employees'
    };
  }
  if (mod === 'ADVANCE') {
    return {
      icon: IoCashOutline,
      bg: 'bg-amber-50 text-amber-600 border-amber-200',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Advance'
    };
  }
  if (mod === 'ATTENDANCE') {
    return {
      icon: IoCalendarOutline,
      bg: 'bg-teal-50 text-teal-600 border-teal-200',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      label: 'Attendance'
    };
  }
  if (mod === 'INVENTORY') {
    return {
      icon: IoCubeOutline,
      bg: 'bg-blue-50 text-blue-600 border-blue-200',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Inventory'
    };
  }
  return {
    icon: IoNotificationsOutline,
    bg: 'bg-gray-50 text-gray-600 border-gray-200',
    badge: 'bg-gray-100 text-gray-700 border-gray-200',
    label: moduleName || 'General'
  };
};

// Notification type badge
const getTypeBadge = (type = '') => {
  const t = String(type).toUpperCase();
  if (t === 'ERROR' || t === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
        <IoAlertCircleOutline size={11} /> {t}
      </span>
    );
  }
  if (t === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <IoAlertCircleOutline size={11} /> {t}
      </span>
    );
  }
  if (t === 'SUCCESS') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <IoCheckmarkCircleOutline size={11} /> {t}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
      <IoInformationCircleOutline size={11} /> {t || 'INFO'}
    </span>
  );
};

const NotificationCard = ({ notification }) => {
  const navigate = useNavigate();
  const { markAsRead, setSelectedNotification } = useNotificationStore();

  const {
    id,
    title,
    message,
    module,
    notification_type,
    object_id,
    is_read,
    read_at,
    created_at,
    target_route,
    action_label
  } = notification;

  const modStyle = getModuleStyle(module);
  const IconComponent = modStyle.icon;
  const timeStr = formatTimeDisplay(created_at);

  const isRead = Boolean(is_read === true || is_read === 'true' || is_read === 1);

  const handleCardClick = () => {
    setSelectedNotification(notification);
  };

  const handleActionNavigate = (e) => {
    e.stopPropagation();
    if (target_route) {
      navigate(target_route);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${
        isRead
          ? 'bg-white border-gray-200 hover:border-gray-300'
          : 'bg-white border-blue-200 ring-2 ring-blue-500/10 hover:border-blue-400'
      }`}
    >
      {/* Left Column: Icon + Content */}
      <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
        {/* Module Icon Badge with Top-Left Unread Indication */}
        <div className="relative shrink-0">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 select-none shadow-2xs ${modStyle.bg}`}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          {/* Top-left Unread Indication: Only shown when isRead is false, disappears when is_read is true */}
          {!isRead && (
            <span
              className="absolute -top-1 -left-1 flex h-3 w-3 z-10"
              title="New unread notification"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 ring-2 ring-white shadow-xs" />
            </span>
          )}
        </div>

        {/* Text Container */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${modStyle.badge}`}
            >
              {modStyle.label}
            </span>

            {getTypeBadge(notification_type)}
          </div>

          <h4
            className={`text-sm tracking-tight ${
              isRead ? 'font-semibold text-gray-800' : 'font-extrabold text-gray-900'
            }`}
          >
            {title}
          </h4>

          {message && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5 leading-relaxed font-normal">
              {message}
            </p>
          )}

          {/* Meta line */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-400 font-medium">
            <span className="text-gray-500 font-semibold">{timeStr}</span>
            {object_id && (
              <>
                <span>•</span>
                <span className="font-mono text-gray-500">ID: #{object_id}</span>
              </>
            )}
            {isRead && read_at && (
              <>
                <span>•</span>
                <span className="text-gray-400">Read</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Navigation text link + Eye icon for details */}
      <div className="flex items-center justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        {target_route && (
          <button
            type="button"
            onClick={handleActionNavigate}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-blue-50/60"
            title={`Navigate to ${action_label}`}
          >
            <span>{action_label}</span>
            <IoArrowForwardOutline size={12} />
          </button>
        )}

        {/* Eye icon button to show details */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          title="Show Details"
        >
          <IoEyeOutline size={18} />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
