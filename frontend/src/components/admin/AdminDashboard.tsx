import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';
import { AdminDashboardStats } from '@/types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!stats) return <div>No data available</div>;

  const statsCards = [
    {
      title: 'Total Active Users',
      value: stats.totalActiveUsers,
      icon: '👥',
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      iconBg: 'bg-blue-400/20',
      trend: '+12%',
      trendUp: true,
      path: '/admin/users',
      action: 'Manage Users'
    },
    {
      title: 'Total Seats',
      value: stats.totalSeats,
      icon: '💺',
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      iconBg: 'bg-purple-400/20',
      trend: '50',
      trendUp: true,
      path: '/admin/seats',
      action: 'View Seats'
    },
    {
      title: 'Occupied Seats',
      value: stats.occupiedSeats,
      icon: '✅',
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      iconBg: 'bg-green-400/20',
      trend: `${((stats.occupiedSeats / stats.totalSeats) * 100).toFixed(0)}%`,
      trendUp: true,
      path: '/admin/seats',
      action: 'See Details'
    },
    {
      title: 'Available Seats',
      value: stats.availableSeats,
      icon: '🟢',
      gradient: 'from-teal-500 via-teal-600 to-cyan-600',
      iconBg: 'bg-teal-400/20',
      trend: 'Live',
      trendUp: true,
      path: '/admin/seats',
      action: 'Allocate Seats'
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString()}`,
      icon: '💰',
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      iconBg: 'bg-amber-400/20',
      trend: '+18%',
      trendUp: true,
      path: '/admin/payments',
      action: 'View Details'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: '⏳',
      gradient: 'from-rose-500 via-red-600 to-pink-600',
      iconBg: 'bg-rose-400/20',
      trend: 'Action Needed',
      trendUp: false,
      path: '/admin/payments',
      action: 'Collect Now'
    },
    {
      title: 'Unread Messages',
      value: 0,
      icon: '📧',
      gradient: 'from-indigo-500 via-blue-600 to-purple-600',
      iconBg: 'bg-indigo-400/20',
      trend: 'New',
      trendUp: false,
      path: '/admin/messages',
      action: 'Check Messages'
    },
    {
      title: 'Open Complaints',
      value: stats.pendingComplaints,
      icon: '🎫',
      gradient: 'from-yellow-500 via-orange-500 to-amber-600',
      iconBg: 'bg-yellow-400/20',
      trend: 'Pending',
      trendUp: false,
      path: '/admin/complaints',
      action: 'Resolve Issues'
    }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
              📚 Admin Dashboard
            </h1>
            <p className="text-indigo-100 text-lg">Manage your library with powerful insights</p>
          </div>
          <div className="hidden md:block text-white text-6xl opacity-20">
            🏛️
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card 
            key={index}
            onClick={() => navigate(stat.path)}
            className={`bg-gradient-to-br ${stat.gradient} text-white transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl overflow-hidden relative group cursor-pointer active:scale-95`}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-white transform rotate-12 scale-150 group-hover:rotate-45 transition-transform duration-700"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-2">
                    {stat.title}
                  </p>
                  <p className="text-4xl font-black mt-1 tracking-tight drop-shadow-lg">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.iconBg} rounded-2xl p-3 backdrop-blur-sm`}>
                  <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                </div>
              </div>
              
              {/* Trend indicator */}
              <div className="flex items-center gap-2 mt-4 mb-3">
                <span className={`${stat.trendUp ? 'bg-white/20' : 'bg-black/20'} px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm`}>
                  {stat.trendUp && '↗'} {stat.trend}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(stat.path);
                }}
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-3 rounded-lg text-sm transition-all duration-200 backdrop-blur-sm border border-white/30"
              >
                {stat.action} →
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-blue-500 cursor-pointer"
          onClick={() => navigate('/admin/users')}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-2xl p-4">
              <span className="text-4xl">👥</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">User Management</h3>
              <p className="text-gray-600 text-sm">Add, edit, or manage users</p>
            </div>
            <div className="text-blue-500 text-2xl">→</div>
          </div>
        </Card>

        <Card 
          className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-purple-500 cursor-pointer"
          onClick={() => navigate('/admin/seats')}
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-2xl p-4">
              <span className="text-4xl">💺</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Seat Allocation</h3>
              <p className="text-gray-600 text-sm">Manage seat assignments</p>
            </div>
            <div className="text-purple-500 text-2xl">→</div>
          </div>
        </Card>

        <Card 
          className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-green-500 cursor-pointer"
          onClick={() => navigate('/admin/payments')}
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-2xl p-4">
              <span className="text-4xl">💰</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Payments</h3>
              <p className="text-gray-600 text-sm">Track revenue & payments</p>
            </div>
            <div className="text-green-500 text-2xl">→</div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Occupancy Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-gray-700">Seat Occupancy</span>
                <span className="font-bold text-green-600">
                  {((stats.occupiedSeats / stats.totalSeats) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${(stats.occupiedSeats / stats.totalSeats) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <p className="text-3xl font-black text-blue-600">{stats.totalSeats}</p>
                <p className="text-xs text-blue-800 font-semibold mt-1">Total</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <p className="text-3xl font-black text-green-600">{stats.occupiedSeats}</p>
                <p className="text-xs text-green-800 font-semibold mt-1">Occupied</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl">
                <p className="text-3xl font-black text-teal-600">{stats.availableSeats}</p>
                <p className="text-xs text-teal-800 font-semibold mt-1">Available</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> Revenue Insights
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
              <div>
                <p className="text-sm text-amber-800 font-semibold">Total Revenue</p>
                <p className="text-3xl font-black text-amber-600 mt-1">
                  ₹{stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="text-5xl">💵</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                <p className="text-xs text-green-800 font-semibold mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalActiveUsers - stats.pendingPayments}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl">
                <p className="text-xs text-rose-800 font-semibold mb-1">Pending</p>
                <p className="text-2xl font-bold text-rose-600">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">🔔</span> Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border-t-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-indigo-100 rounded-full p-3">
                <span className="text-2xl">📧</span>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">0</p>
                <p className="text-sm text-gray-600 font-semibold">Unread Messages</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/messages')}
              className="w-full bg-indigo-500 text-white py-2 rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
            >
              View Messages
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-t-4 border-amber-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 rounded-full p-3">
                <span className="text-2xl">🎫</span>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.pendingComplaints}</p>
                <p className="text-sm text-gray-600 font-semibold">Open Complaints</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/admin/complaints')}
              className="w-full bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Resolve Issues
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border-t-4 border-emerald-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-emerald-100 rounded-full p-3">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">{stats.totalActiveUsers}</p>
                <p className="text-sm text-gray-600 font-semibold">Active Members</p>
              </div>
            </div>
            <button className="w-full bg-emerald-500 text-white py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
              View All Users
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
