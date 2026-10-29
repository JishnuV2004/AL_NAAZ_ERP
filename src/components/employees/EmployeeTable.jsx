import React from 'react';
import { IoPencilOutline, IoPowerOutline, IoBanOutline } from 'react-icons/io5';

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return '—';
  const num = parseFloat(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

const EmployeeTable = ({
  employees = [],
  isLoading = false,
  emptyRowsCount = 0,
  accessibleBranches = [],
  onRowClick,
  onAction
}) => {
  const getBranchName = (branch) => {
    if (!branch) return '—';
    if (typeof branch === 'object') return branch.name || branch.branch_name || branch.code || '—';
    const found = accessibleBranches.find((b) => String(b.id) === String(branch));
    return found ? (found.name || found.branch_name || found.code || `Branch #${branch}`) : `Branch #${branch}`;
  };

  const getSalaryValue = (emp) => {
    if (emp.salary_type === 'MONTHLY') return emp.monthly_salary;
    if (emp.salary_type === 'BIWEEKLY') return emp.biweekly_salary;
    if (emp.salary_type === 'DAILY') return emp.daily_wage;
    return emp.monthly_salary || emp.daily_wage || emp.gross_salary || '';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold whitespace-nowrap">
            <th className="py-3.5 px-5">Employee</th>
            <th className="py-3.5 px-4">Phone</th>
            <th className="py-3.5 px-4">Designation</th>
            <th className="py-3.5 px-4">Branch</th>
            <th className="py-3.5 px-4 text-right">Salary</th>
            <th className="py-3.5 px-4 text-center">Salary Type</th>
            <th className="py-3.5 px-4 text-center">Status</th>
            <th className="py-3.5 px-5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white text-xs">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="animate-pulse h-[52px]">
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-28"></div>
                      <div className="h-2.5 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-24"></div></td>
                <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-24"></div></td>
                <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-28"></div></td>
                <td className="py-3.5 px-4 text-right"><div className="h-3.5 bg-slate-200 rounded w-16 ml-auto"></div></td>
                <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto"></div></td>
                <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded-full w-14 mx-auto"></div></td>
                <td className="py-3.5 px-5 text-center"><div className="h-6 bg-slate-200 rounded w-20 mx-auto"></div></td>
              </tr>
            ))
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan="8" className="p-12 text-center text-slate-400 font-medium">
                No employee records found.
              </td>
            </tr>
          ) : (
            <>
              {employees.map((emp) => {
                const empCode = `EMP-${String(emp.id).padStart(4, '0')}`;
                const salaryVal = getSalaryValue(emp);

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-gray-50/80 transition-colors h-[52px]"
                  >
                    {/* Employee */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                          {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => onRowClick && onRowClick(emp)}
                            className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer text-xs"
                            title="View Employee Details"
                          >
                            {emp.name}
                          </button>
                          <p className="text-[10px] text-gray-400 font-mono">{empCode}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-gray-700 font-mono whitespace-nowrap">
                      {emp.phone || '—'}
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 text-gray-700 font-medium whitespace-nowrap">
                      {emp.designation || '—'}
                    </td>

                    {/* Branch */}
                    <td className="py-3.5 px-4 text-gray-700 font-medium whitespace-nowrap">
                      {getBranchName(emp.branch)}
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(salaryVal)}
                    </td>

                    {/* Salary Type */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded capitalize tracking-wider ${
                        emp.salary_type === 'MONTHLY' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {emp.salary_type || 'MONTHLY'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-md border uppercase tracking-wider select-none ${
                        emp.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onAction('edit', emp)}
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                          title="Edit Employee"
                        >
                          <IoPencilOutline size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(emp.is_active ? 'deactivate' : 'activate', emp)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            emp.is_active
                              ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-gray-200'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-gray-200'
                          }`}
                          title={emp.is_active ? 'Deactivate Employee' : 'Activate Employee'}
                        >
                          {emp.is_active ? <IoBanOutline size={15} /> : <IoPowerOutline size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Empty placeholder rows to maintain consistent 10-row size */}
              {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-[52px] border-b border-gray-100/40">
                  <td colSpan="8">&nbsp;</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;
