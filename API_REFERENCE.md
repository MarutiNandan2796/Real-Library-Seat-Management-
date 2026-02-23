# 📡 API Routes Reference Guide

Complete reference for all API endpoints in the Library Management System.

---

## 🔑 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@library.com",
  "password": "admin123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

## 👨‍💼 Admin Routes

All admin routes require:
```
Authorization: Bearer {admin-token}
```

### Dashboard Statistics
```http
GET /api/admin/dashboard

Response: 200 OK
{
  "success": true,
  "data": {
    "totalActiveUsers": 10,
    "totalSeats": 50,
    "occupiedSeats": 8,
    "availableSeats": 42,
    "monthlyRevenue": 15000,
    "pendingPayments": 2,
    "pendingComplaints": 1,
    "recentUsers": [ ... ]
  }
}
```

### List All Users
```http
GET /api/admin/users?page=1&limit=10

Response: 200 OK
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalUsers": 15,
      "limit": 10
    }
  }
}
```

### Create New User
```http
POST /api/admin/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "user123",
  "phone": "9876543210",
  "seatNumber": 5,
  "monthlyFee": 1500
}

Response: 201 Created
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { ... }
  }
}
```

### Update User
```http
PUT /api/admin/users/{userId}
Content-Type: application/json

{
  "name": "John Updated",
  "monthlyFee": 2000
}

Response: 200 OK
{
  "success": true,
  "message": "User updated successfully"
}
```

### Delete User
```http
DELETE /api/admin/users/{userId}

Response: 200 OK
{
  "success": true,
  "message": "User deleted permanently"
}
```

### Block/Unblock User
```http
PATCH /api/admin/users/{userId}/block
Content-Type: application/json

{
  "isBlocked": true
}

Response: 200 OK
{
  "success": true,
  "message": "User blocked successfully"
}
```

### Activate/Deactivate User
```http
PATCH /api/admin/users/{userId}/activate
Content-Type: application/json

{
  "isActive": false
}

Response: 200 OK
{
  "success": true,
  "message": "User deactivated successfully"
}
```

### List All Seats
```http
GET /api/admin/seats

Response: 200 OK
{
  "success": true,
  "data": {
    "seats": [
      {
        "_id": "...",
        "seatNumber": 1,
        "isOccupied": true,
        "assignedTo": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      ...
    ]
  }
}
```

### Create Seats
```http
POST /api/admin/seats/create
Content-Type: application/json

{
  "startNumber": 51,
  "endNumber": 100
}

Response: 201 Created
{
  "success": true,
  "message": "50 seats created successfully"
}
```

### Assign Seat
```http
POST /api/admin/seats/assign
Content-Type: application/json

{
  "userId": "user_id_here",
  "seatNumber": 10
}

Response: 200 OK
{
  "success": true,
  "message": "Seat assigned successfully"
}
```

### Send Payment Request
```http
POST /api/payments/admin/send-request
Content-Type: application/json

{
  "userIds": ["user1_id", "user2_id"],  // Optional - omit for all users
  "month": "February",
  "year": 2026,
  "dueDate": "2026-02-28"
}

Response: 201 Created
{
  "success": true,
  "message": "Fee request sent to 10 users",
  "data": {
    "count": 10
  }
}
```

### Get Payment Status
```http
GET /api/payments/admin/status?month=February&year=2026

Response: 200 OK
{
  "success": true,
  "data": {
    "payments": [ ... ],
    "summary": {
      "total": 10,
      "paid": 7,
      "pending": 3,
      "failed": 0,
      "totalAmount": 15000,
      "paidAmount": 10500
    }
  }
}
```

### Send Message
```http
POST /api/messages/admin
Content-Type: application/json

{
  "recipientType": "all",  // or "selected"
  "recipients": [],  // user IDs if recipientType is "selected"
  "title": "Library Closed Tomorrow",
  "message": "The library will remain closed tomorrow due to maintenance."
}

Response: 201 Created
{
  "success": true,
  "message": "Message sent successfully"
}
```

### Get All Messages
```http
GET /api/messages/admin

Response: 200 OK
{
  "success": true,
  "data": {
    "messages": [ ... ]
  }
}
```

### Get All Complaints
```http
GET /api/complaints/admin?status=pending

Response: 200 OK
{
  "success": true,
  "data": {
    "complaints": [
      {
        "_id": "...",
        "userId": {
          "name": "John Doe",
          "email": "john@example.com",
          "seatNumber": 5
        },
        "subject": "AC not working",
        "description": "The AC in my section is not working.",
        "status": "pending",
        "createdAt": "..."
      }
    ]
  }
}
```

### Update Complaint Status
```http
PATCH /api/complaints/admin/{complaintId}
Content-Type: application/json

{
  "status": "resolved",
  "adminResponse": "AC has been repaired. Please check now."
}

Response: 200 OK
{
  "success": true,
  "message": "Complaint updated successfully"
}
```

---

## 👤 User Routes

All user routes require:
```
Authorization: Bearer {user-token}
```

### User Dashboard
```http
GET /api/user/dashboard

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "pendingPayment": { ... },
    "recentMessages": [ ... ],
    "pendingComplaintsCount": 1,
    "paymentHistory": [ ... ]
  }
}
```

### Get Profile
```http
GET /api/user/profile

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Update Profile
```http
PUT /api/user/profile
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543210"
}

Response: 200 OK
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### Create Payment Order
```http
POST /api/payments/user/create-order
Content-Type: application/json

{
  "paymentId": "payment_mongo_id"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "orderId": "order_xyz123",
    "amount": 1500,
    "currency": "INR",
    "keyId": "rzp_test_...",
    "payment": { ... }
  }
}
```

### Verify Payment
```http
POST /api/payments/user/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_xyz123",
  "razorpayPaymentId": "pay_abc456",
  "razorpaySignature": "signature_string"
}

Response: 200 OK
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment": { ... }
  }
}
```

### Get Payment History
```http
GET /api/payments/user/history

Response: 200 OK
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "...",
        "amount": 1500,
        "month": "February",
        "year": 2026,
        "paymentStatus": "paid",
        "paidAt": "2026-02-01T10:00:00.000Z"
      },
      ...
    ]
  }
}
```

### Get Messages
```http
GET /api/messages/user

Response: 200 OK
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "...",
        "adminId": { "name": "Admin" },
        "title": "Important Notice",
        "message": "...",
        "createdAt": "..."
      }
    ]
  }
}
```

### Submit Complaint
```http
POST /api/complaints/user
Content-Type: application/json

{
  "subject": "AC not working",
  "description": "The AC in my section has been off since yesterday."
}

Response: 201 Created
{
  "success": true,
  "message": "Complaint submitted successfully",
  "data": {
    "complaint": { ... }
  }
}
```

### Get User Complaints
```http
GET /api/complaints/user

Response: 200 OK
{
  "success": true,
  "data": {
    "complaints": [ ... ]
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔐 Authentication Flow

1. **Login:**
   ```
   POST /api/auth/login → Get token
   ```

2. **Store Token:**
   ```
   localStorage.setItem('token', token)
   ```

3. **Make Authenticated Requests:**
   ```
   Authorization: Bearer {token}
   ```

4. **Token Expiry:**
   ```
   Token expires after 7 days (configurable)
   401 response → Redirect to login
   ```

---

## 💡 Usage Examples

### Example: Complete User Creation Flow

```javascript
// 1. Admin logs in
const loginResponse = await axios.post('/api/auth/login', {
  email: 'admin@library.com',
  password: 'admin123'
});
const token = loginResponse.data.data.token;

// 2. Create new user
const createUserResponse = await axios.post('/api/admin/users', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'user123',
  phone: '9876543210',
  seatNumber: 5,
  monthlyFee: 1500
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 3. Send payment request
await axios.post('/api/payments/admin/send-request', {
  userIds: [createUserResponse.data.data.user._id],
  month: 'February',
  year: 2026,
  dueDate: '2026-02-28'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Example: User Payment Flow

```javascript
// 1. User logs in
const loginResponse = await axios.post('/api/auth/login', {
  email: 'john@example.com',
  password: 'user123'
});
const token = loginResponse.data.data.token;

// 2. Get dashboard (shows pending payment)
const dashboardResponse = await axios.get('/api/user/dashboard', {
  headers: { Authorization: `Bearer ${token}` }
});
const pendingPayment = dashboardResponse.data.data.pendingPayment;

// 3. Create Razorpay order
const orderResponse = await axios.post('/api/payments/user/create-order', {
  paymentId: pendingPayment._id
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// 4. Open Razorpay checkout (frontend)
const options = {
  key: orderResponse.data.data.keyId,
  amount: orderResponse.data.data.amount * 100,
  order_id: orderResponse.data.data.orderId,
  handler: async (response) => {
    // 5. Verify payment
    await axios.post('/api/payments/user/verify', {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};
const razorpay = new Razorpay(options);
razorpay.open();
```

---

## 📝 Notes

- All dates are in ISO 8601 format
- All monetary amounts are in Indian Rupees (₹)
- Pagination defaults: page=1, limit=10
- Token expiry: 7 days (configurable in JWT_EXPIRE env)
- All POST/PUT/PATCH requests require Content-Type: application/json

---

**For detailed implementation, see the controller files in `backend/src/controllers/`**
