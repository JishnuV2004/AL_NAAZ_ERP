import axiosInstance from '../config/axios';

// Normalize item object to ensure consistent access across the app
export const normalizeItem = (raw) => {
  if (!raw) return null;
  const statusStr = String(raw.approval_status || raw.status || 'PENDING_MANAGER').toUpperCase();

  return {
    ...raw,
    id: raw.id,
    employee: raw.employee,
    employee_name: raw.employee_name || raw.employee || 'Unknown Employee',
    item_name: raw.item_name || raw.item || 'Item',
    quantity: Number(raw.quantity) || 1,
    unit_value: raw.unit_value !== undefined ? String(raw.unit_value) : '0.00',
    employee_payable: raw.employee_payable !== undefined ? String(raw.employee_payable) : '0.00',
    issued_date: raw.issued_date || (raw.created_at ? raw.created_at.split('T')[0] : ''),
    issued_by: raw.issued_by,
    issued_by_name: raw.issued_by_name || 'Admin',
    approval_status: statusStr,
    manager_approved_by: raw.manager_approved_by,
    manager_approved_by_name: raw.manager_approved_by_name,
    manager_approved_at: raw.manager_approved_at,
    admin_approved_by: raw.admin_approved_by,
    admin_approved_by_name: raw.admin_approved_by_name,
    admin_approved_at: raw.admin_approved_at,
    rejection_reason: raw.rejection_reason || '',
    notes: raw.notes || '—',
    payments: Array.isArray(raw.payments) ? raw.payments : [],
    total_paid: Number(raw.total_paid || 0),
    outstanding_balance: Number(raw.outstanding_balance || 0),
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString()
  };
};

export const parseApiErrorMessage = (error, defaultMsg = 'An error occurred') => {
  if (!error) return defaultMsg;
  const data = error.response?.data;
  if (!data) return error.message || defaultMsg;

  if (typeof data === 'string') return data;

  if (Array.isArray(data)) {
    return data.join(', ');
  }

  if (typeof data === 'object') {
    if (data.detail && typeof data.detail === 'string') return data.detail;
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.error && typeof data.error === 'string') return data.error;

    // Collect all field error arrays, e.g. { rejected_by: ["The issuing user cannot reject their own item."] }
    // or { amount: ["Payment exceeds the outstanding balance of 0.00."] }
    const messages = [];
    for (const [key, val] of Object.entries(data)) {
      if (Array.isArray(val)) {
        messages.push(val.join(', '));
      } else if (typeof val === 'string') {
        messages.push(val);
      } else if (typeof val === 'object' && val !== null) {
        messages.push(Object.values(val).flat().join(', '));
      }
    }
    if (messages.length > 0) {
      return messages.join(' | ');
    }
  }

  return error.message || defaultMsg;
};

export const clearanceService = {
  // Fetch list of clearance items: GET /clearance/items/
  getItems: async () => {
    try {
      const response = await axiosInstance.get('/clearance/items/');
      const data = response?.data;
      if (Array.isArray(data)) {
        return data.map(normalizeItem);
      } else if (data && Array.isArray(data.results)) {
        return data.results.map(normalizeItem);
      }
      return [];
    } catch (err) {
      console.warn('Clearance items API call failed:', err.message);
      return [];
    }
  },

  // Fetch single clearance item by ID: GET /clearance/items/:id/
  getItemById: async (id) => {
    try {
      const response = await axiosInstance.get(`/clearance/items/${id}/`);
      if (response && response.data) {
        return normalizeItem(response.data);
      }
      return null;
    } catch (err) {
      console.warn(`Direct fetch for clearance item ${id} failed:`, err.message);
      return null;
    }
  },

  // Add new clearance item: POST /clearance/items/
  addItem: async (newItemData) => {
    const payload = {
      employee: parseInt(newItemData.employee, 10),
      item_name: String(newItemData.item_name || newItemData.item || '').trim(),
      quantity: parseInt(newItemData.quantity, 10) || 1,
      unit_value: String(newItemData.unit_value !== undefined ? newItemData.unit_value : (newItemData.unitValue || '0')),
      employee_payable: String(
        newItemData.employee_payable !== undefined && newItemData.employee_payable !== ''
          ? newItemData.employee_payable
          : newItemData.payable !== undefined && newItemData.payable !== ''
          ? newItemData.payable
          : newItemData.unit_value || newItemData.unitValue || '0'
      ),
      issued_date: newItemData.issued_date || newItemData.issuedDateIso || new Date().toISOString().split('T')[0],
      notes: newItemData.notes !== undefined ? String(newItemData.notes).trim() : ''
    };

    try {
      const response = await axiosInstance.post('/clearance/items/', payload);
      if (response && response.data) {
        return normalizeItem(response.data);
      }
      throw new Error('No data returned by server');
    } catch (err) {
      console.warn('Clearance items POST API failed:', err.response?.data || err.message);
      const errMsg = parseApiErrorMessage(err, 'Failed to issue clearance item');
      throw new Error(errMsg);
    }
  },

  // Record payment: POST /clearance/payments/
  recordPayment: async (paymentData) => {
    const itemId = paymentData.issued_item || paymentData.itemId;
    const payload = {
      issued_item: Number(itemId),
      amount: String(paymentData.amount),
      payment_method: String(paymentData.payment_method || paymentData.method || 'CASH').toUpperCase(),
      payment_date: paymentData.payment_date || paymentData.paymentDateIso || new Date().toISOString().split('T')[0],
      reference: paymentData.reference !== undefined ? String(paymentData.reference) : '',
      notes: paymentData.notes !== undefined ? String(paymentData.notes) : ''
    };

    try {
      const response = await axiosInstance.post('/clearance/payments/', payload);
      if (response && response.data) {
        return response.data;
      }
      throw new Error('No data returned by server');
    } catch (err) {
      console.warn('Clearance payments POST API failed:', err.response?.data || err.message);
      const errMsg = parseApiErrorMessage(err, 'Failed to record payment');
      throw new Error(errMsg);
    }
  },

  addPayment: async (paymentData) => {
    return clearanceService.recordPayment(paymentData);
  },

  // Manager Approve: POST /clearance/items/:id/approve-manager/
  approveManager: async (itemId) => {
    try {
      const response = await axiosInstance.post(`/clearance/items/${itemId}/approve-manager/`);
      if (response && response.data) {
        return normalizeItem(response.data);
      }
      throw new Error('No data returned by server');
    } catch (err) {
      console.warn('Approve manager API failed:', err.response?.data || err.message);
      const errMsg = parseApiErrorMessage(err, 'Manager approval failed');
      throw new Error(errMsg);
    }
  },

  // Admin Approve: POST /clearance/items/:id/approve-admin/
  approveAdmin: async (itemId) => {
    try {
      const response = await axiosInstance.post(`/clearance/items/${itemId}/approve-admin/`);
      if (response && response.data) {
        return normalizeItem(response.data);
      }
      throw new Error('No data returned by server');
    } catch (err) {
      console.warn('Approve admin API failed:', err.response?.data || err.message);
      const errMsg = parseApiErrorMessage(err, 'Admin approval failed');
      throw new Error(errMsg);
    }
  },

  // Reject Item: POST /clearance/items/:id/reject/
  rejectItem: async (itemId, reason = '', stage = 'MANAGER') => {
    const payload = {
      rejection_reason: String(reason || '').trim(),
      stage: String(stage || 'MANAGER').toUpperCase()
    };
    try {
      const response = await axiosInstance.post(`/clearance/items/${itemId}/reject/`, payload);
      if (response && response.data) {
        return normalizeItem(response.data);
      }
      throw new Error('No data returned by server');
    } catch (err) {
      console.warn('Reject clearance item API failed:', err.response?.data || err.message);
      const errMsg = parseApiErrorMessage(err, 'Failed to reject clearance item');
      throw new Error(errMsg);
    }
  },

  // Update status dispatcher
  updateStatus: async (itemId, action, reason = '', stage = 'MANAGER') => {
    if (action === 'MANAGER_APPROVE' || action === 'APPROVE_MANAGER') {
      return clearanceService.approveManager(itemId);
    } else if (action === 'ADMIN_APPROVE' || action === 'APPROVE_ADMIN' || action === 'APPROVE') {
      return clearanceService.approveAdmin(itemId);
    } else if (action === 'REJECT') {
      return clearanceService.rejectItem(itemId, reason, stage);
    }
  },

  // Flat list of all payments: aggregated from items list
  getAllPayments: async (employeeFilter = 'All employees') => {
    try {
      const items = await clearanceService.getItems();
      const all = [];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          if (Array.isArray(item.payments)) {
            item.payments.forEach((p) => {
              all.push({
                ...p,
                itemId: item.id,
                itemName: item.item_name,
                employee: item.employee_name,
                employeeId: item.employee
              });
            });
          }
        });
      }

      if (employeeFilter && employeeFilter !== 'All employees') {
        return all.filter((p) => String(p.employee).toLowerCase() === String(employeeFilter).toLowerCase());
      }
      return all;
    } catch (err) {
      console.warn('Failed to load all payments:', err);
      return [];
    }
  }
};
