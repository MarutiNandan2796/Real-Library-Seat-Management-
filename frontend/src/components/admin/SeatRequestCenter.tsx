import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '@/services/api';
import Card from '@/components/common/Card';
import Loading from '@/components/common/Loading';
import toast from 'react-hot-toast';

interface SupportTicketUser {
  name?: string;
  email?: string;
  phone?: string;
  seatNumber?: number | null;
}

interface SupportTicket {
  _id: string;
  userId: string | SupportTicketUser;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

const SeatRequestCenter: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeatRequests();
  }, []);

  const loadSeatRequests = async () => {
    try {
      const response = await api.get('/support-tickets/admin');
      const allTickets: SupportTicket[] = response.data?.data?.tickets || [];

      const seatTickets = allTickets.filter((ticket: any) =>
        (ticket.subject || '').toLowerCase().includes('seat')
      );

      setTickets(seatTickets);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to load seat requests');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: 'in-progress' | 'resolved') => {
    try {
      await api.patch(`/support-tickets/admin/${id}`, {
        status,
        adminResponse:
          status === 'resolved'
            ? 'Seat request processed by admin.'
            : 'Seat request is being reviewed by admin.',
      });
      toast.success(
        status === 'resolved'
          ? 'Marked as resolved'
          : 'Marked as in-progress'
      );
      await loadSeatRequests();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to update request status');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center gap-3">
            <span className="text-4xl">🎯</span>
            Seat Requests
          </h1>
          <p className="text-indigo-100 text-sm">
            View and manage user requests for new seat allocations
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/seats')}
          className="px-5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-sm font-semibold border border-white/30 backdrop-blur-sm transition-all"
        >
          💺 Go to Seat Management
        </button>
      </div>

      {tickets.length === 0 ? (
        <Card className="bg-white text-center py-10">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-bold text-gray-900 mb-1">No Seat Requests</p>
          <p className="text-gray-600 text-sm">
            There are currently no open seat allocation requests from users.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {tickets.map((ticket) => {
            const user =
              typeof ticket.userId === 'string'
                ? undefined
                : (ticket.userId as SupportTicketUser);

            const createdDate = new Date(ticket.createdAt).toLocaleString();

            const statusColorMap: Record<SupportTicket['status'], string> = {
              open: 'bg-red-100 text-red-700',
              'in-progress': 'bg-yellow-100 text-yellow-800',
              resolved: 'bg-green-100 text-green-700',
              closed: 'bg-gray-100 text-gray-700',
            };

            const priorityColorMap: Record<SupportTicket['priority'], string> = {
              low: 'bg-slate-100 text-slate-700',
              medium: 'bg-blue-100 text-blue-700',
              high: 'bg-orange-100 text-orange-700',
              urgent: 'bg-red-100 text-red-700',
            };

            return (
              <Card
                key={ticket._id}
                className="bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Seat Allocation Request
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span className="text-xl">📩</span>
                      {ticket.subject}
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColorMap[ticket.status]}`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityColorMap[ticket.priority]}`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {user && (
                  <div className="mb-3 text-sm text-slate-700">
                    <p className="font-semibold">
                      👤 {user.name || 'Unknown user'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user.email} {user.phone && `• ${user.phone}`}
                    </p>
                    {typeof user.seatNumber !== 'undefined' && (
                      <p className="text-xs text-slate-500 mt-1">
                        Current Seat: {user.seatNumber ?? 'None'}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3">
                  {ticket.message}
                </p>

                <p className="text-xs text-slate-500 mb-4">⏰ Requested at: {createdDate}</p>

                <div className="flex flex-wrap gap-2 justify-end">
                  {ticket.status === 'open' && (
                    <button
                      onClick={() => updateStatus(ticket._id, 'in-progress')}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-yellow-500 hover:bg-yellow-600 text-white transition-all"
                    >
                      Start Review
                    </button>
                  )}
                  {(ticket.status === 'open' || ticket.status === 'in-progress') && (
                    <button
                      onClick={() => updateStatus(ticket._id, 'resolved')}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/admin/seats')}
                    className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all"
                  >
                    💺 Allocate Seat
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeatRequestCenter;
