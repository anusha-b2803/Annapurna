const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  foodType: {
    type: String,
    enum: ['cooked', 'raw', 'packaged', 'beverages', 'other'],
    required: true,
  },
  quantity: { type: String, required: true },
  servings: { type: Number },
  expiryTime: { type: Date, required: true },
  images: [{ type: String }],
  pickupAddress: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  status: {
    type: String,
    enum: ['available', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'expired', 'cancelled'],
    default: 'available',
  },
  volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acceptedAt: { type: Date },
  pickedUpAt: { type: Date },
  deliveredAt: { type: Date },
  isUrgent: { type: Boolean, default: false },
  dietaryInfo: [{ type: String }], // vegetarian, vegan, halal, etc.
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1, expiryTime: 1 });

module.exports = mongoose.model('Donation', donationSchema);
