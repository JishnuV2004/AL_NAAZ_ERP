import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard, ShoppingBag, Landmark, CheckCircle2,
  ArrowLeftRight,
  Info, Send, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import { receivableService } from '../../services/receivableService';
import { accountService } from '../../services/accountService';

const Receivables = () => {
  const [receivables, setReceivables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Tab State: 'pending' or 'recent'
  const [activeTab, setActiveTab] = useState('pending');

  // Settle Receivable Form State
  const [selectedReceivableId, setSelectedReceivableId] = useState('');
  const [financialAccounts, setFinancialAccounts] = useState([]);
  const [destinationAccount, setDestinationAccount] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [referenceNote, setReferenceNote] = useState('');
  const [descriptionNote, setDescriptionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapReceivableItem = (item) => {
    const isFoodDelivery = item.payment_method === 'FOOD_DELIVERY';
    const platformName = item.delivery_partner_name || item.platform || (isFoodDelivery ? 'Food Delivery' : 'Card Payments');
    const accountName = isFoodDelivery ? 'Food Delivery Receivable' : 'Card Receivable';

    let refStr = '';
    if (item.delivery_partner_name) {
      refStr = `${item.delivery_partner_name.toUpperCase()}-${String(item.id).padStart(3, '0')}`;
    } else if (item.platform) {
      refStr = `${item.platform.toUpperCase()}-${String(item.id).padStart(3, '0')}`;
    } else if (item.payment_method === 'CARD') {
      refStr = `PINE-LABS-${String(item.id).padStart(3, '0')}`;
    } else {
      refStr = `REF-${item.id}`;
    }

    const dateFormatted = item.business_date
      ? new Date(item.business_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    const grossAmt = parseFloat(item.gross_amount) || 0;
    const settledAmt = parseFloat(item.settled_amount) || 0;
    const outstandingAmt = parseFloat(item.outstanding_amount) || 0;

    return {
      id: item.id,
      branch: item.branch,
      branchName: item.branch_name || 'Al Naaz Kayamkulam',
      dailySalesPayment: item.daily_sales_payment,
      paymentMethod: item.payment_method,
      platform: platformName,
      account: accountName,
      receivableAccount: item.receivable_account,
      deliveryPartner: item.delivery_partner,
      deliveryPartnerName: item.delivery_partner_name,
      reference: refStr,
      totalAmount: grossAmt,
      grossAmount: grossAmt,
      settledAmount: settledAmt,
      outstandingAmount: outstandingAmt,
      outstanding: outstandingAmt,
      status: item.status || (outstandingAmt > 0 ? 'PENDING' : 'SETTLED'),
      businessDate: item.business_date,
      date: dateFormatted,
      commissionRate: item.commission_rate !== null ? parseFloat(item.commission_rate) : null,
      commissionAmount: item.commission_amount !== null ? parseFloat(item.commission_amount) : null,
      expectedNetAmount: item.expected_net_amount !== null ? parseFloat(item.expected_net_amount) : null,
      createdBy: item.created_by_name || (item.created_by === 1 ? 'admin' : `User #${item.created_by}`),
      icon: isFoodDelivery ? ShoppingBag : CreditCard,
      iconBg: isFoodDelivery ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
    };
  };

  const loadFinancialAccounts = async () => {
    try {
      const data = await accountService.fetchAccounts();
      const list = Array.isArray(data) ? data : (data?.results || []);
      setFinancialAccounts(list);
      if (list.length > 0) {
        setDestinationAccount((prev) => prev || String(list[0].id));
      }
    } catch (err) {
      console.warn('Failed to fetch financial accounts:', err);
    }
  };

  const loadReceivables = async (page = 1) => {
    setLoading(true);
    try {
      const data = await receivableService.fetchReceivables(page, pageSize);
      let list = [];
      let count = 0;

      if (Array.isArray(data)) {
        list = data;
        count = data.length;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
        count = typeof data.count === 'number' ? data.count : data.results.length;
      }

      setTotalCount(count);
      setCurrentPage(page);

      if (list.length > 0) {
        const mapped = list.map(mapReceivableItem);
        setReceivables(mapped);

        // Pre-select first pending account in form if available
        const pending = mapped.filter((r) => r.outstandingAmount > 0 || r.status === 'PENDING');
        if (pending.length > 0 && !selectedReceivableId) {
          setSelectedReceivableId(pending[0].id);
          setSettlementAmount(pending[0].outstandingAmount.toString());
          setReferenceNote(`${pending[0].platform} settlement - ${pending[0].reference}`);
        }
      } else {
        setReceivables([]);
      }
    } catch (err) {
      console.error('Failed to fetch receivables from API:', err);
      setReceivables([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceivables(1);
    loadFinancialAccounts();
  }, []);

  // Filtered lists
  const pendingList = receivables.filter((r) => r.outstandingAmount > 0 || r.status === 'PENDING');
  const recentSettlements = receivables.filter((r) => r.settledAmount > 0 || r.status === 'SETTLED');

  // Currently selected account in settlement widget
  const selectedAccount = pendingList.find((item) => String(item.id) === String(selectedReceivableId)) || pendingList[0];

  // Dynamic Card Metrics
  const cardReceivableAmt = receivables
    .filter((r) => r.paymentMethod === 'CARD')
    .reduce((acc, r) => acc + r.outstandingAmount, 0);

  const cardPendingCount = receivables
    .filter((r) => r.paymentMethod === 'CARD' && (r.outstandingAmount > 0 || r.status === 'PENDING')).length;

  const foodDeliveryAmt = receivables
    .filter((r) => r.paymentMethod === 'FOOD_DELIVERY')
    .reduce((acc, r) => acc + r.outstandingAmount, 0);

  const foodDeliveryPendingCount = receivables
    .filter((r) => r.paymentMethod === 'FOOD_DELIVERY' && (r.outstandingAmount > 0 || r.status === 'PENDING')).length;

  const totalOutstanding = receivables.reduce((acc, r) => acc + r.outstandingAmount, 0);
  const totalSettled = receivables.reduce((acc, r) => acc + r.settledAmount, 0);

  // Dynamic Donut Chart Data
  const totalOutForChart = totalOutstanding || 1;
  const foodDeliveryPct = totalOutstanding > 0 ? ((foodDeliveryAmt / totalOutForChart) * 100).toFixed(1) : '0.0';
  const cardPct = totalOutstanding > 0 ? ((cardReceivableAmt / totalOutForChart) * 100).toFixed(1) : '0.0';

  const pieData = [
    { name: 'Food Delivery', value: foodDeliveryAmt, percentage: `${foodDeliveryPct}%`, color: '#F97316' },
    { name: 'Card', value: cardReceivableAmt, percentage: `${cardPct}%`, color: '#3B82F6' },
    { name: 'Others', value: Math.max(0, totalOutstanding - (foodDeliveryAmt + cardReceivableAmt)), percentage: '0%', color: '#10B981' }
  ];

  // Bar Chart Data: Receivables vs Settlements by business date (Actual data)
  const barChartData = useMemo(() => {
    if (!receivables || receivables.length === 0) return [];

    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map = {};

    receivables.forEach((r) => {
      const dStr = r.businessDate || (r.date && r.date !== '-' ? r.date : 'Other');
      if (!map[dStr]) {
        let label = dStr;
        if (dStr.includes('-')) {
          const parts = dStr.split('-');
          if (parts.length === 3) {
            const mIdx = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            label = `${day} ${monthNamesShort[mIdx] || parts[1]}`;
          }
        }
        map[dStr] = {
          dateKey: dStr,
          month: label,
          Outstanding: 0,
          Settled: 0
        };
      }
      map[dStr].Outstanding += parseFloat(r.outstandingAmount || r.outstanding || 0);
      map[dStr].Settled += parseFloat(r.settledAmount || 0);
    });

    return Object.values(map)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .map((item) => ({
        month: item.month,
        Outstanding: Math.round(item.Outstanding * 100) / 100,
        Settled: Math.round(item.Settled * 100) / 100
      }));
  }, [receivables]);

  // Handle row selection for quick settlement
  const handleSelectRowToSettle = (row) => {
    setSelectedReceivableId(row.id);
    setSettlementAmount(row.outstandingAmount.toString());
    setReferenceNote(`${row.platform} settlement - ${row.reference}`);
    toast.success(`Selected ${row.account} (#${row.id}) for settlement`);
  };

  // Handle Form Submit
  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReceivableId) {
      toast.error('Please select a receivable account to settle');
      return;
    }
    if (!destinationAccount) {
      toast.error('Please select a destination financial account');
      return;
    }
    const amountNum = parseFloat(settlementAmount);
    if (!amountNum || amountNum <= 0) {
      toast.error('Please enter a valid settlement amount');
      return;
    }

    const payload = {
      receivable: Number(selectedReceivableId),
      destination_account: Number(destinationAccount),
      gross_amount: String(settlementAmount),
      settlement_date: settlementDate,
      reference: referenceNote || 'string',
      description: descriptionNote || 'string'
    };

    setIsSubmitting(true);
    try {
      const res = await receivableService.createReceivableSettlement(payload);
      toast.success(res?.message || `Receivable #${selectedReceivableId} settled successfully!`);
      loadReceivables(currentPage);
      setReferenceNote('');
      setDescriptionNote('');
    } catch (err) {
      console.error('Failed to create receivable settlement:', err);
      let errMsg = 'Failed to settle receivable';
      if (err?.response?.data) {
        if (typeof err.response.data === 'string') errMsg = err.response.data;
        else if (err.response.data.detail) errMsg = err.response.data.detail;
        else if (err.response.data.message) errMsg = err.response.data.message;
        else if (typeof err.response.data === 'object') {
          const fieldErrors = Object.entries(err.response.data).map(([key, val]) => {
            const valStr = Array.isArray(val) ? val.join(', ') : String(val);
            return `${key}: ${valStr}`;
          });
          if (fieldErrors.length > 0) errMsg = fieldErrors.join(' | ');
        }
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Y-Axis tick renderer to guarantee single-line SVG text without splitting
  const CustomYAxisTick = ({ x, y, payload }) => {
    if (payload.value === undefined || payload.value === null) return null;
    return (
      <text x={x - 6} y={y + 4} textAnchor="end" fill="#64748B" fontSize={11} fontWeight={500} fontFamily="'Inter', sans-serif">
        ₹ {Number(payload.value).toLocaleString('en-IN')}
      </text>
    );
  };

  // Custom Tooltip with white card background and clean aesthetics
  const CustomBarChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90 shadow-lg text-xs font-sans">
          <p className="font-bold text-slate-800 mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="font-semibold text-xs py-0.5" style={{ color: entry.color || entry.fill }}>
              {entry.name} : ₹ {Number(entry.value).toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="space-y-4 text-slate-800 pb-6 w-full">
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
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">
                ₹ {cardReceivableAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                {cardPendingCount} pending {cardPendingCount === 1 ? 'settlement' : 'settlements'}
              </p>
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
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">
                ₹ {foodDeliveryAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                {foodDeliveryPendingCount} pending {foodDeliveryPendingCount === 1 ? 'settlement' : 'settlements'}
              </p>
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
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">
                ₹ {totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, totalOutstanding > 0 ? 70 : 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Total Settled */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between h-full min-h-[96px]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Total Settled</p>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans whitespace-nowrap">
                ₹ {totalSettled.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 inline-flex items-center gap-1">
                ✓ {recentSettlements.length} settled records
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Grid (Charts & Tables) vs Right Form Widget */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Left Column: Charts & Tables */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
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
                {barChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                      <YAxis width={60} tick={<CustomYAxisTick />} axisLine={false} tickLine={false} />
                      <Tooltip
                        content={<CustomBarChartTooltip />}
                        cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                      />
                      <Bar dataKey="Outstanding" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={barChartData.length <= 2 ? 28 : barChartData.length <= 4 ? 20 : 14} />
                      <Bar dataKey="Settled" fill="#10B981" radius={[4, 4, 0, 0]} barSize={barChartData.length <= 2 ? 28 : barChartData.length <= 4 ? 20 : 14} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    No receivables or settlements data to display
                  </div>
                )}
              </div>
            </div>

            {/* Outstanding by Platform Donut Chart (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-slate-900">Outstanding by Platform</h3>
                  <select className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer">
                    <option>All Dates</option>
                    <option>This Month</option>
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
                    <span className="text-base font-extrabold text-slate-900 font-sans tracking-tight whitespace-nowrap">
                      ₹ {totalOutstanding.toLocaleString('en-IN')}
                    </span>
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
                        <p className="text-[11px] text-slate-400 font-normal">{foodDeliveryPct}%</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-sans whitespace-nowrap shrink-0">
                      ₹ {foodDeliveryAmt.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0"></span>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">Card</p>
                        <p className="text-[11px] text-slate-400 font-normal">{cardPct}%</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-sans whitespace-nowrap shrink-0">
                      ₹ {cardReceivableAmt.toLocaleString('en-IN')}
                    </span>
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

          {/* Section 1: Pending Receivables / Recent Settlements Table with Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 min-h-[580px] flex flex-col justify-between">
            <div>
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
                  Pending Receivables ({pendingList.length})
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
                  Recent Settlements ({recentSettlements.length})
                </button>
              </div>

              {/* Table Content */}
              {activeTab === 'pending' ? (
                <div className="overflow-x-auto min-h-[480px]">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] bg-slate-50/50">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Platform / Account</th>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3 text-right">Total Amount</th>
                        <th className="py-2.5 px-3 text-right">Settled Amount</th>
                        <th className="py-2.5 px-3 text-right">Outstanding</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse h-[52px]">
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                            <td className="py-3 px-3 text-center"><div className="h-6 bg-slate-200 rounded w-16 mx-auto"></div></td>
                          </tr>
                        ))
                      ) : pendingList.length > 0 ? (
                        pendingList.map((row) => {
                          const IconComponent = row.icon;
                          return (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors h-[54px]">
                              <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">{row.date}</td>

                              <td className="py-3 px-3">
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

                              <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{row.reference}</td>

                              <td className="py-3 px-3 text-right font-bold text-slate-800 font-mono">
                                ₹ {row.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>

                              <td className="py-3 px-3 text-right font-bold text-slate-600 font-mono">
                                ₹ {row.settledAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>

                              <td className="py-3 px-3 text-right font-extrabold text-rose-600 font-mono">
                                ₹ {row.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>

                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRowToSettle(row)}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                                >
                                  Settle
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                            No pending receivables found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto min-h-[480px]">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] bg-slate-50/50">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Platform / Account</th>
                        <th className="py-2.5 px-3 text-right">Amount Settled</th>
                        <th className="py-2.5 px-3 text-right">Gross Amount</th>
                        <th className="py-2.5 px-3">Reference</th>
                        <th className="py-2.5 px-3">Created By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal">
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i} className="animate-pulse h-[52px]">
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20 ml-auto"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                            <td className="py-3 px-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                          </tr>
                        ))
                      ) : recentSettlements.length > 0 ? (
                        recentSettlements.map((row) => {
                          const IconComponent = row.icon;
                          return (
                            <tr key={row.id} className="hover:bg-slate-50/80 transition-colors h-[54px]">
                              <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">{row.date}</td>
                              <td className="py-3 px-3 font-semibold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded-lg ${row.iconBg} flex items-center justify-center shrink-0`}>
                                    <IconComponent className="w-3.5 h-3.5" />
                                  </div>
                                  <span>{row.platform}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-emerald-600 font-mono">
                                ₹ {row.settledAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-3 text-right font-bold text-slate-800 font-mono">
                                ₹ {row.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{row.reference}</td>
                              <td className="py-3 px-3 text-slate-600 font-medium">{row.createdBy}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                            No recent settlements found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {(() => {
              const totalItems = totalCount || receivables.length;
              const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
              const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
              const endItem = Math.min(currentPage * pageSize, totalItems);

              return (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium rounded-b-2xl">
                  <div>
                    Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
                    <span className="font-bold text-slate-800">{endItem}</span> of{' '}
                    <span className="font-bold text-slate-800">{totalItems}</span> receivables
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={currentPage === 1 || loading}
                      onClick={() => loadReceivables(currentPage - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          disabled={loading}
                          onClick={() => loadReceivables(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg font-medium text-xs transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-xs font-bold'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages || loading}
                      onClick={() => loadReceivables(currentPage + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
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
                    const id = e.target.value;
                    setSelectedReceivableId(id);
                    const item = pendingList.find((p) => String(p.id) === String(id));
                    if (item) {
                      setSettlementAmount(item.outstandingAmount.toString());
                      setReferenceNote(`${item.platform} settlement - ${item.reference}`);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Select Pending Receivable --</option>
                  {pendingList.map((p) => (
                    <option key={p.id} value={p.id}>
                      Receivable #{p.id} ({p.platform} - Bal: ₹ {p.outstandingAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Outstanding Amount Info Box */}
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <p className="text-[11px] font-medium text-slate-500 mb-0.5">Outstanding Amount</p>
                <p className="text-xl font-black text-slate-900 font-mono">
                  ₹ {selectedAccount ? selectedAccount.outstandingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </p>
              </div>

              {/* Field 3: Settlement Gross Amount */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Settlement Gross Amount <span className="text-rose-500">*</span>
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

              {/* Field 4: Destination Financial Account */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Destination Account <span className="text-rose-500">*</span>
                </label>
                <select
                  value={destinationAccount}
                  onChange={(e) => setDestinationAccount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Select Destination Account --</option>
                  {financialAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name || acc.account_name} (ID: {acc.id})
                    </option>
                  ))}
                  {financialAccounts.length === 0 && (
                    <>
                      <option value="6">Bank Account (ID: 6)</option>
                      <option value="1">Petty Cash (ID: 1)</option>
                      <option value="2">HDFC Current Account (ID: 2)</option>
                    </>
                  )}
                </select>
                {(() => {
                  const matched = financialAccounts.find((a) => String(a.id) === String(destinationAccount));
                  return matched ? (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Balance: ₹ {parseFloat(matched.balance || matched.current_balance || 0).toLocaleString('en-IN')}
                    </p>
                  ) : null;
                })()}
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

              {/* Field 6: Reference */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reference</label>
                <input
                  type="text"
                  placeholder="e.g. string"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Field 7: Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. string"
                  value={descriptionNote}
                  onChange={(e) => setDescriptionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Field 8: Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Settling...' : 'Settle Receivable'}</span>
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
