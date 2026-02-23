import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface Message {
  _id: string;
  adminId: {
    name: string;
  };
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const UserMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/messages/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.data?.messages || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/messages/user/${messageId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setMessages(messages.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
      
      toast.success('Message marked as read');
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 shadow-xl">
        <h1 className="text-4xl font-black text-white flex items-center gap-3">
          <span className="text-5xl">📬</span>
          My Messages
        </h1>
        <p className="text-purple-100 mt-2 text-lg">Read announcements from library admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm font-semibold">Total Messages</p>
          <p className="text-5xl font-black mt-2">{messages.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm font-semibold">Unread</p>
          <p className="text-5xl font-black mt-2">{unreadCount}</p>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <p className="text-indigo-100 text-sm font-semibold">This Month</p>
          <p className="text-5xl font-black mt-2">
            {messages.filter(m => {
              const msgDate = new Date(m.createdAt);
              const now = new Date();
              return msgDate.getMonth() === now.getMonth() && msgDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </Card>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <div className="text-center py-16">
              <div className="text-8xl mb-4">📭</div>
              <p className="text-gray-500 text-xl font-semibold">No Messages Yet</p>
              <p className="text-gray-400 mt-2">Check back later for announcements from the admin</p>
            </div>
          </Card>
        ) : (
          messages.map((message) => (
            <div
              key={message._id} 
              onClick={() => !message.isRead && markAsRead(message._id)}
              className={`bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-l-4 p-6 ${
                message.isRead 
                  ? 'border-gray-300 opacity-90' 
                  : 'border-purple-500 cursor-pointer hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`rounded-full p-4 flex-shrink-0 ${
                  message.isRead ? 'bg-gray-100' : 'bg-purple-100'
                }`}>
                  <span className="text-3xl">{message.isRead ? '📧' : '📬'}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-1">{message.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="font-semibold">From: {message.adminId?.name || 'Admin'}</span>
                        <span>•</span>
                        <span>{new Date(message.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </p>
                    </div>
                    {!message.isRead && (
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className={`rounded-xl p-4 border ${
                    message.isRead ? 'bg-gray-50 border-gray-200' : 'bg-purple-50 border-purple-200'
                  }`}>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{message.message}</p>
                  </div>
                  {!message.isRead && (
                    <p className="text-sm text-purple-600 font-semibold mt-2 flex items-center gap-2">
                      <span>👆</span>
                      <span>Click to mark as read</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserMessages;
