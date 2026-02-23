import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId; // Admin who created the payment request
  amount: number;
  month: string;
  year: number;
  description?: string; // Custom description for payment
  paymentType: 'monthly_fee' | 'custom'; // Type of payment
  paymentStatus: 'pending' | 'paid' | 'failed';
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
  paidAt: Date | null;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    paymentType: {
      type: String,
      enum: ['monthly_fee', 'custom'],
      default: 'monthly_fee',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique payment per user per month/year
paymentSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
paymentSchema.index({ paymentStatus: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
