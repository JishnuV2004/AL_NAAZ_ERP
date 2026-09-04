import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoBusinessOutline, IoPeopleOutline, IoWalletOutline } from 'react-icons/io5';

const DepartmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock fetching department details
  const deptDetails = {
    id: id,
    name: 'Department Details',
    head: 'John Doe',
    employeeCount: 15,
    budget: '150,000',
    status: 'Active',
    description: 'This is a mock details page for the department.'
  };

  const mockStaff = [
    { id: 1, name: 'Alice Smith', designation: 'Manager', is_active: true, phone: '+971 50 123 4567' },
    { id: 2, name: 'Bob Johnson', designation: 'Supervisor', is_active: true, phone: '+971 50 987 6543' },
    { id: 3, name: 'Charlie Brown', designation: 'Executive', is_active: false, phone: '+971 52 555 0192' },
    { id: 4, name: 'David Lee', designation: 'Staff', is_active: true, phone: '+971 55 111 2222' },
    { id: 5, name: 'Emma Wilson', designation: 'Analyst', is_active: true, phone: '+971 54 333 4444' },
    { id: 6, name: 'Frank Thomas', designation: 'Developer', is_active: true, phone: '+971 50 444 5555' },
    { id: 7, name: 'Grace Taylor', designation: 'Designer', is_active: false, phone: '+971 56 666 7777' },
    { id: 8, name: 'Henry Davis', designation: 'Coordinator', is_active: true, phone: '+971 50 888 9999' },
    { id: 9, name: 'Isabella Moore', designation: 'Specialist', is_active: true, phone: '+971 52 222 3333' },
    { id: 10, name: 'Jack White', designation: 'Consultant', is_active: true, phone: '+971 55 777 8888' },
    { id: 11, name: 'Karen Green', designation: 'Admin', is_active: false, phone: '+971 54 555 6666' },
    { id: 12, name: 'Liam Black', designation: 'Support', is_active: true, phone: '+971 50 111 0000' },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(mockStaff.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedStaff = mockStaff.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const emptyRowsCount = ITEMS_PER_PAGE - paginatedStaff.length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/hr/departments')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-[#1E5E45] transition-colors"
        >
          <IoArrowBackOutline className="mr-2" /> Back to Departments
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Department Details Section (Left Col) */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-fit">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deptDetails.name}</h1>
              <p className="text-sm text-gray-500 mt-1">ID: {deptDetails.id}</p>
            </div>
            <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
              deptDetails.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {deptDetails.status}
            </span>
          </div>

          <p className="text-gray-700 mb-8 leading-relaxed text-sm">
            {deptDetails.description}
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <IoPeopleOutline size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Head of Dept</p>
                <p className="font-bold text-gray-900">{deptDetails.head}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <IoBusinessOutline size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Team Size</p>
                <p className="font-bold text-gray-900">{deptDetails.employeeCount} Members</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <IoWalletOutline size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Monthly Budget</p>
                <p className="font-bold text-gray-900">AED {deptDetails.budget}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Table Section (Right Col) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Department Staff</h2>
              <p className="text-sm text-gray-500 mt-1">Employees currently assigned to {deptDetails.name}.</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold font-sans">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E8EE]">
                {paginatedStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">ID: EMP-00{staff.id}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-900">{staff.phone}</td>
                    <td className="p-4 text-sm text-gray-900">{staff.designation}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider ${
                        staff.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {staff.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {emptyRowsCount > 0 && (
                  Array.from({ length: emptyRowsCount }).map((_, index) => (
                    <tr key={`empty-${index}`} className="h-[73px]">
                      <td colSpan="4"></td>
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
                Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, mockStaff.length)} of {mockStaff.length} entries
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
    </div>
  );
};

export default DepartmentDetails;
