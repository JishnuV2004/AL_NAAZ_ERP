import React, { useState } from 'react';
import { Building2, MapPin, Edit3, Save, X, CheckCircle2 } from 'lucide-react';

const Company = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Al Naaz Group',
    registrationNo: 'CR-123456789',
    incorporationDate: '2015-06-15',
    taxId: 'VAT-987654321',
    email: 'info@alnaazgroup.com',
    phone: '+91 98765 43210',
    website: 'www.alnaazgroup.com',
    address: '123 Business Avenue, Tech Park',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    zipCode: '682001'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const InputField = ({ label, name, type = "text" }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        disabled={!isEditing}
        className={`w-full px-4 py-2.5 rounded-xl border outline-none transition-all ${
          isEditing 
            ? 'border-gray-200 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 bg-white text-gray-900 shadow-sm' 
            : 'border-transparent bg-gray-50 text-gray-800 cursor-default font-medium'
        }`}
      />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your organization's master information and settings</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save size={18} /> Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2.5 rounded-xl font-medium text-white bg-gray-900 hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Form) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Building2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500">Core company registration details</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Company Name" name="companyName" />
              <InputField label="Registration Number" name="registrationNo" />
              <InputField label="Incorporation Date" name="incorporationDate" type="date" />
              <InputField label="Tax / VAT ID" name="taxId" />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Contact & Address</h2>
                <p className="text-sm text-gray-500">Primary communication and registered office</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Email Address" name="email" type="email" />
                <InputField label="Phone Number" name="phone" />
                <div className="md:col-span-2">
                  <InputField label="Website" name="website" />
                </div>
              </div>
              
              <hr className="border-gray-100" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <InputField label="Registered Address" name="address" />
                </div>
                <InputField label="City" name="city" />
                <InputField label="State / Province" name="state" />
                <InputField label="Country" name="country" />
                <InputField label="ZIP / Postal Code" name="zipCode" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Side Cards) */}
        <div className="space-y-6">
          {/* Logo & Branding */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Branding</h2>
            </div>
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-40 h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center p-6 relative group overflow-hidden">
                <img 
                  src="/logo/al-naaz-mandi-logo-transparent.png" 
                  alt="Company Logo" 
                  className="w-full h-full object-contain drop-shadow-sm"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-sm font-medium">Change Logo</span>
                  </div>
                )}
              </div>
              <h3 className="mt-5 font-serif font-bold text-xl text-gray-900">{formData.companyName}</h3>
              <p className="text-sm text-gray-500 mt-1">Official Company Logo</p>
              
              {isEditing && (
                <button className="mt-6 w-full py-2.5 rounded-xl font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                  Upload New Logo
                </button>
              )}
            </div>
          </div>

          {/* Quick Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Account Status</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
              <CheckCircle2 size={24} className="text-[#16A34A] shrink-0" />
              <div>
                <h4 className="font-bold text-[#14532D] text-sm">Active & Verified</h4>
                <p className="text-xs text-[#166534] mt-0.5">All company details are up to date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;
