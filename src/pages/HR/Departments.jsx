import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoAddOutline, IoBusinessOutline, IoPeopleOutline, IoWalletOutline, 
  IoSettingsOutline, IoEllipsisVertical, IoPencilOutline, IoTrashOutline, 
  IoStorefrontOutline, IoRefreshOutline, IoAlertCircleOutline,
  IoChevronDownOutline, IoCheckmarkOutline, IoToggleOutline 
} from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments.api';
import { getBranches } from '../../api/users.api';
import { getEmployees } from '../../api/employees.api';
import toast from 'react-hot-toast';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  
  // Dropdown & Loading States
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isModalBranchDropdownOpen, setIsModalBranchDropdownOpen] = useState(false);
  const [togglingDeptId, setTogglingDeptId] = useState(null);
  const [deletingDeptId, setDeletingDeptId] = useState(null);

  // Delete Confirmation Popup State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    deptId: null,
    deptName: '',
    isDeleting: false
  });

  const [form, setForm] = useState({
    name: '',
    branchId: 1
  });

  const fetchData = async (branchFilter = selectedBranch) => {
    setLoading(true);
    setApiError(null);
    try {
      const [deptData, branchData, allEmployees] = await Promise.all([
        getDepartments(branchFilter !== 'All' ? { branch: branchFilter } : {}),
        getBranches(),
        getEmployees().catch(() => [])
      ]);

      const deptsWithCounts = (deptData || []).map(dept => {
        const empCount = (allEmployees || []).filter(emp => {
          const empDeptId = typeof emp.department === 'object' ? emp.department?.id : emp.department;
          return String(empDeptId) === String(dept.id);
        }).length;
        return {
          ...dept,
          employeeCount: empCount > 0 ? empCount : (dept.employeeCount || 0)
        };
      });

      setDepartments(deptsWithCounts);
      setBranches(branchData || []);
      if (branchData && branchData.length > 0) {
        setForm(prev => ({ ...prev, branchId: branchData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      setApiError(err.message || 'Failed to connect to department service');
      toast.error('Failed to load departments from API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedBranch);
  }, [selectedBranch]);

  const selectedBranchName = selectedBranch === 'All'
    ? 'All Branches'
    : (branches.find(b => String(b.id) === String(selectedBranch))?.name || 'Selected Branch');

  // Filter departments synchronously by selected branch to prevent flash of irrelevant data
  const filteredDepartments = departments.filter(d => {
    if (selectedBranch === 'All') return true;
    return String(d.branchId) === String(selectedBranch) || d.branchName === selectedBranchName;
  });

  const stats = {
    total: filteredDepartments.length,
    active: filteredDepartments.filter(d => d.status === 'Active' || d.is_active).length,
    totalEmployees: filteredDepartments.reduce((acc, curr) => acc + (parseInt(curr.employeeCount) || 0), 0),
  };

  const handleOpenCreate = () => {
    const defaultBranchId = branches.length > 0 ? branches[0].id : 1;
    setForm({ 
      name: '', 
      branchId: selectedBranch !== 'All' ? parseInt(selectedBranch, 10) : defaultBranchId
    });
    setModalMode('create');
    setIsModalOpen(true);
    setOpenDropdownId(null);
    setIsBranchDropdownOpen(false);
    setIsModalBranchDropdownOpen(false);
  };

  const handleOpenEdit = (dept) => {
    setForm({
      name: dept.name,
      branchId: dept.branchId || (branches.length > 0 ? branches[0].id : 1)
    });
    setSelectedDeptId(dept.id);
    setModalMode('edit');
    setIsModalOpen(true);
    setOpenDropdownId(null);
    setIsBranchDropdownOpen(false);
    setIsModalBranchDropdownOpen(false);
  };

  const handleToggleStatus = async (dept) => {
    const isCurrentActive = dept.is_active !== undefined ? dept.is_active : dept.status === 'Active';
    const newActiveState = !isCurrentActive;
    const actionLabel = newActiveState ? 'activated' : 'deactivated';
    
    setOpenDropdownId(null);
    setTogglingDeptId(dept.id);

    // Optimistically update status badge so UI updates immediately
    setDepartments(prev => prev.map(d => {
      if (d.id === dept.id) {
        return {
          ...d,
          is_active: newActiveState,
          status: newActiveState ? 'Active' : 'Inactive'
        };
      }
      return d;
    }));

    const toastId = toast.loading(`Updating status for "${dept.name}"...`);

    try {
      await updateDepartment(dept.id, {
        branch: dept.branchId || dept.branch,
        name: dept.name,
        is_active: newActiveState
      });
      toast.dismiss(toastId);
      toast.success(`Department "${dept.name}" ${actionLabel} successfully`);
      fetchData(selectedBranch);
    } catch (err) {
      console.error('Failed to update department status:', err);
      // Revert optimistic update on error
      setDepartments(prev => prev.map(d => {
        if (d.id === dept.id) {
          return {
            ...d,
            is_active: isCurrentActive,
            status: isCurrentActive ? 'Active' : 'Inactive'
          };
        }
        return d;
      }));
      toast.dismiss(toastId);
      toast.error(`Failed to update status for "${dept.name}"`);
    } finally {
      setTogglingDeptId(null);
    }
  };

  const handleOpenDeleteModal = (id, name) => {
    setOpenDropdownId(null);
    setDeleteConfirm({
      isOpen: true,
      deptId: id,
      deptName: name,
      isDeleting: false
    });
  };

  const handleConfirmDelete = async () => {
    const { deptId, deptName } = deleteConfirm;
    if (!deptId) return;

    setDeleteConfirm(prev => ({ ...prev, isDeleting: true }));
    setDeletingDeptId(deptId);

    // Optimistically remove from state for immediate UI feedback
    setDepartments(prev => prev.filter(d => d.id !== deptId));
    const toastId = toast.loading(`Deleting department "${deptName}"...`);

    try {
      await deleteDepartment(deptId);
      toast.dismiss(toastId);
      toast.success(`Department "${deptName}" deleted successfully`);
      fetchData(selectedBranch);
      setDeleteConfirm({ isOpen: false, deptId: null, deptName: '', isDeleting: false });
    } catch (err) {
      console.error('Delete department error:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to delete department';
      toast.dismiss(toastId);
      toast.error(`Delete failed: ${errorMsg}`);
      fetchData(selectedBranch);
      setDeleteConfirm(prev => ({ ...prev, isDeleting: false }));
    } finally {
      setDeletingDeptId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter department name');
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        const created = await createDepartment(form);
        fetchData(selectedBranch);
        toast.success(`Department "${created.name}" created successfully`);
      } else {
        const existingDept = departments.find(d => String(d.id) === String(selectedDeptId));
        const currentActive = existingDept ? (existingDept.is_active !== undefined ? existingDept.is_active : existingDept.status === 'Active') : true;

        const updated = await updateDepartment(selectedDeptId, {
          branch: form.branchId,
          name: form.name,
          is_active: currentActive
        });
        fetchData(selectedBranch);
        toast.success(`Department "${updated.name}" updated successfully`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Department submit error:', err);
      const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || err.message || 'Operation failed';
      toast.error(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="space-y-8 pb-12 font-sans" 
      onClick={() => {
        setOpenDropdownId(null);
        setIsBranchDropdownOpen(false);
        setIsModalBranchDropdownOpen(false);
      }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage organizational structure, branches, and department units.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Custom Branch Selection Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownId(null);
                setIsBranchDropdownOpen(!isBranchDropdownOpen);
              }}
              className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-xs hover:border-[#1E5E45] transition-all text-sm font-medium text-gray-800 cursor-pointer"
            >
              <IoStorefrontOutline className="text-[#1E5E45]" size={18} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Branch:</span>
              <span className="text-gray-900 font-bold">{selectedBranchName}</span>
              <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180' : ''}`} size={16} />
            </button>

            {isBranchDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30 font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                  Select Branch
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    setSelectedBranch('All');
                    setIsBranchDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedBranch === 'All'
                      ? 'bg-[#1E5E45]/10 text-[#1E5E45]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>All Branches</span>
                  {selectedBranch === 'All' && <IoCheckmarkOutline size={18} className="text-[#1E5E45]" />}
                </button>
                {branches.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      setSelectedBranch(String(b.id));
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      String(selectedBranch) === String(b.id)
                        ? 'bg-[#1E5E45]/10 text-[#1E5E45]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{b.name}</span>
                    {String(selectedBranch) === String(b.id) && <IoCheckmarkOutline size={18} className="text-[#1E5E45]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={handleOpenCreate}
            className="flex items-center justify-center px-4 py-2 bg-[#1E5E45] text-white rounded-xl hover:bg-[#154633] transition-colors shadow-md text-sm font-medium shrink-0"
          >
            <IoAddOutline className="mr-1.5" size={20} /> Add Department
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <IoBusinessOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Departments</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{stats.total}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">{selectedBranch === 'All' ? 'Across all branches' : `For ${selectedBranchName}`}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <IoSettingsOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Active Departments</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{stats.active}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Currently operational</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <IoPeopleOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Employees</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{stats.totalEmployees}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Active members in branch</p>
          </div>
        </div>
      </div>

      {/* Departments Grid or Skeleton / Error / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
                <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-md"></div>
              <div className="space-y-2 pt-2">
                <div className="h-4 w-3/4 bg-gray-100 rounded-md"></div>
                <div className="h-4 w-1/2 bg-gray-100 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      ) : apiError ? (
        <div className="py-16 text-center bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <IoAlertCircleOutline size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Failed to Load Departments</h3>
            <p className="text-xs text-gray-500 mt-1">{apiError}</p>
          </div>
          <button
            onClick={() => fetchData(selectedBranch)}
            className="px-4 py-2 bg-[#1E5E45] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 hover:bg-[#154633] transition-colors"
          >
            <IoRefreshOutline size={16} /> Retry Loading
          </button>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="py-16 text-center bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <IoStorefrontOutline size={26} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">No Departments Found</h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedBranch === 'All'
                ? 'No departments exist in the system database yet.'
                : `No departments registered for "${selectedBranchName}".`}
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-[#1E5E45] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 hover:bg-[#154633] transition-colors"
          >
            <IoAddOutline size={18} /> Add Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 truncate uppercase">{dept.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{dept.deptCode || `ID: #${dept.id}`}</p>
                </div>
                <div className="flex items-center gap-2 relative">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    togglingDeptId === dept.id
                      ? 'bg-amber-100 text-amber-700'
                      : (dept.status === 'Active' || dept.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')
                  }`}>
                    {togglingDeptId === dept.id && (
                      <span className="w-2.5 h-2.5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {togglingDeptId === dept.id 
                      ? 'Updating...' 
                      : (dept.status || (dept.is_active ? 'Active' : 'Inactive'))
                    }
                  </span>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === dept.id ? null : dept.id);
                    }}
                    className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    <IoEllipsisVertical />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openDropdownId === dept.id && (
                    <div className="absolute right-0 top-8 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => handleToggleStatus(dept)}
                        className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                          dept.is_active || dept.status === 'Active'
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-green-700 hover:bg-green-50'
                        }`}
                      >
                        <IoToggleOutline size={18} />
                        <span>{dept.is_active || dept.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(dept)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <IoPencilOutline size={16} /> Edit
                      </button>
                      <button 
                        onClick={() => handleOpenDeleteModal(dept.id, dept.name)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <IoTrashOutline size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 flex-1">
                <p className="text-sm text-gray-600 mb-6 line-clamp-2 h-10">
                  {dept.description || `Department handling ${dept.name} operations.`}
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><IoStorefrontOutline className="text-gray-400" /> Assigned Branch</span>
                    <span className="font-semibold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-md text-xs truncate max-w-[150px]">{dept.branchName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><IoPeopleOutline className="text-gray-400" /> Head of Dept</span>
                    <span className="font-medium text-gray-900 truncate max-w-[150px] text-right">{dept.head}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center gap-2"><IoPeopleOutline className="text-gray-400" /> Team Size</span>
                    <span className="font-medium text-gray-900">{dept.employeeCount} Members</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center mt-auto rounded-b-2xl">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/hr/departments/${dept.id}`); }}
                  className="text-sm font-bold text-[#1E5E45] hover:text-[#154633] transition-colors"
                >
                  View Details
                </button>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(dept.employeeCount || 1, 3))].map((_, i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsModalBranchDropdownOpen(false); }} title={modalMode === 'create' ? 'Add New Department' : 'Edit Department'} overflowVisible={true}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2 font-sans">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Department Name *</label>
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              placeholder="e.g. KITCHEN TEAM, SALES"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] text-sm text-gray-900 font-medium transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Assigned Branch *</label>
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalBranchDropdownOpen(!isModalBranchDropdownOpen);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E5E45]/20 focus:border-[#1E5E45] font-medium text-sm text-gray-900 cursor-pointer transition-all hover:border-[#1E5E45]"
              >
                <span className="flex items-center gap-2">
                  <IoStorefrontOutline className="text-[#1E5E45]" size={16} />
                  <span>
                    {branches.find(b => String(b.id) === String(form.branchId))?.name || 'Select Branch'}
                  </span>
                </span>
                <IoChevronDownOutline className={`text-gray-400 transition-transform duration-200 ${isModalBranchDropdownOpen ? 'rotate-180' : ''}`} size={16} />
              </button>

              {isModalBranchDropdownOpen && (
                <div 
                  className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-56 overflow-y-auto font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
                    Select Branch
                  </div>
                  {branches.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, branchId: b.id }));
                        setIsModalBranchDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        String(form.branchId) === String(b.id)
                          ? 'bg-[#1E5E45]/10 text-[#1E5E45]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <IoStorefrontOutline className={String(form.branchId) === String(b.id) ? 'text-[#1E5E45]' : 'text-gray-400'} size={16} />
                        <span>{b.name}</span>
                      </span>
                      {String(form.branchId) === String(b.id) && <IoCheckmarkOutline size={18} className="text-[#1E5E45]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => { setIsModalOpen(false); setIsModalBranchDropdownOpen(false); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E5E45] rounded-lg hover:bg-[#154633] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Department' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal Popup */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => !deleteConfirm.isDeleting && setDeleteConfirm({ isOpen: false, deptId: null, deptName: '', isDeleting: false })}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 font-sans animate-in fade-in zoom-in-95 duration-150 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <IoTrashOutline size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Department</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteConfirm.deptName}"</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                disabled={deleteConfirm.isDeleting}
                onClick={() => setDeleteConfirm({ isOpen: false, deptId: null, deptName: '', isDeleting: false })}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteConfirm.isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleteConfirm.isDeleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Department</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
