import React from 'react';
import { IoPencilOutline, IoEyeOutline, IoPowerOutline, IoBanOutline } from 'react-icons/io5';

const EmployeeTable = ({ employees, isLoading, onRowClick, onAction }) => {
  if (isLoading) {
    return (
      <div className="overflow-x-auto bg-white rounded-b-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold font-sans">
              <th className="p-4 pl-6">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Designation</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Salary Type</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E8EE]">
            {[...Array(6)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="p-4 pl-6"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                <td className="p-4 flex justify-center"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                <td className="p-4 pr-6"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-b-2xl">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold font-sans sticky top-0">
            <th className="p-4 pl-6">Name</th>
            <th className="p-4">Phone</th>
            <th className="p-4">Designation</th>
            <th className="p-4">Branch</th>
            <th className="p-4">Salary Type</th>
            <th className="p-4 text-center">Status</th>
            <th className="p-4 text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E7E8EE]">
          {employees.map((emp) => (
            <tr 
              key={emp.id} 
              className="hover:bg-[#F4F5F8]/50 transition-colors cursor-pointer"
              onClick={() => onRowClick(emp)}
            >
              <td className="p-4 pl-6">
                <p className="font-semibold text-[#1C1F2A]">{emp.name}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">ID: {emp.id}</p>
              </td>
              <td className="p-4 text-sm text-[#1C1F2A]">{emp.phone}</td>
              <td className="p-4 text-sm text-[#1C1F2A]">{emp.designation}</td>
              <td className="p-4 text-sm text-[#1C1F2A]">{emp.branch.name}</td>
              <td className="p-4">
                <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded bg-gray-100 text-gray-600 tracking-wide uppercase">
                  {emp.salary_type}
                </span>
              </td>
              <td className="p-4 text-center">
                <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                  emp.is_active 
                    ? 'bg-[#2F6F62]/10 text-[#2F6F62]' 
                    : 'bg-[#C1443A]/10 text-[#C1443A]'
                }`}>
                  {emp.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="p-4 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1 text-[#6B7280]">
                  <button 
                    onClick={() => onAction('view', emp)}
                    className="p-1.5 hover:text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg transition-colors"
                    title="View Details"
                    aria-label="View Details"
                  >
                    <IoEyeOutline size={18} />
                  </button>
                  <button 
                    onClick={() => onAction('edit', emp)}
                    className="p-1.5 hover:text-[#C9A227] hover:bg-[#C9A227]/10 rounded-lg transition-colors"
                    title="Edit Employee"
                    aria-label="Edit Employee"
                  >
                    <IoPencilOutline size={18} />
                  </button>
                  <button 
                    onClick={() => onAction(emp.is_active ? 'deactivate' : 'activate', emp)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      emp.is_active 
                        ? 'hover:text-[#C1443A] hover:bg-[#C1443A]/10' 
                        : 'hover:text-[#2F6F62] hover:bg-[#2F6F62]/10'
                    }`}
                    title={emp.is_active ? 'Deactivate' : 'Activate'}
                    aria-label={emp.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {emp.is_active ? <IoBanOutline size={18} /> : <IoPowerOutline size={18} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
