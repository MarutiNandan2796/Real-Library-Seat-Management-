import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import TimeSlotHistory from './TimeSlotHistory';
import { toast } from 'react-hot-toast';

interface TimeSlot {
  startTime: string;
  endTime: string;
  label?: string;
  duration?: number;
}

interface Seat {
  _id: string;
  seatNumber: number;
  isOccupied: boolean;
  studyDuration: number;
  timeSlots: TimeSlot[];
  timeSlotsUpdatedAt?: string;
  timeSlotsUpdatedBy?: {
    _id: string;
    name: string;
  };
  currentUser: {
    _id: string;
    name: string;
    email: string;
  } | null;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

interface User {
  _id: string;
  name: string;
  email: string;
  seatNumber: number | null;
}

const SeatManagement: React.FC = () => {
  // Helper functions
  const formatDurationMinutes = (minutes: number): string => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };
  const [seats, setSeats] = useState<Seat[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showTimeSlotHistoryModal, setShowTimeSlotHistoryModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [createForm, setCreateForm] = useState({ startNumber: '', endNumber: '' });
  const [assignForm, setAssignForm] = useState({ userId: '', seatNumber: '' });
  const [durationForm, setDurationForm] = useState({ studyDuration: '' });
  const [timeSlotForm, setTimeSlotForm] = useState<TimeSlot[]>([]);
  const [timeSlotNotes, setTimeSlotNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSeats();
    fetchUsers();
  }, []);

  const fetchSeats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/seats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map the data to ensure consistency
      const seatsData = (response.data.data?.seats || response.data.data || []).map((seat: any) => ({
        ...seat,
        currentUser: seat.assignedTo || seat.currentUser || null
      }));
      
      setSeats(seatsData);
    } catch (error) {
      toast.error('Failed to fetch seats');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data?.users || response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleCreateSeats = async () => {
    const startNumber = parseInt(createForm.startNumber);
    const endNumber = parseInt(createForm.endNumber);

    if (!startNumber || !endNumber) {
      toast.error('Please enter valid seat numbers');
      return;
    }

    if (startNumber > endNumber) {
      toast.error('Start number must be less than or equal to end number');
      return;
    }

    if (endNumber - startNumber > 100) {
      toast.error('Cannot create more than 100 seats at once');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/admin/seats/create',
        { startNumber, endNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || 'Seats created successfully');
      setShowCreateModal(false);
      setCreateForm({ startNumber: '', endNumber: '' });
      fetchSeats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create seats');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeat = async (seatNumber: number) => {
    if (!confirm(`Are you sure you want to delete seat ${seatNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/admin/seats/${seatNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Seat deleted successfully');
      fetchSeats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete seat');
    }
  };

  const handleAssignSeat = async () => {
    if (!assignForm.userId || !assignForm.seatNumber) {
      toast.error('Please select both user and seat');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/seats/assign',
        {
          userId: assignForm.userId,
          seatNumber: parseInt(assignForm.seatNumber)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Seat assigned successfully');
      setShowAssignModal(false);
      setAssignForm({ userId: '', seatNumber: '' });
      fetchSeats();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign seat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnassignSeat = async (seatNumber: number) => {
    if (!confirm(`Are you sure you want to unassign seat ${seatNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/admin/seats/unassign',
        { seatNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Seat unassigned successfully');
      fetchSeats();
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unassign seat');
    }
  };

  const openDurationModal = (seat: Seat) => {
    setSelectedSeat(seat);
    setDurationForm({ studyDuration: seat.studyDuration?.toString() || '0' });
    setShowDurationModal(true);
  };

  const handleUpdateDuration = async () => {
    if (!selectedSeat) return;

    const duration = parseFloat(durationForm.studyDuration);
    if (isNaN(duration) || duration < 0 || duration > 24) {
      toast.error('Study duration must be between 0 and 24 hours');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/seats/${selectedSeat.seatNumber}/duration`,
        { studyDuration: duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Study duration updated successfully');
      setShowDurationModal(false);
      fetchSeats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update duration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTimeSlotModal = (seat: Seat) => {
    setSelectedSeat(seat);
    setTimeSlotForm(seat.timeSlots?.length > 0 ? [...seat.timeSlots] : []);
    setTimeSlotNotes('');
    setShowTimeSlotModal(true);
  };

  const addTimeSlot = () => {
    setTimeSlotForm([...timeSlotForm, { startTime: '07:00', endTime: '10:00', label: '' }]);
  };

  const removeTimeSlot = (index: number) => {
    const updated = timeSlotForm.filter((_, i) => i !== index);
    setTimeSlotForm(updated);
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...timeSlotForm];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlotForm(updated);
  };

  const handleSaveTimeSlots = async () => {
    if (!selectedSeat) return;

    // Validate time slots
    for (const slot of timeSlotForm) {
      if (!slot.startTime || !slot.endTime) {
        toast.error('Please fill in all time slots');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/admin/seats/${selectedSeat.seatNumber}/timeslots`,
        { timeSlots: timeSlotForm, notes: timeSlotNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Time slots updated successfully');
      setShowTimeSlotModal(false);
      setTimeSlotNotes('');
      fetchSeats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update time slots');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const occupiedSeats = seats.filter(s => s.isOccupied).length;
  const availableSeats = seats.length - occupiedSeats;
  const occupancyRate = seats.length > 0 ? Math.round((occupiedSeats / seats.length) * 100) : 0;
  const usersWithoutSeats = users.filter(u => !u.seatNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <span className="text-4xl">💺</span>
              Seat Management
            </h1>
            <p className="text-purple-100 mt-2">Manage seat allocations, availability, and study time</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg flex items-center gap-2"
            >
              <span>➕</span> Add Seats
            </button>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-bold hover:from-green-600 hover:to-teal-600 transition-all shadow-lg flex items-center gap-2"
            >
              <span>🎯</span> Assign Seat
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <p className="text-indigo-100 text-sm font-semibold">Total Seats</p>
          <p className="text-4xl font-black mt-2">{seats.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm font-semibold">Occupied</p>
          <p className="text-4xl font-black mt-2">{occupiedSeats}</p>
        </Card>
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <p className="text-teal-100 text-sm font-semibold">Available</p>
          <p className="text-4xl font-black mt-2">{availableSeats}</p>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <p className="text-amber-100 text-sm font-semibold">Occupancy Rate</p>
          <p className="text-4xl font-black mt-2">{occupancyRate}%</p>
        </Card>
      </div>

      {/* Seats Grid */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Seat Layout</h2>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
          {seats.map((seat) => (
            <div
              key={seat._id}
              className={`relative aspect-square rounded-xl p-3 flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer group ${
                seat.isOccupied
                  ? 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg'
                  : 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg'
              }`}
              title={seat.currentUser ? `Occupied by ${seat.currentUser.name}` : 'Available'}
            >
              <span className="text-xl mb-1">
                {seat.isOccupied ? '🔴' : '🟢'}
              </span>
              <span className="text-xs font-bold">{seat.seatNumber}</span>
              {seat.studyDuration > 0 && (
                <span className="text-[8px] font-semibold mt-1">⏱️ {seat.studyDuration}h</span>
              )}
              
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center flex-col gap-1 p-1">
                {seat.isOccupied ? (
                  <>
                    <button
                      onClick={() => handleUnassignSeat(seat.seatNumber)}
                      className="text-[10px] px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white font-bold"
                    >
                      Unassign
                    </button>
                    <button
                      onClick={() => openDurationModal(seat)}
                      className="text-[10px] px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold"
                    >
                      Set Time
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDeleteSeat(seat.seatNumber)}
                    className="text-[10px] px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-white font-bold"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Occupied Seats Details */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Occupied Seats Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Seat Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time Slots
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seats
                .filter(seat => seat.isOccupied && seat.currentUser)
                .map((seat) => (
                  <tr key={seat._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                        Seat {seat.seatNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {seat.currentUser?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {seat.currentUser?.email}
                    </td>
                    <td className="px-6 py-4">
                      {seat.timeSlots && seat.timeSlots.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {seat.timeSlots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-semibold inline-block">
                                🕐 {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                ⏱️ {formatDurationMinutes(slot.duration || 0)}
                              </span>
                              {slot.label && (
                                <span className="text-xs text-gray-600 font-medium">
                                  ({slot.label})
                                </span>
                              )}
                            </div>
                          ))}
                          {seat.timeSlotsUpdatedAt && (
                            <div className="text-[10px] text-gray-500 mt-2 border-t pt-1">
                              <p>Updated: {new Date(seat.timeSlotsUpdatedAt).toLocaleDateString()} {new Date(seat.timeSlotsUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              {seat.timeSlotsUpdatedBy && (
                                <p>By: {seat.timeSlotsUpdatedBy.name}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No time slots set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => openTimeSlotModal(seat)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-50 transition-all"
                        >
                          🕐 Schedule
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSeat(seat);
                            setShowTimeSlotHistoryModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-900 font-semibold px-3 py-1 rounded-lg hover:bg-orange-50 transition-all"
                        >
                          📋 History
                        </button>
                        <button
                          onClick={() => openDurationModal(seat)}
                          className="text-blue-600 hover:text-blue-900 font-semibold px-3 py-1 rounded-lg hover:bg-blue-50 transition-all"
                        >
                          ⏱️ Duration
                        </button>
                        <button
                          onClick={() => handleUnassignSeat(seat.seatNumber)}
                          className="text-red-600 hover:text-red-900 font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                        >
                          ❌ Unassign
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {occupiedSeats === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No occupied seats</p>
            </div>
          )}
        </div>
      </Card>

      {/* Users Without Seats */}
      {usersWithoutSeats.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Users Without Seats ({usersWithoutSeats.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {usersWithoutSeats.map(user => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
      {/* Users Without Seats */}
      {usersWithoutSeats.length > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Users Without Seats ({usersWithoutSeats.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {usersWithoutSeats.map(user => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Seats Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>➕</span> Create New Seats
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Start Seat Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={createForm.startNumber}
                  onChange={(e) => setCreateForm({ ...createForm, startNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  placeholder="e.g., 1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  End Seat Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={createForm.endNumber}
                  onChange={(e) => setCreateForm({ ...createForm, endNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                  placeholder="e.g., 50"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-800 font-semibold">
                  ℹ️ This will create seats from {createForm.startNumber || '...'} to {createForm.endNumber || '...'}
                  {createForm.startNumber && createForm.endNumber && 
                    ` (${parseInt(createForm.endNumber) - parseInt(createForm.startNumber) + 1} seats)`
                  }
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSeats}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Seats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Seat Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>🎯</span> Assign Seat to User
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                >
                  <option value="">Choose a user...</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email} {user.seatNumber && `(Currently: Seat ${user.seatNumber})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Seat
                </label>
                <select
                  value={assignForm.seatNumber}
                  onChange={(e) => setAssignForm({ ...assignForm, seatNumber: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all"
                >
                  <option value="">Choose a seat...</option>
                  {seats
                    .filter(s => !s.isOccupied)
                    .map(seat => (
                      <option key={seat._id} value={seat.seatNumber}>
                        Seat {seat.seatNumber}
                      </option>
                    ))}
                </select>
                {availableSeats === 0 && (
                  <p className="text-sm text-red-600 mt-2 font-semibold">
                    ⚠️ No available seats. Create new seats or unassign existing ones.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSeat}
                disabled={isSubmitting || availableSeats === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Assigning...' : 'Assign Seat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Duration Modal */}
      {showDurationModal && selectedSeat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>⏱️</span> Set Study Duration
              </h3>
              <button
                onClick={() => setShowDurationModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <p className="text-sm font-bold text-purple-900">Seat {selectedSeat.seatNumber}</p>
                {selectedSeat.currentUser && (
                  <p className="text-sm text-purple-700 mt-1">
                    User: {selectedSeat.currentUser.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Study Duration (hours per day)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={durationForm.studyDuration}
                  onChange={(e) => setDurationForm({ studyDuration: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  placeholder="e.g., 8"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Set how many hours per day this user can study on this seat (0-24 hours)
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDurationModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDuration}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Duration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot Modal */}
      {showTimeSlotModal && selectedSeat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 transform animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <span>🕐</span> Set Time Slots - Seat {selectedSeat.seatNumber}
              </h3>
              <button
                onClick={() => setShowTimeSlotModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <p className="text-sm font-bold text-indigo-900">
                  {selectedSeat.currentUser ? `User: ${selectedSeat.currentUser.name}` : 'No user assigned'}
                </p>
                <p className="text-xs text-indigo-700 mt-1">
                  Set multiple time slots for different sessions (e.g., Morning: 7-10 AM, Evening: 5-10 PM)
                </p>
              </div>

              {timeSlotForm.map((slot, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">Session {index + 1}</h4>
                    {timeSlotForm.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50"
                      >
                        ❌ Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Label (Optional)
                      </label>
                      <input
                        type="text"
                        value={slot.label || ''}
                        onChange={(e) => updateTimeSlot(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="e.g., Morning"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addTimeSlot}
                className="w-full px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                <span>➕</span> Add Another Time Slot
              </button>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📝 Update Notes (Optional)
                  </label>
                  <textarea
                    value={timeSlotNotes}
                    onChange={(e) => setTimeSlotNotes(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
                    placeholder="e.g., Updated morning slot for better productivity..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This note will be recorded in the update history for reference
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-900">
                  💡 Quick Presets:
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button
                    onClick={() => setTimeSlotForm([{ startTime: '07:00', endTime: '10:00', label: 'Morning' }])}
                    className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    Morning (7-10 AM)
                  </button>
                  <button
                    onClick={() => setTimeSlotForm([{ startTime: '17:00', endTime: '22:00', label: 'Evening' }])}
                    className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    Evening (5-10 PM)
                  </button>
                  <button
                    onClick={() => setTimeSlotForm([
                      { startTime: '07:00', endTime: '10:00', label: 'Morning' },
                      { startTime: '17:00', endTime: '22:00', label: 'Evening' }
                    ])}
                    className="px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-800 hover:bg-blue-100"
                  >
                    Both (Morning + Evening)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTimeSlotModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTimeSlots}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Time Slots'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Slot History Modal */}
      <TimeSlotHistory
        seatNumber={selectedSeat?.seatNumber}
        isOpen={showTimeSlotHistoryModal}
        onClose={() => {
          setShowTimeSlotHistoryModal(false);
          setSelectedSeat(null);
        }}
      />
    </div>
  );
};

export default SeatManagement;
