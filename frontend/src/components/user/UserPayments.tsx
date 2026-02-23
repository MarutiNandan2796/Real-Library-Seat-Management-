import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from '../common/Card';
import { toast } from 'react-hot-toast';

interface Payment {
  _id: string;
  amount: number;
  month: string;
  year: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const UserPayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchPayments();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/user/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (payment: Payment) => {
    try {
      setProcessingPaymentId(payment._id);
      const token = localStorage.getItem('token');

      // Create Razorpay order
      const orderResponse = await axios.post(
        'http://localhost:5000/api/user/payments/create-order',
        { paymentId: payment._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, keyId } = orderResponse.data.data;

      // Get user data
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Library Management System',
        description: `Payment for ${payment.month} ${payment.year}`,
        order_id: orderId,
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#3B82F6'
        },
        handler: async function (response: RazorpayResponse) {
          await verifyPayment(response);
        },
        modal: {
          ondismiss: function () {
            setProcessingPaymentId(null);
            toast.error('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setProcessingPaymentId(null);
    }
  };

  const verifyPayment = async (response: RazorpayResponse) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        'http://localhost:5000/api/user/payments/verify',
        {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Payment successful! 🎉', {
        icon: '✅',
        duration: 4000,
      });
      
      setProcessingPaymentId(null);
      fetchPayments(); // Refresh payments
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment verification failed');
      setProcessingPaymentId(null);
    }
  };

  const viewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const downloadReceipt = () => {
    if (!selectedPayment) return;
    
    // Create receipt content
    const receiptContent = `
      LIBRARY MANAGEMENT SYSTEM
      ------------------------
      Payment Receipt
      
      Receipt ID: ${selectedPayment.razorpayPaymentId || 'N/A'}
      Date: ${selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleString() : 'N/A'}
      
      Payment Details:
      Period: ${selectedPayment.month} ${selectedPayment.year}
      Amount: ₹${selectedPayment.amount}
      Status: ${selectedPayment.paymentStatus.toUpperCase()}
      
      Thank you for your payment!
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${selectedPayment._id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Receipt downloaded!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
            💳
          </div>
        </div>
      </div>
    );
  }

  const totalPaid = payments.filter(p => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.paymentStatus === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const paidCount = payments.filter(p => p.paymentStatus === 'paid').length;
  const pendingCount = payments.filter(p => p.paymentStatus === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative">
          <h1 className="text-4xl font-black text-white flex items-center gap-3">
            <span className="text-5xl animate-bounce-slow">💳</span>
            My Payments
          </h1>
          <p className="text-blue-100 mt-2 text-lg">Track your payment history and pending dues</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-semibold">Total Paid</p>
              <p className="text-5xl font-black mt-2">₹{totalPaid.toLocaleString()}</p>
            </div>
            <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">✅</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-semibold">Pending</p>
              <p className="text-5xl font-black mt-2">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">⏳</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-semibold">Paid Count</p>
              <p className="text-5xl font-black mt-2">{paidCount}</p>
            </div>
            <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">📊</div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-semibold">Pending Count</p>
              <p className="text-5xl font-black mt-2">{pendingCount}</p>
            </div>
            <div className="text-6xl opacity-20 group-hover:opacity-40 transition-opacity">🔔</div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-3xl">📊</span> Payment History
        </h2>
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-7xl mb-4 animate-bounce-slow">💰</div>
            <p className="text-gray-500 text-lg font-semibold">No payment records yet</p>
            <p className="text-gray-400 text-sm mt-2">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Paid Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        {payment.month} {payment.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-black text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        payment.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : payment.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {payment.paymentStatus === 'paid' && '✅ '}
                        {payment.paymentStatus === 'pending' && '⏳ '}
                        {payment.paymentStatus === 'failed' && '❌ '}
                        {payment.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {new Date(payment.dueDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.paymentStatus === 'pending' && (
                        <button 
                          onClick={() => handlePayNow(payment)}
                          disabled={processingPaymentId === payment._id}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center gap-2"
                        >
                          {processingPaymentId === payment._id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              💳 Pay Now
                            </>
                          )}
                        </button>
                      )}
                      {payment.paymentStatus === 'paid' && (
                        <button 
                          onClick={() => viewReceipt(payment)}
                          className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2 border border-gray-300"
                        >
                          📄 Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h3 className="text-2xl font-black flex items-center gap-2">
                <span className="text-3xl">🧾</span>
                Payment Receipt
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center py-4">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-2xl font-black text-green-600">Payment Successful!</p>
              </div>
              
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-semibold">Receipt ID:</span>
                  <span className="font-bold text-gray-900 text-sm">{selectedPayment.razorpayPaymentId?.slice(0, 20) || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-semibold">Period:</span>
                  <span className="font-bold text-gray-900">{selectedPayment.month} {selectedPayment.year}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-semibold">Amount:</span>
                  <span className="font-black text-2xl text-green-600">₹{selectedPayment.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600 font-semibold">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    ✅ PAID
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-semibold">Date:</span>
                  <span className="font-bold text-gray-900">
                    {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={downloadReceipt}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPayments;
