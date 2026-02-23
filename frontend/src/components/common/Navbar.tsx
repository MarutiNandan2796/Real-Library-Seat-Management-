import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('auto');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    payment: true
  });
  const [privacy, setPrivacy] = useState({
    twoFactor: true,
    profilePrivate: true,
    dataCollection: false
  });
  const [feedbackText, setFeedbackText] = useState('');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'super_admin':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Logo & Title */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-3xl drop-shadow-lg">📚</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg tracking-tight group-hover:tracking-wide transition-all duration-300">
                {title}
              </h1>
              <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full transition-all duration-500"></div>
            </div>
          </div>

          {/* Right side - User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* User Profile Card */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2.5 rounded-2xl border border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 flex items-center justify-center font-bold text-white text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {user?.name && getInitials(user.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                </div>

                {/* User Info */}
                <div className="text-left hidden md:block">
                  <p className="font-semibold text-white text-sm leading-tight">
                    {user?.name}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                      user?.role
                    )} mt-1`}
                  >
                    {user?.role === 'super_admin' ? 'Super Admin' : user?.role?.replace('_', ' ')}
                  </span>
                </div>

                {/* Dropdown Icon */}
                <svg
                  className={`w-4 h-4 text-white transition-transform duration-300 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu - Opens Downward */}
              {showUserMenu && (
                <>
                  {/* Backdrop to close menu on click outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  
                  <div className="absolute right-0 top-full mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn z-50 max-h-[80vh] overflow-y-auto backdrop-blur-md bg-opacity-95">
                  {/* Header with Profile Info */}
                  <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-6 py-6 sticky top-0 z-10 border-b-2 border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                        {user?.name && getInitials(user.name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">{user?.name}</p>
                        <p className="text-xs text-purple-100">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border-l-4 border-green-500">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Account Status</p>
                        <span className="text-sm text-green-700 font-bold">✓ Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="px-3 py-4 border-b border-gray-200 bg-white space-y-2">
                    {/* Edit Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetPath = (user?.role === 'admin' || user?.role === 'super_admin') 
                          ? '/admin/profile' 
                          : '/user/profile';
                        navigate(targetPath);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-indigo-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">✏️</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Edit Profile</p>
                        <p className="text-xs text-gray-600">Update your personal details</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>

                    {/* Theme Settings */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowThemeModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-blue-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">🎨</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Theme Settings</p>
                        <p className="text-xs text-gray-600">Customize your appearance</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>

                    {/* Notifications */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotificationModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-purple-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">🔔</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Notifications</p>
                        <p className="text-xs text-gray-600">Manage your alerts</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>

                    {/* Privacy & Security */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowPrivacyModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-green-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">🔒</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Privacy & Security</p>
                        <p className="text-xs text-gray-600">Protect your account</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>

                    {/* Activity Log */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowActivityModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-amber-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">📊</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Activity Log</p>
                        <p className="text-xs text-gray-600">View access history</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>

                    {/* Help & Feedback */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowHelpModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-pink-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">❓</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Help & Feedback</p>
                        <p className="text-xs text-gray-600">Get instant support</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>

                    {/* Change Password */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full p-4 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl transition-all flex items-center gap-3 text-left group border-l-4 border-transparent hover:border-cyan-500 shadow-sm hover:shadow-md"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">🔐</span>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">Change Password</p>
                        <p className="text-xs text-gray-600">Update your security</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all">→</span>
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="px-3 py-4 bg-gradient-to-r from-red-50/50 to-pink-50/50 border-t border-red-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        toast.success('👋 Logging out...');
                        setTimeout(() => logout(), 500);
                      }}
                      className="w-full p-4 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 hover:from-red-600 hover:via-red-700 hover:to-pink-700 text-white rounded-xl transition-all flex items-center gap-3 font-bold shadow-lg hover:shadow-2xl group transform hover:scale-105"
                    >
                      <span className="text-2xl group-hover:scale-125 transition-transform">🚪</span>
                      <div className="text-left flex-1">
                        <p className="text-sm font-bold">Logout</p>
                        <p className="text-xs text-red-100">Sign out from your account</p>
                      </div>
                      <span className="text-white group-hover:translate-x-1 transition-all">→</span>
                    </button>
                  </div>
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowThemeModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in border border-gray-200 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl animate-bounce">🎨</span> 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Theme Settings</span>
              </h3>
              <button onClick={() => setShowThemeModal(false)} className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all">✕</button>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedTheme('light')}
                className={`w-full p-4 border-2 rounded-xl transition-all text-left ${selectedTheme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-blue-300 hover:bg-blue-50'}`}>
                <p className="font-bold text-gray-900">☀️ Light Mode</p>
                <p className="text-sm text-gray-500">Bright and clean interface</p>
                {selectedTheme === 'light' && <p className="text-xs text-blue-600 mt-2">✓ Selected</p>}
              </button>
              <button 
                onClick={() => setSelectedTheme('dark')}
                className={`w-full p-4 border-2 rounded-xl transition-all text-left ${selectedTheme === 'dark' ? 'border-gray-700 bg-gray-100' : 'border-gray-300 hover:bg-gray-50'}`}>
                <p className="font-bold text-gray-900">🌙 Dark Mode</p>
                <p className="text-sm text-gray-500">Easy on the eyes at night</p>
                {selectedTheme === 'dark' && <p className="text-xs text-gray-600 mt-2">✓ Selected</p>}
              </button>
              <button 
                onClick={() => setSelectedTheme('auto')}
                className={`w-full p-4 border-2 rounded-xl transition-all text-left ${selectedTheme === 'auto' ? 'border-purple-500 bg-purple-50' : 'border-purple-300 hover:bg-purple-50'}`}>
                <p className="font-bold text-gray-900">🎭 Auto Mode</p>
                <p className="text-sm text-gray-500">Follow system settings</p>
                {selectedTheme === 'auto' && <p className="text-xs text-purple-600 mt-2">✓ Selected</p>}
              </button>
            </div>
            <button
              onClick={() => {
                setShowThemeModal(false);
                toast.success(`${selectedTheme === 'light' ? '☀️ Light' : selectedTheme === 'dark' ? '🌙 Dark' : '🎭 Auto'} theme activated!`);
              }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Apply Theme
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowNotificationModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in border border-gray-200 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl animate-bounce">🔔</span> 
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Notifications</span>
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all">✕</button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">📧 Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates via email</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.push}
                  onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">📱 Push Notifications</p>
                  <p className="text-xs text-gray-500">Mobile app notifications</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.marketing}
                  onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">📢 Marketing Emails</p>
                  <p className="text-xs text-gray-500">Promotional content</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.payment}
                  onChange={(e) => setNotifications({...notifications, payment: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">🔔 Payment Alerts</p>
                  <p className="text-xs text-gray-500">Payment reminders</p>
                </div>
              </label>
            </div>
            <button
              onClick={() => {
                setShowNotificationModal(false);
                toast.success('Notification settings saved!');
              }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Privacy & Security Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowPrivacyModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in border border-gray-200 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl animate-bounce">🔒</span>
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Privacy & Security
                </span>
              </h3>
              <button 
                onClick={() => setShowPrivacyModal(false)} 
                className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={privacy.twoFactor}
                  onChange={(e) => setPrivacy({...privacy, twoFactor: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">🔐 Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Extra security layer</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={privacy.profilePrivate}
                  onChange={(e) => setPrivacy({...privacy, profilePrivate: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">👁️ Profile Visibility</p>
                  <p className="text-xs text-gray-500">Make profile private</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={privacy.dataCollection}
                  onChange={(e) => setPrivacy({...privacy, dataCollection: e.target.checked})}
                  className="w-5 h-5" />
                <div>
                  <p className="font-semibold text-gray-900">🎯 Data Collection</p>
                  <p className="text-xs text-gray-500">Allow analytics</p>
                </div>
              </label>
            </div>
            <button
              onClick={() => {
                setShowPrivacyModal(false);
                toast.success('Privacy settings updated!');
              }}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowActivityModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in border border-gray-200 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl animate-bounce">📊</span>
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Activity Log
                </span>
              </h3>
              <button 
                onClick={() => setShowActivityModal(false)} 
                className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="font-semibold text-gray-900 text-sm">✅ Login</p>
                <p className="text-xs text-gray-600">Today at 10:30 AM</p>
                <p className="text-xs text-gray-500">Chrome on Windows</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <p className="font-semibold text-gray-900 text-sm">✏️ Profile Updated</p>
                <p className="text-xs text-gray-600">Yesterday at 3:45 PM</p>
                <p className="text-xs text-gray-500">Changed phone number</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <p className="font-semibold text-gray-900 text-sm">🔑 Password Changed</p>
                <p className="text-xs text-gray-600">2 days ago</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <p className="font-semibold text-gray-900 text-sm">💳 Payment Made</p>
                <p className="text-xs text-gray-600">3 days ago at 5:20 PM</p>
                <p className="text-xs text-gray-500">₹500 payment successful</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help & Feedback Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowHelpModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in border border-gray-200 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl animate-bounce">❓</span>
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Help & Feedback
                </span>
              </h3>
              <button onClick={() => {
                setShowHelpModal(false);
                setFeedbackText('');
              }} className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all">✕</button>
            </div>
            <div className="space-y-3 mb-6">
              <button 
                onClick={() => toast.success('📚 Opening Knowledge Base...')}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-all">
                <p className="font-semibold text-gray-900">📚 Knowledge Base</p>
                <p className="text-xs text-gray-600">Browse help articles</p>
              </button>
              <button 
                onClick={() => toast.success('💬 Chat support activated!')}
                className="w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-all">
                <p className="font-semibold text-gray-900">💬 Contact Support</p>
                <p className="text-xs text-gray-600">Chat with our team</p>
              </button>
              <button 
                onClick={() => setFeedbackText('Bug: [Describe the issue]\n\nSteps to reproduce:\n1. \n2. \n3. ')}
                className="w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-all">
                <p className="font-semibold text-gray-900">🐛 Report a Bug</p>
                <p className="text-xs text-gray-600">Help us improve</p>
              </button>
            </div>
            <textarea
              placeholder="Your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all mb-4"
              rows={3}
            />
            <button
              onClick={() => {
                if (feedbackText.trim()) {
                  setShowHelpModal(false);
                  setFeedbackText('');
                  toast.success('✅ Feedback sent! Thank you!');
                } else {
                  toast.error('Please enter your feedback');
                }
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl font-bold hover:from-pink-700 hover:to-pink-800 transition-all"
            >
              Send Feedback
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4 min-h-screen" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in border border-gray-200 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl animate-bounce">🔐</span>
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Change Password
                </span>
              </h3>
              <button onClick={() => {
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }} className="text-gray-400 hover:text-red-500 hover:rotate-90 text-3xl transition-all">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🔒 Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🔑 New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">✅ Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
                    toast.error('Please fill all fields');
                    return;
                  }
                  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                    toast.error('Passwords do not match');
                    return;
                  }
                  setIsChangingPassword(true);
                  setTimeout(() => {
                    setIsChangingPassword(false);
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    toast.success('Password changed successfully!');
                  }, 1000);
                }}
                disabled={isChangingPassword}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animated Bottom Border */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 animate-shimmer"></div>
    </nav>
  );
};

export default Navbar;
