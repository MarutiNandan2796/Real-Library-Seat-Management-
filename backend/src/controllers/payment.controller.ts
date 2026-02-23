import { Request, Response } from 'express';
import crypto from 'crypto';
import Payment from '../models/Payment.model';
import User from '../models/User.model';
import AdminBankAccount from '../models/AdminBankAccount.model';
import { razorpayInstance, RAZORPAY_KEY_ID } from '../config/razorpay';

/**
 * @route   POST /api/admin/payments/send-request
 * @desc    Send monthly fee request to users
 * @access  Private/Admin
 */
export const sendFeeRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userIds, month, year, dueDate } = req.body;

    let users;
    if (userIds && userIds.length > 0) {
      // Send to selected users
      users = await User.find({ _id: { $in: userIds }, role: 'user' });
    } else {
      // Send to all active users
      users = await User.find({ role: 'user', isActive: true });
    }

    if (users.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No users found',
      });
      return;
    }

    const payments = [];
    for (const user of users) {
      // Check if payment already exists for this month/year
      const existingPayment = await Payment.findOne({
        userId: user._id,
        month,
        year,
      });

      if (!existingPayment) {
        payments.push({
          userId: user._id,
          amount: user.monthlyFee,
          month,
          year,
          dueDate: new Date(dueDate),
          paymentStatus: 'pending',
        });
      }
    }

    if (payments.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Payment requests already exist for selected users',
      });
      return;
    }

    await Payment.insertMany(payments);

    res.status(201).json({
      success: true,
      message: `Fee request sent to ${payments.length} users`,
      data: { count: payments.length },
    });
  } catch (error) {
    console.error('Send fee request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send fee request',
    });
  }
};

/**
 * @route   GET /api/admin/payments/status
 * @desc    Get payment status report
 * @access  Private/Admin
 */
export const getPaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { month, year } = req.query;

    const query: any = {};
    if (month) query.month = month;
    if (year) query.year = parseInt(year as string);

    const payments = await Payment.find(query)
      .populate('userId', 'name email seatNumber')
      .sort({ createdAt: -1 });

    const summary = {
      total: payments.length,
      paid: payments.filter((p) => p.paymentStatus === 'paid').length,
      pending: payments.filter((p) => p.paymentStatus === 'pending').length,
      failed: payments.filter((p) => p.paymentStatus === 'failed').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: payments
        .filter((p) => p.paymentStatus === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary,
      },
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status',
    });
  }
};

/**
 * @route   POST /api/user/payments/create-order
 * @desc    Create Razorpay order for payment
 * @access  Private/User
 */
export const createPaymentOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { paymentId } = req.body;
    const userId = req.user?._id;

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    // Verify payment belongs to user
    if (payment.userId.toString() !== userId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
      return;
    }

    // Check if already paid
    if (payment.paymentStatus === 'paid') {
      res.status(400).json({
        success: false,
        message: 'Payment already completed',
      });
      return;
    }

    // Create Razorpay order
    const options = {
      amount: payment.amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${payment._id}`,
      notes: {
        paymentId: payment._id.toString(),
        userId: userId?.toString() || '',
        month: payment.month,
        year: payment.year.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(options);

    // Update payment with order ID
    payment.razorpayOrderId = order.id;
    await payment.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: payment.amount,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
        payment,
      },
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
    });
  }
};

/**
 * @route   POST /api/user/payments/verify
 * @desc    Verify Razorpay payment
 * @access  Private/User
 */
export const verifyPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user?._id;

    // Find payment
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
      return;
    }

    // Verify payment belongs to user
    if (payment.userId.toString() !== userId?.toString()) {
      res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
      return;
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      payment.paymentStatus = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
      return;
    }

    // Update payment
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paymentStatus = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      data: { payment },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
    });
  }
};

/**
 * @route   GET /api/user/payments/history
 * @desc    Get user payment history
 * @access  Private/User
 */
export const getPaymentHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { payments },
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
    });
  }
};

/**
 * @route   POST /api/admin/bank-account
 * @desc    Add or update admin bank account
 * @access  Private/Admin
 */
export const addOrUpdateBankAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      upiId,
      razorpayKeyId,
      razorpayKeySecret,
    } = req.body;

    // Find existing bank account
    let bankAccount = await AdminBankAccount.findOne({ adminId });

    if (bankAccount) {
      // Update existing
      bankAccount.accountHolderName = accountHolderName;
      bankAccount.bankName = bankName;
      bankAccount.accountNumber = accountNumber;
      bankAccount.ifscCode = ifscCode;
      bankAccount.branchName = branchName;
      bankAccount.accountType = accountType;
      bankAccount.upiId = upiId;
      if (razorpayKeyId) bankAccount.razorpayKeyId = razorpayKeyId;
      if (razorpayKeySecret) bankAccount.razorpayKeySecret = razorpayKeySecret;
      await bankAccount.save();
    } else {
      // Create new
      bankAccount = await AdminBankAccount.create({
        adminId,
        accountHolderName,
        bankName,
        accountNumber,
        ifscCode,
        branchName,
        accountType,
        upiId,
        razorpayKeyId,
        razorpayKeySecret,
      });
    }

    // Return without sensitive data
    const bankAccountData = await AdminBankAccount.findById(bankAccount._id);

    res.status(200).json({
      success: true,
      message: 'Bank account saved successfully',
      data: bankAccountData,
    });
  } catch (error) {
    console.error('Add/Update bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save bank account',
    });
  }
};

/**
 * @route   GET /api/admin/bank-account
 * @desc    Get admin bank account
 * @access  Private/Admin
 */
export const getBankAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?._id;

    const bankAccount = await AdminBankAccount.findOne({ adminId, isActive: true });

    res.status(200).json({
      success: true,
      data: bankAccount,
    });
  } catch (error) {
    console.error('Get bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank account',
    });
  }
};

/**
 * @route   POST /api/admin/payments/create-custom-request
 * @desc    Create custom payment request for user
 * @access  Private/Admin
 */
export const createCustomPaymentRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user?._id;
    const { userId, amount, description, dueDate, month, year } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Create custom payment request
    const payment = await Payment.create({
      userId,
      createdBy: adminId,
      amount,
      description,
      month: month || new Date().toLocaleString('default', { month: 'long' }),
      year: year || new Date().getFullYear(),
      dueDate: new Date(dueDate),
      paymentType: 'custom',
      paymentStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Payment request created successfully',
      data: payment,
    });
  } catch (error) {
    console.error('Create custom payment request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment request',
    });
  }
};

/**
 * @route   GET /api/admin/payments/dashboard
 * @desc    Get admin payment dashboard statistics
 * @access  Private/Admin
 */
export const getPaymentDashboard = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get all payments
    const allPayments = await Payment.find().populate('userId', 'name email seatNumber');

    // Calculate statistics
    const totalPayments = allPayments.length;
    const paidPayments = allPayments.filter((p) => p.paymentStatus === 'paid');
    const pendingPayments = allPayments.filter((p) => p.paymentStatus === 'pending');
    const failedPayments = allPayments.filter((p) => p.paymentStatus === 'failed');

    const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalReceived = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    // Get recent payments
    const recentPayments = await Payment.find({ paymentStatus: 'paid' })
      .populate('userId', 'name email seatNumber')
      .sort({ paidAt: -1 })
      .limit(10);

    // Get monthly breakdown (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBreakdown = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          paidAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalPayments,
          paidCount: paidPayments.length,
          pendingCount: pendingPayments.length,
          failedCount: failedPayments.length,
          totalAmount,
          totalReceived,
          totalPending,
        },
        recentPayments,
        monthlyBreakdown,
      },
    });
  } catch (error) {
    console.error('Get payment dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment dashboard',
    });
  }
};

/**
 * @route   GET /api/admin/payments/all
 * @desc    Get all payments with filters
 * @access  Private/Admin
 */
export const getAllPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, paymentType, userId, month, year } = req.query;

    const filter: any = {};
    if (status) filter.paymentStatus = status;
    if (paymentType) filter.paymentType = paymentType;
    if (userId) filter.userId = userId;
    if (month) filter.month = month;
    if (year) filter.year = parseInt(year as string);

    const payments = await Payment.find(filter)
      .populate('userId', 'name email seatNumber phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
    });
  }
};

