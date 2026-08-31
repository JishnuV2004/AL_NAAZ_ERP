import React, { useState, useEffect, useCallback } from 'react';
import { IoArrowBackOutline, IoSearchOutline, IoWarningOutline } from 'react-icons/io5';
import { getEmployees } from '../../api/employees.api';
import IdentityProofManager from '../../components/employees/EmployeeDocuments';

const EmployeeDocumentsPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for view swapping
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Fetch all active/inactive employees across all branches for the grid
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setApiError(err.message || 'Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to generate a background color based on name initials
  const getAvatarColor = (name) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // --- RENDER INLINE DETAIL VIEW ---
  if (selectedEmployee) {
    const emp = selectedEmployee;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4 border-b border-[#E7E8EE] pb-4">
          <button 
            onClick={() => setSelectedEmployee(null)}
            className="p-2 bg-white border border-[#E7E8EE] rounded-xl text-[#6B7280] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <IoArrowBackOutline size={20} />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1C1F2A]">Employee Details</h1>
            <p className="text-[#6B7280] text-sm">Read-only profile information and identity documents.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E8EE] shadow-sm overflow-hidden">
          {/* Header Profile Section */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-[#E7E8EE] bg-gradient-to-br from-gray-50 to-white">
            <div className="relative">
              <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md ${getAvatarColor(emp.name)}`}>
                {getInitials(emp.name)}
              </div>
              <div className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-white ${emp.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-[#1C1F2A] mb-1">{emp.name}</h2>
              <p className="text-[#C9A227] font-medium text-lg mb-4">{emp.designation}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#6B7280]">
                <div>
                  <span className="block text-xs uppercase tracking-wider font-semibold mb-1">Branch</span>
                  <span className="font-medium text-[#1C1F2A]">{emp.branch.name}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider font-semibold mb-1">Phone</span>
                  <span className="font-medium text-[#1C1F2A]">{emp.phone}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider font-semibold mb-1">Joined</span>
                  <span className="font-medium text-[#1C1F2A]">{new Date(emp.joining_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div>
                  <span className="block text-xs uppercase tracking-wider font-semibold mb-1">Salary Type</span>
                  <span className="font-medium text-[#1C1F2A] capitalize">{emp.salary_type.toLowerCase()}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-dashed border-[#E7E8EE]">
                <span className="block text-xs uppercase tracking-wider font-semibold mb-1 text-[#6B7280]">Address</span>
                <span className="font-medium text-[#1C1F2A]">{emp.address || 'Not provided'}</span>
              </div>
            </div>
          </div>
          
          {/* Identity Proof Integration */}
          <div className="p-6 sm:p-8 bg-white">
            <h3 className="font-serif text-xl font-bold text-[#1C1F2A] mb-2 border-l-4 border-[#C9A227] pl-3">Identity Proofs</h3>
            <p className="text-sm text-[#6B7280] mb-6">Manage official identification documents. Personal details above are strictly read-only on this page.</p>
            
            {/* The existing robust component */}
            <div className="-mt-8">
              <IdentityProofManager employeeId={emp.id} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER GRID VIEW ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1C1F2A]">Employee Documents</h1>
          <p className="text-[#6B7280] mt-1">Select an employee to manage their identity proofs.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={18} />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] shadow-sm"
          />
        </div>
      </div>

      {apiError && (
        <div className="p-4 bg-[#C1443A]/10 border border-[#C1443A]/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#C1443A]">
            <IoWarningOutline size={24} />
            <span className="font-medium">{apiError}</span>
          </div>
          <button 
            onClick={fetchEmployees}
            className="px-4 py-1.5 bg-white text-[#C1443A] font-semibold rounded-lg border border-[#C1443A]/20 hover:bg-[#C1443A]/5 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E7E8EE] flex items-center gap-4 animate-pulse">
              <div className="h-16 w-16 bg-gray-200 rounded-full shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredEmployees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((emp) => (
            <div 
              key={emp.id} 
              className="bg-white rounded-2xl p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-[#E7E8EE] hover:shadow-lg transition-all flex items-center gap-5 group"
            >
              <div className="relative shrink-0">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm ${getAvatarColor(emp.name)}`}>
                  {getInitials(emp.name)}
                </div>
                {/* Status Dot */}
                <div className={`absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${emp.is_active ? 'bg-[#3bdf6c]' : 'bg-gray-400'}`}></div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-[#1C1F2A] truncate text-base">{emp.name}</h3>
                <p className="text-[#9ca3af] text-xs truncate mb-2">{emp.designation}</p>
                <button 
                  onClick={() => setSelectedEmployee(emp)}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors inline-block"
                >
                  View profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 flex flex-col items-center justify-center text-center border border-[#E7E8EE]">
          <h3 className="text-[#1C1F2A] font-semibold text-xl mb-2">No employees found</h3>
          <p className="text-[#6B7280]">Try adjusting your search to see more results.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocumentsPage;
