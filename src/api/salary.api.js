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

/**
 * POST /salary/generate/
 * Generates salary record for an employee
 * Input: { employee: number, month: number, year: number }
 */
export const generateSalary = async (payload) => {
  const response = await api.post('/salary/generate/', payload);
  return response.data;
};

/**
 * POST /salary/:id/pay/
 * Marks a salary record as paid
 */
export const paySalary = async (id) => {
  const response = await api.post(`/salary/${id}/pay/`);
  return response.data;
};

/**
 * GET /employees/:empId/salary-history/
 * Fetches salary history revisions for a specific employee
 */
export const getEmployeeSalaryHistory = async (empId) => {
  const cleanId = String(empId).replace(/\D/g, '') || empId;
  const response = await api.get(`/employees/${cleanId}/salary-history/`);
  return response.data;
};
