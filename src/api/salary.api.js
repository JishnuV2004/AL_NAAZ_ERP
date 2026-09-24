import api from '../config/axios';

/**
 * GET /salary/
 * Fetches salary records from API
 */
export const getSalaries = async (params = {}) => {
  const response = await api.get('/salary/', { params });
  return response.data;
};

/**
 * GET /salary/:id/
 */
export const getSalaryById = async (id) => {
  const response = await api.get(`/salary/${id}/`);
  return response.data;
};

/**
 * POST /salary/
 */
export const createSalary = async (payload) => {
  const response = await api.post('/salary/', payload);
  return response.data;
};

/**
 * PUT /salary/:id/
 */
export const updateSalary = async (id, payload) => {
  const response = await api.put(`/salary/${id}/`, payload);
  return response.data;
};
