import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  IoArrowBackOutline, IoBusinessOutline, IoPeopleOutline, IoWalletOutline, 
  IoStorefrontOutline, IoAlertCircleOutline, IoRefreshOutline 
} from 'react-icons/io5';
import { getDepartments } from '../../api/departments.api';
import { getEmployeesByDepartment } from '../../api/employees.api';
import toast from 'react-hot-toast';

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [deptDetails, setDeptDetails] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [allDepts, deptStaff] = await Promise.all([
        getDepartments(),
        getEmployeesByDepartment(id)
      ]);

      const foundDept = allDepts.find(d => String(d.id) === String(id));
      if (foundDept) {
        setDeptDetails({
          ...foundDept,
          employeeCount: deptStaff.length
        });
      } else {
        setDeptDetails({
          id: id,
          deptCode: `DEPT-${String(id).padStart(3, '0')}`,
          name: deptStaff.length > 0 ? deptStaff[0].department_name : `Department #${id}`,
          head: 'Unassigned',
          employeeCount: deptStaff.length,
          budget: '100,000',
          status: 'Active',
          branchName: deptStaff.length > 0 ? deptStaff[0].branch_name : 'Main Branch',
          description: `Handles operations for ${deptStaff.length > 0 ? deptStaff[0].department_name : 'this department'}.`
        });
      }

      setStaffList(deptStaff || []);
    } catch (err) {
      console.error('Failed to load department details:', err);
      setError(err.message || 'Failed to fetch department information');
      toast.error('Failed to load department data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const totalPages = Math.ceil(staffList.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStaff = staffList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const emptyRowsCount = Math.max(0, ITEMS_PER_PAGE - paginatedStaff.length);

  return (
    <div className="space-y-8 pb-12 font-sans">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/hr/departments')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-[#1E5E45] transition-colors"
        >
          <IoArrowBackOutline className="mr-2" /> Back to Departments
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-full bg-gray-100 rounded-md"></div>
            <div className="space-y-3 pt-4">
              <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
              <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
            </div>
          </div>
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 rounded-md"></div>
            <div className="h-40 w-full bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <IoAlertCircleOutline size={28} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Failed to Load Department Details</h3>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#1E5E45] text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 hover:bg-[#154633] transition-colors"
          >
            <IoRefreshOutline size={16} /> Retry Loading
          </button>
        </div>
      ) : deptDetails ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Department Details Section (Left Col) */}
          <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 uppercase">{deptDetails.name}</h1>
                <p className="text-xs text-gray-400 font-mono mt-1">{deptDetails.deptCode || `ID: #${deptDetails.id}`}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                deptDetails.status === 'Active' || deptDetails.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {deptDetails.status || (deptDetails.is_active ? 'Active' : 'Inactive')}
              </span>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed text-sm">
              {deptDetails.description}
            </p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <IoStorefrontOutline size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Assigned Branch</p>
                  <p className="font-bold text-gray-900">{deptDetails.branchName || 'Main Branch'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <IoPeopleOutline size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Team Size</p>
                  <p className="font-bold text-gray-900">{staffList.length} Members</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <IoWalletOutline size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Monthly Budget</p>
                  <p className="font-bold text-gray-900">₹{deptDetails.budget}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Staff Table Section (Right Col) */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-fit">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Department Staff ({staffList.length})</h2>
                <p className="text-sm text-gray-500 mt-1">Employees currently assigned to {deptDetails.name}.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold font-sans">
                    <th className="p-4 pl-6">Employee</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Designation</th>
                    <th className="p-4">Salary</th>
                    <th className="p-4">Joining Date</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E8EE]">
                  {paginatedStaff.length > 0 ? (
                    paginatedStaff.map((staff) => {
                      const formatSalary = (emp) => {
                        if (emp.monthly_salary) return `₹${parseFloat(emp.monthly_salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo`;
                        if (emp.biweekly_salary) return `₹${parseFloat(emp.biweekly_salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / 2w`;
                        if (emp.daily_wage) return `₹${parseFloat(emp.daily_wage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / day`;
                        return 'N/A';
                      };

                      return (
                        <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-semibold text-gray-900 uppercase">{staff.name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: EMP-{String(staff.id).padStart(3, '0')}</p>
                          </td>
                          <td className="p-4 text-sm text-gray-900 font-medium">{staff.phone || 'N/A'}</td>
                          <td className="p-4 text-sm text-gray-900 capitalize font-medium">{staff.designation || 'Staff'}</td>
                          <td className="p-4 text-sm text-gray-900 font-semibold">{formatSalary(staff)}</td>
                          <td className="p-4 text-sm text-gray-600 font-medium">{staff.joining_date || 'N/A'}</td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                              staff.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {staff.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">
                        No employees currently assigned to this department.
                      </td>
                    </tr>
                  )}
                  {emptyRowsCount > 0 && paginatedStaff.length > 0 && (
                    Array.from({ length: emptyRowsCount }).map((_, index) => (
                      <tr key={`empty-${index}`} className="h-[65px]">
                        <td colSpan="6"></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, staffList.length)} of {staffList.length} entries
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
                          currentPage === i + 1 
                            ? 'bg-[#1E5E45] text-white border border-[#1E5E45]' 
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DepartmentDetails;
