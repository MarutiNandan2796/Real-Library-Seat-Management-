import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleBlockUser,
  toggleActivateUser,
  getAllSeats,
  assignSeat,
  createSeats,
  updateUserByAdmin,
  getUserChangeHistory,
  unassignSeat,
  deleteSeat,
  updateSeatDuration,
  updateSeatTimeSlots,
  addSeatTimeSlot,
  getSeatTimeSlotHistory,
  getUserTimeSlotHistory,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Admin Profile
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

// User Management
router.get('/users', getAllUsers);

router.post(
  '/users',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('monthlyFee')
      .optional()
      .isNumeric()
      .withMessage('Monthly fee must be a number'),
  ],
  handleValidationErrors,
  createUser
);

router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/block', toggleBlockUser);
router.patch('/users/:id/activate', toggleActivateUser);
router.put('/users/:userId/edit', updateUserByAdmin);
router.get('/users/:userId/history', getUserChangeHistory);
router.get('/users/:userId/timeslots/history', getUserTimeSlotHistory);

// Seat Management
router.get('/seats', getAllSeats);
router.post('/seats/assign', assignSeat);
router.post('/seats/unassign', unassignSeat);
router.delete('/seats/:seatNumber', deleteSeat);
router.patch('/seats/:seatNumber/duration', updateSeatDuration);
router.patch('/seats/:seatNumber/timeslots', updateSeatTimeSlots);
router.get('/seats/:seatNumber/timeslots/history', getSeatTimeSlotHistory);
router.post('/seats/:seatNumber/timeslots/add', addSeatTimeSlot);
router.post(
  '/seats/create',
  [
    body('startNumber')
      .isInt({ min: 1 })
      .withMessage('Start number must be at least 1'),
    body('endNumber')
      .isInt({ min: 1 })
      .withMessage('End number must be at least 1'),
  ],
  handleValidationErrors,
  createSeats
);

export default router;
