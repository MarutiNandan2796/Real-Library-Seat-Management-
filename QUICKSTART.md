# 🚀 Quick Start Guide - Library Management System

## ⚡ Fast Setup (5 Minutes)

### 1. Prerequisites Check
```bash
# Check Node.js (need v18+)
node --version

# Check MongoDB
mongod --version

# If not installed:
# - Node.js: https://nodejs.org/
# - MongoDB: https://www.mongodb.com/try/download/community
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env - Minimum required:
# MONGODB_URI=mongodb://localhost:27017/library-management
# JWT_SECRET=mysecretkey123
# ADMIN_EMAIL=admin@library.com
# ADMIN_PASSWORD=admin123

# Start server
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected successfully
✅ Default admin created
✅ 50 default seats created (1-50)
🚀 Server running on port 5000
```

### 3. Frontend Setup
```bash
# Open NEW terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env (optional for now):
# VITE_API_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

**Expected Output:**
```
VITE ready in X ms
➜  Local:   http://localhost:3000/
```

### 4. Access Application

**Open Browser:**
```
http://localhost:3000
```

**Login as Admin:**
- Email: `admin@library.com`
- Password: `admin123`

---

## 📋 First Steps After Login

### As Admin:

1. **Create Seats** (Optional - 50 already created)
   - Go to "Seat Management"
   - Click "Create Seats"
   - Enter range (e.g., 51-100)

2. **Add Your First User**
   - Go to "User Management"
   - Click "Add User"
   - Fill details:
     - Name: John Doe
     - Email: john@example.com
     - Password: user123
     - Phone: 9876543210
     - Seat Number: 1
     - Monthly Fee: 1000

3. **Test User Login**
   - Logout from admin
   - Login as user (john@example.com / user123)

4. **Send Payment Request**
   - Login back as admin
   - Go to "Payments"
   - Click "Send Fee Request"
   - Select users or "All"
   - Set month, year, due date

5. **Send Message**
   - Go to "Messages"
   - Write message to all or selected users

---

## 🔧 Common Issues & Fixes

### ❌ MongoDB Connection Failed
**Solution:**
```bash
# Start MongoDB service
# Windows (Run as Admin):
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### ❌ Port 5000 Already in Use
**Solution:**
Change PORT in `backend/.env`:
```env
PORT=5001
```
Also update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### ❌ CORS Error
**Solution:**
Update `backend/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

### ❌ JWT Token Invalid
**Solution:**
- Clear browser localStorage
- Login again

---

## 💳 Payment Testing (Razorpay)

### Get Test Credentials:
1. Sign up: https://dashboard.razorpay.com/signup
2. Go to Settings → API Keys
3. Copy **Test Mode** keys

### Update .env files:
**Backend:**
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

**Frontend:**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Test Payment:
- Login as user
- Click "Pay Now" on pending payment
- Use test card: **4111 1111 1111 1111**
- CVV: Any 3 digits
- Expiry: Any future date

---

## 📱 Default Features Available

### ✅ Admin Portal
- Dashboard with stats
- User management (CRUD)
- Seat management
- Payment requests
- Messaging system
- Complaint management

### ✅ User Portal
- Personal dashboard
- Payment system
- View messages
- Submit complaints
- Profile management

---

## 🎯 What's Next?

### Extend User Management:
Edit `frontend/src/components/admin/` to add:
- User search/filter
- Bulk operations
- Export to Excel

### Add Email Notifications:
1. Install nodemailer: `npm install nodemailer`
2. Add email service in `backend/src/services/`
3. Send emails on payment requests

### Mobile Responsiveness:
- Already using Tailwind CSS
- Test on mobile devices
- Adjust breakpoints as needed

---

## 🐛 Debug Mode

### Backend Logs:
```bash
# In backend directory
npm run dev

# Watch console for:
# - API requests
# - Database queries
# - Errors
```

### Frontend Logs:
```bash
# Open browser DevTools (F12)
# Check:
# - Console tab (errors)
# - Network tab (API calls)
# - Application tab (localStorage)
```

### Test API Directly:
Use Postman or curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"admin123"}'

# Copy token from response
# Test protected route
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚀 Production Deployment Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use MongoDB Atlas instead of local MongoDB
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Switch Razorpay to Live Mode
- [ ] Configure CORS for production domain
- [ ] Set up environment variables on hosting platform
- [ ] Test payment flow thoroughly
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry, etc.)

---

## 📞 Need Help?

1. Check [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed docs
2. Review [README.md](./README.md) for complete guide
3. Check API routes in backend/src/routes/
4. Inspect models in backend/src/models/

---

**Happy Building! 🎉**

System is now ready for development and testing.
