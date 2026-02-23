# 🕐 Time Slot Management System - Complete Implementation Guide

## Overview
This document describes the comprehensive time slot management system that has been implemented, allowing admins to set, track, and manage study time slots for library seats, with full history tracking and user visibility.

---

## 🎯 Features Implemented

### 1. **Time Slot Management for Seats**
- **Create/Update Time Slots**: Admins can set multiple time slots per seat
- **Predefined Presets**: 
  - Morning (7-10 AM)
  - Evening/Afternoon (5-10 PM)
  - Both (Morning + Evening)
- **Custom Time Slots**: Set any custom start and end times with labels

### 2. **Duration Calculation**
- Automatic calculation of slot duration in hours and minutes
- Display format: "3h 30m", "2h", "45m"
- Duration stored with each time slot for reference

### 3. **Update History Tracking**
- Every time slot change is logged with:
  - Admin who made the change
  - Time of change (date & time)
  - Previous slots
  - Updated slots
  - Optional notes explaining the change
  - User assigned to the seat (if any)

### 4. **User Portal Visibility**
- Users can see their allocated time slots in their dashboard
- Display includes:
  - Session name/label
  - Start and end time
  - Duration for each session
  - Last update timestamp

---

## 📊 Database Models

### 1. **Seat Model (Enhanced)**
```typescript
interface ISeat {
  seatNumber: number;
  isOccupied: boolean;
  timeSlots: Array<{
    startTime: string;      // HH:MM format
    endTime: string;        // HH:MM format
    label?: string;         // Morning, Evening, etc.
    duration?: number;      // Minutes
  }>;
  timeSlotsUpdatedAt?: Date;      // When were they last updated
  timeSlotsUpdatedBy?: ObjectId;   // Which admin updated them
  studyDuration: number;          // Daily hours allowed
  // ... other fields
}
```

### 2. **TimeSlotHistory Model (New)**
```typescript
interface ITimeSlotHistory {
  adminId: ObjectId;                    // Who made the change
  seatNumber: number;                   // Which seat
  userId?: ObjectId;                    // Assigned user (if any)
  previousSlots: TimeSlot[];            // Before change
  updatedSlots: TimeSlot[];             // After change
  changeNotes?: string;                 // Why was it changed
  changeType: 'created' | 'updated' | 'deleted';
  createdAt: Date;                      // When was it changed
}
```

---

## 🔌 API Endpoints

### Admin Endpoints

#### 1. **Update Time Slots for a Seat**
```
PATCH /api/admin/seats/:seatNumber/timeslots
Authorization: Bearer <token>

Request Body:
{
  "timeSlots": [
    {
      "startTime": "07:00",
      "endTime": "10:00",
      "label": "Morning Session"
    },
    {
      "startTime": "17:00",
      "endTime": "22:00",
      "label": "Evening Session"
    }
  ],
  "notes": "Updated due to user request"
}

Response:
{
  "success": true,
  "message": "Time slots updated successfully",
  "data": {
    "seat": {
      "seatNumber": 1,
      "timeSlots": [...],
      "timeSlotsUpdatedAt": "2024-02-08T10:30:00Z",
      "timeSlotsUpdatedBy": { ... }
    }
  }
}
```

#### 2. **Add a Single Time Slot**
```
POST /api/admin/seats/:seatNumber/timeslots/add
Authorization: Bearer <token>

Request Body:
{
  "startTime": "07:00",
  "endTime": "10:00",
  "label": "Morning",
  "notes": "Added new morning session"
}

Response: (Same as update endpoint)
```

#### 3. **Get Time Slot History for a Seat**
```
GET /api/admin/seats/:seatNumber/timeslots/history?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "history": [
      {
        "_id": "...",
        "seatNumber": 1,
        "adminId": {
          "_id": "...",
          "name": "Admin Name",
          "email": "admin@example.com"
        },
        "userId": {
          "_id": "...",
          "name": "User Name",
          "email": "user@example.com"
        },
        "previousSlots": [],
        "updatedSlots": [
          {
            "startTime": "07:00",
            "endTime": "10:00",
            "label": "Morning"
          }
        ],
        "changeNotes": "Initial setup",
        "changeType": "created",
        "createdAt": "2024-02-08T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "total": 100,
      "limit": 20
    }
  }
}
```

#### 4. **Get Time Slot History for a User**
```
GET /api/admin/users/:userId/timeslots/history?page=1&limit=20
Authorization: Bearer <token>

Response: (Same structure as seat history)
```

---

## 🎨 Frontend Components

### 1. **SeatManagement Component**
**File**: `frontend/src/components/admin/SeatManagement.tsx`

**New Features**:
- Enhanced time slot modal with notes field
- Duration calculation and display
- Last updated timestamp for each seat's time slots
- "History" button to view all time slot changes
- Quick preset buttons (Morning, Evening, Both)
- Better validation and error handling

**Functions**:
- `handleSaveTimeSlots()` - Save with notes
- `openTimeSlotModal()` - Open edit dialog
- `formatDurationMinutes()` - Format duration display

### 2. **TimeSlotHistory Component (New)**
**File**: `frontend/src/components/admin/TimeSlotHistory.tsx`

**Features**:
- Modal dialog showing all time slot changes
- Change details including:
  - Admin who made the change
  - Date and time of change
  - Previous vs updated slots
  - Notes/reason for change
  - Affected user (if any)
- Pagination support
- Clear visual diff between old and new slots

### 3. **UserDashboard Component**
**File**: `frontend/src/components/user/UserDashboard.tsx`

**Enhanced Features**:
- Display time slots with duration
- Show last update timestamp
- Better visual organization with color-coded sessions
- Session labels (Morning, Evening, etc.)

---

## 📋 Usage Workflow

### For Admins

#### Setting Time Slots

1. **Go to Seat Management**
   - Navigate to Admin Panel → Seat Management

2. **Find the Occupied Seat**
   - Locate the seat from the list of occupied seats

3. **Click "🕐 Schedule" Button**
   - Opens the Time Slot modal

4. **Choose Method**
   - **Option A**: Use quick presets
     - Morning (7-10 AM): Click "Morning (7-10 AM)" button
     - Evening (5-10 PM): Click "Evening (5-10 PM)" button
     - Both: Click "Both (Morning + Evening)" button
   
   - **Option B**: Set custom times
     - Click "➕ Add Another Time Slot"
     - Enter start time, end time, and optional label
     - Duration calculates automatically

5. **Add Notes (Optional)**
   - Explain why you're updating the slots
   - Example: "User requested earlier morning slot"

6. **Click "Save Time Slots"**
   - Changes are saved
   - History is automatically logged

#### Viewing History

1. **In Seat Management Table**
   - Find the occupied seat
   - Click "📋 History" button
   - Modal opens showing all changes for this seat

2. **See Changes**
   - Each change shows:
     - Admin name and email
     - Date and time
     - Before/after comparison
     - Notes and reason
     - Affected user

---

## 👤 For Users

### Viewing Your Time Slots

1. **Go to User Dashboard**
   - Login and open dashboard

2. **Find "Your Study Schedule" Section**
   - Shows your allocated time slots

3. **View Details**
   - See each session with:
     - Session name (Morning, Evening, etc.)
     - Start and end time
     - Total duration
     - When it was last updated

---

## 💾 Database Changes

### New Model Files Created
- `backend/src/models/TimeSlotHistory.model.ts` - Tracks all time slot changes

### Modified Model Files
- `backend/src/models/Seat.model.ts` - Added duration to slots, tracking fields

### New Controller Functions
- `getSeatTimeSlotHistory()` - Get history for a seat
- `getUserTimeSlotHistory()` - Get history for a user

### New Routes
- `GET /api/admin/seats/:seatNumber/timeslots/history`
- `GET /api/admin/users/:userId/timeslots/history`

---

## 🔄 Change Tracking Details

### What Gets Tracked?
- **Who**: Admin making the change (name, email, ID)
- **What**: All previous and updated time slots
- **When**: Exact timestamp of change
- **Where**: Which seat was affected
- **Why**: Optional notes field
- **Who Gets Affected**: The user assigned to the seat (if any)

### Change Types
- **created**: First time slots are created for a seat
- **updated**: Time slots are modified
- **deleted**: Time slots are removed (all slots become empty)

---

## ⏰ Time Slot Features

### Validation Rules
✓ End time must be after start time
✓ Start time and end time must be in HH:MM format (24-hour)
✓ Valid hours: 00-23
✓ Valid minutes: 00-59

### Examples

**Morning Shift**
- Start: 07:00 (7:00 AM)
- End: 10:00 (10:00 AM)
- Duration: 3h 0m

**Evening/Afternoon Shift**
- Start: 17:00 (5:00 PM)
- End: 22:00 (10:00 PM)
- Duration: 5h 0m

**Custom Shift**
- Start: 14:00 (2:00 PM)
- End: 18:30 (6:30 PM)
- Duration: 4h 30m

---

## 🚀 Quick Setup Checklist

- [x] TimeSlotHistory model created
- [x] Seat model updated with tracking fields
- [x] Admin controller functions added
- [x] API routes configured
- [x] SeatManagement component enhanced
- [x] TimeSlotHistory component created
- [x] UserDashboard updated
- [x] Duration calculation implemented
- [x] Notes tracking added
- [x] History display with pagination
- [x] Pre-filled time slot options
- [x] Better UI/UX for time management

---

## 📱 Responsive Design

All time slot components are fully responsive:
- **Mobile**: Single column layout, accessible buttons
- **Tablet**: Two column layout for comparisons
- **Desktop**: Full multi-column view with detailed information

---

## 🔒 Security

- All endpoints require admin authentication
- Time slot changes are immutable (logged in history)
- User sees only their own time slots
- Admins can see all time slots and history
- All changes are tracked with admin identity

---

## 📈 Future Enhancements

Potential features for future versions:
- [ ] Recurring time slots (daily, weekly schedules)
- [ ] Slot conflict detection
- [ ] User request system for time changes
- [ ] Automatic notifications when slots change
- [ ] Bulk time slot assignment
- [ ] Time slot templates
- [ ] Analytics on slot usage

---

## 🆘 Troubleshooting

### Time slot not saving?
- Check if end time is after start time
- Verify time format is HH:MM
- Check network connection

### History not showing?
- Ensure admin has proper permissions
- Check if seat number exists
- Try refreshing the page

### Duration showing incorrectly?
- Duration is calculated as: (endHour * 60 + endMin) - (startHour * 60 + startMin)
- Make sure times are in 24-hour format

---

## 📞 Support

For issues or questions about the time slot management system:
1. Check the history to see what changes were made
2. Review the update notes for context
3. Contact the admin who made the change
4. Check system logs for detailed information

---

**Last Updated**: February 8, 2026
**Version**: 1.0
**Status**: ✅ Production Ready
