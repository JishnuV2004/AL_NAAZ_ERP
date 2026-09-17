import api from '../config/axios';

/**
 * Normalize department response object from backend API
 */
export const normalizeDepartment = (d) => {
  if (!d) return null;

  return {
    id: d.id,
    deptCode: `DEPT-${String(d.id).padStart(3, '0')}`,
    name: d.name || 'Unnamed Department',
    branchId: d.branch,
    branchName: d.branch_name || (d.branch === 1 ? 'Al Naaz Kayamkulam' : d.branch === 2 ? 'Al Naaz Kochi' : 'Main Branch'),
    is_active: d.is_active !== undefined ? d.is_active : true,
    status: d.is_active !== false ? 'Active' : 'Inactive',
    head: d.head || 'Unassigned',
    employeeCount: d.employee_count || d.employeeCount || 0,
    budget: d.budget || '100,000',
    description: d.description || `Handles ${d.name || 'department'} operations.`
  };
};

/**
 * Fetch departments: GET /departments/ or GET /departments/?branch=:branchId
 */
export const getDepartments = async (params = {}) => {
  try {
    const queryParams = {};
    let branchId = null;

    if (typeof params === 'object' && params !== null) {
      branchId = params.branch || params.branchId;
    } else {
      branchId = params;
    }

    if (branchId && branchId !== 'All') {
      queryParams.branch = branchId;
    }

    const response = await api.get('/departments/', { params: queryParams });
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeDepartment);
    }
    return [];
  } catch (error) {
    console.error('API GET /departments/ failed:', error);
    throw error;
  }
};

/**
 * Create department: POST /departments/
 */
export const createDepartment = async (payload) => {
  try {
    const apiPayload = {
      branch: parseInt(payload.branch || payload.branchId, 10),
      name: payload.name,
      is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true
    };
    const response = await api.post('/departments/', apiPayload);
    return normalizeDepartment(response.data);
  } catch (error) {
    console.error('API POST /departments/ failed:', error);
    throw error;
  }
};

/**
 * Update department: PATCH /departments/:id/
 */
export const updateDepartment = async (id, payload) => {
  try {
    const apiPayload = {
      branch: parseInt(payload.branch !== undefined ? payload.branch : (payload.branchId !== undefined ? payload.branchId : 0), 10),
      name: payload.name,
      is_active: payload.is_active !== undefined ? Boolean(payload.is_active) : true
    };
    const response = await api.patch(`/departments/${id}/`, apiPayload);
    return normalizeDepartment(response.data);
  } catch (error) {
    console.error(`API PATCH /departments/${id}/ failed:`, error);
    throw error;
  }
};

export const patchDepartment = updateDepartment;

/**
 * Delete department: DELETE /departments/:id/
 */
export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}/`);
    return response.data !== undefined ? response.data : true;
  } catch (error) {
    console.error(`API DELETE /departments/${id}/ failed:`, error);
    throw error;
  }
};
