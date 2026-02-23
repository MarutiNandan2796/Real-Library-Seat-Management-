import { Request, Response } from 'express';
import LibrarySettings from '../models/LibrarySettings.model';

/**
 * @route   GET /api/admin/settings/library
 * @desc    Get library time slot settings
 * @access  Private/Admin
 */
export const getLibrarySettings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    let settings = await LibrarySettings.findOne().populate('lastUpdatedBy', 'name email');

    // If no settings exist, create default ones
    if (!settings) {
      settings = await LibrarySettings.create({
        morningSlot: {
          startTime: '06:00',
          endTime: '12:00',
        },
        eveningSlot: {
          startTime: '14:00',
          endTime: '20:00',
        },
        lastUpdatedBy: _req.user?._id,
      });
      settings = await settings.populate('lastUpdatedBy', 'name email');
    }

    res.status(200).json({
      success: true,
      message: 'Library settings retrieved successfully',
      data: { settings },
    });
  } catch (error) {
    console.error('Get library settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch library settings',
    });
  }
};

/**
 * @route   PATCH /api/admin/settings/library
 * @desc    Update library time slot settings (Super Admin only)
 * @access  Private/SuperAdmin
 */
export const updateLibrarySettings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { morningSlot, eveningSlot } = req.body;
    const adminId = req.user?._id;

    // Validate input
    if (!morningSlot || !eveningSlot) {
      res.status(400).json({
        success: false,
        message: 'Morning slot and evening slot are required',
      });
      return;
    }

    if (!morningSlot.startTime || !morningSlot.endTime) {
      res.status(400).json({
        success: false,
        message: 'Morning slot must have startTime and endTime',
      });
      return;
    }

    if (!eveningSlot.startTime || !eveningSlot.endTime) {
      res.status(400).json({
        success: false,
        message: 'Evening slot must have startTime and endTime',
      });
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(morningSlot.startTime) ||
      !timeRegex.test(morningSlot.endTime) ||
      !timeRegex.test(eveningSlot.startTime) ||
      !timeRegex.test(eveningSlot.endTime)
    ) {
      res.status(400).json({
        success: false,
        message: 'Please use HH:MM format for all times (e.g., 09:00, 17:30)',
      });
      return;
    }

    // Validate that start time is before end time
    const morningStart = parseInt(morningSlot.startTime.replace(':', ''));
    const morningEnd = parseInt(morningSlot.endTime.replace(':', ''));
    const eveningStart = parseInt(eveningSlot.startTime.replace(':', ''));
    const eveningEnd = parseInt(eveningSlot.endTime.replace(':', ''));

    if (morningStart >= morningEnd) {
      res.status(400).json({
        success: false,
        message: 'Morning start time must be before end time',
      });
      return;
    }

    if (eveningStart >= eveningEnd) {
      res.status(400).json({
        success: false,
        message: 'Evening start time must be before end time',
      });
      return;
    }

    // Find existing settings or create new one
    let settings = await LibrarySettings.findOne();

    if (!settings) {
      settings = new LibrarySettings({
        morningSlot,
        eveningSlot,
        lastUpdatedBy: adminId,
      });
    } else {
      settings.morningSlot = morningSlot;
      settings.eveningSlot = eveningSlot;
      settings.lastUpdatedBy = adminId;
    }

    await settings.save();
    settings = await settings.populate('lastUpdatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Library settings updated successfully',
      data: { settings },
    });
  } catch (error: any) {
    console.error('Update library settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update library settings',
    });
  }
};
