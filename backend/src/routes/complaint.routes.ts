import express from 'express';
import { body } from 'express-validator';
import {
  submitComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
} from '../controllers/complaint.controller';
import { authenticate, isAdmin, isUser } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

// User routes
router.post(
  '/user',
  authenticate,
  isUser,
  [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  handleValidationErrors,
  submitComplaint
);

router.get('/user', authenticate, isUser, getUserComplaints);

// Admin routes
router.get('/admin', authenticate, isAdmin, getAllComplaints);
router.patch('/admin/:id', authenticate, isAdmin, updateComplaintStatus);
router.delete('/admin/:id', authenticate, isAdmin, deleteComplaint);

export default router;
