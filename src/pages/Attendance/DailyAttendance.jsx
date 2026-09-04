import React, { useState } from 'react';
import {
  IoSearchOutline,
  IoFilterOutline,
  IoDownloadOutline,
  IoAddOutline,
  IoEyeOutline,
  IoEllipsisVerticalOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoPeopleOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoHelpCircle,
  IoRefreshOutline,
  IoCashOutline
} from 'react-icons/io5';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import toast from 'react-hot-toast';

const mockEmployees = [
  {
    id: 1,
    empId: 'EMP-0004',
    name: 'Test Employee cook KYLM',
    email: 'test.cook@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp1',
    department: 'Kitchen',
    designation: 'Cook',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 1, absent: 1 },
    leaveHalf: { leave: 0, half: 0 },
    grossSalary: 25000.00,
    deductions: 0.00,
    advances: 0.00,
    netSalary: 25000.00,
    status: 'PENDING',
    paymentDate: '-',
    remarks: '-'
  },
  {
    id: 2,
    empId: 'EMP-0006',
    name: 'Manager Created Employee',
    email: 'manager.employee@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp2',
    department: 'Management',
    designation: 'Manager',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 1, absent: 0 },
    leaveHalf: { leave: 1, half: 0 },
    grossSalary: 25000.00,
    deductions: 833.33,
    advances: 0.00,
    netSalary: 24166.67,
    status: 'PENDING',
    paymentDate: '-',
    remarks: '-'
  },
  {
    id: 3,
    empId: 'EMP-0007',
    name: 'aby',
    email: 'aby@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp3',
    department: 'Service',
    designation: 'Waitstaff',
    salaryType: 'DAILY',
    workingDays: 26,
    presentAbsent: { present: 1, absent: 0 },
    leaveHalf: { leave: 0, half: 0 },
    grossSalary: 18000.00,
    deductions: 0.00,
    advances: 0.00,
    netSalary: 18000.00,
    status: 'PENDING',
    paymentDate: '-',
    remarks: 'Personal work'
  },
  {
    id: 4,
    empId: 'EMP-0008',
    name: 'asif',
    email: 'asif@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp4',
    department: 'Accounts',
    designation: 'Accountant',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 0, absent: 1 },
    leaveHalf: { leave: 0, half: 0 },
    grossSalary: 22000.00,
    deductions: 0.00,
    advances: 0.00,
    netSalary: 22000.00,
    status: 'PENDING',
    paymentDate: '-',
    remarks: '-'
  },
  {
    id: 5,
    empId: 'EMP-0009',
    name: 'Jishnu P',
    email: 'jishnu.p@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp5',
    department: 'Logistics',
    designation: 'Driver',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 1, absent: 0 },
    leaveHalf: { leave: 0, half: 0 },
    grossSalary: 20000.00,
    deductions: 0.00,
    advances: 500.00,
    netSalary: 19500.00,
    status: 'PRESENT',
    paymentDate: '-',
    remarks: '-'
  },
  {
    id: 6,
    empId: 'EMP-0010',
    name: 'Arun Raj',
    email: 'arun.raj@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp6',
    department: 'Kitchen',
    designation: 'Helper',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 0, absent: 0 },
    leaveHalf: { leave: 1, half: 0 },
    grossSalary: 16000.00,
    deductions: 533.33,
    advances: 0.00,
    netSalary: 15466.67,
    status: 'LEAVE',
    paymentDate: '-',
    remarks: 'Casual Leave'
  },
  {
    id: 7,
    empId: 'EMP-0011',
    name: 'Rahul R',
    email: 'rahul.r@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp7',
    department: 'Kitchen',
    designation: 'Cook',
    salaryType: 'MONTHLY',
    workingDays: 30,
    presentAbsent: { present: 0, absent: 0 },
    leaveHalf: { leave: 0, half: 0 },
    grossSalary: 24000.00,
    deductions: 0.00,
    advances: 0.00,
    netSalary: 24000.00,
    status: 'NOT MARKED',
    paymentDate: '-',
    remarks: '-'
  },
  {
    id: 8,
    empId: 'EMP-0012',
    name: 'Shibu Kumar',
    email: 'shibu.k@alnaaz.com',
    avatar: 'https://i.pravatar.cc/150?u=emp8',
    department: 'Service',
    designation: 'Helper',
    salaryType: 'DAILY',
    workingDays: 26,
    presentAbsent: { present: 0, absent: 0 },
    leaveHalf: { leave: 0, half: 0 },
    grossSalary: 15000.00,
    deductions: 0.00,
    advances: 0.00,
    netSalary: 15000.00,
    status: 'NOT MARKED',
    paymentDate: '-',
    remarks: '-'
  }
];

const formatCurrency = (amount) => {
  return `AED ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const DailyAttendance = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [month, setMonth] = useState('September');
  const [year, setYear] = useState('2026');
  const [branch, setBranch] = useState('All Branches');
  const [department, setDepartment] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [salaryTypeFilter, setSalaryTypeFilter] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Status Metrics
  const presentCount = employees.filter((e) => e.status === 'PRESENT').length;
  const absentCount = employees.filter((e) => e.status === 'ABSENT').length;
  const halfDayCount = employees.filter((e) => e.status === 'HALF DAY').length;
  const leaveCount = employees.filter((e) => e.status === 'LEAVE').length;
  const notMarkedCount = employees.filter(
    (e) => e.status === 'NOT MARKED' || e.status === 'PENDING'
  ).length;

  const chartData = [
    { name: 'Present', value: presentCount, color: '#16a34a' },
    { name: 'Absent', value: absentCount, color: '#dc2626' },
    { name: 'Half Day', value: halfDayCount, color: '#eab308' },
    { name: 'Leave', value: leaveCount, color: '#9333ea' },
    { name: 'Pending / Unmarked', value: notMarkedCount, color: '#f97316' }
  ];

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Status' || emp.status === statusFilter;

    const matchesBranch =
      branch === 'All Branches' || branch === 'Al Naaz Kayamkulam';

    const matchesDepartment =
      department === 'All Departments' || emp.department === department;

    const matchesSalaryType =
      salaryTypeFilter === 'All Types' || emp.salaryType === salaryTypeFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBranch &&
      matchesDepartment &&
      matchesSalaryType
    );
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map((emp) => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleSelectEmployee = (id) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter((empId) => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
  };

  const updateEmployeeStatus = (id, newStatus) => {
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          const present = newStatus === 'PRESENT' ? 1 : 0;
          const absent = newStatus === 'ABSENT' ? 1 : 0;
          const leave = newStatus === 'LEAVE' ? 1 : 0;
          const half = newStatus === 'HALF DAY' ? 1 : 0;

          return {
            ...emp,
            status: newStatus,
            presentAbsent: { present, absent },
            leaveHalf: { leave, half }
          };
        }
        return emp;
      })
    );
    toast.success(`Updated status to ${newStatus}`);
  };

  const handleResetFilters = () => {
    setMonth('September');
    setYear('2026');
    setBranch('All Branches');
    setDepartment('All Departments');
    setStatusFilter('All Status');
    setSalaryTypeFilter('All Types');
    setSearchQuery('');
    toast.success('Filters reset');
  };

  const handleBulkMarkPresent = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    setEmployees((prev) =>
      prev.map((emp) =>
        selectedEmployees.includes(emp.id)
          ? {
              ...emp,
              status: 'PRESENT',
              presentAbsent: { present: 1, absent: 0 },
              leaveHalf: { leave: 0, half: 0 }
            }
          : emp
      )
    );
    toast.success(`Marked ${selectedEmployees.length} employee(s) Present`);
  };

  const handleSaveAttendance = () => {
    toast.success('Attendance and payroll data saved');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'HALF DAY':
        return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'LEAVE':
        return 'bg-purple-50 text-purple-600 border border-purple-200';
      case 'PENDING':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  return (
    <div className="space-y-5 font-sans w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Daily Attendance & Salary Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track daily attendance, working days, gross salary, deductions, and net payouts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.success('Reloaded employee records')}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <IoRefreshOutline size={16} /> Refresh Data
          </button>
          <button
            onClick={handleSaveAttendance}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <IoAddOutline size={18} /> Save Attendance
          </button>
        </div>
      </div>

      {/* 1. Top Metrics Cards & Donut Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        {/* Metric Cards Grid (3 cols) */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Total Staff */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Staff
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <IoPeopleOutline size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{employees.length}</span>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Active Staff</p>
            </div>
          </div>

          {/* Present */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                Present
              </span>
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold">
                <IoCheckmarkCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{presentCount}</span>
              <p className="text-xs text-green-600 mt-0.5 font-medium">On Shift</p>
            </div>
          </div>

          {/* Absent */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                Absent
              </span>
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <IoCloseCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{absentCount}</span>
              <p className="text-xs text-red-500 mt-0.5 font-medium">Unexcused</p>
            </div>
          </div>

          {/* Half Day */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Half Day
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <IoTimeOutline size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{halfDayCount}</span>
              <p className="text-xs text-amber-600 mt-0.5 font-medium">Partial Shift</p>
            </div>
          </div>

          {/* Leave */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Leave
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{leaveCount}</span>
              <p className="text-xs text-purple-600 mt-0.5 font-medium">Approved</p>
            </div>
          </div>

          {/* Pending / Not Marked */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
                Pending
              </span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <IoHelpCircle size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-gray-900">{notMarkedCount}</span>
              <p className="text-xs text-orange-600 mt-0.5 font-medium">Unmarked</p>
            </div>
          </div>
        </div>

        {/* Attendance Summary Donut Chart Card (1 col) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Attendance Breakdown</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">{month} {year}</p>
          </div>

          <div className="relative w-full h-[120px] my-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-gray-900 leading-none">{employees.length}</span>
              <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Staff</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-gray-100 text-[10px] font-semibold">
            {chartData.map((stat) => (
              <div key={stat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  <span className="text-gray-600 truncate">{stat.name}</span>
                </div>
                <span className="text-gray-900 font-bold">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Reference Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4">
        {/* Row 1: Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Month
            </label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium pr-7"
              >
                <option value="September">September</option>
                <option value="August">August</option>
                <option value="July">July</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Year
            </label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium pr-7"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Branch
            </label>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium pr-7"
              >
                <option value="All Branches">All Branches</option>
                <option value="Al Naaz Kayamkulam">Al Naaz Kayamkulam</option>
                <option value="Kochi Main">Kochi Main</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Department
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium pr-7"
              >
                <option value="All Departments">All Departments</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Service">Service</option>
                <option value="Accounts">Accounts</option>
                <option value="Logistics">Logistics</option>
                <option value="Management">Management</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium pr-7"
              >
                <option value="All Status">All Status</option>
                <option value="PENDING">PENDING</option>
                <option value="PRESENT">PRESENT</option>
                <option value="ABSENT">ABSENT</option>
                <option value="HALF DAY">HALF DAY</option>
                <option value="LEAVE">LEAVE</option>
                <option value="NOT MARKED">NOT MARKED</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Salary Type
            </label>
            <div className="relative">
              <select
                value={salaryTypeFilter}
                onChange={(e) => setSalaryTypeFilter(e.target.value)}
                className="w-full appearance-none text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium pr-7"
              >
                <option value="All Types">All Types</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="DAILY">DAILY</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
            </div>
          </div>

          <div className="xl:col-span-2 relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-xl pl-8 pr-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Filters applied')}
              className="h-[36px] px-3 bg-white border border-blue-200 text-blue-600 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <IoFilterOutline size={15} /> Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="h-[36px] px-2.5 text-gray-500 hover:text-gray-900 text-xs font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Row 2: Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <IoAddOutline size={16} /> Save Attendance
            </button>
            <button
              onClick={handleBulkMarkPresent}
              className="px-3.5 py-2 bg-white border border-gray-200 text-blue-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-blue-50 transition-colors shadow-sm"
            >
              <IoCheckmarkCircleOutline size={16} /> Mark All Present
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="px-3.5 py-2 bg-white border border-gray-200 text-blue-600 text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-blue-50 transition-colors shadow-sm"
              >
                <IoDownloadOutline size={16} /> Export <IoChevronDownOutline size={13} />
              </button>

              {showExportDropdown && (
                <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-20">
                  <button
                    onClick={() => {
                      toast.success('Exporting CSV...');
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Exporting PDF...');
                      setShowExportDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Export PDF
                  </button>
                </div>
              )}
            </div>
          </div>

          <span className="text-xs font-semibold text-gray-500">
            Selected: <span className="font-bold text-gray-900">{selectedEmployees.length}</span> employee(s)
          </span>
        </div>
      </div>

      {/* 3. Main Reference Table Container (Full Width) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    onChange={handleSelectAll}
                    checked={
                      selectedEmployees.length === filteredEmployees.length &&
                      filteredEmployees.length > 0
                    }
                  />
                </th>
                <th className="py-3 px-3">Employee</th>
                <th className="py-3 px-3">Employee ID</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Salary Type</th>
                <th className="py-3 px-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    Working<br />Days <IoInformationCircleOutline className="text-gray-400" size={13} />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    Present /<br />Absent <IoInformationCircleOutline className="text-gray-400" size={13} />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    Leave /<br />Half <IoInformationCircleOutline className="text-gray-400" size={13} />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Gross Salary</th>
                <th className="py-3 px-3 text-right">Deductions</th>
                <th className="py-3 px-3 text-right">Advances</th>
                <th className="py-3 px-3 text-right">Net Salary</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Payment Date</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-xs">
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={selectedEmployees.includes(row.id)}
                        onChange={() => handleSelectEmployee(row.id)}
                      />
                    </td>

                    {/* Employee Column with Avatar + Name + Email */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">
                            {row.name}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                            {row.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-3 text-[11px] font-semibold text-gray-500 font-mono">
                      {row.empId}
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 font-medium text-gray-700">
                      {row.department}
                    </td>

                    {/* Salary Type Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          row.salaryType === 'MONTHLY'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}
                      >
                        {row.salaryType}
                      </span>
                    </td>

                    {/* Working Days */}
                    <td className="py-3 px-3 text-center font-bold text-gray-800">
                      {row.workingDays}
                    </td>

                    {/* Present / Absent Split */}
                    <td className="py-3 px-3 text-center text-xs font-bold">
                      <span className="text-emerald-600">
                        {row.presentAbsent.present}
                      </span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-rose-500">
                        {row.presentAbsent.absent}
                      </span>
                    </td>

                    {/* Leave / Half Split */}
                    <td className="py-3 px-3 text-center text-xs font-bold">
                      <span className="text-purple-600">
                        {row.leaveHalf.leave}
                      </span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-amber-500">
                        {row.leaveHalf.half}
                      </span>
                    </td>

                    {/* Gross Salary */}
                    <td className="py-3 px-3 text-right text-gray-900 font-semibold">
                      {formatCurrency(row.grossSalary)}
                    </td>

                    {/* Deductions */}
                    <td className="py-3 px-3 text-right text-gray-600">
                      {formatCurrency(row.deductions)}
                    </td>

                    {/* Advances */}
                    <td className="py-3 px-3 text-right text-gray-600">
                      {formatCurrency(row.advances)}
                    </td>

                    {/* Net Salary */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">
                      {formatCurrency(row.netSalary)}
                    </td>

                    {/* Status Badge Dropdown */}
                    <td className="py-3 px-3 text-center">
                      <div className="relative inline-block">
                        <select
                          value={row.status}
                          onChange={(e) =>
                            updateEmployeeStatus(row.id, e.target.value)
                          }
                          className={`appearance-none text-[10px] font-bold px-2.5 py-1 pr-5 rounded outline-none cursor-pointer ${getStatusBadgeStyle(
                            row.status
                          )}`}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PRESENT">PRESENT</option>
                          <option value="ABSENT">ABSENT</option>
                          <option value="HALF DAY">HALF DAY</option>
                          <option value="LEAVE">LEAVE</option>
                          <option value="NOT MARKED">NOT MARKED</option>
                        </select>
                        <IoChevronDownOutline
                          className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60"
                          size={10}
                        />
                      </div>
                    </td>

                    {/* Payment Date */}
                    <td className="py-3 px-3 text-center text-xs text-gray-500 font-medium">
                      {row.paymentDate}
                    </td>

                    {/* Actions Icons */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toast.success(`Viewing details for ${row.name}`)}
                          className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="View Details"
                        >
                          <IoEyeOutline size={14} />
                        </button>
                        <button
                          onClick={() => toast.success(`Disbursal processing for ${row.name}`)}
                          className="w-6 h-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                          title="Process Disbursal"
                        >
                          <IoCashOutline size={14} />
                        </button>
                        <button
                          onClick={() => toast.success(`Options for ${row.name}`)}
                          className="w-6 h-6 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors"
                          title="More Options"
                        >
                          <IoEllipsisVerticalOutline size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="15" className="p-10 text-center text-gray-500 font-medium">
                    No employees found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500 bg-white">
          <p>
            Showing {filteredEmployees.length > 0 ? startIndex + 1 : 0} to{' '}
            {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of{' '}
            {filteredEmployees.length} entries
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <IoChevronBackOutline size={13} />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                    currentPage === idx + 1
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <IoChevronForwardOutline size={13} />
              </button>
            </div>

            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-200 rounded px-2.5 py-1 pr-6 text-xs font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <IoChevronDownOutline className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={11} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;
