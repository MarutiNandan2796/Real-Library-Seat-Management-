import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot {
  startTime: string; // Format: "HH:MM" (e.g., "07:00")
  endTime: string;   // Format: "HH:MM" (e.g., "10:00")
  label?: string;    // Optional label like "Morning Session", "Evening Session"
  duration?: number; // Duration in minutes (calculated)
}

export interface ISeat extends Document {
  seatNumber: number;
  isOccupied: boolean;
  assignedTo: mongoose.Types.ObjectId | null;
  assignedDate: Date | null;
  studyDuration: number; // Duration in hours per day
  timeSlots: ITimeSlot[]; // Array of time slots
  timeSlotsUpdatedAt?: Date; // Track when time slots were last updated
  timeSlotsUpdatedBy?: mongoose.Types.ObjectId; // Track who updated the time slots
  createdAt: Date;
  updatedAt: Date;
}

const seatSchema = new Schema<ISeat>(
  {
    seatNumber: {
      type: Number,
      required: [true, 'Seat number is required'],
      unique: true,
      min: [1, 'Seat number must be at least 1'],
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedDate: {
      type: Date,
      default: null,
    },
    studyDuration: {
      type: Number,
      default: 0,
      min: [0, 'Study duration cannot be negative'],
      max: [24, 'Study duration cannot exceed 24 hours'],
    },
    timeSlots: {
      type: [
        {
          startTime: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
          },
          endTime: {
            type: String,
            required: true,
            match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM'],
          },
          label: {
            type: String,
            default: '',
          },
          duration: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    timeSlotsUpdatedAt: {
      type: Date,
      default: null,
    },
    timeSlotsUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
seatSchema.index({ seatNumber: 1 });
seatSchema.index({ isOccupied: 1 });

export default mongoose.model<ISeat>('Seat', seatSchema);
