import express from 'express';
import { body } from 'express-validator';
import {
  sendFeeRequest,
  getPaymentStatus,
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  addOrUpdateBankAccount,
  getBankAccount,
  createCustomPaymentRequest,
  getPaymentDashboard,
  getAllPayments,
} from '../controllers/payment.controller';
import { authenticate, isAdmin, isUser } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

// Admin Bank Account routes
router.post(
  '/admin/bank-account',
  authenticate,
  isAdmin,
  [
    body('accountHolderName').notEmpty().withMessage('Account holder name is required'),
    body('bankName').notEmpty().withMessage('Bank name is required'),
    body('accountNumber').notEmpty().withMessage('Account number is required'),
    body('ifscCode').notEmpty().withMessage('IFSC code is required'),
    body('branchName').notEmpty().withMessage('Branch name is required'),
    body('accountType').isIn(['savings', 'current']).withMessage('Invalid account type'),
  ],
  handleValidationErrors,
  addOrUpdateBankAccount
);

router.get('/admin/bank-account', authenticate, isAdmin, getBankAccount);

// Admin Payment routes
router.post(
  '/admin/send-request',
  authenticate,
  isAdmin,
  [
    body('month').notEmpty().withMessage('Month is required'),
    body('year').isInt().withMessage('Year must be a valid number'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  ],
  handleValidationErrors,
  sendFeeRequest
);

router.post(
  '/admin/create-custom-request',
  authenticate,
  isAdmin,
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
    body('description').notEmpty().withMessage('Description is required'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  ],
  handleValidationErrors,
  createCustomPaymentRequest
);

router.get('/admin/status', authenticate, isAdmin, getPaymentStatus);
router.get('/admin/dashboard', authenticate, isAdmin, getPaymentDashboard);
router.get('/admin/all', authenticate, isAdmin, getAllPayments);

// User routes
router.post('/user/create-order', authenticate, isUser, createPaymentOrder);

router.post(
  '/user/verify',
  authenticate,
  isUser,
  [
    body('razorpayOrderId').notEmpty().withMessage('Order ID is required'),
    body('razorpayPaymentId').notEmpty().withMessage('Payment ID is required'),
    body('razorpaySignature').notEmpty().withMessage('Signature is required'),
  ],
  handleValidationErrors,
  verifyPayment
);

router.get('/user/history', authenticate, isUser, getPaymentHistory);

export default router;
