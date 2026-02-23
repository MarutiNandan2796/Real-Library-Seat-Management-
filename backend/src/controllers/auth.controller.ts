import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import OTP from '../models/OTP.model';
import crypto from 'crypto';
import { sendOTPEmail, sendAdminApprovalEmail } from '../utils/emailService';

/**
 * Generate JWT token
 */
const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  
  return jwt.sign(
    { id, role },
    secret as jwt.Secret,
    { expiresIn } as jwt.SignOptions
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Create user with 'user' role
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'user',
      isActive: true,
      isBlocked: false,
    });

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please login to continue.',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user/admin
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.',
      });
      return;
    }

    // Check if user is blocked
    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Contact admin.',
      });
      return;
    }

    // Check if admin request is pending
    if (user.role === 'admin' && user.adminStatus === 'pending') {
      res.status(403).json({
        success: false,
        message: 'Your admin request is pending approval. Please wait for super admin to approve.',
      });
      return;
    }

    // Check if admin request is rejected
    if (user.role === 'admin' && user.adminStatus === 'rejected') {
      res.status(403).json({
        success: false,
        message: 'Your admin request was rejected. Please contact super admin.',
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and get current user
 * @access  Private
 */
export const verifyToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};

/**
 * @route   POST /api/auth/register-admin
 * @desc    Register new admin (creates pending request)
 * @access  Public
 */
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, adminCode } = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !adminCode) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields including admin code',
      });
      return;
    }

    // Verify admin code (use environment variable or hardcoded for demo)
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || 'ADMIN2026';
    if (adminCode !== validAdminCode) {
      res.status(403).json({
        success: false,
        message: 'Invalid admin authorization code',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Create user with 'admin' role and 'pending' status
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
      adminStatus: 'pending',
      isVerified: false,
      isActive: false,
      isBlocked: false,
    });

    // Remove password from response
    const userResponse: any = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin request submitted. Please wait for super admin approval.',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin registration failed',
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    // In JWT, logout is handled on client side by removing token
    // This endpoint can be used for logging purposes
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * @route   POST /api/auth/request-superadmin
 * @desc    Request to become super admin (sends OTP to email)
 * @access  Public
 */
export const requestSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, phone, password } = req.body;

    if (!email || !name || !phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Check if any super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      res.status(403).json({
        success: false,
        message: 'Super admin already exists. Please contact existing admin for access.',
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save OTP to database
    await OTP.create({
      email,
      otp,
      purpose: 'superadmin_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, name);
    
    console.log(`Super Admin OTP for ${email}: ${otp} (Email sent: ${emailSent})`);

    // In development, always include OTP in response for testing
    const isDevelopment = process.env.NODE_ENV !== 'production' && 
                         (!process.env.EMAIL_USER || !process.env.EMAIL_PASS);

    res.status(200).json({
      success: true,
      message: emailSent 
        ? 'OTP sent to your email. Please verify to become super admin.'
        : 'OTP generated successfully. Check server console for OTP (email service not configured).',
      data: {
        email,
        otp: isDevelopment || !emailSent ? otp : undefined, // Include OTP in development mode or when email fails
      },
    });
  } catch (error) {
    console.error('Super admin request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process super admin request',
    });
  }
};

/**
 * @route   POST /api/auth/verify-superadmin
 * @desc    Verify OTP and create super admin account
 * @access  Public
 */
export const verifySuperAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, name, phone, password } = req.body;

    if (!email || !otp || !name || !phone || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose: 'superadmin_verification',
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
      return;
    }

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    if (existingSuperAdmin) {
      res.status(403).json({
        success: false,
        message: 'Super admin already exists',
      });
      return;
    }

    // Create super admin user
    const superAdmin = await User.create({
      name,
      email,
      phone,
      password,
      role: 'admin',
      isSuperAdmin: true,
      adminStatus: 'approved',
      isVerified: true,
      isActive: true,
      isBlocked: false,
    });

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Generate token
    const token = generateToken(superAdmin._id.toString(), superAdmin.role);

    // Remove password from response
    const userResponse: any = superAdmin.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Super admin account created successfully!',
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    console.error('Super admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify super admin',
    });
  }
};

/**
 * @route   GET /api/auth/pending-admins
 * @desc    Get all pending admin requests
 * @access  Private (Super Admin only)
 */
export const getPendingAdmins = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pendingAdmins = await User.find({
      role: 'admin',
      adminStatus: 'pending',
    }).select('-password');

    res.status(200).json({
      success: true,
      count: pendingAdmins.length,
      data: pendingAdmins,
    });
  } catch (error) {
    console.error('Get pending admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending admins',
    });
  }
};

/**
 * @route   POST /api/auth/approve-admin/:id
 * @desc    Approve pending admin request
 * @access  Private (Super Admin only)
 */
export const approveAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    if (admin.role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'User is not an admin',
      });
      return;
    }

    admin.adminStatus = 'approved';
    admin.isVerified = true;
    admin.isActive = true;
    await admin.save();

    // Send approval email notification
    await sendAdminApprovalEmail(admin.email, admin.name, true);

    res.status(200).json({
      success: true,
      message: 'Admin approved successfully',
      data: admin,
    });
  } catch (error) {
    console.error('Approve admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve admin',
    });
  }
};

/**
 * @route   POST /api/auth/reject-admin/:id
 * @desc    Reject pending admin request
 * @access  Private (Super Admin only)
 */
export const rejectAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    if (admin.role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'User is not an admin',
      });
      return;
    }

    admin.adminStatus = 'rejected';
    await admin.save();

    // Send rejection email notification
    await sendAdminApprovalEmail(admin.email, admin.name, false);

    res.status(200).json({
      success: true,
      message: 'Admin request rejected',
      data: admin,
    });
  } catch (error) {
    console.error('Reject admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject admin',
    });
  }
};

/**
 * @route   GET /api/auth/check-superadmin
 * @desc    Check if super admin exists
 * @access  Public
 */
export const checkSuperAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const superAdmin = await User.findOne({ isSuperAdmin: true });
    
    res.status(200).json({
      success: true,
      exists: !!superAdmin,
    });
  } catch (error) {
    console.error('Check super admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check super admin',
    });
  }
};
