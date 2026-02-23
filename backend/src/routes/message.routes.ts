import express from 'express';
import { body } from 'express-validator';
import {
  sendMessage,
  getAdminMessages,
  getUserMessages,
  deleteMessage,
  markMessageAsRead,
} from '../controllers/message.controller';
import { authenticate, isAdmin, isUser } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

// Admin routes
router.post(
  '/admin',
  authenticate,
  isAdmin,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('recipientType')
      .isIn(['all', 'selected'])
      .withMessage('Recipient type must be "all" or "selected"'),
  ],
  handleValidationErrors,
  sendMessage
);

router.get('/admin', authenticate, isAdmin, getAdminMessages);
router.delete('/admin/:id', authenticate, isAdmin, deleteMessage);

// User routes
router.get('/user', authenticate, isUser, getUserMessages);
router.patch('/user/:id/read', authenticate, isUser, markMessageAsRead);

export default router;
