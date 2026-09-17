import React, { useState } from 'react';
import {
  Coins, Wallet, Users, FileText, TrendingUp, TrendingDown,
  Plus, Minus, ArrowLeftRight, CreditCard, ChevronRight,
  BarChart2, Building2, Smartphone, ShoppingBag, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip,
  AreaChart, Area, CartesianGrid, ReferenceLine
} from 'recharts';
import toast from 'react-hot-toast';

const Overview = () => {
  // Filter States
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [accountTab, setAccountTab] = useState('ALL');

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

  // Account Balances Data for Bar Chart
  const accountBalancesData = [
    { name: 'Bank', balance: 124800, color: '#3B82F6', formatted: '₹ 1,24,800' },
    { name: 'Cash', balance: 12450, color: '#10B981', formatted: '₹ 12,450' },
    { name: 'UPI', balance: 8320, color: '#8B5CF6', formatted: '₹ 8,320' },
    { name: 'Receivables', balance: 11000, color: '#F59E0B', formatted: '₹ 11,000' },
    { name: 'Payables', balance: -28500, color: '#EF4444', formatted: '- ₹ 28,500' }
  ];

  // Income vs Expenses Trend Data
  const trendData = [
    { month: 'Apr', Income: 120000, Expenses: 80000 },
    { month: 'May', Income: 240000, Expenses: 150000 },
    { month: 'Jun', Income: 210000, Expenses: 130000 },
    { month: 'Jul', Income: 340000, Expenses: 230000 },
    { month: 'Aug', Income: 280000, Expenses: 170000 },
    { month: 'Sep', Income: 330000, Expenses: 240000 }
  ];

  // Financial Accounts List
  const [accountsList] = useState([
    { id: 1, name: 'Cash in Hand', type: 'CASH', branch: 'Kayamkulam', balance: 12450.00, status: 'Active', icon: Wallet, iconBg: 'bg-emerald-50 text-emerald-600' },
    { id: 2, name: 'Bank - Federal', type: 'BANK', branch: 'Kayamkulam', balance: 124800.00, status: 'Active', icon: Building2, iconBg: 'bg-blue-50 text-blue-600' },
    { id: 3, name: 'Google Pay', type: 'UPI', branch: 'Kayamkulam', balance: 8320.00, status: 'Active', icon: Smartphone, iconBg: 'bg-purple-50 text-purple-600' },
    { id: 4, name: 'Food Delivery Receivable', type: 'RECEIVABLE', branch: 'Kayamkulam', balance: 8000.00, status: 'Active', icon: ShoppingBag, iconBg: 'bg-amber-50 text-amber-600' },
    { id: 5, name: 'Card Receivable', type: 'RECEIVABLE', branch: 'Kayamkulam', balance: 3000.00, status: 'Active', icon: CreditCard, iconBg: 'bg-amber-50 text-amber-600' },
    { id: 6, name: 'Meat Supplier', type: 'PAYABLE', branch: 'Kayamkulam', balance: -28500.00, status: 'Active', icon: FileText, iconBg: 'bg-rose-50 text-rose-600' }
  ]);

  // Recent Transactions List
  const [recentTransactions] = useState([
    { id: 1, date: '10 Sep 2026', description: 'Swiggy settlement', account: 'Bank', type: 'In', amount: 8000.00, icon: Building2 },
    { id: 2, date: '10 Sep 2026', description: 'UPI payment received', account: 'UPI', type: 'In', amount: 2350.00, icon: Smartphone },
    { id: 3, date: '10 Sep 2026', description: 'Cash expense - Vegetables', account: 'Cash', type: 'Out', amount: 1250.00, icon: Minus },
    { id: 4, date: '09 Sep 2026', description: 'Card sales (receivable)', account: 'Card Receivable', type: 'In', amount: 3000.00, icon: CreditCard },
    { id: 5, date: '09 Sep 2026', description: 'Purchase - Meat Supplier', account: 'Suppliers', type: 'Out', amount: 8500.00, icon: FileText },
    { id: 6, date: '08 Sep 2026', description: 'Bank to Cash transfer', account: 'Bank', type: 'In', amount: 5000.00, icon: ArrowLeftRight }
  ]);

  // Pending Receivables List
  const [pendingReceivables] = useState([
    { id: 1, account: 'Food Delivery Receivable', amount: 8000.00, oldestEntry: '05 Sep 2026', icon: ShoppingBag, iconBg: 'bg-amber-50 text-amber-600' },
    { id: 2, account: 'Card Receivable', amount: 3000.00, oldestEntry: '01 Sep 2026', icon: CreditCard, iconBg: 'bg-blue-50 text-blue-600' }
  ]);

  // Pending Payables List
  const [pendingPayables] = useState([
    { id: 1, supplier: 'Meat Supplier', amount: 18500.00, dueDate: '12 Sep 2026', iconBg: 'bg-rose-50 text-rose-600' },
    { id: 2, supplier: 'Vegetable Supplier', amount: 6200.00, dueDate: '14 Sep 2026', iconBg: 'bg-emerald-50 text-emerald-600' }
  ]);

  // Filter accounts by active tab
  const filteredAccounts = accountsList.filter(acc => {
    if (accountTab === 'ALL') return true;
    return acc.type === accountTab;
  });

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

  // Custom top label for Bar Chart
  const renderCustomBarLabel = (props) => {
    const { x, y, width, value, index } = props;
    const formatted = accountBalancesData[index]?.formatted || '';
    const isNegative = value < 0;
    return (
      <text
        x={x + width / 2}
        y={isNegative ? y + 14 : y - 6}
        fill={isNegative ? '#EF4444' : '#1E293B'}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        className="font-sans"
      >
        {formatted}
      </text>
    );
  };

  // Custom Y-Axis tick renderer to guarantee single-line SVG text without splitting
  const CustomYAxisTick = ({ x, y, payload }) => {
    if (payload.value === undefined || payload.value === null) return null;
    return (
      <text x={x - 6} y={y + 4} textAnchor="end" fill="#64748B" fontSize={11} fontWeight={500} fontFamily="'Inter', sans-serif">
        ₹ {Number(payload.value).toLocaleString()}
      </text>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="space-y-4 text-slate-800 pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-normal text-slate-500 mb-0.5">
            Finance &gt; Overview
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="text-2xl font-bold text-slate-900 tracking-tight">Finance Overview</h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Complete view of your cash, bank, UPI, receivables, payables and financial position.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Financial Report generated successfully!')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <BarChart2 className="w-3.5 h-3.5 text-slate-700" />
          <span>Generate Report</span>
        </button>
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
                +8%
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">
              ₹ 1,56,970
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
                +12%
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">
              ₹ 1,45,570
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
              <span className="text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full text-[#16a34a] bg-[#dcfce7]">
                +5%
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">
              ₹ 11,000
            </div>
            <a href="#pending-receivables" className="text-[13px] font-medium text-amber-600 hover:underline truncate inline-block">
              2 pending settlements &gt;
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
              <span className="text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full text-[#ef4444] bg-[#fee2e2]">
                -4%
              </span>
            </div>
          </div>
          <div className="mt-auto min-w-0">
            <div style={{ fontFamily: "'Inter', sans-serif" }} className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">
              ₹ 28,500
            </div>
            <a href="#pending-payables" className="text-[13px] font-medium text-rose-500 hover:underline truncate inline-block">
              5 pending payments &gt;
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
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="All Branches">All Branches</option>
                <option value="Kayamkulam">Kayamkulam</option>
                <option value="Main Branch">Main Branch</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-400 font-normal mb-3">Current balance across all financial accounts</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accountBalancesData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis width={65} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`₹ ${Number(val).toLocaleString()}`, 'Balance']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <ReferenceLine y={0} stroke="#E2E8F0" strokeWidth={1.5} />
                <Bar dataKey="balance" radius={[4, 4, 0, 0]} label={renderCustomBarLabel}>
                  {accountBalancesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-[10px] font-semibold text-rose-500 pt-1">
            - ₹ 28,500 <span className="text-slate-400 font-normal">Payablers</span>
          </div>
        </div>

        {/* Col 2: Income vs Expenses Multi-Line / Area Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            {/* Title & Dropdown Header */}
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-start gap-2.5">
                <TrendingUp className="w-5 h-5 text-slate-800 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">Income vs Expenses</h2>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">Based on posted transactions (excluding transfers)</p>
                </div>
              </div>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-lg px-3 py-1.5 shadow-2xs focus:outline-none cursor-pointer shrink-0"
              >
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="This Quarter">This Quarter</option>
              </select>
            </div>

            {/* Income vs Expenses Numbers & Trends Row */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 my-3 pb-2">
              {/* Income Column */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">₹ 2,48,300</span>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    ↑ 14%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-normal pt-0.5">
                  <span>Total Income</span>
                  <span>vs last month</span>
                </div>
              </div>

              {/* Divider Line */}
              <div className="hidden sm:block w-px bg-slate-200 self-stretch my-0.5"></div>

              {/* Expenses Column */}
              <div className="flex-1 space-y-0.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight font-sans">₹ 1,86,750</span>
                  <span className="text-xs font-semibold text-rose-500 flex items-center gap-0.5">
                    ↓ 6%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-normal pt-0.5">
                  <span>Total Expenses</span>
                  <span>vs last month</span>
                </div>
              </div>
            </div>

            {/* Legend Row Right-Aligned */}
            <div className="flex items-center justify-end gap-4 text-xs font-medium text-slate-600 mb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Expenses
              </span>
            </div>
          </div>

          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis width={65} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [`₹ ${Number(val).toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" dot={{ r: 3, fill: '#10B981' }} />
                <Area type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" dot={{ r: 3, fill: '#EF4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Col 3: Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-500 font-bold">⚡</span>
            <h2 className="text-sm font-bold text-slate-900">Quick Actions</h2>
          </div>

          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            {/* Record Income */}
            <button
              type="button"
              onClick={() => setActiveModal('income')}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  +
                </div>
                <span className="text-xs font-semibold text-slate-800">Record Income</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Record Expense */}
            <button
              type="button"
              onClick={() => setActiveModal('expense')}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  -
                </div>
                <span className="text-xs font-semibold text-slate-800">Record Expense</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Transfer Money */}
            <button
              type="button"
              onClick={() => setActiveModal('transfer')}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <ArrowLeftRight className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Transfer Money</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Settle Receivable */}
            <button
              type="button"
              onClick={() => setActiveModal('settle')}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Users className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Settle Receivable</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Pay Supplier */}
            <button
              type="button"
              onClick={() => setActiveModal('pay')}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Pay Supplier</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* View Reports */}
            <button
              type="button"
              onClick={() => toast.success('Navigating to Finance Reports')}
              className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <BarChart2 className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold text-slate-800">View Reports</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Financial Accounts Table & Recent Transactions (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Financial Accounts (~6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Financial Accounts</h2>
            </div>

            <button
              type="button"
              onClick={() => toast.success('Manage Accounts panel opened')}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Manage Accounts
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
            {[
              { label: 'All (6)', key: 'ALL' },
              { label: 'Cash (1)', key: 'CASH' },
              { label: 'Bank (1)', key: 'BANK' },
              { label: 'UPI (1)', key: 'UPI' },
              { label: 'Receivables (2)', key: 'RECEIVABLE' },
              { label: 'Payables (1)', key: 'PAYABLE' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setAccountTab(tab.key)}
                className={`px-3 py-1 rounded-full font-medium text-xs transition-all cursor-pointer ${accountTab === tab.key
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Accounts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                  <th className="py-2 px-2">Account Name*</th>
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Branch</th>
                  <th className="py-2 px-2 text-right">Current Balance</th>
                  <th className="py-2 px-2 text-center">Status</th>
                  <th className="py-2 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredAccounts.map(acc => {
                  const IconComp = acc.icon;
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg ${acc.iconBg} flex items-center justify-center shrink-0`}>
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-900">{acc.name}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${acc.type === 'CASH' ? 'bg-slate-100 text-slate-700' :
                          acc.type === 'BANK' ? 'bg-slate-100 text-slate-700' :
                            acc.type === 'UPI' ? 'bg-slate-100 text-slate-700' :
                              acc.type === 'RECEIVABLE' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' :
                                'bg-rose-50 text-rose-700 border border-rose-200/60'
                          }`}>
                          {acc.type}
                        </span>
                      </td>

                      <td className="py-2.5 px-2 text-slate-600">{acc.branch}</td>

                      <td className={`py-2.5 px-2 text-right font-bold text-xs tabular-nums ${acc.balance < 0 ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                        {acc.balance < 0 ? `- ₹ ${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `₹ ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </td>

                      <td className="py-2.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => toast.success(`Viewing account ledger: ${acc.name}`)}
                          className="text-blue-600 font-semibold hover:underline cursor-pointer"
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
        </div>

        {/* Right Column: Recent Transactions (~6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            </div>

            <button
              type="button"
              onClick={() => toast.success('Navigating to full Transaction Audit')}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Description*</th>
                  <th className="py-2 px-2">Account</th>
                  <th className="py-2 px-2 text-center">Type</th>
                  <th className="py-2 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-2 text-slate-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-2.5 px-2 font-semibold text-slate-900">{tx.description}</td>
                    <td className="py-2.5 px-2 text-slate-600">{tx.account}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tx.type === 'In' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`py-2.5 px-2 text-right font-bold text-xs tabular-nums ${tx.type === 'In' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                      {tx.type === 'In' ? '+ ' : '- '}₹ {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 4: Bottom 3 Columns Layout (Pending Receivables, Pending Payables, Cash Flow Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Col 1: Pending Receivables (~4 cols) */}
        <div id="pending-receivables" className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Pending Receivables</h2>
              </div>
              <button
                type="button"
                onClick={() => toast.success('View all pending receivables')}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2 px-1">Account*</th>
                    <th className="py-2 px-1 text-right">Outstanding</th>
                    <th className="py-2 px-1 text-center">Oldest Entry</th>
                    <th className="py-2 px-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {pendingReceivables.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-1 font-semibold text-slate-900 text-xs">{item.account}</td>
                      <td className="py-2.5 px-1 text-right font-bold text-xs text-slate-900 tabular-nums">
                        ₹ {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-1 text-center text-slate-500 text-[11px]">{item.oldestEntry}</td>
                      <td className="py-2.5 px-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setModalForm(prev => ({ ...prev, amount: item.amount }));
                            setActiveModal('settle');
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Settle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Col 2: Pending Payables (~4 cols) */}
        <div id="pending-payables" className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900">Pending Payables</h2>
              </div>
              <button
                type="button"
                onClick={() => toast.success('View all pending payables')}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2 px-1">Supplier*</th>
                    <th className="py-2 px-1 text-right">Amount</th>
                    <th className="py-2 px-1 text-center">Due Date</th>
                    <th className="py-2 px-1 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {pendingPayables.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-1 font-semibold text-slate-900 text-xs">{item.supplier}</td>
                      <td className="py-2.5 px-1 text-right font-bold text-xs text-rose-600 tabular-nums">
                        ₹ {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-1 text-center text-slate-500 text-[11px]">{item.dueDate}</td>
                      <td className="py-2.5 px-1 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setModalForm(prev => ({ ...prev, amount: item.amount, supplier: item.supplier }));
                            setActiveModal('pay');
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Col 3: Cash Flow Summary Card (~4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Cash Flow Summary</h2>
              </div>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>

            <div className="space-y-2.5 font-normal text-xs pt-1">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Opening Balance</span>
                <span className="font-bold text-slate-900 tabular-nums">₹ 95,420.00</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Total Inflow</span>
                <span className="font-bold text-slate-900 tabular-nums">₹ 2,48,300.00</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600">Total Outflow</span>
                <span className="font-bold text-slate-900 tabular-nums">₹ 1,86,750.00</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                <span className="text-slate-900 font-bold">Closing Balance</span>
                <span className="text-base font-black text-slate-900 tabular-nums">₹ 1,56,970.00</span>
              </div>
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
                {activeModal === 'income' && ' Record Income'}
                {activeModal === 'expense' && ' Record Expense'}
                {activeModal === 'transfer' && ' Transfer Money'}
                {activeModal === 'settle' && ' Settle Receivable'}
                {activeModal === 'pay' && ' Pay Supplier'}
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
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Bank - Federal">Bank - Federal</option>
                  <option value="Google Pay">Google Pay</option>
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
