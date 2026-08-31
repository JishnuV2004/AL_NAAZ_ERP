import React, { useState } from 'react';
import { IoAddOutline, IoSearchOutline, IoPencilOutline, IoTrashOutline, IoBriefcaseOutline } from 'react-icons/io5';

// Dummy Data
const dummyDesignations = [
  { id: 'DES-001', title: 'Head Chef', department: 'Kitchen & Culinary', level: 'Senior Management', employeeCount: 1, baseSalaryRange: '15,000 - 25,000 AED', status: 'Active' },
  { id: 'DES-002', title: 'Sous Chef', department: 'Kitchen & Culinary', level: 'Middle Management', employeeCount: 3, baseSalaryRange: '8,000 - 12,000 AED', status: 'Active' },
  { id: 'DES-003', title: 'Restaurant Manager', department: 'Management', level: 'Senior Management', employeeCount: 1, baseSalaryRange: '12,000 - 20,000 AED', status: 'Active' },
  { id: 'DES-004', title: 'Senior Waiter', department: 'Customer Service', level: 'Staff', employeeCount: 5, baseSalaryRange: '4,000 - 6,000 AED', status: 'Active' },
  { id: 'DES-005', title: 'Delivery Driver', department: 'Logistics & Delivery', level: 'Staff', employeeCount: 8, baseSalaryRange: '3,000 - 4,500 AED', status: 'Active' },
  { id: 'DES-006', title: 'Cleaner', department: 'Maintenance', level: 'Staff', employeeCount: 0, baseSalaryRange: '2,000 - 3,000 AED', status: 'Inactive' },
];

const Designations = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDesignations = dummyDesignations.filter(des => 
    des.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    des.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Designations</h1>
          <p className="text-gray-500 mt-1">Manage job roles, levels, and salary ranges.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#1E5E45] text-white rounded-xl hover:bg-[#154633] transition-colors shadow-md">
          <IoAddOutline className="mr-2" /> Add Designation
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mt-1">
          <IoBriefcaseOutline size={24} />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 text-lg">Role Hierarchy</h3>
          <p className="text-blue-700 text-sm mt-1">
            Designations are tied to specific departments and help determine access levels across the ERP system. 
            Ensure base salary ranges align with company budgets before creating new roles.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search designations or departments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45] transition-all bg-white shadow-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6">Job Title</th>
                <th className="p-4">Department</th>
                <th className="p-4">Seniority Level</th>
                <th className="p-4 text-center">Active Staff</th>
                <th className="p-4">Salary Range (Base)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredDesignations.length > 0 ? (
                filteredDesignations.map((des) => (
                  <tr key={des.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{des.title}</p>
                      <p className="text-xs text-gray-400">{des.id}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {des.department}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {des.level}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                        des.employeeCount > 0 ? 'bg-[#1E5E45]/10 text-[#1E5E45]' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {des.employeeCount}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {des.baseSalaryRange}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                        des.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {des.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button className="p-2 hover:text-[#1E5E45] hover:bg-[#1E5E45]/10 rounded-lg transition-colors"><IoPencilOutline size={18} /></button>
                        <button className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><IoTrashOutline size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No designations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Designations;
