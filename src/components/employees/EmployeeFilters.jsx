import React, { useState, useEffect } from 'react';
import { IoSearchOutline, IoFilterOutline } from 'react-icons/io5';

const EmployeeFilters = ({ accessibleBranches = [], filters, onFilterChange }) => {
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
    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <IoSearchOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          type="text" 
          placeholder="Search by name, phone, or designation..." 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-xs bg-white text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto">
        <div className="flex items-center gap-2 flex-1 sm:flex-none">
          <IoFilterOutline size={16} className="text-gray-400 shrink-0 hidden sm:block" />
          <select 
            value={filters.branchId} 
            onChange={(e) => onFilterChange({ branchId: e.target.value })}
            className="w-full sm:w-auto border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
          >
            <option value="All">All Branches</option>
            {accessibleBranches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name || branch.branch_name || branch.code || `Branch #${branch.id}`}
              </option>
            ))}
          </select>
        </div>
        
        <select 
          value={filters.status} 
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="flex-1 sm:flex-none border border-gray-200 rounded-xl text-xs px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
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
