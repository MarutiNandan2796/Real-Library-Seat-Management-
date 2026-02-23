import mongoose, { Document, Schema } from 'mongoose';

export interface ILibrarySettings extends Document {
  morningSlot: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  eveningSlot: {
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
  };
  lastUpdatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  createdAt: Date;
}

const librarySettingsSchema = new Schema<ILibrarySettings>(
  {
    morningSlot: {
      startTime: {
        type: String,
        required: [true, 'Morning start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
      },
      endTime: {
        type: String,
        required: [true, 'Morning end time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
      },
    },
    eveningSlot: {
      startTime: {
        type: String,
        required: [true, 'Evening start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
      },
      endTime: {
        type: String,
        required: [true, 'Evening end time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format'],
      },
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
librarySettingsSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('LibrarySettings').countDocuments();
    if (count > 0) {
      throw new Error('Only one library settings document can exist');
    }
  }
  next();
});

export default mongoose.model<ILibrarySettings>('LibrarySettings', librarySettingsSchema);
