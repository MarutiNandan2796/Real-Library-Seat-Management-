import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../common/Card';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  seatNumber: number | null;
  monthlyFee: number;
  isActive: boolean;
  joiningDate: string;
}

interface Stats {
  totalPayments: number;
  pendingPayments: number;
  totalComplaints: number;
  resolvedComplaints: number;
  unreadMessages: number;
}

const UserProfile: React.FC = () => {
  const { user: _authUser, logout } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalPayments: 0,
    pendingPayments: 0,
    totalComplaints: 0,
    resolvedComplaints: 0,
    unreadMessages: 0
  });
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
    marketingEmails: true,
    paymentAlerts: true,
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    profileVisibility: true,
    dataCollection: false,
  });
  const activityLog = [
    { id: 1, action: 'Login', time: 'Today at 10:30 AM', device: 'Chrome on Windows', details: '', color: 'blue' },
    { id: 2, action: 'Profile Updated', time: 'Yesterday at 3:45 PM', device: 'Safari on iPhone', details: 'Changed phone number', color: 'green' },
    { id: 3, action: 'Password Changed', time: '2 days ago', device: '', details: '', color: 'yellow' },
    { id: 4, action: 'Payment Made', time: '3 days ago at 5:20 PM', device: '', details: '₹500 payment successful', color: 'purple' },
    { id: 5, action: 'Booking Created', time: '7 days ago', device: '', details: '', color: '' },
  ];
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.data);
      setEditForm({ 
        name: response.data.data.name, 
        phone: response.data.data.phone,
        email: response.data.data.email
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch payments
      const paymentsRes = await axios.get('http://localhost:5000/api/payments/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch complaints
      const complaintsRes = await axios.get('http://localhost:5000/api/complaints/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch messages
      const messagesRes = await axios.get('http://localhost:5000/api/messages/user', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payments = paymentsRes.data.data || [];
      const complaints = complaintsRes.data.data || [];
      const messages = messagesRes.data.data || [];

      setStats({
        totalPayments: payments.length,
        pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
        totalComplaints: complaints.length,
        resolvedComplaints: complaints.filter((c: any) => c.status === 'resolved').length,
        unreadMessages: messages.filter((m: any) => !m.read).length
      });
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editForm.name.trim() || !editForm.phone.trim() || !editForm.email.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/user/profile',
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/api/user/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const memberSince = new Date(user.joiningDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <span className="text-5xl animate-bounce">👤</span>
            My Profile
          </h1>
          <p className="text-purple-100 mt-2 text-lg">Manage your account information and settings</p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
          <div className="text-4xl mb-2">💰</div>
          <div className="text-3xl font-black">{stats.totalPayments}</div>
          <div className="text-blue-100 text-sm font-semibold">Total Payments</div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
          <div className="text-4xl mb-2">⏳</div>
          <div className="text-3xl font-black">{stats.pendingPayments}</div>
          <div className="text-orange-100 text-sm font-semibold">Pending Payments</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
          <div className="text-4xl mb-2">📝</div>
          <div className="text-3xl font-black">{stats.totalComplaints}</div>
          <div className="text-purple-100 text-sm font-semibold">Total Complaints</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
          <div className="text-4xl mb-2">✅</div>
          <div className="text-3xl font-black">{stats.resolvedComplaints}</div>
          <div className="text-green-100 text-sm font-semibold">Resolved Issues</div>
        </div>
        
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer">
          <div className="text-4xl mb-2">📬</div>
          <div className="text-3xl font-black">{stats.unreadMessages}</div>
          <div className="text-pink-100 text-sm font-semibold">New Messages</div>
        </div>
      </div>

      {/* Profile Settings Menu */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border-2 border-white/30">
              <span className="text-3xl font-black text-white">
                {user.name.charAt(0).toUpperCase()}{user.name.split(' ')[1]?.charAt(0).toUpperCase() || ''}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-bold">{user.name}</h3>
              <p className="text-white/80 text-sm">{user.email}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
            <div className="relative z-10 pt-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-2xl transform hover:scale-110 transition-transform cursor-pointer">
                <span className="text-6xl text-white font-black">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
              <p className="text-gray-500 mt-1 text-sm">{user.email}</p>
              
              <div className="mt-6 space-y-3 px-4">
                <div className={`px-4 py-3 rounded-xl shadow-md transform hover:scale-105 transition-all cursor-pointer ${user.isActive ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}>
                  <span className={`font-bold text-white text-lg`}>
                    {user.isActive ? '✅ Active Member' : '❌ Inactive'}
                  </span>
                </div>
                {user.seatNumber && (
                  <div className="px-4 py-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl shadow-md transform hover:scale-105 transition-all cursor-pointer">
                    <span className="font-bold text-white text-lg">
                      🪑 Seat #{user.seatNumber}
                    </span>
                  </div>
                )}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-md transform hover:scale-105 transition-all cursor-pointer">
                  <span className="font-bold text-white">
                    📅 Member Since
                  </span>
                  <div className="text-white/90 text-sm mt-1">{memberSince}</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>✏️</span> Edit Profile
                </button>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>⚙️</span> Settings
                </button>
                <button
                  onClick={() => {
                    toast.success('Logging out...');
                    setTimeout(() => logout(), 500);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-red-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <span>🚪</span> Logout
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📋</span> Account Details
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                  <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <span>👤</span> Full Name
                  </p>
                  <p className="text-2xl font-black text-blue-900">{user.name}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                  <p className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <span>✉️</span> Email Address
                  </p>
                  <p className="text-lg font-bold text-purple-900 break-all">{user.email}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                  <p className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <span>📱</span> Phone Number
                  </p>
                  <p className="text-2xl font-black text-green-900">{user.phone}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                  <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <span>💵</span> Monthly Fee
                  </p>
                  <p className="text-2xl font-black text-amber-900">₹{user.monthlyFee}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                  <p className="text-sm font-semibold text-pink-800 mb-2 flex items-center gap-2">
                    <span>🪑</span> Seat Number
                  </p>
                  <p className="text-2xl font-black text-pink-900">
                    {user.seatNumber ? `#${user.seatNumber}` : 'Not Assigned'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all transform hover:scale-105 cursor-pointer shadow-md hover:shadow-xl">
                  <p className="text-sm font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                    <span>🎯</span> Account Status
                  </p>
                  <p className="text-lg font-bold text-indigo-900">
                    {user.isActive ? 'Active & Verified' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Library Timings */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">🕐</span> Library Timings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🌅</span>
              <div>
                <h3 className="text-xl font-black text-gray-900">Morning Shift</h3>
                <p className="text-sm text-gray-600">Monday - Saturday</p>
              </div>
            </div>
            <p className="text-3xl font-black text-blue-600">6:00 AM - 12:00 PM</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🌆</span>
              <div>
                <h3 className="text-xl font-black text-gray-900">Evening Shift</h3>
                <p className="text-sm text-gray-600">Monday - Saturday</p>
              </div>
            </div>
            <p className="text-3xl font-black text-orange-600">2:00 PM - 10:00 PM</p>
          </div>
        </div>
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer">
          <p className="text-yellow-800 font-semibold flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            Library remains closed on Sundays and public holidays
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            onClick={() => toast.success('Support team will contact you soon!')}
            className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
          >
            <span className="text-5xl mb-3 block">📧</span>
            <span className="font-bold text-lg block">Contact Support</span>
            <span className="text-green-100 text-sm">Get help instantly</span>
          </button>
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105 relative"
          >
            <span className="text-5xl mb-3 block">⚙️</span>
            <span className="font-bold text-lg block">More Options</span>
            <span className="text-indigo-100 text-sm">Account settings</span>
          </button>
        </div>
      </Card>

      {/* Account Options Menu */}
      {showAccountMenu && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>⚙️</span> Account Options
              </h3>
              <button
                onClick={() => setShowAccountMenu(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowThemeModal(true)}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-900 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 border-blue-200 hover:border-blue-400 transform hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">🎨</span>
                <div className="text-left flex-1">
                  <div>Theme Settings</div>
                  <div className="text-xs text-blue-700">Customize appearance</div>
                </div>
                <span className="text-xl">→</span>
              </button>

              <button
                onClick={() => setShowNotificationsModal(true)}
                className="w-full p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-900 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 border-purple-200 hover:border-purple-400 transform hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">🔔</span>
                <div className="text-left flex-1">
                  <div>Notifications</div>
                  <div className="text-xs text-purple-700">Manage alerts</div>
                </div>
                <span className="text-xl">→</span>
              </button>

              <button
                onClick={() => setShowSecurityModal(true)}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-900 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 border-green-200 hover:border-green-400 transform hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">🔒</span>
                <div className="text-left flex-1">
                  <div>Privacy & Security</div>
                  <div className="text-xs text-green-700">Protect your account</div>
                </div>
                <span className="text-xl">→</span>
              </button>

              <button
                onClick={() => setShowActivityModal(true)}
                className="w-full p-4 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 border-amber-200 hover:border-amber-400 transform hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">📊</span>
                <div className="text-left flex-1">
                  <div>Activity Log</div>
                  <div className="text-xs text-amber-700">View access history</div>
                </div>
                <span className="text-xl">→</span>
              </button>

              <button
                onClick={() => setShowHelpModal(true)}
                className="w-full p-4 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 text-pink-900 rounded-xl font-semibold transition-all flex items-center gap-3 border-2 border-pink-200 hover:border-pink-400 transform hover:scale-105 active:scale-95"
              >
                <span className="text-2xl">❓</span>
                <div className="text-left flex-1">
                  <div>Help & Feedback</div>
                  <div className="text-xs text-pink-700">Get instant support</div>
                </div>
                <span className="text-xl">→</span>
              </button>

              <div className="pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowAccountMenu(false);
                    logout();
                  }}
                  className="w-full p-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg hover:shadow-2xl transform hover:scale-105"
                >
                  <span className="text-2xl">🚪</span>
                  <div className="text-left">
                    <div>Logout</div>
                    <div className="text-xs text-red-100">Sign out from your account</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  👤 Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ✉️ Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  placeholder="Enter your phone"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={isEditing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
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
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔒 Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔑 New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  ✅ Confirm Password
                </label>
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
                onClick={handleChangePassword}
                disabled={isEditing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isEditing ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Settings Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-xl w-full p-10 transform animate-scale-in border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                Theme Settings
              </h3>
              <button onClick={() => setShowThemeModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 text-sm">Choose your preferred theme to customize your interface experience</p>

            {/* Theme Options */}
            <div className="space-y-4 mb-8">
              {/* Light Mode */}
              <button
                onClick={() => { setTheme('light'); toast.success('☀️ Light mode activated!'); }}
                className={`w-full group cursor-pointer transition-all transform hover:scale-105 ${theme === 'light' ? '' : ''}`}
              >
                <div className={`p-6 rounded-2xl border-3 transition-all ${theme === 'light' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-500 shadow-xl shadow-blue-200/50' : 'bg-gray-50 border-gray-200 hover:border-blue-400 hover:shadow-lg'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">☀️</span>
                      <div className="text-left">
                        <p className="text-xl font-bold text-gray-900">Light Mode</p>
                        <p className="text-sm text-gray-600">Bright and clean interface</p>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                        <span>✓</span> Selected
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 ml-14">Perfect for daytime use with bright colors and high contrast</p>
                </div>
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => { setTheme('dark'); toast.success('🌙 Dark mode activated!'); }}
                className={`w-full group cursor-pointer transition-all transform hover:scale-105 ${theme === 'dark' ? '' : ''}`}
              >
                <div className={`p-6 rounded-2xl border-3 transition-all ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-xl shadow-gray-900/50 text-white' : 'bg-gray-50 border-gray-200 hover:border-gray-400 hover:shadow-lg'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">🌙</span>
                      <div className="text-left">
                        <p className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Dark Mode</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Easy on the eyes at night</p>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-full text-xs font-bold">
                        <span>✓</span> Selected
                      </div>
                    )}
                  </div>
                  <p className={`text-xs ml-14 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Reduces eye strain during nighttime browsing</p>
                </div>
              </button>

              {/* Auto Mode */}
              <button
                onClick={() => { setTheme('auto'); toast.success('🔄 Auto mode activated!'); }}
                className={`w-full group cursor-pointer transition-all transform hover:scale-105 ${theme === 'auto' ? '' : ''}`}
              >
                <div className={`p-6 rounded-2xl border-3 transition-all ${theme === 'auto' ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-500 shadow-xl shadow-purple-200/50' : 'bg-gray-50 border-gray-200 hover:border-purple-400 hover:shadow-lg'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">🔄</span>
                      <div className="text-left">
                        <p className="text-xl font-bold text-gray-900">Auto Mode</p>
                        <p className="text-sm text-gray-600">Follow system settings</p>
                      </div>
                    </div>
                    {theme === 'auto' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                        <span>✓</span> Selected
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 ml-14">Automatically switches between light and dark based on system preference</p>
                </div>
              </button>
            </div>

            {/* Preview Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200 mb-8">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>👁️</span> Preview
              </h4>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="text-sm font-semibold mb-1">Sample Text</p>
                <p className="text-xs opacity-75">This is how your interface will look with the selected theme</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  (window as any).setAppTheme(theme);
                  toast.success(`✅ Theme applied! You're now using ${theme} mode.`);
                  setShowThemeModal(false);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                ✅ Apply Theme
              </button>
              <button
                onClick={() => setShowThemeModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-10 transform animate-scale-in border border-gray-200 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔔</span>
                </div>
                Notifications
              </h3>
              <button onClick={() => setShowNotificationsModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 text-sm">Manage how you want to receive notifications and alerts</p>

            {/* Notification Options */}
            <div className="space-y-4 mb-8">
              {/* Email Notifications */}
              <label className="flex items-center p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={() => setNotificationSettings({...notificationSettings, emailNotifications: !notificationSettings.emailNotifications})}
                  className="w-6 h-6 accent-blue-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">📧</span> Email Notifications
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Receive updates via email</p>
                </div>
                {notificationSettings.emailNotifications && <span className="text-blue-600 text-xl">✓</span>}
              </label>

              {/* Push Notifications */}
              <label className="flex items-center p-5 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={() => setNotificationSettings({...notificationSettings, pushNotifications: !notificationSettings.pushNotifications})}
                  className="w-6 h-6 accent-purple-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">📱</span> Push Notifications
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Mobile app notifications</p>
                </div>
                {notificationSettings.pushNotifications && <span className="text-purple-600 text-xl">✓</span>}
              </label>

              {/* Marketing Emails */}
              <label className="flex items-center p-5 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 hover:border-pink-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketingEmails}
                  onChange={() => setNotificationSettings({...notificationSettings, marketingEmails: !notificationSettings.marketingEmails})}
                  className="w-6 h-6 accent-pink-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">📢</span> Marketing Emails
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Promotional content</p>
                </div>
                {notificationSettings.marketingEmails && <span className="text-pink-600 text-xl">✓</span>}
              </label>

              {/* Payment Alerts */}
              <label className="flex items-center p-5 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={notificationSettings.paymentAlerts}
                  onChange={() => setNotificationSettings({...notificationSettings, paymentAlerts: !notificationSettings.paymentAlerts})}
                  className="w-6 h-6 accent-green-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">💳</span> Payment Alerts
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Payment reminders</p>
                </div>
                {notificationSettings.paymentAlerts && <span className="text-green-600 text-xl">✓</span>}
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.success('✅ Notification settings saved!');
                  setShowNotificationsModal(false);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                ✅ Save Settings
              </button>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-10 transform animate-scale-in border border-gray-200 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                Privacy & Security
              </h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 text-sm">Control your account security and privacy settings</p>

            {/* Security Options */}
            <div className="space-y-4 mb-8">
              {/* Two-Factor Authentication */}
              <label className="flex items-center p-5 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border-2 border-red-200 hover:border-red-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={() => setSecuritySettings({...securitySettings, twoFactorAuth: !securitySettings.twoFactorAuth})}
                  className="w-6 h-6 accent-red-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">🔐</span> Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Add extra security layer to your account</p>
                </div>
                {securitySettings.twoFactorAuth && <span className="text-red-600 text-xl">✓</span>}
              </label>

              {/* Profile Visibility */}
              <label className="flex items-center p-5 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl border-2 border-cyan-200 hover:border-cyan-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={securitySettings.profileVisibility}
                  onChange={() => setSecuritySettings({...securitySettings, profileVisibility: !securitySettings.profileVisibility})}
                  className="w-6 h-6 accent-cyan-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">👁️</span> Profile Visibility
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Allow others to see your profile</p>
                </div>
                {securitySettings.profileVisibility && <span className="text-cyan-600 text-xl">✓</span>}
              </label>

              {/* Data Collection */}
              <label className="flex items-center p-5 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border-2 border-amber-200 hover:border-amber-400 cursor-pointer transition-all transform hover:scale-102 group">
                <input
                  type="checkbox"
                  checked={securitySettings.dataCollection}
                  onChange={() => setSecuritySettings({...securitySettings, dataCollection: !securitySettings.dataCollection})}
                  className="w-6 h-6 accent-amber-600 cursor-pointer"
                />
                <div className="ml-4 flex-1">
                  <p className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Data Collection
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Allow analytics to improve your experience</p>
                </div>
                {securitySettings.dataCollection && <span className="text-amber-600 text-xl">✓</span>}
              </label>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-gray-100 rounded-2xl p-6 mb-8 border-2 border-gray-300">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 active:scale-95 text-sm">
                  🔑 Change Password
                </button>
                <button className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 active:scale-95 text-sm">
                  📲 Enable 2FA
                </button>
                <button className="col-span-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 active:scale-95 text-sm">
                  🖥️ View Active Sessions
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  toast.success('✅ Security settings updated!');
                  setShowSecurityModal(false);
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                ✅ Save & Close
              </button>
              <button
                onClick={() => setShowSecurityModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all transform hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-10 transform animate-scale-in border border-gray-200 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                Activity Log
              </h3>
              <button onClick={() => setShowActivityModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 text-sm">Your recent account activities and security events</p>

            {/* Activity Timeline */}
            <div className="space-y-4 mb-8">
              {activityLog.map((log) => {
                const colorClasses = {
                  blue: 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
                  green: 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
                  yellow: 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200',
                  purple: 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
                  gray: 'border-l-4 border-gray-400 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200'
                };

                const emojiMap = {
                  'Login': '🔓',
                  'Profile Updated': '✏️',
                  'Password Changed': '🔑',
                  'Payment Made': '💳',
                  'Booking Created': '📅'
                };

                const borderColor = log.color || 'gray';
                const emoji = emojiMap[log.action as keyof typeof emojiMap] || '📝';

                return (
                  <div key={log.id} className={`p-5 rounded-2xl transition-all transform hover:scale-102 cursor-pointer shadow-sm hover:shadow-md ${colorClasses[borderColor as keyof typeof colorClasses]}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{emoji}</span>
                          <p className="font-bold text-gray-900 text-lg">{log.action}</p>
                        </div>
                        {log.details && (
                          <p className="text-sm font-semibold text-gray-700 mb-2 ml-10">
                            {log.details}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 ml-10 mt-2">
                          <p className="text-xs text-gray-600">⏰ {log.time}</p>
                          {log.device && <p className="text-xs text-gray-600">📱 {log.device}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-100 rounded-2xl p-6 mb-8 border-2 border-gray-300">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-black text-orange-600">{activityLog.length}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Activities</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">1</p>
                  <p className="text-xs text-gray-600 mt-1">This Week</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowActivityModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              ✕ Close Activity Log
            </button>
          </div>
        </div>
      )}

      {/* Help & Feedback Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-2xl max-w-2xl w-full p-10 transform animate-scale-in border border-gray-200 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">❓</span>
                </div>
                Help & Feedback
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="text-3xl text-gray-400 hover:text-red-500 hover:rotate-90 transition-all">✕</button>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8 text-sm">Get answers to your questions and help us improve</p>

            {/* Help Options */}
            <div className="space-y-4 mb-8">
              {/* FAQs */}
              <button onClick={() => { toast.success('📚 Loading FAQs...'); }} className="w-full p-6 bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl border-2 border-pink-200 hover:border-pink-400 text-left transition-all transform hover:scale-102 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📚</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Frequently Asked Questions</p>
                    <p className="text-sm text-gray-600 mt-1">Find answers to common questions</p>
                  </div>
                  <span className="text-2xl text-pink-400 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </button>

              {/* Documentation */}
              <button onClick={() => { toast.success('📖 Opening documentation...'); }} className="w-full p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200 hover:border-blue-400 text-left transition-all transform hover:scale-102 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📖</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Documentation</p>
                    <p className="text-sm text-gray-600 mt-1">Read our complete guides and tutorials</p>
                  </div>
                  <span className="text-2xl text-blue-400 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </button>

              {/* Contact Support */}
              <button onClick={() => { toast.success('💬 Support chat opened!'); }} className="w-full p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border-2 border-green-200 hover:border-green-400 text-left transition-all transform hover:scale-102 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">💬</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Contact Support</p>
                    <p className="text-sm text-gray-600 mt-1">Chat with our support team</p>
                  </div>
                  <span className="text-2xl text-green-400 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </button>

              {/* Send Feedback */}
              <button onClick={() => { toast.success('📝 Feedback form opened!'); }} className="w-full p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 text-left transition-all transform hover:scale-102 hover:shadow-lg group">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📝</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-lg">Send Feedback</p>
                    <p className="text-sm text-gray-600 mt-1">Help us improve with your suggestions</p>
                  </div>
                  <span className="text-2xl text-purple-400 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </button>
            </div>

            {/* Quick Info Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-8 border-2 border-yellow-300">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span> Quick Tips
              </h4>
              <ul className="text-xs text-gray-700 space-y-2">
                <li>✓ Check our FAQs first - your answer might be there</li>
                <li>✓ Search documentation by keywords</li>
                <li>✓ Support team responds within 24 hours</li>
                <li>✓ Your feedback helps us improve the platform</li>
              </ul>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              ✕ Close Help
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
