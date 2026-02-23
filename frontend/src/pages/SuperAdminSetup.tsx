import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const SuperAdminSetup: React.FC = () => {
  const [step, setStep] = useState<'check' | 'request' | 'verify'>('check');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [passwordRules, setPasswordRules] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/check-superadmin');
      if (response.data.exists) {
        toast.error('Super Admin already exists!');
        navigate('/admin-login');
      } else {
        setStep('request');
      }
    } catch (error) {
      console.error('Check error:', error);
      setStep('request');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time password validation
    if (name === 'password') {
      setPasswordRules({
        minLength: value.length >= 10,
        hasUppercase: /[A-Z]/.test(value),
        hasLowercase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[@$!%*?&#]/.test(value),
      });
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordRules).every(rule => rule);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    // Validate password strength
    if (!isPasswordValid()) {
      toast.error('Password does not meet all requirements');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/request-superadmin', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });

      toast.success(response.data.message || 'OTP sent successfully!');
      
      // Store OTP if provided (development mode)
      if (response.data.data?.otp) {
        setGeneratedOTP(response.data.data.otp);
      }
      
      setStep('verify');
    } catch (error: any) {
      console.error('OTP Request Error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-superadmin', {
        email: formData.email,
        otp: formData.otp,
        name: formData.name,
        phone: formData.phone,
        password: formData.password
      });

      // Save token
      localStorage.setItem('token', response.data.data.token);
      
      toast.success('Super Admin account created successfully!');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl shadow-2xl mb-6 animate-bounce-slow">
            <span className="text-6xl">👑</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-3 bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 bg-clip-text text-transparent">
            Setup Super Admin
          </h1>
          <p className="text-purple-200 text-lg font-medium">
            Create the first administrator account for your system
          </p>
        </div>

        {step === 'request' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Enter Your Details</h2>
              <p className="text-gray-600 font-medium">We'll send an OTP to verify your identity</p>
            </div>

            <form onSubmit={handleRequestOTP} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>👤</span> Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>📱</span> Phone Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                    placeholder="1234567890"
                  />
                  <p className="text-xs text-gray-500 mt-1">📱 Must be exactly 10 digits</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>✉️</span> Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                  placeholder="owner@library.com"
                />
                <p className="text-xs text-gray-500 mt-1">📧 Use a valid business or personal email</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>🔒</span> Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 font-medium"
                      placeholder="Min 10 characters with rules"
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

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                    <span>🔐</span> Confirm Password
                  </label>
                  <div className="relative">
                    <input
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
                  {formData.confirmPassword && (
                    <p className={`text-xs mt-1 ${
                      formData.password === formData.confirmPassword 
                        ? 'text-green-600 font-semibold' 
                        : 'text-red-600'
                    }`}>
                      {formData.password === formData.confirmPassword 
                        ? '✅ Passwords match' 
                        : '❌ Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Rules */}
              {formData.password && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    🔐 Password Requirements:
                  </p>
                  <div className="space-y-2">
                    <div className={`flex items-center text-sm font-medium ${
                      passwordRules.minLength ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span className="mr-2 text-lg">{passwordRules.minLength ? '✅' : '⭕'}</span>
                      At least 10 characters
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      passwordRules.hasUppercase ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span className="mr-2 text-lg">{passwordRules.hasUppercase ? '✅' : '⭕'}</span>
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      passwordRules.hasLowercase ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span className="mr-2 text-lg">{passwordRules.hasLowercase ? '✅' : '⭕'}</span>
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      passwordRules.hasNumber ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span className="mr-2 text-lg">{passwordRules.hasNumber ? '✅' : '⭕'}</span>
                      One number (0-9)
                    </div>
                    <div className={`flex items-center text-sm font-medium ${
                      passwordRules.hasSpecialChar ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <span className="mr-2 text-lg">{passwordRules.hasSpecialChar ? '✅' : '⭕'}</span>
                      One special character (@$!%*?&#)
                    </div>
                  </div>
                  {isPasswordValid() && (
                    <div className="mt-3 pt-3 border-t-2 border-purple-300">
                      <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                        ✨ Strong password created!
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">Important!</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      You will receive a 6-digit OTP to verify your identity. This is a one-time setup to create the first Super Admin account.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>📧</span>
                    Send OTP to Email
                    <span>→</span>
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {step === 'verify' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-gray-600 font-medium">Enter the 6-digit code sent to {formData.email}</p>
            </div>

            {/* Demo OTP Display */}
            {generatedOTP && (
              <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900 mb-1">🎯 Demo OTP (Development Only)</p>
                    <p className="text-xs text-gray-600">In production, this will be sent to your email</p>
                  </div>
                  <div className="bg-white px-6 py-3 rounded-lg border-2 border-yellow-400">
                    <span className="text-2xl font-black text-gray-900 tracking-wider">{generatedOTP}</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                  <span>🔢</span> Enter OTP
                </label>
                <input
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all text-gray-900 font-bold text-2xl text-center tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">OTP Expires in 10 Minutes</h4>
                    <p className="text-xs text-gray-600">
                      Didn't receive OTP? Check your spam folder or try again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold text-lg hover:bg-gray-300 transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || formData.otp.length !== 6}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✅</span>
                      Create Super Admin
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
            <span className="text-yellow-400">👑</span>
            <span className="text-white text-xs font-semibold">One-Time Setup</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
            <span className="text-green-400">✓</span>
            <span className="text-white text-xs font-semibold">OTP Verified</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
            <span className="text-blue-400">🔐</span>
            <span className="text-white text-xs font-semibold">Secure Setup</span>
          </div>
        </div>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
};

export default SuperAdminSetup;
