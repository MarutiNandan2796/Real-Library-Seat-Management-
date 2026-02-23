import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  seatNumber: number | null;
  monthlyFee: number;
  isActive: boolean;
  isBlocked: boolean;
  joiningDate: string;
}

interface Seat {
  _id: string;
  seatNumber: number;
  isOccupied: boolean;
}

interface ChangeHistory {
  _id: string;
  changeType: string;
  oldValue: string;
  newValue: string;
  changedBy: {
    name: string;
    email: string;
    role: string;
  };
  changedByRole: string;
  reason?: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', reason: '' });
  const [seatForm, setSeatForm] = useState({ seatNumber: '' });
  const [changeHistory, setChangeHistory] = useState<ChangeHistory[]>([]);
  const [historyStats, setHistoryStats] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchSeats();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data?.users || response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/seats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeats(response.data.data?.seats || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch seats');
    }
  };

  const toggleUserStatus = async (userId: string, isBlocked: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/block`,
        { isBlocked: !isBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(isBlocked ? 'User unblocked successfully' : 'User blocked successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      reason: ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.phone.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${selectedUser._id}/edit`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('User information updated successfully!');
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsEditing(false);
    }
  };

  const openHistoryModal = async (user: User) => {
    setSelectedUser(user);
    setShowHistoryModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${user._id}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChangeHistory(response.data.data.history || []);
      setHistoryStats(response.data.data.stats || []);
    } catch (error) {
      toast.error('Failed to fetch change history');
    }
  };

  const openSeatModal = (user: User) => {
    setSelectedUser(user);
    setSeatForm({ seatNumber: user.seatNumber?.toString() || '' });
    setShowSeatModal(true);
  };

  const handleAssignSeat = async () => {
    if (!selectedUser) return;
    
    const seatNumber = parseInt(seatForm.seatNumber);
    if (!seatNumber) {
      toast.error('Please select a valid seat');
      return;
    }

    setIsEditing(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/seats/assign',
        { userId: selectedUser._id, seatNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Seat assigned successfully');
      setShowSeatModal(false);
      fetchUsers();
      fetchSeats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign seat');
    } finally {
      setIsEditing(false);
    }
  };

  const handleUnassignSeat = async (user: User) => {
    if (!user.seatNumber) return;
    
    if (!confirm(`Are you sure you want to unassign seat ${user.seatNumber} from ${user.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/seats/unassign',
        { seatNumber: user.seatNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Seat unassigned successfully');
      fetchUsers();
      fetchSeats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unassign seat');
    }
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'name': return '👤';
      case 'email': return '✉️';
      case 'phone': return '📱';
      default: return '📝';
    }
  };

  const getStatCount = (type: string) => {
    const stat = historyStats.find(s => s._id === type);
    return stat ? stat.count : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="text-4xl">👥</span>
          User Management
        </h1>
        <p className="text-indigo-100 mt-2">Manage all library members</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm font-semibold">Total Users</p>
          <p className="text-4xl font-black mt-2">{users.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm font-semibold">Active Users</p>
          <p className="text-4xl font-black mt-2">{users.filter(u => u.isActive).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <p className="text-amber-100 text-sm font-semibold">With Seats</p>
          <p className="text-4xl font-black mt-2">{users.filter(u => u.seatNumber).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-red-100 text-sm font-semibold">Blocked</p>
          <p className="text-4xl font-black mt-2">{users.filter(u => u.isBlocked).length}</p>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monthly Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.seatNumber 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.seatNumber ? `Seat ${user.seatNumber}` : 'No Seat'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{user.monthlyFee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isBlocked 
                        ? 'bg-red-100 text-red-800'
                        : user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isBlocked ? 'Blocked' : user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-all"
                        title="Edit User"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => openSeatModal(user)}
                        className="text-purple-600 hover:text-purple-900 font-semibold px-3 py-1 rounded-lg hover:bg-purple-50 transition-all"
                        title="Manage Seat"
                      >
                        💺 Seat
                      </button>
                      {user.seatNumber && (
                        <button
                          onClick={() => handleUnassignSeat(user)}
                          className="text-orange-600 hover:text-orange-900 font-semibold px-3 py-1 rounded-lg hover:bg-orange-50 transition-all"
                          title="Unassign Seat"
                        >
                          🚫 Remove
                        </button>
                      )}
                      <button
                        onClick={() => openHistoryModal(user)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                        title="View History"
                      >
                        📜 History
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user._id, user.isBlocked)}
                        className={`${
                          user.isBlocked
                            ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                        } font-semibold px-3 py-1 rounded-lg transition-all`}
                      >
                        {user.isBlocked ? '✅ Unblock' : '⛔ Block'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No users found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>✏️</span> Edit User: {selectedUser.name}
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter name"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter email"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter phone"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  📝 Reason for Change (Optional)
                </label>
                <textarea
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="E.g., User provided wrong number"
                  rows={3}
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
                onClick={handleUpdateUser}
                disabled={isEditing}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform animate-scale-in">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white flex items-center gap-2">
                    <span>📜</span> Change History: {selectedUser.name}
                  </h3>
                  <p className="text-purple-100 mt-1">Track all profile modifications</p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-white/80 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-black text-gray-900">{changeHistory.length}</div>
                  <div className="text-sm text-gray-600 font-semibold">Total Changes</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="text-3xl mb-2">👤</div>
                  <div className="text-2xl font-black text-blue-600">{getStatCount('name')}</div>
                  <div className="text-sm text-gray-600 font-semibold">Name Changes</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="text-3xl mb-2">✉️</div>
                  <div className="text-2xl font-black text-purple-600">{getStatCount('email')}</div>
                  <div className="text-sm text-gray-600 font-semibold">Email Changes</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md">
                  <div className="text-3xl mb-2">📱</div>
                  <div className="text-2xl font-black text-green-600">{getStatCount('phone')}</div>
                  <div className="text-sm text-gray-600 font-semibold">Phone Changes</div>
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div className="p-6 overflow-y-auto max-h-96">
              {changeHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 text-lg font-semibold">No change history found</p>
                  <p className="text-gray-400 text-sm mt-2">This user hasn't made any profile changes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {changeHistory.map((change) => (
                    <div key={change._id} className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-purple-200 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-3 flex-shrink-0">
                          <span className="text-3xl">{getChangeTypeIcon(change.changeType)}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-black text-gray-900 capitalize">
                              {change.changeType} Changed
                            </h4>
                            <span className="text-xs text-gray-500 font-semibold">
                              {new Date(change.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                              <p className="text-xs text-red-700 font-bold mb-1">OLD VALUE</p>
                              <p className="text-sm text-red-900 font-semibold break-all">{change.oldValue}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                              <p className="text-xs text-green-700 font-bold mb-1">NEW VALUE</p>
                              <p className="text-sm text-green-900 font-semibold break-all">{change.newValue}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                change.changedByRole === 'user' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : change.changedByRole === 'admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {change.changedByRole === 'user' ? '👤 By User' : 
                                 change.changedByRole === 'admin' ? '🛡️ By Admin' : 
                                 '👑 By Super Admin'}
                              </span>
                              <span className="text-gray-600 font-semibold">
                                {change.changedBy.name}
                              </span>
                            </div>
                            {change.reason && (
                              <span className="text-gray-500 italic text-xs">
                                "{change.reason}"
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Assignment Modal */}
      {showSeatModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>💺</span> Manage Seat: {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowSeatModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <p className="text-sm font-bold text-purple-900">
                  Current Seat: {selectedUser.seatNumber ? `Seat ${selectedUser.seatNumber}` : 'No seat assigned'}
                </p>
                <p className="text-sm text-purple-700 mt-1">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {selectedUser.seatNumber ? 'Change to Seat' : 'Assign Seat'}
                </label>
                <select
                  value={seatForm.seatNumber}
                  onChange={(e) => setSeatForm({ seatNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Select a seat...</option>
                  {seats
                    .filter(s => !s.isOccupied || s.seatNumber === selectedUser.seatNumber)
                    .map(seat => (
                      <option key={seat._id} value={seat.seatNumber}>
                        Seat {seat.seatNumber} {seat.seatNumber === selectedUser.seatNumber ? '(Current)' : ''}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {seats.filter(s => !s.isOccupied).length} available seats
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSeatModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSeat}
                disabled={isEditing || !seatForm.seatNumber}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isEditing ? 'Assigning...' : selectedUser.seatNumber ? 'Change Seat' : 'Assign Seat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
