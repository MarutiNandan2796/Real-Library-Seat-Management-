import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/user');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen automatically via useEffect
    } catch (error) {
      // Error toast shown in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Animated Particles */}
        {[...Array(20)].map((_, i) => (
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

      <div className="max-w-6xl w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block text-white space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 mb-6 animate-bounce-slow">
              <span className="text-6xl">🛡️</span>
            </div>
            <h1 className="text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              Admin Control Center
            </h1>
            <p className="text-xl text-blue-200 font-medium">
              Secure access to your administrative dashboard with advanced security protocols
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:translate-x-2 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🔐</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Enhanced Security</h3>
                  <p className="text-blue-200 text-sm">Multi-layer authentication & encrypted sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:translate-x-2 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Real-time Monitoring</h3>
                  <p className="text-blue-200 text-sm">Live dashboard with instant updates & analytics</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:translate-x-2 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Advanced Analytics</h3>
                  <p className="text-blue-200 text-sm">Comprehensive reports & data visualization tools</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all transform hover:translate-x-2 group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">Full System Control</h3>
                  <p className="text-blue-200 text-sm">Manage users, settings, and configurations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-lg px-4 py-2 rounded-full border border-green-500/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-200 text-sm font-semibold">System Secure</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-lg px-4 py-2 rounded-full border border-blue-500/30">
              <span className="text-blue-200 text-sm font-semibold">🔒 SSL Encrypted</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative">
          {/* Mobile Logo (visible only on mobile) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl mb-4 border border-white/20">
              <span className="text-5xl">🛡️</span>
            </div>
            <h1 className="text-4xl font-black text-white mb-2">Admin Portal</h1>
            <p className="text-blue-200">Secure Administrative Access</p>
          </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 transform hover:scale-[1.01] transition-all duration-300">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Administrator Login</h2>
            <p className="text-gray-600 font-medium">Enter your credentials to access the control panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>✉️</span> Admin Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium bg-white group-hover:border-gray-300"
                  placeholder="admin@library.com"
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="w-2 h-2 bg-green-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                <span>🔒</span> Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 font-medium bg-white group-hover:border-gray-300"
                  placeholder="Enter your secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <span className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline"
              >
                Forgot Password? 🔑
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:-translate-y-0.5 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Access Admin Portal
                    <span>→</span>
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">Security Notice</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your session is protected with end-to-end encryption. All activities are logged for security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Create Account & User Login Links */}
          <div className="mt-6 space-y-3">
            {/* Setup Super Admin */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                First time setup?{' '}
                <Link
                  to="/super-admin-setup"
                  className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors hover:underline inline-flex items-center gap-1"
                >
                  <span>👑</span>
                  Become Super Admin
                </Link>
              </p>
            </div>

            {/* Create Admin Account */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Need an admin account?{' '}
                <Link
                  to="/admin-signup"
                  className="text-purple-600 font-bold hover:text-purple-700 transition-colors hover:underline inline-flex items-center gap-1"
                >
                  <span>➕</span>
                  Create Admin Account
                </Link>
              </p>
            </div>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-400">or</span>
              </div>
            </div>

            {/* User Login */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Not an administrator?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors hover:underline inline-flex items-center gap-1"
                >
                  <span>👤</span>
                  Switch to User Login
                </Link>
              </p>
            </div>
          </div>
        </div>

          {/* Trust Indicators */}
          <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
              <span className="text-green-400">✓</span>
              <span className="text-white text-xs font-semibold">Secure Connection</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
              <span className="text-blue-400">🔐</span>
              <span className="text-white text-xs font-semibold">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full border border-white/20">
              <span className="text-purple-400">⚡</span>
              <span className="text-white text-xs font-semibold">Active Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/60 text-sm font-medium">
          © 2026 Library Management System - Admin Portal v2.0
        </p>
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
        
        .bg-pos-0 {
          background-position: 0% 50%;
        }
        
        .bg-pos-100 {
          background-position: 100% 50%;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
