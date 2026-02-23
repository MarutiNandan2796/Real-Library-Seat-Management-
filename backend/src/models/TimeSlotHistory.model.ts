import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlotHistory extends Document {
  adminId: mongoose.Types.ObjectId;
  seatNumber: number;
  userId?: mongoose.Types.ObjectId;
  previousSlots: Array<{
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  updatedSlots: Array<{
    startTime: string;
    endTime: string;
    label?: string;
  }>;
  changeNotes?: string;
  changeType: 'created' | 'updated' | 'deleted';
  createdAt: Date;
}

const timeSlotHistorySchema = new Schema<ITimeSlotHistory>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    previousSlots: {
      type: [
        {
          startTime: String,
          endTime: String,
          label: String,
        },
      ],
      default: [],
    },
    updatedSlots: {
      type: [
        {
          startTime: String,
          endTime: String,
          label: String,
        },
      ],
      required: true,
    },
    changeNotes: {
      type: String,
      default: '',
    },
    changeType: {
      type: String,
      enum: ['created', 'updated', 'deleted'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
timeSlotHistorySchema.index({ seatNumber: 1, createdAt: -1 });
timeSlotHistorySchema.index({ adminId: 1, createdAt: -1 });
timeSlotHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ITimeSlotHistory>('TimeSlotHistory', timeSlotHistorySchema);
