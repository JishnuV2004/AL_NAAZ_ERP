import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoWalletOutline,
  IoCheckmarkCircleOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoCardOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
  IoTrendingUpOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { getEmployeeSalaryHistory } from '../../api/salary.api';

const formatCurrency = (amt) => {
  if (amt === null || amt === undefined || amt === '') return '-';
  const val = typeof amt === 'number' ? amt : parseFloat(amt);
  if (isNaN(val)) return '-';
  return `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Present / Active';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
      ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
};

const EmployeeSalaryHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract raw empId param (e.g., '4' or 'EMP-0004')
  const rawEmpIdParam = searchParams.get('empId') || '4';
  const numericEmpId = String(rawEmpIdParam).replace(/\D/g, '') || '4';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);

  const fetchSalaryHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeSalaryHistory(numericEmpId);
      if (Array.isArray(data)) {
        setHistoryRecords(data);
      } else {
        setHistoryRecords([]);
      }
    } catch (err) {
      console.error('Failed to fetch employee salary history:', err);
      setError(err.userMessage || 'Failed to load employee salary history from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryHistory();
  }, [numericEmpId]);

  // Derived metadata from API history records
  const latestRecord = historyRecords.length > 0 ? historyRecords[historyRecords.length - 1] : null;
  const initialRecord = historyRecords.length > 0 ? historyRecords[0] : null;

  const empName = latestRecord?.employee_name || `Employee #${numericEmpId}`;
  const empCode = `EMP-${String(numericEmpId).padStart(4, '0')}`;
  const salaryType = latestRecord?.salary_type || 'MONTHLY';
  
  const currentSalaryAmount = latestRecord
    ? (latestRecord.monthly_salary || latestRecord.daily_wage || latestRecord.biweekly_salary || 0)
    : 0;

  const initialSalaryAmount = initialRecord
    ? (initialRecord.monthly_salary || initialRecord.daily_wage || initialRecord.biweekly_salary || 0)
    : 0;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=0D8ABC&color=fff`;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Navigation Header */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
          <span>Payroll</span> &gt; <span>Salary</span> &gt; <span className="text-slate-700">Employee Salary History</span>
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
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              Employee Salary History
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              Salary revision logs, contract changes, and effective pay rates for {empName}.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSalaryHistory}
            className="px-3.5 py-2 bg-white text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <IoRefreshOutline size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Employee Profile Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt={empName}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">{empName}</h2>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-100">
                {empCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Employee ID: <span className="font-mono font-bold text-slate-700">{numericEmpId}</span> • Salary Type: <span className="font-semibold text-slate-700">{salaryType}</span>
            </p>
          </div>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100/80 shrink-0 w-full md:w-auto text-left md:text-right">
          <p className="text-[11px] font-semibold text-slate-500 mb-0.5">Current Effective Salary</p>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">{formatCurrency(currentSalaryAmount)}</p>
          <p className="text-[10px] text-blue-600 font-bold mt-0.5">Active Pay Rate</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revisions */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoDocumentTextOutline size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Salary Revisions</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{loading ? '...' : historyRecords.length}</h3>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">Historical Changes</p>
          </div>
        </div>

        {/* Current Salary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Current Monthly Rate</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{loading ? '...' : formatCurrency(currentSalaryAmount)}</h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Latest Revision</p>
          </div>
        </div>

        {/* Initial Salary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoCalendarOutline size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Initial Base Salary</p>
            <h3 className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">{loading ? '...' : formatCurrency(initialSalaryAmount)}</h3>
            <p className="text-[11px] text-purple-600 font-semibold mt-0.5">First Contract Rate</p>
          </div>
        </div>

        {/* Latest Hike / Reason */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <IoTrendingUpOutline size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">Latest Revision Reason</p>
            <h3 className="text-sm font-extrabold text-slate-900 truncate">{loading ? '...' : (latestRecord?.reason || 'Initial salary')}</h3>
            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">Effective {formatDate(latestRecord?.effective_from)}</p>
          </div>
        </div>
      </div>

      {/* Salary Revision History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Salary Revision & Contract History</h3>
            <p className="text-xs text-slate-500">Recorded salary adjustments, hike logs, and effective periods</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">
            {historyRecords.length} Revision(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
                <th className="p-3.5 text-center align-middle w-16">ID</th>
                <th className="p-3.5 text-left align-middle">Salary Type</th>
                <th className="p-3.5 text-right align-middle">Monthly Salary</th>
                <th className="p-3.5 text-right align-middle">Daily Wage</th>
                <th className="p-3.5 text-left align-middle">Effective From</th>
                <th className="p-3.5 text-left align-middle">Effective To</th>
                <th className="p-3.5 text-left align-middle min-w-[180px]">Reason / Notes</th>
                <th className="p-3.5 text-left align-middle">Created By</th>
                <th className="p-3.5 text-left align-middle">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="p-3.5 text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                    <td className="p-3.5 text-right"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="p-3.5"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <IoAlertCircleOutline className="text-red-500" size={36} />
                      <p className="text-slate-800 font-semibold">{error}</p>
                      <button
                        onClick={fetchSalaryHistory}
                        className="mt-2 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Retry Loading
                      </button>
                    </div>
                  </td>
                </tr>
              ) : historyRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No salary history revisions recorded for this employee.
                  </td>
                </tr>
              ) : (
                historyRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-center align-middle font-mono font-bold text-slate-500">
                      #{row.id}
                    </td>
                    <td className="p-3.5 align-middle">
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-extrabold rounded uppercase tracking-wider ${
                        row.salary_type === 'MONTHLY' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {row.salary_type || 'MONTHLY'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right align-middle font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(row.monthly_salary)}
                    </td>
                    <td className="p-3.5 text-right align-middle font-mono text-slate-600 whitespace-nowrap">
                      {formatCurrency(row.daily_wage)}
                    </td>
                    <td className="p-3.5 align-middle font-medium text-slate-800 whitespace-nowrap">
                      {formatDate(row.effective_from)}
                    </td>
                    <td className="p-3.5 align-middle whitespace-nowrap">
                      {row.effective_to ? (
                        <span className="font-medium text-slate-700">{formatDate(row.effective_to)}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active / Present
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 align-middle font-medium text-slate-800">
                      {row.reason || '-'}
                    </td>
                    <td className="p-3.5 align-middle font-medium text-slate-600 whitespace-nowrap">
                      {row.created_by_name || `User #${row.created_by || 1}`}
                    </td>
                    <td className="p-3.5 align-middle font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default EmployeeSalaryHistory;
