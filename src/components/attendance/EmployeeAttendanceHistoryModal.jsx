import React, { useState, useRef, useEffect } from 'react';
import {
  IoCloseOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoAlertCircleOutline,
  IoDownloadOutline,
  IoPrintOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoBriefcaseOutline,
  IoStorefrontOutline,
  IoFingerPrintOutline,
  IoPhonePortraitOutline,
  IoLaptopOutline,
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCheckmarkOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { RangeCalendar } from '../ui/calendar';

// Comprehensive ERP Attendance Logs generator across multiple months & years
const generateAttendanceLogs = (employeeId, employeeName) => [
  // September 2026
  {
    id: 1,
    date: '2026-09-09',
    formattedDate: '09 Sep 2026',
    dayName: 'Wednesday',
    status: 'PRESENT',
    markedRole: 'Biometric Gate System',
    remarks: 'On time arrival'
  },
  {
    id: 2,
    date: '2026-09-08',
    formattedDate: '08 Sep 2026',
    dayName: 'Tuesday',
    status: 'PRESENT',
    markedRole: 'HR Manager',
    remarks: 'Approved OT +45 mins'
  },
  {
    id: 3,
    date: '2026-09-07',
    formattedDate: '07 Sep 2026',
    dayName: 'Monday',
    status: 'PRESENT',
    markedRole: 'Employee Mobile App',
    remarks: 'Late arrival (18 mins)'
  },
  {
    id: 4,
    date: '2026-09-06',
    formattedDate: '06 Sep 2026',
    dayName: 'Sunday',
    status: 'ABSENT',
    markedRole: 'System Auto-Mark',
    remarks: 'Unexcused absence'
  },
  {
    id: 5,
    date: '2026-09-05',
    formattedDate: '05 Sep 2026',
    dayName: 'Saturday',
    status: 'HALF DAY',
    markedRole: 'HR Manager',
    remarks: 'Half day approved by HR'
  },
  {
    id: 6,
    date: '2026-09-04',
    formattedDate: '04 Sep 2026',
    dayName: 'Friday',
    status: 'LEAVE',
    markedRole: 'Leave Portal (Admin)',
    remarks: 'Casual Leave Approved'
  },
  {
    id: 7,
    date: '2026-09-03',
    formattedDate: '03 Sep 2026',
    dayName: 'Thursday',
    status: 'PRESENT',
    markedRole: 'Branch Manager',
    remarks: 'On time'
  },
  {
    id: 8,
    date: '2026-09-02',
    formattedDate: '02 Sep 2026',
    dayName: 'Wednesday',
    status: 'PRESENT',
    markedRole: 'Biometric Gate System',
    remarks: 'On time'
  },
  {
    id: 9,
    date: '2026-09-01',
    formattedDate: '01 Sep 2026',
    dayName: 'Tuesday',
    status: 'PRESENT',
    markedRole: 'Biometric Gate System',
    remarks: 'On time'
  },

  // August 2026
  {
    id: 10,
    date: '2026-08-31',
    formattedDate: '31 Aug 2026',
    dayName: 'Monday',
    status: 'PRESENT',
    markedRole: 'System Admin',
    remarks: 'On time'
  },
  {
    id: 11,
    date: '2026-08-30',
    formattedDate: '30 Aug 2026',
    dayName: 'Sunday',
    status: 'PRESENT',
    markedRole: 'Branch Manager',
    remarks: 'Overtime 15m'
  },
  {
    id: 12,
    date: '2026-08-25',
    formattedDate: '25 Aug 2026',
    dayName: 'Tuesday',
    status: 'PRESENT',
    markedRole: 'Biometric Gate System',
    remarks: 'On time'
  }
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const dayHeadings = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];




// Custom Select Component for stylish, non-system theme dropdowns
const CustomSelect = ({ value, onChange, options, placeholder, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => (typeof o === 'object' ? o.value : o) === value);
  const displayLabel = typeof selectedOption === 'object' ? selectedOption.label : (selectedOption || value);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 hover:border-blue-400 focus:outline-none transition-all font-medium shadow-xs cursor-pointer"
      >
        <span className="truncate">{displayLabel}</span>
        <IoChevronDownOutline
          className={`text-gray-400 transition-transform duration-200 shrink-0 ml-1 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={13}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 min-w-full mt-1.5 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100 font-sans">
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            const isSelected = val === value;
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="truncate">{label}</span>
                {isSelected && <IoCheckmarkOutline size={15} className="text-blue-600 shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const EmployeeAttendanceHistoryModal = ({ employee, onClose }) => {
  // Single Range Filter State (Start Date -> End Date)
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-09-09');

  // Secondary Filter States
  const [statusTab, setStatusTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRangeCalendar, setShowRangeCalendar] = useState(false);

  // Pagination States (Default 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, statusTab, searchQuery]);

  if (!employee) return null;

  const logs = generateAttendanceLogs(employee.id, employee.name);

  // Filter logs strictly by date range
  const timeFilteredLogs = logs.filter((log) => log.date >= startDate && log.date <= endDate);

  // Secondary Status & Search Filtering
  const filteredLogs = timeFilteredLogs.filter((log) => {
    const matchesStatus = statusTab === 'ALL' || log.status === statusTab;
    const matchesSearch =
      log.formattedDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.dayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.markedRole && log.markedRole.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  const emptyRowsCount = filteredLogs.length > 0 && itemsPerPage > paginatedLogs.length ? itemsPerPage - paginatedLogs.length : 0;

  // Dynamic ERP Attendance Metrics based on selected Range
  const presentCount = timeFilteredLogs.filter((l) => l.status === 'PRESENT').length;
  const absentCount = timeFilteredLogs.filter((l) => l.status === 'ABSENT').length;
  const halfDayCount = timeFilteredLogs.filter((l) => l.status === 'HALF DAY').length;
  const leaveCount = timeFilteredLogs.filter((l) => l.status === 'LEAVE').length;
  const totalDays = timeFilteredLogs.length || 1;
  const attendancePercentage = ((presentCount / totalDays) * 100).toFixed(1);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ABSENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HALF DAY':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LEAVE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleExportPDF = () => {
    toast.success(`Exported PDF Attendance Register for ${employee.name}`);
  };

  const handlePrint = () => {
    toast.success(`Sent Attendance Record for ${employee.name} to Printer`);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200 font-sans pb-10">
      
      {/* 1. Full Page ERP Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <button
            onClick={onClose}
            className="mb-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <IoChevronBackOutline size={15} />
            <span>Back to Daily Attendance</span>
          </button>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold font-mono tracking-wider border border-blue-100">
              ERP ATTENDANCE AUDIT LOG
            </span>
            <span className="text-xs text-gray-400 font-medium">|</span>
            <span className="text-xs text-gray-500 font-semibold">
              {startDate} to {endDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Attendance History & Time Cards
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Print Record"
          >
            <IoPrintOutline size={16} />
            <span>Print Log</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Export Log"
          >
            <IoDownloadOutline size={16} />
            <span>Export PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Close View
          </button>
        </div>
      </div>

      {/* Main Full Page Card Wrapper */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">


        {/* 2. Employee Profile Info & Range Calendar Bar Header */}
        <div className="p-5 sm:p-6 bg-white border-b border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
            
            {/* Left: Avatar + Name + Metadata */}
            <div className="flex items-center gap-4">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    {employee.name}
                  </h3>
                  <span className="text-xs font-mono font-bold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                    {employee.empId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <IoBriefcaseOutline className="text-gray-400" size={14} />
                    {employee.department} ({employee.designation || 'Staff'})
                  </span>
                  <span className="flex items-center gap-1">
                    <IoStorefrontOutline className="text-gray-400" size={14} />
                    Al Naaz Kayamkulam
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick ERP Attendance Stats Badges */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400">Rate</p>
                <p className="text-base font-extrabold text-emerald-600 leading-tight">{attendancePercentage}%</p>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400">Present</p>
                <p className="text-base font-extrabold text-gray-900 leading-tight">{presentCount}</p>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400">Absent</p>
                <p className="text-base font-extrabold text-rose-600 leading-tight">{absentCount}</p>
              </div>
              <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-xs">
                <p className="text-[10px] uppercase font-bold text-gray-400">Leave/Half</p>
                <p className="text-base font-extrabold text-purple-600 leading-tight">{leaveCount + halfDayCount}</p>
              </div>
            </div>

          </div>

          {/* 3. Range Calendar Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1 border-t border-gray-100">
            
            {/* 2-Month Range Calendar Trigger & Reset Button */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRangeCalendar(!showRangeCalendar)}
                  className="flex items-center gap-2.5 px-4 py-2 bg-white border border-blue-200 text-blue-700 text-xs font-bold rounded-xl shadow-xs hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <IoCalendarOutline size={18} className="text-blue-600" />
                  <span>Date Range: <span className="font-mono">{startDate} → {endDate}</span></span>
                  <IoChevronDownOutline size={14} className={`transition-transform ${showRangeCalendar ? 'rotate-180' : ''}`} />
                </button>

                {/* Centered Range Calendar Popup Modal */}
                {showRangeCalendar && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setShowRangeCalendar(false)} 
                    />
                    <div className="relative z-10 w-[600px] max-w-[95vw] animate-in zoom-in-95 duration-150 font-sans shadow-2xl">
                      <RangeCalendar
                        startDate={startDate}
                        endDate={endDate}
                        numberOfMonths={2}
                        onClose={() => setShowRangeCalendar(false)}
                        onChange={({ start, end }) => {
                          if (start) setStartDate(start);
                          if (end) setEndDate(end);
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  const todayStr = '2026-09-10';
                  setStartDate(todayStr);
                  setEndDate(todayStr);
                  setStatusTab('ALL');
                  setSearchQuery('');
                  toast.success('Reset date range to today');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                title="Reset Date Range to Today"
              >
                <IoRefreshOutline size={15} className="text-gray-500" />
                <span>Reset Date</span>
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'ALL', label: `All (${timeFilteredLogs.length})` },
                { id: 'PRESENT', label: `Present (${presentCount})` },
                { id: 'ABSENT', label: `Absent (${absentCount})` },
                { id: 'HALF DAY', label: `Half Day (${halfDayCount})` },
                { id: 'LEAVE', label: `Leave (${leaveCount})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    statusTab === tab.id
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Search log by date or remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-xl pl-8 pr-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

        </div>

        {/* 4. Attendance History Table */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gray-50/30">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-600 font-bold">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-left">Marked By</th>
                  <th className="py-3.5 px-4 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs bg-white">
                {paginatedLogs.length > 0 ? (
                  <>
                    {paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors h-[52px]">
                        
                        {/* Date & Day */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <IoCalendarOutline className="text-gray-400" size={15} />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{log.formattedDate}</p>
                              <p className="text-xs text-gray-400 font-medium">{log.dayName}</p>
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-3 py-1 text-xs font-extrabold rounded-lg border ${getStatusBadgeClass(log.status)}`}>
                            {log.status}
                          </span>
                        </td>

                        {/* Attendance Marked Role */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-800 font-semibold text-xs border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span>{log.markedRole}</span>
                          </div>
                        </td>

                        {/* Remarks */}
                        <td className="py-3 px-4 text-gray-700 font-medium text-xs">
                          {log.remarks}
                        </td>

                      </tr>
                    ))}
                    {Array.from({ length: emptyRowsCount }).map((_, idx) => (
                      <tr key={`empty-${idx}`} className="h-[52px]">
                        <td colSpan="4">&nbsp;</td>
                      </tr>
                    ))}
                  </>
                ) : (
                  <tr className="h-[520px]">
                    <td colSpan="4" className="py-12 text-center text-gray-400 font-medium">
                      No attendance logs found matching the selected range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 5. Standard ERP Pagination Footer */}
            <div className="p-3.5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500 bg-white">
              <p>
                Showing {filteredLogs.length > 0 ? startIndex + 1 : 0} to{' '}
                {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of{' '}
                {filteredLogs.length} entries
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
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceHistoryModal;
