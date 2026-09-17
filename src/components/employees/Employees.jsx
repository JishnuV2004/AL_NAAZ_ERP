import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { IoAddOutline, IoWarningOutline, IoSearchOutline } from 'react-icons/io5';

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
      
      const payload = {
        branch: branchId ? parseInt(branchId, 10) : 0,
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

  // Render Helpers
  const renderEmptyState = () => {
    if (isLoading || apiError) return null;

    const isFiltered = filters.branchId !== 'All' || filters.status !== 'All' || filters.search !== '';

    if (employees.length === 0) {
      if (isFiltered) {
        return (
          <div className="bg-white rounded-b-2xl p-12 flex flex-col items-center justify-center text-center border-t border-[#E7E8EE]">
            <div className="h-16 w-16 bg-[#F4F5F8] rounded-full flex items-center justify-center text-[#6B7280] mb-4">
              <IoSearchOutline size={32} />
            </div>
            <h3 className="text-[#1C1F2A] font-semibold text-lg mb-1">No employees match your filters</h3>
            <p className="text-[#6B7280] mb-6">Try adjusting your search or clearing the filters to see more results.</p>
            <button 
              onClick={() => setFilters({ branchId: 'All', status: 'All', search: '' })}
              className="px-4 py-2 bg-white text-[#1C1F2A] border border-[#E7E8EE] rounded-lg font-semibold hover:bg-[#F4F5F8] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        );
      } else {
        return (
          <div className="bg-white rounded-b-2xl p-16 flex flex-col items-center justify-center text-center border-t border-[#E7E8EE]">
            <div className="h-20 w-20 bg-[#F4F5F8] rounded-full flex items-center justify-center text-[#6B7280] mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="text-[#1C1F2A] font-semibold text-xl mb-2">No employees yet</h3>
            <p className="text-[#6B7280] mb-6 max-w-sm">Get started by adding your first employee to the system. You can manage their details, roles, and identity proofs here.</p>
            <button 
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#C9A227] text-white rounded-lg font-semibold hover:bg-[#B49122] transition-colors flex items-center gap-2"
            >
              <IoAddOutline size={20} /> Add Employee
            </button>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-4 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1F2A] tracking-tight">Employees Directory</h1>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">Manage staff members and personal information.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2 bg-[#C9A227] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-[#B49122] transition-colors shadow-xs cursor-pointer"
        >
          <IoAddOutline className="mr-1.5" size={18} /> Add Employee
        </button>
      </div>

      {/* Main Content Area */}
      <div className="shadow-sm rounded-2xl border border-[#E7E8EE]">
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
          onRowClick={(emp) => handleAction('view', emp)}
          onAction={handleAction} 
        />

        {/* Pagination Controls */}
        {employees.length > 0 && !isLoading && (
          <div className="p-4 bg-white rounded-b-2xl border-t border-[#E7E8EE] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#6B7280]">
              Showing <span className="font-medium text-[#1C1F2A]">{startIndex + 1}</span> to <span className="font-medium text-[#1C1F2A]">{Math.min(startIndex + ITEMS_PER_PAGE, employees.length)}</span> of <span className="font-medium text-[#1C1F2A]">{employees.length}</span> employees
            </p>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-[#E7E8EE] rounded-lg text-sm font-medium text-[#4B5563] hover:bg-[#F4F5F8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  // Simple pagination: show first, last, and current +/- 1. For simplicity, just show all if < 7 pages.
                  if (totalPages > 7) {
                    if (idx !== 0 && idx !== totalPages - 1 && Math.abs(currentPage - 1 - idx) > 1) {
                      if (Math.abs(currentPage - 1 - idx) === 2) return <span key={idx} className="px-2 text-gray-400">...</span>;
                      return null;
                    }
                  }
                  
                  return (
                    <button 
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === idx + 1 
                          ? 'bg-[#1C1F2A] text-white' 
                          : 'text-[#4B5563] hover:bg-[#F4F5F8]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-[#E7E8EE] rounded-lg text-sm font-medium text-[#4B5563] hover:bg-[#F4F5F8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {renderEmptyState()}
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
