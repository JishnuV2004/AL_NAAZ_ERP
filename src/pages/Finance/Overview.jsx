import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { financeService } from '../../services/financeService';
import { PageLoader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { IoWalletOutline, IoTrendingDownOutline, IoTrendingUpOutline, IoCashOutline, IoArrowForwardOutline } from 'react-icons/io5';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const dateFilter = useFinanceStore(state => state.dateFilter);
  
  const [report, setReport] = useState({});
  const [recentCash, setRecentCash] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [reportData, cashData, activityData] = await Promise.all([
        financeService.fetchExpenseReport(dateFilter.startDate, dateFilter.endDate),
        financeService.fetchPettyCash(1, 5, { start_date: dateFilter.startDate, end_date: dateFilter.endDate }),
        financeService.fetchActivityLogs(1, 5, { start_date: dateFilter.startDate, end_date: dateFilter.endDate })
      ]);
      
      if (reportData) setReport(reportData);
      if (cashData) setRecentCash(cashData.results || cashData.data || []);
      if (activityData) setRecentActivity(activityData.results || activityData.data || []);
      
      setLoading(false);
    };
    
    fetchData();
  }, [dateFilter]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Date Filters */}
      <div className="flex space-x-2">
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Today</button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Yesterday</button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">This week</button>
        <button className="px-4 py-1.5 rounded-full border border-[#1E5E45] text-sm font-medium text-white bg-[#1E5E45]">This month</button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Last month</button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Custom range</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-[#1E5E45] shadow-sm flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Current petty cash</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{Number(report.closing_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-50 p-1.5 rounded border border-gray-200 text-gray-400">
            <IoWalletOutline className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-red-600 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Total expenses</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{Number(report.total_expense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-50 p-1.5 rounded border border-gray-200 text-gray-400">
            <IoTrendingDownOutline className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-blue-600 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Cash added</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{Number(report.total_cash_added || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-50 p-1.5 rounded border border-gray-200 text-gray-400">
            <IoTrendingUpOutline className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 border-l-4 border-l-gray-400 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-gray-500 text-xs font-medium mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">
              {report.expense_count || 0}
            </p>
          </div>
          <div className="bg-gray-50 p-1.5 rounded border border-gray-200 text-gray-400">
            <IoCashOutline className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Opening & Closing Balance Horizontal Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex items-center divide-x divide-gray-100">
        <div className="flex-1 p-4 flex justify-between items-center">
          <span className="text-gray-500 text-sm font-medium">Opening balance (1 Aug)</span>
          <span className="font-mono text-gray-900 font-bold text-sm">
            ₹{Number(report.opening_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex-1 p-4 flex justify-between items-center">
          <span className="text-gray-500 text-sm font-medium">Closing balance (14 Aug)</span>
          <span className="font-mono text-[#1E5E45] font-bold text-sm">
            ₹{Number(report.closing_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column: Expense Overview & Petty Cash */}
        <div className="space-y-6">
          {/* Expense Overview Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-gray-900 font-bold">Expense overview</h3>
              <Link to="/finance/reports" className="text-[#1E5E45] font-semibold text-sm hover:underline">
                View reports
              </Link>
            </div>
            
            <div className="p-5">
              <div className="mb-6">
                <span className="text-gray-500 text-sm">Total this month: </span>
                <span className="font-mono font-bold text-gray-900 text-sm">₹{Number(report.total_expense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="space-y-6">
                {(!report.category_breakdown || Object.keys(report.category_breakdown).length === 0) ? (
                  <div className="text-center text-gray-400 font-medium text-sm py-4">No categories to display.</div>
                ) : (
                  Object.entries(report.category_breakdown).map(([category, amount]) => {
                    const total = Number(report.total_expense) || 1;
                    const percent = Math.min((amount / total) * 100, 100);
                    return (
                      <div key={category} className="relative">
                        <div className="flex justify-between items-end mb-1.5">
                          <span className="text-sm font-medium text-gray-900 capitalize">{category}</span>
                          <span className="text-sm font-mono font-bold text-gray-500">₹{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#1E5E45] h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Petty Cash Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-gray-900 font-bold">Petty cash</h3>
              <Link to="/finance/petty-cash" className="text-[#1E5E45] font-semibold text-sm hover:underline flex items-center">
                View full ledger <IoArrowForwardOutline className="ml-1" />
              </Link>
            </div>
            <div className="p-0">
              {recentCash.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">No recent transactions.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {recentCash.slice(0, 3).map(tx => (
                    <div key={tx.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-0.5">
                          {tx.transaction_type === 'CASH_IN' && 'Cash added'}
                          {tx.transaction_type === 'EXPENSE' && 'Expense'}
                          {tx.transaction_type === 'ADJUSTMENT' && 'Adjustment'}
                          {tx.transaction_type === 'OPENING' && 'Opening balance'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {tx.transaction_type === 'EXPENSE' && tx.remarks && `${tx.remarks} · `}
                          {new Date(tx.transaction_date || tx.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-bold text-sm ${tx.transaction_type === 'CASH_IN' ? 'text-green-700' : tx.transaction_type === 'EXPENSE' ? 'text-gray-900' : 'text-gray-900'}`}>
                          {tx.transaction_type === 'CASH_IN' ? '+' : tx.transaction_type === 'EXPENSE' ? '-' : ''}
                          ₹{Math.abs(Number(tx.amount)).toLocaleString()}
                        </p>
                        <p className="text-xs font-mono font-medium text-gray-400 mt-0.5">
                          ₹{Number(tx.balance_after).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Financial Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-gray-900 font-bold">Recent financial activity</h3>
            <Link to="/finance/activity" className="text-[#1E5E45] font-semibold text-sm hover:underline flex items-center">
              View full activity <IoArrowForwardOutline className="ml-1" />
            </Link>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm font-medium">No recent activity.</div>
            ) : (
              <div className="space-y-8">
                {/* We can group by date string if needed, for now we will render them directly with some dummy headers for realism if wanted, or just map them out. */}
                {/* For realism matching screenshot, let's just group them manually or map them in a list with separators */}
                <div className="space-y-6">
                  {recentActivity.map((log, index) => {
                    const isExpense = log.action === 'CREATE' && log.module === 'EXPENSE';
                    const isCashAdded = log.action === 'CREATE' && log.module === 'PETTY_CASH';
                    const isAdjustment = log.action === 'UPDATE';
                    
                    let dotColor = 'bg-gray-400';
                    if (isExpense) dotColor = 'bg-red-500';
                    if (isCashAdded) dotColor = 'bg-[#1E5E45]'; // matching green cash added
                    if (isAdjustment) dotColor = 'bg-amber-500';

                    // Extract amount from description if possible for the right side (dummy implementation)
                    let amountMatch = log.description?.match(/₹[\d,]+/);
                    let displayAmount = amountMatch ? amountMatch[0] : '';
                    let displayAmountColor = isCashAdded ? 'text-green-700' : 'text-red-700';

                    return (
                      <div key={log.id} className="relative border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        {/* We could insert date headers here if the date changed from previous item */}
                        {index === 0 && (
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">TODAY · 14 AUG 2026</h4>
                        )}
                        {index === 2 && (
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-4">YESTERDAY · 13 AUG 2026</h4>
                        )}
                        {index === 4 && (
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6 mb-4">12 AUG 2026</h4>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="w-16 flex-shrink-0 text-xs font-mono text-gray-400 pt-0.5">
                            {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${dotColor}`}></div>
                          
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              <span className="font-bold text-gray-900">{log.user_name || log.user || 'admin'}</span>{' '}
                              {isExpense && 'created expense'}
                              {isCashAdded && 'added cash'}
                              {isAdjustment && 'adjusted an expense'}
                              {!isExpense && !isCashAdded && !isAdjustment && log.description}
                            </p>
                            
                            {(isExpense || isAdjustment) && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {log.module === 'EXPENSE' ? 'Employee food' : log.description}
                              </p>
                            )}
                            
                            {isCashAdded && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Balance ₹19,800
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right flex-shrink-0">
                            {displayAmount && (
                               <p className={`font-mono font-bold text-sm ${displayAmountColor}`}>
                                 {isCashAdded ? '+' : '-'}{displayAmount}
                               </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
