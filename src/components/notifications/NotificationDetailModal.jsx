import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import Modal from '../common/Modal';
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCubeOutline,
  IoPersonOutline,
  IoReceiptOutline
} from 'react-icons/io5';

const NotificationDetailModal = () => {
  const navigate = useNavigate();
  const { selectedNotification, setSelectedNotification, markAsRead } = useNotificationStore();

  if (!selectedNotification) return null;

  const {
    id,
    title,
    message,
    module,
    action,
    user,
    amount,
    is_read,
    created_at,
    target_route,
    action_label,
    related_object_type,
    related_object_id
  } = selectedNotification;

  const handleClose = () => {
    setSelectedNotification(null);
  };

  const handleAction = () => {
    markAsRead(id);
    setSelectedNotification(null);
    if (target_route) {
      navigate(target_route);
    }
  };

  const handleMarkAsRead = () => {
    markAsRead(id);
  };

  return (
    <Modal
      isOpen={Boolean(selectedNotification)}
      onClose={handleClose}
      title="Activity Details"
      size="max-w-xl"
    >
      <div className="space-y-6">
        {/* Upper Header Card */}
        <div className="flex items-start justify-between gap-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] p-5">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] font-bold text-xl select-none">
              $
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  {module || 'Expense'} Module
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-blue-700 uppercase">
                  {action || 'Activity'}
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#111827]">
                {title}
              </h3>
            </div>
          </div>

          {amount && (
            <div className="text-right">
              <span className="text-lg font-extrabold text-[#EF4444]">
                ₹{amount}
              </span>
            </div>
          )}
        </div>

        {/* Message body */}
        <div>
          <label className="block text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
            Description
          </label>
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm font-medium leading-relaxed text-[#374151] shadow-2xs">
            {message || title}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* User */}
          <div className="flex items-center space-x-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
            <IoPersonOutline className="h-5 w-5 text-[#6B7280] shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                User
              </p>
              <p className="text-xs font-semibold text-[#111827]">
                {user || 'staff1'}
              </p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center space-x-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
            <IoTimeOutline className="h-5 w-5 text-[#6B7280] shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Logged At
              </p>
              <p className="text-xs font-semibold text-[#111827]">
                {new Date(created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>

          {/* Module */}
          <div className="flex items-center space-x-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5">
            <IoCubeOutline className="h-5 w-5 text-[#6B7280] shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                Module
              </p>
              <p className="text-xs font-semibold text-[#111827]">
                {module || 'Expense'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#E5E7EB]">
          <div>
            {!is_read ? (
              <button
                onClick={handleMarkAsRead}
                className="flex items-center space-x-1.5 text-xs font-bold text-[#2563EB] hover:underline transition-colors cursor-pointer"
              >
                <IoCheckmarkCircleOutline className="h-4 w-4" />
                <span>Mark as read</span>
              </button>
            ) : (
              <span className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600">
                <IoCheckmarkCircleOutline className="h-4 w-4" />
                <span>Read</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-bold text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
            >
              Close
            </button>

            {target_route && (
              <button
                onClick={handleAction}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-brand-gold px-5 py-2.5 text-xs font-bold text-brand-brown hover:bg-brand-gold-hover shadow-md hover:shadow-sm transition-all cursor-pointer"
              >
                <span>{action_label || 'Go to Module'}</span>
                <IoArrowForwardOutline className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailModal;
