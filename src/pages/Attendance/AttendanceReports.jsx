import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoDownloadOutline,
  IoTrendingUpOutline,
  IoWarningOutline,
  IoTimeOutline,
  IoWalletOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

const mockReportData = [
  {
    id: 1,
    empCode: 'EMP-0004',
    employeeName: 'Test Employee cook KYLM',
    department: 'Kitchen',
    workingDays: 30,
    daysPresent: 28,
    daysAbsent: 1,
    leaveDays: 1,
    lateArrivals: 2,
    otHours: 12.5,
    attendanceRate: 93.3
  },
  {
    id: 2,
    empCode: 'EMP-0006',
    employeeName: 'Manager Created Employee',
    department: 'Management',
    workingDays: 30,
    daysPresent: 29,
    daysAbsent: 0,
    leaveDays: 1,
    lateArrivals: 0,
    otHours: 8.0,
    attendanceRate: 96.7
  },
  {
    id: 3,
    empCode: 'EMP-0007',
    employeeName: 'aby',
    department: 'Service',
    workingDays: 26,
    daysPresent: 24,
    daysAbsent: 2,
    leaveDays: 0,
    lateArrivals: 4,
    otHours: 5.5,
    attendanceRate: 92.3
  },
  {
    id: 4,
    empCode: 'EMP-0008',
    employeeName: 'asif',
    department: 'Accounts',
    workingDays: 30,
    daysPresent: 30,
    daysAbsent: 0,
    leaveDays: 0,
    lateArrivals: 1,
    otHours: 14.0,
    attendanceRate: 100.0
  }
];

const AttendanceReports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('This Month');
  const [deptFilter, setDeptFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Data
  const filteredData = mockReportData.filter((item) => {
    if (deptFilter !== 'All' && item.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.employeeName.toLowerCase().includes(q);
      const codeMatch = item.empCode.toLowerCase().includes(q);
      if (!nameMatch && !codeMatch) return false;
    }
    return true;
  });

  // Calculate Aggregated Metrics
  const avgRate = (
    filteredData.reduce((sum, item) => sum + item.attendanceRate, 0) /
    (filteredData.length || 1)
  ).toFixed(1);

  const totalAbsences = filteredData.reduce((sum, item) => sum + item.daysAbsent, 0);
  const totalLate = filteredData.reduce((sum, item) => sum + item.lateArrivals, 0);
  const totalOT = filteredData.reduce((sum, item) => sum + item.otHours, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header & Module Routings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Attendance</span> &gt; <span className="text-gray-700">Attendance Reports</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Attendance Reports & Analytics</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Aggregated workforce attendance analytics, absence metrics, and payroll audit summaries.
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
            onClick={() => navigate('/attendance/overtime')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoTimeOutline size={15} /> Overtime
          </button>
          <button
            type="button"
            onClick={() => toast.success(`Exporting ${dateRange} Attendance Report PDF...`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoDownloadOutline size={16} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Avg Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Avg. Attendance Rate</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{avgRate}%</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">High Workforce Presence</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoBarChartOutline size={24} />
          </div>
        </div>

        {/* Total Absences */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Absences</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalAbsences} Days</h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Days Lost This Period</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>

        {/* Late Arrivals */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Late Arrivals</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalLate} Times</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Punctuality Instances</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoTimeOutline size={24} />
          </div>
        </div>

        {/* Total OT Hours */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total OT Hours</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{totalOT.toFixed(1)} hrs</h3>
            <p className="text-[10px] font-medium text-teal-600 mt-1">Approved Extra Shifts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search employee by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Department Filter */}
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

          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <IoCalendarOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
          </div>

        </div>

        {/* Aggregated Attendance Report Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">Employee</th>
                <th className="p-3.5 text-center">Working Days</th>
                <th className="p-3.5 text-center">Days Present</th>
                <th className="p-3.5 text-center">Days Absent</th>
                <th className="p-3.5 text-center">Leave Days</th>
                <th className="p-3.5 text-center">Late Arrivals</th>
                <th className="p-3.5 text-center">OT Hours</th>
                <th className="p-3.5 text-center">Attendance %</th>
                <th className="p-3.5 text-center pr-5">Actions & Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredData.length > 0 ? (
                filteredData.map((row) => {
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    row.employeeName
                  )}&background=0D8ABC&color=fff`;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                      
                      {/* Employee Info */}
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
                              {row.employeeName}
                            </button>
                            <span className="text-[11px] text-gray-400 font-mono block">
                              {row.empCode} • {row.department}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-center font-semibold text-gray-700 whitespace-nowrap">
                        {row.workingDays}
                      </td>

                      <td className="p-3.5 text-center font-bold text-emerald-600 whitespace-nowrap">
                        {row.daysPresent} P
                      </td>

                      <td className="p-3.5 text-center font-bold text-rose-500 whitespace-nowrap">
                        {row.daysAbsent} A
                      </td>

                      <td className="p-3.5 text-center font-semibold text-blue-600 whitespace-nowrap">
                        {row.leaveDays} L
                      </td>

                      <td className="p-3.5 text-center font-semibold text-amber-600 whitespace-nowrap">
                        {row.lateArrivals}
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-gray-800 whitespace-nowrap">
                        +{row.otHours} hrs
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-14 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.attendanceRate >= 95
                                  ? 'bg-emerald-500'
                                  : row.attendanceRate >= 90
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${row.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="font-extrabold text-gray-900 font-mono">
                            {row.attendanceRate}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate('/hr/employees')}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Employee Profile"
                          >
                            <IoPersonOutline size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/payroll/employee-salary-history?empId=${row.empCode}`)
                            }
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="View Employee Salary History"
                          >
                            <IoDocumentTextOutline size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No attendance report records found.
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

export default AttendanceReports;
