const mongoose = require('mongoose');

const foodRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  foodType: { type: String, enum: ['cooked', 'raw', 'packaged', 'beverages', 'any'], default: 'any' },
  quantity: { type: String, required: true },
  servingsNeeded: { type: Number },
  requiredBy: { type: Date, required: true },
  deliveryAddress: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
  },
  status: {
    type: String,
    enum: ['open', 'partially_fulfilled', 'fulfilled', 'expired', 'cancelled'],
    default: 'open',
  },
  urgencyLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  beneficiaryCount: { type: Number },
  dietaryRestrictions: [{ type: String }],
  fulfilledBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

foodRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('FoodRequest', foodRequestSchema);
