import React, { useState, useEffect } from 'react';
import { 
  IoSearchOutline, 
  IoFilterOutline, 
  IoRefreshOutline, 
  IoEyeOutline, 
  IoTimeOutline, 
  IoShieldCheckmarkOutline, 
  IoDocumentTextOutline, 
  IoChevronBackOutline, 
  IoChevronForwardOutline, 
  IoCloseOutline
} from 'react-icons/io5';
import { getActivityLogs } from '../../api/audit.api';
import toast from 'react-hot-toast';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return dateStr;
  }
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
};

const getActionBadge = (action) => {
  const act = String(action || '').toUpperCase();
  switch (act) {
    case 'CREATE':
    case 'INSERT':
    case 'ADD':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'CREATE'
      };
    case 'UPDATE':
    case 'EDIT':
    case 'MODIFY':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'UPDATE'
      };
    case 'DELETE':
    case 'REMOVE':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'DELETE'
      };
    default:
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        label: act || 'INFO'
      };
  }
};

const getModuleBadge = (module) => {
  const mod = String(module || '').toUpperCase();
  switch (mod) {
    case 'EXPENSE':
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'PURCHASE':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'INVENTORY':
    case 'STOCK':
      return { bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'HR':
    case 'EMPLOYEES':
    case 'EMPLOYEE':
      return { bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    case 'FINANCE':
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'ATTENDANCE':
      return { bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'PAYROLL':
    case 'SALARY':
      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    default:
      return { bg: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
};

const formatKeyName = (key) => {
  if (!key) return '';
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatValueDisplay = (key, value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const lowerKey = String(key || '').toLowerCase();
  
  // Format currency
  if (
    (lowerKey.includes('amount') || lowerKey.includes('price') || lowerKey.includes('balance') || lowerKey.includes('salary') || lowerKey.includes('total')) &&
    !isNaN(value)
  ) {
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Format date
  if (lowerKey.includes('date') && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    try {
      const d = new Date(value);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  }

  return String(value);
};

// Formatted Structured Viewer for API response objects (No raw JSON)
const StructuredDataViewer = ({ data, variant = 'new' }) => {
  if (!data || (typeof data !== 'object') || Object.keys(data).length === 0) {
    return (
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-center text-xs text-slate-400">
        No additional data recorded
      </div>
    );
  }

  const items = Array.isArray(data.items) ? data.items : null;
  const entries = Object.entries(data).filter(([k]) => k !== 'items');

  const isNew = variant === 'new';
  const borderColor = isNew ? 'border-emerald-200' : 'border-rose-200';
  const headerBg = isNew ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800';
  const badgeColor = isNew ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden bg-white shadow-2xs`}>
      <div className={`px-4 py-2.5 ${headerBg} font-bold text-xs flex items-center justify-between border-b ${borderColor}`}>
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isNew ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {isNew ? 'New Data Details' : 'Previous Data Details (Old State)'}
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${badgeColor}`}>
          {isNew ? 'UPDATED' : 'PREVIOUS'}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Simple Key-Value Grid */}
        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {entries.map(([key, val]) => {
              if (Array.isArray(val)) {
                return (
                  <div key={key} className="sm:col-span-2 md:col-span-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{formatKeyName(key)}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {val.map((item, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-white text-slate-700 text-xs font-semibold border border-slate-200">
                          {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (typeof val === 'object' && val !== null) {
                return (
                  <div key={key} className="sm:col-span-2 md:col-span-3 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{formatKeyName(key)}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(val).map(([subK, subV]) => (
                        <div key={subK} className="bg-white p-2 rounded-lg border border-slate-200/70">
                          <span className="text-[10px] text-slate-400 font-bold block">{formatKeyName(subK)}</span>
                          <span className="text-xs font-semibold text-slate-800">{formatValueDisplay(subK, subV)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {formatKeyName(key)}
                  </p>
                  <p className="text-xs font-semibold text-slate-900 break-words">
                    {formatValueDisplay(key, val)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Structured Items Table if present */}
        {items && items.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Included Items ({items.length})</span>
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5 text-center">Quantity</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-bold text-slate-900">{it.product || it.name || '-'}</td>
                      <td className="p-2.5 text-center font-mono font-medium text-slate-700">{it.quantity ?? '-'}</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">
                        {it.unit_price ? `₹${parseFloat(it.unit_price).toFixed(2)}` : '-'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                        {it.total_price ? `₹${parseFloat(it.total_price).toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states matching system standard
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedAction, setSelectedAction] = useState('ALL');

  // Selected Log for Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (pageToFetch = currentPage, isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = {
        page: pageToFetch,
        page_size: pageSize
      };
      if (selectedModule !== 'ALL') params.module = selectedModule;
      if (selectedAction !== 'ALL') params.action = selectedAction;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await getActivityLogs(params);

      if (data && Array.isArray(data.results)) {
        setLogs(data.results);
        setTotalCount(data.count ?? data.results.length);
      } else if (Array.isArray(data)) {
        setLogs(data);
        setTotalCount(data.length);
      } else {
        setLogs([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setError(err.userMessage || 'Failed to load activity logs from server.');
      toast.error('Could not load activity logs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, selectedModule, selectedAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1);
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const emptyRowsCount = loading ? 0 : Math.max(0, pageSize - logs.length);

  // Available modules list for filtering
  const availableModules = ['ALL', 'EXPENSE', 'PURCHASE', 'INVENTORY', 'FINANCE', 'HR', 'ATTENDANCE', 'PAYROLL'];
  const availableActions = ['ALL', 'CREATE', 'UPDATE', 'DELETE'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <span>Audit</span> &gt; <span className="text-slate-700">Activity Logs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <IoShieldCheckmarkOutline className="text-blue-600" size={26} />
            System Activity Logs
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time immutable audit trail of operational changes, system transactions, and employee actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            disabled={loading || refreshing}
            onClick={() => fetchLogs(currentPage, true)}
            className="px-3.5 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <IoRefreshOutline size={16} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="lg:col-span-5 relative">
            <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              placeholder="Search by description, user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Module Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50/50 cursor-pointer"
            >
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m === 'ALL' ? 'All Modules' : m}
                </option>
              ))}
            </select>
          </div>

          {/* Action Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 bg-slate-50/50 cursor-pointer"
            >
              {availableActions.map((a) => (
                <option key={a} value={a}>
                  {a === 'ALL' ? 'All Actions' : a}
                </option>
              ))}
            </select>
          </div>

          {/* Search Action Button */}
          <div className="lg:col-span-1 flex gap-2">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer"
              title="Apply Search"
            >
              <IoSearchOutline size={15} />
            </button>
          </div>
        </form>
      </div>

      {/* 4. Activity Logs Table (ID & Object ID removed, module icons removed) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-3.5 align-middle">Timestamp</th>
                <th className="p-3.5 align-middle">User</th>
                <th className="p-3.5 text-center align-middle">Action</th>
                <th className="p-3.5 text-center align-middle">Module</th>
                <th className="p-3.5 align-middle">Description</th>
                <th className="p-3.5 text-center align-middle w-24">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-xs">
              {loading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={`skel-${idx}`} className="h-[52px] animate-pulse">
                    <td className="p-3.5"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-100 rounded w-20" /></td>
                    <td className="p-3.5 text-center"><div className="h-5 bg-slate-100 rounded w-16 mx-auto" /></td>
                    <td className="p-3.5 text-center"><div className="h-5 bg-slate-100 rounded w-20 mx-auto" /></td>
                    <td className="p-3.5"><div className="h-4 bg-slate-100 rounded w-64" /></td>
                    <td className="p-3.5 text-center"><div className="h-6 bg-slate-100 rounded w-12 mx-auto" /></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <p className="text-rose-600 font-semibold mb-2">{error}</p>
                    <button
                      type="button"
                      onClick={() => fetchLogs(currentPage)}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Retry Loading
                    </button>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <IoDocumentTextOutline size={42} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No activity logs recorded.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Logs will appear automatically as users perform actions.</p>
                  </td>
                </tr>
              ) : (
                <>
                  {logs.map((row) => {
                    const actionBadge = getActionBadge(row.action);
                    const moduleBadge = getModuleBadge(row.module);
                    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username || 'System')}&background=0D8ABC&color=fff`;

                    return (
                      <tr 
                        key={row.id} 
                        className="hover:bg-slate-50/80 transition-colors h-[52px]"
                      >
                        {/* Timestamp */}
                        <td className="p-3.5 align-middle whitespace-nowrap">
                          <p className="font-semibold text-slate-800 text-xs">
                            {formatDateTime(row.created_at)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {formatTimeAgo(row.created_at)}
                          </p>
                        </td>

                        {/* User */}
                        <td className="p-3.5 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img 
                              src={avatarUrl} 
                              alt="Avatar" 
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200" 
                            />
                            <span className="font-bold text-slate-800">
                              {row.username || 'system'}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="p-3.5 text-center align-middle whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-extrabold rounded-md border uppercase tracking-wider ${actionBadge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${actionBadge.dot}`}></span>
                            {actionBadge.label}
                          </span>
                        </td>

                        {/* Module - clean text badge without icons */}
                        <td className="p-3.5 text-center align-middle whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${moduleBadge.bg}`}>
                            {row.module || 'SYSTEM'}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="p-3.5 align-middle text-slate-800 font-medium min-w-[280px]">
                          <p className="line-clamp-1" title={row.description}>
                            {row.description || 'No description provided'}
                          </p>
                        </td>

                        {/* View Details */}
                        <td className="p-3.5 text-center align-middle whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(row)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
                            title="View Activity Details"
                          >
                            <IoEyeOutline size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty rows placeholders to preserve uniform 10-row size */}
                  {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-[52px]">
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

        {/* 5. Pagination Footer - Standardized System Model */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium">
            Showing {totalCount === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, totalCount)} of {totalCount} log entries
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={validCurrentPage <= 1 || loading}
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
                  disabled={loading}
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
              disabled={validCurrentPage >= totalPages || loading}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <IoChevronForwardOutline size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Activity Details Modal - Formatted view without raw JSON */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <IoShieldCheckmarkOutline size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Activity Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded on {formatDateTime(selectedLog.created_at)} ({formatTimeAgo(selectedLog.created_at)})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close Modal"
              >
                <IoCloseOutline size={20} />
              </button>
            </div>

            {/* Overview Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/75 p-3.5 rounded-xl border border-slate-100 text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">User</p>
                <p className="font-bold text-slate-900 mt-0.5">@{selectedLog.username || 'system'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Action</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Module</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedLog.module}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Target ID</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedLog.object_id ? `#${selectedLog.object_id}` : 'N/A'}</p>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description</p>
              <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                {selectedLog.description || 'No description provided'}
              </p>
            </div>

            {/* Structured New Data Details */}
            {selectedLog.new_data && (
              <StructuredDataViewer data={selectedLog.new_data} variant="new" />
            )}

            {/* Structured Old Data Details */}
            {selectedLog.old_data && (
              <StructuredDataViewer data={selectedLog.old_data} variant="old" />
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ActivityLogs;
