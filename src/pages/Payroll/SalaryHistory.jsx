import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoDownloadOutline,
  IoCalendarOutline,
  IoChevronDownOutline,
  IoArrowBackOutline,
  IoCheckmarkCircleOutline,
  IoWalletOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoEyeOutline,
  IoRefreshOutline,
  IoPrintOutline,
  IoCloseOutline,
  IoBusinessOutline
} from 'react-icons/io5';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import { Calendar } from '../../components/ui/calendar';
import toast from 'react-hot-toast';

const mockTransactionHistory = [
  {
    id: 'TXN-9021',
    date: '05 Sep 2026',
    monthYear: 'August 2026',
    empId: 'EMP-0004',
    name: 'Test Employee cook KYLM',
    email: 'test.cook@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    department: 'Kitchen',
    designation: 'Cook',
    gross: 25000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 25000.00,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: 'FT2609050012',
    status: 'PAID'
  },
  {
    id: 'TXN-9022',
    date: '05 Sep 2026',
    monthYear: 'August 2026',
    empId: 'EMP-0006',
    name: 'Manager Created Employee',
    email: 'manager.employee@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    department: 'Management',
    designation: 'Manager',
    gross: 25000.00,
    deductions: 833.33,
    advances: 0.00,
    net: 24166.67,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: 'FT2609050013',
    status: 'PAID'
  },
  {
    id: 'TXN-9023',
    date: '02 Sep 2026',
    monthYear: 'August 2026',
    empId: 'EMP-0007',
    name: 'aby',
    email: 'aby@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp3',
    department: 'Service',
    designation: 'Captain',
    gross: 18000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 18000.00,
    paymentMethod: 'Cash',
    referenceNo: 'CSH-882109',
    status: 'PAID'
  },
  {
    id: 'TXN-9024',
    date: '01 Sep 2026',
    monthYear: 'August 2026',
    empId: 'EMP-0008',
    name: 'asif',
    email: 'asif@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp4',
    department: 'Accounts',
    designation: 'Accountant',
    gross: 22000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 22000.00,
    paymentMethod: 'Google Pay',
    referenceNo: 'UPI-20260901-77',
    status: 'PAID'
  },
  {
    id: 'TXN-8910',
    date: '05 Aug 2026',
    monthYear: 'July 2026',
    empId: 'EMP-0004',
    name: 'Test Employee cook KYLM',
    email: 'test.cook@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    department: 'Kitchen',
    designation: 'Cook',
    gross: 25000.00,
    deductions: 0.00,
    advances: 2000.00,
    net: 23000.00,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: 'FT2608050099',
    status: 'PAID'
  },
  {
    id: 'TXN-8911',
    date: '05 Aug 2026',
    monthYear: 'July 2026',
    empId: 'EMP-0006',
    name: 'Manager Created Employee',
    email: 'manager.employee@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    department: 'Management',
    designation: 'Manager',
    gross: 25000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 25000.00,
    paymentMethod: 'Bank Transfer (Federal Bank)',
    referenceNo: 'FT2608050100',
    status: 'PAID'
  }
];

const formatCurrency = (amt) =>
  `₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalaryHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(mockTransactionHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [methodFilter, setMethodFilter] = useState('All Methods');
  const [selectedDate, setSelectedDate] = useState('2026-09-05');
  const [showCalendarPopover, setShowCalendarPopover] = useState(false);
  const datePickerRef = useRef(null);
  const [selectedPayslipTxn, setSelectedPayslipTxn] = useState(null);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowCalendarPopover(false);
      }
    };
    document.addEventListener('mousedown', handleGlobalClick);
    return () => document.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === 'All Departments' || t.department === departmentFilter;

    const matchesMethod =
      methodFilter === 'All Methods' || t.paymentMethod.toLowerCase().includes(methodFilter.toLowerCase());

    return matchesSearch && matchesDept && matchesMethod;
  });

  const totalDisbursed = filteredTransactions.reduce((acc, curr) => acc + curr.net, 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Payroll</span> &gt; <span className="text-slate-700">Salary Transaction History</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Salary Transaction History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Audit and track all historical salary disbursements across all employees and branches.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/payroll/salary')}
            className="px-3.5 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoArrowBackOutline size={16} /> Back to Salary
          </button>
          <button
            type="button"
            onClick={() => toast.success('Salary history exported to CSV!')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <IoDownloadOutline size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <IoWalletOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Disbursed</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalDisbursed)}</h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{filteredTransactions.length} transactions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IoCheckmarkCircleOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Successful Disbursed</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{filteredTransactions.length}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Settled</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <IoBusinessOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Bank Disbursed</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatCurrency(filteredTransactions.filter(t => t.paymentMethod.includes('Bank')).reduce((a, b) => a + b.net, 0))}
              </h3>
              <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Direct Deposit</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <IoCashOutline size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Cash / UPI Disbursed</p>
              <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatCurrency(filteredTransactions.filter(t => !t.paymentMethod.includes('Bank')).reduce((a, b) => a + b.net, 0))}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Other Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter & Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          {/* Search Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Record</label>
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

          {/* Payment Method Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All Methods">All Methods</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Google Pay">Google Pay / UPI</option>
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
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3.5 text-left align-middle">Txn Ref #</th>
                <th className="p-3.5 text-left align-middle">Date</th>
                <th className="p-3.5 text-left align-middle min-w-[220px]">Employee</th>
                <th className="p-3.5 text-left align-middle">Department</th>
                <th className="p-3.5 text-left align-middle">Period</th>
                <th className="p-3.5 text-right align-middle">Gross Salary</th>
                <th className="p-3.5 text-right align-middle">Deductions</th>
                <th className="p-3.5 text-right align-middle">Net Paid</th>
                <th className="p-3.5 text-left align-middle">Payment Method</th>
                <th className="p-3.5 text-center align-middle">Status</th>
                <th className="p-3.5 text-center align-middle">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {filteredTransactions.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 align-middle font-mono font-semibold text-blue-600 whitespace-nowrap">
                    {row.referenceNo}
                  </td>
                  <td className="p-3.5 align-middle text-slate-600 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="p-3.5 align-middle min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <img src={row.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 whitespace-nowrap">{row.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono whitespace-nowrap">{row.empId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap font-medium">
                    {row.department}
                  </td>
                  <td className="p-3.5 align-middle text-slate-600 whitespace-nowrap font-medium">
                    {row.monthYear}
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono text-slate-900 font-medium whitespace-nowrap">
                    {formatCurrency(row.gross)}
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono text-rose-600 font-medium whitespace-nowrap">
                    {formatCurrency(row.deductions)}
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono font-extrabold text-emerald-600 text-sm whitespace-nowrap">
                    {formatCurrency(row.net)}
                  </td>
                  <td className="p-3.5 align-middle text-slate-700 whitespace-nowrap font-medium">
                    {row.paymentMethod}
                  </td>
                  <td className="p-3.5 text-center align-middle whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-100 text-emerald-700 uppercase">
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center align-middle whitespace-nowrap">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/payroll/employee-salary-history?empId=${row.empId}`)}
                        className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                        title="View Per-Employee History"
                      >
                        <IoEyeOutline size={14} /> History
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPayslipTxn(row)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Download Payslip"
                      >
                        <BsFileEarmarkArrowUp size={15} className="rotate-180" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Al Naaz Payslip Document Modal */}
      {selectedPayslipTxn && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  Official Payslip
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {selectedPayslipTxn.referenceNo}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayslipTxn(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <IoCloseOutline size={22} />
              </button>
            </div>

            {/* Printable Payslip Card Body */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white space-y-6 shadow-2xs">
              
              {/* Company & Document Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl p-2 flex items-center justify-center shrink-0">
                    <img src="/logo/al-naaz-mandi-logo-transparent.png" alt="Al Naaz" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">AL NAAZ MANDI RESTAURANT</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Head Office • Group Operations & Payroll</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <h3 className="text-sm font-extrabold text-blue-700 uppercase tracking-wide">SALARY PAYSLIP</h3>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedPayslipTxn.monthYear}</p>
                </div>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Employee Name</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">{selectedPayslipTxn.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Employee ID</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedPayslipTxn.empId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPayslipTxn.department}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Designation</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPayslipTxn.designation || 'Staff'}</p>
                </div>
              </div>

              {/* Attendance & Payment Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 font-medium">Payment Date: </span>
                  <span className="font-bold text-slate-800">{selectedPayslipTxn.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Payment Method: </span>
                  <span className="font-bold text-slate-800">{selectedPayslipTxn.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Txn Reference: </span>
                  <span className="font-mono font-bold text-blue-600">{selectedPayslipTxn.referenceNo}</span>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-600">
                      <th className="p-3 w-1/2">Earnings Description</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 w-1/2 border-l border-slate-200">Deductions Description</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    <tr>
                      <td className="p-3">Basic Gross Salary</td>
                      <td className="p-3 text-right font-mono font-bold">{formatCurrency(selectedPayslipTxn.gross)}</td>
                      <td className="p-3 border-l border-slate-200">Absence Deductions</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">{formatCurrency(selectedPayslipTxn.deductions || 0)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">House & Allowances</td>
                      <td className="p-3 text-right font-mono font-bold">₹0.00</td>
                      <td className="p-3 border-l border-slate-200">Advance Recoveries</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">{formatCurrency(selectedPayslipTxn.advances || 0)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                      <td className="p-3 text-slate-700">Total Earnings</td>
                      <td className="p-3 text-right font-mono text-slate-900">{formatCurrency(selectedPayslipTxn.gross)}</td>
                      <td className="p-3 border-l border-slate-200 text-slate-700">Total Deductions</td>
                      <td className="p-3 text-right font-mono text-rose-600">{formatCurrency((selectedPayslipTxn.deductions || 0) + (selectedPayslipTxn.advances || 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Net Payable Banner */}
              <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">NET PAY DISBURSED</p>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Transferred directly to registered account</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">{formatCurrency(selectedPayslipTxn.net)}</p>
                </div>
              </div>

              {/* Signature Block */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-[11px] text-slate-500">
                <div className="border-t border-slate-200 pt-2 text-center">
                  <p className="font-bold text-slate-700">Employee Signature</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Received & Accepted</p>
                </div>
                <div className="border-t border-slate-200 pt-2 text-center">
                  <p className="font-bold text-slate-700">Authorized Signatory</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Al Naaz Payroll Department</p>
                </div>
              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPayslipTxn(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Printing payslip for ${selectedPayslipTxn.name}...`);
                  setSelectedPayslipTxn(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <IoPrintOutline size={16} /> Print / Download PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryHistory;
