import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 2,
  stats: {
    unread: 2,
    highPriority: 2,
    today: 2,
    total: 8
  },
  loading: false,
  error: null,

  // Pagination
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,

  // Active filters matching the reference layout
  filters: {
    module: 'Expense', // Default 'Expense' as shown in screenshot
    action: 'ALL', // Default 'All Actions'
    user: '', // Search user...
    dateRange: 'Today', // Default 'Today' active
    startDate: '',
    endDate: '',
    search: '',
    status: 'ALL',
    priority: 'ALL'
  },

  // Modal / Detail state
  selectedNotification: null,

  setSelectedNotification: (notification) => {
    set({ selectedNotification: notification });
    if (notification && !notification.is_read) {
      get().markAsRead(notification.id);
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchNotifications(page);
  },

  setFilter: (key, value) => {
    const updatedFilters = { ...get().filters, [key]: value };
    set({ filters: updatedFilters, page: 1 });
    get().fetchNotifications(1, updatedFilters);
  },

  setMultipleFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters, page: 1 });
    get().fetchNotifications(1, updatedFilters);
  },

  resetFilters: () => {
    const defaultFilters = {
      module: 'ALL',
      action: 'ALL',
      user: '',
      dateRange: 'ALL',
      startDate: '',
      endDate: '',
      search: '',
      status: 'ALL',
      priority: 'ALL'
    };
    set({ filters: defaultFilters, page: 1 });
    get().fetchNotifications(1, defaultFilters);
  },

  // Fetch notifications with current filters
  fetchNotifications: async (page = get().page, filters = get().filters) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationService.fetchNotifications(
        page,
        get().pageSize,
        filters
      );

      const count = response.count || 0;
      const totalPages = Math.ceil(count / get().pageSize) || 1;

      set({
        notifications: response.results || [],
        totalCount: count,
        totalPages,
        hasNext: !!response.next,
        hasPrev: !!response.previous,
        loading: false
      });

      // Update global unread and stats as well
      get().fetchStats();
    } catch (error) {
      set({
        error: error?.message || 'Failed to load notifications',
        loading: false
      });
    }
  },

  // Fetch summary stats & unread count
  fetchStats: async () => {
    try {
      const stats = await notificationService.fetchStats();
      set({
        stats,
        unreadCount: stats.unread ?? 0
      });
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);

      // Optimistically update notifications list
      set((state) => {
        const updatedList = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        const wasUnread = state.notifications.find((n) => n.id === id && !n.is_read);
        const newUnreadCount = wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount;

        return {
          notifications: updatedList,
          unreadCount: newUnreadCount,
          stats: {
            ...state.stats,
            unread: newUnreadCount
          },
          selectedNotification:
            state.selectedNotification?.id === id
              ? { ...state.selectedNotification, is_read: true }
              : state.selectedNotification
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
        stats: {
          ...state.stats,
          unread: 0
        },
        selectedNotification: state.selectedNotification
          ? { ...state.selectedNotification, is_read: true }
          : null
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }
}));
