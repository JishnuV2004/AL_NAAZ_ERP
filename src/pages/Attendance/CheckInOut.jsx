import React, { useState, useEffect } from 'react';
import { IoTimeOutline, IoLocationOutline, IoDocumentTextOutline, IoLogInOutline, IoLogOutOutline, IoSearchOutline } from 'react-icons/io5';
import { staffMembers, recentPunchesMock } from '../../mocks/attendance.mock';

const CheckInOut = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [punchNote, setPunchNote] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = (type) => {
    // Mock action
    alert(`Mock: ${type} successful for ${selectedEmployee || 'selected employee'}`);
    setSelectedEmployee('');
    setPunchNote('');
  };

  const getAvatarColor = (name) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#1C1F2A]">Check In / Out</h1>
        <p className="text-[#6B7280] mt-1">Manual punch entry and real-time activity log.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Manual Entry & Live Clock */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Clock Card */}
          <div className="bg-[#1C1F2A] rounded-2xl p-8 text-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
            <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[#C9A227]/20 rounded-full blur-xl"></div>
            
            <p className="text-[#94A3B8] font-medium tracking-wide uppercase text-sm mb-2 relative z-10">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-tight relative z-10 mb-2">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#2F6F62]/20 text-[#3bdf6c] rounded-full text-xs font-semibold relative z-10 border border-[#2F6F62]/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3bdf6c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3bdf6c]"></span>
              </span>
              System Online
            </div>
          </div>

          {/* Manual Entry Form */}
          <div className="bg-white rounded-2xl border border-[#E7E8EE] shadow-sm p-6">
            <h3 className="font-serif text-lg font-bold text-[#1C1F2A] mb-4 border-b border-[#E7E8EE] pb-3">Manual Entry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-1.5">Select Employee *</label>
                <select 
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F4F5F8] border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-[#1C1F2A]"
                >
                  <option value="" disabled>Choose staff member...</option>
                  {staffMembers.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-1.5">Date & Time (Override)</label>
                <div className="flex gap-2">
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-1/2 px-3 py-2 bg-[#F4F5F8] border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-[#1C1F2A]" />
                  <input type="time" defaultValue={currentTime.toTimeString().substring(0,5)} className="w-1/2 px-3 py-2 bg-[#F4F5F8] border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-[#1C1F2A]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1F2A] mb-1.5">Note / Reason</label>
                <textarea 
                  value={punchNote}
                  onChange={(e) => setPunchNote(e.target.value)}
                  placeholder="e.g. Forgot ID card, Manager approved late entry..."
                  rows="2"
                  className="w-full px-4 py-2 bg-[#F4F5F8] border border-[#E7E8EE] rounded-xl focus:outline-none focus:border-[#C9A227] text-sm text-[#1C1F2A] resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => handlePunch('Check-In')}
                  disabled={!selectedEmployee}
                  className="flex items-center justify-center gap-2 py-2.5 bg-[#2F6F62] text-white rounded-xl font-semibold hover:bg-[#235349] transition-colors disabled:opacity-50"
                >
                  <IoLogInOutline size={20} /> Check In
                </button>
                <button 
                  onClick={() => handlePunch('Check-Out')}
                  disabled={!selectedEmployee}
                  className="flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E7E8EE] text-[#1C1F2A] rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <IoLogOutOutline size={20} /> Check Out
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E7E8EE] shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-[#E7E8EE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-serif text-xl font-bold text-[#1C1F2A]">Recent Activity</h3>
              <div className="relative w-full sm:w-64">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-[#F4F5F8] border border-[#E7E8EE] rounded-lg focus:outline-none focus:border-[#C9A227] text-sm text-[#1C1F2A]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <div className="divide-y divide-[#E7E8EE]">
                {recentPunchesMock.map(punch => (
                  <div key={punch.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                    <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[200px]">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border border-white shrink-0 ${getAvatarColor(punch.employeeName)}`}>
                        {getInitials(punch.employeeName)}
                      </div>
                      <div className="font-semibold text-[#1C1F2A] truncate">{punch.employeeName}</div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                      <div className="flex items-center gap-1.5 text-sm">
                        {punch.type === 'Check-In' ? (
                          <span className="flex items-center text-[#2F6F62] font-semibold"><IoLogInOutline className="mr-1" size={16}/> In</span>
                        ) : (
                          <span className="flex items-center text-[#6B7280] font-semibold"><IoLogOutOutline className="mr-1" size={16}/> Out</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#1C1F2A] font-medium">
                        <IoTimeOutline className="text-[#6B7280]" /> {punch.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#6B7280] truncate">
                        <IoLocationOutline /> {punch.location}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-[#6B7280] truncate">
                        {punch.note && <><IoDocumentTextOutline /> {punch.note}</>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-[#E7E8EE] bg-gray-50 text-center rounded-b-2xl">
              <button className="text-sm font-semibold text-[#C9A227] hover:text-[#B49122]">View All Logs →</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckInOut;
