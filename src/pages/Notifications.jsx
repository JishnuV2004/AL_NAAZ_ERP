import React, { useEffect, useState, useMemo } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import NotificationCard from '../components/notifications/NotificationCard';
import NotificationDetailModal from '../components/notifications/NotificationDetailModal';
import toast from 'react-hot-toast';
import {
  IoSearchOutline,
  IoCheckmarkDoneOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkCircleOutline,
  IoNotificationsOutline,
  IoPeopleOutline,
  IoCashOutline,
  IoCalendarOutline,
  IoCubeOutline,
  IoReceiptOutline,
  IoLayersOutline
} from 'react-icons/io5';

// Allowed modules according to user specifications
const MODULE_TABS = [
  { id: 'ALL', name: 'All', icon: IoLayersOutline },
  { id: 'EMPLOYEES', name: 'Employees', icon: IoPeopleOutline },
  { id: 'ADVANCE', name: 'Advance', icon: IoCashOutline },
  { id: 'ATTENDANCE', name: 'Attendance', icon: IoCalendarOutline },
  { id: 'INVENTORY', name: 'Inventory', icon: IoCubeOutline },
  { id: 'FINANCE', name: 'Finance', icon: IoReceiptOutline }
];

const Notifications = () => {
  const {
    notifications,
    allNotificationsCount,
    unreadCount,
    loading,
    error,
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    filters,
    setPage,
    setModuleFilter,
    fetchNotifications,
    fetchAllCount,
    fetchUnreadCount,
    markAllAsRead,
    markingAllAsRead
  } = useNotificationStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, UNREAD, READ

  // Load initial notifications & count of all notifications
  useEffect(() => {
    fetchAllCount();
    fetchUnreadCount();
  }, []);

  // Fetch when module or status filter changes
  useEffect(() => {
    const activeFilters = {
      module: filters.module || 'ALL',
      is_read: statusFilter === 'UNREAD' ? false : statusFilter === 'READ' ? true : 'ALL',
      search: searchTerm.trim()
    };
    fetchNotifications(1, activeFilters);
  }, [filters.module, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const activeFilters = {
      module: filters.module || 'ALL',
      is_read: statusFilter === 'UNREAD' ? false : statusFilter === 'READ' ? true : 'ALL',
      search: searchTerm.trim()
    };
    fetchNotifications(1, activeFilters);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setModuleFilter('ALL');
  };

  const handlePageChange = (newPage) => {
    const activeFilters = {
      module: filters.module || 'ALL',
      is_read: statusFilter === 'UNREAD' ? false : statusFilter === 'READ' ? true : 'ALL',
      search: searchTerm.trim()
    };
    fetchNotifications(newPage, activeFilters);
  };

  // Group notifications by date (TODAY, YESTERDAY, EARLIER)
  const grouped = useMemo(() => {
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
  }, [notifications]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* 1. Header Banner & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <IoNotificationsOutline size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Notifications</h1>
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-blue-600 text-white rounded-full shadow-2xs">
                {unreadCount} Unread
              </span>
              <span className="text-xs text-gray-500 font-semibold">
                ({allNotificationsCount} Total)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Real-time operational alerts, activity logs, and updates across your system.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              fetchNotifications(page);
              fetchAllCount();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            title="Refresh notifications"
          >
            <IoRefreshOutline size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            disabled={markingAllAsRead || unreadCount === 0}
            onClick={async () => {
              try {
                const res = await markAllAsRead();
                toast.success(res?.message || 'All notifications marked as read.');
              } catch (err) {
                toast.error('Failed to mark all as read.');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Mark all notifications as read"
          >
            {markingAllAsRead ? (
              <>
                <IoRefreshOutline size={16} className="animate-spin" />
                <span>Marking All Read...</span>
              </>
            ) : (
              <>
                <IoCheckmarkDoneOutline size={16} />
                <span>Mark All as Read</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
            All Notifications
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-gray-900">{allNotificationsCount}</p>
            <span className="text-[11px] font-semibold text-gray-400">Total</span>
          </div>
        </div>

        <div className="bg-white border border-blue-200 bg-blue-50/20 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
            Unread Alerts
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-blue-700">{unreadCount}</p>
            <span className="text-[11px] font-semibold text-blue-500">Pending</span>
          </div>
        </div>

        <div className="bg-white border border-purple-200 bg-purple-50/20 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-1">
            Active Module
          </p>
          <p className="text-xl font-extrabold text-purple-700 truncate">
            {filters.module === 'ALL' ? 'All Modules' : filters.module}
          </p>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Filtered Results
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-extrabold text-emerald-700">{totalCount}</p>
            <span className="text-[11px] font-semibold text-emerald-600">Items</span>
          </div>
        </div>
      </div>

      {/* 3. Module Filter Tabs (EMPLOYEES, ADVANCE, ATTENDANCE, INVENTORY, FINANCE, ALL) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {MODULE_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = (filters.module || 'ALL') === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setModuleFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                <TabIcon size={16} />
                <span>{tab.name}</span>
                {tab.id === 'ALL' && unreadCount > 0 && (
                  <span
                    className={`ml-0.5 px-2 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {unreadCount} unread
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Search and Read Status Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <IoSearchOutline
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder={`Search in ${filters.module === 'ALL' ? 'all' : filters.module} notifications...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
            />
          </form>

          {/* Status buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              {['ALL', 'UNREAD', 'READ'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-gray-900 shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {st === 'ALL' ? 'All' : st === 'UNREAD' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>

            {(searchTerm || statusFilter !== 'ALL' || filters.module !== 'ALL') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Notification Activity List */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 w-full rounded-2xl border border-gray-200 bg-white p-5 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-11 w-11 rounded-xl bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-gray-200 rounded-md" />
                    <div className="h-3 w-64 bg-gray-100 rounded-md" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center">
            <IoAlertCircleOutline className="h-8 w-8 text-rose-600 mb-2" />
            <h3 className="text-base font-bold text-rose-800">Unable to load notifications</h3>
            <p className="mt-1 text-xs text-rose-600">
              Something went wrong while connecting to the notifications API.
            </p>
            <button
              onClick={() => fetchNotifications(page)}
              className="mt-3 flex items-center space-x-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <IoRefreshOutline className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-14 text-center shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-3">
              <IoCheckmarkCircleOutline className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No notifications found</h3>
            <p className="mt-1 max-w-sm text-xs text-gray-500">
              There are no notifications matching the selected module or filter criteria.
            </p>
            {(searchTerm || statusFilter !== 'ALL' || filters.module !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center space-x-1.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <IoRefreshOutline className="h-4 w-4" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* TODAY */}
            {grouped.TODAY.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold tracking-wider text-gray-400 uppercase">TODAY</h5>
                <div className="space-y-3">
                  {grouped.TODAY.map((item) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
                </div>
              </div>
            )}

            {/* YESTERDAY */}
            {grouped.YESTERDAY.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  YESTERDAY
                </h5>
                <div className="space-y-3">
                  {grouped.YESTERDAY.map((item) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
                </div>
              </div>
            )}

            {/* EARLIER */}
            {grouped.EARLIER.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold tracking-wider text-gray-400 uppercase">EARLIER</h5>
                <div className="space-y-3">
                  {grouped.EARLIER.map((item) => (
                    <NotificationCard key={item.id} notification={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Pagination Footer */}
        {!loading && !error && totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-500">
              Showing {Math.min((page - 1) * pageSize + 1, totalCount)} to{' '}
              {Math.min(page * pageSize, totalCount)} of {totalCount} notifications
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={!hasPrev || loading}
                onClick={() => handlePageChange(page - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                title="Previous page"
              >
                <IoChevronBackOutline className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => {
                const isActive = page === pNum;
                return (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'border border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}

              <button
                disabled={!hasNext || loading}
                onClick={() => handlePageChange(page + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
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
