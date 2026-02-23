import { Request, Response } from 'express';
import SupportTicket from '../models/SupportTicket.model';

/**
 * @route   POST /api/support-tickets/user
 * @desc    Create a new support ticket (user sends message to admin)
 * @access  Private/User
 */
export const createSupportTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { subject, message, priority } = req.body;
    const userId = req.user?._id;

    if (!subject || !message) {
      res.status(400).json({
        success: false,
        message: 'Subject and message are required',
      });
      return;
    }

    const ticket = await SupportTicket.create({
      userId,
      subject,
      message,
      priority: priority || 'medium',
    });

    // Populate user info
    const fullTicket = await SupportTicket.findById(ticket._id)
      .populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully. Admin will respond soon.',
      data: { ticket: fullTicket },
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
    });
  }
};

/**
 * @route   GET /api/support-tickets/user
 * @desc    Get user's support tickets
 * @access  Private/User
 */
export const getUserTickets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const tickets = await SupportTicket.find({ userId })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
    });
  }
};

/**
 * @route   GET /api/support-tickets/admin
 * @desc    Get all support tickets (admin view)
 * @access  Private/Admin
 */
export const getAllTickets = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, priority } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name email phone seatNumber')
      .populate('assignedTo', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tickets },
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
    });
  }
};

/**
 * @route   GET /api/support-tickets/admin/:id
 * @desc    Get a specific support ticket
 * @access  Private/Admin
 */
export const getTicketById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'name email phone seatNumber')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support ticket',
    });
  }
};

/**
 * @route   PATCH /api/support-tickets/admin/:id
 * @desc    Update support ticket status and add admin response
 * @access  Private/Admin
 */
export const updateTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminResponse, priority, assignedTo } = req.body;

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      });
      return;
    }

    if (status) {
      ticket.status = status;
      if (status === 'resolved' || status === 'closed') {
        ticket.resolvedAt = new Date();
      }
    }

    if (adminResponse) {
      ticket.adminResponse = adminResponse;
      ticket.adminReplyAt = new Date();
    }

    if (priority) {
      ticket.priority = priority;
    }

    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(id)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Support ticket updated successfully',
      data: { ticket: updatedTicket },
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update support ticket',
    });
  }
};

/**
 * @route   DELETE /api/support-tickets/admin/:id
 * @desc    Delete a support ticket
 * @access  Private/Admin
 */
export const deleteTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const ticket = await SupportTicket.findByIdAndDelete(id);

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Support ticket not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Support ticket deleted successfully',
    });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete support ticket',
    });
  }
};

/**
 * @route   GET /api/support-tickets/stats
 * @desc    Get support ticket statistics
 * @access  Private/Admin
 */
export const getTicketStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const total = await SupportTicket.countDocuments();
    const open = await SupportTicket.countDocuments({ status: 'open' });
    const inProgress = await SupportTicket.countDocuments({ status: 'in-progress' });
    const resolved = await SupportTicket.countDocuments({ status: 'resolved' });
    const closed = await SupportTicket.countDocuments({ status: 'closed' });

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        closed,
      },
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket statistics',
    });
  }
};
