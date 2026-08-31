import React, { useState } from 'react';
import { IoSearchOutline, IoFilterOutline, IoCalendarOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTimeOutline, IoEllipsisVertical, IoPeopleOutline } from 'react-icons/io5';
import { dailyAttendanceMock } from '../../mocks/attendance.mock';

const DailyAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredData = dailyAttendanceMock.filter(record => {
    const matchesSearch = record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.employee.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment === 'All' || record.employee.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-[#2F6F62]/10 text-[#2F6F62]"><IoCheckmarkCircleOutline className="mr-1" size={14}/> Present</span>;
      case 'Absent':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-[#C1443A]/10 text-[#C1443A]"><IoCloseCircleOutline className="mr-1" size={14}/> Absent</span>;
      case 'Half-Day':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-orange-100 text-orange-700"><IoTimeOutline className="mr-1" size={14}/> Half-Day</span>;
      case 'On Leave':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-blue-100 text-blue-700">On Leave</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-gray-100 text-gray-700">{status}</span>;
    }
  };

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
          <h1 className="font-serif text-3xl font-bold text-[#1C1F2A]">Daily Attendance</h1>
          <p className="text-[#6B7280] mt-1">Manage and track employee attendance for specific dates.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <IoCalendarOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] shadow-sm text-sm text-[#1C1F2A]"
            />
          </div>
          <button className="px-5 py-2.5 bg-[#C9A227] text-white rounded-xl font-semibold hover:bg-[#B49122] transition-colors shadow-sm">
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <IoPeopleOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Staff</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">8</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">All employees</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <IoCheckmarkCircleOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Present</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">5</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Today</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <IoCloseCircleOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Absent</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">1</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Today</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <IoCalendarOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">On Leave</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">1</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Approved leaves</p>
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
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">2</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Punched in late</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-[#E7E8EE] shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-[#E7E8EE] flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="relative w-full sm:w-96">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F4F5F8] border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all text-[#1C1F2A] text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <IoFilterOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
              <select 
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#F4F5F8] border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-[#1C1F2A] text-sm appearance-none"
              >
                <option value="All">All Departments</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Service">Service</option>
                <option value="Management">Management</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Department & Shift</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E8EE]">
              {filteredData.length > 0 ? filteredData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-white ${getAvatarColor(record.employee.name)}`}>
                      {getInitials(record.employee.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#1C1F2A]">{record.employee.name}</p>
                      <p className="text-xs text-[#6B7280] mt-0.5">{record.employee.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-[#1C1F2A]">{record.employee.department}</p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{record.employee.shift}</p>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1C1F2A]">{record.checkIn}</span>
                      {record.lateMinutes > 0 && (
                        <span className="text-[10px] text-red-500 font-semibold">({record.lateMinutes}m late)</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-[#1C1F2A]">{record.checkOut}</td>
                  <td className="p-4 pr-6 text-right">
                    <button className="p-1.5 text-[#6B7280] hover:bg-[#F4F5F8] hover:text-[#1C1F2A] rounded-lg transition-colors">
                      <IoEllipsisVertical size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-[#6B7280]">
                    No attendance records found matching your filters.
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

export default DailyAttendance;
