import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import {
  getLibrarySettings,
  updateLibrarySettings,
} from '../controllers/settings.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validator.middleware';

const router = express.Router();

// Get library settings (accessible to all admins)
router.get('/library', authenticate, isAdmin, getLibrarySettings);

// Update library settings (only super admin)
router.patch(
  '/library',
  authenticate,
  isAdmin,
  [
    body('morningSlot').notEmpty().withMessage('Morning slot is required'),
    body('morningSlot.startTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Morning start time must be in HH:MM format'),
    body('morningSlot.endTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Morning end time must be in HH:MM format'),
    body('eveningSlot').notEmpty().withMessage('Evening slot is required'),
    body('eveningSlot.startTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Evening start time must be in HH:MM format'),
    body('eveningSlot.endTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Evening end time must be in HH:MM format'),
  ],
  handleValidationErrors,
  // Custom middleware to check if user is super admin
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.isSuperAdmin) {
      res.status(403).json({
        success: false,
        message: 'Only super admin can update library settings',
      });
      return;
    }
    next();
  },
  updateLibrarySettings
);

export default router;
