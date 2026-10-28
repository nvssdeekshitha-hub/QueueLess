import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service ID is required'],
      index: true,
    },
    appointmentDate: {
      type: String, // Stored as normalized 'YYYY-MM-DD' for robust querying and indexing
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
      index: true,
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g. 09:30 - 10:00)'],
      trim: true,
    },
    tokenNumber: {
      type: String,
      required: true,
      trim: true,
    },
    tokenSequence: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'waiting', 'serving', 'completed', 'skipped', 'cancelled'],
        message: '{VALUE} is not a valid appointment status',
      },
      default: 'booked',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
      default: '',
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    calledAt: {
      type: Date,
    },
    servingStartedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
    },
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal performance and concurrency safety
appointmentSchema.index({ service: 1, appointmentDate: 1, tokenSequence: 1 }, { unique: true });
appointmentSchema.index({ service: 1, appointmentDate: 1, timeSlot: 1 });
appointmentSchema.index({ user: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
export default Appointment;
