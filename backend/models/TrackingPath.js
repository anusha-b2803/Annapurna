const mongoose = require('mongoose');

const trackingPathSchema = new mongoose.Schema({
  donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  path: [
    {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  isLive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for performance
trackingPathSchema.index({ donation: 1 });

module.exports = mongoose.model('TrackingPath', trackingPathSchema);
