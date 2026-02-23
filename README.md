# 📚 Library Management System

A full-stack Library Management System built with MERN stack (MongoDB, Express, React, Node.js) and TypeScript, featuring role-based access control, payment integration, and real-time messaging.

## 🚀 Features

### Admin Features
- ✅ Secure admin login with JWT authentication
- 📊 Dashboard with statistics (users, seats, revenue)
- 👥 User management (add, edit, delete, block users)
- 💺 Seat allocation and management
- 💰 Payment request system
- 📧 Messaging system (broadcast to all or selected users)
- 🎫 Complaint management and resolution
- 🔒 User access control (activate/deactivate accounts)

### User Features
- ✅ Secure user login
- 📱 Personal dashboard
- 💳 Online payment with Razorpay
- 📜 Payment history
- 📬 View admin messages
- 🆘 Submit and track complaints
- 👤 Profile management

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Payment Gateway**: Razorpay
- **Validation**: express-validator

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## 📁 Project Structure

```
library-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Razorpay config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context (Auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── package.json
│   └── vite.config.ts
│
└── ARCHITECTURE.md          # Detailed architecture docs
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v8.0 or higher) - [Download Here](https://www.mongodb.com/try/download/community)
- Git (optional)

### Quick Start (Recommended)

**Windows:**
```powershell
# Run the automated startup script
.\start.ps1
```

This will automatically:
1. ✅ Check and start MongoDB
2. ✅ Install dependencies if needed
3. ✅ Start backend server (Port 5000)
4. ✅ Start frontend server (Port 3000)

**Then visit**: http://localhost:3000

For detailed instructions, see [START_GUIDE.md](START_GUIDE.md)

---

### Manual Setup

### 1. Clone Repository (if needed)
```bash
git clone <repository-url>
cd library-management
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (if not exists)
copy .env.example .env  # Windows
# cp .env.example .env  # Mac/Linux

# Edit .env with your configurations:
# - MongoDB connection string
# - JWT secret key
# - Razorpay credentials
# - Admin default credentials
```

**Important Environment Variables:**
```env
MONGODB_URI=mongodb://localhost:27017/library-management
JWT_SECRET=your-super-secret-jwt-key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_EMAIL=admin@library.com
ADMIN_PASSWORD=admin123
```

```bash
# Run development server
npm run dev

# Server will start on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env with:
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

```bash
# Run development server
npm run dev

# Frontend will start on http://localhost:3000
```

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env

## 🎯 Getting Started

### First Time Setup

1. **Start All Services**:
   ```powershell
   # Windows - Automated
   .\start.ps1
   
   # OR manually start MongoDB, Backend, and Frontend
   ```

2. **Create Super Admin** (Required for first-time setup):
   - Visit: http://localhost:3000/superadmin-setup
   - Fill in your details (follow password rules)
   - Enter OTP (check backend terminal in development mode)
   - See [SUPER_ADMIN_RULES.md](SUPER_ADMIN_RULES.md) for details

3. **Super Admin Can**:
   - Approve/reject admin requests
   - Manage all users and admins
   - Full system control

4. **Default System Admin** (Auto-created, needs Super Admin approval):
   - Email: `admin@library.com`
   - Password: `admin123`
   - Status: Pending approval by Super Admin

5. **Admin Actions** (After approval):
   - Create/manage seats (50 default seats auto-created)
   - Add and manage users
   - Assign seats to users
   - Set monthly fees and send payment requests
   - Handle complaints and messages

### Email Configuration (Optional)

For Super Admin OTP delivery via email:
- See detailed guide: [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md)
- Configure Gmail App Password in `backend/.env`
- Without configuration: OTP appears in backend console (development mode)

### Razorpay Setup (for Payments)

1. Sign up at https://dashboard.razorpay.com
2. Get API Keys (Test Mode for development)
3. Add keys to `.env` files in both backend and frontend
4. For production: Switch to Live Mode

**Razorpay Test Cards:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## 📖 API Documentation

### Authentication
```
POST   /api/auth/login              # Login
GET    /api/auth/verify             # Verify token
POST   /api/auth/logout             # Logout
```

### Admin Routes
```
GET    /api/admin/dashboard         # Dashboard stats
GET    /api/admin/users             # List users
POST   /api/admin/users             # Create user
PUT    /api/admin/users/:id         # Update user
DELETE /api/admin/users/:id         # Delete user
PATCH  /api/admin/users/:id/block   # Block user
PATCH  /api/admin/users/:id/activate # Activate user

GET    /api/admin/seats             # List seats
POST   /api/admin/seats/assign      # Assign seat
POST   /api/admin/seats/create      # Create seats

POST   /api/admin/payments/send-request # Send fee request
GET    /api/admin/payments/status   # Payment status

POST   /api/admin/messages          # Send message
GET    /api/admin/messages          # Get messages

GET    /api/admin/complaints        # Get complaints
PATCH  /api/admin/complaints/:id    # Update complaint
```

### User Routes
```
GET    /api/user/dashboard          # User dashboard
GET    /api/user/profile            # Get profile
PUT    /api/user/profile            # Update profile

POST   /api/payments/user/create-order # Create payment
POST   /api/payments/user/verify    # Verify payment
GET    /api/payments/user/history   # Payment history

GET    /api/messages/user           # Get messages

POST   /api/complaints/user         # Submit complaint
GET    /api/complaints/user         # Get complaints
```

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Input validation
- ✅ SQL injection prevention (NoSQL)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Payment signature verification

## 🎨 User Interface

### Admin Dashboard
- Total active users count
- Seat availability status
- Monthly revenue
- Pending payments
- Recent users list

### User Dashboard
- Assigned seat number
- Payment status
- Messages from admin
- Complaint tracking
- Payment history

## 📝 How Admin Can Disable User Account

Admin has 3 ways to disable/restrict users:

1. **Deactivate Account** (`isActive = false`)
   - User cannot login
   - Seat remains assigned
   - Data preserved for future reactivation

2. **Block User** (`isBlocked = true`)
   - Temporary suspension
   - Shows "Account blocked" message
   - Can be unblocked anytime

3. **Permanent Delete**
   - Complete removal from system
   - Frees up assigned seat
   - Cannot be recovered

## 🚀 Deployment

### Backend Deployment (Render, Railway, etc.)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel, Netlify)

1. Build production bundle: `npm run build`
2. Deploy `dist` folder
3. Set environment variables
4. Configure API URL

## 🔄 Future Enhancements

- [ ] Email notifications
- [ ] SMS alerts
- [ ] QR code attendance
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Automated monthly billing
- [ ] Multi-branch support
- [ ] Library rules management
- [ ] Book inventory system
- [ ] Reading room booking

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access in MongoDB Atlas

### Razorpay Payment Fails
- Verify API keys in `.env`
- Use test mode for development
- Check Razorpay dashboard for logs

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly
- Check CORS configuration in backend

## � Documentation

- 📘 [START_GUIDE.md](START_GUIDE.md) - Quick start and troubleshooting
- 📘 [SUPER_ADMIN_RULES.md](SUPER_ADMIN_RULES.md) - Super admin password rules
- 📘 [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) - Email configuration guide
- 📘 [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture details
- 📘 [API_REFERENCE.md](API_REFERENCE.md) - Complete API documentation

## 🔄 Recent Improvements

### ✅ Email Service Enhancement
- Fixed email sending for Super Admin OTP
- Better error handling with console fallback
- Clear status messages for email configuration
- Development mode includes OTP in API response

### ✅ Startup Experience
- Automated startup script (`start.ps1`) for Windows
- Automatic MongoDB detection and startup
- Dependency installation verification
- Service health checks

### ✅ Frontend Improvements
- Fixed Vite CJS deprecation warning
- Migrated to ESM module system
- Improved error messages

### ✅ Documentation
- Comprehensive guides for setup and troubleshooting
- Email configuration instructions
- Quick start guide with common issues

## 🛠️ Development Commands

### Backend
```bash
cd backend
npm run dev      # Development with auto-reload
npm run build    # Compile TypeScript
npm start        # Production mode
```

### Frontend
```bash
cd frontend
npm run dev      # Vite dev server (HMR)
npm run build    # Production build
npm run preview  # Preview production
```

## 📞 Support

For issues or questions:
1. Check [START_GUIDE.md](START_GUIDE.md) troubleshooting section
2. Review [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md) for email problems
3. Backend console provides detailed error messages
4. Frontend browser console for client-side issues

## 📄 License

MIT License - free to use for personal or commercial projects.

## 🎯 Project Status

✅ **Production Ready** - All features fully implemented  
✅ **Well Documented** - Comprehensive guides available  
✅ **Actively Maintained** - Regular updates and improvements  

---

**Last Updated**: February 2026  
**Version**: 1.0.0  

Made with ❤️ using MERN Stack + TypeScript

Happy Coding! 🚀
