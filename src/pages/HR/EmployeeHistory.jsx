import React, { useState } from 'react';
import { IoSearchOutline, IoFilterOutline, IoBriefcaseOutline, IoTrendingUpOutline, IoCashOutline, IoWarningOutline, IoPersonAddOutline } from 'react-icons/io5';

// Dummy Data for Employee History / Audit Log
const dummyHistory = [
  { id: 'HIST-001', date: '2026-08-25T10:30:00', employeeName: 'John Doe', empId: 'EMP001', type: 'Promotion', description: 'Promoted from Sous Chef to Head Chef', recordedBy: 'Admin User' },
  { id: 'HIST-002', date: '2026-08-20T14:15:00', employeeName: 'Jane Smith', empId: 'EMP002', type: 'Salary Change', description: 'Base salary increased by 10%', recordedBy: 'Admin User' },
  { id: 'HIST-003', date: '2026-08-15T09:00:00', employeeName: 'Mohammed Khan', empId: 'EMP005', type: 'Disciplinary', description: 'Late arrival warning (3rd instance)', recordedBy: 'Sarah Ahmed' },
  { id: 'HIST-004', date: '2026-08-01T11:45:00', employeeName: 'Ali Hassan', empId: 'EMP003', type: 'Role Change', description: 'Transferred from Branch A to Branch B', recordedBy: 'Admin User' },
  { id: 'HIST-005', date: '2026-07-15T08:30:00', employeeName: 'Sarah Ahmed', empId: 'EMP004', type: 'Onboarding', description: 'Completed probationary period successfully', recordedBy: 'System' },
  { id: 'HIST-006', date: '2026-07-10T16:20:00', employeeName: 'Mohammed Khan', empId: 'EMP005', type: 'Status Change', description: 'Status changed from Active to Inactive', recordedBy: 'Admin User' },
];

const EmployeeHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  const filteredHistory = dummyHistory.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || record.type === filterType;
    return matchesSearch && matchesType;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'Promotion': return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><IoTrendingUpOutline size={18} /></div>;
      case 'Salary Change': return <div className="p-2 bg-green-100 text-green-600 rounded-full"><IoCashOutline size={18} /></div>;
      case 'Disciplinary': return <div className="p-2 bg-red-100 text-red-600 rounded-full"><IoWarningOutline size={18} /></div>;
      case 'Onboarding': return <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><IoPersonAddOutline size={18} /></div>;
      case 'Role Change':
      case 'Status Change':
      default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><IoBriefcaseOutline size={18} /></div>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Employee History</h1>
          <p className="text-gray-500 mt-1">Audit log of employee lifecycle events, promotions, and changes.</p>
        </div>
      </div>

      {/* Timeline/Table View */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search history by employee or keywords..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45] transition-all bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <IoFilterOutline className="text-gray-500" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E5E45] bg-white w-full sm:w-auto text-sm"
            >
              <option value="All">All Event Types</option>
              <option value="Promotion">Promotion</option>
              <option value="Salary Change">Salary Change</option>
              <option value="Role Change">Role Change</option>
              <option value="Disciplinary">Disciplinary</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Status Change">Status Change</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record, index) => (
                <div key={record.id} className="relative flex gap-6">
                  {/* Timeline connector */}
                  {index !== filteredHistory.length - 1 && (
                    <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                  )}
                  
                  {/* Icon */}
                  <div className="relative z-10 shrink-0">
                    {getEventIcon(record.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{record.employeeName}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{record.empId}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(record.date).toLocaleString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-[#1E5E45] mb-1">{record.type}</h4>
                    <p className="text-gray-600 text-sm mb-3">{record.description}</p>
                    
                    <div className="text-xs text-gray-400 border-t border-gray-50 pt-3">
                      Recorded by: <span className="font-medium text-gray-600">{record.recordedBy}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <IoSearchOutline size={48} className="mx-auto text-gray-300 mb-4" />
                <p>No history records found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistory;
