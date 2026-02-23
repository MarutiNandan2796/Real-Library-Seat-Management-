import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface Message {
  _id: string;
  title: string;
  message: string;
  recipientType: 'all' | 'selected';
  recipients?: Array<{ _id: string; name: string; email: string }>;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  seatNumber: number | null;
}

const MessageCenter: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'selected'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/messages/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data?.messages || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) {
      toast.error('Please fill all fields');
      return;
    }

    if (recipientType === 'selected' && selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/messages/admin',
        {
          title,
          message,
          recipientType,
          recipients: recipientType === 'selected' ? selectedUsers : []
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`Message sent successfully to ${recipientType === 'all' ? 'all users' : `${selectedUsers.length} user(s)`}!`);
      setTitle('');
      setMessage('');
      setRecipientType('all');
      setSelectedUsers([]);
      setSearchQuery('');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const filteredUserIds = filteredUsers.map(u => u._id);
    setSelectedUsers(filteredUserIds);
  };

  const deselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const filteredUsers = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="text-4xl">📧</span>
          Message Center
        </h1>
        <p className="text-indigo-100 mt-2">Send announcements and messages to users</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm font-semibold">Total Messages</p>
          <p className="text-4xl font-black mt-2">{messages.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm font-semibold">Sent Today</p>
          <p className="text-4xl font-black mt-2">{messages.filter(m => new Date(m.createdAt).toDateString() === new Date().toDateString()).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <p className="text-indigo-100 text-sm font-semibold">All Users</p>
          <p className="text-4xl font-black mt-2">{allUsers.length}</p>
        </Card>
      </div>

      {/* Send New Message */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send New Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter message title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipients
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setRecipientType('all');
                  setSelectedUsers([]);
                }}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  recipientType === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👥 All Users
              </button>
              <button
                type="button"
                onClick={() => setRecipientType('selected')}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                  recipientType === 'selected'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👤 Selected Users
              </button>
            </div>
          </div>

          {/* User Selection Interface */}
          {recipientType === 'selected' && (
            <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  Select Users ({selectedUsers.length} selected)
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllUsers}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAllUsers}
                    className="px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search users by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              {/* User List */}
              <div className="max-h-64 overflow-y-auto space-y-2 bg-white rounded-lg p-3 border border-gray-200">
                {loadingUsers ? (
                  <p className="text-center py-4 text-gray-500">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No users found</p>
                ) : (
                  filteredUsers.map((user) => (
                    <label
                      key={user._id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-indigo-50 border-2 ${
                        selectedUsers.includes(user._id)
                          ? 'bg-indigo-100 border-indigo-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {user.name}
                          {user.seatNumber && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              Seat #{user.seatNumber}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Type your message here..."
              required
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {submitting ? '⏳ Sending...' : '📤 Send Message'}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setMessage('');
                setRecipientType('all');
                setSelectedUsers([]);
                setSearchQuery('');
              }}
              className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-colors"
            >
              🔄 Clear
            </button>
          </div>
        </form>
      </Card>

      {/* Recent Messages */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Messages</h2>
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">⏳</div>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No messages sent yet</p>
            <p className="text-gray-400 text-sm mt-2">Send your first message to your users</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{msg.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    msg.recipientType === 'all'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {msg.recipientType === 'all' 
                      ? '👥 All Users' 
                      : `👤 ${msg.recipients?.length || 0} Users`}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{msg.message}</p>
                {msg.recipientType === 'selected' && msg.recipients && msg.recipients.length > 0 && (
                  <div className="mb-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-sm font-semibold text-purple-900 mb-2">Recipients:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.recipients.slice(0, 5).map((recipient) => (
                        <span
                          key={recipient._id}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {recipient.name}
                        </span>
                      ))}
                      {msg.recipients.length > 5 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          +{msg.recipients.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  📅 {new Date(msg.createdAt).toLocaleDateString()} at{' '}
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MessageCenter;
