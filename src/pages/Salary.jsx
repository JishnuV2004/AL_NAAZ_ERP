import React, { useState } from 'react';
import { useSalaryStore } from '../store/salaryStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { useAdvanceStore } from '../store/advanceStore';
import { useAuthStore } from '../store/authStore';
import { salaryService } from '../services/salaryService';
import { IoSearchOutline, IoWalletOutline, IoTrashOutline, IoPencilOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';
import { PageLoader } from '../components/common/Loader';
import Modal from '../components/common/Modal';

const Salary = () => {
  // Use real Auth Store role
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const salaryRecords = useSalaryStore((state) => state.salaryRecords);
  const paidMonths = useSalaryStore((state) => state.paidMonths);
  const salaryRequests = useSalaryStore((state) => state.salaryRequests);
  const loading = useSalaryStore((state) => state.loading);
  
  const getStaffSalaryList = useSalaryStore((state) => state.getStaffSalaryList);
  const createSalaryRequest = useSalaryStore((state) => state.createSalaryRequest);
  const approveSalaryRequest = useSalaryStore((state) => state.approveSalaryRequest);
  const rejectSalaryRequest = useSalaryStore((state) => state.rejectSalaryRequest);
  const deleteSalaryRecord = useSalaryStore((state) => state.deleteSalaryRecord);
  const updateSalaryRecord = useSalaryStore((state) => state.updateSalaryRecord);
  const paySalary = useSalaryStore((state) => state.paySalary);

  const staff = useAttendanceStore((state) => state.staff);
  const updateStaff = useAttendanceStore((state) => state.updateStaff);
  const advances = useAdvanceStore((state) => state.advances);

  const staffSalaryList = React.useMemo(() => getStaffSalaryList(), [salaryRecords, paidMonths, staff, advances, getStaffSalaryList]);
  
  const stats = React.useMemo(() => {
    return {
      totalStaff: staffSalaryList.length,
      baseSalaryTotal: staffSalaryList.reduce((sum, s) => sum + s.baseSalary, 0),
      deductionsTotal: staffSalaryList.reduce((sum, s) => sum + s.deductions, 0),
      netSalaryTotal: staffSalaryList.reduce((sum, s) => sum + s.netSalary, 0)
    };
  }, [staffSalaryList]);

  // Tab State for Creation
  const [activeTab, setActiveTab] = useState('single');
  const [singleForm, setSingleForm] = useState({ staffId: '', month: 'August', year: '2026' });
  const [bulkForm, setBulkForm] = useState({ month: 'August', year: '2026' });

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Advance deduction popup state (kept for backward compatibility if needed)
  const [payingStaffId, setPayingStaffId] = useState(null);
  const [advanceDeductionAmount, setAdvanceDeductionAmount] = useState('');

  // Handlers for Salary Creation
  const handleSingleCreate = (e) => {
    e.preventDefault();
    if (!singleForm.staffId) return alert('Enter Staff ID');
    
    const member = staffSalaryList.find(s => s.id === singleForm.staffId);
    if (!member) return alert('Staff member not found!');

    const data = {
      staffId: member.id,
      name: member.name,
      basePay: member.baseSalary,
      cut: member.deductions,
      totalSalary: member.netSalary
    };

    createSalaryRequest('single', data, user?.role || 'manager', singleForm.month, singleForm.year);
    alert(`Salary generation requested for ${member.name}. Status: ${isAdmin ? 'Approved' : 'Pending'}`);
    setSingleForm({ ...singleForm, staffId: '' });
  };

  const handleBulkCreate = (e) => {
    e.preventDefault();
    createSalaryRequest('bulk', null, user?.role || 'manager', bulkForm.month, bulkForm.year);
    alert(`Bulk salary generation requested for all active staff. Status: ${isAdmin ? 'Approved' : 'Pending'}`);
  };

  // Inline Delete
  const handleDelete = (staffId) => {
    if (window.confirm('Are you sure you want to delete this salary record override?')) {
      deleteSalaryRecord(staffId);
    }
  };

  // Edit Modal Handlers
  const openEditModal = (member) => {
    const hasPending = salaryRequests.some(r => r.status === 'Pending' && (r.type === 'bulk' || (r.type === 'single' && r.data?.staffId === member.id)));
    const currentStatus = member.isPaid ? 'Paid' : (hasPending ? 'Pending' : 'Unpaid');
    
    setEditData({
      staffId: member.id,
      name: member.name,
      role: member.role,
      daysPresent: member.daysPresent,
      totalDays: member.totalDays,
      baseSalary: member.baseSalary,
      deductions: member.deductions,
      status: currentStatus,
      netSalary: member.netSalary
    });
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    // 1. Update Staff Details
    updateStaff(editData.staffId, {
      name: editData.name,
      role: editData.role,
      daysPresent: Number(editData.daysPresent),
      totalDays: Number(editData.totalDays),
      baseSalary: Number(editData.baseSalary)
    });

    // 2. Update Salary Override (Deductions)
    updateSalaryRecord(editData.staffId, {
      baseSalary: Number(editData.baseSalary),
      deductions: Number(editData.deductions)
    });

    // 3. Handle Status Changes (Only Admin can fully change status to Paid/Pending via dropdown if we wanted to enforce strictly, 
    // but we will enforce based on what they select in UI)
    if (isAdmin) {
      if (editData.status === 'Paid') {
        paySalary('2026-08', editData.staffId, { amount: editData.netSalary, advanceDeducted: 0 });
      } else if (editData.status === 'Pending') {
        // Just create a pending request manually
        const member = staff.find(s => s.id === editData.staffId) || editData;
        createSalaryRequest('single', {
          staffId: member.id,
          name: member.name,
          basePay: member.baseSalary,
          cut: editData.deductions,
          totalSalary: editData.netSalary
        }, 'manager', 'August', '2026'); // Pass manager to force pending status
      }
    }

    setIsEditModalOpen(false);
  };

  const handleDisbursePayment = async () => {
    const member = staffSalaryList.find(s => s.id === payingStaffId);
    if (!member) return;
    const deductAmount = Number(advanceDeductionAmount || 0);
    const finalAmount = Math.max(0, member.netSalary - deductAmount);
    try {
      await salaryService.paySalary('2026-08', member.id, { amount: finalAmount, advanceDeducted: deductAmount });
      setPayingStaffId(null);
      setAdvanceDeductionAmount('');
    } catch (err) {
      console.error('[Disburse Salary Error]:', err);
    }
  };

  // Filtering & Pagination
  const filteredSalaries = staffSalaryList.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.role.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
  });
  
  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage) || 1;
  const paginatedSalaries = filteredSalaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pendingRequests = salaryRequests.filter(r => r.status === 'Pending');

  return (
    <div className="space-y-8">
      {/* Admin Approvals Section */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-amber-900 mb-4 flex items-center">
            <span className="mr-2">⚠️</span> Pending Salary Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex justify-between items-center bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {req.type === 'bulk' ? 'Bulk Salary Generation' : `Salary Request - Employee ID: ${req.data?.staffId} (${req.data?.name})`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Period: {req.month} {req.year} • Status: {req.status}</p>
                </div>
                <div className="flex space-x-2">
                  <button type="button" onClick={() => approveSalaryRequest(req.id)} className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                    <IoCheckmarkCircleOutline className="mr-1 h-4 w-4" /> Approve
                  </button>
                  <button type="button" onClick={() => rejectSalaryRequest(req.id)} className="flex items-center px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors cursor-pointer">
                    <IoCloseCircleOutline className="mr-1 h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Total Staff</span>
          <p className="mt-2 font-serif text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Base Salary Total</span>
          <p className="mt-2 font-serif text-3xl font-bold text-gray-900">₹{stats.baseSalaryTotal.toLocaleString()}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Deductions Total</span>
          <p className="mt-2 font-serif text-3xl font-bold text-red-600">₹{stats.deductionsTotal.toLocaleString()}</p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Salary Payout</span>
          <p className="mt-2 font-serif text-3xl font-bold text-[#1E5E45]">₹{stats.netSalaryTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* 2. Employee Salary Creation (Tabbed) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 pb-4 space-y-4 sm:space-y-0">
          <h3 className="font-serif text-lg font-bold text-gray-900">✦ Employee Salary Creation</h3>
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
            <button 
              type="button"
              onClick={() => setActiveTab('single')} 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'single' ? 'bg-[#1E5E45] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Single Employee
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('bulk')} 
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${activeTab === 'bulk' ? 'bg-[#1E5E45] text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Bulk Creation
            </button>
          </div>
        </div>

        {activeTab === 'single' ? (
          <form onSubmit={handleSingleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">Employee ID</label>
              <input 
                type="text" 
                value={singleForm.staffId} 
                onChange={e => setSingleForm({...singleForm, staffId: e.target.value})} 
                className="w-full rounded-xl border border-gray-200 bg-gray-100/35 px-4 py-2.5 text-sm outline-hidden focus:border-[#1E5E45]" 
                placeholder="Enter ID..." 
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">Month</label>
              <select 
                value={singleForm.month} 
                onChange={e => setSingleForm({...singleForm, month: e.target.value})} 
                className="w-full rounded-xl border border-gray-200 bg-gray-100/35 px-4 py-2.5 text-sm outline-hidden focus:border-[#1E5E45]"
              >
                <option>August</option><option>September</option><option>October</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">Year</label>
              <select 
                value={singleForm.year} 
                onChange={e => setSingleForm({...singleForm, year: e.target.value})} 
                className="w-full rounded-xl border border-gray-200 bg-gray-100/35 px-4 py-2.5 text-sm outline-hidden focus:border-[#1E5E45]"
              >
                <option>2026</option>
              </select>
            </div>
            <button type="submit" className="rounded-xl bg-[#1E5E45] py-2.5 text-xs font-bold text-gray-900 hover:bg-[#1E5E45]-hover shadow-sm w-full cursor-pointer">
              Create Salary
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">Month</label>
              <select 
                value={bulkForm.month} 
                onChange={e => setBulkForm({...bulkForm, month: e.target.value})} 
                className="w-full rounded-xl border border-gray-200 bg-gray-100/35 px-4 py-2.5 text-sm outline-hidden focus:border-[#1E5E45]"
              >
                <option>August</option><option>September</option><option>October</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1">Year</label>
              <select 
                value={bulkForm.year} 
                onChange={e => setBulkForm({...bulkForm, year: e.target.value})} 
                className="w-full rounded-xl border border-gray-200 bg-gray-100/35 px-4 py-2.5 text-sm outline-hidden focus:border-[#1E5E45]"
              >
                <option>2026</option>
              </select>
            </div>
            <button type="submit" className="rounded-xl bg-[#1E5E45] py-2.5 text-xs font-bold text-gray-900 hover:bg-[#1E5E45]-hover shadow-sm w-full cursor-pointer">
              Generate All Salaries
            </button>
          </form>
        )}
      </div>

      {/* 3. Search & Transposed Table List (Vertical headers & employee data) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="relative w-full sm:max-w-xs bg-white border border-gray-200 rounded-xl p-2 shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4.5 text-gray-500">
              <IoSearchOutline className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Search ID, Name or Role..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 font-sans text-xs text-gray-900 outline-hidden focus:border-[#1E5E45]"
            />
          </div>
          <div className="text-sm font-medium text-gray-500 mt-2 sm:mt-0">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <PageLoader />
          ) : paginatedSalaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="font-semibold text-sm">No payroll items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left font-sans text-sm">
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10 w-32">ID</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-gray-500 whitespace-nowrap min-w-[160px] border-r border-gray-200/30 last:border-r-0">{member.id}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Name</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 font-bold text-gray-900 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">{member.name}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Role</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap border-r border-gray-200/30 last:border-r-0">{member.role}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Status</th>
                    {paginatedSalaries.map(member => {
                      const hasPending = salaryRequests.some(r => r.status === 'Pending' && (r.type === 'bulk' || (r.type === 'single' && r.data?.staffId === member.id)));
                      const statusText = member.isPaid ? 'Paid' : (hasPending ? 'Pending' : 'Unpaid');
                      const statusColor = member.isPaid ? 'text-green-700 bg-green-50 border-green-200' : (hasPending ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-gray-600 bg-gray-50 border-gray-200');
                      return (
                        <td key={member.id} className="px-6 py-3 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold border ${statusColor}`}>
                            {statusText}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Days Present</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-gray-900 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">{member.daysPresent}/{member.totalDays}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Total Leave</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-red-600 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">{member.absentDays}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Per Leave Cost</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-gray-500 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">₹{Math.round(member.baseSalary / member.totalDays).toLocaleString()}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Base Pay</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-gray-900 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">₹{member.baseSalary.toLocaleString()}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Gross Pay</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-gray-900 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">₹{member.baseSalary.toLocaleString()}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Deductions</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 text-red-600 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">₹{member.deductions.toLocaleString()}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Total Salary</th>
                    {paginatedSalaries.map(member => <td key={member.id} className="px-6 py-3 font-bold text-[#1E5E45] text-base whitespace-nowrap border-r border-gray-200/30 last:border-r-0">₹{member.netSalary.toLocaleString()}</td>)}
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <th className="bg-gray-100-dark/50 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-r border-gray-100 whitespace-nowrap sticky left-0 z-10">Action</th>
                    {paginatedSalaries.map(member => (
                      <td key={member.id} className="px-6 py-3 whitespace-nowrap border-r border-gray-200/30 last:border-r-0">
                        <div className="flex space-x-3">
                          <button type="button" onClick={() => openEditModal(member)} className="text-gray-500 hover:text-[#1E5E45] transition-colors cursor-pointer" title="Edit Full Record">
                            <IoPencilOutline size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(member.id)} className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer" title="Delete Override">
                            <IoTrashOutline size={16} />
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between bg-gray-50 rounded-2xl border border-gray-200 px-6 py-4 mt-4">
          <span className="text-xs font-medium text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSalaries.length)} of {filteredSalaries.length} employees
          </span>
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button 
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Salary Modal (Full Field Edit) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Record: ${editData?.name}`}>
        {editData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Employee Name</label>
              <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Role</label>
              <input type="text" value={editData.role} onChange={(e) => setEditData({...editData, role: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Days Present</label>
              <input type="number" value={editData.daysPresent} onChange={(e) => setEditData({...editData, daysPresent: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Total Days in Month</label>
              <input type="number" value={editData.totalDays} onChange={(e) => setEditData({...editData, totalDays: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Base Pay (₹)</label>
              <input type="number" value={editData.baseSalary} onChange={(e) => setEditData({...editData, baseSalary: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45]" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5">Deductions (₹)</label>
              <input type="number" value={editData.deductions} onChange={(e) => setEditData({...editData, deductions: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45]" />
            </div>
            {isAdmin && (
              <div className="col-span-1 sm:col-span-2 mt-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-[10px] font-bold text-gray-900 uppercase tracking-wider mb-1.5 flex items-center">
                  <IoCheckmarkCircleOutline className="mr-1 text-[#1E5E45]" size={14}/> Admin Status Override
                </label>
                <select 
                  value={editData.status} 
                  onChange={(e) => setEditData({...editData, status: e.target.value})} 
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-hidden focus:border-[#1E5E45] font-bold"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Pending">Pending (Request)</option>
                  <option value="Paid">Paid (Process Salary)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1.5">Setting status to 'Paid' will immediately disburse this salary amount.</p>
              </div>
            )}
            
            <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-xl border border-gray-200 px-5 py-2 text-xs font-bold text-gray-900 hover:bg-gray-100-dark cursor-pointer">Cancel</button>
              <button type="button" onClick={saveEdit} className="rounded-xl bg-[#1E5E45] px-6 py-2 text-xs font-bold text-gray-900 hover:bg-[#1E5E45]-hover shadow-md cursor-pointer">Save All Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Salary;
