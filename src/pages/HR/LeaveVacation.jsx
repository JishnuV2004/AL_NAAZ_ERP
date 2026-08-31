import React, { useState } from 'react';
import { IoAddOutline, IoCheckmarkOutline, IoCloseOutline, IoCalendarOutline, IoTimeOutline, IoAirplaneOutline, IoMedkitOutline } from 'react-icons/io5';

// Dummy Data
const dummyLeaves = [
  { id: 'LV-2001', employeeName: 'John Doe', empId: 'EMP001', type: 'Annual Leave', startDate: '2026-09-01', endDate: '2026-09-15', days: 15, reason: 'Family vacation', status: 'Approved' },
  { id: 'LV-2002', employeeName: 'Jane Smith', empId: 'EMP002', type: 'Sick Leave', startDate: '2026-08-25', endDate: '2026-08-26', days: 2, reason: 'Fever and cold', status: 'Approved' },
  { id: 'LV-2003', employeeName: 'Ali Hassan', empId: 'EMP003', type: 'Emergency Leave', startDate: '2026-08-28', endDate: '2026-08-30', days: 3, reason: 'Personal emergency at home', status: 'Pending' },
  { id: 'LV-2004', employeeName: 'Sarah Ahmed', empId: 'EMP004', type: 'Unpaid Leave', startDate: '2026-10-01', endDate: '2026-10-05', days: 5, reason: 'Personal matters', status: 'Pending' },
  { id: 'LV-2005', employeeName: 'Mohammed Khan', empId: 'EMP005', type: 'Annual Leave', startDate: '2026-07-10', endDate: '2026-07-25', days: 15, reason: 'Traveling to home country', status: 'Rejected' },
];

const LeaveVacation = () => {
  const [activeTab, setActiveTab] = useState('Pending');

  const filteredLeaves = activeTab === 'All' 
    ? dummyLeaves 
    : dummyLeaves.filter(l => l.status === activeTab);

  const stats = {
    pending: dummyLeaves.filter(l => l.status === 'Pending').length,
    approved: dummyLeaves.filter(l => l.status === 'Approved').length,
    rejected: dummyLeaves.filter(l => l.status === 'Rejected').length
  };

  const getLeaveIcon = (type) => {
    if (type.includes('Sick')) return <IoMedkitOutline className="text-red-500" />;
    if (type.includes('Annual')) return <IoAirplaneOutline className="text-blue-500" />;
    return <IoTimeOutline className="text-amber-500" />;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Leave & Vacation</h1>
          <p className="text-gray-500 mt-1">Manage employee time off requests and vacation balances.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#1E5E45] text-white rounded-xl hover:bg-[#154633] transition-colors shadow-md">
          <IoAddOutline className="mr-2" size={20} /> Request Leave
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <IoTimeOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Pending Requests</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{stats.pending}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Requires attention</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <IoCheckmarkOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Approved</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{stats.approved}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">This month</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
              <IoCloseOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Rejected Requests</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{stats.rejected}</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">This month</p>
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-wrap gap-2">
            {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-[#1E5E45] shadow-sm border border-gray-200' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab} {tab !== 'All' && `(${stats[tab.toLowerCase()]})`}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Leave Type</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Reason</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{leave.employeeName}</p>
                      <p className="text-xs text-gray-400">{leave.empId}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getLeaveIcon(leave.type)}
                        <span className="font-medium text-gray-700 text-sm">{leave.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{leave.days} Days</span>
                        <span className="text-xs text-gray-500">
                          {new Date(leave.startDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})} - 
                          {new Date(leave.endDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'short'})}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors" title="Approve">
                            <IoCheckmarkOutline size={18} />
                          </button>
                          <button className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors" title="Reject">
                            <IoCloseOutline size={18} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No leave requests found for this category.
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

export default LeaveVacation;
