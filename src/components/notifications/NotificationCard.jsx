import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import {
  IoEllipsisVertical,
  IoEyeOutline,
  IoCheckmarkOutline,
  IoArrowForwardOutline,
  IoReceiptOutline
} from 'react-icons/io5';

// Format time as "9:58 AM", "6:10 AM" etc.
export const formatTimeOnly = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const NotificationCard = ({ notification }) => {
  const navigate = useNavigate();
  const { markAsRead, setSelectedNotification } = useNotificationStore();
  const [showMenu, setShowMenu] = useState(false);

  const {
    id,
    title,
    module,
    action,
    user,
    amount,
    is_read,
    created_at,
    target_route,
    action_label
  } = notification;

  const timeStr = formatTimeOnly(created_at);

  const handleCardClick = () => {
    setSelectedNotification(notification);
  };

  const handleActionNavigate = (e) => {
    e.stopPropagation();
    markAsRead(id);
    setShowMenu(false);
    if (target_route) {
      navigate(target_route);
    }
  };

  const handleMarkRead = (e) => {
    e.stopPropagation();
    markAsRead(id);
    setShowMenu(false);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm ${
        is_read
          ? 'bg-white border-[#E5E7EB] hover:border-[#D1D5DB]'
          : 'bg-white border-[#E5E7EB] ring-1 ring-amber-500/20 hover:border-amber-400'
      }`}
    >
      {/* Left Column: Red Currency Icon + Title & Meta Info */}
      <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 flex-1">
        {/* Red Rounded Currency Icon Badge */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] transition-transform duration-200 group-hover:scale-105 select-none shadow-2xs">
          <span className="font-mono text-base font-extrabold">$</span>
        </div>

        {/* Text Container */}
        <div className="min-w-0 flex-1 pr-2">
          <h4 className="text-sm font-bold text-[#111827] truncate tracking-tight">
            {title}
          </h4>

          {/* Meta line: staff1 • Expense • Updated • 9:58 AM */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#6B7280] font-normal">
            <span>{user || 'staff1'}</span>
            <span>•</span>
            <span>{module || 'Expense'}</span>
            <span>•</span>
            <span>{action || 'Updated'}</span>
            <span>•</span>
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Amount in Red + Three Dots Menu */}
      <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
        {/* Amount */}
        {amount && (
          <span className="font-sans text-sm sm:text-base font-bold text-[#EF4444] tracking-tight">
            ₹{amount}
          </span>
        )}

        {/* Three Dots Menu Button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            title="Options"
          >
            <IoEllipsisVertical className="h-4 w-4" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-44 rounded-xl border border-[#E5E7EB] bg-white p-1.5 shadow-lg z-30 animate-fade-in"
            >
              <button
                onClick={handleCardClick}
                className="flex items-center space-x-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] text-left cursor-pointer"
              >
                <IoEyeOutline className="h-4 w-4 text-[#6B7280]" />
                <span>View Details</span>
              </button>

              {target_route && (
                <button
                  onClick={handleActionNavigate}
                  className="flex items-center space-x-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-[#374151] hover:bg-[#F9FAFB] text-left cursor-pointer"
                >
                  <IoArrowForwardOutline className="h-4 w-4 text-[#6B7280]" />
                  <span>{action_label || 'Go to Module'}</span>
                </button>
              )}

              {!is_read && (
                <button
                  onClick={handleMarkRead}
                  className="flex items-center space-x-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 text-left cursor-pointer"
                >
                  <IoCheckmarkOutline className="h-4 w-4" />
                  <span>Mark as Read</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
