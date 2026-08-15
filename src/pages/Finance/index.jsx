import React, { useState } from 'react';
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Overview from './Overview';
import Expenses from './Expenses';
import Categories from './Categories';
import PettyCash from './PettyCash';
import Reports from './Reports';
import ActivityLog from './ActivityLog';
import { useFinanceStore } from '../../store/financeStore';

const FinanceLayout = () => {
  const location = useLocation();
  const dateFilter = useFinanceStore(state => state.dateFilter);
  const setDateFilter = useFinanceStore(state => state.setDateFilter);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tabs = [
    { name: 'Overview', path: '/finance/overview' },
    { name: 'All expenses', path: '/finance/expenses' },
    { name: 'Categories', path: '/finance/categories' },
    { name: 'Petty cash', path: '/finance/petty-cash' },
    { name: 'Reports', path: '/finance/reports' },
    { name: 'Activity & audit', path: '/finance/activity' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAF9] -mx-8 -my-10 px-8 py-10 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-serif font-extrabold text-gray-900 tracking-tight">Expenses</h1>
          <p className="text-gray-500 mt-1.5 text-sm font-medium">Track spending and petty cash, with a clear record of who did what.</p>
        </div>
        <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
          Preview loading state
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto hide-scrollbar mb-6">
        {tabs.map(tab => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `whitespace-nowrap pb-3 text-sm transition-colors ${
                isActive
                  ? 'border-b-2 border-[#1E5E45] text-[#1E5E45] font-semibold'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800 font-medium'
              }`
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 min-h-0">
        <Routes>
          <Route path="/" element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="categories" element={<Categories />} />
          <Route path="petty-cash" element={<PettyCash />} />
          <Route path="reports" element={<Reports />} />
          <Route path="activity" element={<ActivityLog />} />
        </Routes>
      </div>
    </div>
  );
};

export default FinanceLayout;
