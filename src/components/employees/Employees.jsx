import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  IoAddOutline, 
  IoWarningOutline, 
  IoChevronBackOutline, 
  IoChevronForwardOutline 
} from 'react-icons/io5';

import { getEmployees, createEmployee, patchEmployee, updateEmployee } from '../../api/employees.api';
import api from '../../config/axios';

import EmployeeTable from './EmployeeTable';
import EmployeeFilters from './EmployeeFilters';
import EmployeeFormModal from './EmployeeFormModal';
import EmployeeDetailsDrawer from './EmployeeDetailsDrawer';
import ConfirmDialog from './ConfirmDialog';

const Employees = () => {
  // State
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [filters, setFilters] = useState({ branchId: 'All', status: 'All', search: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(employees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = employees.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const emptyRowsCount = ITEMS_PER_PAGE - paginatedEmployees.length;

  // Modals / Drawers State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    employee: null,
    action: null, // 'activate' | 'deactivate'
    isProcessing: false
  });

  // Fetch Data
  const fetchEmployees = useCallback(async (currentFilters) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const data = await getEmployees(currentFilters);
      setEmployees(data);
    } catch (err) {
      setApiError(err.message || 'Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees(filters);
  }, [filters, fetchEmployees]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches/');
        // Can filter for active branches if necessary, but here we just load them
        setBranches(res.data);
      } catch (err) {
        console.error('Failed to load branches', err);
      }
    };
    fetchBranches();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Orchestrator Actions
  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleAction = (action, employee) => {
    if (action === 'view') {
      setSelectedEmployee(employee);
      setIsDrawerOpen(true);
    } else if (action === 'edit') {
      setFormMode('edit');
      setSelectedEmployee(employee);
      setIsFormOpen(true);
    } else if (action === 'activate' || action === 'deactivate') {
      setConfirmDialog({
        isOpen: true,
        employee,
        action,
        isProcessing: false
      });
    }
  };

  const handleFormSubmit = async (payload) => {
    if (formMode === 'create') {
      await createEmployee(payload);
      toast.success('Employee added successfully');
    } else {
      // Create a patch payload with only changed fields (mock simplicity: send all payload fields)
      await patchEmployee(selectedEmployee.id, payload);
      toast.success('Employee updated successfully');
      
      // Update drawer if open
      if (isDrawerOpen && selectedEmployee) {
        setSelectedEmployee({ ...selectedEmployee, ...payload });
      }
    }
    setIsFormOpen(false);
    fetchEmployees(filters);
  };

  const handleConfirmStatusChange = async () => {
    const { employee, action } = confirmDialog;
    setConfirmDialog(prev => ({ ...prev, isProcessing: true }));
    
    try {
      const newStatus = action === 'activate';
      const branchId = typeof employee.branch === 'object' ? employee.branch?.id : employee.branch;
      
      const deptId = typeof employee.department === 'object' ? employee.department?.id : employee.department;

      const payload = {
        branch: branchId ? parseInt(branchId, 10) : 0,
        department: deptId ? parseInt(deptId, 10) : 0,
        name: employee.name || "",
        phone: employee.phone || "",
        address: employee.address || "",
        designation: employee.designation || "",
        salary_type: employee.salary_type || "MONTHLY",
        biweekly_salary: employee.biweekly_salary?.toString() || "",
        monthly_salary: employee.monthly_salary?.toString() || "",
        daily_wage: employee.daily_wage?.toString() || "",
        joining_date: employee.joining_date || new Date().toISOString().split('T')[0],
        is_active: newStatus
      };

      await updateEmployee(employee.id, payload);
      // TODO: confirm soft-delete vs hard-delete with backend. Currently soft-deleting via is_active PUT.
      
      toast.success(`Employee ${action}d successfully`);
      setConfirmDialog({ isOpen: false, employee: null, action: null, isProcessing: false });
      
      // Update drawer if open
      if (isDrawerOpen && selectedEmployee?.id === employee.id) {
        setSelectedEmployee(prev => ({ ...prev, is_active: newStatus }));
      }
      
      fetchEmployees(filters);
    } catch (err) {
      toast.error(`Failed to ${action} employee.`);
      setConfirmDialog(prev => ({ ...prev, isProcessing: false }));
    }
  };


  return (
    <div className="space-y-6 font-sans w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>HR</span> &gt; <span className="text-gray-700">Employees</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Employees Directory</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage staff members and personal information.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
        >
          <IoAddOutline size={18} /> Add Employee
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <EmployeeFilters 
          accessibleBranches={branches} 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {apiError && (
          <div className="p-6 bg-white border-b border-[#E7E8EE]">
            <div className="p-4 bg-[#C1443A]/10 border border-[#C1443A]/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-[#C1443A]">
                <IoWarningOutline size={24} />
                <span className="font-medium">{apiError}</span>
              </div>
              <button 
                onClick={() => fetchEmployees(filters)}
                className="px-4 py-1.5 bg-white text-[#C1443A] font-semibold rounded-lg border border-[#C1443A]/20 hover:bg-[#C1443A]/5 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <EmployeeTable 
          employees={paginatedEmployees} 
          isLoading={isLoading} 
          emptyRowsCount={emptyRowsCount}
          accessibleBranches={branches}
          onRowClick={(emp) => handleAction('view', emp)}
          onAction={handleAction} 
        />

        {/* Pagination Controls */}
        {employees.length > 0 && !isLoading && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 font-medium">
            <div>
              Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, employees.length)}</span> of{' '}
              <span className="font-bold text-gray-900">{employees.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <IoChevronBackOutline size={14} />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <IoChevronForwardOutline size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <EmployeeFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={formMode}
        employeeData={selectedEmployee}
        accessibleBranches={branches}
        onSubmit={handleFormSubmit}
      />

      <EmployeeDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        employee={selectedEmployee}
        onEdit={(emp) => handleAction('edit', emp)}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmStatusChange}
        title={confirmDialog.action === 'deactivate' ? 'Deactivate Employee?' : 'Activate Employee?'}
        message={
          confirmDialog.action === 'deactivate' 
            ? `Deactivate ${confirmDialog.employee?.name}? They will no longer appear in active employee lists, but their records are kept safely.` 
            : `Activate ${confirmDialog.employee?.name}? They will be reinstated as an active employee in the system.`
        }
        confirmText={confirmDialog.action === 'deactivate' ? 'Deactivate' : 'Activate'}
        isDestructive={confirmDialog.action === 'deactivate'}
        isProcessing={confirmDialog.isProcessing}
      />
    </div>
  );
};

export default Employees;
