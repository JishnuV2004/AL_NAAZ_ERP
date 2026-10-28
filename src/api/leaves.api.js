import api from '../config/axios';

/**
 * Fetch leave records from backend API
 * GET /attendance/leaves/
 * Supported query params:
 * - branch (integer)
 * - employee (integer)
 * - start_date (YYYY-MM-DD)
 * - end_date (YYYY-MM-DD)
 * - is_paid (boolean: true | false)
 * - month (integer: 1-12)
 * - year (integer)
 * - search (string)
 */
export const getLeaves = async (filters = {}) => {
  const params = {};

  if (filters.branch && filters.branch !== 'All') {
    params.branch = parseInt(filters.branch, 10);
  }

  if (filters.employee && filters.employee !== 'All') {
    params.employee = parseInt(filters.employee, 10);
  }

  if (filters.start_date) {
    params.start_date = filters.start_date;
  }

  if (filters.end_date) {
    params.end_date = filters.end_date;
  }

  if (filters.is_paid !== undefined && filters.is_paid !== null && filters.is_paid !== 'All' && filters.is_paid !== '') {
    params.is_paid = filters.is_paid === true || filters.is_paid === 'true';
  }

  if (filters.month && filters.month !== 'All') {
    params.month = parseInt(filters.month, 10);
  }

  if (filters.year && filters.year !== 'All') {
    params.year = parseInt(filters.year, 10);
  }

  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  const response = await api.get('/attendance/leaves/', { params });
  return response.data;
};

/**
 * Create a new leave record
 * POST /attendance/leaves/
 */
export const createLeave = async (payload) => {
  const response = await api.post('/attendance/leaves/', payload);
  return response.data;
};

/**
 * Delete a leave record
 * DELETE /attendance/leaves/:id/
 */
export const deleteLeave = async (id) => {
  const response = await api.delete(`/attendance/leaves/${id}/`);
  return response.data;
};
