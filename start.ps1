# Library Management System - Startup Script
# This script starts MongoDB, Backend, and Frontend servers

Write-Host "📚 Library Management System - Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = New-Object System.Net.Sockets.TcpClient
    try {
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Step 1: Check and start MongoDB
Write-Host "🔍 Checking MongoDB..." -ForegroundColor Yellow

$mongoPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
if (Test-Path $mongoPath) {
    if (Test-Port 27017) {
        Write-Host "✅ MongoDB is already running on port 27017" -ForegroundColor Green
    }
    else {
        Write-Host "🚀 Starting MongoDB..." -ForegroundColor Yellow
        
        # Ensure data directory exists
        if (-not (Test-Path "C:\data\db")) {
            New-Item -ItemType Directory -Force -Path "C:\data\db" | Out-Null
        }
        
        # Start MongoDB in background
        Start-Process -FilePath $mongoPath -ArgumentList "--dbpath", "C:\data\db" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        
        if (Test-Port 27017) {
            Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to start MongoDB" -ForegroundColor Red
            exit 1
        }
    }
}
else {
    Write-Host "❌ MongoDB not found at: $mongoPath" -ForegroundColor Red
    Write-Host "Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow

$backendNodeModules = Test-Path "backend\node_modules"
$frontendNodeModules = Test-Path "frontend\node_modules"

if (-not $backendNodeModules -or -not $frontendNodeModules) {
    Write-Host "⚠️  Missing dependencies. Installing..." -ForegroundColor Yellow
    
    if (-not $backendNodeModules) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
        Set-Location backend
        npm install
        Set-Location ..
    }
    
    if (-not $frontendNodeModules) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location frontend
        npm install
        Set-Location ..
    }
    
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Step 3: Start Backend Server
Write-Host "🚀 Starting Backend Server..." -ForegroundColor Yellow

if (Test-Port 5000) {
    Write-Host "⚠️  Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "Backend may already be running or another service is using this port" -ForegroundColor Yellow
}
else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; Write-Host '=================' -ForegroundColor Cyan; npm run dev"
    Start-Sleep -Seconds 3
    Write-Host "✅ Backend server starting on port 5000" -ForegroundColor Green
}

Write-Host ""

# Step 4: Start Frontend Server
Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Yellow

if (Test-Port 3000) {
    Write-Host "⚠️  Port 3000 is already in use" -ForegroundColor Yellow
    Write-Host "Frontend may already be running or another service is using this port" -ForegroundColor Yellow
}
else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host '⚡ Frontend Server' -ForegroundColor Cyan; Write-Host '==================' -ForegroundColor Cyan; npm run dev"
    Start-Sleep -Seconds 3
    Write-Host "✅ Frontend server starting on port 3000" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ All Services Started!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Access your application at:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Important URLs:" -ForegroundColor Yellow
Write-Host "   Super Admin Setup: http://localhost:3000/superadmin-setup" -ForegroundColor Cyan
Write-Host "   Admin Login:       http://localhost:3000/admin-login" -ForegroundColor Cyan
Write-Host "   User Login:        http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Check the separate terminal windows for server logs" -ForegroundColor Yellow
Write-Host "🛑 To stop: Close the terminal windows or press Ctrl+C in each" -ForegroundColor Yellow
Write-Host ""
