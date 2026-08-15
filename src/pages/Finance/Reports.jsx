import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/financeStore';
import { financeService } from '../../services/financeService';
import { PageLoader } from '../../components/common/Loader';
import { IoWalletOutline, IoTrendingDownOutline, IoTrendingUpOutline, IoCashOutline } from 'react-icons/io5';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dateFilter = useFinanceStore(state => state.dateFilter);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      const data = await financeService.fetchExpenseReport('this_month', 'this_month');
      setReportData(data);
      setLoading(false);
    };
    fetchReport();
  }, []);

  if (loading) return <PageLoader />;

  if (!reportData) {
    return (
      <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center py-16">
        <span className="text-4xl mb-4">📊</span>
        <p className="text-brand-text-muted font-medium">Unable to load report data.</p>
      </div>
    );
  }

  // Ensure safe fallback values
  const {
    opening_balance = 0,
    total_cash_added = 0,
    total_expense = 0,
    expense_count = 0,
    closing_balance = 0,
    category_totals = []
  } = reportData;

  // Sort categories by highest spend
  const sortedCategories = [...category_totals].sort((a, b) => b.total - a.total);
  const maxCategorySpend = sortedCategories.length > 0 ? sortedCategories[0].total : 0;

  return (
    <div className="space-y-6 animate-fade-in-up pb-12">
      {/* Date Filters */}
      <div className="flex space-x-2">
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Today</button>
        <button className="px-4 py-1.5 rounded-full border border-[#1E5E45] text-sm font-medium text-white bg-[#1E5E45]">This month</button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Last month</button>
        <button className="px-4 py-1.5 rounded-full border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Custom range</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-gray-900 font-bold mb-4">Financial summary · August 2026</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Opening balance</span>
              <span className="font-mono text-gray-900 font-bold text-sm">₹{Number(opening_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Cash added</span>
              <span className="font-mono text-green-700 font-bold text-sm">+₹{Number(total_cash_added).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-sm">Total expenses</span>
              <span className="font-mono text-red-700 font-bold text-sm">-₹{Number(total_expense).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 border-dashed">
              <span className="text-gray-700 font-medium text-sm">Expense count</span>
              <span className="font-bold text-gray-900 text-sm">{expense_count}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-900 font-bold text-sm">Closing balance</span>
              <span className="font-mono text-[#1E5E45] font-bold text-sm">₹{Number(closing_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-gray-900 font-bold mb-4">Category-wise expenses</h3>
          <div className="space-y-6">
            {sortedCategories.length === 0 ? (
              <div className="text-center text-gray-400 font-medium text-sm py-4">
                Not enough data to display chart.
              </div>
            ) : (
              sortedCategories.map(cat => {
                const barWidth = maxCategorySpend > 0 ? `${(cat.total / maxCategorySpend) * 100}%` : '0%';
                
                return (
                  <div key={cat.category} className="relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-medium text-gray-800">{cat.category}</span>
                      <span className="text-xs font-mono font-bold text-gray-400">₹{Number(cat.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#1E5E45] h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: barWidth }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-gray-900 font-bold">Category totals</h3>
        </div>
        {sortedCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-medium text-sm">
            No category data available for this period.
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCategories.map(cat => {
                  return (
                    <tr key={cat.category} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{cat.category}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-gray-700">
                        ₹{Number(cat.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
