import mongoose, { Document, Schema } from 'mongoose';

export interface IComplaint extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: 'pending' | 'resolved';
  adminResponse: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
    adminResponse: {
      type: String,
      default: null,
      trim: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
complaintSchema.index({ userId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model<IComplaint>('Complaint', complaintSchema);
