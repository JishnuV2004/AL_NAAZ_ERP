import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

/**
 * Normalizes notification items according to API response:
 * {
 *   id: 30,
 *   notification_type: "INFO",
 *   title: "Daily Sales Posted",
 *   message: "Daily sales for 2026-10-17 have been posted successfully. Total sales: ₹6000.00. Sales ID: 10.",
 *   module: "FINANCE",
 *   object_id: 10,
 *   is_read: true,
 *   read_at: "2026-10-17T15:59:11.586174+05:30",
 *   created_at: "2026-10-17T15:56:36.805597+05:30"
 * }
 */
export const normalizeNotification = (item) => {
  if (!item) return null;
  const id = item.id;
  const title = item.title || 'Notification';
  const message = item.message || '';
  const rawModule = (item.module || 'SYSTEM').toUpperCase();
  const notificationType = (item.notification_type || 'INFO').toUpperCase();
  const objectId = item.object_id ?? null;
  const isRead = Boolean(item.is_read === true || item.is_read === 'true' || item.is_read === 1);
  const readAt = item.read_at || null;
  const createdAt = item.created_at || new Date().toISOString();

  // Navigation targets based on module
  let targetRoute = '';
  let actionLabel = 'View Details';
  if (rawModule === 'FINANCE') {
    targetRoute = '/finance/dailysales';
    actionLabel = 'View Daily Sales';
  } else if (rawModule === 'EMPLOYEES') {
    targetRoute = '/hr/employees';
    actionLabel = 'View Employees';
  } else if (rawModule === 'ADVANCE') {
    targetRoute = '/payroll/advances';
    actionLabel = 'View Advances';
  } else if (rawModule === 'ATTENDANCE') {
    targetRoute = '/attendance/dailyattendance';
    actionLabel = 'View Attendance';
  } else if (rawModule === 'INVENTORY') {
    targetRoute = '/inventory/stock';
    actionLabel = 'View Inventory';
  }

  return {
    ...item,
    id,
    title,
    message,
    module: rawModule,
    category: rawModule,
    notification_type: notificationType,
    object_id: objectId,
    is_read: isRead,
    read_at: readAt,
    created_at: createdAt,
    target_route: targetRoute,
    action_label: actionLabel
  };
};

export const notificationService = {
  /**
   * Fetch paginated notifications with module filtering
   * GET /notifications/?module=EMPLOYEES or ADVANCE or ATTENDANCE or INVENTORY or FINANCE
   */
  fetchNotifications: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const params = {};
      if (page) params.page = page;
      if (pageSize) params.page_size = pageSize;

      // Module filter: EMPLOYEES, ADVANCE, ATTENDANCE, INVENTORY, FINANCE
      if (filters.module && filters.module !== 'ALL') {
        params.module = filters.module;
      }
      if (filters.is_read !== undefined && filters.is_read !== 'ALL') {
        params.is_read = filters.is_read;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      const response = await axiosInstance.get('/notifications/', { params });
      const data = response?.data;

      let rawList = [];
      let count = 0;
      let next = null;
      let previous = null;

      if (data) {
        if (Array.isArray(data.results)) {
          rawList = data.results;
          count = data.count ?? data.results.length;
          next = data.next || null;
          previous = data.previous || null;
        } else if (Array.isArray(data)) {
          rawList = data;
          count = data.length;
        } else if (Array.isArray(data.data)) {
          rawList = data.data;
          count = data.count ?? data.data.length;
        }
      }

      const results = rawList.map(normalizeNotification);

      return {
        count,
        next,
        previous,
        results
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

  /**
   * Fetch total count of all notifications without filters
   */
  fetchAllCount: async () => {
    try {
      const response = await axiosInstance.get('/notifications/');
      const data = response?.data;
      if (data?.count !== undefined) return data.count;
      if (Array.isArray(data?.results)) return data.results.length;
      if (Array.isArray(data)) return data.length;
      return 0;
    } catch (error) {
      console.error('Error fetching all notifications count:', error);
      return 0;
    }
  },

  /**
   * Get single notification by ID
   * GET /notifications/:id/
   */
  getNotificationById: async (id) => {
    try {
      const response = await axiosInstance.get(`/notifications/${id}/`);
      return normalizeNotification(response?.data);
    } catch (error) {
      console.error(`Error fetching notification ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark a single notification as read
   * POST /notifications/:id/mark-read/
   * Response: { "message": "Notification marked as read." }
   */
  markAsRead: async (id) => {
    try {
      const cleanId = String(id).trim();
      const response = await axiosInstance.post(`/notifications/${cleanId}/mark-read/`, {});
      return {
        success: true,
        id: cleanId,
        message: response?.data?.message || 'Notification marked as read.'
      };
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all unread notifications as read
   * POST /notifications/mark-all-read/
   * Response: { "message": "All notifications marked as read.", "updated_count": 0 }
   */
  markAllAsRead: async () => {
    try {
      let response;
      try {
        response = await axiosInstance.post('/notifications/mark-all-read/');
      } catch (err1) {
        try {
          response = await axiosInstance.post('/notifications/mark_all_read/');
        } catch (err2) {
          response = await axiosInstance.post('/notifications/mark-all-read');
        }
      }
      const message = response?.data?.message || 'All notifications marked as read.';
      toast.success(message);
      return { success: true, message };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all as read');
      throw error;
    }
  },

  /**
   * Get unread count
   * GET /notifications/unread-count/
   * Response: { "unread_count": 0 }
   */
  getUnreadCount: async () => {
    try {
      let count = 0;
      try {
        const response = await axiosInstance.get('/notifications/unread-count/');
        if (response?.data?.unread_count !== undefined) {
          return response.data.unread_count;
        }
        if (response?.data?.count !== undefined) {
          return response.data.count;
        }
        if (typeof response?.data === 'number') {
          return response.data;
        }
      } catch (e1) {
        try {
          const response = await axiosInstance.get('/notifications/unread_count/');
          if (response?.data?.unread_count !== undefined) {
            return response.data.unread_count;
          }
          if (response?.data?.count !== undefined) {
            return response.data.count;
          }
        } catch (e2) {
          // fallback query
          const response = await axiosInstance.get('/notifications/', { params: { is_read: false } });
          if (response?.data?.count !== undefined) {
            return response.data.count;
          }
          if (Array.isArray(response?.data?.results)) {
            return response.data.results.length;
          }
        }
      }
      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
};
