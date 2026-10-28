import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      minlength: [3, 'Service name must be at least 3 characters'],
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Service code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, 'Service code must be at least 2 characters'],
      maxlength: [10, 'Service code cannot exceed 10 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Service description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Service category is required'],
      trim: true,
      default: 'General',
      index: true,
    },
    counterName: {
      type: String,
      required: [true, 'Counter name/number is required'],
      trim: true,
      default: 'Counter 1',
    },
    estimatedDurationMin: {
      type: Number,
      required: true,
      min: [5, 'Estimated duration must be at least 5 minutes'],
      max: [120, 'Estimated duration cannot exceed 120 minutes'],
      default: 15,
    },
    slotCapacity: {
      type: Number,
      required: true,
      min: [1, 'Slot capacity must be at least 1'],
      max: [50, 'Slot capacity cannot exceed 50'],
      default: 5,
    },
    operatingHours: {
      start: {
        type: String,
        default: '09:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM 24-hour format'],
      },
      end: {
        type: String,
        default: '17:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM 24-hour format'],
      },
    },
    availableDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;
