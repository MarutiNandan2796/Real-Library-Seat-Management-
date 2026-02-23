import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface TimeSlotChange {
  _id: string;
  seatNumber: number;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  previousSlots: Array<{
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  updatedSlots: Array<{
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  changeNotes?: string;
  changeType: 'created' | 'updated' | 'deleted';
  createdAt: string;
}

interface Props {
  seatNumber?: number;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const TimeSlotHistory: React.FC<Props> = ({ seatNumber, userId, isOpen, onClose }) => {
  const [history, setHistory] = useState<TimeSlotChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (isOpen && (seatNumber || userId)) {
      fetchHistory();
    }
  }, [isOpen, seatNumber, userId, page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = seatNumber
        ? `http://localhost:5000/api/admin/seats/${seatNumber}/timeslots/history?page=${page}`
        : `http://localhost:5000/api/admin/users/${userId}/timeslots/history?page=${page}`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setHistory(response.data.data.history || []);
      setTotalPages(response.data.data.pagination?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to fetch time slot history');
    } finally {
      setLoading(false);
    }
  };

  const formatSlotDisplay = (slot: any) => {
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    const durationStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;
    return `${slot.startTime} - ${slot.endTime} (${durationStr}) ${slot.label ? `[${slot.label}]` : ''}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 transform animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <span>📋</span> Time Slot Update History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">📭 No history available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((change, index) => (
              <div key={change._id} className="border-l-4 border-purple-500 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {change.changeType === 'created' && '✨ Created'}
                      {change.changeType === 'updated' && '✏️ Updated'}
                      {change.changeType === 'deleted' && '🗑️ Deleted'}
                      {' '}by {change.adminId.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      📧 {change.adminId.email}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(change.createdAt).toLocaleDateString()}</p>
                    <p>{new Date(change.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                {change.userId && (
                  <div className="mb-3 text-sm bg-blue-50 p-2 rounded">
                    <p className="text-blue-800">
                      👤 User: <strong>{change.userId.name}</strong> ({change.userId.email})
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {change.previousSlots && change.previousSlots.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-600 uppercase mb-2">Previous Slots</p>
                      <div className="space-y-1">
                        {change.previousSlots.map((slot, idx) => (
                          <div key={idx} className="bg-red-100 text-red-800 px-3 py-2 rounded text-xs">
                            {formatSlotDisplay(slot)}
                          </div>
                        ))}
                        {change.previousSlots.length === 0 && (
                          <p className="text-gray-400 text-xs italic">None</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-gray-600 uppercase mb-2">Updated Slots</p>
                    <div className="space-y-1">
                      {change.updatedSlots.map((slot, idx) => (
                        <div key={idx} className="bg-green-100 text-green-800 px-3 py-2 rounded text-xs">
                          {formatSlotDisplay(slot)}
                        </div>
                      ))}
                      {change.updatedSlots.length === 0 && (
                        <p className="text-gray-400 text-xs italic">None</p>
                      )}
                    </div>
                  </div>
                </div>

                {change.changeNotes && (
                  <div className="bg-yellow-50 border-l-2 border-yellow-500 p-3 rounded text-sm">
                    <p className="text-gray-700">
                      <strong>📝 Notes:</strong> {change.changeNotes}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <p className="text-gray-600 font-bold">
                  Page {page} of {totalPages}
                </p>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotHistory;
