import api from '../config/axios';

export const getEmployees = async ({ branchId, status, search } = {}) => {
  const response = await api.get('/employees/');
  let employees = response.data;
  
  if (branchId || status || search) {
    employees = employees.filter(emp => {
      let matches = true;

      if (branchId && branchId !== 'All') {
        // If branch is an object (mock) or an ID (real API)
        const empBranchId = typeof emp.branch === 'object' ? emp.branch?.id : emp.branch;
        matches = matches && empBranchId === parseInt(branchId, 10);
      }
      
      if (status && status !== 'All') {
        if (status === 'Active') matches = matches && emp.is_active === true;
        if (status === 'Inactive') matches = matches && emp.is_active === false;
      }
      
      if (search) {
        const q = search.toLowerCase();
        matches = matches && (
          (emp.name && emp.name.toLowerCase().includes(q)) ||
          (emp.phone && emp.phone.toLowerCase().includes(q)) ||
          (emp.designation && emp.designation.toLowerCase().includes(q))
        );
      }
      
      return matches;
    });
  }
  
  return employees;
};

export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}/`);
  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await api.post('/employees/', payload);
  return response.data;
};

export const updateEmployee = async (id, payload) => {
  const response = await api.put(`/employees/${id}/`, payload);
  return response.data;
};

export const patchEmployee = async (id, partialPayload) => {
  const response = await api.patch(`/employees/${id}/`, partialPayload);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employees/${id}/`);
  return response.data;
};

/**
 * Fetch department-based employees: GET /employees/?department=:departmentId
 */
export const getEmployeesByDepartment = async (departmentId) => {
  try {
    const response = await api.get(`/employees/?department=${departmentId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error(`API GET /employees/?department=${departmentId} failed:`, error);
    return [];
  }
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

