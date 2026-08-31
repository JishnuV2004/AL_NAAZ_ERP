import React, { useState } from 'react';
import { Settings, Clock, CreditCard, Save, MapPin, Building, ChevronDown, Check } from 'lucide-react';

const mockBranches = [
  { id: 'global', name: 'Global Default Settings' },
  { id: 1, name: 'Kochi Main' },
  { id: 2, name: 'Calicut Center' },
  { id: 3, name: 'Trivandrum South' }
];

const TABS = [
  { id: 'general', label: 'General Info', icon: Building },
  { id: 'hours', label: 'Operating Hours', icon: Clock },
  { id: 'billing', label: 'Billing & POS', icon: CreditCard },
  { id: 'tax', label: 'Tax Configuration', icon: Settings },
];

const BranchSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [selectedBranch, setSelectedBranch] = useState(mockBranches[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Branch Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure operational parameters and system defaults</p>
        </div>
        
        {/* Branch Selector */}
        <div className="relative z-20">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm min-w-[240px] text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Target Config</span>
              <span className="block text-sm font-bold text-gray-900">{selectedBranch.name}</span>
            </div>
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 right-0 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {mockBranches.map(branch => (
                <button
                  key={branch.id}
                  onClick={() => {
                    setSelectedBranch(branch);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-gray-50 transition-colors ${selectedBranch.id === branch.id ? 'bg-gray-50/50' : ''}`}
                >
                  <span className={`font-medium ${selectedBranch.id === branch.id ? 'text-gray-900' : 'text-gray-700'}`}>{branch.name}</span>
                  {selectedBranch.id === branch.id && <Check size={16} className="text-gray-900" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Vertical Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-col gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                    isActive 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content area */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Applying to: <strong className="text-gray-700">{selectedBranch.name}</strong>
                </p>
              </div>
              <button className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm">
                <Save size={16} /> Save Changes
              </button>
            </div>

            {/* Dynamic Content based on tab */}
            <div className="p-6">
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Internal Branch Code</label>
                      <input type="text" defaultValue="KOC-01" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Contact Number (Public)</label>
                      <input type="text" defaultValue="+91 98765 11111" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium transition-all" />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Full Address</label>
                      <textarea rows={3} defaultValue="Edappally, Kochi, Kerala 682024" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium resize-none transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hours' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="w-32 font-medium text-gray-700">{day}</div>
                      <div className="flex items-center gap-3">
                        <input type="time" defaultValue="11:00" className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-gray-900 bg-white" />
                        <span className="text-gray-400 font-medium">to</span>
                        <input type="time" defaultValue="23:30" className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium outline-none focus:border-gray-900 bg-white" />
                      </div>
                      <div className="sm:ml-auto">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-gray-900 border-gray-300 focus:ring-gray-900" />
                          <span className="text-sm font-medium text-gray-600">Open</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Default Currency</label>
                      <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium transition-all">
                        <option>INR (₹)</option>
                        <option>AED (د.إ)</option>
                        <option>USD ($)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Receipt Prefix</label>
                      <input type="text" defaultValue="ALN-KOC-" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium transition-all" />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">Receipt Footer Text</label>
                      <textarea rows={2} defaultValue="Thank you for dining with Al Naaz Mandi! Please visit again." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium resize-none transition-all" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tax' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h3 className="font-bold text-gray-900">Tax Inclusive Pricing</h3>
                      <p className="text-sm text-gray-500">Are menu prices shown inclusive of tax?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">CGST (%)</label>
                      <input type="number" defaultValue="2.5" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-gray-700">SGST (%)</label>
                      <input type="number" defaultValue="2.5" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 font-medium transition-all" />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchSettings;
