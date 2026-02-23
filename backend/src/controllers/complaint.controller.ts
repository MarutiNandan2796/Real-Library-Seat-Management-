import { Request, Response } from 'express';
import Complaint from '../models/Complaint.model';

/**
 * @route   POST /api/user/complaints
 * @desc    Submit new complaint
 * @access  Private/User
 */
export const submitComplaint = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subject, description } = req.body;
    const userId = req.user?._id;

    if (!subject || !description) {
      res.status(400).json({
        success: false,
        message: 'Subject and description are required',
      });
      return;
    }

    const complaint = await Complaint.create({
      userId,
      subject,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: { complaint },
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit complaint',
    });
  }
};

/**
 * @route   GET /api/user/complaints
 * @desc    Get user's complaints
 * @access  Private/User
 */
export const getUserComplaints = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const complaints = await Complaint.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { complaints },
    });
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};

/**
 * @route   GET /api/admin/complaints
 * @desc    Get all complaints
 * @access  Private/Admin
 */
export const getAllComplaints = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    const query: any = {};
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone seatNumber')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { complaints },
    });
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};

/**
 * @route   PATCH /api/admin/complaints/:id
 * @desc    Update complaint status
 * @access  Private/Admin
 */
export const updateComplaintStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
      return;
    }

    if (status) {
      complaint.status = status;
      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    if (adminResponse) {
      complaint.adminResponse = adminResponse;
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: { complaint },
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update complaint',
    });
  }
};

/**
 * @route   DELETE /api/admin/complaints/:id
 * @desc    Delete complaint
 * @access  Private/Admin
 */
export const deleteComplaint = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete complaint',
    });
  }
};
