import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline,
  IoDownloadOutline,
  IoRefreshOutline,
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { getEmployeeSalaryHistory, downloadSalaryPayslip, getSalaries } from '../../api/salary.api';

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
  const [targetSalaryId, setTargetSalaryId] = useState(() => searchParams.get('salaryId') || searchParams.get('salary_id') || null);
  const [downloadingSlip, setDownloadingSlip] = useState(false);

  // Sync salaryId if query param changes
  useEffect(() => {
    const sId = searchParams.get('salaryId') || searchParams.get('salary_id');
    if (sId) {
      setTargetSalaryId(sId);
    }
  }, [searchParams]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  const fetchSalaryRecordForPayslip = async () => {
    try {
      const urlSalaryId = searchParams.get('salaryId') || searchParams.get('salary_id');
      if (urlSalaryId) {
        setTargetSalaryId(urlSalaryId);
        return;
      }
      const res = await getSalaries();
      const data = Array.isArray(res) ? res : (res?.results || []);
      if (Array.isArray(data) && data.length > 0) {
        const matches = data.filter(
          s => String(s.employee) === String(numericEmpId) || 
               String(s.employee_id) === String(numericEmpId)
        );
        if (matches.length > 0) {
          matches.sort((a, b) => (b.id || 0) - (a.id || 0));
          setTargetSalaryId(matches[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load salaries for payslip download:', err);
    }
  };

  useEffect(() => {
    fetchSalaryHistory();
    fetchSalaryRecordForPayslip();
    setCurrentPage(1);
  }, [numericEmpId]);

  // Derived metadata from API history records
  const latestRecord = historyRecords.length > 0 ? historyRecords[historyRecords.length - 1] : null;

  const empName = latestRecord?.employee_name || `Employee #${numericEmpId}`;
  const empCode = `EMP-${String(numericEmpId).padStart(4, '0')}`;
  const salaryType = latestRecord?.salary_type || 'MONTHLY';
  
  const currentSalaryAmount = latestRecord
    ? (latestRecord.monthly_salary || latestRecord.daily_wage || latestRecord.biweekly_salary || 0)
    : 0;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(empName)}&background=0D8ABC&color=fff`;

  // Download payslip via API GET /salary/{salary_id}/payslip/
  const handleExportPayslip = async () => {
    let sid = targetSalaryId || searchParams.get('salaryId') || searchParams.get('salary_id');

    // If still not determined, query latest salary record for this employee
    if (!sid) {
      try {
        setDownloadingSlip(true);
        const res = await getSalaries();
        const data = Array.isArray(res) ? res : (res?.results || []);
        if (Array.isArray(data) && data.length > 0) {
          const matches = data.filter(
            s => String(s.employee) === String(numericEmpId) || 
                 String(s.employee_id) === String(numericEmpId) ||
                 (s.employee_name && latestRecord?.employee_name && s.employee_name.toLowerCase() === latestRecord.employee_name.toLowerCase())
          );
          if (matches.length > 0) {
            matches.sort((a, b) => (b.id || 0) - (a.id || 0));
            sid = matches[0].id;
            setTargetSalaryId(sid);
          }
        }
      } catch (err) {
        console.warn('Failed to retrieve salaries list:', err);
      }
    }

    // Check if revision record has explicit salary_id
    if (!sid && latestRecord?.salary_id) {
      sid = latestRecord.salary_id;
      setTargetSalaryId(sid);
    }

    // CRITICAL: NEVER send user ID (numericEmpId) as salary ID
    if (!sid) {
      setDownloadingSlip(false);
      toast.error(`No salary record found for employee #${numericEmpId} to download payslip. Please process salary first.`, { id: 'payslip-download' });
      return;
    }

    try {
      setDownloadingSlip(true);
      toast.loading(`Downloading payslip for salary #${sid}...`, { id: 'payslip-download' });
      await downloadSalaryPayslip(sid);
      toast.success('Payslip downloaded successfully!', { id: 'payslip-download' });
    } catch (err) {
      console.error('Failed to download payslip:', err);
      let errorMsg = 'Failed to download payslip.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          errorMsg = parsed.message || parsed.detail || errorMsg;
        } catch {
          // keep fallback
        }
      } else if (err.userMessage) {
        errorMsg = err.userMessage;
      }
      toast.error(errorMsg, { id: 'payslip-download' });
    } finally {
      setDownloadingSlip(false);
    }
  };

  // Pagination calculations
  const totalRecords = historyRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedRecords = historyRecords.slice(startIndex, startIndex + pageSize);
  const emptyRowsCount = loading ? 0 : Math.max(0, pageSize - paginatedRecords.length);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* Back Button matching reference image */}
      <div>
        <button
          type="button"
          onClick={() => {
            const fromSource = searchParams.get('from') || searchParams.get('tab');
            if (fromSource === 'generate' || fromSource === 'Generate Salary') {
              navigate('/payroll/salary?tab=generate');
            } else {
              navigate('/payroll/salary');
            }
          }}
          className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm font-bold transition-colors cursor-pointer"
        >
          <IoArrowBackOutline size={18} />
          <span>Back to Salary</span>
        </button>
      </div>

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Employee Salary History
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
            {loading ? (
              <span className="inline-block w-64 h-3.5 bg-slate-200 rounded animate-pulse align-middle" />
            ) : (
              `Salary revision logs, contract changes, and effective pay rates for ${empName}.`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            disabled={downloadingSlip}
            onClick={handleExportPayslip}
            className="px-3.5 py-2 bg-white text-slate-700 hover:text-blue-600 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-60"
            title="Download Payslip"
          >
            <IoDownloadOutline size={16} className={downloadingSlip ? 'animate-bounce' : ''} />
            <span>{downloadingSlip ? 'Downloading...' : 'Export'}</span>
          </button>
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
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-36 bg-slate-200 rounded-md" />
                <div className="h-5 w-20 bg-slate-100 rounded-md" />
              </div>
              <div className="h-4 w-56 bg-slate-200 rounded-md" />
            </div>
          </div>
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100 shrink-0 w-full md:w-56 text-left md:text-right space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded md:ml-auto" />
            <div className="h-7 w-36 bg-slate-200 rounded md:ml-auto" />
            <div className="h-3 w-20 bg-slate-200 rounded md:ml-auto" />
          </div>
        </div>
      ) : (
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
      )}

      {/* Salary Revision History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Salary Revision & Contract History</h3>
            <p className="text-xs text-slate-500">Recorded salary adjustments, hike logs, and effective periods</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            {totalRecords} Revision(s)
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
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse h-[49px]">
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
              ) : totalRecords === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No salary history revisions recorded for this employee.
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedRecords.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors h-[49px]">
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
                  ))}

                  {/* Empty rows placeholders to preserve 10-row size */}
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[49px]">
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                      <td className="p-3.5">&nbsp;</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">
            Showing {totalRecords === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalRecords)} of {totalRecords} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <IoChevronBackOutline size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <IoChevronForwardOutline size={16} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeSalaryHistory;
