import React, { useState } from 'react';
import { IoBarChartOutline, IoCalendarOutline, IoDownloadOutline, IoTrendingUpOutline, IoWarningOutline, IoTimeOutline, IoWalletOutline } from 'react-icons/io5';
import { reportStatsMock, reportTableMock } from '../../mocks/attendance.mock';

const AttendanceReports = () => {
  const [dateRange, setDateRange] = useState('This Month');

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1C1F2A]">Attendance Reports</h1>
          <p className="text-[#6B7280] mt-1">Analytics and aggregated data for workforce attendance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] text-sm text-[#1C1F2A] appearance-none"
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="This Quarter">This Quarter</option>
              <option value="Year to Date">Year to Date</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#6B7280]">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A227] text-white rounded-xl font-semibold hover:bg-[#B49122] transition-colors shadow-sm">
            <IoDownloadOutline size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <IoBarChartOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Avg. Attendance</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{reportStatsMock.averageAttendanceRate}%</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">
              <span className="text-emerald-500 font-semibold">+2.4%</span> vs last period
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <IoWarningOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Absences</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{reportStatsMock.totalAbsencesThisMonth}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Days lost across all staff</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <IoTimeOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Late Arrivals</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{reportStatsMock.totalLateArrivals}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Instances this period</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <IoWalletOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total OT Hours</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{reportStatsMock.totalOvertimeHours}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Approved extra hours</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-[#E7E8EE] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E7E8EE]">
          <h3 className="font-serif text-lg font-bold text-[#1C1F2A]">Employee Summary</h3>
          <p className="text-sm text-[#6B7280]">Aggregated attendance data for {dateRange.toLowerCase()}</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4 text-center">Days Present</th>
                <th className="p-4 text-center">Days Absent</th>
                <th className="p-4 text-center">Late Arrivals</th>
                <th className="p-4 text-center pr-6">OT Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8EE]">
              {reportTableMock.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-white ${getAvatarColor(record.employeeName)}`}>
                      {getInitials(record.employeeName)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1C1F2A]">{record.employeeName}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{record.department}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-semibold text-[#2F6F62]">{record.daysPresent}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-semibold ${record.daysAbsent > 0 ? 'text-[#C1443A]' : 'text-[#6B7280]'}`}>{record.daysAbsent}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-semibold ${record.lateArrivals > 0 ? 'text-orange-600' : 'text-[#6B7280]'}`}>{record.lateArrivals}</span>
                  </td>
                  <td className="p-4 pr-6 text-center">
                    <span className="font-semibold text-[#1C1F2A]">{record.otHours}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;
