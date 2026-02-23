import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminBankAccount extends Document {
  adminId: mongoose.Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'savings' | 'current';
  upiId?: string;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminBankAccountSchema = new Schema<IAdminBankAccount>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required'],
      trim: true,
    },
    bankName: {
      type: String,
      required: [true, 'Bank name is required'],
      trim: true,
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required'],
      trim: true,
    },
    ifscCode: {
      type: String,
      required: [true, 'IFSC code is required'],
      trim: true,
      uppercase: true,
    },
    branchName: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current'],
      default: 'savings',
    },
    upiId: {
      type: String,
      trim: true,
    },
    razorpayKeyId: {
      type: String,
      trim: true,
    },
    razorpayKeySecret: {
      type: String,
      trim: true,
      select: false, // Don't include in queries by default
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
adminBankAccountSchema.index({ adminId: 1, isActive: 1 });

export default mongoose.model<IAdminBankAccount>('AdminBankAccount', adminBankAccountSchema);
