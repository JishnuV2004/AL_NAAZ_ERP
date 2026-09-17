import React, { useEffect } from 'react';
import { IoCloseOutline, IoPencilOutline } from 'react-icons/io5';
import EmployeeDocuments from './EmployeeDocuments';

const EmployeeDetailsDrawer = ({ isOpen, onClose, employee, onEdit }) => {
  // Trap focus and escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // Prevent body scroll when drawer is open
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[#12141C]/40 backdrop-blur-sm transition-opacity duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-[#F4F5F8] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white border-b border-[#E7E8EE] px-6 py-5 flex flex-col gap-3 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-serif text-2xl font-semibold text-[#1C1F2A]">{employee.name}</h2>
                <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  employee.is_active 
                    ? 'bg-[#2F6F62]/10 text-[#2F6F62]' 
                    : 'bg-[#C1443A]/10 text-[#C1443A]'
                }`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-[#6B7280] font-medium">{employee.designation}</p>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <IoCloseOutline size={24} />
            </button>
          </div>
          
          <div className="flex justify-start">
            <button 
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              className="px-4 py-1.5 text-sm font-semibold text-[#1C1F2A] bg-white border border-[#E7E8EE] rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <IoPencilOutline size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white border border-[#E7E8EE] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#1C1F2A] mb-2 border-b border-[#E7E8EE] pb-2">Profile Information</h3>
            
            <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
              <div className="text-[#6B7280]">Employee ID:</div>
              <div className="font-medium text-[#1C1F2A]">{employee.id}</div>
              
              <div className="text-[#6B7280]">Branch:</div>
              <div className="font-medium text-[#1C1F2A]">{employee.branch.name}</div>
              
              <div className="text-[#6B7280]">Phone:</div>
              <div className="text-[#1C1F2A]">{employee.phone}</div>
              
              <div className="text-[#6B7280]">Address:</div>
              <div className="text-[#1C1F2A]">{employee.address || <span className="text-gray-400 italic">Not provided</span>}</div>
              
              <div className="text-[#6B7280]">Joined:</div>
              <div className="text-[#1C1F2A]">{new Date(employee.joining_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E8EE] rounded-2xl p-5 shadow-sm mt-6 space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#1C1F2A] mb-2 border-b border-[#E7E8EE] pb-2">Salary Configuration</h3>
            
            <div className="grid grid-cols-[110px_1fr] gap-y-3 gap-x-4 text-sm">
              <div className="text-[#6B7280]">Salary Type:</div>
              <div className="font-semibold text-[#1C1F2A] capitalize">{employee.salary_type.toLowerCase()}</div>
              
              <div className="text-[#6B7280]">Amount:</div>
              <div className="font-mono text-[#1C1F2A] font-medium">
                {employee.salary_type === 'MONTHLY' && employee.monthly_salary ? `₹${employee.monthly_salary.toLocaleString()}` :
                 employee.salary_type === 'BIWEEKLY' && employee.biweekly_salary ? `₹${employee.biweekly_salary.toLocaleString()}` :
                 employee.salary_type === 'DAILY' && employee.daily_wage ? `₹${employee.daily_wage.toLocaleString()}` :
                 <span className="text-red-500 italic">Not configured</span>
                }
              </div>
            </div>
            <p className="text-[10px] text-[#6B7280] leading-tight pt-1">
              Note: This is the raw configuration data. Actual payroll processing and deductions are handled in the Payroll module.
            </p>
          </div>

          <EmployeeDocuments employeeId={employee.id} />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsDrawer;
