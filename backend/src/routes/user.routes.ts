import express from 'express';
import {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from '../controllers/user.controller';
import { authenticate, isUser } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication and user check to all routes
router.use(authenticate, isUser);

router.get('/dashboard', getUserDashboard);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/change-password', changeUserPassword);

export default router;
