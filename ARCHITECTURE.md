# Library Management System - Architecture Documentation

## 📋 System Overview

A full-stack Library Management System with role-based access control for Admin and Users.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + React Router
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Razorpay (Best for India - supports UPI, Cards, NetBanking)
- **State Management**: React Context API / Redux Toolkit

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  Admin Portal    │      │   User Portal    │       │
│  │  - Dashboard     │      │   - Dashboard    │       │
│  │  - User Mgmt     │      │   - Payments     │       │
│  │  - Seats Mgmt    │      │   - Helpdesk     │       │
│  │  - Payments      │      │   - Messages     │       │
│  │  - Messaging     │      └──────────────────┘       │
│  │  - Helpdesk      │                                  │
│  └──────────────────┘                                  │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Authentication Middleware                 │  │
│  │         (JWT Verification + Role Check)          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │   Auth     │  │   Admin    │  │    User    │       │
│  │   Routes   │  │   Routes   │  │   Routes   │       │
│  └────────────┘  └────────────┘  └────────────┘       │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │  Payment   │  │  Message   │  │ Complaint  │       │
│  │  Routes    │  │  Routes    │  │   Routes   │       │
│  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                        │
│                     MongoDB Atlas                       │
│                                                          │
│  Collections:                                            │
│  • users         (Admin + Users)                        │
│  • seats         (Seating management)                   │
│  • payments      (Payment transactions)                 │
│  • messages      (Admin → User messages)                │
│  • complaints    (User → Admin complaints)              │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                         │
│  • Razorpay Payment Gateway                             │
│  • Email Service (optional - NodeMailer)                │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### 1. User Collection
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  phone: string,
  role: "admin" | "user",
  seatNumber: number | null,
  monthlyFee: number,
  isActive: boolean,           // Admin can deactivate users
  isBlocked: boolean,           // Admin can block temporarily
  joiningDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Seat Collection
```typescript
{
  _id: ObjectId,
  seatNumber: number (unique),
  isOccupied: boolean,
  assignedTo: ObjectId (ref: User) | null,
  assignedDate: Date | null,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Payment Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  amount: number,
  month: string,              // "January 2026"
  year: number,               // 2026
  paymentStatus: "pending" | "paid" | "failed",
  razorpayOrderId: string,
  razorpayPaymentId: string | null,
  razorpaySignature: string | null,
  paidAt: Date | null,
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Message Collection
```typescript
{
  _id: ObjectId,
  adminId: ObjectId (ref: User),
  recipientType: "all" | "selected",
  recipients: [ObjectId] (ref: User),  // Empty if "all"
  title: string,
  message: string,
  isRead: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Complaint Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  subject: string,
  description: string,
  status: "pending" | "resolved",
  adminResponse: string | null,
  createdAt: Date,
  resolvedAt: Date | null,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Authorization Flow

### User Registration (Admin Only)
1. Admin logs into admin portal
2. Admin creates new user account
3. System hashes password with bcrypt
4. User record saved to MongoDB
5. Optional: Send welcome email with credentials

### Login Flow
```
1. User enters email + password
2. Backend validates credentials
3. If valid:
   - Generate JWT token (payload: userId, role)
   - Return token + user data
4. Frontend stores token in localStorage
5. All API calls include token in Authorization header
```

### Protected Route Check
```
Middleware checks:
1. Is JWT token present?
2. Is token valid and not expired?
3. Does user have required role?
   - Admin routes: role === "admin"
   - User routes: role === "user"
4. Is user active and not blocked?
```

### Admin Disabling User Account
Admin can disable a user in 3 ways:

1. **Deactivate Account** (`isActive = false`)
   - User cannot login
   - Seat remains assigned
   - Data preserved
   - Can be reactivated later

2. **Block User** (`isBlocked = true`)
   - Temporary suspension
   - User sees "Account blocked" message
   - No system access until unblocked

3. **Permanent Delete**
   - Complete removal from database
   - Seat becomes available
   - Cannot be recovered
   - Use when user leaves library permanently

---

## 🔄 Payment Integration Flow (Razorpay)

**Why Razorpay?**
- Best for Indian market
- Supports UPI, Cards, NetBanking, Wallets
- Easy integration
- Automatic payment verification
- Lower transaction fees than Stripe in India

### Payment Process
```
1. Admin sends monthly fee request
   → Creates payment record with "pending" status

2. User clicks "Pay Now" in dashboard
   → Frontend calls backend: POST /api/payment/create-order
   → Backend creates Razorpay order
   → Returns order_id

3. Frontend opens Razorpay checkout
   → User completes payment on Razorpay

4. Razorpay redirects to callback
   → Frontend sends payment details to backend
   → Backend verifies signature
   → Updates payment status to "paid"

5. User sees success message
   → Payment appears in history
   → Admin sees updated revenue
```

---

## 📡 API Routes Structure

### Authentication Routes
```
POST   /api/auth/login              - User/Admin login
POST   /api/auth/logout             - Logout (optional)
GET    /api/auth/verify             - Verify token
```

### Admin Routes (Protected - Admin only)
```
GET    /api/admin/dashboard         - Dashboard stats
GET    /api/admin/users             - List all users
POST   /api/admin/users             - Create new user
PUT    /api/admin/users/:id         - Update user
DELETE /api/admin/users/:id         - Delete user
PATCH  /api/admin/users/:id/block   - Block/unblock user
PATCH  /api/admin/users/:id/activate - Activate/deactivate

GET    /api/admin/seats             - List all seats
POST   /api/admin/seats/assign      - Assign seat to user
PUT    /api/admin/seats/reassign    - Reassign seat

POST   /api/admin/payments/send-request - Send fee request
GET    /api/admin/payments/status   - Payment status report

POST   /api/admin/messages          - Send message to users
GET    /api/admin/messages          - Get all sent messages

GET    /api/admin/complaints        - Get all complaints
PATCH  /api/admin/complaints/:id    - Mark as resolved
```

### User Routes (Protected - User only)
```
GET    /api/user/dashboard          - User dashboard data
GET    /api/user/profile            - User profile
PUT    /api/user/profile            - Update profile

POST   /api/user/payments/create-order - Create Razorpay order
POST   /api/user/payments/verify    - Verify payment
GET    /api/user/payments/history   - Payment history

GET    /api/user/messages           - Get messages from admin
PATCH  /api/user/messages/:id/read  - Mark message as read

POST   /api/user/complaints         - Submit complaint
GET    /api/user/complaints         - Get user's complaints
```

---

## 🎨 Frontend Component Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Loading.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── SeatManagement.tsx
│   │   ├── PaymentManagement.tsx
│   │   ├── MessageCenter.tsx
│   │   └── ComplaintsList.tsx
│   └── user/
│       ├── UserDashboard.tsx
│       ├── PaymentPage.tsx
│       ├── MessagesList.tsx
│       └── ComplaintsPage.tsx
├── pages/
│   ├── Login.tsx
│   ├── AdminPanel.tsx
│   └── UserPanel.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── admin.service.ts
│   └── user.service.ts
├── types/
│   └── index.ts
├── utils/
│   ├── constants.ts
│   └── helpers.ts
└── App.tsx
```

---

## 🚀 Future Scalability Suggestions

1. **Notification System**
   - Email notifications for payments
   - SMS alerts for important updates
   - Push notifications (PWA)

2. **Advanced Analytics**
   - Revenue charts and trends
   - User attendance tracking
   - Seat utilization reports

3. **Mobile App**
   - React Native app for iOS/Android
   - Share backend API

4. **Automated Features**
   - Auto-generate monthly fee requests
   - Auto-reminder for pending payments
   - Seat auto-assignment based on availability

5. **Additional Features**
   - QR code for seat check-in
   - Booking system for hourly seats
   - Library rules and documents section
   - User feedback and ratings

6. **Performance Optimization**
   - Redis caching for frequently accessed data
   - CDN for static assets
   - Database indexing for faster queries

7. **Security Enhancements**
   - 2FA authentication
   - IP-based access control
   - Rate limiting on APIs
   - HTTPS enforcement

8. **Multi-location Support**
   - Support for multiple library branches
   - Branch-wise admin accounts
   - Centralized super admin

---

## 🛡️ Security Best Practices Implemented

1. **Password Security**
   - Bcrypt hashing with salt rounds
   - Never store plain text passwords

2. **JWT Token Security**
   - Short expiration time (7 days)
   - Stored in httpOnly cookies (recommended) or localStorage
   - Refresh token mechanism (optional)

3. **API Security**
   - Role-based access control middleware
   - Input validation and sanitization
   - Rate limiting to prevent abuse

4. **Payment Security**
   - Server-side signature verification
   - Never expose Razorpay secret key to frontend
   - Webhook for payment confirmation

5. **Database Security**
   - MongoDB connection with authentication
   - Environment variables for sensitive data
   - No direct database exposure

---

## 📦 Project Setup Requirements

### Backend Dependencies
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.0.0",
  "typescript": "^5.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0",
  "razorpay": "^2.9.0",
  "dotenv": "^16.0.0",
  "cors": "^2.8.5",
  "express-validator": "^7.0.0"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.10.0",
  "axios": "^1.4.0",
  "tailwindcss": "^3.3.0",
  "react-hot-toast": "^2.4.1"
}
```

---

## 🎯 Development Roadmap

**Phase 1: Foundation (Week 1-2)**
- Project setup and folder structure
- Database schema design
- Authentication system

**Phase 2: Admin Features (Week 3-4)**
- Admin dashboard
- User management
- Seat management

**Phase 3: User Features (Week 5-6)**
- User dashboard
- Payment integration
- Messaging system

**Phase 4: Additional Features (Week 7-8)**
- Complaint system
- Testing and bug fixes
- Deployment

---

This architecture ensures scalability, security, and maintainability while meeting all your requirements!
