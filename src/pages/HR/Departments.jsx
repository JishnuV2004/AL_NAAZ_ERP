import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAddOutline, IoBusinessOutline, IoPeopleOutline, IoWalletOutline, IoSettingsOutline, IoEllipsisVertical, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

// Initial Dummy Data
const initialDepartments = [
  { id: 'DEPT-001', name: 'Kitchen & Culinary', head: 'John Doe', employeeCount: 15, budget: '150,000', status: 'Active', description: 'Handles all food preparation, cooking, and culinary operations.' },
  { id: 'DEPT-002', name: 'Customer Service', head: 'Sarah Ahmed', employeeCount: 12, budget: '90,000', status: 'Active', description: 'Front-of-house staff, waiting, and customer experience management.' },
  { id: 'DEPT-003', name: 'Management', head: 'Admin User', employeeCount: 4, budget: '200,000', status: 'Active', description: 'Branch management, HR, and overall operations overseeing.' },
  { id: 'DEPT-004', name: 'Logistics & Delivery', head: 'Mohammed Khan', employeeCount: 8, budget: '60,000', status: 'Active', description: 'Delivery drivers, supply chain, and vehicle maintenance.' },
  { id: 'DEPT-005', name: 'Maintenance', head: 'Unassigned', employeeCount: 2, budget: '25,000', status: 'Inactive', description: 'Facility upkeep, repair, and cleaning services.' },
];

const Departments = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const navigate = useNavigate();
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  
  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    head: '',
    budget: '',
    status: 'Active',
    description: ''
  });

  const stats = {
    total: departments.length,
    active: departments.filter(d => d.status === 'Active').length,
    totalEmployees: departments.reduce((acc, curr) => acc + (parseInt(curr.employeeCount) || 0), 0),
  };

  const handleOpenCreate = () => {
    setForm({ name: '', head: '', budget: '', status: 'Active', description: '' });
    setModalMode('create');
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleOpenEdit = (dept) => {
    setForm({
      name: dept.name,
      head: dept.head,
      budget: dept.budget,
      status: dept.status,
      description: dept.description
    });
    setSelectedDeptId(dept.id);
    setModalMode('edit');
    setIsModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success('Department deleted successfully');
    }
    setOpenDropdownId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.head) {
      toast.error('Please fill required fields');
      return;
    }

    if (modalMode === 'create') {
      const newDept = {
        ...form,
        id: `DEPT-00${departments.length + 1}`,
        employeeCount: 0 // Mock value for new
      };
      setDepartments([newDept, ...departments]);
      toast.success('Department created successfully');
    } else {
      setDepartments(prev => prev.map(d => 
        d.id === selectedDeptId ? { ...d, ...form } : d
      ));
      toast.success('Department updated successfully');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12" onClick={() => setOpenDropdownId(null)}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage organizational structure and departments.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center px-4 py-2 bg-[#1E5E45] text-white rounded-xl hover:bg-[#154633] transition-colors shadow-md"
        >
          <IoAddOutline className="mr-2" size={20} /> Add Department
        </button>
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
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">All departments</p>
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
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Across all departments</p>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible hover:shadow-md transition-shadow flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900 truncate">{dept.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{dept.id}</p>
              </div>
              <div className="flex items-center gap-2 relative">
                <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                  dept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {dept.status}
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
                  <div className="absolute right-0 top-8 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleOpenEdit(dept)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <IoPencilOutline size={16} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(dept.id)}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <IoTrashOutline size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 flex-1">
              <p className="text-sm text-gray-600 mb-6 line-clamp-2 h-10">
                {dept.description || 'No description provided.'}
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><IoPeopleOutline /> Head of Dept</span>
                  <span className="font-medium text-gray-900 truncate max-w-[150px] text-right">{dept.head}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><IoPeopleOutline /> Team Size</span>
                  <span className="font-medium text-gray-900">{dept.employeeCount} Members</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><IoWalletOutline /> Monthly Budget</span>
                  <span className="font-medium text-gray-900">AED {dept.budget}</span>
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
                {[...Array(Math.min(dept.employeeCount, 3))].map((_, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {dept.employeeCount > 3 && (
                  <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                    +{dept.employeeCount - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="col-span-full py-12 text-center bg-gray-50 border border-gray-200 border-dashed rounded-2xl">
            <p className="text-gray-500 font-medium">No departments found.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Add New Department' : 'Edit Department'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
            <input 
              type="text" 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5E45]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Head of Department *</label>
            <input 
              type="text" 
              name="head" 
              value={form.head} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5E45]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (AED)</label>
            <input 
              type="text" 
              name="budget" 
              value={form.budget} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5E45]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="status" 
              value={form.status} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5E45]"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1E5E45] resize-none"
            ></textarea>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-[#1E5E45] rounded-lg hover:bg-[#154633] transition-colors"
            >
              {modalMode === 'create' ? 'Create Department' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
