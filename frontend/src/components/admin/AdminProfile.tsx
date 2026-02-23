import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Card from '../common/Card';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface AdminData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  joiningDate: string;
}

const AdminProfile: React.FC = () => {
  const { user: _authUser, logout } = useAuth();
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [theme, setTheme] = useState('auto');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    paymentAlerts: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    profileVisibility: true,
    dataCollection: false,
  });
  const activityLog = [
    { id: 1, action: 'Login', time: 'Today at 9:00 AM', device: 'Chrome on Windows', details: '', color: 'blue' },
    { id: 2, action: 'Added New User', time: 'Yesterday at 2:30 PM', device: '', details: 'Created user account for John Doe', color: 'green' },
    { id: 3, action: 'Updated Settings', time: '2 days ago', device: '', details: 'Modified library hours', color: 'yellow' },
    { id: 4, action: 'Approved Payment', time: '3 days ago at 4:15 PM', device: '', details: '₹1500 payment approved', color: 'purple' },
  ];
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data;
      setAdmin(data);
      setEditForm({ 
        name: data.name, 
        phone: data.phone,
        email: data.email
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/admin/profile',
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/admin/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, [theme]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">⏳</div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    </div>
  );

  if (!admin) return null;

  const memberSince = new Date(admin.joiningDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <span className="text-5xl animate-bounce">👨‍💼</span>
            Admin Profile
          </h1>
          <p className="text-purple-100 mt-2 text-lg">Manage your admin account and settings</p>
        </div>
      </div>

      {/* Profile Settings Menu */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/30">
              <span className="text-3xl font-black text-white">
                {admin.name.charAt(0).toUpperCase()}{admin.name.split(' ')[1]?.charAt(0).toUpperCase() || ''}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{admin.name}</h3>
              <p className="text-white/80 text-sm">{admin.email}</p>
              {admin.isSuperAdmin && (
                <span className="inline-block mt-1 px-3 py-1 bg-red-500/30 backdrop-blur-sm rounded-full text-xs font-bold border border-white/30">
                  🌟 SUPER ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-b-4 border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">●</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Account Status</p>
              <p className="text-green-700 font-bold flex items-center gap-1">
                <span>✓</span> Active
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <button
            onClick={() => setShowEditModal(true)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">✏️</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Edit Profile</p>
              <p className="text-sm text-gray-600">Update your personal details</p>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </button>

          <button
            onClick={() => setShowThemeModal(true)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🎨</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Theme Settings</p>
              <p className="text-sm text-gray-600">Customize your appearance</p>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </button>

          <button
            onClick={() => setShowNotificationsModal(true)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Notifications</p>
              <p className="text-sm text-gray-600">Manage your alerts</p>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </button>

          <button
            onClick={() => setShowSecurityModal(true)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">🔒</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Privacy & Security</p>
              <p className="text-sm text-gray-600">Protect your account</p>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </button>

          <button
            onClick={() => setShowActivityModal(true)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Activity Log</p>
              <p className="text-sm text-gray-600">View access history</p>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl">❓</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">Help & Feedback</p>
              <p className="text-sm text-gray-600">Get instant support</p>
            </div>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">→</span>
          </button>
        </div>
      </Card>

      {/* Admin Details Card */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">📋</span> Administrator Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
            <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <span>👤</span> Full Name
            </p>
            <p className="text-2xl font-black text-blue-900">{admin.name}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
            <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <span>✉️</span> Email Address
            </p>
            <p className="text-lg font-bold text-purple-900 break-all">{admin.email}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
            <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
              <span>📱</span> Phone Number
            </p>
            <p className="text-2xl font-black text-green-900">{admin.phone}</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
            <p className="text-sm font-semibold text-pink-800 mb-2 flex items-center gap-2">
              <span>👑</span> Role
            </p>
            <p className="text-2xl font-black text-pink-900">
              {admin.isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
            <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <span>📅</span> Member Since
            </p>
            <p className="text-lg font-black text-amber-900">{memberSince}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
            <p className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              <span>🔐</span> Account Status
            </p>
            <p className="text-2xl font-black text-indigo-900">
              {admin.isActive ? '✅ Active' : '❌ Inactive'}
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
          >
            <span className="text-5xl mb-3 block">🔐</span>
            <span className="font-bold text-lg block">Change Password</span>
            <span className="text-blue-100 text-sm">Update your security</span>
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
          >
            <span className="text-5xl mb-3 block">📱</span>
            <span className="font-bold text-lg block">Update Contact</span>
            <span className="text-purple-100 text-sm">Edit profile details</span>
          </button>
          <button
            onClick={() => {
              toast.success('Logging out...');
              setTimeout(() => logout(), 500);
            }}
            className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
          >
            <span className="text-5xl mb-3 block">🚪</span>
            <span className="font-bold text-lg block">Logout</span>
            <span className="text-red-100 text-sm">Sign out from account</span>
          </button>
        </div>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>✏️</span> Edit Profile
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  💾 Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>🔐</span> Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🔒 Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Theme Modal - Same as UserProfile */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Theme Settings</h3>
              <button onClick={() => setShowThemeModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>
            <div className="space-y-3">
              {['light', 'dark', 'auto'].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTheme(t); toast.success(`Theme set to ${t}!`); }}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${theme === t ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '🔄'}</span>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 capitalize">{t} Mode</p>
                      <p className="text-xs text-gray-600">{t === 'auto' ? 'Match system' : `Use ${t} theme`}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal - Same structure */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Notifications</h3>
              <button onClick={() => setShowNotificationsModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <button
                    onClick={() => {
                      setNotificationSettings({ ...notificationSettings, [key]: !value });
                      toast.success(`${key} ${!value ? 'enabled' : 'disabled'}!`);
                    }}
                    className={`w-14 h-7 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Privacy & Security</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>
            <div className="space-y-4">
              {Object.entries(securitySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <button
                    onClick={() => {
                      setSecuritySettings({ ...securitySettings, [key]: !value });
                      toast.success(`${key} ${!value ? 'enabled' : 'disabled'}!`);
                    }}
                    className={`w-14 h-7 rounded-full transition-all ${value ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${value ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Activity Log</h3>
              <button onClick={() => setShowActivityModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLog.map((log) => (
                <div key={log.id} className="p-4 border-l-4 border-indigo-500 bg-gray-50 rounded-r-xl">
                  <p className="font-bold text-gray-900">{log.action}</p>
                  {log.details && <p className="text-sm text-gray-600 mt-1">{log.details}</p>}
                  <p className="text-xs text-gray-500 mt-2">{log.time}</p>
                  {log.device && <p className="text-xs text-gray-400">{log.device}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900">Help & Feedback</h3>
              <button onClick={() => setShowHelpModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>
            <div className="space-y-4">
              <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-all">
                <p className="font-bold text-blue-900">📚 Documentation</p>
                <p className="text-sm text-blue-700">View admin guides</p>
              </button>
              <button className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-xl text-left transition-all">
                <p className="font-bold text-green-900">💬 Contact Support</p>
                <p className="text-sm text-green-700">Get help from team</p>
              </button>
              <button
                onClick={() => {
                  toast.success('Feedback submitted!');
                  setShowHelpModal(false);
                }}
                className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-left transition-all"
              >
                <p className="font-bold text-purple-900">📝 Send Feedback</p>
                <p className="text-sm text-purple-700">Share your thoughts</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
