import React, { useState, useEffect, useRef } from 'react';
import { IoCloseOutline, IoAlertCircleOutline } from 'react-icons/io5';

const initialForm = {
  branch: '',
  name: '',
  phone: '',
  address: '',
  designation: '',
  salary_type: 'MONTHLY',
  monthly_salary: '',
  biweekly_salary: '',
  daily_wage: '',
  joining_date: '',
  is_active: true
};

const EmployeeFormModal = ({ isOpen, onClose, mode, employeeData, accessibleBranches, onSubmit }) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && employeeData) {
        setForm({
          branch: employeeData.branch.id.toString(),
          name: employeeData.name || '',
          phone: employeeData.phone || '',
          address: employeeData.address || '',
          designation: employeeData.designation || '',
          salary_type: employeeData.salary_type || 'MONTHLY',
          monthly_salary: employeeData.monthly_salary || '',
          biweekly_salary: employeeData.biweekly_salary || '',
          daily_wage: employeeData.daily_wage || '',
          joining_date: employeeData.joining_date || '',
          is_active: employeeData.is_active !== undefined ? employeeData.is_active : true
        });
      } else {
        setForm({ ...initialForm, joining_date: new Date().toISOString().split('T')[0] });
      }
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, mode, employeeData]);

  // Trap focus and escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  const validate = () => {
    const newErrors = {};
    if (!form.branch) newErrors.branch = 'Branch is required';
    if (!form.name.trim()) newErrors.name = 'Name is required';
    
    // Basic phone validation (at least 7 digits/chars)
    if (!form.phone.trim()) newErrors.phone = 'Phone is required';
    else if (form.phone.replace(/[^0-9]/g, '').length < 7) newErrors.phone = 'Invalid phone number format';
    
    if (!form.designation.trim()) newErrors.designation = 'Designation is required';
    
    // Salary validation based on type
    if (form.salary_type === 'MONTHLY') {
      if (!form.monthly_salary) newErrors.monthly_salary = 'Monthly salary is required';
      else if (Number(form.monthly_salary) < 0) newErrors.monthly_salary = 'Cannot be negative';
    } else if (form.salary_type === 'BIWEEKLY') {
      if (!form.biweekly_salary) newErrors.biweekly_salary = 'Biweekly salary is required';
      else if (Number(form.biweekly_salary) < 0) newErrors.biweekly_salary = 'Cannot be negative';
    } else if (form.salary_type === 'DAILY') {
      if (!form.daily_wage) newErrors.daily_wage = 'Daily wage is required';
      else if (Number(form.daily_wage) < 0) newErrors.daily_wage = 'Cannot be negative';
    }

    if (!form.joining_date) {
      newErrors.joining_date = 'Joining date is required';
    } else {
      const selected = new Date(form.joining_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected > today) newErrors.joining_date = 'Joining date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error on type
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setApiError(null);
    setIsSubmitting(true);

    try {
      const selectedBranch = accessibleBranches.find(b => b.id.toString() === form.branch);
      
      const payload = {
        name: form.name.trim(),
        branch: selectedBranch ? { id: selectedBranch.id, name: selectedBranch.name } : employeeData?.branch,
        phone: form.phone.trim(),
        address: form.address.trim(),
        designation: form.designation.trim(),
        salary_type: form.salary_type,
        joining_date: form.joining_date,
        is_active: form.is_active,
        // Nullify unselected salary types
        monthly_salary: form.salary_type === 'MONTHLY' ? Number(form.monthly_salary) : null,
        biweekly_salary: form.salary_type === 'BIWEEKLY' ? Number(form.biweekly_salary) : null,
        daily_wage: form.salary_type === 'DAILY' ? Number(form.daily_wage) : null,
      };

      await onSubmit(payload);
      // Success is handled by parent (closes modal)
    } catch (err) {
      setApiError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12141C]/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div 
        className="absolute inset-0"
        onClick={() => !isSubmitting && onClose()}
      ></div>
      
      <div 
        ref={modalRef}
        className="relative bg-[#FFFFFF] rounded-2xl shadow-2xl w-full max-w-2xl my-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b border-[#E7E8EE]">
          <h2 className="font-serif text-2xl font-semibold text-[#1C1F2A]">
            {mode === 'create' ? 'Add New Employee' : 'Edit Employee'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="p-2 text-[#6B7280] hover:bg-[#F4F5F8] rounded-xl transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {apiError && (
            <div className="mb-6 p-4 bg-[#C1443A]/10 border border-[#C1443A]/20 rounded-xl flex items-start gap-3">
              <IoAlertCircleOutline className="text-[#C1443A] shrink-0 mt-0.5" size={20} />
              <div className="text-[#C1443A] text-sm font-medium">{apiError}</div>
            </div>
          )}

          <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branch */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="branch">
                  Branch <span className="text-[#C1443A]">*</span>
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 bg-white text-sm transition-colors ${
                    errors.branch ? 'border-[#C1443A] focus:border-[#C1443A] focus:ring-[#C1443A]' : 'border-[#E7E8EE] focus:border-[#C9A227] focus:ring-[#C9A227]'
                  }`}
                >
                  <option value="" disabled>Select a branch</option>
                  {accessibleBranches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                {errors.branch && <p className="mt-1 text-xs text-[#C1443A]">{errors.branch}</p>}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="name">
                  Full Name <span className="text-[#C1443A]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 bg-white text-sm transition-colors ${
                    errors.name ? 'border-[#C1443A] focus:border-[#C1443A] focus:ring-[#C1443A]' : 'border-[#E7E8EE] focus:border-[#C9A227] focus:ring-[#C9A227]'
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-[#C1443A]">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="phone">
                  Phone Number <span className="text-[#C1443A]">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="+971 50 123 4567"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 bg-white text-sm transition-colors ${
                    errors.phone ? 'border-[#C1443A] focus:border-[#C1443A] focus:ring-[#C1443A]' : 'border-[#E7E8EE] focus:border-[#C9A227] focus:ring-[#C9A227]'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-[#C1443A]">{errors.phone}</p>}
              </div>

              {/* Designation */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="designation">
                  Designation <span className="text-[#C1443A]">*</span>
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={form.designation}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="e.g. Head Chef"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 bg-white text-sm transition-colors ${
                    errors.designation ? 'border-[#C1443A] focus:border-[#C1443A] focus:ring-[#C1443A]' : 'border-[#E7E8EE] focus:border-[#C9A227] focus:ring-[#C9A227]'
                  }`}
                />
                {errors.designation && <p className="mt-1 text-xs text-[#C1443A]">{errors.designation}</p>}
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="address">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={form.address}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="Residential address"
                  className="w-full px-4 py-2.5 border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] bg-white text-sm transition-colors resize-none"
                ></textarea>
              </div>

              {/* Salary Type */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2">
                  Salary Type <span className="text-[#C1443A]">*</span>
                </label>
                <div className="flex bg-[#F4F5F8] p-1 rounded-xl border border-[#E7E8EE]">
                  {['MONTHLY', 'BIWEEKLY', 'DAILY'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, salary_type: type }));
                        setErrors(prev => ({ ...prev, monthly_salary: undefined, biweekly_salary: undefined, daily_wage: undefined }));
                      }}
                      disabled={isSubmitting}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${
                        form.salary_type === type 
                          ? 'bg-white text-[#1C1F2A] shadow-sm border border-[#E7E8EE]' 
                          : 'text-[#6B7280] hover:text-[#1C1F2A] border border-transparent'
                      }`}
                    >
                      {type.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Salary Field */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="salary_input">
                  {form.salary_type === 'MONTHLY' && 'Monthly Salary'}
                  {form.salary_type === 'BIWEEKLY' && 'Biweekly Salary'}
                  {form.salary_type === 'DAILY' && 'Daily Wage'}
                  <span className="text-[#C1443A]"> *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] font-mono text-sm">AED</span>
                  <input
                    id="salary_input"
                    name={
                      form.salary_type === 'MONTHLY' ? 'monthly_salary' :
                      form.salary_type === 'BIWEEKLY' ? 'biweekly_salary' : 'daily_wage'
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.salary_type === 'MONTHLY' ? form.monthly_salary :
                      form.salary_type === 'BIWEEKLY' ? form.biweekly_salary : form.daily_wage
                    }
                    onChange={handleChange}
                    disabled={isSubmitting}
                    placeholder="0.00"
                    className={`w-full pl-12 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 font-mono text-sm bg-white transition-colors ${
                      errors.monthly_salary || errors.biweekly_salary || errors.daily_wage
                        ? 'border-[#C1443A] focus:border-[#C1443A] focus:ring-[#C1443A]' 
                        : 'border-[#E7E8EE] focus:border-[#C9A227] focus:ring-[#C9A227]'
                    }`}
                  />
                </div>
                {(errors.monthly_salary || errors.biweekly_salary || errors.daily_wage) && (
                  <p className="mt-1 text-xs text-[#C1443A]">
                    {errors.monthly_salary || errors.biweekly_salary || errors.daily_wage}
                  </p>
                )}
              </div>

              {/* Joining Date */}
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-2" htmlFor="joining_date">
                  Joining Date <span className="text-[#C1443A]">*</span>
                </label>
                <input
                  id="joining_date"
                  name="joining_date"
                  type="date"
                  value={form.joining_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]} // Cannot be future
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-1 bg-white text-sm transition-colors ${
                    errors.joining_date ? 'border-[#C1443A] focus:border-[#C1443A] focus:ring-[#C1443A]' : 'border-[#E7E8EE] focus:border-[#C9A227] focus:ring-[#C9A227]'
                  }`}
                />
                {errors.joining_date && <p className="mt-1 text-xs text-[#C1443A]">{errors.joining_date}</p>}
              </div>

              {/* Active Toggle (visible but usually left alone) */}
              <div className="col-span-1 md:col-span-2 pt-2 border-t border-[#E7E8EE] flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-[#1C1F2A]" htmlFor="is_active">
                    Active Status
                  </label>
                  <p className="text-xs text-[#6B7280]">Is this employee currently active?</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    id="is_active" 
                    checked={form.is_active}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#E7E8EE] appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:right-0 checked:border-[#2F6F62] disabled:opacity-50"
                    style={{ right: form.is_active ? '0' : '1.5rem' }}
                  />
                  <label 
                    htmlFor="is_active" 
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${form.is_active ? 'bg-[#2F6F62]' : 'bg-[#E7E8EE]'}`}
                  ></label>
                </div>
              </div>

            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-[#E7E8EE] bg-[#F4F5F8] rounded-b-2xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-[#1C1F2A] bg-white border border-[#E7E8EE] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="employee-form"
            disabled={isSubmitting}
            className="px-6 py-2 text-sm font-semibold text-white bg-[#C9A227] rounded-lg hover:bg-[#B49122] transition-colors flex items-center gap-2 min-w-[120px] justify-center disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              mode === 'create' ? 'Add Employee' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeFormModal;
