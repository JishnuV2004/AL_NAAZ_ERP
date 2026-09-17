import api from '../config/axios';

/**
 * Normalizes backend user API object into frontend UI structure
 */
export const normalizeUser = (u) => {
  if (!u) return null;

  // Determine display name
  const name =
    u.username && u.username.trim()
      ? u.username
      : u.name && u.name.trim()
      ? u.name
      : u.email && u.email.trim()
      ? u.email.split('@')[0]
      : `User #${u.id}`;

  const email = u.email && u.email.trim() ? u.email : 'No email provided';
  const phone = u.phone && u.phone.trim() ? u.phone : 'N/A';

  // Role formatting: "STAFF" -> "Staff", "MANAGER" -> "Branch Manager", etc.
  let roleDisplay = u.role || 'Staff';
  if (u.role === 'STAFF') roleDisplay = 'Staff';
  else if (u.role === 'MANAGER') roleDisplay = 'Branch Manager';
  else if (u.role === 'SUPERADMIN' || u.role === 'SUPER_ADMIN') roleDisplay = 'Super Admin';
  else if (u.role === 'CASHIER') roleDisplay = 'Cashier';
  else if (u.role === 'KITCHEN') roleDisplay = 'Kitchen Staff';

  // Branches formatting
  const branchList = Array.isArray(u.branches)
    ? u.branches.map((b) => (typeof b === 'object' ? b.name : b))
    : u.branch
    ? [u.branch]
    : [];

  const primaryBranch = branchList.length > 0 ? branchList[0] : 'All Branches';

  // Status formatting
  const status = u.is_active === false ? 'Suspended' : u.status || 'Active';

  // Avatar initial
  const avatar = name.charAt(0).toUpperCase() || 'U';

  // Date formatting
  let createdAt = u.created_at || u.createdAt || '';
  if (createdAt && createdAt.includes('T')) {
    createdAt = createdAt.split('T')[0];
  }

  return {
    id: u.id,
    name,
    username: u.username || name,
    email,
    phone,
    role: roleDisplay,
    rawRole: u.role || 'STAFF',
    branch: primaryBranch,
    branches: u.branches || [],
    assignedBranches: branchList.length > 0 ? branchList : ['All Branches'],
    status,
    is_active: u.is_active !== undefined ? u.is_active : true,
    lastLogin: u.last_login || u.lastLogin || 'Recently',
    avatar,
    createdAt: createdAt || '2026-08-07',
    activityLogs: u.activityLogs || [
      { id: 101, action: 'User logged in', timestamp: 'Today', ip: '192.168.1.1' }
    ],
    raw: u
  };
};

/**
 * Fetch all users from API: GET /users/users/
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/users/users/');
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeUser);
    }
    return [];
  } catch (error) {
    console.error('API /users/users/ failed:', error);
    throw error;
  }
};

/**
 * Get single user by ID: GET /users/users/:id/
 */
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/users/${id}/`);
    return response.data ? normalizeUser(response.data) : null;
  } catch (error) {
    console.error(`API GET /users/users/${id}/ failed:`, error);
    throw error;
  }
};

/**
 * Fetch branches from backend: GET /branches/
 */
export const getBranches = async () => {
  try {
    const response = await api.get('/branches/');
    return response.data;
  } catch (error) {
    console.warn('API GET /branches/ failed:', error);
    return [
      { id: 1, name: 'Al Naaz Kayamkulam', code: 'KYLM' },
      { id: 2, name: 'Al Naaz Kochi', code: 'KOCHI' }
    ];
  }
};

/**
 * Assign user to branch: POST /branches/:branchId/assign-user/
 * Input: { "user_id": <userId> }
 */
export const assignUserToBranch = async (branchId, userId) => {
  try {
    const response = await api.post(`/branches/${branchId}/assign-user/`, {
      user_id: Number(userId)
    });
    return response.data;
  } catch (error) {
    console.error(`API POST /branches/${branchId}/assign-user/ failed:`, error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Remove user from branch: POST /branches/:branchId/remove-user/
 * Input: { "user_id": <userId> }
 */
export const removeUserFromBranch = async (branchId, userId) => {
  try {
    const response = await api.post(`/branches/${branchId}/remove-user/`, {
      user_id: Number(userId)
    });
    return response.data;
  } catch (error) {
    console.error(`API POST /branches/${branchId}/remove-user/ failed:`, error?.response?.data || error.message);
    throw error;
  }
};

/**
 * Create user: POST /users/users/
 */
export const createUser = async (payload) => {
  try {
    const apiPayload = {
      username: payload.username || payload.name,
      password: payload.password || 'Alnaaz@123',
      email: payload.email,
      phone: payload.phone || '',
      role: (payload.role || 'STAFF').toUpperCase().replace(/\s+/g, '_')
    };
    const response = await api.post('/users/users/', apiPayload);
    return normalizeUser(response.data);
  } catch (error) {
    console.error('API POST /users/users/ failed:', error?.response?.data || error.message);
    // Rethrow to let caller component handle exact backend error response
    throw error;
  }
};

/**
 * Update user: PUT /users/users/:id/ or PATCH /users/users/:id/
 */
export const updateUser = async (id, payload) => {
  try {
    const apiPayload = {
      username: payload.username || payload.name,
      email: payload.email,
      phone: payload.phone,
      role: (payload.role || 'STAFF').toUpperCase().replace(/\s+/g, '_'),
      is_active: payload.status !== 'Suspended'
    };
    const response = await api.patch(`/users/users/${id}/`, apiPayload);
    return normalizeUser(response.data);
  } catch (error) {
    console.warn(`API PATCH /users/users/${id}/ failed:`, error);
    return normalizeUser({ id, ...payload });
  }
};

/**
 * Toggle user status (Active / Suspended): PATCH /users/users/:id/
 */
export const toggleUserStatus = async (id, currentIsActive) => {
  try {
    const response = await api.patch(`/users/users/${id}/`, {
      is_active: !currentIsActive
    });
    return normalizeUser(response.data);
  } catch (error) {
    console.warn(`API toggle status for user ${id} failed:`, error);
    return null;
  }
};

/**
 * Partial update user (e.g. branch authorization): PATCH /users/users/:id/
 */
export const patchUser = async (id, partialPayload) => {
  try {
    const response = await api.patch(`/users/users/${id}/`, partialPayload);
    return normalizeUser(response.data);
  } catch (error) {
    console.warn(`API PATCH /users/users/${id}/ failed:`, error);
    return null;
  }
};

/**
 * Delete user: DELETE /users/users/:id/
 */
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/users/${id}/`);
    return response.data || true;
  } catch (error) {
    console.error(`API DELETE /users/users/${id}/ failed:`, error?.response?.data || error.message);
    throw error;
  }
};
