import { Request, Response } from 'express';
import User from '../models/User.model';
import Payment from '../models/Payment.model';
import Message from '../models/Message.model';
import Complaint from '../models/Complaint.model';
import UserChangeHistory from '../models/UserChangeHistory.model';
import Seat from '../models/Seat.model';
import bcrypt from 'bcryptjs';

/**
 * @route   GET /api/user/dashboard
 * @desc    Get user dashboard data
 * @access  Private/User
 */
export const getUserDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Get user details
    const user = await User.findById(userId).select('-password');

    // Get seat details with time slots if user has a seat
    let seatDetails = null;
    if (user?.seatNumber) {
      seatDetails = await Seat.findOne({ seatNumber: user.seatNumber });
    }

    // Get pending payment
    const pendingPayment = await Payment.findOne({
      userId,
      paymentStatus: 'pending',
    }).sort({ dueDate: 1 });

    // Get recent messages (last 5)
    const recentMessages = await Message.find({
      $or: [
        { recipientType: 'all' },
        { recipientType: 'selected', recipients: userId },
      ],
    })
      .populate('adminId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending complaints count
    const pendingComplaintsCount = await Complaint.countDocuments({
      userId,
      status: 'pending',
    });

    // Get payment history (last 3 months)
    const paymentHistory = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        user,
        seatDetails,
        pendingPayment,
        recentMessages,
        pendingComplaintsCount,
        paymentHistory,
      },
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
    });
  }
};

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private/User
 */
export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private/User
 */
export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { name, phone, email } = req.body;

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
        changedBy: userId,
        changedByRole: 'user',
        changeType: 'name',
        oldValue: user.name,
        newValue: name,
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
        changedBy: userId,
        changedByRole: 'user',
        changeType: 'email',
        oldValue: user.email,
        newValue: email,
      });
      user.email = email;
    }

    if (phone && phone !== user.phone) {
      changes.push({
        userId: user._id,
        changedBy: userId,
        changedByRole: 'user',
        changeType: 'phone',
        oldValue: user.phone,
        newValue: phone,
      });
      user.phone = phone;
    }

    // Save changes to history
    if (changes.length > 0) {
      await UserChangeHistory.insertMany(changes);
      await user.save();
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
    });
  }
};
/**
 * @route   PUT /api/user/change-password
 * @desc    Change user password
 * @access  Private/User
 */
export const changeUserPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
      return;
    }

    // Hash and update new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};