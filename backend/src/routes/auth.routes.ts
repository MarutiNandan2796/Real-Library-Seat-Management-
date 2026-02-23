import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  registerAdmin, 
  login, 
  verifyToken, 
  logout,
  requestSuperAdmin,
  verifySuperAdmin,
  checkSuperAdmin,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin
} from '../controllers/auth.controller';
import { authenticate, isSuperAdmin } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
  ],
  handleValidationErrors,
  register
);

/**
 * @route   POST /api/auth/register-admin
 * @desc    Register new admin (requires admin code)
 * @access  Public (protected by admin code)
 */
router.post(
  '/register-admin',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('adminCode').notEmpty().withMessage('Admin authorization code is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must contain at least one number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/)
      .withMessage('Password must contain at least one lowercase letter')
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage('Password must contain at least one special character'),
  ],
  handleValidationErrors,
  registerAdmin
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user/admin
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  handleValidationErrors,
  login
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token
 * @access  Private
 */
router.get('/verify', authenticate, verifyToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/check-superadmin
 * @desc    Check if super admin exists
 * @access  Public
 */
router.get('/check-superadmin', checkSuperAdmin);

/**
 * @route   POST /api/auth/request-superadmin
 * @desc    Request to become super admin (sends OTP)
 * @access  Public
 */
router.post(
  '/request-superadmin',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('password')
      .isLength({ min: 10 })
      .withMessage('Password must be at least 10 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)'),
  ],
  handleValidationErrors,
  requestSuperAdmin
);

/**
 * @route   POST /api/auth/verify-superadmin
 * @desc    Verify OTP and create super admin
 * @access  Public
 */
router.post(
  '/verify-superadmin',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits'),
    body('name').notEmpty().withMessage('Name is required'),
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/)
      .withMessage('Phone number must be 10 digits'),
    body('password')
      .isLength({ min: 10 })
      .withMessage('Password must be at least 10 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character (@$!%*?&#)'),
  ],
  handleValidationErrors,
  verifySuperAdmin
);

/**
 * @route   GET /api/auth/pending-admins
 * @desc    Get all pending admin requests
 * @access  Private (Super Admin only)
 */
router.get('/pending-admins', authenticate, isSuperAdmin, getPendingAdmins);

/**
 * @route   POST /api/auth/approve-admin/:id
 * @desc    Approve pending admin request
 * @access  Private (Super Admin only)
 */
router.post('/approve-admin/:id', authenticate, isSuperAdmin, approveAdmin);

/**
 * @route   POST /api/auth/reject-admin/:id
 * @desc    Reject pending admin request
 * @access  Private (Super Admin only)
 */
router.post('/reject-admin/:id', authenticate, isSuperAdmin, rejectAdmin);

export default router;
