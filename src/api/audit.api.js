import api from '../config/axios';

/**
 * Fetch activity logs with pagination and optional filters
 * GET /activity-logs/?page=1&page_size=10
 */
export const getActivityLogs = async (params = {}) => {
  const response = await api.get('/activity-logs/', { params });
  return response.data;
};

/**
 * Fetch single activity log detail by ID
 * GET /activity-logs/:id/
 */
export const getActivityLogById = async (id) => {
  const response = await api.get(`/activity-logs/${id}/`);
  return response.data;
};
