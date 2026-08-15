import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { financeService } from '../../services/financeService';
import { PageLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { IoSearchOutline } from 'react-icons/io5';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (moduleFilter !== 'ALL') filters.module = moduleFilter;
    if (actionFilter !== 'ALL') filters.action = actionFilter;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    const response = await financeService.fetchActivityLogs(page, 10, filters);
    if (response) {
      setLogs(response.results || response.data || []);
      setTotalItems(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10) || 1);
      setHasNext(!!response.next);
      setHasPrev(!!response.previous);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, searchTerm, moduleFilter, actionFilter, startDate, endDate]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, moduleFilter, actionFilter, startDate, endDate]);

  const getActionPill = (action) => {
    const act = action?.toUpperCase() || '';
    if (act === 'CREATE') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Create</span>;
    }
    if (act === 'UPDATE') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Update</span>;
    }
    if (act === 'APPROVE') {
      return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Approve</span>;
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-700 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>{action}</span>;
  };

  const getModulePill = (module) => {
    const modStr = module?.charAt(0).toUpperCase() + module?.slice(1).toLowerCase().replace('_', ' ');
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{modStr}</span>;
  };

  const renderDataChanges = (oldData, newData) => {
    if (!oldData && !newData) return <p className="text-sm text-brand-text-muted italic">No detailed data changes available.</p>;

    // If it's a create, just show new data
    if (!oldData && newData) {
      return (
        <div className="bg-brand-cream/30 p-4 rounded-xl border border-brand-border text-xs font-mono">
          <pre className="whitespace-pre-wrap text-brand-text">{JSON.stringify(newData, null, 2)}</pre>
        </div>
      );
    }

    // Compare before and after
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    const changes = [];
    
    allKeys.forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes.push(
          <div key={key} className="mb-4 last:mb-0 bg-white rounded-xl border border-brand-border overflow-hidden">
            <div className="bg-brand-cream/50 px-4 py-2 border-b border-brand-border font-bold text-xs uppercase text-brand-text">
              {key}
            </div>
            <div className="grid grid-cols-2 divide-x divide-brand-border">
              <div className="p-4 bg-red-50/30">
                <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Before</p>
                <p className="text-sm font-mono text-red-800 break-all">{String(oldData[key] ?? 'null')}</p>
              </div>
              <div className="p-4 bg-green-50/30">
                <p className="text-[10px] uppercase font-bold text-green-500 mb-1">After</p>
                <p className="text-sm font-mono text-green-800 break-all">{String(newData[key] ?? 'null')}</p>
              </div>
            </div>
          </div>
        );
      }
    });

    if (changes.length === 0) {
      return <p className="text-sm text-brand-text-muted italic">No fields were modified.</p>;
    }

    return <div>{changes}</div>;
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="w-full sm:max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
        >
          <option value="ALL">All modules</option>
          <option value="EXPENSE">Expense</option>
          <option value="PETTY_CASH">Petty cash</option>
          <option value="ADVANCE">Advance</option>
          <option value="PURCHASE">Purchase</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
        >
          <option value="ALL">All actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="APPROVE">Approve</option>
        </select>
        
        <select
          className="w-full sm:max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
        >
          <option value="ALL">All users</option>
        </select>

        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45]" 
          />
          <span className="text-gray-400 text-sm">to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45]" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-2">🕵️‍♂️</span>
            <p className="font-medium text-sm">No activity recorded for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Object ID</th>
                  <th className="px-6 py-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => {
                  let prefix = 'OBJ';
                  if (log.module?.toUpperCase() === 'EXPENSE') prefix = 'EXP';
                  if (log.module?.toUpperCase() === 'PETTY_CASH') prefix = 'PC';
                  if (log.module?.toUpperCase() === 'ADVANCE') prefix = 'ADV';
                  if (log.module?.toUpperCase() === 'PURCHASE') prefix = 'PUR';

                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4 font-mono text-gray-900 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {log.user_name || log.user || 'admin'}
                      </td>
                      <td className="px-6 py-4">
                        {getActionPill(log.action)}
                      </td>
                      <td className="px-6 py-4">
                        {getModulePill(log.module)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 font-mono text-[10px] rounded border border-gray-200">
                          {prefix}-{log.object_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium max-w-sm truncate" title={log.description}>
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="border-t border-brand-border/60 p-4 flex flex-col sm:flex-row items-center justify-between bg-brand-cream/10 gap-4">
            <span className="text-sm font-medium text-brand-text-muted">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, totalItems)} of {totalItems} entries (Page {page} of {totalPages})
            </span>
            <div className="flex items-center space-x-1">
              <button 
                disabled={!hasPrev || loading} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    page === pageNum 
                      ? 'bg-brand-gold border-brand-gold text-brand-brown font-bold' 
                      : 'bg-white border-brand-border text-brand-text hover:bg-brand-cream'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button 
                disabled={!hasNext || loading} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm font-medium text-brand-text bg-white border border-brand-border rounded-lg hover:bg-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Drawer / Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Details" size="max-w-2xl">
        {selectedLog && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-brand-cream/30 p-4 rounded-xl border border-brand-border/60">
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Time</p>
                <p className="text-sm text-brand-text font-bold">
                  {new Date(selectedLog.created_at).toLocaleString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getActionStyles(selectedLog.action)}`}>
                  {selectedLog.action}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">User</p>
                <p className="text-sm font-bold text-brand-text">
                  {selectedLog.user_name || selectedLog.user || 'System'}
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Module</p>
                <p className="text-sm font-bold text-brand-text">
                  {selectedLog.module}
                </p>
              </div>
              <div className="col-span-1">
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Object ID</p>
                <p className="text-sm font-bold font-mono text-brand-text">
                  #{selectedLog.object_id}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-brand-text bg-white p-4 rounded-xl border border-brand-border/60 leading-relaxed font-medium">
                {selectedLog.description}
              </p>
            </div>

            <div>
              <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-2">Data Changes</p>
              {renderDataChanges(selectedLog.old_data, selectedLog.new_data)}
            </div>
            
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedLog(null)} className="rounded-xl bg-brand-cream/50 px-5 py-2.5 text-sm font-semibold text-brand-text hover:bg-brand-cream shadow-sm cursor-pointer border border-brand-border">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActivityLog;
