import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  adminId: mongoose.Types.ObjectId;
  recipientType: 'all' | 'selected';
  recipients: mongoose.Types.ObjectId[];
  readBy: mongoose.Types.ObjectId[];
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    recipientType: {
      type: String,
      enum: ['all', 'selected'],
      required: [true, 'Recipient type is required'],
    },
    recipients: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ adminId: 1 });
messageSchema.index({ recipientType: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
