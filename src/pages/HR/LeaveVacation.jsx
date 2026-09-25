import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoCheckmarkOutline,
  IoCloseOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoAirplaneOutline,
  IoMedkitOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoEyeOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoTrashOutline,
  IoArrowForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';

// Initial Mock Leave & Vacation Data
const initialLeaves = [
  {
    id: 'LV-2001',
    empId: 'EMP-0004',
    employeeName: 'Test Employee cook KYLM',
    department: 'Kitchen',
    type: 'Annual Leave',
    startDate: '2026-09-01',
    endDate: '2026-09-15',
    days: 15,
    reason: 'Annual family vacation trip to home country',
    status: 'Approved',
    appliedDate: '2026-08-20',
    approvedBy: 'Admin Manager'
  },
  {
    id: 'LV-2002',
    empId: 'EMP-0006',
    employeeName: 'Manager Created Employee',
    department: 'Management',
    type: 'Sick Leave',
    startDate: '2026-08-25',
    endDate: '2026-08-26',
    days: 2,
    reason: 'High fever and severe flu doctor recommendation',
    status: 'Approved',
    appliedDate: '2026-08-24',
    approvedBy: 'Admin Manager'
  },
  {
    id: 'LV-2003',
    empId: 'EMP-0007',
    employeeName: 'aby',
    department: 'Service',
    type: 'Emergency Leave',
    startDate: '2026-09-28',
    endDate: '2026-09-30',
    days: 3,
    reason: 'Urgent personal family emergency at native town',
    status: 'Pending',
    appliedDate: '2026-09-24',
    approvedBy: null
  },
  {
    id: 'LV-2004',
    empId: 'EMP-0008',
    employeeName: 'asif',
    department: 'Accounts',
    type: 'Unpaid Leave',
    startDate: '2026-10-01',
    endDate: '2026-10-05',
    days: 5,
    reason: 'Personal matters and passport renewal process',
    status: 'Pending',
    appliedDate: '2026-09-22',
    approvedBy: null
  },
  {
    id: 'LV-2005',
    empId: 'EMP-0004',
    employeeName: 'Test Employee cook KYLM',
    department: 'Kitchen',
    type: 'Annual Leave',
    startDate: '2026-07-10',
    endDate: '2026-07-25',
    days: 15,
    reason: 'Traveling abroad for personal events',
    status: 'Rejected',
    appliedDate: '2026-07-01',
    approvedBy: 'HR Admin'
  }
];

const LeaveVacation = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState(initialLeaves);
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // New Leave Form State
  const [newLeave, setNewLeave] = useState({
    empId: 'EMP-0004',
    employeeName: 'Test Employee cook KYLM',
    department: 'Kitchen',
    type: 'Annual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Calculate Stats
  const stats = {
    pending: leaves.filter((l) => l.status === 'Pending').length,
    approved: leaves.filter((l) => l.status === 'Approved').length,
    rejected: leaves.filter((l) => l.status === 'Rejected').length,
    totalDaysApproved: leaves
      .filter((l) => l.status === 'Approved')
      .reduce((sum, l) => sum + l.days, 0)
  };

  // Filter Leaves List
  const filteredLeaves = leaves.filter((item) => {
    // Tab Status Filter
    if (activeTab !== 'All' && item.status !== activeTab) {
      return false;
    }
    // Type Filter
    if (typeFilter !== 'All' && item.type !== typeFilter) {
      return false;
    }
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = (item.employeeName || '').toLowerCase().includes(q);
      const empIdMatch = (item.empId || '').toLowerCase().includes(q);
      const reasonMatch = (item.reason || '').toLowerCase().includes(q);
      const reqIdMatch = (item.id || '').toLowerCase().includes(q);
      if (!nameMatch && !empIdMatch && !reasonMatch && !reqIdMatch) {
        return false;
      }
    }
    return true;
  });

  const getLeaveIcon = (type) => {
    if (type.includes('Sick')) return <IoMedkitOutline className="text-rose-500" size={18} />;
    if (type.includes('Annual')) return <IoAirplaneOutline className="text-blue-500" size={18} />;
    return <IoTimeOutline className="text-amber-500" size={18} />;
  };

  // Handlers
  const handleApprove = (id) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Approved', approvedBy: 'Admin User' } : l))
    );
    toast.success(`Leave request ${id} approved successfully!`);
    if (selectedLeave && selectedLeave.id === id) {
      setSelectedLeave((prev) => ({ ...prev, status: 'Approved', approvedBy: 'Admin User' }));
    }
  };

  const handleReject = (id) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Rejected', approvedBy: 'Admin User' } : l))
    );
    toast.error(`Leave request ${id} marked as rejected.`);
    if (selectedLeave && selectedLeave.id === id) {
      setSelectedLeave((prev) => ({ ...prev, status: 'Rejected', approvedBy: 'Admin User' }));
    }
  };

  const handleDelete = (id) => {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    toast.success(`Leave record ${id} removed.`);
    if (selectedLeave && selectedLeave.id === id) {
      setSelectedLeave(null);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newLeave.startDate || !newLeave.endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }

    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    if (end < start) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const createdRecord = {
      id: `LV-${Math.floor(2000 + Math.random() * 9000)}`,
      empId: newLeave.empId,
      employeeName: newLeave.employeeName,
      department: newLeave.department,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      days: diffDays,
      reason: newLeave.reason || 'Leave request submitted by HR',
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null
    };

    setLeaves([createdRecord, ...leaves]);
    toast.success('Leave request submitted successfully!');
    setShowRequestModal(false);
    setNewLeave({
      empId: 'EMP-0004',
      employeeName: 'Test Employee cook KYLM',
      department: 'Kitchen',
      type: 'Annual Leave',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leave & Vacation Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Review time off requests, track employee vacation balances, and manage leave approvals.
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <IoAddOutline size={18} />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Pending Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Pending Requests</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.pending}</h3>
            <p className="text-[10px] font-medium text-amber-600 mt-1">Requires HR Approval</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IoTimeOutline size={24} />
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Approved Requests</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.approved}</h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Granted Time Off</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        {/* Rejected Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Rejected Requests</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.rejected}</h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Declined Time Off</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoCloseOutline size={24} />
          </div>
        </div>

        {/* Total Days Approved */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Vacation Days Used</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums">{stats.totalDaysApproved} Days</h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Total Approved Days</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoAirplaneOutline size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        {/* Status Tabs Bar */}
        <div className="flex px-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
          {['Pending', 'Approved', 'Rejected', 'All'].map((tab) => {
            const count = tab === 'All' ? leaves.length : stats[tab.toLowerCase()] || 0;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-3.5 text-xs font-bold transition-colors relative cursor-pointer ${
                  activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab} <span className="ml-1 text-[11px] opacity-80">({count})</span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by Employee Name, ID, Request # or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Type Filter Dropdown */}
          <div className="flex items-center gap-2">
            <IoFilterOutline size={16} className="text-gray-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Leave Types</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Emergency Leave">Emergency Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold whitespace-nowrap">
                <th className="p-3.5 pl-5">Request ID</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5 text-center">Duration</th>
                <th className="p-3.5">Date Period</th>
                <th className="p-3.5 max-w-[200px]">Reason</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center pr-5">Actions & Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {filteredLeaves.length > 0 ? (
                filteredLeaves.map((leave) => {
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    leave.employeeName
                  )}&background=0D8ABC&color=fff`;

                  return (
                    <tr key={leave.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 pl-5 font-mono font-bold text-gray-700 whitespace-nowrap">
                        {leave.id}
                      </td>

                      {/* Employee Column with Routing */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => navigate('/hr/employees')}
                              className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-left block truncate cursor-pointer"
                              title="View Employee Profile"
                            >
                              {leave.employeeName}
                            </button>
                            <span className="text-[11px] text-gray-400 font-mono block">
                              {leave.empId} • {leave.department}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          {getLeaveIcon(leave.type)}
                          <span className="font-semibold text-gray-800">{leave.type}</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center font-bold text-gray-900 whitespace-nowrap">
                        {leave.days} Days
                      </td>

                      <td className="p-3.5 text-gray-600 whitespace-nowrap">
                        <span className="font-medium text-gray-800">
                          {new Date(leave.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="text-gray-300 mx-1">→</span>
                        <span className="font-medium text-gray-800">
                          {new Date(leave.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      <td className="p-3.5 text-gray-500 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </td>

                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : leave.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>

                      <td className="p-3.5 pr-5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedLeave(leave)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Request Details"
                          >
                            <IoEyeOutline size={16} />
                          </button>

                          {/* Salary History Navigation */}
                          <button
                            type="button"
                            onClick={() => navigate(`/payroll/employee-salary-history?empId=${leave.empId}`)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="View Employee Salary History"
                          >
                            <IoDocumentTextOutline size={16} />
                          </button>

                          {/* Quick Approve / Reject for Pending */}
                          {leave.status === 'Pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(leave.id)}
                                className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                                title="Approve Request"
                              >
                                <IoCheckmarkOutline size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(leave.id)}
                                className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                title="Reject Request"
                              >
                                <IoCloseOutline size={16} />
                              </button>
                            </>
                          )}

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDelete(leave.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Request"
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
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IoAlertCircleOutline size={32} className="text-gray-300" />
                      <p className="font-semibold text-gray-700">No Leave Requests Found</p>
                      <p className="text-xs text-gray-400">Try changing your search keywords or filter tab.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Request Leave */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">New Leave Request</h3>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-4 text-xs">
              
              {/* Employee Selection */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Employee</label>
                <select
                  value={newLeave.empId}
                  onChange={(e) => {
                    const selectedEmp = [
                      { id: 'EMP-0004', name: 'Test Employee cook KYLM', dept: 'Kitchen' },
                      { id: 'EMP-0006', name: 'Manager Created Employee', dept: 'Management' },
                      { id: 'EMP-0007', name: 'aby', dept: 'Service' },
                      { id: 'EMP-0008', name: 'asif', dept: 'Accounts' }
                    ].find((emp) => emp.id === e.target.value);

                    if (selectedEmp) {
                      setNewLeave((prev) => ({
                        ...prev,
                        empId: selectedEmp.id,
                        employeeName: selectedEmp.name,
                        department: selectedEmp.dept
                      }));
                    }
                  }}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  <option value="EMP-0004">EMP-0004 - Test Employee cook KYLM (Kitchen)</option>
                  <option value="EMP-0006">EMP-0006 - Manager Created Employee (Management)</option>
                  <option value="EMP-0007">EMP-0007 - aby (Service)</option>
                  <option value="EMP-0008">EMP-0008 - asif (Accounts)</option>
                </select>
              </div>

              {/* Leave Type */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Leave Type</label>
                <select
                  value={newLeave.type}
                  onChange={(e) => setNewLeave((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain reason for leave request..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl p-2.5 bg-white text-gray-800 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Request Details */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Leave Request Details</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedLeave.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee:</span>
                  <span className="font-bold text-gray-900">{selectedLeave.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Employee Code:</span>
                  <span className="font-mono text-gray-800">{selectedLeave.empId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Department:</span>
                  <span className="font-semibold text-gray-800">{selectedLeave.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Leave Type:</span>
                  <span className="font-bold text-blue-600">{selectedLeave.type}</span>
                </div>
              </div>

              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-extrabold text-gray-900">{selectedLeave.days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date Range:</span>
                  <span className="font-medium text-gray-800">
                    {selectedLeave.startDate} to {selectedLeave.endDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-bold ${
                    selectedLeave.status === 'Approved' ? 'text-emerald-600' :
                    selectedLeave.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {selectedLeave.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-1">Reason / Notes:</p>
                <p className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 italic">
                  "{selectedLeave.reason}"
                </p>
              </div>
            </div>

            {/* Quick Actions & Navigation Links */}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeave(null);
                    navigate('/hr/employees');
                  }}
                  className="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <IoPersonOutline size={15} /> Employee Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeave(null);
                    navigate(`/payroll/employee-salary-history?empId=${selectedLeave.empId}`);
                  }}
                  className="flex-1 py-2 px-3 bg-white border border-gray-200 text-blue-600 hover:bg-blue-50 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <IoDocumentTextOutline size={15} /> Salary History
                </button>
              </div>

              {selectedLeave.status === 'Pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApprove(selectedLeave.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReject(selectedLeave.id)}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveVacation;
