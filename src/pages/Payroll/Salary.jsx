import React, { useState } from 'react';
import { 
  IoPeopleOutline, 
  IoCheckmarkCircleOutline, 
  IoTimeOutline, 
  IoWalletOutline, 
  IoDocumentTextOutline, 
  IoCashOutline,
  IoFilterOutline,
  IoSearchOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoEyeOutline,
  IoEllipsisVerticalOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline
} from 'react-icons/io5';
import { BsFileEarmarkArrowUp } from "react-icons/bs";

const mockSalaryData = [
  {
    id: 1,
    name: 'Test Employee cook KYLM',
    email: 'test.cook@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    empId: 'EMP-0004',
    department: 'Kitchen',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 1, absent: 1 },
    leaveHalf: { leave: 0, half: 0 },
    gross: 25000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 25000.00,
    status: 'PENDING',
    paymentDate: '-'
  },
  {
    id: 2,
    name: 'Manager Created Employee',
    email: 'manager.employee@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    empId: 'EMP-0006',
    department: 'Management',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 1, absent: 0 },
    leaveHalf: { leave: 1, half: 0 },
    gross: 25000.00,
    deductions: 833.33,
    advances: 0.00,
    net: 24166.67,
    status: 'PENDING',
    paymentDate: '-'
  },
  {
    id: 3,
    name: 'aby',
    email: 'aby@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp3',
    empId: 'EMP-0007',
    department: 'Service',
    salaryType: 'DAILY',
    workingDays: 26,
    presentAbsent: { present: 1, absent: 0 },
    leaveHalf: { leave: 0, half: 0 },
    gross: 18000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 18000.00,
    status: 'PENDING',
    paymentDate: '-'
  },
  {
    id: 4,
    name: 'asif',
    email: 'asif@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp4',
    empId: 'EMP-0008',
    department: 'Accounts',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 0, absent: 1 },
    leaveHalf: { leave: 0, half: 0 },
    gross: 22000.00,
    deductions: 0.00,
    advances: 0.00,
    net: 22000.00,
    status: 'PENDING',
    paymentDate: '-'
  }
];

const formatCurrency = (amount) => {
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Salary = () => {
  const [activeTab, setActiveTab] = useState('Salary List');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoPeopleOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Employees</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">128</p>
            <p className="text-[10px] text-blue-600 font-medium mt-0.5">Active Employees</p>
          </div>
        </div>

        {/* Paid Salaries */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoCheckmarkCircleOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Paid Salaries (Sep)</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">72</p>
            <p className="text-[10px] text-green-600 font-medium mt-0.5">View Paid</p>
          </div>
        </div>

        {/* Pending Salaries */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoTimeOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Pending Salaries (Sep)</p>
            <p className="text-xl font-bold text-gray-900 leading-tight">56</p>
            <p className="text-[10px] text-orange-600 font-medium mt-0.5">View Pending</p>
          </div>
        </div>

        {/* Total Payroll */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoWalletOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Payroll (Sep)</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">3,245,750</p>
            <p className="text-[10px] text-purple-600 font-medium mt-0.5">Gross Amount</p>
          </div>
        </div>

        {/* Net Payroll */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoDocumentTextOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Net Payroll (Sep)</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">2,925,430</p>
            <p className="text-[10px] text-teal-600 font-medium mt-0.5">After Deductions</p>
          </div>
        </div>

        {/* Advances */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <IoCashOutline size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Advances (Approved)</p>
            <p className="text-lg font-bold text-gray-900 leading-tight">320,320</p>
            <p className="text-[10px] text-rose-600 font-medium mt-0.5">This Month</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* 2. Tab Navigation */}
        <div className="flex px-4 border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
          {['Salary List', 'Generate Salary', 'Generate All', 'Dashboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-4 text-sm font-semibold transition-colors relative ${
                activeTab === tab 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* 3. Filter Bar */}
        <div className="p-5 border-b border-gray-100 bg-white grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Month</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>September</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Year</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>2026</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>All Branches</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>All Departments</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>All Status</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Salary Type</label>
            <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-500">
              <option>All Types</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search employee..." 
                className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="h-[38px] px-3 bg-white border border-gray-200 rounded-lg text-blue-600 flex items-center gap-1 hover:bg-blue-50 transition-colors">
              <IoFilterOutline />
            </button>
            <button className="h-[38px] px-3 bg-white border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* 4. Action Bar */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm">
              <IoAddOutline size={18} /> Generate Salary
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-blue-600 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
              <BsFileEarmarkArrowUp size={16} /> Generate All
            </button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-blue-600 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm">
              <IoDownloadOutline size={18} /> Export
            </button>
          </div>
        </div>

        {/* 5. Detailed Salary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 w-12 text-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="p-4">Employee</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Salary Type</th>
                <th className="p-4 text-center">Working<br/>Days</th>
                <th className="p-4 text-center">Present /<br/>Absent</th>
                <th className="p-4 text-center">Leave /<br/>Half</th>
                <th className="p-4 text-right">Gross Salary</th>
                <th className="p-4 text-right">Deductions</th>
                <th className="p-4 text-right">Advances</th>
                <th className="p-4 text-right">Net Salary</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Payment Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-sm">
              {mockSalaryData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={row.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover shadow-sm" />
                      <div>
                        <p className="font-semibold text-gray-900">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 font-medium">{row.empId}</td>
                  <td className="p-4 text-gray-600">{row.department}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded capitalize tracking-wider ${
                      row.salaryType === 'MONTHLY' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {row.salaryType}
                    </span>
                  </td>
                  <td className="p-4 text-center font-medium text-gray-700">{row.workingDays}</td>
                  <td className="p-4 text-center">
                    <span className={`font-semibold ${row.presentAbsent.present > 0 ? 'text-green-600' : 'text-gray-400'}`}>{row.presentAbsent.present}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className={`font-semibold ${row.presentAbsent.absent > 0 ? 'text-red-500' : 'text-gray-400'}`}>{row.presentAbsent.absent}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`font-semibold ${row.leaveHalf.leave > 0 ? 'text-blue-500' : 'text-gray-400'}`}>{row.leaveHalf.leave}</span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className={`font-semibold ${row.leaveHalf.half > 0 ? 'text-orange-400' : 'text-gray-400'}`}>{row.leaveHalf.half}</span>
                  </td>
                  <td className="p-4 text-right text-gray-900 font-medium">{formatCurrency(row.gross)}</td>
                  <td className="p-4 text-right text-gray-600">{formatCurrency(row.deductions)}</td>
                  <td className="p-4 text-right text-gray-600">{formatCurrency(row.advances)}</td>
                  <td className="p-4 text-right font-bold text-emerald-600">{formatCurrency(row.net)}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex px-2 py-1 text-[10px] font-bold rounded-md bg-orange-100 text-orange-600 uppercase tracking-wider">
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-gray-500">{row.paymentDate}</td>
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-1">
                      <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                        <IoEyeOutline size={16} />
                      </button>
                      <button className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100">
                        <BsFileEarmarkArrowUp size={14} className="rotate-180" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                        <IoEllipsisVerticalOutline size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white">
          <span className="text-sm text-gray-500">Showing 1 to 4 of 4 entries</span>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50">
              <IoChevronBackOutline size={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50">
              <IoChevronForwardOutline size={14} />
            </button>
            <select className="ml-2 border border-gray-200 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:border-blue-500 text-gray-600">
              <option>10 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. Salary Workflow Diagram */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-6">Salary Workflow</h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between relative">
          {/* Connector Line (hidden on mobile) */}
          <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-gray-100 -z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">1</div>
            <h4 className="text-sm font-bold text-blue-600">Generate Salary</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Generate salary for one or all employees</p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">2</div>
            <h4 className="text-sm font-bold text-emerald-600">Review & Verify</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Review generated salaries and deductions</p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">3</div>
            <h4 className="text-sm font-bold text-orange-500">Mark as Paid</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Mark salary as paid after disbursement</p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5 mb-6 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">4</div>
            <h4 className="text-sm font-bold text-purple-600">Generate Payslip</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">Download payslip for employees</p>
          </div>

          {/* Step 5 */}
          <div className="flex flex-col items-center text-center relative z-10 bg-white px-2 w-full md:w-1/5">
            <div className="w-12 h-12 rounded-full bg-teal-500 text-white font-bold flex items-center justify-center mb-3 shadow-sm border-4 border-white">5</div>
            <h4 className="text-sm font-bold text-teal-600">Reports</h4>
            <p className="text-[11px] text-gray-500 mt-1 px-4 leading-snug">View payroll reports and analytics</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Salary;
