import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

interface PendingAdmin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  adminStatus: string;
  createdAt: string;
}

const AdminApproval: React.FC = () => {
  const { user } = useAuth();
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Protection: Only super admins can access this page
  if (!user?.isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/pending-admins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingAdmins(response.data.data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch pending admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/auth/approve-admin/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Admin approved successfully!');
      fetchPendingAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve admin');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/auth/reject-admin/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Admin request rejected');
      fetchPendingAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject admin');
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Badge */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-1 shadow-lg">
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <p className="text-white font-black text-lg">SUPER ADMIN ONLY</p>
              <p className="text-gray-300 text-sm">Admin approval privileges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
            <span className="text-3xl">👥</span>
          </div>
          <div>
            <h2 className="text-2xl font-black">Admin Approval Requests</h2>
            <p className="text-purple-100 text-sm">Review and approve new administrator accounts</p>
          </div>
        </div>
      </div>

      {/* Pending Count Badge */}
      {pendingAdmins.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-gray-900">
                {pendingAdmins.length} Pending Request{pendingAdmins.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-600">Review these requests and take action</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Admins List */}
      {pendingAdmins.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">All admin requests have been processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingAdmins.map((admin) => (
            <div
              key={admin._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 mb-1">{admin.name}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span>✉️</span> {admin.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <span>📱</span> {admin.phone}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span>📅</span> Requested on {new Date(admin.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-100 border-2 border-yellow-300 px-4 py-2 rounded-lg">
                    <span className="text-yellow-700 font-bold text-sm">⏳ Pending</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => handleApprove(admin._id)}
                    disabled={processingId === admin._id}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    {processingId === admin._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>✅</span>
                        Approve Admin
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(admin._id)}
                    disabled={processingId === admin._id}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:from-red-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  >
                    {processingId === admin._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span>❌</span>
                        Reject Request
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-bold text-gray-900 mb-2">Admin Approval Guidelines</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Approve</strong>: The admin will gain full access to the admin panel</li>
              <li>• <strong>Reject</strong>: The request will be denied and the account stays inactive</li>
              <li>• Only Super Admins can approve or reject admin requests</li>
              <li>• Approved admins can manage users, payments, and system settings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApproval;
