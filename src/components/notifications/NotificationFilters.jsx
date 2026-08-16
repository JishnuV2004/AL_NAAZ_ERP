import React from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import {
  IoSearchOutline,
  IoCloseOutline,
  IoFilterOutline,
  IoChevronDownOutline
} from 'react-icons/io5';

const NotificationFilters = () => {
  const { filters, setFilter, resetFilters } = useNotificationStore();

  const moduleOptions = [
    { label: 'Expense', value: 'Expense' },
    { label: 'Petty Cash', value: 'Petty Cash' },
    { label: 'Advance', value: 'Advance' },
    { label: 'Purchase', value: 'Purchase' },
    { label: 'Salary', value: 'Salary' },
    { label: 'Attendance', value: 'Attendance' },
    { label: 'All Modules', value: 'ALL' }
  ];

  const actionOptions = [
    { label: 'All Actions', value: 'ALL' },
    { label: 'Created', value: 'Created' },
    { label: 'Updated', value: 'Updated' },
    { label: 'Deleted', value: 'Deleted' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  const dateOptions = ['Today', 'Yesterday', 'Week', 'Month', 'Custom'];

  const isFiltered =
    filters.module !== 'Expense' ||
    filters.action !== 'ALL' ||
    Boolean(filters.user) ||
    filters.dateRange !== 'Today' ||
    Boolean(filters.search);

  return (
    <div className="space-y-2 mb-6">
      {/* 1. Single-row Filters Panel Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          
          {/* Module Select */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
              Module
            </label>
            <div className="relative">
              <select
                value={filters.module}
                onChange={(e) => setFilter('module', e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 pr-8 text-sm font-medium text-[#111827] outline-hidden focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] cursor-pointer transition-colors"
              >
                {moduleOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#9CA3AF]">
                <IoChevronDownOutline className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Action Select */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
              Action
            </label>
            <div className="relative">
              <select
                value={filters.action}
                onChange={(e) => setFilter('action', e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 pr-8 text-sm font-medium text-[#111827] outline-hidden focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] cursor-pointer transition-colors"
              >
                {actionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-[#9CA3AF]">
                <IoChevronDownOutline className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* User Search Input */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
              User
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#9CA3AF]">
                <IoSearchOutline className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={filters.user || ''}
                onChange={(e) => setFilter('user', e.target.value)}
                placeholder="Search user..."
                className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-9 text-sm text-[#111827] placeholder-[#9CA3AF] outline-hidden transition-all focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#9CA3AF]">
                <IoSearchOutline className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Date Segmented Quick Filter Buttons */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
              Date
            </label>
            <div className="inline-flex items-center rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1 w-full justify-between">
              {dateOptions.map((d) => {
                const isActive = filters.dateRange === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFilter('dateRange', d)}
                    className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'border border-[#3B82F6] bg-[#EFF6FF] text-[#2563EB] font-bold shadow-2xs'
                        : 'border-transparent text-[#4B5563] hover:text-[#111827] hover:bg-white/60'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters Action Button on Far Right */}
          <div className="md:col-span-1 flex justify-end">
            <button
              type="button"
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-xs font-semibold text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-2xs cursor-pointer h-[42px]"
            >
              <IoFilterOutline className="h-4 w-4 text-[#6B7280]" />
              <span>Filters</span>
            </button>
          </div>

        </div>

        {/* Custom date range pickers if 'Custom' is selected */}
        {filters.dateRange === 'Custom' && (
          <div className="flex items-center space-x-3 pt-4 mt-3 border-t border-[#E5E7EB]">
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilter('startDate', e.target.value)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#111827] outline-hidden focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#6B7280] mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilter('endDate', e.target.value)}
                className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#111827] outline-hidden focus:border-[#3B82F6]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters Link on right */}
      <div className="flex justify-end pr-1">
        <button
          onClick={resetFilters}
          className="flex items-center space-x-1 text-xs text-[#6B7280] hover:text-[#111827] font-medium transition-colors cursor-pointer"
        >
          <IoCloseOutline className="h-4 w-4" />
          <span>Clear Filters</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationFilters;
