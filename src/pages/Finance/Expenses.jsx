import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { financeService } from '../../services/financeService';
import { IoAddOutline, IoSearchOutline } from 'react-icons/io5';
import { FiEdit } from 'react-icons/fi';
import { PageLoader, ButtonLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const categories = useFinanceStore(state => state.expenseCategories);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultForm = { category: '', amount: '', expense_date: new Date().toISOString().split('T')[0], description: '' };
  const [formData, setFormData] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  
  // Detail Modal
  const [selectedExpense, setSelectedExpense] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    const filters = {};
    if (searchTerm) filters.search = searchTerm;
    if (categoryFilter !== 'ALL') filters.category = categoryFilter;
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;

    const response = await financeService.fetchExpenses(page, 10, filters);
    if (response) {
      setExpenses(response.results || response.data || []);
      setTotalItems(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10) || 1);
      setHasNext(!!response.next);
      setHasPrev(!!response.previous);
    }
    setLoading(false);
  };

  useEffect(() => {
    financeService.fetchExpenseCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [page, searchTerm, categoryFilter, startDate, endDate]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, startDate, endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) return;
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        await financeService.updateExpense(editingId, formData);
      } else {
        await financeService.createExpense(formData);
      }
      setIsModalOpen(false);
      setFormData(defaultForm);
      setEditingId(null);
      fetchExpenses();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (expense, e) => {
    e.stopPropagation();
    setFormData({
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date,
      description: expense.description
    });
    setEditingId(expense.id);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Filters & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="relative w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <IoSearchOutline className="h-4 w-4" />
            </div>
            <input 
              type="text" 
              placeholder="Search description or category" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]" 
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-80 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
            >
              <option value="ALL">All categories</option>
              {categories.map(c => (
                <option key={c.id || c.name} value={c.name}>{c.name}</option>
              ))}
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
              {(searchTerm || categoryFilter !== 'ALL' || startDate || endDate) && (
                <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('ALL'); setStartDate(''); setEndDate(''); }}
                  className="text-sm text-[#1E5E45] font-medium hover:underline ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          
          <button 
            onClick={openAddModal}
            className="flex items-center justify-center space-x-1.5 rounded-lg bg-brand-gold px-4 py-2 text-sm font-semibold text-brand-brown hover:bg-brand-gold-hover transition-colors shadow-sm shrink-0"
          >
            <IoAddOutline className="h-4 w-4" />
            <span>Add expense</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-2">🧾</span>
            <p className="font-medium text-sm">No expenses found for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold tracking-wider uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Expense ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(expense => (
                  <tr 
                    key={expense.id} 
                    onClick={() => setSelectedExpense(expense)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 font-mono text-[10px] rounded border border-gray-200">
                        EXP-{expense.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {new Date(expense.expense_date || expense.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {expense.category || expense.category_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 font-mono">
                      ₹{Number(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate" title={expense.description}>
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {expense.created_by_name || 'admin'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                      {new Date(expense.created_at || expense.expense_date).toLocaleString('en-US', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => openEditModal(expense, e)} 
                        className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && expenses.length > 0 && (
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Expense" : "Add Expense"} size="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingId && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-amber-800 font-medium">
                Changing the amount of an existing expense will automatically record an <strong>ADJUSTMENT</strong> in the Petty Cash ledger to correct the balance.
              </p>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Category</label>
            <select
              required
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden bg-white"
            >
              <option value="">Select category...</option>
              {categories.map(c => (
                <option key={c.id || c.name} value={c.name || c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Amount (₹)</label>
            <input 
              type="number" 
              required 
              min="0.01" 
              step="0.01"
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} 
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden font-mono font-bold text-red-600" 
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Date</label>
            <input 
              type="date" 
              required 
              value={formData.expense_date} 
              onChange={e => setFormData({...formData, expense_date: e.target.value})} 
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brand-text uppercase mb-1.5">Description</label>
            <textarea 
              rows="3"
              required
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm focus:border-brand-gold outline-hidden resize-none" 
              placeholder="Detailed description of the expense..."
            ></textarea>
          </div>
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full rounded-xl bg-brand-gold px-5 py-3 text-sm font-bold text-brand-brown hover:bg-brand-gold-hover shadow-md cursor-pointer disabled:opacity-50 transition-colors flex justify-center"
            >
              {isSubmitting ? <ButtonLoader /> : (editingId ? 'Update Expense' : 'Create Expense')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Expense Detail Drawer / Modal */}
      <Modal isOpen={!!selectedExpense} onClose={() => setSelectedExpense(null)} title="Expense Details" size="max-w-lg">
        {selectedExpense && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-brand-cream/30 p-4 rounded-xl border border-brand-border/60">
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Expense ID</p>
                <p className="font-mono text-sm text-brand-text font-bold">#{selectedExpense.id}</p>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold border bg-brand-cream border-brand-border text-brand-text">
                  {selectedExpense.category || selectedExpense.category_name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Amount</p>
                <p className="font-mono text-xl font-bold text-red-600">
                  ₹{Number(selectedExpense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-medium text-brand-text mt-1">
                  {new Date(selectedExpense.expense_date || selectedExpense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Created By</p>
                <p className="text-sm font-medium text-brand-text mt-1">
                  {selectedExpense.created_by_name || 'System'}
                </p>
              </div>
              <div>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Created At</p>
                <p className="text-sm font-medium text-brand-text mt-1">
                  {new Date(selectedExpense.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-brand-text-muted font-bold uppercase tracking-wider mb-1">Description</p>
              <p className="text-sm text-brand-text bg-white p-4 rounded-xl border border-brand-border/60 leading-relaxed">
                {selectedExpense.description || 'No description provided.'}
              </p>
            </div>

            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
              <h4 className="text-xs font-bold text-red-800 uppercase mb-2">Petty Cash Impact</h4>
              <p className="text-sm font-medium text-red-700">
                This expense reduced the petty cash balance by ₹{Number(selectedExpense.amount).toLocaleString()}.
              </p>
            </div>
            
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedExpense(null)} className="rounded-xl bg-brand-cream/50 px-5 py-2.5 text-sm font-semibold text-brand-text hover:bg-brand-cream shadow-sm cursor-pointer border border-brand-border">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Expenses;
