import mongoose, { Schema, Document } from 'mongoose';

export interface IUserChangeHistory extends Document {
  userId: mongoose.Types.ObjectId;
  changedBy: mongoose.Types.ObjectId;
  changedByRole: 'user' | 'admin' | 'super_admin';
  changeType: 'name' | 'email' | 'phone';
  oldValue: string;
  newValue: string;
  reason?: string;
  createdAt: Date;
}

const UserChangeHistorySchema = new Schema<IUserChangeHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedByRole: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      required: true,
    },
    changeType: {
      type: String,
      enum: ['name', 'email', 'phone'],
      required: true,
    },
    oldValue: {
      type: String,
      required: true,
    },
    newValue: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserChangeHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IUserChangeHistory>(
  'UserChangeHistory',
  UserChangeHistorySchema
);
