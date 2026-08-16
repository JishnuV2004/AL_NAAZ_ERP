import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ButtonLoader } from '../components/common/Loader';
import {
  IoPersonOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoEyeOffOutline
} from 'react-icons/io5';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.login(formData);
      navigate('/inventory');
    } catch (err) {
      console.error('[Login Screen Error]:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Left Portion (Logo and Brand) */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-[#141210] md:flex">
        <img
          src="/logo/al-naaz-mandi-logo-transparent.png"
          alt="Al Naaz Mandi Logo"
          className="w-64 h-auto object-contain mb-4 drop-shadow-lg"
        />
        {/* <h1 className="font-serif text-4xl font-bold tracking-widest text-[#1E5E45] uppercase">
          AL NAAZ
        </h1> */}
      </div>

      {/* Right Portion (Login Form) */}
      <div className="flex w-full items-center justify-center bg-white md:w-1/2 px-6 py-12 lg:px-16">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center md:text-left">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-gray-900">
              Welcome Back
            </h2>
            <p className="mt-2 font-sans text-sm font-medium text-gray-500">
              Sign in to the management portal
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">

              {/* Username/Email field */}
              <div className="relative">
                <label htmlFor="username" className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Email / Username
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <IoPersonOutline className="h-5 w-5" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your email or username"
                    className={`block w-full rounded-xl border ${errors.username ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]'
                      } bg-white py-3.5 pl-11 pr-4 font-sans text-sm text-gray-900 placeholder-brand-text-muted/65 outline-hidden transition-all`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.username}</p>
                )}
              </div>

              {/* Password field */}
              <div className="relative">
                <label htmlFor="password" className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                    <IoLockClosedOutline className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className={`block w-full rounded-xl border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus:border-[#1E5E45] focus:ring-1 focus:ring-[#1E5E45]'
                      } bg-white py-3.5 pl-11 pr-12 font-sans text-sm text-gray-900 placeholder-brand-text-muted/65 outline-hidden transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#1E5E45] focus:outline-hidden cursor-pointer"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline className="h-5 w-5" />
                    ) : (
                      <IoEyeOutline className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs font-semibold text-red-500">{errors.password}</p>
                )}
              </div>

            </div>

            {/* Submission Trigger */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-brand-brown bg-brand-gold hover:bg-brand-gold-hover shadow-lg hover:shadow-sm focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? <ButtonLoader /> : 'Sign In'}
            </button>

            <div className="mt-4 text-center text-[11px] text-gray-500">
              <p>Demo accounts:</p>
              <p className="mt-1"><span className="font-bold">admin</span> / <span className="font-bold">admin123</span> (Full Access)</p>
              <p><span className="font-bold">manager</span> / <span className="font-bold">manager123</span> (Restricted Access)</p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
