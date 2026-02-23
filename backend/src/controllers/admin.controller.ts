import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.model';
import Seat from '../models/Seat.model';
import Payment from '../models/Payment.model';
import Complaint from '../models/Complaint.model';
import UserChangeHistory from '../models/UserChangeHistory.model';
import TimeSlotHistory from '../models/TimeSlotHistory.model';

/**
 * Helper function to calculate duration in minutes between two times
 */
const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
export const getDashboardStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Total active users (excluding admins)
    const totalActiveUsers = await User.countDocuments({
      role: 'user',
      isActive: true,
      isBlocked: false,
    });

    // Total seats
    const totalSeats = await Seat.countDocuments();

    // Occupied seats
    const occupiedSeats = await Seat.countDocuments({ isOccupied: true });

    // Calculate monthly revenue (current month)
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear,
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const revenue = monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0;

    // Pending payments count
    const pendingPayments = await Payment.countDocuments({
      paymentStatus: 'pending',
    });

    // Recent users (last 5)
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email seatNumber joiningDate');

    // Pending complaints
    const pendingComplaints = await Complaint.countDocuments({
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      data: {
        totalActiveUsers,
        totalSeats,
        occupiedSeats,
        availableSeats: totalSeats - occupiedSeats,
        monthlyRevenue: revenue,
        pendingPayments,
        pendingComplaints,
        recentUsers,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Private/Admin
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({ role: 'user' });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

/**
 * @route   POST /api/admin/users
 * @desc    Create new user (Admin only)
 * @access  Private/Admin
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone, seatNumber, monthlyFee } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // If seat number provided, check if seat exists and is available
    if (seatNumber) {
      const seat = await Seat.findOne({ seatNumber });
      if (!seat) {
        res.status(400).json({
          success: false,
          message: 'Seat does not exist',
        });
        return;
      }
      if (seat.isOccupied) {
        res.status(400).json({
          success: false,
          message: 'Seat is already occupied',
        });
        return;
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user',
      seatNumber: seatNumber || null,
      monthlyFee: monthlyFee || 0,
    });

    // If seat assigned, update seat
    if (seatNumber) {
      await Seat.findOneAndUpdate(
        { seatNumber },
        {
          isOccupied: true,
          assignedTo: user._id,
          assignedDate: new Date(),
        }
      );
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    });
  }
};

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Private/Admin
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, monthlyFee } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (monthlyFee !== undefined) user.monthlyFee = monthlyFee;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Permanently delete user
 * @access  Private/Admin
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Free up seat if assigned
    if (user.seatNumber) {
      await Seat.findOneAndUpdate(
        { seatNumber: user.seatNumber },
        {
          isOccupied: false,
          assignedTo: null,
          assignedDate: null,
        }
      );
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted permanently',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};

/**
 * @route   PATCH /api/admin/users/:id/block
 * @desc    Block or unblock user
 * @access  Private/Admin
 */
export const toggleBlockUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.isBlocked = isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: { user },
    });
  } catch (error) {
    console.error('Toggle block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

/**
 * @route   PATCH /api/admin/users/:id/activate
 * @desc    Activate or deactivate user
 * @access  Private/Admin
 */
export const toggleActivateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user },
    });
  } catch (error) {
    console.error('Toggle activate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
    });
  }
};

/**
 * @route   GET /api/admin/seats
 * @desc    Get all seats with status
 * @access  Private/Admin
 */
export const getAllSeats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const seats = await Seat.find()
      .populate('assignedTo', 'name email phone')
      .sort({ seatNumber: 1 });

    res.status(200).json({
      success: true,
      data: { seats },
    });
  } catch (error) {
    console.error('Get all seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seats',
    });
  }
};

/**
 * @route   POST /api/admin/seats/assign
 * @desc    Assign seat to user
 * @access  Private/Admin
 */
export const assignSeat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, seatNumber } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if seat exists
    const seat = await Seat.findOne({ seatNumber });
    if (!seat) {
      res.status(404).json({
        success: false,
        message: 'Seat not found',
      });
      return;
    }

    // Check if seat is available
    if (seat.isOccupied) {
      res.status(400).json({
        success: false,
        message: 'Seat is already occupied',
      });
      return;
    }

    // If user already has a seat, free it
    if (user.seatNumber) {
      await Seat.findOneAndUpdate(
        { seatNumber: user.seatNumber },
        {
          isOccupied: false,
          assignedTo: null,
          assignedDate: null,
        }
      );
    }

    // Assign new seat
    seat.isOccupied = true;
    seat.assignedTo = user._id;
    seat.assignedDate = new Date();
    await seat.save();

    // Update user
    user.seatNumber = seatNumber;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Seat assigned successfully',
      data: { seat, user },
    });
  } catch (error) {
    console.error('Assign seat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign seat',
    });
  }
};

/**
 * @route   POST /api/admin/seats/create
 * @desc    Create new seats
 * @access  Private/Admin
 */
export const createSeats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { startNumber, endNumber } = req.body;

    const seats = [];
    for (let i = startNumber; i <= endNumber; i++) {
      // Check if seat already exists
      const existingSeat = await Seat.findOne({ seatNumber: i });
      if (!existingSeat) {
        seats.push({ seatNumber: i });
      }
    }

    if (seats.length === 0) {
      res.status(400).json({
        success: false,
        message: 'All seats already exist',
      });
      return;
    }

    const createdSeats = await Seat.insertMany(seats);

    res.status(201).json({
      success: true,
      message: `${createdSeats.length} seats created successfully`,
      data: { seats: createdSeats },
    });
  } catch (error) {
    console.error('Create seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create seats',
    });
  }
};

/**
 * @route   DELETE /api/admin/seats/:seatNumber
 * @desc    Delete a seat (only if not occupied)
 * @access  Private/Admin
 */
export const deleteSeat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { seatNumber } = req.params;

    const seat = await Seat.findOne({ seatNumber: parseInt(seatNumber) });
    if (!seat) {
      res.status(404).json({
        success: false,
        message: 'Seat not found',
      });
      return;
    }

    if (seat.isOccupied) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete an occupied seat. Please unassign first.',
      });
      return;
    }

    await Seat.findByIdAndDelete(seat._id);

    res.status(200).json({
      success: true,
      message: 'Seat deleted successfully',
    });
  } catch (error) {
    console.error('Delete seat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete seat',
    });
  }
};

/**
 * @route   POST /api/admin/seats/unassign
 * @desc    Unassign seat from user
 * @access  Private/Admin
 */
export const unassignSeat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { seatNumber } = req.body;

    const seat = await Seat.findOne({ seatNumber });
    if (!seat) {
      res.status(404).json({
        success: false,
        message: 'Seat not found',
      });
      return;
    }

    if (!seat.isOccupied) {
      res.status(400).json({
        success: false,
        message: 'Seat is already unoccupied',
      });
      return;
    }

    // Update user
    if (seat.assignedTo) {
      await User.findByIdAndUpdate(seat.assignedTo, { seatNumber: null });
    }

    // Clear seat
    seat.isOccupied = false;
    seat.assignedTo = null;
    seat.assignedDate = null;
    seat.studyDuration = 0;
    await seat.save();

    res.status(200).json({
      success: true,
      message: 'Seat unassigned successfully',
      data: { seat },
    });
  } catch (error) {
    console.error('Unassign seat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign seat',
    });
  }
};

/**
 * @route   PATCH /api/admin/seats/:seatNumber/duration
 * @desc    Update study duration for a seat
 * @access  Private/Admin
 */
export const updateSeatDuration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { seatNumber } = req.params;
    const { studyDuration } = req.body;

    if (studyDuration < 0 || studyDuration > 24) {
      res.status(400).json({
        success: false,
        message: 'Study duration must be between 0 and 24 hours',
      });
      return;
    }

    const seat = await Seat.findOne({ seatNumber: parseInt(seatNumber) });
    if (!seat) {
      res.status(404).json({
        success: false,
        message: 'Seat not found',
      });
      return;
    }

    seat.studyDuration = studyDuration;
    await seat.save();

    const populatedSeat = await Seat.findById(seat._id).populate('assignedTo', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Study duration updated successfully',
      data: { seat: populatedSeat },
    });
  } catch (error) {
    console.error('Update seat duration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update study duration',
    });
  }
};

/**
 * @route   PATCH /api/admin/seats/:seatNumber/timeslots
 * @desc    Update time slots for a seat
 * @access  Private/Admin
 */
export const updateSeatTimeSlots = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { seatNumber } = req.params;
    const { timeSlots, notes } = req.body;
    const adminId = req.user?._id;

    if (!Array.isArray(timeSlots)) {
      res.status(400).json({
        success: false,
        message: 'Time slots must be an array',
      });
      return;
    }

    // Validate time slots
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const timeSlotsWithDuration = timeSlots.map((slot) => {
      if (!slot.startTime || !slot.endTime) {
        throw new Error('Each time slot must have startTime and endTime');
      }
      
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        throw new Error('Invalid time format. Use HH:MM (e.g., 07:00)');
      }

      // Validate that endTime is after startTime
      const [startHour, startMin] = slot.startTime.split(':').map(Number);
      const [endHour, endMin] = slot.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        throw new Error('End time must be after start time');
      }

      // Calculate duration
      const duration = calculateDuration(slot.startTime, slot.endTime);

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label || '',
        duration,
      };
    });

    const seat = await Seat.findOne({ seatNumber: parseInt(seatNumber) });
    if (!seat) {
      res.status(404).json({
        success: false,
        message: 'Seat not found',
      });
      return;
    }

    // Store previous slots for history
    const previousSlots = [...seat.timeSlots];

    // Update time slots
    seat.timeSlots = timeSlotsWithDuration;
    seat.timeSlotsUpdatedAt = new Date();
    seat.timeSlotsUpdatedBy = adminId;

    await seat.save();

    // Create history record
    const userId = seat.assignedTo ? seat.assignedTo : undefined;
    await TimeSlotHistory.create({
      adminId,
      seatNumber: parseInt(seatNumber),
      userId,
      previousSlots: previousSlots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
      })),
      updatedSlots: timeSlotsWithDuration.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
      })),
      changeNotes: notes || '',
      changeType: previousSlots.length === 0 ? 'created' : 'updated',
    });

    const populatedSeat = await Seat.findById(seat._id).populate('assignedTo', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Time slots updated successfully',
      data: { seat: populatedSeat },
    });
  } catch (error: any) {
    console.error('Update seat time slots error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update time slots',
    });
  }
};

/**
 * @route   POST /api/admin/seats/:seatNumber/timeslots/add
 * @desc    Add a time slot to a seat
 * @access  Private/Admin
 */
export const addSeatTimeSlot = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { seatNumber } = req.params;
    const { startTime, endTime, label, notes } = req.body;
    const adminId = req.user?._id;

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM (e.g., 07:00)',
      });
      return;
    }

    // Validate that endTime is after startTime
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
      return;
    }

    const seat = await Seat.findOne({ seatNumber: parseInt(seatNumber) });
    if (!seat) {
      res.status(404).json({
        success: false,
        message: 'Seat not found',
      });
      return;
    }

    // Calculate duration
    const duration = calculateDuration(startTime, endTime);

    // Store previous slots for history
    const previousSlots = [...seat.timeSlots];

    // Add new time slot
    const newSlot = { startTime, endTime, label: label || '', duration };
    seat.timeSlots.push(newSlot);
    seat.timeSlotsUpdatedAt = new Date();
    seat.timeSlotsUpdatedBy = adminId;

    await seat.save();

    // Create history record
    const userId = seat.assignedTo ? seat.assignedTo : undefined;
    await TimeSlotHistory.create({
      adminId,
      seatNumber: parseInt(seatNumber),
      userId,
      previousSlots: previousSlots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
      })),
      updatedSlots: seat.timeSlots.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        label: s.label,
      })),
      changeNotes: notes || '',
      changeType: 'updated',
    });

    const populatedSeat = await Seat.findById(seat._id).populate('assignedTo', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Time slot added successfully',
      data: { seat: populatedSeat },
    });
  } catch (error: any) {
    console.error('Add seat time slot error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add time slot',
    });
  }
};

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user information by admin
 * @access  Private/Admin
 */
export const updateUserByAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { name, email, phone, reason } = req.body;
    const adminId = req.user?._id;
    const isSuperAdmin = req.user?.isSuperAdmin || false;

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Track changes in history
    const changes = [];

    if (name && name !== user.name) {
      changes.push({
        userId: user._id,
        changedBy: adminId,
        changedByRole: isSuperAdmin ? 'super_admin' : 'admin',
        changeType: 'name',
        oldValue: user.name,
        newValue: name,
        reason: reason || 'Admin correction',
      });
      user.name = name;
    }

    if (email && email !== user.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
        return;
      }

      changes.push({
        userId: user._id,
        changedBy: adminId,
        changedByRole: isSuperAdmin ? 'super_admin' : 'admin',
        changeType: 'email',
        oldValue: user.email,
        newValue: email,
        reason: reason || 'Admin correction',
      });
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      changes.push({
        userId: user._id,
        changedBy: adminId,
        changedByRole: isSuperAdmin ? 'super_admin' : 'admin',
        changeType: 'phone',
        oldValue: user.phone,
        newValue: phone,
        reason: reason || 'Admin correction',
      });
      user.phone = phone;
    }

    // Save changes to history
    if (changes.length > 0) {
      await UserChangeHistory.insertMany(changes);
      await user.save();

      res.status(200).json({
        success: true,
        message: 'User information updated successfully',
        data: { user },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No changes detected',
      });
    }
  } catch (error) {
    console.error('Update user by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user information',
    });
  }
};

/**
 * @route   GET /api/admin/users/:userId/history
 * @desc    Get user change history
 * @access  Private/Admin
 */
export const getUserChangeHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    const history = await UserChangeHistory.find({ userId })
      .populate('changedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Get count of each type of change
    const stats = await UserChangeHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$changeType',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        history,
        stats,
        totalChanges: history.length,
      },
    });
  } catch (error) {
    console.error('Get user change history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch change history',
    });
  }
};

/**
 * @route   GET /api/admin/seats/:seatNumber/timeslots/history
 * @desc    Get time slot change history for a seat
 * @access  Private/Admin
 */
export const getSeatTimeSlotHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { seatNumber } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const history = await TimeSlotHistory.find({ seatNumber: parseInt(seatNumber) })
      .populate('adminId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TimeSlotHistory.countDocuments({ seatNumber: parseInt(seatNumber) });

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get seat time slot history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slot history',
    });
  }
};

/**
 * @route   GET /api/admin/users/:userId/timeslots/history
 * @desc    Get time slot change history for a user
 * @access  Private/Admin
 */
export const getUserTimeSlotHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const history = await TimeSlotHistory.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('adminId', 'name email')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TimeSlotHistory.countDocuments({ userId: new mongoose.Types.ObjectId(userId) });

    res.status(200).json({
      success: true,
      data: {
        history,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    });
  } catch (error) {
    console.error('Get user time slot history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time slot history',
    });
  }
};

/**
 * @route   GET /api/admin/profile
 * @desc    Get admin profile
 * @access  Private/Admin
 */
export const getAdminProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?._id;

    const admin = await User.findById(adminId).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile',
    });
  }
};

/**
 * @route   PUT /api/admin/profile
 * @desc    Update admin profile
 * @access  Private/Admin
 */
export const updateAdminProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const { name, phone } = req.body;

    const admin = await User.findById(adminId);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // Update fields
    if (name) admin.name = name;
    if (phone) admin.phone = phone;

    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin profile',
    });
  }
};

/**
 * @route   PUT /api/admin/change-password
 * @desc    Change admin password
 * @access  Private/Admin
 */
export const changeAdminPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    const admin = await User.findById(adminId);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};
