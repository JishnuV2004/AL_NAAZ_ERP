import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoCloseOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoCardOutline,
  IoFilterOutline
} from 'react-icons/io5';
import { BsFileEarmarkArrowUp } from 'react-icons/bs';
import toast from 'react-hot-toast';

const mockAllEmployeesHistory = {
  'EMP-0004': {
    empId: 'EMP-0004',
    name: 'Test Employee cook KYLM',
    email: 'test.cook@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    department: 'Kitchen',
    designation: 'Head Cook',
    salaryType: 'MONTHLY',
    joiningDate: '15 Jan 2025',
    bankDetails: 'Federal Bank • **** 4821',
    baseSalary: 25000.00,
    history: [
      {
        monthYear: 'August 2026',
        paymentDate: '05 Sep 2026',
        workingDays: 30,
        daysPresent: 29,
        daysAbsent: 1,
        leaveDays: 0,
        gross: 25000.00,
        deductions: 0.00,
        advances: 0.00,
        net: 25000.00,
        paymentMethod: 'Bank Transfer (Federal Bank)',
        referenceNo: 'FT2609050012',
        status: 'PAID'
      },
      {
        monthYear: 'July 2026',
        paymentDate: '05 Aug 2026',
        workingDays: 31,
        daysPresent: 28,
        daysAbsent: 1,
        leaveDays: 2,
        gross: 25000.00,
        deductions: 0.00,
        advances: 2000.00,
        net: 23000.00,
        paymentMethod: 'Bank Transfer (Federal Bank)',
        referenceNo: 'FT2608050099',
        status: 'PAID'
      },
      {
        monthYear: 'June 2026',
        paymentDate: '04 Jul 2026',
        workingDays: 30,
        daysPresent: 30,
        daysAbsent: 0,
        leaveDays: 0,
        gross: 25000.00,
        deductions: 0.00,
        advances: 0.00,
        net: 25000.00,
        paymentMethod: 'Bank Transfer (Federal Bank)',
        referenceNo: 'FT2607040081',
        status: 'PAID'
      },
      {
        monthYear: 'May 2026',
        paymentDate: '05 Jun 2026',
        workingDays: 31,
        daysPresent: 30,
        daysAbsent: 1,
        leaveDays: 0,
        gross: 25000.00,
        deductions: 806.45,
        advances: 0.00,
        net: 24193.55,
        paymentMethod: 'Bank Transfer (Federal Bank)',
        referenceNo: 'FT2606050044',
        status: 'PAID'
      }
    ]
  },
  'EMP-0006': {
    empId: 'EMP-0006',
    name: 'Manager Created Employee',
    email: 'manager.employee@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    department: 'Management',
    designation: 'Assistant Manager',
    salaryType: 'MONTHLY',
    joiningDate: '01 Mar 2025',
    bankDetails: 'Federal Bank • **** 9012',
    baseSalary: 25000.00,
    history: [
      {
        monthYear: 'August 2026',
        paymentDate: '05 Sep 2026',
        workingDays: 30,
        daysPresent: 29,
        daysAbsent: 0,
        leaveDays: 1,
        gross: 25000.00,
        deductions: 833.33,
        advances: 0.00,
        net: 24166.67,
        paymentMethod: 'Bank Transfer (Federal Bank)',
        referenceNo: 'FT2609050013',
        status: 'PAID'
      },
      {
        monthYear: 'July 2026',
        paymentDate: '05 Aug 2026',
        workingDays: 31,
        daysPresent: 31,
        daysAbsent: 0,
        leaveDays: 0,
        gross: 25000.00,
        deductions: 0.00,
        advances: 0.00,
        net: 25000.00,
        paymentMethod: 'Bank Transfer (Federal Bank)',
        referenceNo: 'FT2608050100',
        status: 'PAID'
      }
    ]
  },
  'EMP-0007': {
    empId: 'EMP-0007',
    name: 'aby',
    email: 'aby@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp3',
    department: 'Service',
    designation: 'Captain',
    salaryType: 'DAILY',
    joiningDate: '10 May 2025',
    bankDetails: 'Cash Disbursement',
    baseSalary: 18000.00,
    history: [
      {
        monthYear: 'August 2026',
        paymentDate: '02 Sep 2026',
        workingDays: 26,
        daysPresent: 26,
        daysAbsent: 0,
        leaveDays: 0,
        gross: 18000.00,
        deductions: 0.00,
        advances: 0.00,
        net: 18000.00,
        paymentMethod: 'Cash',
        referenceNo: 'CSH-882109',
        status: 'PAID'
      }
    ]
  },
  'EMP-0008': {
    empId: 'EMP-0008',
    name: 'asif',
    email: 'asif@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp4',
    department: 'Accounts',
    designation: 'Accountant',
    salaryType: 'MONTHLY',
    joiningDate: '01 Jun 2025',
    bankDetails: 'Google Pay • 9876543210',
    baseSalary: 22000.00,
    history: [
      {
        monthYear: 'August 2026',
        paymentDate: '01 Sep 2026',
        workingDays: 30,
        daysPresent: 29,
        daysAbsent: 1,
        leaveDays: 0,
        gross: 22000.00,
        deductions: 0.00,
        advances: 0.00,
        net: 22000.00,
        paymentMethod: 'Google Pay',
        referenceNo: 'UPI-20260901-77',
        status: 'PAID'
      }
    ]
  }
};

const formatCurrency = (amt) =>
  `₹${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const EmployeeSalaryHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentEmpId = searchParams.get('empId') || 'EMP-0004';

  const employeeData = mockAllEmployeesHistory[currentEmpId] || mockAllEmployeesHistory['EMP-0004'];
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const totalEarnings = employeeData.history.reduce((a, b) => a + b.net, 0);
  const totalDeductions = employeeData.history.reduce((a, b) => a + b.deductions + b.advances, 0);
  const avgMonthlyPay = employeeData.history.length > 0 ? totalEarnings / employeeData.history.length : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Navigation Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <span>Payroll</span> &gt; <span>Salary</span> &gt; <span className="text-slate-700">Per-Employee History</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/payroll/salary')}
            className="p-2.5 bg-white text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 hover:border-blue-200 transition-all flex items-center justify-center shrink-0 cursor-pointer"
            title="Back to Salary"
          >
            <IoArrowBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Employee Salary History
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Individual salary ledger, disbursement logs, and payslips for {employeeData.name}.
            </p>
          </div>
        </div>
      </div>

      {/* Employee Profile Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={employeeData.avatar}
            alt={employeeData.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{employeeData.name}</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                {employeeData.empId}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {employeeData.designation} • {employeeData.department} Department
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span><strong className="text-slate-700">Salary Type:</strong> {employeeData.salaryType}</span>
              <span>•</span>
              <span><strong className="text-slate-700">Joined:</strong> {employeeData.joiningDate}</span>
              <span>•</span>
              <span><strong className="text-slate-700">Bank:</strong> {employeeData.bankDetails}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/80 shrink-0 w-full md:w-auto text-left md:text-right">
          <p className="text-[11px] font-semibold text-slate-500 mb-0.5">Base Salary Contract</p>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatCurrency(employeeData.baseSalary)}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">Monthly Payroll Rate</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Total Lifetime Paid</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalEarnings)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{employeeData.history.length} Months Processed</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoCalendarOutline size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Months Processed</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{employeeData.history.length} Months</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Continuous Disbursement</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Avg Monthly Payout</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(avgMonthlyPay)}</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">Net Average</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoCardOutline size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Deductions / Advances</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{formatCurrency(totalDeductions)}</h3>
            <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Total Deducted</p>
          </div>
        </div>
      </div>

      {/* Salary History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Salary Disbursement Ledger</h3>
          <span className="text-xs font-semibold text-slate-500">Showing {employeeData.history.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3.5 text-left align-middle">Salary Period</th>
                <th className="p-3.5 text-left align-middle">Disbursement Date</th>
                <th className="p-3.5 text-center align-middle">Days Present / Absent</th>
                <th className="p-3.5 text-right align-middle">Gross Pay</th>
                <th className="p-3.5 text-right align-middle">Deductions</th>
                <th className="p-3.5 text-right align-middle">Advances Settled</th>
                <th className="p-3.5 text-right align-middle">Net Paid</th>
                <th className="p-3.5 text-left align-middle">Payment Method</th>
                <th className="p-3.5 text-center align-middle">Status</th>
                <th className="p-3.5 text-center align-middle">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {employeeData.history.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 align-middle font-bold text-slate-900 whitespace-nowrap">
                    {row.monthYear}
                  </td>
                  <td className="p-3.5 align-middle text-slate-600 whitespace-nowrap">
                    {row.paymentDate}
                  </td>
                  <td className="p-3.5 text-center align-middle whitespace-nowrap font-medium">
                    <span className="text-emerald-600 font-bold">{row.daysPresent}P</span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-rose-500 font-bold">{row.daysAbsent}A</span>
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono font-medium text-slate-900 whitespace-nowrap">
                    {formatCurrency(row.gross)}
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono text-slate-600 whitespace-nowrap">
                    {formatCurrency(row.deductions)}
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono text-rose-600 whitespace-nowrap">
                    {formatCurrency(row.advances)}
                  </td>
                  <td className="p-3.5 text-right align-middle font-mono font-black text-emerald-600 text-sm whitespace-nowrap">
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
                    <button
                      type="button"
                      onClick={() => setSelectedPayslip({ ...row, employee: employeeData })}
                      className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <BsFileEarmarkArrowUp size={13} className="rotate-180" /> View Payslip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Al Naaz Payslip Document Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto font-sans relative">
            
            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                  Official Payslip
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {selectedPayslip.referenceNo || 'FT2609050012'}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
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
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedPayslip.monthYear || 'August 2026'}</p>
                </div>
              </div>

              {/* Employee Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Employee Name</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">{selectedPayslip.employee?.name || selectedPayslip.name}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Employee ID</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedPayslip.employee?.empId || selectedPayslip.empId}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPayslip.employee?.department || selectedPayslip.department}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Designation</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedPayslip.employee?.designation || selectedPayslip.designation || 'Staff'}</p>
                </div>
              </div>

              {/* Attendance & Payment Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 font-medium">Payment Date: </span>
                  <span className="font-bold text-slate-800">{selectedPayslip.paymentDate || selectedPayslip.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Payment Method: </span>
                  <span className="font-bold text-slate-800">{selectedPayslip.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Txn Reference: </span>
                  <span className="font-mono font-bold text-blue-600">{selectedPayslip.referenceNo}</span>
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
                      <td className="p-3 text-right font-mono font-bold">{formatCurrency(selectedPayslip.gross)}</td>
                      <td className="p-3 border-l border-slate-200">Absence Deductions</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">{formatCurrency(selectedPayslip.deductions || 0)}</td>
                    </tr>
                    <tr>
                      <td className="p-3">House & Allowances</td>
                      <td className="p-3 text-right font-mono font-bold">₹0.00</td>
                      <td className="p-3 border-l border-slate-200">Advance Recoveries</td>
                      <td className="p-3 text-right font-mono text-rose-600 font-bold">{formatCurrency(selectedPayslip.advances || 0)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                      <td className="p-3 text-slate-700">Total Earnings</td>
                      <td className="p-3 text-right font-mono text-slate-900">{formatCurrency(selectedPayslip.gross)}</td>
                      <td className="p-3 border-l border-slate-200 text-slate-700">Total Deductions</td>
                      <td className="p-3 text-right font-mono text-rose-600">{formatCurrency((selectedPayslip.deductions || 0) + (selectedPayslip.advances || 0))}</td>
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
                  <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">{formatCurrency(selectedPayslip.net)}</p>
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
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`Printing payslip for ${selectedPayslip.monthYear}...`);
                  setSelectedPayslip(null);
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

export default EmployeeSalaryHistory;
