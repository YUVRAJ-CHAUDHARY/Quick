const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },

    // 3-Way Handshake Status
    // pending -> accepted -> confirmed -> in_progress -> completed / cancelled
    status: {
      type: String,
      enum: [
        'pending',       // Client raised request
        'accepted',      // Provider accepted
        'confirmed',     // Client confirmed (handshake complete)
        'in_progress',   // Job started
        'completed',     // Job done
        'cancelled',     // Cancelled by either party
        'rejected',      // Provider rejected
      ],
      default: 'pending',
    },

    // Client's location at time of request
    clientLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    clientAddress: { type: String, default: '' },

    // Charges shown after provider accepts
    visitCharges: { type: Number, default: 0 },
    totalCharges: { type: Number, default: 0 },

    // Job details
    description: { type: String, default: '' },
    scheduledAt: { type: Date, default: null },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // Client rating after completion
    clientRating: { type: Number, min: 1, max: 5, default: null },
    clientReview: { type: String, default: '' },

    // Track which providers rejected this request
    rejectedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

bookingSchema.index({ clientLocation: '2dsphere' });

module.exports = mongoose.model('Booking', bookingSchema);