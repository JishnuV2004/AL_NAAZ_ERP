import React, { useEffect, useMemo } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import NotificationCard from '../components/notifications/NotificationCard';
import NotificationFilters from '../components/notifications/NotificationFilters';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoRefreshOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';

// Helper to group items by TODAY, YESTERDAY, EARLIER
const groupNotificationsByDate = (notifications = []) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const startOfYesterday = startOfToday - oneDay;

  const groups = {
    TODAY: [],
    YESTERDAY: [],
    EARLIER: []
  };

  notifications.forEach((item) => {
    const itemTime = new Date(item.created_at).getTime();
    if (itemTime >= startOfToday) {
      groups.TODAY.push(item);
    } else if (itemTime >= startOfYesterday && itemTime < startOfToday) {
      groups.YESTERDAY.push(item);
    } else {
      groups.EARLIER.push(item);
    }
  });

  return groups;
};

const Notifications = () => {
  const {
    notifications,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    setPage,
    fetchNotifications,
    fetchStats,
    resetFilters
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const grouped = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Single-row Filters Panel Card */}
      <NotificationFilters />

      {/* 2. Activity List Section */}
      <div>
        {/* Activity List Subheader */}
        <div className="mb-4">
          <p className="text-sm font-medium text-[#6B7280]">
            Showing {notifications.length > 0 ? (page - 1) * pageSize + 1 : 0}-
            {Math.min(page * pageSize, totalCount)} of {totalCount} activities
          </p>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-11 w-11 rounded-xl bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-gray-200 rounded-md" />
                    <div className="h-3 w-32 bg-gray-100 rounded-md" />
                  </div>
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-12 text-center">
            <IoAlertCircleOutline className="h-8 w-8 text-red-600 mb-2" />
            <h3 className="text-base font-bold text-red-800">
              Unable to load activities
            </h3>
            <p className="mt-1 text-xs text-red-600">
              Something went wrong while loading activity list.
            </p>
            <button
              onClick={() => fetchNotifications(page)}
              className="mt-3 flex items-center space-x-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
            >
              <IoRefreshOutline className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white p-14 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-3">
              <IoCheckmarkCircleOutline className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#111827]">
              No activities found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-[#6B7280]">
              There are no activities matching your selected filter criteria.
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center space-x-1.5 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2 text-xs font-bold text-[#374151] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <IoRefreshOutline className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* TODAY Section */}
            {grouped.TODAY.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                  TODAY
                </h5>
                <div className="space-y-3">
                  {grouped.TODAY.map((item) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
                </div>
              </div>
            )}

            {/* YESTERDAY Section */}
            {grouped.YESTERDAY.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                  YESTERDAY
                </h5>
                <div className="space-y-3">
                  {grouped.YESTERDAY.map((item) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
                </div>
              </div>
            )}

            {/* EARLIER Section */}
            {grouped.EARLIER.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                  EARLIER
                </h5>
                <div className="space-y-3">
                  {grouped.EARLIER.map((item) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Bottom Pagination */}
        {!loading && !error && totalCount > 0 && (
          <div className="flex items-center justify-between mt-8 pt-4">
            {/* Bottom Left text */}
            <span className="text-sm font-medium text-[#6B7280]">
              Page {page} of {totalPages}
            </span>

            {/* Bottom Right Arrow & Page buttons */}
            <div className="flex items-center space-x-2">
              {/* Previous Arrow */}
              <button
                disabled={!hasPrev || loading}
                onClick={() => setPage(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                title="Previous page"
              >
                <IoChevronBackOutline className="h-4 w-4" />
              </button>

              {/* Page Number Button(s) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
                const isActive = page === pNum;
                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'border border-[#3B82F6] bg-[#EFF6FF] text-[#2563EB] shadow-2xs'
                        : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              {/* Next Arrow */}
              <button
                disabled={!hasNext || loading}
                onClick={() => setPage(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                title="Next page"
              >
                <IoChevronForwardOutline className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Viewer */}
      <NotificationDetailModal />
    </div>
  );
};

export default Notifications;
