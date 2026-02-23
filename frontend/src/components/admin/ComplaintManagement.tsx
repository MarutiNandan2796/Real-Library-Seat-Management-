import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface Complaint {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    seatNumber: string;
  };
  subject: string;
  description: string;
  status: 'pending' | 'resolved';
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
  updatedAt: string;
}

const ComplaintManagement: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = statusFilter === 'all' 
        ? 'http://localhost:5000/api/complaints/admin'
        : `http://localhost:5000/api/complaints/admin?status=${statusFilter}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComplaints(response.data.data?.complaints || []);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveComplaint = async (complaintId: string) => {
    if (!adminResponse.trim()) {
      toast.error('Please provide a response before resolving');
      return;
    }

    try {
      setUpdatingId(complaintId);
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/complaints/admin/${complaintId}`,
        {
          status: 'resolved',
          adminResponse: adminResponse
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Complaint resolved successfully');
      setSelectedComplaint(null);
      setAdminResponse('');
      fetchComplaints();
    } catch (error) {
      console.error('Failed to resolve complaint:', error);
      toast.error('Failed to resolve complaint');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/complaints/admin/${complaintId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Complaint deleted successfully');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      console.error('Failed to delete complaint:', error);
      toast.error('Failed to delete complaint');
    }
  };

  const filteredComplaints = complaints;
  const totalComplaints = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="text-4xl">🎫</span>
          Complaint Management
        </h1>
        <p className="text-amber-100 mt-2">Review and resolve user complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-red-100 text-sm font-semibold">Total Complaints</p>
          <p className="text-4xl font-black mt-2">{totalComplaints}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <p className="text-amber-100 text-sm font-semibold">Pending</p>
          <p className="text-4xl font-black mt-2">{pendingCount}</p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm font-semibold">Resolved</p>
          <p className="text-4xl font-black mt-2">{resolvedCount}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm font-semibold">Resolution Rate</p>
          <p className="text-4xl font-black mt-2">
            {totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0}%
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 All Complaints ({totalComplaints})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏳ Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              statusFilter === 'resolved'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Resolved ({resolvedCount})
          </button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints List */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-2xl font-black text-gray-900 mb-6">Complaint List</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading complaints...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-7xl mb-4">📋</div>
                <p className="text-gray-500 text-xl font-semibold">No Complaints</p>
                <p className="text-gray-400 mt-2">No complaints matching your filter</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredComplaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setAdminResponse(complaint.adminResponse || '');
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedComplaint?._id === complaint._id
                        ? 'border-amber-500 bg-amber-50 shadow-lg'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex-1">{complaint.subject}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${
                          complaint.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {complaint.status === 'resolved' ? '✅ Resolved' : '⏳ Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {complaint.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">{complaint.userId.name}</span> ({complaint.userId.email}) •{' '}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedComplaint ? (
            <Card className="sticky top-8 border-l-4 border-amber-500">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Details</h2>
              
              {/* User Info */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-2">USER INFORMATION</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-bold text-gray-900">{selectedComplaint.userId.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-bold text-gray-900 break-all">{selectedComplaint.userId.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-bold text-gray-900">{selectedComplaint.userId.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Seat Number</p>
                    <p className="font-bold text-gray-900">{selectedComplaint.userId.seatNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Complaint Details */}
              <div className="mb-6 pb-6 border-b-2 border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-2">COMPLAINT DETAILS</p>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Subject</p>
                  <p className="font-bold text-gray-900 mb-4">{selectedComplaint.subject}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-700 text-sm mb-4">{selectedComplaint.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Submitted</p>
                  <p className="font-bold text-gray-900">
                    {new Date(selectedComplaint.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Response Section */}
              {selectedComplaint.status === 'pending' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-2 block">ADMIN RESPONSE</label>
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm"
                      placeholder="Type your response here..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolveComplaint(selectedComplaint._id)}
                      disabled={updatingId === selectedComplaint._id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {updatingId === selectedComplaint._id ? '🔄 Resolving...' : '✅ Resolve'}
                    </button>
                    <button
                      onClick={() => handleDeleteComplaint(selectedComplaint._id)}
                      className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold mb-2">✅ RESOLVED</p>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Resolved On</p>
                    <p className="font-bold text-gray-900">
                      {selectedComplaint.resolvedAt
                        ? new Date(selectedComplaint.resolvedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Admin Response</p>
                    <p className="text-gray-700 text-sm">{selectedComplaint.adminResponse}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteComplaint(selectedComplaint._id)}
                    className="w-full mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </Card>
          ) : (
            <Card className="sticky top-8 text-center py-12">
              <div className="text-6xl mb-4">👈</div>
              <p className="text-gray-500 font-semibold">Select a complaint to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintManagement;
