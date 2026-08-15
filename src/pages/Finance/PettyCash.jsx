import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { financeService } from '../../services/financeService';
import { IoAddOutline, IoSearchOutline } from 'react-icons/io5';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const PettyCash = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [totalAdjustments, setTotalAdjustments] = useState(0);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddCashOpen, setIsAddCashOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], remarks: '' });
  
  // Detail Modal
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchLedger = async () => {
    setLoading(true);
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (typeFilter !== 'ALL') filters.transaction_type = typeFilter;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    const response = await financeService.fetchPettyCash(page, 10, filters);
    if (response) {
      setLedger(response.results || response.data || []);
      setTotalItems(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10) || 1);
      setHasNext(!!response.next);
      setCurrentBalance(response.current_balance || 0);
      setTotalIn(response.total_in || 0);
      setTotalOut(response.total_out || 0);
      setTotalAdjustments(response.total_adjustments || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, [page, searchTerm, typeFilter, startDate, endDate]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, startDate, endDate]);

  const handleAddCash = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      await financeService.addPettyCash({
        amount: formData.amount,
        transaction_date: formData.date,
        remarks: formData.remarks
      });
      setIsAddCashOpen(false);
      setFormData({ amount: '', date: new Date().toISOString().split('T')[0], remarks: '' });
      fetchLedger();
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Top Section: Balance and Add Cash */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm font-medium">Current balance</p>
          <h2 className="text-4xl font-bold text-[#1E5E45] font-sans tracking-tight mt-1">
            ₹{Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <button 
          onClick={() => setIsAddCashOpen(true)}
          className="flex items-center justify-center space-x-1.5 rounded-lg bg-[#1E5E45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#164a35] transition-colors shadow-sm cursor-pointer"
        >
          <IoAddOutline className="h-4 w-4" />
          <span>Add cash</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 border-l-4 border-l-blue-600 shadow-sm">
          <p className="text-gray-500 text-xs font-medium mb-1">Total cash added</p>
          <p className="text-xl font-bold text-gray-900">₹{Number(totalIn).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 border-l-4 border-l-red-500 shadow-sm">
          <p className="text-gray-500 text-xs font-medium mb-1">Total expenses</p>
          <p className="text-xl font-bold text-gray-900">₹{Number(totalOut).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 border-l-4 border-l-amber-500 shadow-sm">
          <p className="text-gray-500 text-xs font-medium mb-1">Total adjustments</p>
          <p className="text-xl font-bold text-gray-900">₹{Number(totalAdjustments).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 border-l-4 border-l-gray-400 shadow-sm">
          <p className="text-gray-500 text-xs font-medium mb-1">Transaction count</p>
          <p className="text-xl font-bold text-gray-900">{totalItems}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
        >
          <option value="ALL">All types</option>
          <option value="CASH_IN">Cash Added</option>
          <option value="EXPENSE">Expense</option>
          <option value="ADJUSTMENT">Adjustment</option>
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

        <div className="relative w-full sm:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <IoSearchOutline className="h-4 w-4" />
          </div>
          <input 
            type="text" 
            placeholder="Search remarks or expense ID" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]" 
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : ledger.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-2">📒</span>
            <p className="font-medium text-sm">No transactions found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">TXN ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Balance After</th>
                  <th className="px-6 py-4">Expense ID</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ledger.map(tx => {
                  let typePill = null;
                  if (tx.transaction_type === 'CASH_IN') {
                    typePill = <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-50 text-green-700 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Cash added</span>;
                  } else if (tx.transaction_type === 'EXPENSE') {
                    typePill = <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-red-700 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Expense</span>;
                  } else {
                    typePill = <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Adjustment</span>;
                  }

                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 font-mono text-[10px] rounded border border-gray-200">
                          PC-{tx.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {new Date(tx.transaction_date || tx.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">{typePill}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                        {tx.transaction_type === 'CASH_IN' ? '+' : '-'}₹{Math.abs(Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                        ₹{Number(tx.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        {tx.expense_id ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 font-mono text-[10px] rounded border border-gray-200">
                            EXP-{tx.expense_id}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium truncate max-w-[150px]" title={tx.remarks}>
                        {tx.remarks}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {tx.created_by_name || 'admin'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                        {new Date(tx.transaction_date || tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && ledger.length > 0 && (
          <div className="border-t border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <span className="text-sm font-medium text-gray-500">
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

      {/* Add Cash Modal */}
      <Modal isOpen={isAddCashOpen} onClose={() => setIsAddCashOpen(false)} title="Add to Petty Cash" size="max-w-md">
        <form onSubmit={handleAddCash} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-green-800">
              Adding cash will permanently record a <strong>CASH_IN</strong> transaction and increase the total available petty cash balance.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Amount (₹)</label>
            <input 
              type="number" 
              required 
              min="1" 
              step="0.01"
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden font-mono font-bold" 
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Date</label>
            <input 
              type="date" 
              required 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Remarks / Source</label>
            <textarea 
              rows="2"
              required
              value={formData.remarks} 
              onChange={e => setFormData({...formData, remarks: e.target.value})} 
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden resize-none" 
              placeholder="e.g. Added from main safe"
            ></textarea>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full rounded-xl bg-[#1E5E45] px-5 py-3 text-sm font-bold text-white hover:bg-[#164a35] shadow-md cursor-pointer disabled:opacity-50 transition-colors flex justify-center"
            >
              {isSubmitting ? <ButtonLoader /> : 'Confirm Add Cash'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Drawer / Modal */}
      <Modal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} title="Transaction Details" size="max-w-lg">
        {selectedTx && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-gray-900 font-bold">PC-{selectedTx.id}</p>
              </div>
              <div className="text-right">
                {selectedTx.transaction_type === 'CASH_IN' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>Cash added</span>}
                {selectedTx.transaction_type === 'EXPENSE' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Expense</span>}
                {selectedTx.transaction_type === 'ADJUSTMENT' && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Adjustment</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Amount</p>
                <p className={`font-mono text-lg font-bold ${selectedTx.transaction_type === 'CASH_IN' ? 'text-green-600' : 'text-gray-900'}`}>
                  {selectedTx.transaction_type === 'CASH_IN' ? '+' : '-'}₹{Math.abs(Number(selectedTx.amount)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Balance After</p>
                <p className="font-mono text-lg font-bold text-brand-brown">
                  ₹{Number(selectedTx.balance_after).toLocaleString()}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-brand-text">
                  {new Date(selectedTx.transaction_date || selectedTx.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Recorded By</p>
                <p className="text-sm font-medium text-brand-text">
                  {selectedTx.created_by_name || 'System'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Remarks</p>
              <p className="text-sm text-brand-text bg-white p-3 rounded-lg border border-brand-border/60">
                {selectedTx.remarks || 'No remarks provided.'}
              </p>
            </div>

            {selectedTx.expense_id && (
              <div className="bg-brand-cream/20 p-4 rounded-xl border border-brand-border border-dashed">
                <h4 className="text-xs font-bold text-brand-text uppercase mb-2">Related Expense Info</h4>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-brand-text">Expense #{selectedTx.expense_id}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-brand-border text-brand-text text-xs font-bold rounded-lg hover:border-brand-gold transition-colors">
                    View Expense
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PettyCash;
