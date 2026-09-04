import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet,
  Users, Package, AlertTriangle, AlertCircle, ShoppingBag, Briefcase, CalendarDays
} from 'lucide-react';

const MOCK_LINE_DATA = [
  { name: '14 May', revenue: 3.5, expenses: 1.5, profit: 2 },
  { name: '15 May', revenue: 2.5, expenses: 1.2, profit: 1.3 },
  { name: '16 May', revenue: 3.8, expenses: 2.1, profit: 1.7 },
  { name: '17 May', revenue: 2.8, expenses: 1.4, profit: 1.4 },
  { name: '18 May', revenue: 3.9, expenses: 1.9, profit: 2.0 },
  { name: '19 May', revenue: 2.1, expenses: 1.1, profit: 1.0 },
  { name: '20 May', revenue: 3.6, expenses: 2.3, profit: 1.3 },
];

const MOCK_PIE_DATA = [
  { name: 'Salary', value: 50400, color: '#3B82F6', percentage: '45%' },
  { name: 'Purchases', value: 33600, color: '#FACC15', percentage: '30%' },
  { name: 'Rent', value: 11200, color: '#EF4444', percentage: '10%' },
  { name: 'Utilities', value: 7840, color: '#10B981', percentage: '7%' },
  { name: 'Other', value: 8960, color: '#8B5CF6', percentage: '8%' },
];

const MOCK_BAR_DATA = [
  { name: 'Kochi Branch', value: 1245000 },
  { name: 'Calicut Branch', value: 932000 },
  { name: 'Kannur Branch', value: 725000 },
  { name: 'Malappuram Branch', value: 610000 },
  { name: 'Trivandrum Branch', value: 480000 },
];

const MetricCard = ({ title, amount, subtitle, icon: Icon, trend, trendValue, iconColor, iconBg }) => (
  <div className="bg-white p-5 rounded-[20px] border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow min-h-[140px]">
    <div className="flex items-start gap-3 mb-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex flex-col items-start pt-0.5">
        <span className="text-[#475569] text-[13px] font-semibold leading-tight">{title}</span>
        {trend && (
          <span className={`text-[11px] font-bold px-2 py-0.5 mt-1.5 rounded-full ${trend === 'up' ? 'text-[#16a34a] bg-[#dcfce7]' : 'text-[#ef4444] bg-[#fee2e2]'}`}>
            {trendValue}
          </span>
        )}
      </div>
    </div>
    <div className="mt-auto min-w-0">
      <div className="font-sans text-[28px] font-medium text-slate-800 tracking-tighter mb-1 truncate">{amount}</div>
      <p className="text-[13px] font-medium text-[#94a3b8] truncate">{subtitle}</p>
    </div>
  </div>
);

const CompanyOverview = () => {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="text-[28px] font-sans font-bold text-[#1e293b] leading-tight tracking-tight">Dashboard</h1>
          <p className="text-[#64748b] text-[14px] mt-1 font-medium">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer">
              <option value="all">All Branches</option>
              <option value="kochi">Kochi Branch</option>
              <option value="calicut">Calicut Branch</option>
              <option value="kannur">Kannur Branch</option>
              <option value="malappuram">Malappuram Branch</option>
              <option value="trivandrum">Trivandrum Branch</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 shadow-sm">
            <CalendarDays size={16} className="text-gray-400" />
            <span>May 20, 2025</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-4">
        <MetricCard title="Revenue Today" amount="₹ 2,45,000" subtitle="vs yesterday" icon={DollarSign} trend="up" trendValue="+12%" iconBg="bg-blue-50" iconColor="text-blue-500" />
        <MetricCard title="Expenses Today" amount="₹ 1,12,000" subtitle="vs yesterday" icon={Wallet} trend="down" trendValue="-4%" iconBg="bg-red-50" iconColor="text-red-500" />
        <MetricCard title="Profit Today" amount="₹ 1,33,000" subtitle="vs yesterday" icon={TrendingUp} trend="up" trendValue="+18%" iconBg="bg-green-50" iconColor="text-green-500" />
        <MetricCard title="Cash Balance" amount="₹ 8,75,000" subtitle="Total Balance" icon={Briefcase} iconBg="bg-purple-50" iconColor="text-purple-500" />
        <MetricCard title="Pending Payables" amount="₹ 2,35,000" subtitle="Total Pending" icon={Wallet} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <MetricCard title="Employees Present" amount="128 / 156" subtitle="Today" icon={Users} iconBg="bg-teal-50" iconColor="text-teal-500" />
        <MetricCard title="Stock Value" amount="₹ 18,75,000" subtitle="Total Value" icon={Package} iconBg="bg-blue-50" iconColor="text-blue-500" />
        <MetricCard title="Low Stock Items" amount="23" subtitle="Need Attention" icon={AlertTriangle} iconBg="bg-red-50" iconColor="text-red-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Business Overview</h3>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              {['7D', '30D', '90D', '1Y'].map((t, i) => (
                <button key={t} className={`px-3 py-1 text-xs font-bold rounded-md ${i === 0 ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_LINE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `${val}L`} />
                <Tooltip cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6">Expense Breakdown</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={MOCK_PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                    {MOCK_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹ ${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-gray-500 font-medium">Total</span>
                <span className="font-sans font-bold text-gray-900 text-lg whitespace-nowrap">₹ 1,12,000</span>
              </div>
            </div>

            <div className="w-full mt-4 space-y-3">
              {MOCK_PIE_DATA.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="font-bold text-gray-900">{item.percentage}</span>
                    <span className="text-gray-500 w-16 text-right">₹ {(item.value / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <button className="text-xs text-blue-500 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { text: 'Ahmed purchased 50kg Rice', sub: 'Inventory • 2 mins ago', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
              { text: 'Salary for May generated', sub: 'Payroll • 1 hour ago', icon: Wallet, color: 'text-green-500', bg: 'bg-green-50' },
              { text: 'Low stock alert for Onion', sub: 'Inventory • 2 hours ago', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
              { text: 'Budget exceeded for Marketing', sub: 'Finance • 3 hours ago', icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50' },
              { text: 'New employee joined', sub: 'HR • 5 hours ago', icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' },
              { text: 'Expense added - Office Supplies', sub: 'Finance • 6 hours ago', icon: DollarSign, color: 'text-pink-500', bg: 'bg-pink-50' },
              { text: 'Supplier payment made', sub: 'Procurement • 1 day ago', icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' },
              { text: 'Leave request submitted', sub: 'HR • 1 day ago', icon: CalendarDays, color: 'text-orange-500', bg: 'bg-orange-50' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon size={14} className={item.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 leading-tight">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Branch Performance (Bar Chart area) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Branch Performance</h3>
            <select className="text-xs border-gray-200 rounded-md text-gray-500 outline-none">
              <option>This Month</option>
            </select>
          </div>
          <div className="space-y-5">
            {MOCK_BAR_DATA.map((branch, i) => {
              const max = MOCK_BAR_DATA[0].value;
              const width = `${(branch.value / max) * 100}%`;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{branch.name}</span>
                    <span className="font-sans font-bold text-gray-900 whitespace-nowrap">₹ {(branch.value / 100000).toFixed(2)}L</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Top Selling Products</h3>
            <select className="text-xs border-gray-200 rounded-md text-gray-500 outline-none">
              <option>This Month</option>
            </select>
          </div>
          <div className="space-y-4">
            {[
              { n: 'Basmati Rice', qty: '520 Kg', val: '1,25,000' },
              { n: 'Sunflower Oil 1L', qty: '420 Ltr', val: '95,000' },
              { n: 'Sugar', qty: '310 Kg', val: '62,000' },
              { n: 'Wheat Flour', qty: '290 Kg', val: '48,000' },
              { n: 'Chilli Powder', qty: '180 Kg', val: '36,000' }
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ShoppingBag size={14} className="text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{p.n}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xs text-gray-500">{p.qty}</span>
                  <span className="font-sans text-sm font-bold text-gray-900 whitespace-nowrap">₹ {p.val}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HR Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">HR Summary</h3>
            <select className="text-xs border-gray-200 rounded-md text-gray-500 outline-none">
              <option>Today</option>
            </select>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Employees Present', count: 128, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Late Employees', count: 12, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Leave Requests', count: 8, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'New Employees', count: 5, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Birthdays', count: 3, color: 'text-pink-500', bg: 'bg-pink-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                    <Users size={14} className={item.color} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Alerts</h3>
            <button className="text-xs text-blue-500 font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Low stock: <span className="text-red-500">23 items</span></p>
                <p className="text-xs text-gray-500">Check inventory now</p>
                <p className="text-[10px] text-gray-400 mt-1">10 min ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget exceeded: Marketing</p>
                <p className="text-xs text-gray-500">105% of budget used</p>
                <p className="text-[10px] text-gray-400 mt-1">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Leave request pending</p>
                <p className="text-xs text-gray-500">8 requests waiting</p>
                <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Payment due: Al Madina Store</p>
                <p className="text-xs text-gray-500">₹ 45,000 pending</p>
                <p className="text-[10px] text-gray-400 mt-1">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Lowest Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard title="Cash In" amount="₹ 3,45,000" subtitle="Today" icon={Wallet} iconBg="bg-green-50" iconColor="text-green-500" />
        <MetricCard title="Cash Out" amount="₹ 1,12,000" subtitle="Today" icon={Wallet} iconBg="bg-red-50" iconColor="text-red-500" />
        <MetricCard title="Net Cash Flow" amount="₹ 2,33,000" subtitle="Today" icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-500" />
        <MetricCard title="Budget Usage" amount="78%" subtitle="This Month" icon={Briefcase} iconBg="bg-purple-50" iconColor="text-purple-500" />
        <MetricCard title="Pending Payments" amount="₹ 2,35,000" subtitle="Total" icon={AlertCircle} iconBg="bg-orange-50" iconColor="text-orange-500" />
        <MetricCard title="Profit This Month" amount="₹ 15,75,000" subtitle="+14% vs last month" icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-500" />
      </div>
    </div>
  );
};

export default CompanyOverview;
