import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoCheckmarkOutline,
  IoCloseOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoDocumentTextOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoTrashOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const initialOvertimeData = [
  {
    id: 'OT-101',
    employee: {
      id: 4,
      name: 'Test Employee cook KYLM',
      empCode: 'EMP-0004',
      department: 'Kitchen'
    },
    date: '2026-09-24',
    regularHours: 8,
    otHours: 2.5,
    reason: 'Dinner rush shift extension & kitchen prep',
    status: 'Pending',
    ratePerHour: 150,
    estimatedCost: 375.00
  },
  {
    id: 'OT-102',
    employee: {
      id: 6,
      name: 'Manager Created Employee',
      empCode: 'EMP-0006',
      department: 'Management'
    },
    date: '2026-09-23',
    regularHours: 8,
    otHours: 3.0,
    reason: 'Monthly inventory audit & staff shift scheduling',
    status: 'Pending',
    ratePerHour: 200,
    estimatedCost: 600.00
  },
  {
    id: 'OT-103',
    employee: {
      id: 7,
      name: 'aby',
      empCode: 'EMP-0007',
      department: 'Service'
    },
    date: '2026-09-22',
    regularHours: 8,
    otHours: 2.0,
    reason: 'VIP Banquet function service cover',
    status: 'Approved',
    ratePerHour: 120,
    estimatedCost: 240.00
  },
  {
    id: 'OT-104',
    employee: {
      id: 8,
      name: 'asif',
      empCode: 'EMP-0008',
      department: 'Accounts'
    },
    date: '2026-09-20',
    regularHours: 8,
    otHours: 4.0,
    reason: 'Quarterly financial ledger reconciliation',
    status: 'Approved',
    ratePerHour: 180,
    estimatedCost: 720.00
  },
  {
    id: 'OT-105',
    employee: {
      id: 4,
      name: 'Test Employee cook KYLM',
      empCode: 'EMP-0004',
      department: 'Kitchen'
    },
    date: '2026-09-18',
    regularHours: 8,
    otHours: 1.5,
    reason: 'Unscheduled catering order preparation',
    status: 'Rejected',
    ratePerHour: 150,
    estimatedCost: 225.00
  }
];

const Overtime = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(initialOvertimeData);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Stats calculation
  const pendingCount = data.filter((r) => r.status === 'Pending').length;
  const approvedHours = data
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.otHours, 0);
  const totalCost = data
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.estimatedCost, 0);

  // Filter list
  const filteredData = data.filter((record) => {
    // Tab Filter
    if (activeTab === 'Pending' && record.status !== 'Pending') return false;
    if (activeTab === 'History' && record.status === 'Pending') return false;

    // Dept Filter
    if (deptFilter !== 'All' && record.employee.department !== deptFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = record.employee.name.toLowerCase().includes(q);
      const codeMatch = record.employee.empCode.toLowerCase().includes(q);
      const reasonMatch = record.reason.toLowerCase().includes(q);
      if (!nameMatch && !codeMatch && !reasonMatch) return false;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (id) => {
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
    toast.success(`Overtime request ${id} approved!`);
  };

  const handleReject = (id) => {
    setData((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
    toast.error(`Overtime request ${id} rejected.`);
  };

  const handleDelete = (id) => {
    setData((prev) => prev.filter((r) => r.id !== id));
    toast.success(`Overtime record ${id} removed.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header & ERP Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Attendance</span> &gt; <span className="text-gray-700">Overtime Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Overtime Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Review, approve, or reject employee overtime hours and extra shift compensation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/attendance/dailyattendance')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoCalendarOutline size={15} /> Daily Attendance
          </button>
          <button
            type="button"
            onClick={() => navigate('/attendance/attendancereports')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoDocumentTextOutline size={15} /> Attendance Reports
          </button>
          <button
            type="button"
            onClick={() => toast.success('Exporting overtime report PDF...')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoDocumentTextOutline size={16} /> Export OT Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Pending OT Requests</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{pendingCount}</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Awaiting Manager Approval</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoTimeOutline size={24} />
          </div>
        </div>

        {/* Approved Hours */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Approved OT Hours</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{approvedHours.toFixed(1)} hrs</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Verified Extra Hours</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        {/* Est. OT Cost */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Estimated OT Payroll Cost</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Payable with Payroll</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Tabs Bar */}
        <div className="flex px-4 border-b border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('Pending')}
            className={`whitespace-nowrap px-6 py-3.5 text-xs font-bold transition-colors relative cursor-pointer ${
              activeTab === 'Pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Pending Approvals ({pendingCount})
            {activeTab === 'Pending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('History')}
            className={`whitespace-nowrap px-6 py-3.5 text-xs font-bold transition-colors relative cursor-pointer ${
              activeTab === 'History' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Overtime History ({data.filter((r) => r.status !== 'Pending').length})
            {activeTab === 'History' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
            )}
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by Employee Name, Code, or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Department Filter Dropdown */}
          <div className="flex items-center gap-2">
            <IoFilterOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Management">Management</option>
              <option value="Service">Service</option>
              <option value="Accounts">Accounts</option>
            </select>
          </div>

        </div>

        {/* Overtime Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">Employee</th>
                <th className="p-3.5">Shift Date</th>
                <th className="p-3.5 text-center">Regular Hours</th>
                <th className="p-3.5 text-center">OT Hours</th>
                <th className="p-3.5 text-right">Est. Cost</th>
                <th className="p-3.5 max-w-[220px]">Reason / Shift Task</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center pr-5">Actions & Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredData.length > 0 ? (
                filteredData.map((record) => {
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    record.employee.name
                  )}&background=0D8ABC&color=fff`;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* Employee Column with Routing */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-8.5 h-8.5 rounded-full object-cover shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate('/hr/employees')}
                              className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                              title="View Employee Profile"
                            >
                              {record.employee.name}
                            </button>
                            <span className="text-[11px] text-gray-400 font-mono block">
                              {record.employee.empCode} • {record.employee.department}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-medium text-gray-800 whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td className="p-3.5 text-center text-gray-600 font-medium whitespace-nowrap">
                        {record.regularHours} hrs
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800 font-mono">
                          +{record.otHours} hrs
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                        ₹{record.estimatedCost.toFixed(2)}
                      </td>

                      <td className="p-3.5 text-gray-500 max-w-[220px] truncate" title={record.reason}>
                        {record.reason}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>

                      <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* Salary History Link */}
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/payroll/employee-salary-history?empId=${record.employee.empCode}`)
                            }
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Employee Salary History"
                          >
                            <IoDocumentTextOutline size={16} />
                          </button>

                          {/* Quick Approve / Reject for Pending */}
                          {record.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(record.id)}
                                className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                                title="Approve Overtime"
                              >
                                <IoCheckmarkOutline size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(record.id)}
                                className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                title="Reject Overtime"
                              >
                                <IoCloseOutline size={16} />
                              </button>
                            </>
                          )}

                          {/* Delete Record */}
                          <button
                            type="button"
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Overtime Record"
                          >
                            <IoTrashOutline size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No overtime records found in this category.
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

export default Overtime;
