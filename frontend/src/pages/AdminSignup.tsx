import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSignup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    adminCode: '' // Special code to verify admin signup
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Password validation
  const passwordRequirements = {
    length: formData.password.length >= 8,
    number: /\d/.test(formData.password),
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    special: /[!@#$%^&*]/.test(formData.password)
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRequirementsMet) {
      toast.error('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register-admin', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        adminCode: formData.adminCode
      });

      toast.success('Admin request submitted! Waiting for Super Admin approval.');
      setTimeout(() => {
        navigate('/admin-login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl shadow-2xl mb-4 border border-white/20 animate-bounce-slow">
            <span className="text-5xl">🛡️</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2">Create Admin Account</h1>
          <p className="text-purple-200 text-lg font-medium">Register as an administrator</p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">➕</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Administrator Registration</h2>
            <p className="text-gray-600 font-medium">Fill in your details to create an admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>👤</span> Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                  placeholder="John Doe"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>📱</span> Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>✉️</span> Admin Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                placeholder="admin@library.com"
              />
            </div>

            {/* Admin Code */}
            <div className="space-y-2">
              <label htmlFor="adminCode" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>🔑</span> Admin Authorization Code
              </label>
              <input
                id="adminCode"
                name="adminCode"
                type="text"
                required
                value={formData.adminCode}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                placeholder="Enter admin authorization code"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ You need a special authorization code to create an admin account
              </p>
            </div>
            {/* Approval Notice */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Approval Required</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Your admin request will be pending until the Super Admin reviews and approves your account. You'll be able to login once approved.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>🔒</span> Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-lg">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>🔐</span> Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-lg">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>🔐</span> Password Requirements
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries({
                  length: 'At least 8 characters',
                  uppercase: 'One uppercase letter',
                  lowercase: 'One lowercase letter',
                  number: 'One number',
                  special: 'One special character (!@#$%^&*)'
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className={passwordRequirements[key as keyof typeof passwordRequirements] ? 'text-green-500' : 'text-gray-400'}>
                      {passwordRequirements[key as keyof typeof passwordRequirements] ? '✅' : '⭕'}
                    </span>
                    <span className={passwordRequirements[key as keyof typeof passwordRequirements] ? 'text-green-700 font-semibold' : 'text-gray-600'}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className={`p-3 rounded-xl ${passwordsMatch ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <p className={`text-sm font-semibold ${passwordsMatch ? 'text-green-700' : 'text-red-700'}`}>
                  {passwordsMatch ? '✅ Passwords match!' : '❌ Passwords do not match'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-size-200 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:-translate-y-0.5 relative overflow-hidden group"
            >
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Create Admin Account
                    <span>→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Login Links */}
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600 font-bold">Already have an account?</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6">
              <Link
                to="/admin-login"
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors hover:underline inline-flex items-center gap-1"
              >
                <span>🔐</span>
                Admin Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/login"
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors hover:underline inline-flex items-center gap-1"
              >
                <span>👤</span>
                User Login
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
            <span className="text-green-400">✓</span>
            <span className="text-white text-xs font-semibold">Secure Registration</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
            <span className="text-purple-400">🔐</span>
            <span className="text-white text-xs font-semibold">Encrypted Data</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .bg-size-200 {
          background-size: 200%;
        }
      `}</style>
    </div>
  );
};

export default AdminSignup;
