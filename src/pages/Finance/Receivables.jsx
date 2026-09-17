import React, { useState } from 'react';
import {
  CreditCard, ShoppingBag, Landmark, CheckCircle2, TrendingUp,
  HelpCircle, ArrowRight, Clock, ArrowLeftRight, ChevronDown,
  Calendar as CalendarIcon, Info, Send, FileText, ChevronRight, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const Receivables = () => {
  // Main state for pending receivables
  const [pendingList, setPendingList] = useState([
    {
      id: 1,
      date: '01 Sep 2026',
      platform: 'Food Delivery',
      account: 'Food Delivery Receivable',
      reference: 'SWIGGY-001',
      totalAmount: 8000.00,
      settledAmount: 0.00,
      outstanding: 8000.00,
      icon: ShoppingBag,
      iconBg: 'bg-amber-100 text-amber-600'
    },
    {
      id: 2,
      date: '05 Sep 2026',
      platform: 'Card Payments',
      account: 'Card Receivable',
      reference: 'PINE-LABS-001',
      totalAmount: 3000.00,
      settledAmount: 0.00,
      outstanding: 3000.00,
      icon: CreditCard,
      iconBg: 'bg-blue-100 text-blue-600'
    }
  ]);

  // Main state for recent settlements
  const [recentSettlements, setRecentSettlements] = useState([
    {
      id: 101,
      date: '28 Aug 2026',
      platform: 'Food Delivery',
      amount: 6400.00,
      depositedTo: 'Bank',
      reference: 'ZOMATO-001',
      createdBy: 'admin',
      icon: ShoppingBag,
      iconBg: 'bg-amber-100 text-amber-600'
    },
    {
      id: 102,
      date: '20 Aug 2026',
      platform: 'Food Delivery',
      amount: 7200.00,
      depositedTo: 'Bank',
      reference: 'SWIGGY-002',
      createdBy: 'admin',
      icon: ShoppingBag,
      iconBg: 'bg-amber-100 text-amber-600'
    },
    {
      id: 103,
      date: '15 Aug 2026',
      platform: 'Card Payments',
      amount: 3000.00,
      depositedTo: 'Bank',
      reference: 'PINE-LABS-002',
      createdBy: 'admin',
      icon: CreditCard,
      iconBg: 'bg-blue-100 text-blue-600'
    }
  ]);

  // Tab State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'recent'

  // Settle Receivable Form State
  const [selectedReceivableId, setSelectedReceivableId] = useState(1);
  const [settlementAmount, setSettlementAmount] = useState('8000.00');
  const [depositTo, setDepositTo] = useState('Bank');
  const [settlementDate, setSettlementDate] = useState('2026-09-10');
  const [referenceNote, setReferenceNote] = useState('Swiggy settlement - 10 Sep');

  // Find currently selected account
  const selectedAccount = pendingList.find(item => item.id === Number(selectedReceivableId)) || pendingList[0];

  // Bar Chart Data: Receivables vs Settlements
  const barChartData = [
    { month: 'Apr', Outstanding: 12000, Settled: 6500 },
    { month: 'May', Outstanding: 22000, Settled: 14500 },
    { month: 'Jun', Outstanding: 26000, Settled: 33000 },
    { month: 'Jul', Outstanding: 27000, Settled: 40000 },
    { month: 'Aug', Outstanding: 46000, Settled: 31000 },
    { month: 'Sep', Outstanding: 14500, Settled: 22500 }
  ];

  // Donut Chart Data: Outstanding by Platform
  const pieData = [
    { name: 'Food Delivery', value: 8000, percentage: '72.7%', color: '#F97316' },
    { name: 'Card', value: 3000, percentage: '27.3%', color: '#3B82F6' },
    { name: 'Others', value: 0, percentage: '0%', color: '#10B981' }
  ];

  // Handle row selection for quick settlement
  const handleSelectRowToSettle = (row) => {
    setSelectedReceivableId(row.id);
    setSettlementAmount(row.outstanding.toString());
    setReferenceNote(`${row.platform} settlement - ${row.reference}`);
    toast.success(`Selected ${row.account} for settlement`);
  };

  // Handle Form Submit
  const handleSettleSubmit = (e) => {
    e.preventDefault();
    const amountNum = Number(settlementAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid settlement amount');
      return;
    }

    if (!selectedAccount) {
      toast.error('No receivable account selected');
      return;
    }

    // Add to recent settlements
    const newSettlement = {
      id: Date.now(),
      date: new Date(settlementDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      platform: selectedAccount.platform,
      amount: amountNum,
      depositedTo: depositTo,
      reference: referenceNote || selectedAccount.reference,
      createdBy: 'admin',
      icon: selectedAccount.icon,
      iconBg: selectedAccount.iconBg
    };

    setRecentSettlements(prev => [newSettlement, ...prev]);

    // Update pending list
    setPendingList(prev =>
      prev.map(item => {
        if (item.id === selectedAccount.id) {
          const newSettled = item.settledAmount + amountNum;
          const newOutstanding = Math.max(0, item.totalAmount - newSettled);
          return {
            ...item,
            settledAmount: newSettled,
            outstanding: newOutstanding
          };
        }
        return item;
      })
    );

    toast.success(`Successfully settled ₹${amountNum.toLocaleString()} to ${depositTo}!`);
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
            Finance &gt; Receivables
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="text-2xl font-bold text-slate-900 tracking-tight">
            Receivables &amp; Settlements
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Track and settle payments from card processors and food delivery platforms.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toast.success('Reports options opened')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-slate-700" />
            <span>View Reports</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => toast.success('Help guide opened')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-700" />
            <span>Help</span>
          </button>
        </div>
      </div>

      {/* Row 1: Top 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Card Receivable */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between h-full min-h-[96px]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Card Receivable</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">₹ 3,000.00</h3>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">1 pending settlement</p>
            </div>
          </div>
        </div>

        {/* Card 2: Food Delivery Receivable */}
        <div className="bg-amber-50/40 rounded-2xl p-4 border border-amber-200/60 shadow-2xs flex items-center justify-between h-full min-h-[96px]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600 mb-0.5">Food Delivery Receivable</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">₹ 8,000.00</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">2 pending settlements</p>
            </div>
          </div>
        </div>

        {/* Card 3: Total Outstanding */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between h-full min-h-[96px]">
          <div className="flex items-center gap-3.5 w-full">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Landmark className="w-5.5 h-5.5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Outstanding</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">₹ 11,000.00</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Settled (This Month) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between h-full min-h-[96px]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Settled (This Month)</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">₹ 14,400.00</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 inline-flex items-center gap-1">
                ↑ 12% <span className="text-slate-400 font-normal">vs last month</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Grid (Charts & Tables) vs Right Form Widget */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column: Charts & Tables */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Row 2: Charts Row (Bar Chart & Donut Chart) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Receivables vs Settlements Bar Chart (7 cols) */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Receivables vs Settlements</h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6]"></span> Outstanding
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]"></span> Settled
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-56 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis width={60} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val, name) => [`₹ ${Number(val).toLocaleString()}`, name]}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="Outstanding" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} />
                    <Bar dataKey="Settled" fill="#10B981" radius={[4, 4, 0, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outstanding by Platform Donut Chart (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Outstanding by Platform</h3>
                  <select className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 py-1">
                {/* Donut Chart with Center Text */}
                <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={74}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-base font-extrabold text-slate-900 font-sans tracking-tight whitespace-nowrap">₹ 11,000</span>
                    <span className="text-[11px] font-medium text-slate-400">Outstanding</span>
                  </div>
                </div>

                {/* Legend & Breakdown List */}
                <div className="space-y-3 flex-1 min-w-0 pl-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shrink-0"></span>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">Food Delivery</p>
                        <p className="text-[11px] text-slate-400 font-normal">72.7%</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-sans whitespace-nowrap shrink-0">₹ 8,000</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0"></span>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">Card</p>
                        <p className="text-[11px] text-slate-400 font-normal">27.3%</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-sans whitespace-nowrap shrink-0">₹ 3,000</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0"></span>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">Others</p>
                        <p className="text-[11px] text-slate-400 font-normal">0%</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-sans whitespace-nowrap shrink-0">₹ 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Pending Receivables Table with Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4">
            <div className="flex items-center gap-6 border-b border-slate-200 pb-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pending Receivables
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('recent')}
                className={`pb-2 text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === 'recent'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Recent Settlements
              </button>
            </div>

            {/* Table Content */}
            {activeTab === 'pending' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Platform / Account</th>
                      <th className="py-2.5 px-2">Reference</th>
                      <th className="py-2.5 px-2 text-right">Total Amount</th>
                      <th className="py-2.5 px-2 text-right">Settled Amount</th>
                      <th className="py-2.5 px-2 text-right">Outstanding</th>
                      <th className="py-2.5 px-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {pendingList.map(row => {
                      const IconComponent = row.icon;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{row.date}</td>

                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-xl ${row.iconBg} flex items-center justify-center shrink-0`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{row.platform}</p>
                                <p className="text-[10px] text-slate-400 font-medium">{row.account}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-2 text-slate-600 font-mono text-[11px]">{row.reference}</td>

                          <td className="py-3 px-2 text-right font-bold text-slate-800 font-mono">
                            ₹ {row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-2 text-right font-bold text-slate-600 font-mono">
                            ₹ {row.settledAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-2 text-right font-extrabold text-rose-600 font-mono">
                            ₹ {row.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>

                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleSelectRowToSettle(row)}
                              className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                            >
                              Settle
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                      <th className="py-2.5 px-2">Date</th>
                      <th className="py-2.5 px-2">Platform / Account</th>
                      <th className="py-2.5 px-2 text-right">Amount</th>
                      <th className="py-2.5 px-2">Deposited To</th>
                      <th className="py-2.5 px-2">Reference</th>
                      <th className="py-2.5 px-2">Created By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {recentSettlements.map(row => {
                      const IconComponent = row.icon;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                          <td className="py-3 px-2 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg ${row.iconBg} flex items-center justify-center shrink-0`}>
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <span>{row.platform}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-emerald-600 font-mono">
                            ₹ {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-2 text-slate-700 font-medium">{row.depositedTo}</td>
                          <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{row.reference}</td>
                          <td className="py-3 px-2 text-slate-500 font-medium">{row.createdBy}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Recent Settlements Block */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Settlements</h3>
              </div>

              <button
                type="button"
                onClick={() => toast.success('View all settlements')}
                className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-2">Date</th>
                    <th className="py-2.5 px-2">Platform / Account</th>
                    <th className="py-2.5 px-2 text-right">Amount</th>
                    <th className="py-2.5 px-2">Deposited To</th>
                    <th className="py-2.5 px-2">Reference</th>
                    <th className="py-2.5 px-2">Created By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {recentSettlements.slice(0, 3).map(row => {
                    const IconComponent = row.icon;
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{row.date}</td>
                        <td className="py-3 px-2 font-semibold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg ${row.iconBg} flex items-center justify-center shrink-0`}>
                              <IconComponent className="w-3.5 h-3.5" />
                            </div>
                            <span>{row.platform}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-emerald-600 font-mono">
                          ₹ {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-2 text-slate-700 font-medium">{row.depositedTo}</td>
                        <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{row.reference}</td>
                        <td className="py-3 px-2 text-slate-500 font-medium">{row.createdBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Settle Receivable Form Widget (Fixed Width 340px) */}
        <div className="w-full lg:w-[340px] shrink-0 sticky top-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-3.5 w-full">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Settle Receivable</h3>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3.5 text-xs font-normal">
              {/* Field 1: Receivable Account */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Receivable Account <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedReceivableId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedReceivableId(id);
                    const item = pendingList.find(p => p.id === id);
                    if (item) {
                      setSettlementAmount(item.outstanding.toString());
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  {pendingList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.account} (Outstanding: ₹ {p.outstanding.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Outstanding Amount Info Box */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <p className="text-[11px] font-medium text-slate-500 mb-0.5">Outstanding Amount</p>
                <p className="text-xl font-black text-slate-900 font-mono">
                  ₹ {selectedAccount ? selectedAccount.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>

              {/* Field 3: Settlement Amount */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Settlement Amount <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={settlementAmount}
                  onChange={(e) => setSettlementAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Field 4: Deposit To */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Deposit To <span className="text-rose-500">*</span>
                </label>
                <select
                  value={depositTo}
                  onChange={(e) => setDepositTo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="Bank">Bank (Federal Bank)</option>
                  <option value="Cash in Hand">Cash in Hand</option>
                  <option value="Google Pay">Google Pay</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Current Balance: ₹ 0.00</p>
              </div>

              {/* Field 5: Settlement Date */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Settlement Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Field 6: Reference / Note */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy settlement - 10 Sep"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Field 7: Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Settle Receivable</span>
              </button>
            </form>

            {/* Information Notice */}
            <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-700">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>This will create financial transactions to:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Decrease the receivable account</li>
                <li>Increase the selected account (e.g. Bank)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receivables;
