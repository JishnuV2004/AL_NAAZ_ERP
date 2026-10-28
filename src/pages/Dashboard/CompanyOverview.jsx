import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet,
  Users, Package, AlertTriangle, AlertCircle, ShoppingBag, Briefcase, CalendarDays,
  Truck, RefreshCw, ArrowRight
} from 'lucide-react';
import { getDashboardSummary, getActivityLogs } from '../../api/dashboard.api';
import { notificationService } from '../../services/notificationService';

const PIE_COLORS = ['#3B82F6', '#FACC15', '#EF4444', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];

const formatCurrency = (amt) => {
  if (amt === null || amt === undefined || amt === '') return '₹ 0';
  const val = typeof amt === 'number' ? amt : parseFloat(amt);
  if (isNaN(val)) return '₹ 0';
  return `₹ ${val.toLocaleString('en-IN')}`;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
};

const getActivityIcon = (module) => {
  const m = String(module || '').toUpperCase();
  switch (m) {
    case 'EXPENSE':
      return { icon: Wallet, color: 'text-red-500', bg: 'bg-red-50' };
    case 'PURCHASE':
      return { icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'INVENTORY':
      return { icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' };
    case 'HR':
    case 'EMPLOYEES':
      return { icon: Users, color: 'text-teal-500', bg: 'bg-teal-50' };
    case 'FINANCE':
      return { icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    default:
      return { icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' };
  }
};

const MetricCard = ({ title, amount, subtitle, icon: Icon, trend, trendValue, iconColor, iconBg, loading }) => (
  <div className="bg-white p-4.5 sm:p-5 rounded-[20px] border border-gray-100 shadow-xs flex flex-col justify-between hover:shadow-md transition-all min-h-[135px]">
    <div className="flex items-start justify-between gap-2.5 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <span className="text-[#475569] text-xs sm:text-[13px] font-semibold leading-tight truncate">{title}</span>
      </div>
      {trend && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${trend === 'up' ? 'text-[#16a34a] bg-[#dcfce7]' : 'text-[#ef4444] bg-[#fee2e2]'}`}>
          {trendValue}
        </span>
      )}
    </div>
    <div className="mt-auto min-w-0">
      {loading ? (
        <div className="h-7 bg-gray-100 rounded animate-pulse w-28 mb-1"></div>
      ) : (
        <div className="font-sans text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-0.5 whitespace-nowrap truncate">{amount}</div>
      )}
      <p className="text-xs font-medium text-[#94a3b8] truncate">{subtitle}</p>
    </div>
  </div>
);

const CompanyOverview = () => {
  const navigate = useNavigate();

  // Filters
  const [selectedBranch, setSelectedBranch] = useState('all');

  // API Data States
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // Fetch Dashboard Summary
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBranch && selectedBranch !== 'all') {
        params.branch = selectedBranch;
      }
      const data = await getDashboardSummary(params);
      setDashboardData(data);
      if (data?.branch_performance && Array.isArray(data.branch_performance)) {
        setAvailableBranches(prev => {
          const map = new Map();
          prev.forEach(b => map.set(b.id, b));
          data.branch_performance.forEach(b => {
            if (b.branch_id && b.branch_name) {
              map.set(b.branch_id, { id: b.branch_id, name: b.branch_name });
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Recent Activity Logs
  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await getActivityLogs({ page: 1, page_size: 10 });
      if (res && Array.isArray(res.results)) {
        setActivityLogs(res.results);
      } else if (Array.isArray(res)) {
        setActivityLogs(res);
      } else {
        setActivityLogs([]);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
      setActivityLogs([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch Recent Notifications for Alerts Section
  const fetchRecentAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await notificationService.fetchNotifications(1, 6);
      if (res && Array.isArray(res.results)) {
        setAlerts(res.results);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      setAlerts([]);
    } finally {
      setLoadingAlerts(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBranch]);

  useEffect(() => {
    fetchActivities();
    fetchRecentAlerts();
  }, []);

  const financialSummary = dashboardData?.financial_summary || {};
  const inventorySummary = dashboardData?.inventory_summary || {};
  const attendanceSummary = dashboardData?.attendance_summary || {};
  const branchPerformance = dashboardData?.branch_performance || [];
  const rawExpenseBreakdown = dashboardData?.expense_breakdown || [];

  // Available branches list strictly from API response
  const branchOptions = availableBranches.length > 0
    ? availableBranches
    : branchPerformance.map(b => ({ id: b.branch_id, name: b.branch_name }));

  // Prepare Expense Breakdown Pie Data strictly from API response
  const totalExpenseAmount = rawExpenseBreakdown.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const pieData = rawExpenseBreakdown.map((item, idx) => {
    const val = parseFloat(item.amount) || 0;
    const pct = totalExpenseAmount > 0 ? Math.round((val / totalExpenseAmount) * 100) : 0;
    return {
      name: item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : `Cat #${item.category_id}`,
      value: val,
      color: PIE_COLORS[idx % PIE_COLORS.length],
      percentage: `${pct}%`
    };
  });

  // Dynamic Chart Data based on yearly_chart (Month-based)
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const rawYearlyChart = dashboardData?.yearly_chart || [];
  const monthlyChartData = rawYearlyChart.length > 0
    ? rawYearlyChart.map(m => {
        const rev = Number(m.revenue) || 0;
        const exp = Number(m.expenses) || 0;
        const opResult = rev - exp;
        return {
          month: m.month,
          name: m.month_name ? m.month_name.slice(0, 3) : `M${m.month}`,
          fullName: m.month_name || `Month ${m.month}`,
          revenue: rev,
          expenses: exp,
          profit: opResult
        };
      })
    : MONTH_NAMES.map((name, idx) => ({
        month: idx + 1,
        name: name.slice(0, 3),
        fullName: name,
        revenue: 0,
        expenses: 0,
        profit: 0
      }));

  // Period label display
  const periodData = dashboardData?.period;
  const periodDisplay = periodData?.start_date && periodData?.end_date
    ? `${new Date(periodData.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(periodData.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'Current Period';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif" }} className="text-[28px] font-sans font-bold text-[#1e293b] leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="text-[#64748b] text-[14px] mt-1 font-medium">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Filter */}
          <div className="relative">
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="appearance-none bg-white pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Branches</option>
              {branchOptions.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>



          {/* Period Display */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 shadow-xs">
            <CalendarDays size={15} className="text-gray-400" />
            <span>{periodDisplay}</span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 rounded-lg border border-gray-200 shadow-xs transition-colors cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
        </div>
      </div>

      {/* Top Metrics Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard 
          title="Monthly Revenue" 
          amount={formatCurrency(financialSummary.monthly_revenue)} 
          subtitle="Total Inflow" 
          icon={DollarSign} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500" 
          loading={loading}
        />
        <MetricCard 
          title="Monthly Expenses" 
          amount={formatCurrency(financialSummary.monthly_expenses)} 
          subtitle="Total Operating Expenses" 
          icon={Wallet} 
          iconBg="bg-red-50" 
          iconColor="text-red-500" 
          loading={loading}
        />
        <MetricCard 
          title="Monthly Profit" 
          amount={formatCurrency(financialSummary.operating_profit ?? financialSummary.operating_result)} 
          subtitle="Operating Result" 
          icon={TrendingUp} 
          iconBg="bg-green-50" 
          iconColor="text-green-500" 
          loading={loading}
        />
        <MetricCard 
          title="Cash & Bank Balance" 
          amount={formatCurrency(financialSummary.cash_and_bank_balance)} 
          subtitle="Total Balance" 
          icon={Briefcase} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-500" 
          loading={loading}
        />
        <MetricCard 
          title="Pending Payables" 
          amount={formatCurrency(financialSummary.pending_supplier_payables)} 
          subtitle="Supplier Payables" 
          icon={Wallet} 
          iconBg="bg-orange-50" 
          iconColor="text-orange-500" 
          loading={loading}
        />
        <MetricCard 
          title="Employees Present" 
          amount={`${attendanceSummary.present ?? 0} / ${attendanceSummary.total_active_employees ?? 0}`} 
          subtitle={`${attendanceSummary.records_entered ?? 0} Records Entered`} 
          icon={Users} 
          iconBg="bg-teal-50" 
          iconColor="text-teal-500" 
          loading={loading}
        />
        {/* Changed Stock Value to show pending_delivery_receivables */}
        <MetricCard 
          title="Delivery Receivables" 
          amount={formatCurrency(financialSummary.pending_delivery_receivables)} 
          subtitle="Pending Delivery Receivables" 
          icon={Truck} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-500" 
          loading={loading}
        />
        <MetricCard 
          title="Low Stock Items" 
          amount={String(inventorySummary.low_stock_products ?? 0)} 
          subtitle={`${inventorySummary.out_of_stock_products ?? 0} Out of Stock`} 
          icon={AlertTriangle} 
          iconBg="bg-red-50" 
          iconColor="text-red-500" 
          loading={loading}
        />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Area Chart: Business Overview */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-gray-900">Business Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">Revenue vs Expenses across months</p>
            </div>
            <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                Monthly Trend {dashboardData?.period?.year ? `• ${dashboardData.period.year}` : ''}
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} dy={8} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(val) => {
                    if (val === 0) return '₹0';
                    if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                    if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
                    return `₹${val}`;
                  }}
                />
                <Tooltip
                  cursor={{ stroke: '#CBD5E1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px'
                  }}
                  formatter={(val, name) => [`₹ ${Number(val).toLocaleString('en-IN')}`, name]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName || label;
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#374151' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 3, strokeWidth: 2, fill: '#3B82F6' }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" dot={{ r: 3, strokeWidth: 2, fill: '#EF4444' }} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="profit" name="Operating Result" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" dot={{ r: 3, strokeWidth: 2, fill: '#10B981' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:col-span-1">
          <h3 className="font-bold text-gray-900 mb-1">Expense Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">By recorded expense category</p>
          
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[280px]">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400 mt-2 font-medium">Loading expense breakdown...</span>
            </div>
          ) : pieData.length > 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <div className="h-[210px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={2} dataKey="value" stroke="none">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `₹ ${Number(value).toLocaleString('en-IN')}`} 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        color: '#0F172A',
                        fontSize: '12px',
                        fontWeight: '600'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-gray-400 font-medium">Total</span>
                  <span className="font-sans font-bold text-gray-900 text-base whitespace-nowrap">
                    {formatCurrency(totalExpenseAmount)}
                  </span>
                </div>
              </div>

              <div className="w-full mt-4 space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-gray-600 font-medium truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-gray-900">{item.percentage}</span>
                      <span className="text-gray-500 w-16 text-right font-mono">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[280px] text-gray-400">
              <p className="text-xs font-medium">No expense breakdown recorded</p>
            </div>
          )}
        </div>

      </div>

      {/* Row 4: 4 Columns (Branch Performance, HR Summary, Alerts, Recent Activity) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Branch Performance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Branch Performance</h3>
              <p className="text-xs text-gray-500">Revenue & Operating Result</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {branchPerformance.length} Branches
            </span>
          </div>

          <div className="space-y-4 flex-1">
            {branchPerformance.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No branch performance records available.</p>
            ) : (
              branchPerformance.map((branch) => {
                const maxRevenue = Math.max(...branchPerformance.map(b => b.revenue || 0), 1);
                const width = `${Math.min(100, Math.max(8, ((branch.revenue || 0) / maxRevenue) * 100))}%`;
                return (
                  <div key={branch.branch_id} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-bold text-gray-800 truncate">{branch.branch_name}</span>
                      <span className="font-sans font-extrabold text-gray-900">{formatCurrency(branch.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-2 mb-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Expenses: {formatCurrency(branch.expenses)}</span>
                      <span className="font-semibold text-emerald-600">Result: {formatCurrency(branch.operating_result)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* HR Summary */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-gray-900">HR Summary</h3>
              <p className="text-xs text-gray-500">Today's workforce attendance status</p>
            </div>
            <button 
              onClick={() => navigate('/attendance/daily')} 
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3.5 flex-1">
            {[
              { label: 'Employees Present', count: attendanceSummary.present ?? 0, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
              { label: 'Absent Today', count: attendanceSummary.absent ?? 0, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
              { label: 'Half Day Recorded', count: attendanceSummary.half_day ?? 0, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
              { label: 'On Approved Leave', count: attendanceSummary.leave ?? 0, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Total Active Staff', count: attendanceSummary.total_active_employees ?? 0, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${item.border} ${item.bg}/40`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <Users size={14} className={item.color} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                </div>
                <span className={`text-sm font-extrabold ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Recent Notifications from Notification Module API */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Alerts</h3>
              <p className="text-xs text-gray-500">Recent system notifications</p>
            </div>
            <button 
              onClick={() => navigate('/notifications')} 
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
            {loadingAlerts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`alert-skel-${i}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 animate-pulse">
                  <div className="w-7 h-7 rounded-lg bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : alerts.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No alerts or notifications recorded.</p>
            ) : (
              alerts.slice(0, 5).map((alert) => {
                const isWarning = alert.notification_type === 'WARNING' || alert.notification_type === 'ERROR';
                return (
                  <div 
                    key={alert.id} 
                    onClick={() => navigate('/notifications')}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-start gap-3 ${
                      !alert.is_read 
                        ? 'bg-blue-50/40 border-blue-100 hover:bg-blue-50/70' 
                        : 'bg-white border-gray-100 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isWarning ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                    }`}>
                      {isWarning ? <AlertTriangle size={14} /> : <AlertCircle size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="text-xs font-bold text-gray-900 truncate">{alert.title}</p>
                        {!alert.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                        {alert.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        {formatTimeAgo(alert.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-gray-900">Recent Activity</h3>
              <p className="text-xs text-gray-500">Live operational audit log</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchActivities}
                className="text-xs text-gray-400 hover:text-blue-600 font-semibold p-1 transition-colors cursor-pointer"
                title="Refresh logs"
              >
                <RefreshCw size={13} className={loadingActivities ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => navigate('/audit/activitylogs')}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
            {loadingActivities ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`act-skel-${i}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2.5 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : activityLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No recent activity logs found.</p>
            ) : (
              activityLogs.slice(0, 5).map((item) => {
                const { icon: ModIcon, color, bg } = getActivityIcon(item.module);
                return (
                  <div key={item.id} className="p-3 rounded-xl bg-gray-50/70 border border-gray-100 hover:bg-gray-50 transition-colors flex items-start gap-3 group">
                    <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <ModIcon size={14} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2">
                        {item.description || `${item.action} in ${item.module}`}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 truncate">
                        <span className="font-semibold text-gray-600">{item.module}</span> • {formatTimeAgo(item.created_at)} • by <span className="text-gray-700 font-medium">{item.username || 'System'}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default CompanyOverview;
