# 🚀 Quick Start Guide

## Starting the Project

### Option 1: Using the Startup Script (Recommended)

Simply run the startup script:

```powershell
.\start.ps1
```

This will automatically:
1. ✅ Check and start MongoDB
2. ✅ Install dependencies if needed
3. ✅ Start backend server (Port 5000)
4. ✅ Start frontend server (Port 3000)

---

### Option 2: Manual Start

#### Step 1: Start MongoDB

**Windows:**
```powershell
# As Administrator
net start MongoDB

# OR start manually
& "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**Mac/Linux:**
```bash
# Using Homebrew (Mac)
brew services start mongodb-community

# OR
mongod --dbpath /data/db
```

#### Step 2: Start Backend Server

Open a new terminal:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🔧 Initializing system...
✅ System initialization complete
🚀 Server running on port 5000
```

#### Step 3: Start Frontend Server

Open another terminal:
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.4.21  ready in 846 ms
➜  Local:   http://localhost:3000/
```

---

## 🌐 Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:5000 | REST API |
| **MongoDB** | mongodb://localhost:27017 | Database |

---

## 📱 Application Pages

- **Super Admin Setup**: http://localhost:3000/superadmin-setup
- **Admin Login**: http://localhost:3000/admin-login
- **Admin Signup**: http://localhost:3000/admin-signup
- **User Login**: http://localhost:3000/login
- **User Signup**: http://localhost:3000/signup

---

## 🔐 Default Credentials

### System Admin (Not Super Admin)
- **Email**: `admin@library.com`
- **Password**: `admin123`
- **Note**: This is auto-created but needs Super Admin approval

### Super Admin
- Must be created through the setup process
- First-time setup: http://localhost:3000/superadmin-setup

---

## 🛠️ Troubleshooting

### MongoDB Connection Error

**Problem**: Backend shows "MongoDB connection error"

**Solution**:
```powershell
# Check if MongoDB is running
Test-NetConnection localhost -Port 27017

# Start MongoDB
.\start.ps1
# OR
net start MongoDB  # As Administrator
```

---

### Port Already in Use

**Problem**: "Port 5000 (or 3000) is already in use"

**Solution**:
```powershell
# Find process using the port
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Restart the server
```

---

### Email Not Sending (OTP)

**Problem**: Super Admin OTP not received via email

**Solution**: 
1. **Development Mode**: OTP is displayed in the backend terminal
2. **Production**: Configure email in `.env` file (see [EMAIL_SETUP_GUIDE.md](EMAIL_SETUP_GUIDE.md))

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

### Dependencies Not Installed

**Problem**: Module not found errors

**Solution**:
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

---

## 🔄 Stopping the Servers

### Using Terminals
- Press `Ctrl+C` in each terminal window
- Close the terminal windows

### Using Task Manager (Windows)
1. Open Task Manager (`Ctrl+Shift+Esc`)
2. Find `node.exe` processes
3. End the tasks

### Stop MongoDB
```powershell
# As Administrator
net stop MongoDB
```

---

## 📝 Development Workflow

### Hot Reload
- **Backend**: Uses nodemon - auto-restarts on file changes
- **Frontend**: Uses Vite HMR - instant updates in browser

### Making Changes
1. Edit your code
2. Save the file
3. Backend auto-restarts / Frontend hot-reloads
4. Refresh browser if needed

---

## 🧪 Testing the Setup

### Test Backend
```powershell
# Health check
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Check Super Admin exists
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/check-superadmin"
```

### Test Frontend
- Open: http://localhost:3000
- You should see the login page

### Test Database
```powershell
# Using MongoDB Shell
mongosh
use library-management
show collections
```

---

## 📦 Project Structure

```
project/
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── server.ts
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   └── package.json
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── start.ps1          # Automated startup script
└── START_GUIDE.md     # This file
```

---

## 🎯 Next Steps

1. ✅ Run `.\start.ps1` or start servers manually
2. ✅ Create Super Admin account
3. ✅ Configure email (optional)
4. ✅ Start managing your library!

---

## 💡 Pro Tips

- Use `.\start.ps1` for quick startup
- Keep MongoDB running in background
- Check backend terminal for OTP in development
- Configure email for production deployment
- Use VS Code integrated terminal for development

---

## 📚 Additional Resources

- [Email Setup Guide](EMAIL_SETUP_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [Super Admin Rules](SUPER_ADMIN_RULES.md)
- [Architecture Documentation](ARCHITECTURE.md)

---

**Last Updated**: February 2026  
**Version**: 1.0
