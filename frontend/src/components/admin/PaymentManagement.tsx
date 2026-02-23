import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    seatNumber: number;
    phone: string;
  };
  createdBy?: {
    name: string;
    email: string;
  };
  amount: number;
  month: string;
  year: number;
  description?: string;
  paymentType: 'monthly_fee' | 'custom';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paidAt: string | null;
  createdAt: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  seatNumber: number;
}

interface BankAccount {
  _id?: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'savings' | 'current';
  upiId?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
}

interface DashboardStats {
  totalPayments: number;
  paidCount: number;
  pendingCount: number;
  failedCount: number;
  totalAmount: number;
  totalReceived: number;
  totalPending: number;
}

const PaymentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bank' | 'requests' | 'history'>('dashboard');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');

  // Bank Account State
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    accountType: 'savings',
    upiId: '',
    razorpayKeyId: '',
    razorpayKeySecret: '',
  });

  // Custom Payment Request State
  const [paymentRequest, setPaymentRequest] = useState({
    userId: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchDashboard();
    fetchPayments();
    fetchUsers();
    fetchBankAccount();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payments/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data.statistics);
    } catch (error) {
      console.error('Failed to fetch dashboard');
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payments/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
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
      const allUsers = response.data.data || [];
      setUsers(allUsers.filter((u: any) => u.role === 'user'));
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchBankAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payments/admin/bank-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.data) {
        setBankAccount(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank account');
    }
  };

  const handleSaveBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/payments/admin/bank-account',
        bankAccount,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Bank account saved successfully! 🏦');
      fetchBankAccount();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save bank account');
    }
  };

  const handleCreatePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/payments/admin/create-custom-request',
        paymentRequest,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Payment request sent successfully! 💸');
      setPaymentRequest({ userId: '', amount: '', description: '', dueDate: '' });
      fetchPayments();
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create payment request');
    }
  };

  const filteredPayments = payments.filter(p => 
    filter === 'all' ? true : p.paymentStatus === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 shadow-xl">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <span className="text-4xl">💰</span>
          Payment Management System
        </h1>
        <p className="text-emerald-100 mt-2">Manage bank account, create requests & track all payments</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-md p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl mr-2">📊</span>
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'bank'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl mr-2">🏦</span>
            Bank Account
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'requests'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl mr-2">💸</span>
            Create Request
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-xl mr-2">📜</span>
            Payment History
          </button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white transform hover:scale-105 transition-all">
              <p className="text-purple-100 text-sm font-semibold">Total Revenue</p>
              <p className="text-4xl font-black mt-2">₹{stats.totalAmount.toLocaleString()}</p>
              <p className="text-purple-200 text-xs mt-2">{stats.totalPayments} payments</p>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white transform hover:scale-105 transition-all">
              <p className="text-green-100 text-sm font-semibold">💚 Received</p>
              <p className="text-4xl font-black mt-2">₹{stats.totalReceived.toLocaleString()}</p>
              <p className="text-green-200 text-xs mt-2">{stats.paidCount} paid</p>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white transform hover:scale-105 transition-all">
              <p className="text-amber-100 text-sm font-semibold">⏳ Pending</p>
              <p className="text-4xl font-black mt-2">₹{stats.totalPending.toLocaleString()}</p>
              <p className="text-amber-200 text-xs mt-2">{stats.pendingCount} pending</p>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white transform hover:scale-105 transition-all">
              <p className="text-red-100 text-sm font-semibold">❌ Failed</p>
              <p className="text-4xl font-black mt-2">{stats.failedCount}</p>
              <p className="text-red-200 text-xs mt-2">failed transactions</p>
            </Card>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-lg font-semibold mb-2">Total Balance Received</p>
                <p className="text-6xl font-black text-white">₹{stats.totalReceived.toLocaleString()}</p>
                <p className="text-indigo-200 mt-3 text-sm">
                  Collection Rate: {stats.totalPayments > 0 ? Math.round((stats.paidCount / stats.totalPayments) * 100) : 0}%
                </p>
              </div>
              <div className="text-8xl opacity-20">💰</div>
            </div>
          </div>
        </>
      )}

      {/* Filters */}
      <Card>
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({payments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({payments.filter(p => p.paymentStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'paid'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid ({payments.filter(p => p.paymentStatus === 'paid').length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Failed ({payments.filter(p => p.paymentStatus === 'failed').length})
          </button>
        </div>
      </Card>

      {/* Bank Account Tab */}
      {activeTab === 'bank' && (
        <Card>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-2">
                <span className="text-3xl">🏦</span>
                Bank Account Details
              </h3>
              <p className="text-gray-600">Set up your receiving account to accept payments from users</p>
            </div>

            <form onSubmit={handleSaveBankAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Holder Name *</label>
                  <input
                    type="text"
                    value={bankAccount.accountHolderName}
                    onChange={(e) => setBankAccount({...bankAccount, accountHolderName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bank Name *</label>
                  <input
                    type="text"
                    value={bankAccount.bankName}
                    onChange={(e) => setBankAccount({...bankAccount, bankName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Number *</label>
                  <input
                    type="text"
                    value={bankAccount.accountNumber}
                    onChange={(e) => setBankAccount({...bankAccount, accountNumber: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">IFSC Code *</label>
                  <input
                    type="text"
                    value={bankAccount.ifscCode}
                    onChange={(e) => setBankAccount({...bankAccount, ifscCode: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Branch Name *</label>
                  <input
                    type="text"
                    value={bankAccount.branchName}
                    onChange={(e) => setBankAccount({...bankAccount, branchName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Account Type *</label>
                  <select
                    value={bankAccount.accountType}
                    onChange={(e) => setBankAccount({...bankAccount, accountType: e.target.value as 'savings' | 'current'})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                  >
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={bankAccount.upiId}
                    onChange={(e) => setBankAccount({...bankAccount, upiId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                    placeholder="yourname@upi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Razorpay Key ID (Optional)</label>
                  <input
                    type="text"
                    value={bankAccount.razorpayKeyId}
                    onChange={(e) => setBankAccount({...bankAccount, razorpayKeyId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-black text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg"
              >
                💾 Save Bank Account Details
              </button>
            </form>
          </div>
        </Card>
      )}

      {/* Create Payment Request Tab */}
      {activeTab === 'requests' && (
        <Card>
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-2">
                <span className="text-3xl">💸</span>
                Create Custom Payment Request
              </h3>
              <p className="text-gray-600">Send personalized payment requests to users with custom amounts</p>
            </div>

            <form onSubmit={handleCreatePaymentRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select User *</label>
                <select
                  value={paymentRequest.userId}
                  onChange={(e) => setPaymentRequest({...paymentRequest, userId: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-600"
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} - {user.email} (Seat: {user.seatNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₹) *</label>
                  <input
                    type="number"
                    value={paymentRequest.amount}
                    onChange={(e) => setPaymentRequest({...paymentRequest, amount: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-600"
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={paymentRequest.dueDate}
                    onChange={(e) => setPaymentRequest({...paymentRequest, dueDate: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={paymentRequest.description}
                  onChange={(e) => setPaymentRequest({...paymentRequest, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-600"
                  rows={4}
                  placeholder="e.g., Additional charges for AC usage, Security deposit, etc."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-black text-lg hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all shadow-lg"
              >
                📤 Send Payment Request
              </button>
            </form>
          </div>
        </Card>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <>
          {/* Filters */}
          <Card>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({payments.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  filter === 'pending'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⏳ Pending ({payments.filter(p => p.paymentStatus === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  filter === 'paid'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ✅ Paid ({payments.filter(p => p.paymentStatus === 'paid').length})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  filter === 'failed'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ❌ Failed ({payments.filter(p => p.paymentStatus === 'failed').length})
              </button>
            </div>
          </Card>

          {/* Payments Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y-2 divide-gray-300">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{payment.userId.name}</div>
                          <div className="text-xs text-gray-500">{payment.userId.email}</div>
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                            Seat #{payment.userId.seatNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          payment.paymentType === 'monthly_fee'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {payment.paymentType === 'monthly_fee' ? '📅 Monthly' : '💰 Custom'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {payment.description || `${payment.month} ${payment.year}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-black text-gray-900">
                          ₹{payment.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          payment.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : payment.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.paymentStatus === 'paid' && '✅ '}
                          {payment.paymentStatus === 'pending' && '⏳ '}
                          {payment.paymentStatus === 'failed' && '❌ '}
                          {payment.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString('en-IN')
                          : new Date(payment.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-gray-500 text-xl font-bold">No payments found</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default PaymentManagement;
