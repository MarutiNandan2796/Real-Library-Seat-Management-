import express from 'express';
import { body } from 'express-validator';
import {
  createSupportTicket,
  getUserTickets,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketStats,
} from '../controllers/support-ticket.controller';
import { authenticate, isAdmin, isUser } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

// User routes
router.post(
  '/user',
  authenticate,
  isUser,
  [
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 5, max: 100 })
      .withMessage('Subject must be between 5 and 100 characters'),
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority level'),
  ],
  handleValidationErrors,
  createSupportTicket
);

router.get('/user', authenticate, isUser, getUserTickets);

// Admin routes
router.get('/admin/stats', authenticate, isAdmin, getTicketStats);
router.get('/admin', authenticate, isAdmin, getAllTickets);
router.get('/admin/:id', authenticate, isAdmin, getTicketById);
router.patch(
  '/admin/:id',
  authenticate,
  isAdmin,
  [
    body('status')
      .optional()
      .isIn(['open', 'in-progress', 'resolved', 'closed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('adminResponse')
      .optional()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Response must be between 5 and 1000 characters'),
  ],
  handleValidationErrors,
  updateTicket
);

router.delete('/admin/:id', authenticate, isAdmin, deleteTicket);

export default router;
