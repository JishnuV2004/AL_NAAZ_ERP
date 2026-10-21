import { create } from 'zustand';
import { notificationService } from '../services/notificationService';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  allNotificationsCount: 0,
  unreadCount: 0,
  loading: false,
  markingAllAsRead: false,
  error: null,

  // Pagination
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,

  // Active filters: module can be 'ALL', 'EMPLOYEES', 'ADVANCE', 'ATTENDANCE', 'INVENTORY', 'FINANCE'
  filters: {
    module: 'ALL',
    is_read: 'ALL',
    search: ''
  },

  // Modal / Detail state
  selectedNotification: null,
  detailLoading: false,

  setSelectedNotification: (notification) => {
    set({ selectedNotification: notification });
  },

  fetchNotificationById: async (id) => {
    set({ detailLoading: true });
    try {
      const data = await notificationService.getNotificationById(id);
      set({ selectedNotification: data, detailLoading: false });
      return data;
    } catch (err) {
      console.error('Failed to fetch notification detail:', err);
      set({ detailLoading: false });
      return null;
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchNotifications(page);
  },

  setPage: (newPage) => {
    const pageNum = Math.max(1, parseInt(newPage, 10) || 1);
    set({ page: pageNum });
    get().fetchNotifications(pageNum, get().filters);
  },

  setModuleFilter: (moduleName) => {
    const updatedFilters = { ...get().filters, module: moduleName };
    set({ filters: updatedFilters, page: 1 });
    get().fetchNotifications(1, updatedFilters);
  },

  setFilter: (key, value) => {
    const updatedFilters = { ...get().filters, [key]: value };
    set({ filters: updatedFilters, page: 1 });
    get().fetchNotifications(1, updatedFilters);
  },

  resetFilters: () => {
    const defaultFilters = {
      module: 'ALL',
      is_read: 'ALL',
      search: ''
    };
    set({ filters: defaultFilters, page: 1 });
    get().fetchNotifications(1, defaultFilters);
  },

  // Fetch notifications using backend pagination and active filters
  fetchNotifications: async (page = get().page, filters = get().filters) => {
    set({ loading: true, error: null });
    try {
      const currentPage = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = get().pageSize || 10;

      const response = await notificationService.fetchNotifications(
        currentPage,
        pageSize,
        filters
      );

      const count = response.count || 0;
      const totalPages = Math.max(1, Math.ceil(count / pageSize));

      set({
        notifications: response.results || [],
        totalCount: count,
        totalPages,
        page: currentPage,
        hasNext: !!response.next,
        hasPrev: !!response.previous,
        filters,
        loading: false
      });

      // If module is 'ALL', count also reflects allNotificationsCount
      if (!filters.module || filters.module === 'ALL') {
        set({ allNotificationsCount: count });
      } else {
        // Fetch all notifications total count independently
        get().fetchAllCount();
      }

      // Update unread count
      get().fetchUnreadCount();
    } catch (error) {
      set({
        error: error?.message || 'Failed to load notifications',
        loading: false
      });
    }
  },

  // Fetch all notifications overall count
  fetchAllCount: async () => {
    try {
      const count = await notificationService.fetchAllCount();
      set({ allNotificationsCount: count });
    } catch (error) {
      console.error('Error fetching total notifications count:', error);
    }
  },

  // Fetch unread count from API
  fetchUnreadCount: async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount();
      set({ unreadCount });
      return unreadCount;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Fetch summary stats & counts
  fetchStats: async () => {
    try {
      const [allCount, unread] = await Promise.all([
        notificationService.fetchAllCount(),
        notificationService.getUnreadCount()
      ]);
      set({
        allNotificationsCount: allCount,
        unreadCount: unread,
        stats: {
          total: allCount,
          unread
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    try {
      const res = await notificationService.markAsRead(id);

      set((state) => {
        const wasUnread = state.notifications.find((n) => String(n.id) === String(id) && !n.is_read);
        const updatedList = state.notifications.map((n) =>
          String(n.id) === String(id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        );
        const newUnreadCount = wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount;

        return {
          notifications: updatedList,
          unreadCount: newUnreadCount,
          selectedNotification:
            state.selectedNotification && String(state.selectedNotification.id) === String(id)
              ? { ...state.selectedNotification, is_read: true, read_at: new Date().toISOString() }
              : state.selectedNotification
        };
      });

      get().fetchUnreadCount();
      return res;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    set({ markingAllAsRead: true });
    try {
      const res = await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString()
        })),
        unreadCount: 0,
        selectedNotification: state.selectedNotification
          ? { ...state.selectedNotification, is_read: true, read_at: new Date().toISOString() }
          : null,
        markingAllAsRead: false
      }));

      get().fetchUnreadCount();
      return res;
    } catch (error) {
      console.error('Error marking all as read:', error);
      set({ markingAllAsRead: false });
      throw error;
    }
  }
}));
