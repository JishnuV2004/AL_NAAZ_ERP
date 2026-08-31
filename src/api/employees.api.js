import { employeesMock } from '../mocks/employees.mock';

// In-memory state for the mock API to mutate
let employees = [...employeesMock];

// Set to true to simulate API failures
export const __forceError = false;

// Helper to simulate network latency
const delay = () => {
  const ms = Math.floor(Math.random() * 500) + 300; // 300-800ms
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getEmployees = async ({ branchId, status, search } = {}) => {
  await delay();
  if (__forceError) throw new Error('Failed to fetch employees. Please try again.');

  return employees.filter(emp => {
    let matches = true;

    if (branchId && branchId !== 'All') {
      matches = matches && emp.branch.id === parseInt(branchId, 10);
    }
    
    if (status && status !== 'All') {
      if (status === 'Active') matches = matches && emp.is_active === true;
      if (status === 'Inactive') matches = matches && emp.is_active === false;
    }
    
    if (search) {
      const q = search.toLowerCase();
      matches = matches && (
        emp.name.toLowerCase().includes(q) ||
        emp.phone.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q)
      );
    }
    
    return matches;
  });
};

export const getEmployee = async (id) => {
  await delay();
  if (__forceError) throw new Error('Failed to fetch employee details.');
  
  const emp = employees.find(e => e.id === id);
  if (!emp) throw new Error('Employee not found');
  return emp;
};

export const createEmployee = async (payload) => {
  await delay();
  if (__forceError) throw new Error('Failed to create employee. Please try again.');

  const newEmployee = {
    ...payload,
    id: Math.max(...employees.map(e => e.id), 0) + 1,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  employees.unshift(newEmployee);
  return newEmployee;
};

export const updateEmployee = async (id, payload) => {
  await delay();
  if (__forceError) throw new Error('Failed to update employee.');

  const index = employees.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Employee not found');

  const updated = {
    ...payload,
    id, // ensure ID cannot be mutated
    updated_at: new Date().toISOString()
  };
  
  employees[index] = updated;
  return updated;
};

export const patchEmployee = async (id, partialPayload) => {
  await delay();
  if (__forceError) throw new Error('Failed to update employee.');

  const index = employees.findIndex(e => e.id === id);
  if (index === -1) throw new Error('Employee not found');

  const updated = {
    ...employees[index],
    ...partialPayload,
    updated_at: new Date().toISOString()
  };
  
  employees[index] = updated;
  return updated;
};

export const deleteEmployee = async (id) => {
  await delay();
  if (__forceError) throw new Error('Failed to delete employee.');

  const initialLength = employees.length;
  employees = employees.filter(e => e.id !== id);
  
  if (employees.length === initialLength) {
    throw new Error('Employee not found');
  }
  
  return { success: true };
};
