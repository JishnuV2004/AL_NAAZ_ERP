import api from '../config/axios';

/**
 * Fetch dashboard overview data with branch & period filters
 * GET /dashboard/?branch=1&period=month
 */
export const getDashboardSummary = async (params = {}) => {
  const query = {};
  if (params.branch && params.branch !== 'all') {
    query.branch = params.branch;
  }
  if (params.period && params.period !== 'all') {
    query.period = params.period;
  }
  const response = await api.get('/dashboard/', { params: query });
  return response.data;
};

/**
 * Fetch activity logs
 * GET /activity-logs/?page=1&page_size=10
 */
export const getActivityLogs = async (params = {}) => {
  const page = params.page || 1;
  const page_size = params.page_size || 10;
  const response = await api.get('/activity-logs/', {
    params: { ...params, page, page_size }
  });
  return response.data;
};
