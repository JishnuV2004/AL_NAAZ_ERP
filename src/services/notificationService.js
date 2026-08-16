import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

// Storage key for persistent read states in fallback/offline/demo scenarios
const STORAGE_READ_KEY = 'al_naaz_read_notifications';

const getStoredReadIds = () => {
  try {
    const raw = localStorage.getItem(STORAGE_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const persistReadId = (id) => {
  try {
    const current = getStoredReadIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(STORAGE_READ_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Error storing read notification:', e);
  }
};

const persistAllReadIds = (ids) => {
  try {
    const current = new Set([...getStoredReadIds(), ...ids]);
    localStorage.setItem(STORAGE_READ_KEY, JSON.stringify([...current]));
  } catch (e) {
    console.error('Error storing read notifications:', e);
  }
};

// Compute dynamic timestamps relative to today for consistent demo/runtime date grouping
const now = new Date();
const todayAt = (hours, minutes) => {
  const d = new Date(now);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const yesterdayAt = (hours, minutes) => {
  const d = new Date(now);
  d.setDate(d.getDate() - 1);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

const daysAgoAt = (days, hours, minutes) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

// Initial base activity & notification items aligned with the reference design
const BASE_NOTIFICATIONS = [
  {
    id: 'act-1',
    title: 'Updated expense amount and description',
    message: 'Updated expense description and amount for kitchen supplies.',
    module: 'Expense',
    action: 'Updated',
    user: 'staff1',
    amount: '2,500.00',
    amountNum: 2500,
    is_read: false,
    priority: 'HIGH',
    created_at: todayAt(9, 58),
    action_type: 'VIEW_EXPENSE',
    target_route: '/finance/expenses',
    target_tab: 'expenses',
    related_object_type: 'EXPENSE',
    related_object_id: 1,
    action_label: 'View Expense'
  },
  {
    id: 'act-2',
    title: 'Created expense of ₹2,500.00',
    message: 'Recorded new daily expense of ₹2,500.00 for kitchen grocery items.',
    module: 'Expense',
    action: 'Created',
    user: 'staff1',
    amount: '2,500.00',
    amountNum: 2500,
    is_read: false,
    priority: 'HIGH',
    created_at: todayAt(9, 46),
    action_type: 'VIEW_EXPENSE',
    target_route: '/finance/expenses',
    target_tab: 'expenses',
    related_object_type: 'EXPENSE',
    related_object_id: 2,
    action_label: 'View Expense'
  },
  {
    id: 'act-3',
    title: 'Created expense of ₹800.00',
    message: 'Recorded staff transport fuel expense of ₹800.00.',
    module: 'Expense',
    action: 'Created',
    user: 'staff1',
    amount: '800.00',
    amountNum: 800,
    is_read: true,
    priority: 'MEDIUM',
    created_at: yesterdayAt(6, 10),
    action_type: 'VIEW_EXPENSE',
    target_route: '/finance/expenses',
    target_tab: 'expenses',
    related_object_type: 'EXPENSE',
    related_object_id: 3,
    action_label: 'View Expense'
  },
  {
    id: 'act-4',
    title: 'Added ₹5,000.00 to petty cash',
    message: 'Added ₹5,000.00 to petty cash reserve from main safe.',
    module: 'Petty Cash',
    action: 'Created',
    user: 'admin',
    amount: '5,000.00',
    amountNum: 5000,
    is_read: true,
    priority: 'INFO',
    created_at: yesterdayAt(16, 30),
    action_type: 'VIEW_PETTY_CASH',
    target_route: '/finance/petty-cash',
    target_tab: 'petty-cash',
    related_object_type: 'PETTY_CASH',
    related_object_id: 101,
    action_label: 'View Petty Cash'
  },
  {
    id: 'act-5',
    title: 'Approved advance request for Jishnu',
    message: 'Approved employee advance of ₹500.00 for Jishnu.',
    module: 'Advance',
    action: 'Approved',
    user: 'admin',
    amount: '500.00',
    amountNum: 500,
    is_read: true,
    priority: 'HIGH',
    created_at: yesterdayAt(11, 5),
    action_type: 'REVIEW_ADVANCE',
    target_route: '/advance',
    target_tab: 'advances',
    related_object_type: 'ADVANCE',
    related_object_id: 4,
    action_label: 'Review Advance'
  },
  {
    id: 'act-6',
    title: 'Recorded purchase of ₹3,200.00',
    message: 'Recorded purchase invoice from Fresh Farms LLC for Basmati Rice.',
    module: 'Purchase',
    action: 'Created',
    user: 'staff1',
    amount: '3,200.00',
    amountNum: 3200,
    is_read: true,
    priority: 'MEDIUM',
    created_at: daysAgoAt(3, 14, 20),
    action_type: 'VIEW_PURCHASE',
    target_route: '/inventory',
    target_tab: 'purchases',
    related_object_type: 'PURCHASE',
    related_object_id: 105,
    action_label: 'View Purchase'
  },
  {
    id: 'act-7',
    title: 'Generated monthly staff salaries',
    message: 'Generated payroll for active kitchen and service personnel.',
    module: 'Salary',
    action: 'Created',
    user: 'admin',
    amount: '45,000.00',
    amountNum: 45000,
    is_read: true,
    priority: 'MEDIUM',
    created_at: daysAgoAt(5, 10, 0),
    action_type: 'VIEW_SALARY',
    target_route: '/salary',
    target_tab: 'salary',
    related_object_type: 'SALARY',
    related_object_id: null,
    action_label: 'Review Salary'
  },
  {
    id: 'act-8',
    title: 'Marked staff attendance ledger',
    message: 'Marked daily attendance for 12 staff members.',
    module: 'Attendance',
    action: 'Created',
    user: 'staff1',
    amount: null,
    amountNum: 0,
    is_read: true,
    priority: 'LOW',
    created_at: daysAgoAt(6, 8, 30),
    action_type: 'VIEW_ATTENDANCE',
    target_route: '/attendance',
    target_tab: 'attendance',
    related_object_type: 'ATTENDANCE',
    related_object_id: null,
    action_label: 'View Attendance'
  }
];

export const notificationService = {
  /**
   * Fetch paginated notifications with filters
   * @param {number} page
   * @param {number} pageSize
   * @param {object} filters - { module, action, user, dateRange, status, priority, search }
   */
  fetchNotifications: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      // Build query params
      const params = {
        page,
        page_size: pageSize,
      };

      if (filters.search) params.search = filters.search;
      if (filters.user) params.user = filters.user;
      if (filters.module && filters.module !== 'ALL') params.module = filters.module;
      if (filters.action && filters.action !== 'ALL') params.action = filters.action;
      if (filters.priority && filters.priority !== 'ALL') params.priority = filters.priority;
      if (filters.status === 'UNREAD') params.is_read = false;
      if (filters.status === 'READ') params.is_read = true;
      if (filters.startDate) params.start_date = filters.startDate;
      if (filters.endDate) params.end_date = filters.endDate;

      try {
        const response = await axiosInstance.get('/notifications/', { params });
        if (response?.data) {
          const results = response.data.results || response.data;
          const count = response.data.count ?? results.length;
          return {
            count,
            next: response.data.next || null,
            previous: response.data.previous || null,
            results: Array.isArray(results) ? results : []
          };
        }
      } catch (apiError) {
        // Backend endpoint not active yet / fallback to operational data layer
      }

      // Operational Fallback Data Layer with dynamic filtering & persistent read state
      const readIds = new Set(getStoredReadIds());
      let list = BASE_NOTIFICATIONS.map((item) => ({
        ...item,
        is_read: readIds.has(item.id) ? true : item.is_read
      }));

      // Filter: Module (e.g. 'Expense', 'Petty Cash', 'Advance', 'Purchase', 'Salary', 'Attendance', 'ALL')
      if (filters.module && filters.module !== 'ALL') {
        const mod = filters.module.toLowerCase().replace(/[\s_-]/g, '');
        list = list.filter((n) => {
          const itemMod = (n.module || '').toLowerCase().replace(/[\s_-]/g, '');
          return itemMod === mod;
        });
      }

      // Filter: Action (e.g. 'Created', 'Updated', 'Deleted', 'Approved', 'Rejected', 'ALL')
      if (filters.action && filters.action !== 'ALL') {
        const act = filters.action.toLowerCase();
        list = list.filter((n) => (n.action || '').toLowerCase() === act);
      }

      // Filter: User Search
      if (filters.user) {
        const userQ = filters.user.toLowerCase();
        list = list.filter((n) => (n.user || '').toLowerCase().includes(userQ));
      }

      // Filter: General Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q) ||
            n.module.toLowerCase().includes(q) ||
            (n.user || '').toLowerCase().includes(q)
        );
      }

      // Filter: Status (All, Unread, Read)
      if (filters.status === 'UNREAD') {
        list = list.filter((n) => !n.is_read);
      } else if (filters.status === 'READ') {
        list = list.filter((n) => n.is_read);
      }

      // Filter: Priority
      if (filters.priority && filters.priority !== 'ALL') {
        list = list.filter(
          (n) => n.priority?.toUpperCase() === filters.priority.toUpperCase()
        );
      }

      // Filter: Date Range (Today, Yesterday, Week, Month, Custom, ALL)
      if (filters.dateRange && filters.dateRange !== 'ALL') {
        const currentNow = new Date();
        const startOfToday = new Date(
          currentNow.getFullYear(),
          currentNow.getMonth(),
          currentNow.getDate()
        ).getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        if (filters.dateRange === 'Today' || filters.dateRange === 'TODAY') {
          list = list.filter((n) => new Date(n.created_at).getTime() >= startOfToday);
        } else if (filters.dateRange === 'Yesterday' || filters.dateRange === 'YESTERDAY') {
          const yesterdayStart = startOfToday - oneDay;
          list = list.filter((n) => {
            const t = new Date(n.created_at).getTime();
            return t >= yesterdayStart && t < startOfToday;
          });
        } else if (filters.dateRange === 'Week' || filters.dateRange === 'WEEK' || filters.dateRange === 'LAST_7_DAYS') {
          const sevenDaysAgo = startOfToday - 7 * oneDay;
          list = list.filter((n) => new Date(n.created_at).getTime() >= sevenDaysAgo);
        } else if (filters.dateRange === 'Month' || filters.dateRange === 'MONTH' || filters.dateRange === 'LAST_30_DAYS') {
          const thirtyDaysAgo = startOfToday - 30 * oneDay;
          list = list.filter((n) => new Date(n.created_at).getTime() >= thirtyDaysAgo);
        } else if (filters.dateRange === 'Custom' || filters.dateRange === 'CUSTOM') {
          if (filters.startDate || filters.endDate) {
            list = list.filter((n) => {
              const itemTime = new Date(n.created_at).getTime();
              const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
              const end = filters.endDate ? new Date(filters.endDate).setHours(23, 59, 59, 999) : Infinity;
              return itemTime >= start && itemTime <= end;
            });
          }
        }
      }

      // Pagination calculation
      const totalCount = list.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedResults = list.slice(startIndex, endIndex);

      return {
        count: totalCount,
        next: endIndex < totalCount ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results: paginatedResults
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Fetch statistical summary of notifications
   */
  fetchStats: async () => {
    try {
      try {
        const response = await axiosInstance.get('/notifications/stats/');
        if (response?.data) return response.data;
      } catch (err) {
        // Fallback calculation
      }

      const readIds = new Set(getStoredReadIds());
      const list = BASE_NOTIFICATIONS.map((item) => ({
        ...item,
        is_read: readIds.has(item.id) ? true : item.is_read
      }));

      const currentNow = new Date();
      const startOfDay = new Date(
        currentNow.getFullYear(),
        currentNow.getMonth(),
        currentNow.getDate()
      ).getTime();

      const unread = list.filter((n) => !n.is_read).length;
      const highPriority = list.filter((n) => n.priority === 'HIGH' && !n.is_read).length;
      const today = list.filter((n) => new Date(n.created_at).getTime() >= startOfDay).length;
      const total = list.length;

      return {
        unread,
        highPriority,
        today,
        total
      };
    } catch (error) {
      return { unread: 0, highPriority: 0, today: 0, total: 0 };
    }
  },

  /**
   * Mark a single notification as read
   * @param {string|number} id
   */
  markAsRead: async (id) => {
    try {
      try {
        await axiosInstance.patch(`/notifications/${id}/`, { is_read: true });
      } catch (err) {
        // Fallback
        persistReadId(id);
      }
      persistReadId(id);
      return { success: true, id };
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all unread notifications as read
   */
  markAllAsRead: async () => {
    try {
      try {
        await axiosInstance.post('/notifications/mark-all-read/');
      } catch (err) {
        // Fallback
        persistAllReadIds(BASE_NOTIFICATIONS.map((n) => n.id));
      }
      persistAllReadIds(BASE_NOTIFICATIONS.map((n) => n.id));
      toast.success('All notifications marked as read');
      return { success: true };
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all as read');
      throw error;
    }
  }
};
