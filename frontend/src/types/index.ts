export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  isSuperAdmin: boolean;
  adminStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  seatNumber: number | null;
  monthlyFee: number;
  isActive: boolean;
  isBlocked: boolean;
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  _id: string;
  seatNumber: number;
  isOccupied: boolean;
  assignedTo: User | null;
  assignedDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  userId: string | User;
  amount: number;
  month: string;
  year: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  adminId: string | User;
  recipientType: 'all' | 'selected';
  recipients: string[] | User[];
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  userId: string | User;
  subject: string;
  description: string;
  status: 'pending' | 'resolved';
  adminResponse: string | null;
  createdAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface AdminDashboardStats {
  totalActiveUsers: number;
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  monthlyRevenue: number;
  pendingPayments: number;
  pendingComplaints: number;
  recentUsers: User[];
}

export interface UserDashboardData {
  user: User;
  pendingPayment: Payment | null;
  recentMessages: Message[];
  pendingComplaintsCount: number;
  paymentHistory: Payment[];
}

export interface PaymentSummary {
  total: number;
  paid: number;
  pending: number;
  failed: number;
  totalAmount: number;
  paidAmount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
