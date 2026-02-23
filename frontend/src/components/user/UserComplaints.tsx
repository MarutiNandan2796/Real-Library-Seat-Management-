import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Complaint {
  _id: string;
  subject: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  adminResponse?: string;
}

const UserComplaints: React.FC = () => {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const complaintCategories = [
    { value: 'neighbours', label: '👥 Disturbing by Neighbours', icon: '👥' },
    { value: 'seat', label: '🪑 Seat Issue', icon: '🪑' },
    { value: 'light', label: '💡 Light Issue', icon: '💡' },
    { value: 'switchboard', label: '🔌 Switch Board Issue', icon: '🔌' },
    { value: 'chair', label: '🪑 Chair Issue', icon: '🪑' },
    { value: 'table', label: '🪵 Table Issue', icon: '🪵' },
    { value: 'fan', label: '🌀 Fan Issue', icon: '🌀' },
    { value: 'ac', label: '❄️ AC Issue', icon: '❄️' },
    { value: 'inverter', label: '🔋 Inverter/Generator Issue', icon: '🔋' },
    { value: 'newspaper', label: '📰 Newspaper Issue', icon: '📰' },
    { value: 'water', label: '💧 Water Issue', icon: '💧' },
    { value: 'others', label: '✍️ Others', icon: '✍️' },
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/complaints/user',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setComplaints(response.data.data.complaints);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !description) {
      toast.error('Please select a category and provide description');
      return;
    }

    if (category === 'others' && !customCategory) {
      toast.error('Please specify the issue in Others field');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const subject = category === 'others' ? customCategory : complaintCategories.find(c => c.value === category)?.label || category;
      
      await axios.post(
        'http://localhost:5000/api/complaints/user',
        {
          subject,
          description
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Complaint submitted successfully!');
      setCategory('');
      setCustomCategory('');
      setDescription('');
      fetchComplaints(); // Refresh the complaints list
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-black text-white flex items-center gap-3">
          <span className="text-5xl">🆘</span>
          Help Desk
        </h1>
        <p className="text-amber-100 mt-2 text-lg">Submit your complaints or issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm font-semibold">Total Complaints</p>
          <p className="text-5xl font-black mt-2">{complaints.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <p className="text-amber-100 text-sm font-semibold">Pending</p>
          <p className="text-5xl font-black mt-2">
            {complaints.filter(c => c.status === 'pending' || c.status === 'in-progress').length}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm font-semibold">Resolved</p>
          <p className="text-5xl font-black mt-2">
            {complaints.filter(c => c.status === 'resolved').length}
          </p>
        </Card>
      </div>

      {/* Submit Complaint Form */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">📝</span> Submit New Complaint
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select Issue Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {complaintCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    category === cat.value
                      ? 'border-amber-500 bg-amber-50 shadow-lg scale-105'
                      : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className={`text-xs font-semibold text-center ${
                      category === cat.value ? 'text-amber-700' : 'text-gray-700'
                    }`}>
                      {cat.label.replace(/^[^\s]+\s/, '')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Category Input for Others */}
          {category === 'others' && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Specify Issue *
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="Type your specific issue here..."
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
              placeholder="Provide detailed information about your issue..."
              required
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📤 Submit Complaint
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { 
                setCategory(''); 
                setCustomCategory('');
                setDescription(''); 
              }}
              className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
            >
              🔄 Clear
            </button>
          </div>
        </form>
      </Card>

      {/* My Complaints */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">📋</span> My Complaints
        </h2>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-7xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No complaints submitted yet</p>
            <p className="text-gray-400 mt-2">Submit your first complaint using the form above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div
                key={complaint._id}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-amber-300 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{complaint.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Submitted on {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      complaint.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : complaint.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {complaint.status === 'resolved'
                      ? '✅ Resolved'
                      : complaint.status === 'in-progress'
                      ? '🔄 In Progress'
                      : '⏳ Pending'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{complaint.description}</p>
                {complaint.adminResponse && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-sm font-bold text-green-900 mb-1">Admin Response:</p>
                    <p className="text-sm text-green-700">{complaint.adminResponse}</p>
                    {complaint.resolvedAt && (
                      <p className="text-xs text-green-600 mt-2">
                        Resolved on {new Date(complaint.resolvedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserComplaints;
