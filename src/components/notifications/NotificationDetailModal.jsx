import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoCheckmarkOutline,
  IoCheckmarkDoneOutline,
  IoCubeOutline,
  IoReceiptOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';

const getModuleIcon = (module = '') => {
  const mod = String(module).toUpperCase();
  if (mod === 'CLEARANCE') return IoShieldCheckmarkOutline;
  if (mod === 'FINANCE') return IoReceiptOutline;
  if (mod === 'EMPLOYEES') return IoPeopleOutline;
  if (mod === 'ADVANCE') return IoCashOutline;
  if (mod === 'ATTENDANCE') return IoCalendarOutline;
  if (mod === 'INVENTORY') return IoCubeOutline;
  return IoInformationCircleOutline;
};

const NotificationDetailModal = () => {
  const navigate = useNavigate();
  const { selectedNotification, setSelectedNotification, markAsRead } = useNotificationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selectedNotification) return null;

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
  } = selectedNotification;

  const isRead = Boolean(is_read === true || is_read === 'true' || is_read === 1);
  const IconComp = getModuleIcon(module);

  const handleClose = () => {
    setSelectedNotification(null);
  };

  const handleNavigate = () => {
    handleClose();
    if (target_route) {
      navigate(target_route);
    }
  };

  const handleMarkAsRead = async () => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const res = await markAsRead(id);
      toast.success(res?.message || 'Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark as read:', err);
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'Failed to mark as read';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(selectedNotification)}
      onClose={handleClose}
      title="Notification Details"
      size="max-w-xl"
    >
      <div className="space-y-6">
        {/* Upper Header Card */}
        <div className="flex items-start justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-200 p-5">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xl select-none">
              <IconComp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {module || 'System'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 border border-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-700 uppercase">
                  {notification_type || 'INFO'}
                </span>
                {object_id && (
                  <span className="text-[11px] font-mono text-gray-500">
                    ID: #{object_id}
                  </span>
                )}
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
        </div>

        {/* Message body */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            Notification Message
          </label>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm font-medium leading-relaxed text-gray-800 shadow-2xs whitespace-pre-wrap">
            {message || title}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Created Timestamp */}
          <div className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
            <IoTimeOutline className="h-5 w-5 text-gray-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Created At
              </p>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {new Date(created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>

          {/* Read Status */}
          <div className="flex items-center space-x-3 rounded-xl border border-gray-200 bg-gray-50 p-3.5">
            <IoCheckmarkCircleOutline className={`h-5 w-5 shrink-0 ${isRead ? 'text-emerald-600' : 'text-gray-400'}`} />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Status
              </p>
              <p className="text-xs font-semibold text-gray-900 truncate">
                {isRead ? (
                  read_at ? (
                    `Read on ${new Date(read_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
                  ) : (
                    'Read'
                  )
                ) : (
                  'Unread'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons: Tick icon for Mark Read */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <div>
            {target_route && (
              <button
                type="button"
                onClick={handleNavigate}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                <span>{action_label || 'View in Module'}</span>
                <IoArrowForwardOutline size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-initial rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Mark Read button with Tick Icon */}
            <button
              type="button"
              disabled={isSubmitting || isRead}
              onClick={handleMarkAsRead}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs ${
                isRead
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 opacity-60 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
              title={isRead ? 'Already marked as read' : 'Mark as Read'}
            >
              {isSubmitting ? (
                <>
                  <IoRefreshOutline className="h-4 w-4 animate-spin" />
                  <span>Marking...</span>
                </>
              ) : isRead ? (
                <>
                  <IoCheckmarkDoneOutline className="h-4 w-4 text-emerald-600" />
                  <span>Marked as Read</span>
                </>
              ) : (
                <>
                  <IoCheckmarkOutline className="h-4 w-4" />
                  <span>Mark as Read</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailModal;
