import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAddOutline,
  IoSearchOutline,
  IoPieChartOutline,
  IoWalletOutline,

  IoCheckmarkCircleOutline,
  IoTrendingDownOutline,
  IoTrendingUpOutline,
  IoCalendarOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoArrowForwardOutline,
  IoDocumentTextOutline,
  IoWarningOutline
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const initialBudgets = [
  {
    id: 'b1',
    code: 'CC-101',
    department: 'Kitchen & Raw Materials',
    category: 'Food & Ingredients',
    fiscalPeriod: 'Q2 FY2026',
    allocatedAmount: 600000,
    actualSpend: 425000,
    thresholdPct: 85,
    manager: 'Farhan Rasheed',
    status: 'HEALTHY'
  },
  {
    id: 'b2',
    code: 'CC-102',
    department: 'Utilities & Premises',
    category: 'Utilities',
    fiscalPeriod: 'Q2 FY2026',
    allocatedAmount: 180000,
    actualSpend: 165400,
    thresholdPct: 85,
    manager: 'Sana Iqbal',
    status: 'NEAR LIMIT'
  },
  {
    id: 'b3',
    code: 'CC-103',
    department: 'Logistics & Delivery',
    category: 'Transport & Logistics',
    fiscalPeriod: 'Q2 FY2026',
    allocatedAmount: 120000,
    actualSpend: 132000,
    thresholdPct: 90,
    manager: 'Rahim K.',
    status: 'EXCEEDED'
  },
  {
    id: 'b4',
    code: 'CC-104',
    department: 'Ice & Packaging Supplies',
    category: 'Ice & Packaging',
    fiscalPeriod: 'Q2 FY2026',
    allocatedAmount: 150000,
    actualSpend: 98000,
    thresholdPct: 80,
    manager: 'Farhan Rasheed',
    status: 'HEALTHY'
  },
  {
    id: 'b5',
    code: 'CC-105',
    department: 'Staff Welfare & HR',
    category: 'Staff Welfare',
    fiscalPeriod: 'Q2 FY2026',
    allocatedAmount: 100000,
    actualSpend: 62000,
    thresholdPct: 85,
    manager: 'Anjali Verma',
    status: 'HEALTHY'
  },
  {
    id: 'b6',
    code: 'CC-106',
    department: 'Marketing & Events',
    category: 'Marketing',
    fiscalPeriod: 'Q2 FY2026',
    allocatedAmount: 80000,
    actualSpend: 75000,
    thresholdPct: 85,
    manager: 'Vikram Singh',
    status: 'NEAR LIMIT'
  }
];

const defaultForm = {
  department: 'Kitchen & Raw Materials',
  category: 'Food & Ingredients',
  fiscalPeriod: 'Q2 FY2026',
  allocatedAmount: '',
  thresholdPct: 85,
  manager: 'Farhan Rasheed'
};

const Budgets = () => {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);

  const filteredBudgets = budgets.filter(b => {
    const matchesSearch =
      b.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPeriod = periodFilter === 'All' || b.fiscalPeriod === periodFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesPeriod && matchesStatus;
  });

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalActual = budgets.reduce((sum, b) => sum + b.actualSpend, 0);
  const remainingPool = totalAllocated - totalActual;
  const exceededCount = budgets.filter(b => b.status === 'EXCEEDED').length;

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingId(b.id);
    setFormData({
      department: b.department,
      category: b.category,
      fiscalPeriod: b.fiscalPeriod,
      allocatedAmount: b.allocatedAmount,
      thresholdPct: b.thresholdPct,
      manager: b.manager
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allocated = parseFloat(formData.allocatedAmount) || 0;
    if (editingId) {
      setBudgets(prev =>
        prev.map(b => {
          if (b.id === editingId) {
            const pct = (b.actualSpend / allocated) * 100;
            let status = 'HEALTHY';
            if (pct >= 100) status = 'EXCEEDED';
            else if (pct >= formData.thresholdPct) status = 'NEAR LIMIT';
            return {
              ...b,
              ...formData,
              allocatedAmount: allocated,
              status
            };
          }
          return b;
        })
      );
      toast.success('Budget allocation updated!');
    } else {
      const newB = {
        id: `b${Date.now()}`,
        code: `CC-10${budgets.length + 1}`,
        ...formData,
        allocatedAmount: allocated,
        actualSpend: 0,
        status: 'HEALTHY'
      };
      setBudgets(prev => [newB, ...prev]);
      toast.success(`New budget CC-10${budgets.length + 1} allocated!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this cost center budget allocation?')) {
      setBudgets(prev => prev.filter(b => b.id !== id));
      toast.success('Budget allocation removed');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-1 flex items-center gap-1.5">
            <span>Finance</span> &gt; <span className="text-gray-700">Financial Budgets</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Budgets & Cost Centers</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Set department budget caps, track real-time operational burn rate, and monitor expenditure variance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/finance/financialaccounts')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Accounts
          </button>
          <button
            type="button"
            onClick={() => navigate('/finance/expenses')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => navigate('/finance/financialledger')}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            General Ledger
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <IoAddOutline size={16} /> Add Budget Allocation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Total Budget Allocated</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalAllocated.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-blue-600 mt-1">Cost Center Limit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IoPieChartOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Actual Expenditure</p>
            <h3 className="text-2xl font-bold text-gray-900 tabular-nums font-mono">
              ₹{totalActual.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-purple-600 mt-1">
              {((totalActual / totalAllocated) * 100).toFixed(1)}% Utilized
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <IoWalletOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Remaining Pool</p>
            <h3 className={`text-2xl font-bold tabular-nums font-mono ${remainingPool >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{remainingPool.toLocaleString('en-IN')}
            </h3>
            <p className="text-[10px] font-medium text-emerald-600 mt-1">Unspent Budget</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IoCheckmarkCircleOutline size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Over-Budget Alerts</p>
            <h3 className="text-2xl font-bold text-rose-600 tabular-nums">
              {exceededCount} Departments
            </h3>
            <p className="text-[10px] font-medium text-rose-600 mt-1">Action Required</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <IoWarningOutline size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search department, category, manager..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Period:</span>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Periods</option>
              <option value="Q2 FY2026">Q2 FY2026</option>
              <option value="Q3 FY2026">Q3 FY2026</option>
              <option value="FY2026 Full Year">FY2026 Full Year</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="HEALTHY">HEALTHY (&lt;85%)</option>
              <option value="NEAR LIMIT">NEAR LIMIT (85-99%)</option>
              <option value="EXCEEDED">EXCEEDED (&gt;100%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Budget Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Code & Department</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4 text-right">Budget Cap (₹)</th>
                <th className="py-3.5 px-4 text-right">Actual Spend (₹)</th>
                <th className="py-3.5 px-4 text-right">Variance (₹)</th>
                <th className="py-3.5 px-4 text-center">Burn %</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-gray-400 text-xs">
                    No cost center budgets found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBudgets.map(b => {
                  const pct = Math.min(100, Math.round((b.actualSpend / b.allocatedAmount) * 100));
                  const variance = b.allocatedAmount - b.actualSpend;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{b.department}</div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{b.code} • Mgr: {b.manager}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">{b.category}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-600">{b.fiscalPeriod}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        ₹{b.allocatedAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-900">
                        ₹{b.actualSpend.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                          {variance >= 0 ? `+₹${variance.toLocaleString('en-IN')}` : `-₹${Math.abs(variance).toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="w-24 mx-auto">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct >= 100 ? 'bg-rose-500' : pct >= b.thresholdPct ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'HEALTHY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          b.status === 'NEAR LIMIT' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Budget"
                          >
                            <IoPencilOutline size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Budget"
                          >
                            <IoTrashOutline size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Budget Allocation' : 'Add Cost Center Budget Allocation'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department / Cost Center Name</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              placeholder="e.g. Kitchen & Raw Materials"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expense Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              >
                <option value="Food & Ingredients">Food & Ingredients</option>
                <option value="Utilities">Utilities</option>
                <option value="Transport & Logistics">Transport & Logistics</option>
                <option value="Ice & Packaging">Ice & Packaging</option>
                <option value="Staff Welfare">Staff Welfare</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fiscal Period</label>
              <select
                value={formData.fiscalPeriod}
                onChange={e => setFormData({ ...formData, fiscalPeriod: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs bg-white"
              >
                <option value="Q2 FY2026">Q2 FY2026</option>
                <option value="Q3 FY2026">Q3 FY2026</option>
                <option value="FY2026 Full Year">FY2026 Full Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Allocated Budget (₹)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.allocatedAmount}
                onChange={e => setFormData({ ...formData, allocatedAmount: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
                placeholder="e.g. 500000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warning Threshold %</label>
              <input
                type="number"
                required
                min="50"
                max="99"
                value={formData.thresholdPct}
                onChange={e => setFormData({ ...formData, thresholdPct: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department Manager</label>
            <input
              type="text"
              required
              value={formData.manager}
              onChange={e => setFormData({ ...formData, manager: e.target.value })}
              className="w-full px-3.5 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 text-xs"
              placeholder="e.g. Farhan Rasheed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors text-xs cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Allocate Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;
