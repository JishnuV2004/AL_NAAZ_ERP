import React, { useState, useEffect } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import { attendanceService } from '../services/attendanceService';
import { IoAddOutline, IoSearchOutline, IoTrashOutline } from 'react-icons/io5';
import Modal from '../components/common/Modal';
import { PageLoader, ButtonLoader } from '../components/common/Loader';

const Attendance = () => {
  const staff = useAttendanceStore((state) => state.staff);
  const attendanceLogs = useAttendanceStore((state) => state.attendanceLogs);
  const loading = useAttendanceStore((state) => state.loading);
  const todayStr = new Date().toISOString().split('T')[0];

  const stats = React.useMemo(() => {
    const logs = attendanceLogs[todayStr] || {};
    const totalStaff = staff.length;
    let presentToday = 0;
    let onLeave = 0;
    let absentToday = 0;

    staff.forEach((s) => {
      const status = logs[s.id] || 'P';
      if (status === 'P') presentToday++;
      else if (status === 'L') onLeave++;
      else if (status === 'A') absentToday++;
    });

    return {
      totalStaff,
      presentToday,
      onLeave,
      absentToday
    };
  }, [staff, attendanceLogs, todayStr]);


  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', role: 'Front Desk', baseSalary: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    attendanceService.fetchStaff();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Staff name is required';
    if (!formData.baseSalary || Number(formData.baseSalary) <= 0) {
      errors.baseSalary = 'Invalid base salary amount';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await attendanceService.addStaff(formData);
      setIsModalOpen(false);
      setFormData({ name: '', role: 'Front Desk', baseSalary: '' });
    } catch (err) {
      console.error('[Add Staff Error]:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this employee?')) {
      try {
        await attendanceService.deleteStaff(id);
      } catch (err) {
        console.error('[Delete Staff Error]:', err);
      }
    }
  };

  const handleStatusChange = async (staffId, status) => {
    try {
      await attendanceService.markAttendance(todayStr, staffId, status);
    } catch (err) {
      console.error('[Mark Attendance Error]:', err);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredStaff = staff.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(term) || s.role.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-8">
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Staff */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Total Staff</span>
          <p className="mt-2 font-serif text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
          <span className="mt-1 block text-xs text-gray-500">Active employees</span>
        </div>

        {/* Present Today */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Present Today</span>
          <p className="mt-2 font-serif text-3xl font-bold text-green-600">{stats.presentToday}</p>
          <span className="mt-1 block text-xs text-gray-500">Logged in service</span>
        </div>

        {/* On Leave */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">On Leave</span>
          <p className="mt-2 font-serif text-3xl font-bold text-amber-600">{stats.onLeave}</p>
          <span className="mt-1 block text-xs text-gray-500">Approved time off</span>
        </div>

        {/* Absent */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all hover:shadow-lg">
          <span className="absolute top-3 right-3 text-[#1E5E45]/40">✦</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Absent</span>
          <p className="mt-2 font-serif text-3xl font-bold text-red-600">{stats.absentToday}</p>
          <span className="mt-1 block text-xs text-gray-500">No-shows today</span>
        </div>
      </div>

      {/* 2. Controls header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
            <IoSearchOutline className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Search staff or role..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 font-sans text-sm text-gray-900 outline-hidden focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]"
          />
        </div>

        {/* Add Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 rounded-xl bg-[#1E5E45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5E45]-hover transition-colors shadow-md hover:shadow-sm cursor-pointer"
        >
          <IoAddOutline className="h-5 w-5" />
          <span>Add Staff</span>
        </button>
      </div>

      {/* 3. Staff list table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : filteredStaff.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 space-y-2">
            <span className="text-4xl">👥</span>
            <p className="font-semibold text-sm">No employees found</p>
            <p className="text-xs">Try adjusting your search criteria or register a new staff member.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead className="bg-gray-100-dark/50 text-[10px] font-bold tracking-widest text-gray-900 uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Today's Attendance</th>
                  <th className="px-6 py-4 text-center">Days Present</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.map((member) => {
                  const todayLog = attendanceLogs[todayStr]?.[member.id] || 'P'; // default Present
                  return (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {/* Circle initials avatar */}
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E5E45]-light text-gray-900 font-bold text-xs select-none">
                            {getInitials(member.name)}
                          </div>
                          <span className="font-bold text-gray-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">{member.role}</td>
                      <td className="px-6 py-4">
                        {/* Attendance Toggle Buttons */}
                        <div className="flex justify-center items-center space-x-2">
                          {/* Present (P) */}
                          <button
                            onClick={() => handleStatusChange(member.id, 'P')}
                            className={`h-8 w-8 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                              todayLog === 'P'
                                ? 'bg-green-100 border-green-500 text-green-700 font-bold shadow-xs'
                                : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-100-dark'
                            }`}
                            title="Present"
                          >
                            P
                          </button>
                          {/* Absent (A) */}
                          <button
                            onClick={() => handleStatusChange(member.id, 'A')}
                            className={`h-8 w-8 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                              todayLog === 'A'
                                ? 'bg-red-100 border-red-500 text-red-700 font-bold shadow-xs'
                                : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-100-dark'
                            }`}
                            title="Absent"
                          >
                            A
                          </button>
                          {/* Leave (L) */}
                          <button
                            onClick={() => handleStatusChange(member.id, 'L')}
                            className={`h-8 w-8 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                              todayLog === 'L'
                                ? 'bg-amber-100 border-amber-500 text-amber-700 font-bold shadow-xs'
                                : 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-100-dark'
                            }`}
                            title="On Leave"
                          >
                            L
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-900">
                        {member.daysPresent} / {member.totalDays}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Employee"
                        >
                          <IoTrashOutline className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Add Staff Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Employee">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full rounded-xl border ${formErrors.name ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]`}
              placeholder="e.g. Ahmed Khalifa"
            />
            {formErrors.name && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.name}</p>}
          </div>

          {/* Role & Base Salary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Staff Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]"
              >
                <option>Front Desk</option>
                <option>Housekeeping</option>
                <option>Kitchen Staff</option>
                <option>Security</option>
                <option>Management</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                Base Salary (₹/mo)
              </label>
              <input
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full rounded-xl border ${formErrors.baseSalary ? 'border-red-500' : 'border-gray-200'} bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-hidden focus:border-[#1E5E45]`}
                placeholder="e.g. 25000"
                min="1"
              />
              {formErrors.baseSalary && <p className="mt-1 text-xs font-semibold text-red-500">{formErrors.baseSalary}</p>}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100-dark transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#1E5E45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E5E45]-hover transition-colors shadow-md hover:shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <ButtonLoader /> : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
