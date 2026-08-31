import React, { useState } from 'react';
import { IoAddOutline, IoBusinessOutline, IoPeopleOutline, IoWalletOutline, IoSettingsOutline, IoEllipsisVertical } from 'react-icons/io5';

// Dummy Data
const dummyDepartments = [
  { id: 'DEPT-001', name: 'Kitchen & Culinary', head: 'John Doe', employeeCount: 15, budget: '150,000', status: 'Active', description: 'Handles all food preparation, cooking, and culinary operations.' },
  { id: 'DEPT-002', name: 'Customer Service', head: 'Sarah Ahmed', employeeCount: 12, budget: '90,000', status: 'Active', description: 'Front-of-house staff, waiting, and customer experience management.' },
  { id: 'DEPT-003', name: 'Management', head: 'Admin User', employeeCount: 4, budget: '200,000', status: 'Active', description: 'Branch management, HR, and overall operations overseeing.' },
  { id: 'DEPT-004', name: 'Logistics & Delivery', head: 'Mohammed Khan', employeeCount: 8, budget: '60,000', status: 'Active', description: 'Delivery drivers, supply chain, and vehicle maintenance.' },
  { id: 'DEPT-005', name: 'Maintenance', head: 'Unassigned', employeeCount: 2, budget: '25,000', status: 'Inactive', description: 'Facility upkeep, repair, and cleaning services.' },
];

const Departments = () => {
  const stats = {
    total: dummyDepartments.length,
    active: dummyDepartments.filter(d => d.status === 'Active').length,
    totalEmployees: dummyDepartments.reduce((acc, curr) => acc + curr.employeeCount, 0),
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage organizational structure and departments.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#1E5E45] text-white rounded-xl hover:bg-[#154633] transition-colors shadow-md">
          <IoAddOutline className="mr-2" /> Add Department
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
        {dummyDepartments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{dept.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{dept.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                  dept.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {dept.status}
                </span>
                <button className="text-gray-400 hover:text-gray-900 transition-colors p-1"><IoEllipsisVertical /></button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6 line-clamp-2 h-10">
                {dept.description}
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><IoPeopleOutline /> Head of Dept</span>
                  <span className="font-medium text-gray-900">{dept.head}</span>
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
            
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
              <button className="text-sm font-bold text-[#1E5E45] hover:text-[#154633]">View Details</button>
              <div className="flex -space-x-2">
                {/* Mock Employee Avatars */}
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
      </div>
    </div>
  );
};

export default Departments;
