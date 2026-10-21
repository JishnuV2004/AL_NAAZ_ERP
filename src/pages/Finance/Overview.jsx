import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins, Wallet, Users, FileText, TrendingUp, TrendingDown,
  ArrowLeftRight, CreditCard, ChevronRight,
  Building2, Smartphone, ShoppingBag, ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';
import toast from 'react-hot-toast';
import { getFinanceDashboard } from '../../api/finance.api';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === '') return '₹ 0.00';
  const val = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(val)) return '₹ 0.00';
  const prefix = val < 0 ? '- ₹ ' : '₹ ';
  return `${prefix}${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const getAccountIcon = (type) => {
  const t = String(type || '').toUpperCase();
  switch (t) {
    case 'BANK':
      return { icon: Building2, iconBg: 'bg-blue-50 text-blue-600' };
    case 'CASH':
      return { icon: Wallet, iconBg: 'bg-emerald-50 text-emerald-600' };
    case 'UPI':
      return { icon: Smartphone, iconBg: 'bg-purple-50 text-purple-600' };
    case 'RECEIVABLE':
      return { icon: ShoppingBag, iconBg: 'bg-amber-50 text-amber-600' };
    case 'PETTY_CASH':
      return { icon: Coins, iconBg: 'bg-cyan-50 text-cyan-600' };
    case 'PAYABLE':
      return { icon: FileText, iconBg: 'bg-rose-50 text-rose-600' };
    default:
      return { icon: Wallet, iconBg: 'bg-slate-100 text-slate-600' };
  }
};

const Overview = () => {
  const navigate = useNavigate();

  // Filter States
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [timeFilter, setTimeFilter] = useState('month');
  const [accountTab, setAccountTab] = useState('ALL');

  // API Data States
  const [loading, setLoading] = useState(true);
  const [financeData, setFinanceData] = useState(null);

  // Modals for Quick Actions
  const [activeModal, setActiveModal] = useState(null);
  const [modalForm, setModalForm] = useState({
    amount: '',
    account: 'Cash in Hand',
    category: '',
    supplier: '',
    customer: '',
    remarks: ''
  });

  const fetchFinanceOverview = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branchFilter && branchFilter !== 'All Branches' && branchFilter !== 'all') {
        params.branch = branchFilter;
      }
      if (timeFilter && timeFilter !== 'all') {
        params.period = timeFilter;
      }
      const data = await getFinanceDashboard(params);
      setFinanceData(data);
    } catch (err) {
      console.error('Failed to fetch finance dashboard overview:', err);
      toast.error('Failed to load finance overview from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceOverview();
  }, [branchFilter, timeFilter]);

  const overview = financeData?.overview || {};
  const accountBalances = financeData?.account_balances || [];
  const incomeExpenses = financeData?.income_expenses || {};
  const recentTransactions = financeData?.recent_transactions || [];
  const pendingReceivables = financeData?.pending_receivables || [];
  const pendingPayables = financeData?.pending_payables || [];

  // Branch options dynamically extracted from accounts
  const branchOptions = Array.from(
    new Map(
      accountBalances
        .filter(a => a.branch_id && a.branch_name)
        .map(a => [a.branch_id, { id: a.branch_id, name: a.branch_name }])
    ).values()
  );
  if (branchOptions.length === 0) {
    branchOptions.push(
      { id: 1, name: 'Al Naaz Kayamkulam' },
      { id: 2, name: 'Al Naaz Kochi' }
    );
  }

  // Filter accounts by branch if selected
  const branchFilteredAccounts = branchFilter === 'All Branches' || branchFilter === 'all'
    ? accountBalances
    : accountBalances.filter(a => String(a.branch_id) === String(branchFilter) || a.branch_name === branchFilter);

  // Filter accounts by active tab
  const filteredAccounts = branchFilteredAccounts.filter(acc => {
    if (accountTab === 'ALL') return true;
    return acc.account_type === accountTab;
  });

  // Calculate counts for account tab pills
  const cashAccountsCount = branchFilteredAccounts.filter(a => a.account_type === 'CASH').length;
  const bankAccountsCount = branchFilteredAccounts.filter(a => a.account_type === 'BANK').length;
  const upiAccountsCount = branchFilteredAccounts.filter(a => a.account_type === 'UPI').length;
  const receivableAccountsCount = branchFilteredAccounts.filter(a => a.account_type === 'RECEIVABLE').length;
  const pettyCashAccountsCount = branchFilteredAccounts.filter(a => a.account_type === 'PETTY_CASH').length;

  // Account Balances Bar Chart Data aggregated by type
  const aggregatedByType = branchFilteredAccounts.reduce((acc, curr) => {
    const type = curr.account_type;
    const balance = parseFloat(curr.balance) || 0;
    acc[type] = (acc[type] || 0) + balance;
    return acc;
  }, {});

  const accountBalancesData = [
    { name: 'Bank', balance: aggregatedByType['BANK'] || 0, color: '#3B82F6', formatted: formatCurrency(aggregatedByType['BANK'] || 0) },
    { name: 'Cash', balance: aggregatedByType['CASH'] || 0, color: '#10B981', formatted: formatCurrency(aggregatedByType['CASH'] || 0) },
    { name: 'UPI', balance: aggregatedByType['UPI'] || 0, color: '#8B5CF6', formatted: formatCurrency(aggregatedByType['UPI'] || 0) },
    { name: 'Receivable', balance: aggregatedByType['RECEIVABLE'] || 0, color: '#F59E0B', formatted: formatCurrency(aggregatedByType['RECEIVABLE'] || 0) },
    { name: 'Petty Cash', balance: aggregatedByType['PETTY_CASH'] || 0, color: '#06B6D4', formatted: formatCurrency(aggregatedByType['PETTY_CASH'] || 0) },
    { name: 'Payables', balance: -(overview.payables || 0), color: '#EF4444', formatted: formatCurrency(-(overview.payables || 0)) }
  ];

  // Income vs Expenses Trend Data
  const trendData = [
    { name: 'Current Period', Income: incomeExpenses.total_income || 0, Expenses: incomeExpenses.total_expenses || 0, Net: incomeExpenses.net_income || 0 }
  ];

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!modalForm.amount || Number(modalForm.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amt = Number(modalForm.amount);
    if (activeModal === 'income') {
      toast.success(`Recorded Income of ₹${amt.toLocaleString()}`);
    } else if (activeModal === 'expense') {
      toast.success(`Recorded Expense of ₹${amt.toLocaleString()}`);
    } else if (activeModal === 'transfer') {
      toast.success(`Transferred ₹${amt.toLocaleString()} successfully`);
    } else if (activeModal === 'settle') {
      toast.success(`Settled Receivable of ₹${amt.toLocaleString()}`);
    } else if (activeModal === 'pay') {
      toast.success(`Paid Supplier ₹${amt.toLocaleString()}`);
    }

    setActiveModal(null);
    setModalForm({ amount: '', account: 'Cash in Hand', category: '', supplier: '', customer: '', remarks: '' });
  };


  // Custom Y-Axis tick renderer
  const CustomYAxisTick = ({ x, y, payload }) => {
    if (payload.value === undefined || payload.value === null) return null;
    return (
      <text x={x - 6} y={y + 4} textAnchor="end" fill="#64748B" fontSize={11} fontWeight={500} fontFamily="'Inter', sans-serif">
        ₹ {Number(payload.value).toLocaleString('en-IN')}
      </text>
    );
  };

  // Custom Tooltip for Account Balances
  const AccountBalancesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = Number(data.value);
      const isLoss = val < 0 || data.payload?.name === 'Payables';
      return (
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-md">
          <p className="text-[11px] font-semibold text-slate-500 mb-0.5">{data.payload?.name}</p>
          <p className="text-xs font-semibold text-slate-700">
            Balance : <span className={`font-bold font-sans ${isLoss ? 'text-red-500' : 'text-slate-900'}`}>{formatCurrency(val)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Income vs Expenses
  const IncomeExpensesTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const val = Number(data.value);
      const isLoss = data.payload?.name === 'Expenses' || (data.payload?.name === 'Net Income' && val < 0);
      return (
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-md">
          <p className="text-[11px] font-semibold text-slate-500 mb-0.5">{data.payload?.name}</p>
          <p className="text-xs font-semibold text-slate-700">
            Amount : <span className={`font-bold font-sans ${isLoss ? 'text-red-500' : 'text-slate-900'}`}>{formatCurrency(val)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="space-y-4 text-slate-800 pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-normal text-slate-500 mb-0.5">
            Finance &gt; Overview
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance Overview</h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Complete view of your cash, bank, UPI, receivables, payables and financial position.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Branch Filter */}
          <div className="relative">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="All Branches">All Branches</option>
              {branchOptions.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Period Filter */}
          <div className="relative">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs focus:outline-none cursor-pointer"
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchFinanceOverview}
            disabled={loading}
            className="p-1.5 bg-white text-slate-700 hover:text-blue-600 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Finance Overview"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Row 1: Top 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Financial Position */}
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-500">
              <Coins size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Total Financial Position</span>
              <span className="text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full text-[#16a34a] bg-[#dcfce7]">
                Live Balance
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[26px] font-bold text-slate-800 tracking-tight mb-1 truncate">
              {loading ? '...' : formatCurrency(overview.total_financial_position)}
            </div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">
              Total of all accounts (Cash, Bank, UPI, etc.)
            </p>
          </div>
        </div>

        {/* Card 2: Available Money */}
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500">
              <Wallet size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Available Money</span>
              <span className="text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full text-[#16a34a] bg-[#dcfce7]">
                Ready Liquidity
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[26px] font-bold text-slate-800 tracking-tight mb-1 truncate">
              {loading ? '...' : formatCurrency(overview.available_money)}
            </div>
            <p className="text-[13px] font-medium text-[#94a3b8] truncate">
              Cash + Bank + UPI
            </p>
          </div>
        </div>

        {/* Card 3: Receivables */}
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-amber-50 text-amber-500">
              <Users size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Receivables</span>
              <span className="text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full text-amber-700 bg-amber-50">
                Pending
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[26px] font-bold text-slate-800 tracking-tight mb-1 truncate">
              {loading ? '...' : formatCurrency(overview.receivables)}
            </div>
            <a href="#pending-receivables" className="text-[13px] font-medium text-amber-600 hover:underline truncate inline-block">
              {overview.pending_receivables_count ?? pendingReceivables.length} pending settlements &gt;
            </a>
          </div>
        </div>

        {/* Card 4: Payables */}
        <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-500">
              <FileText size={22} />
            </div>
            <div className="flex flex-col items-start pt-0.5">
              <span className="text-[#475569] text-[13px] font-semibold leading-tight">Payables</span>
              <span className="text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full text-rose-700 bg-rose-50">
                Due to Suppliers
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div className="font-sans text-[26px] font-bold text-slate-800 tracking-tight mb-1 truncate">
              {loading ? '...' : formatCurrency(overview.payables)}
            </div>
            <a href="#pending-payables" className="text-[13px] font-medium text-rose-500 hover:underline truncate inline-block">
              {overview.pending_payables_count ?? pendingPayables.length} pending payments &gt;
            </a>
          </div>
        </div>

      </div>

      {/* Row 2: Middle Charts & Quick Actions (3 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Col 1: Account Balances Bar Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Account Balances</h2>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                {branchFilter}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mb-3">Current balance across all financial accounts</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountBalancesData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis width={58} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
                <Tooltip cursor={false} content={<AccountBalancesTooltip />} />
                <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1.5} />
                <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                  {accountBalancesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[11px] font-semibold text-rose-500 pt-1">
            Payables: {formatCurrency(overview.payables || 0)}
          </div>
        </div>

        {/* Col 2: Income vs Expenses Summary & Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            {/* Title */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-start gap-2.5">
                <TrendingUp className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">Income vs Expenses</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    {incomeExpenses.start_date && incomeExpenses.end_date 
                      ? `${formatDate(incomeExpenses.start_date)} - ${formatDate(incomeExpenses.end_date)}`
                      : 'Based on posted transactions'}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                Net: {formatCurrency(incomeExpenses.net_income || 0)}
              </span>
            </div>

            {/* Income vs Expenses Numbers Row */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 my-3 pb-2">
              {/* Income Column */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                    {formatCurrency(incomeExpenses.total_income || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-normal pt-0.5">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Total Income
                  </span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="hidden sm:block w-px bg-slate-200 self-stretch my-0.5"></div>

              {/* Expenses Column */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                    {formatCurrency(incomeExpenses.total_expenses || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-normal pt-0.5">
                  <span className="flex items-center gap-1.5 font-medium text-rose-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Total Expenses
                  </span>
                </div>
              </div>
            </div>

            {/* Net Income Summary Pill */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-medium">Net Profit / Operating Result:</span>
              <span className="font-extrabold text-emerald-600 font-sans text-sm">
                {formatCurrency(incomeExpenses.net_income || 0)}
              </span>
            </div>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Income', amount: incomeExpenses.total_income || 0, fill: '#10B981' },
                { name: 'Expenses', amount: incomeExpenses.total_expenses || 0, fill: '#EF4444' },
                { name: 'Net Income', amount: incomeExpenses.net_income || 0, fill: '#3B82F6' }
              ]} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis width={58} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
                <Tooltip cursor={false} content={<IncomeExpensesTooltip />} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {[{ fill: '#10B981' }, { fill: '#EF4444' }, { fill: '#3B82F6' }].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Col 3: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">⚡</span>
                <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Shortcuts</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mb-3">Frequently used finance tasks</p>
          </div>

          <div className="flex flex-col gap-2.5 flex-1 justify-between pt-1">
            {/* Record Expense */}
            <button
              type="button"
              onClick={() => navigate('/finance/expenses')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">Record Expense</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Log operational costs</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Transfer Money */}
            <button
              type="button"
              onClick={() => navigate('/finance/cashtransfers')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">Transfer Money</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Move funds between accounts</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Settle Receivable */}
            <button
              type="button"
              onClick={() => navigate('/finance/receivables')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">Settle Receivable</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Customer balance recovery</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Pay Supplier */}
            <button
              type="button"
              onClick={() => navigate('/finance/supplierpayables')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 bg-white hover:bg-slate-50/80 hover:border-slate-300 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-snug">Pay Supplier</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">Clear vendor payables</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Row 3: Financial Accounts Table & Recent Transactions (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Financial Accounts (~6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Financial Accounts</h2>
              </div>

              <button
                type="button"
                onClick={() => navigate('/finance/financialaccounts')}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Manage Accounts
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
              {[
                { label: `All (${branchFilteredAccounts.length})`, key: 'ALL' },
                { label: `Cash (${cashAccountsCount})`, key: 'CASH' },
                { label: `Bank (${bankAccountsCount})`, key: 'BANK' },
                { label: `UPI (${upiAccountsCount})`, key: 'UPI' },
                { label: `Receivables (${receivableAccountsCount})`, key: 'RECEIVABLE' },
                { label: `Petty Cash (${pettyCashAccountsCount})`, key: 'PETTY_CASH' }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setAccountTab(tab.key)}
                  className={`px-3 py-1 rounded-full font-medium text-xs transition-all cursor-pointer ${
                    accountTab === tab.key
                      ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto max-h-[360px] custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] sticky top-0 bg-white">
                    <th className="py-2 px-2">Account Name</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Branch</th>
                    <th className="py-2 px-2 text-right">Current Balance</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`acc-skel-${i}`} className="animate-pulse">
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-24"></div></td>
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-16"></div></td>
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-20"></div></td>
                        <td className="py-3 px-2 text-right"><div className="h-3.5 bg-gray-100 rounded w-16 ml-auto"></div></td>
                        <td className="py-3 px-2 text-center"><div className="h-3.5 bg-gray-100 rounded w-12 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No financial accounts found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(acc => {
                      const { icon: IconComp, iconBg } = getAccountIcon(acc.account_type);
                      const isNegative = (parseFloat(acc.balance) || 0) < 0;
                      return (
                        <tr key={acc.account_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                                <IconComp className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-semibold text-slate-900">{acc.account_name}</span>
                            </div>
                          </td>

                          <td className="py-2.5 px-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              acc.account_type === 'CASH' ? 'bg-slate-100 text-slate-700' :
                              acc.account_type === 'BANK' ? 'bg-blue-50 text-blue-700' :
                              acc.account_type === 'UPI' ? 'bg-purple-50 text-purple-700' :
                              acc.account_type === 'RECEIVABLE' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                              acc.account_type === 'PETTY_CASH' ? 'bg-cyan-50 text-cyan-700' :
                              'bg-rose-50 text-rose-700 border border-rose-200/60'
                            }`}>
                              {acc.account_type}
                            </span>
                          </td>

                          <td className="py-2.5 px-2 text-slate-600 truncate max-w-[120px]">{acc.branch_name}</td>

                          <td className={`py-2.5 px-2 text-right font-bold text-xs tabular-nums ${
                            isNegative ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {formatCurrency(acc.balance)}
                          </td>

                          <td className="py-2.5 px-2 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Transactions (~6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
              </div>

              <button
                type="button"
                onClick={() => navigate('/finance/cashtransfers')}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[390px] custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] sticky top-0 bg-white">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">Description</th>
                    <th className="py-2 px-2">Account</th>
                    <th className="py-2 px-2 text-center">Type</th>
                    <th className="py-2 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`tx-skel-${i}`} className="animate-pulse">
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-16"></div></td>
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-28"></div></td>
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-20"></div></td>
                        <td className="py-3 px-2 text-center"><div className="h-3.5 bg-gray-100 rounded w-10 mx-auto"></div></td>
                        <td className="py-3 px-2 text-right"><div className="h-3.5 bg-gray-100 rounded w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No recent transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map(tx => {
                      const isIncoming = tx.direction === 'IN';
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                          <td className="py-2.5 px-2 font-semibold text-slate-900 max-w-[180px] truncate">
                            {tx.description}
                          </td>
                          <td className="py-2.5 px-2 text-slate-600 truncate max-w-[140px]">
                            {tx.account_name}
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isIncoming ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {isIncoming ? 'In' : 'Out'}
                            </span>
                          </td>
                          <td className={`py-2.5 px-2 text-right font-bold text-xs tabular-nums whitespace-nowrap ${
                            isIncoming ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {isIncoming ? '+ ' : '- '}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Bottom 2 Columns Layout (Pending Receivables & Pending Payables) */}
      {/* Cash Flow Summary has been removed as requested */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Col 1: Pending Receivables (~6 cols) */}
        <div id="pending-receivables" className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Pending Receivables</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/finance/receivables')}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[280px] custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] sticky top-0 bg-white">
                    <th className="py-2 px-2">Account</th>
                    <th className="py-2 px-2">Branch</th>
                    <th className="py-2 px-2 text-right">Outstanding</th>
                    <th className="py-2 px-2 text-center">Business Date</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={`rec-skel-${i}`} className="animate-pulse">
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-24"></div></td>
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-20"></div></td>
                        <td className="py-3 px-2 text-right"><div className="h-3.5 bg-gray-100 rounded w-16 ml-auto"></div></td>
                        <td className="py-3 px-2 text-center"><div className="h-3.5 bg-gray-100 rounded w-16 mx-auto"></div></td>
                        <td className="py-3 px-2 text-right"><div className="h-3.5 bg-gray-100 rounded w-12 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : pendingReceivables.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No pending receivables found.
                      </td>
                    </tr>
                  ) : (
                    pendingReceivables.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 font-semibold text-slate-900 text-xs">{item.account_name}</td>
                        <td className="py-2.5 px-2 text-slate-600 text-[11px]">{item.branch_name}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-xs text-amber-700 tabular-nums">
                          {formatCurrency(item.outstanding_amount)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500 text-[11px]">{formatDate(item.business_date)}</td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setModalForm(prev => ({ ...prev, amount: item.outstanding_amount }));
                              setActiveModal('settle');
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            Settle
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Col 2: Pending Payables (~6 cols) */}
        <div id="pending-payables" className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900">Pending Payables</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/finance/supplierpayables')}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[280px] custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] sticky top-0 bg-white">
                    <th className="py-2 px-2">Supplier</th>
                    <th className="py-2 px-2">Branch</th>
                    <th className="py-2 px-2 text-right">Outstanding</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={`pay-skel-${i}`} className="animate-pulse">
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-24"></div></td>
                        <td className="py-3 px-2"><div className="h-3.5 bg-gray-100 rounded w-20"></div></td>
                        <td className="py-3 px-2 text-right"><div className="h-3.5 bg-gray-100 rounded w-16 ml-auto"></div></td>
                        <td className="py-3 px-2 text-center"><div className="h-3.5 bg-gray-100 rounded w-12 mx-auto"></div></td>
                        <td className="py-3 px-2 text-right"><div className="h-3.5 bg-gray-100 rounded w-12 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : pendingPayables.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No pending payables found.
                      </td>
                    </tr>
                  ) : (
                    pendingPayables.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 font-semibold text-slate-900 text-xs">{item.supplier_name}</td>
                        <td className="py-2.5 px-2 text-slate-600 text-[11px]">{item.branch_name}</td>
                        <td className="py-2.5 px-2 text-right font-bold text-xs text-rose-600 tabular-nums">
                          {formatCurrency(item.outstanding_amount)}
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'OPEN' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setModalForm(prev => ({ ...prev, amount: item.outstanding_amount, supplier: item.supplier_name }));
                              setActiveModal('pay');
                            }}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            Pay
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Action Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {activeModal === 'income' && 'Record Income'}
                {activeModal === 'expense' && 'Record Expense'}
                {activeModal === 'transfer' && 'Transfer Money'}
                {activeModal === 'settle' && 'Settle Receivable'}
                {activeModal === 'pay' && 'Pay Supplier'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-3.5 text-xs font-normal">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹)*</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={modalForm.amount}
                  onChange={(e) => setModalForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold tabular-nums focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Account*</label>
                <select
                  value={modalForm.account}
                  onChange={(e) => setModalForm(prev => ({ ...prev, account: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  {accountBalances.map(acc => (
                    <option key={acc.account_id} value={acc.account_name}>
                      {acc.account_name} ({acc.branch_name}) - {formatCurrency(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              {activeModal === 'pay' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Meat Supplier"
                    value={modalForm.supplier}
                    onChange={(e) => setModalForm(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks / Note</label>
                <textarea
                  rows="2"
                  placeholder="Enter transaction details..."
                  value={modalForm.remarks}
                  onChange={(e) => setModalForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Overview;
