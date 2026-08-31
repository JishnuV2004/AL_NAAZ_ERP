import React, { useState } from 'react';
import { IoCheckmarkOutline, IoCloseOutline, IoTimeOutline, IoWalletOutline, IoDocumentTextOutline } from 'react-icons/io5';
import { overtimeMock } from '../../mocks/attendance.mock';

const Overtime = () => {
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending' or 'History'

  const filteredData = overtimeMock.filter(record => {
    if (activeTab === 'Pending') return record.status === 'Pending';
    return record.status !== 'Pending';
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-[#2F6F62]/10 text-[#2F6F62]">Approved</span>;
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-[#C1443A]/10 text-[#C1443A]">Rejected</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-full uppercase tracking-wider bg-amber-100 text-amber-700">Pending</span>;
      default:
        return null;
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
          <h1 className="font-serif text-3xl font-bold text-[#1C1F2A]">Overtime Management</h1>
          <p className="text-[#6B7280] mt-1">Review, approve, or reject employee overtime hours.</p>
        </div>
        <button className="px-5 py-2.5 bg-white border border-[#E7E8EE] text-[#1C1F2A] rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
          <IoDocumentTextOutline size={18} /> Export OT Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">2</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Awaiting approval</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
              <IoCheckmarkOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Approved Hours</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">45.5</div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Month to date</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <IoWalletOutline size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Est. OT Cost</span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">
              1,250 <span className="text-lg font-normal text-slate-500">AED</span>
            </div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">Month to date</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-[#E7E8EE] shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-[#E7E8EE] bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('Pending')}
            className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${activeTab === 'Pending' ? 'bg-white text-[#C9A227] border-b-2 border-[#C9A227]' : 'text-[#6B7280] hover:text-[#1C1F2A]'}`}
          >
            Pending Approvals
          </button>
          <button 
            onClick={() => setActiveTab('History')}
            className={`flex-1 py-4 text-sm font-semibold text-center transition-colors ${activeTab === 'History' ? 'bg-white text-[#C9A227] border-b-2 border-[#C9A227]' : 'text-[#6B7280] hover:text-[#1C1F2A]'}`}
          >
            Overtime History
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#F4F5F8] border-b border-[#E7E8EE] text-xs uppercase tracking-wider text-[#6B7280] font-semibold">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-center">Regular Hours</th>
                <th className="p-4 text-center">OT Hours</th>
                <th className="p-4">Reason / Task</th>
                <th className="p-4 text-center">Status</th>
                {activeTab === 'Pending' && <th className="p-4 text-right pr-6">Actions</th>}
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
                      <p className="text-xs text-[#6B7280] mt-0.5">{record.employee.department}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-[#1C1F2A]">{new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="p-4 text-center text-sm text-[#6B7280]">{record.regularHours}h</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex px-2.5 py-1 text-sm font-bold rounded bg-[#C9A227]/10 text-[#C9A227]">{record.otHours}h</span>
                  </td>
                  <td className="p-4 text-sm text-[#1C1F2A] max-w-[200px] truncate" title={record.reason}>{record.reason}</td>
                  <td className="p-4 text-center">
                    {getStatusBadge(record.status)}
                  </td>
                  {activeTab === 'Pending' && (
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-white bg-[#2F6F62] hover:bg-[#235349] rounded-lg transition-colors" title="Approve">
                          <IoCheckmarkOutline size={16} />
                        </button>
                        <button className="p-1.5 text-[#C1443A] bg-[#C1443A]/10 hover:bg-[#C1443A]/20 rounded-lg transition-colors" title="Reject">
                          <IoCloseOutline size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={activeTab === 'Pending' ? 7 : 6} className="p-12 text-center text-[#6B7280]">
                    No {activeTab.toLowerCase()} overtime records found.
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
