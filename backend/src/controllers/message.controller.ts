import { Request, Response } from 'express';
import Message from '../models/Message.model';

/**
 * @route   POST /api/admin/messages
 * @desc    Send message to users
 * @access  Private/Admin
 */
export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { recipientType, recipients, title, message } = req.body;
    const adminId = req.user?._id;

    // Validate input
    if (!title || !message) {
      res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
      return;
    }

    if (recipientType === 'selected' && (!recipients || recipients.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Please select at least one recipient',
      });
      return;
    }

    // Create message
    const newMessage = await Message.create({
      adminId,
      recipientType,
      recipients: recipientType === 'selected' ? recipients : [],
      title,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

/**
 * @route   GET /api/admin/messages
 * @desc    Get all messages sent by admin
 * @access  Private/Admin
 */
export const getAdminMessages = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const messages = await Message.find()
      .populate('recipients', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

/**
 * @route   GET /api/user/messages
 * @desc    Get messages for logged-in user
 * @access  Private/User
 */
export const getUserMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Find messages sent to all OR messages where user is in recipients
    const messages = await Message.find({
      $or: [
        { recipientType: 'all' },
        { recipientType: 'selected', recipients: userId },
      ],
    })
      .populate('adminId', 'name')
      .sort({ createdAt: -1 });

    // Add isRead property to each message
    const messagesWithReadStatus = messages.map(msg => {
      const msgObj = msg.toObject();
      return {
        ...msgObj,
        isRead: msgObj.readBy && msgObj.readBy.length > 0 
          ? msgObj.readBy.some((id: any) => id.toString() === userId.toString())
          : false,
      };
    });

    res.status(200).json({
      success: true,
      data: { messages: messagesWithReadStatus },
    });
  } catch (error) {
    console.error('Get user messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

/**
 * @route   DELETE /api/admin/messages/:id
 * @desc    Delete message
 * @access  Private/Admin
 */
export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      res.status(404).json({
        success: false,
        message: 'Message not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};

/**
 * @route   PATCH /api/messages/user/:id/read
 * @desc    Mark message as read
 * @access  Private/User
 */
export const markMessageAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    console.log('=== Mark Message as Read ===');
    console.log('Message ID:', id);
    console.log('User ID:', userId);

    if (!userId) {
      console.log('ERROR: No user ID found in request');
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const message = await Message.findById(id);
    console.log('Message found:', message ? 'Yes' : 'No');

    if (!message) {
      console.log('ERROR: Message not found');
      res.status(404).json({
        success: false,
        message: 'Message not found',
      });
      return;
    }

    // Initialize readBy array if it doesn't exist
    if (!message.readBy) {
      console.log('Initializing readBy array');
      message.readBy = [];
    }

    console.log('Current readBy:', message.readBy);

    // Check if user already marked as read (compare as strings)
    const alreadyRead = message.readBy.some(
      (readerId) => readerId.toString() === userId.toString()
    );

    console.log('Already read:', alreadyRead);

    if (!alreadyRead) {
      console.log('Adding user to readBy array');
      message.readBy.push(userId);
      await message.save();
      console.log('Message saved successfully');
    }

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
    console.log('=== Success ===');
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read',
    });
  }
};
