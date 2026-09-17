import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';

const EmployeeFilters = ({ accessibleBranches, filters, onFilterChange }) => {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange({ search: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  return (
    <div className="p-4 border-b border-[#E7E8EE] flex flex-col sm:flex-row justify-between items-center gap-3 bg-white rounded-t-2xl">
      <div className="relative w-full sm:w-96">
        <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
        <input 
          type="text" 
          placeholder="Search name, phone, or designation..." 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition-all bg-[#F4F5F8] text-[#1C1F2A] text-xs font-medium"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-none">
          <IoFilterOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={15} />
          <select 
            value={filters.branchId} 
            onChange={(e) => onFilterChange({ branchId: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] bg-[#F4F5F8] text-[#1C1F2A] text-xs font-medium appearance-none cursor-pointer"
          >
            <option value="All">All Branches</option>
            {accessibleBranches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.code}</option>
            ))}
          </select>
        </div>
        
        <select 
          value={filters.status} 
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="flex-1 sm:flex-none px-3 py-1.5 border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] bg-[#F4F5F8] text-[#1C1F2A] text-xs font-medium cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
};

export default EmployeeFilters;
