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

/**
 * GET /salary/:id/payslip/
 * Downloads payslip file for a salary record
 */
export const downloadSalaryPayslip = async (salaryId) => {
  const cleanId = String(salaryId).replace(/\D/g, '') || salaryId;
  const response = await api.get(`/salary/${cleanId}/payslip/`, {
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header if available
  let filename = `payslip_${cleanId}.pdf`;
  const disposition = response.headers?.['content-disposition'];
  if (disposition && disposition.indexOf('filename=') !== -1) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  const contentType = response.headers?.['content-type'] || 'application/pdf';
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return { filename, blob };
};

