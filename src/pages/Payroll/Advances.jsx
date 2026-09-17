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
  IoChevronForwardOutline
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

const mockAdvancesData = [
  {
    id: 'ADV-2026-042',
    requestDate: '01 Sep 2026',
    disbursementDate: '02 Sep 2026',
    empId: 'EMP-0004',
    name: 'Test Employee cook KYLM',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    department: 'Kitchen',
    designation: 'Head Cook',
    advanceType: 'Emergency Salary Advance',
    totalAmount: 20000.00,
    monthlyInstallment: 5000.00,
    tenureMonths: 4,
    repaidAmount: 5000.00,
    remainingBalance: 15000.00,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: 'FT2609020911',
    reason: 'Family medical emergency',
    status: 'APPROVED',
    approvedBy: 'Admin User',
    repaymentSchedule: [
      { month: 'Sep 2026', amount: 5000.00, status: 'PAID', date: '05 Sep 2026', refNo: 'PAY-SEP-004' },
      { month: 'Oct 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' },
      { month: 'Nov 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' },
      { month: 'Dec 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' }
    ]
  },
  {
    id: 'ADV-2026-051',
    requestDate: '10 Sep 2026',
    disbursementDate: '-',
    empId: 'EMP-0006',
    name: 'Manager Created Employee',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    department: 'Management',
    designation: 'Assistant Manager',
    advanceType: 'Personal Loan',
    totalAmount: 50000.00,
    monthlyInstallment: 5000.00,
    tenureMonths: 10,
    repaidAmount: 0.00,
    remainingBalance: 50000.00,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: '-',
    reason: 'Home renovation expenses',
    status: 'PENDING',
    approvedBy: '-',
    repaymentSchedule: [
      { month: 'Oct 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' },
      { month: 'Nov 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' },
      { month: 'Dec 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' }
    ]
  },
  {
    id: 'ADV-2026-033',
    requestDate: '15 Jul 2026',
    disbursementDate: '16 Jul 2026',
    empId: 'EMP-0007',
    name: 'aby',
    avatar: 'https://i.pravatar.cc/150?u=emp3',
    department: 'Service',
    designation: 'Captain',
    advanceType: 'Salary Advance',
    totalAmount: 10000.00,
    monthlyInstallment: 5000.00,
    tenureMonths: 2,
    repaidAmount: 10000.00,
    remainingBalance: 0.00,
    paymentMethod: 'Cash Disbursement',
    referenceNo: 'CSH-772105',
    reason: 'Festival & personal needs',
    status: 'REPAID',
    approvedBy: 'HR Manager',
    repaymentSchedule: [
      { month: 'Aug 2026', amount: 5000.00, status: 'PAID', date: '02 Aug 2026', refNo: 'CSH-882109' },
      { month: 'Sep 2026', amount: 5000.00, status: 'PAID', date: '02 Sep 2026', refNo: 'CSH-991204' }
    ]
  },
  {
    id: 'ADV-2026-058',
    requestDate: '08 Sep 2026',
    disbursementDate: '09 Sep 2026',
    empId: 'EMP-0008',
    name: 'asif',
    avatar: 'https://i.pravatar.cc/150?u=emp4',
    department: 'Accounts',
    designation: 'Accountant',
    advanceType: 'Salary Advance',
    totalAmount: 15000.00,
    monthlyInstallment: 5000.00,
    tenureMonths: 3,
    repaidAmount: 0.00,
    remainingBalance: 15000.00,
    paymentMethod: 'Google Pay (UPI)',
    referenceNo: 'UPI-20260909-88',
    reason: 'Course fee payment',
    status: 'APPROVED',
    approvedBy: 'Admin User',
    repaymentSchedule: [
      { month: 'Oct 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' },
      { month: 'Nov 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' },
      { month: 'Dec 2026', amount: 5000.00, status: 'PENDING', date: '-', refNo: '-' }
    ]
  },
  {
    id: 'ADV-2026-060',
    requestDate: '12 Sep 2026',
    disbursementDate: '-',
    empId: 'EMP-0009',
    name: 'Rashid Khan',
    avatar: 'https://i.pravatar.cc/150?u=emp5',
    department: 'Kitchen',
    designation: 'Sous Chef',
    advanceType: 'Emergency Advance',
    totalAmount: 30000.00,
    monthlyInstallment: 6000.00,
    tenureMonths: 5,
    repaidAmount: 0.00,
    remainingBalance: 30000.00,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: '-',
    reason: 'Vehicle repair',
    status: 'PENDING',
    approvedBy: '-',
    repaymentSchedule: [
      { month: 'Oct 2026', amount: 6000.00, status: 'PENDING', date: '-', refNo: '-' }
    ]
  }
];

const formatCurrency = (amount) =>
  `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const Advances = () => {
  const [advancesList, setAdvancesList] = useState(mockAdvancesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [selectedDate, setSelectedDate] = useState('2026-09-14');
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const datePickerRef = useRef(null);

  // Modals state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedLedgerAdvance, setSelectedLedgerAdvance] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    empId: 'EMP-0004',
    advanceType: 'Emergency Salary Advance',
    totalAmount: '',
    monthlyInstallment: '',
    tenureMonths: '3',
    paymentMethod: 'Bank Transfer (Federal Bank)',
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
  const filteredAdvances = advancesList.filter((adv) => {
    const matchesSearch =
      adv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (adv.referenceNo && adv.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All Status' || adv.status.toUpperCase() === statusFilter.toUpperCase();

    const matchesDept =
      departmentFilter === 'All Departments' || adv.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Calculate Metrics
  const totalOutstanding = advancesList
    .filter((a) => a.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.remainingBalance, 0);

  const totalDisbursedThisMonth = advancesList
    .filter((a) => a.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const pendingRequests = advancesList.filter((a) => a.status === 'PENDING');
  const pendingAmount = pendingRequests.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalRecovered = advancesList.reduce((acc, curr) => acc + curr.repaidAmount, 0);

  // Handle Approve Action
  const handleApprove = (advId) => {
    setAdvancesList((prev) =>
      prev.map((item) => {
        if (item.id === advId) {
          return {
            ...item,
            status: 'APPROVED',
            approvedBy: 'Admin User',
            disbursementDate: '14 Sep 2026',
            referenceNo: `FT260914${Math.floor(1000 + Math.random() * 9000)}`
          };
        }
        return item;
      })
    );
    toast.success(`Advance ${advId} has been approved and scheduled for disbursement!`);
  };

  // Handle Reject Action
  const handleReject = (advId) => {
    setAdvancesList((prev) =>
      prev.map((item) => {
        if (item.id === advId) {
          return { ...item, status: 'REJECTED', approvedBy: 'Admin User' };
        }
        return item;
      })
    );
    toast.error(`Advance request ${advId} has been rejected.`);
  };

  // Submit New Request
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      toast.error('Please enter a valid advance amount');
      return;
    }

    const selectedEmp = mockEmployeesList.find((e) => e.empId === formData.empId) || mockEmployeesList[0];
    const amountVal = parseFloat(formData.totalAmount);
    const tenureVal = parseInt(formData.tenureMonths, 10) || 3;
    const installmentVal = parseFloat(formData.monthlyInstallment) || amountVal / tenureVal;

    const newAdvance = {
      id: `ADV-2026-${Math.floor(100 + Math.random() * 900)}`,
      requestDate: '14 Sep 2026',
      disbursementDate: '-',
      empId: selectedEmp.empId,
      name: selectedEmp.name,
      avatar: `https://i.pravatar.cc/150?u=${selectedEmp.empId}`,
      department: selectedEmp.department,
      designation: selectedEmp.designation,
      advanceType: formData.advanceType,
      totalAmount: amountVal,
      monthlyInstallment: installmentVal,
      tenureMonths: tenureVal,
      repaidAmount: 0.00,
      remainingBalance: amountVal,
      paymentMethod: formData.paymentMethod,
      referenceNo: '-',
      reason: formData.reason || 'Employee salary advance request',
      status: 'PENDING',
      approvedBy: '-',
      repaymentSchedule: Array.from({ length: tenureVal }).map((_, idx) => ({
        month: `Month ${idx + 1}`,
        amount: installmentVal,
        status: 'PENDING',
        date: '-',
        refNo: '-'
      }))
    };

    setAdvancesList([newAdvance, ...advancesList]);
    setShowRequestModal(false);
    toast.success(`Advance request ${newAdvance.id} created successfully!`);
    setFormData({
      empId: 'EMP-0004',
      advanceType: 'Emergency Salary Advance',
      totalAmount: '',
      monthlyInstallment: '',
      tenureMonths: '3',
      paymentMethod: 'Bank Transfer (Federal Bank)',
      reason: ''
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Payroll</span> &gt; <span className="text-slate-700">Salary Advances & Loans</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Salary Advances & Loans
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage employee advance requests, approval workflows, disbursement tracking, and payroll deductions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toast.success('Advance report exported to CSV')}
            className="px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoDownloadOutline size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoAddOutline size={18} /> Request / Disburse Advance
          </button>
        </div>
      </div>

      {/* 2. Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outstanding Advance Balance */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <IoWalletOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Active Balance</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalOutstanding)}</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Outstanding Balance</p>
            </div>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <IoCashOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Approved</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalDisbursedThisMonth)}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Disbursed Advances</p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <IoTimeOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Pending Approval</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{pendingRequests.length} Requests</h3>
              <p className="text-[11px] text-orange-600 font-semibold mt-0.5">{formatCurrency(pendingAmount)} Awaiting</p>
            </div>
          </div>
        </div>

        {/* Recovered via Payroll */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IoCheckmarkCircleOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Recovered</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalRecovered)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Deducted in Payroll</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Data Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Advance</label>
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search Employee, ID, Ref #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REPAID">Repaid</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Date Picker Filter */}
          <div className="relative" ref={datePickerRef}>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Filter Date</label>
            <button
              type="button"
              onClick={() => setShowCalendarPopover(!showCalendarPopover)}
              className="w-full flex items-center justify-between text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-800 hover:border-blue-400 focus:outline-none transition-all font-semibold shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <IoCalendarOutline size={15} className="text-blue-600" />
                <span>{selectedDate}</span>
              </div>
              <IoChevronDownOutline
                className={`text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
                  showCalendarPopover ? 'rotate-180' : ''
                }`}
                size={13}
              />
            </button>

            {showCalendarPopover && (
              <div className="absolute right-0 mt-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <Calendar
                  value={selectedDate}
                  onChange={(newDate) => {
                    setSelectedDate(newDate);
                    setShowCalendarPopover(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Reset Filters */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All Status');
                setDepartmentFilter('All Departments');
              }}
              className="w-full py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Advances Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1150px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3.5 text-left align-middle">Advance Ref #</th>
                <th className="p-3.5 text-left align-middle min-w-[220px]">Employee</th>
                <th className="p-3.5 text-left align-middle">Advance Type</th>
                <th className="p-3.5 text-right align-middle">Total Amount</th>
                <th className="p-3.5 text-right align-middle">Monthly Deduct</th>
                <th className="p-3.5 text-right align-middle">Remaining Balance</th>
                <th className="p-3.5 text-left align-middle">Disbursement Account</th>
                <th className="p-3.5 text-center align-middle">Status</th>
                <th className="p-3.5 text-center align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400 font-medium">
                    No salary advances found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 align-middle whitespace-nowrap">
                      <p className="font-mono font-bold text-blue-600">{row.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Req: {row.requestDate}</p>
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

                    <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap font-medium">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {row.advanceType}
                      </span>
                    </td>

                    <td className="p-3.5 text-right align-middle font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(row.totalAmount)}
                    </td>

                    <td className="p-3.5 text-right align-middle font-mono text-slate-700 whitespace-nowrap">
                      {formatCurrency(row.monthlyInstallment)} / mo
                      <p className="text-[10px] text-slate-400 font-sans">{row.tenureMonths} Months Tenure</p>
                    </td>

                    <td className="p-3.5 text-right align-middle font-mono font-black whitespace-nowrap">
                      {row.remainingBalance > 0 ? (
                        <span className="text-amber-600">{formatCurrency(row.remainingBalance)}</span>
                      ) : (
                        <span className="text-emerald-600">₹0.00 (Settled)</span>
                      )}
                    </td>

                    <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap font-medium">
                      <p className="text-xs text-slate-800 font-semibold">{row.paymentMethod}</p>
                      <p className="text-[10px] font-mono text-slate-400">{row.referenceNo}</p>
                    </td>

                    <td className="p-3.5 text-center align-middle whitespace-nowrap">
                      {row.status === 'APPROVED' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                          APPROVED
                        </span>
                      )}
                      {row.status === 'PENDING' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-orange-100 text-orange-600 uppercase tracking-wider">
                          PENDING
                        </span>
                      )}
                      {row.status === 'REPAID' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-blue-100 text-blue-700 uppercase tracking-wider">
                          REPAID
                        </span>
                      )}
                      {row.status === 'REJECTED' && (
                        <span className="inline-flex px-2.5 py-1 text-[10px] font-extrabold rounded-md bg-rose-100 text-rose-700 uppercase tracking-wider">
                          REJECTED
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center align-middle whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedLedgerAdvance(row)}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Recovery Ledger & Schedule"
                        >
                          <IoEyeOutline size={14} /> Schedule
                        </button>

                        {row.status === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(row.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200 cursor-pointer"
                              title="Approve Advance"
                            >
                              <IoCheckmarkDoneOutline size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(row.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                              title="Reject Request"
                            >
                              <IoCloseCircleOutline size={16} />
                            </button>
                          </>
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
          <span className="text-xs text-slate-500 font-medium">Showing {filteredAdvances.length} of {advancesList.length} advance entries</span>
          <div className="flex items-center gap-2">
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 disabled:opacity-50">
              <IoChevronBackOutline size={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-xs">
              1
            </button>
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 disabled:opacity-50">
              <IoChevronForwardOutline size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Request / Disburse Advance Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <IoAddOutline size={18} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Request / Issue Salary Advance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
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
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                >
                  {mockEmployeesList.map((emp) => (
                    <option key={emp.empId} value={emp.empId}>
                      {emp.name} ({emp.empId}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Advance Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance Category</label>
                  <select
                    value={formData.advanceType}
                    onChange={(e) => setFormData({ ...formData, advanceType: e.target.value })}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="Emergency Salary Advance">Emergency Salary Advance</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Medical Advance">Medical Advance</option>
                    <option value="Festival Advance">Festival Advance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Advance Amount (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 20000"
                    value={formData.totalAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      const tenure = parseInt(formData.tenureMonths, 10) || 1;
                      const inst = val ? (parseFloat(val) / tenure).toFixed(2) : '';
                      setFormData({ ...formData, totalAmount: val, monthlyInstallment: inst });
                    }}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Tenure & Monthly Recovery */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Repayment Tenure (Months)</label>
                  <select
                    value={formData.tenureMonths}
                    onChange={(e) => {
                      const tenure = parseInt(e.target.value, 10);
                      const tot = parseFloat(formData.totalAmount) || 0;
                      const inst = tot > 0 ? (tot / tenure).toFixed(2) : '';
                      setFormData({ ...formData, tenureMonths: e.target.value, monthlyInstallment: inst });
                    }}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="1">1 Month (Full Deduct)</option>
                    <option value="2">2 Months</option>
                    <option value="3">3 Months</option>
                    <option value="4">4 Months</option>
                    <option value="6">6 Months</option>
                    <option value="10">10 Months</option>
                    <option value="12">12 Months</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Salary Deduction (₹)</label>
                  <input
                    type="number"
                    readOnly
                    value={formData.monthlyInstallment}
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-700"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              {/* Payment Account */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Disbursement Account / Mode</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Bank Transfer (Federal Bank)">Bank Transfer (Federal Bank)</option>
                  <option value="Cash Disbursement">Cash Disbursement</option>
                  <option value="Google Pay (UPI)">Google Pay (UPI)</option>
                </select>
              </div>

              {/* Purpose / Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Request</label>
                <textarea
                  rows="2"
                  placeholder="Enter reason or medical/personal justification..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. View Repayment Schedule Drawer / Modal */}
      {selectedLedgerAdvance && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <IoDocumentTextOutline className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Advance Recovery Schedule - {selectedLedgerAdvance.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLedgerAdvance(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Advance Header Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img src={selectedLedgerAdvance.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                <div>
                  <p className="font-bold text-slate-900">{selectedLedgerAdvance.name}</p>
                  <p className="text-slate-500 font-mono">{selectedLedgerAdvance.empId} • {selectedLedgerAdvance.department}</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <p className="text-[10px] text-slate-400 uppercase font-sans font-bold">Total Advance</p>
                <p className="font-extrabold text-slate-900 text-sm">{formatCurrency(selectedLedgerAdvance.totalAmount)}</p>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600">
                    <th className="p-3">Salary Period</th>
                    <th className="p-3 text-right">Deduction Amount</th>
                    <th className="p-3 text-center">Recovery Status</th>
                    <th className="p-3 text-left">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {selectedLedgerAdvance.repaymentSchedule.map((sch, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{sch.month}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-800">{formatCurrency(sch.amount)}</td>
                      <td className="p-3 text-center">
                        {sch.status === 'PAID' ? (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-700">
                            RECOVERED
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-700">
                            UPCOMING
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-500 text-[11px]">{sch.refNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Printing repayment schedule for ${selectedLedgerAdvance.id}...`);
                  setSelectedLedgerAdvance(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <IoPrintOutline size={16} /> Print Schedule
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Advances;
