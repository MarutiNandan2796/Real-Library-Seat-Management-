import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api, { getErrorMessage } from '@/services/api';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';
import { UserDashboardData } from '@/types';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuth();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/dashboard');
      setData(response.data.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white mb-3 tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-2xl text-indigo-100 font-semibold">{data.user.name}</p>
              <p className="text-indigo-200 mt-2">Your library membership dashboard</p>
            </div>
            <div className="hidden md:block text-white text-8xl opacity-20">
              📚
            </div>
          </div>
        </div>
      </div>

      {/* Seat Information - Hero Card */}
      {data.user.seatNumber ? (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                    <span className="text-6xl">💺</span>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Your Active Seat</p>
                    <p className="text-7xl font-black tracking-tight drop-shadow-2xl">
                      #{data.user.seatNumber}
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
                  <p className="text-white/70 text-sm font-semibold mb-2">Monthly Fee</p>
                  <p className="text-4xl font-black text-white">
                    ₹{data.user.monthlyFee?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <div className="hidden lg:block text-white/20 text-9xl">
                ✅
              </div>
            </div>
          </Card>

          {/* Time Slots Card */}
          {data.seatDetails?.timeSlots && data.seatDetails.timeSlots.length > 0 && (
            <Card className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <span className="text-4xl">🕐</span>
                </div>
                <div>
                  <h3 className="text-2xl font-black">Your Study Schedule</h3>
                  <p className="text-white/80 text-sm">Allocated time slots for your seat</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {data.seatDetails.timeSlots.map((slot: any, index: number) => {
                  const [startHour, startMin] = slot.startTime.split(':').map(Number);
                  const [endHour, endMin] = slot.endTime.split(':').map(Number);
                  const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                  const hours = Math.floor(duration / 60);
                  const mins = duration % 60;
                  const durationStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
                  
                  return (
                    <div key={index} className="bg-white/15 backdrop-blur-sm rounded-xl p-4 border-2 border-white/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-lg">
                          {slot.label || `Session ${index + 1}`}
                        </span>
                        <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
                          ⏱️ {durationStr}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-3xl font-black">
                        <span>{slot.startTime}</span>
                        <span className="text-xl">→</span>
                        <span>{slot.endTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {data.seatDetails.timeSlotsUpdatedAt && (
                <div className="mt-4 text-xs text-white/70 border-t border-white/20 pt-3">
                  <p>ℹ️ Last updated: {new Date(data.seatDetails.timeSlotsUpdatedAt).toLocaleDateString()} at {new Date(data.seatDetails.timeSlotsUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              )}
            </Card>
          )}
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 text-white shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6">
              <span className="text-7xl">🔍</span>
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black mb-2">No Active Seat</h3>
              <p className="text-white/90 text-lg mb-4">Reserve your seat today and start your learning journey!</p>
              <button
                onClick={async () => {
                  try {
                    const subject = 'New Seat Allocation Request';
                    const message = 'User is requesting a new seat allocation from the dashboard "No Active Seat" section.';

                    await api.post('/support-tickets/user', {
                      subject,
                      message,
                      priority: 'high',
                    });

                    toast.success('📩 Request sent! Admin / Super Admin will review your seat request.');
                  } catch (error: any) {
                    toast.error(getErrorMessage(error) || 'Failed to send seat request');
                  }
                }}
                className="bg-white text-orange-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg transform hover:scale-105 active:scale-95"
              >
                Request a Seat 🎯
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payments */}
        <Card 
          className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-blue-500 cursor-pointer"
          onClick={() => navigate('/user/payments')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 rounded-2xl p-4">
              <span className="text-5xl">💳</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Payment Status</p>
              <p className="text-3xl font-black text-gray-900">
                {data.pendingPayment?.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
              </p>
            </div>
          </div>
          {data.pendingPayment && data.pendingPayment.amount && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p className="text-blue-800 text-sm font-bold">Amount: ₹{data.pendingPayment.amount}</p>
              {data.pendingPayment.paidAt && (
                <p className="text-green-600 text-xs">
                  Paid on: {new Date(data.pendingPayment.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/user/payments'); }}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold mt-4 hover:bg-blue-600 transition-colors shadow-lg"
          >
            View Payment History
          </button>
        </Card>

        {/* Messages */}
        <Card 
          className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-purple-500 cursor-pointer"
          onClick={() => navigate('/user/messages')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 rounded-2xl p-4">
              <span className="text-5xl">📬</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Messages</p>
              <p className="text-3xl font-black text-gray-900">
                {data.recentMessages?.length || 0}
              </p>
            </div>
          </div>
          {data.recentMessages && data.recentMessages.length > 0 && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
              <p className="text-purple-800 font-bold">
                🔔 {data.recentMessages.length} New Messages
              </p>
            </div>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/user/messages'); }}
            className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold mt-4 hover:bg-purple-600 transition-colors shadow-lg"
          >
            Check Messages
          </button>
        </Card>

        {/* Complaints */}
        <Card 
          className="bg-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-amber-500 cursor-pointer"
          onClick={() => navigate('/user/complaints')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 rounded-2xl p-4">
              <span className="text-5xl">🆘</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Help Desk</p>
              <p className="text-3xl font-black text-gray-900">
                {data.pendingComplaintsCount || 0}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-black text-amber-600">{data.pendingComplaintsCount || 0}</p>
              <p className="text-xs text-amber-800 font-semibold">Open</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-black text-green-600">0</p>
              <p className="text-xs text-green-800 font-semibold">Resolved</p>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); navigate('/user/complaints'); }}
            className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold mt-4 hover:bg-amber-600 transition-colors shadow-lg"
          >
            Submit Complaint
          </button>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-slate-50 to-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">⚡</span> Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/user/payments')}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-3">📋</div>
            View Payments
          </button>
          <button 
            onClick={() => navigate('/user/payments')}
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-3">💰</div>
            Make Payment
          </button>
          <button 
            onClick={() => navigate('/user/profile')}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-3">👤</div>
            Edit Profile
          </button>
          <button 
            onClick={() => navigate('/user/complaints')}
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-4xl mb-3">📞</div>
            Contact Support
          </button>
        </div>
      </Card>

    </div>
  );
};

export default UserDashboard;
