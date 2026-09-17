import React, { useState, useEffect, useRef } from 'react';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoDownloadOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoAddOutline,
  IoWalletOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCloseOutline,
  IoEyeOutline,
  IoBusinessOutline,
  IoDocumentTextOutline,
  IoAlertCircleOutline,
  IoCheckmarkDoneOutline,
  IoPrintOutline,
  IoCloseCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoRemoveCircleOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { Calendar } from '../../components/ui/calendar';
import toast from 'react-hot-toast';

const mockEmployeesList = [
  { empId: 'EMP-0004', name: 'Test Employee cook KYLM', department: 'Kitchen', designation: 'Head Cook' },
  { empId: 'EMP-0006', name: 'Manager Created Employee', department: 'Management', designation: 'Assistant Manager' },
  { empId: 'EMP-0007', name: 'aby', department: 'Service', designation: 'Captain' },
  { empId: 'EMP-0008', name: 'asif', department: 'Accounts', designation: 'Accountant' },
  { empId: 'EMP-0009', name: 'Rashid Khan', department: 'Kitchen', designation: 'Sous Chef' },
  { empId: 'EMP-0010', name: 'Mohammed Ali', department: 'Service', designation: 'Waiter' }
];

const mockDeductionsData = [
  {
    id: 'DED-2026-101',
    monthYear: 'September 2026',
    createdDate: '05 Sep 2026',
    empId: 'EMP-0006',
    name: 'Manager Created Employee',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    department: 'Management',
    designation: 'Assistant Manager',
    category: 'Attendance Absence',
    deductionType: 'Unexcused Absence (1 Day)',
    frequency: 'One-Time',
    amount: 833.33,
    status: 'APPLIED',
    reason: '1 day unexcused absence without prior leave request',
    approvedBy: 'HR Manager',
    breakdown: [
      { item: 'Daily Rate Basis', calc: '₹25,000 / 30 days', amount: 833.33 }
    ]
  },
  {
    id: 'DED-2026-102',
    monthYear: 'September 2026',
    createdDate: '01 Sep 2026',
    empId: 'EMP-0004',
    name: 'Test Employee cook KYLM',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    department: 'Kitchen',
    designation: 'Head Cook',
    category: 'Statutory Deduction',
    deductionType: 'Provident Fund (PF)',
    frequency: 'Recurring Monthly',
    amount: 1800.00,
    status: 'APPLIED',
    reason: 'Standard monthly employee PF contribution (12% of basic)',
    approvedBy: 'System Auto-Rule',
    breakdown: [
      { item: 'Employee PF Share', calc: '12% of ₹15,000 basic', amount: 1800.00 }
    ]
  },
  {
    id: 'DED-2026-103',
    monthYear: 'September 2026',
    createdDate: '08 Sep 2026',
    empId: 'EMP-0007',
    name: 'aby',
    avatar: 'https://i.pravatar.cc/150?u=emp3',
    department: 'Service',
    designation: 'Captain',
    category: 'Disciplinary Fine',
    deductionType: 'Late Entry Penalty',
    frequency: 'One-Time',
    amount: 250.00,
    status: 'APPLIED',
    reason: '3 consecutive late check-ins exceeding 30 minutes grace period',
    approvedBy: 'Shift Supervisor',
    breakdown: [
      { item: 'Late Penalty (3 instances)', calc: '₹83.33 x 3', amount: 250.00 }
    ]
  },
  {
    id: 'DED-2026-104',
    monthYear: 'September 2026',
    createdDate: '10 Sep 2026',
    empId: 'EMP-0008',
    name: 'asif',
    avatar: 'https://i.pravatar.cc/150?u=emp4',
    department: 'Accounts',
    designation: 'Accountant',
    category: 'Damage Fine',
    deductionType: 'Equipment Damage Loss',
    frequency: 'One-Time',
    amount: 1500.00,
    status: 'PENDING',
    reason: 'POS thermal printer physical breakage during cash drawer audit',
    approvedBy: 'Pending Admin Signoff',
    breakdown: [
      { item: 'Hardware Repair Recovery', calc: '50% shared repair cost', amount: 1500.00 }
    ]
  },
  {
    id: 'DED-2026-105',
    monthYear: 'August 2026',
    createdDate: '28 Aug 2026',
    empId: 'EMP-0009',
    name: 'Rashid Khan',
    avatar: 'https://i.pravatar.cc/150?u=emp5',
    department: 'Kitchen',
    designation: 'Sous Chef',
    category: 'Attendance Absence',
    deductionType: 'Half-Day Absence',
    frequency: 'One-Time',
    amount: 500.00,
    status: 'WAIVED',
    reason: 'Half-day absence waived by Head Chef due to overtime coverage',
    approvedBy: 'Head Chef',
    breakdown: [
      { item: 'Absence Fine Waived', calc: 'Waived via OT Compensation', amount: 0.00 }
    ]
  }
];

const formatCurrency = (amount) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Deductions = () => {
  const [deductionsList, setDeductionsList] = useState(mockDeductionsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedDate, setSelectedDate] = useState('2026-09-14');
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const datePickerRef = useRef(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailDeduction, setSelectedDetailDeduction] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    empId: 'EMP-0004',
    category: 'Attendance Absence',
    deductionType: 'Unexcused Absence',
    frequency: 'One-Time',
    monthYear: 'September 2026',
    amount: '',
    reason: ''
  });

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Filtered List
  const filteredDeductions = deductionsList.filter((ded) => {
    const matchesSearch =
      ded.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ded.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ded.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ded.deductionType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'All Categories' || ded.category === categoryFilter;

    const matchesDept =
      departmentFilter === 'All Departments' || ded.department === departmentFilter;

    const matchesStatus =
      statusFilter === 'All Status' || ded.status === statusFilter;

    return matchesSearch && matchesCategory && matchesDept && matchesStatus;
  });

  // Calculate Metrics
  const totalMonthlyDeductions = deductionsList
    .filter((d) => d.status === 'APPLIED')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalStatutory = deductionsList
    .filter((d) => d.status === 'APPLIED' && d.category === 'Statutory Deduction')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalAbsencePenalties = deductionsList
    .filter((d) => d.status === 'APPLIED' && (d.category === 'Attendance Absence' || d.category === 'Disciplinary Fine'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingDeductions = deductionsList.filter((d) => d.status === 'PENDING');
  const pendingAmount = pendingDeductions.reduce((acc, curr) => acc + curr.amount, 0);

  // Approve Action
  const handleApprove = (id) => {
    setDeductionsList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'APPLIED', approvedBy: 'Admin User' } : item
      )
    );
    toast.success(`Deduction ${id} approved and applied to payroll!`);
  };

  // Waive Action
  const handleWaive = (id) => {
    setDeductionsList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'WAIVED', approvedBy: 'Admin User' } : item
      )
    );
    toast.error(`Deduction ${id} has been waived.`);
  };

  // Handle Form Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid deduction amount');
      return;
    }

    const selectedEmp = mockEmployeesList.find((e) => e.empId === formData.empId) || mockEmployeesList[0];
    const amountVal = parseFloat(formData.amount);

    const newDeduction = {
      id: `DED-2026-${Math.floor(100 + Math.random() * 900)}`,
      monthYear: formData.monthYear,
      createdDate: '14 Sep 2026',
      empId: selectedEmp.empId,
      name: selectedEmp.name,
      avatar: `https://i.pravatar.cc/150?u=${selectedEmp.empId}`,
      department: selectedEmp.department,
      designation: selectedEmp.designation,
      category: formData.category,
      deductionType: formData.deductionType,
      frequency: formData.frequency,
      amount: amountVal,
      status: 'APPLIED',
      reason: formData.reason || 'Manual payroll deduction entry',
      approvedBy: 'Admin User',
      breakdown: [
        { item: formData.deductionType, calc: 'Manual Adjustment', amount: amountVal }
      ]
    };

    setDeductionsList([newDeduction, ...deductionsList]);
    setShowAddModal(false);
    toast.success(`Deduction ${newDeduction.id} created successfully!`);
    setFormData({
      empId: 'EMP-0004',
      category: 'Attendance Absence',
      deductionType: 'Unexcused Absence',
      frequency: 'One-Time',
      monthYear: 'September 2026',
      amount: '',
      reason: ''
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Payroll</span> &gt; <span className="text-slate-700">Salary Deductions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Salary Deductions Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit, configure, and manage statutory PF/ESI/TDS, absence penalties, and disciplinary fines.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toast.success('Deductions log exported to CSV')}
            className="px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoDownloadOutline size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoAddOutline size={18} /> Apply Custom Deduction
          </button>
        </div>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applied Deductions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <IoRemoveCircleOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Deducted (Sep)</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalMonthlyDeductions)}</h3>
              <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Applied to Payroll</p>
            </div>
          </div>
        </div>

        {/* Statutory PF / ESI / TDS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <IoShieldCheckmarkOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Statutory (PF/ESI)</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalStatutory)}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Government Compliance</p>
            </div>
          </div>
        </div>

        {/* Absence & Penalties */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <IoAlertCircleOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Absence & Late Fines</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalAbsencePenalties)}</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Disciplinary & Attendance</p>
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <IoTimeOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Pending Signoff</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{pendingDeductions.length} Items</h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-0.5">{formatCurrency(pendingAmount)} Awaiting</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Filter & Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Record</label>
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search Employee, ID, Type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Deduction Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="All Categories">All Categories</option>
              <option value="Statutory Deduction">Statutory (PF/ESI)</option>
              <option value="Attendance Absence">Attendance Absence</option>
              <option value="Disciplinary Fine">Disciplinary Fine</option>
              <option value="Damage Fine">Damage Fine</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Management">Management</option>
              <option value="Service">Service</option>
              <option value="Accounts">Accounts</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="APPLIED">Applied</option>
              <option value="PENDING">Pending Approval</option>
              <option value="WAIVED">Waived / Cancelled</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All Categories');
                setDepartmentFilter('All Departments');
                setStatusFilter('All Status');
              }}
              className="w-full py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Deductions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3.5 text-left align-middle">Deduction Ref #</th>
                <th className="p-3.5 text-left align-middle">Payroll Period</th>
                <th className="p-3.5 text-left align-middle min-w-[220px]">Employee</th>
                <th className="p-3.5 text-left align-middle">Deduction Type</th>
                <th className="p-3.5 text-center align-middle">Frequency</th>
                <th className="p-3.5 text-right align-middle">Amount (₹)</th>
                <th className="p-3.5 text-center align-middle">Status</th>
                <th className="p-3.5 text-center align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredDeductions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                    No salary deductions found matching the filters.
                  </td>
                </tr>
              ) : (
                filteredDeductions.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 align-middle whitespace-nowrap">
                      <p className="font-mono font-bold text-rose-600">{row.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Date: {row.createdDate}</p>
                    </td>

                    <td className="p-3.5 align-middle font-bold text-slate-900 whitespace-nowrap">
                      {row.monthYear}
                    </td>

                    <td className="p-3.5 align-middle min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <img src={row.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 whitespace-nowrap">{row.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono whitespace-nowrap">{row.empId} • {row.department}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 align-middle whitespace-nowrap">
                      <p className="font-bold text-slate-800">{row.deductionType}</p>
                      <span className="inline-flex text-[10px] text-slate-500 font-medium">{row.category}</span>
                    </td>

                    <td className="p-3.5 text-center align-middle whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.frequency === 'Recurring Monthly' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {row.frequency}
                      </span>
                    </td>

                    <td className="p-3.5 text-right align-middle font-mono font-black text-rose-600 text-sm whitespace-nowrap">
                      - {formatCurrency(row.amount)}
                    </td>

                    <td className="p-3.5 text-center align-middle whitespace-nowrap">
                      {row.status === 'APPLIED' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                          APPLIED
                        </span>
                      )}
                      {row.status === 'PENDING' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-purple-100 text-purple-700 uppercase tracking-wider">
                          PENDING
                        </span>
                      )}
                      {row.status === 'WAIVED' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider">
                          WAIVED
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center align-middle whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailDeduction(row)}
                          className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Deduction Audit Breakdown"
                        >
                          <IoEyeOutline size={14} /> Details
                        </button>

                        {row.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(row.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                            title="Approve Deduction"
                          >
                            <IoCheckmarkDoneOutline size={16} />
                          </button>
                        )}

                        {row.status !== 'WAIVED' && (
                          <button
                            type="button"
                            onClick={() => handleWaive(row.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent cursor-pointer"
                            title="Waive Deduction"
                          >
                            <IoCloseCircleOutline size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">Showing {filteredDeductions.length} of {deductionsList.length} deduction entries</span>
          <div className="flex items-center gap-2">
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 disabled:opacity-50">
              <IoChevronBackOutline size={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white font-medium text-xs">
              1
            </button>
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 disabled:opacity-50">
              <IoChevronForwardOutline size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Apply Custom Deduction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <IoAddOutline size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Apply Custom Salary Deduction</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Employee Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Employee *</label>
                <select
                  value={formData.empId}
                  onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  required
                >
                  {mockEmployeesList.map((emp) => (
                    <option key={emp.empId} value={emp.empId}>
                      {emp.name} ({emp.empId}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deduction Category & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="Attendance Absence">Attendance Absence</option>
                    <option value="Disciplinary Fine">Disciplinary Fine</option>
                    <option value="Damage Fine">Damage Fine</option>
                    <option value="Statutory Deduction">Statutory (PF/ESI/TDS)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deduction Description *</label>
                  <input
                    type="text"
                    placeholder="e.g. Late Entry Penalty"
                    value={formData.deductionType}
                    onChange={(e) => setFormData({ ...formData, deductionType: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Frequency & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="One-Time">One-Time (This Month)</option>
                    <option value="Recurring Monthly">Recurring Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deduction Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Effective Month */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Effective Salary Period</label>
                <select
                  value={formData.monthYear}
                  onChange={(e) => setFormData({ ...formData, monthYear: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                </select>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Justification</label>
                <textarea
                  rows="2"
                  placeholder="Enter audit notes or approval justification..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Apply Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Detailed Breakdown Modal */}
      {selectedDetailDeduction && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Deduction Audit Log - {selectedDetailDeduction.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailDeduction(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Employee Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img src={selectedDetailDeduction.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <p className="font-bold text-slate-900">{selectedDetailDeduction.name}</p>
                  <p className="text-slate-500 font-mono">{selectedDetailDeduction.empId} • {selectedDetailDeduction.department}</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <p className="text-[10px] text-slate-400 font-sans font-bold">Total Amount</p>
                <p className="font-extrabold text-rose-600 text-sm">- {formatCurrency(selectedDetailDeduction.amount)}</p>
              </div>
            </div>

            {/* Audit Details List */}
            <div className="space-y-3 text-xs">
              <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Category:</span>
                  <span className="font-bold text-slate-800">{selectedDetailDeduction.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Deduction Type:</span>
                  <span className="font-bold text-slate-800">{selectedDetailDeduction.deductionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Approved / Logged By:</span>
                  <span className="font-semibold text-slate-700">{selectedDetailDeduction.approvedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Payroll Period:</span>
                  <span className="font-bold text-slate-900">{selectedDetailDeduction.monthYear}</span>
                </div>
              </div>

              {/* Justification / Notes */}
              <div className="bg-rose-50/60 border border-rose-100 p-3 rounded-xl">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">Reason & Audit Trail</p>
                <p className="text-slate-700 font-medium">{selectedDetailDeduction.reason}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDetailDeduction(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Audit Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Deductions;
