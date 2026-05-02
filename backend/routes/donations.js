const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const FoodRequest = require('../models/FoodRequest');
const { auth, requireRole } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const validate = require('../middleware/validate');
const Joi = require('joi');

const getDonationsSchema = Joi.object({
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radius: Joi.number().integer().min(0).default(10000),
  status: Joi.string().valid('available', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled').default('available'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  foodType: Joi.string()
});

// GET /api/donations - get all available donations (with optional geo filter)
router.get('/', auth, validate(getDonationsSchema, 'query'), async (req, res) => {
  try {
    const { lat, lng, radius = 10000, status = 'available', page = 1, limit = 20, foodType } = req.query;
    let query = { status };
    if (foodType) query.foodType = foodType;

    let donations;
    if (lat && lng) {
      donations = await Donation.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius),
          },
        },
      })
        .populate('donor', 'name avatar rating organizationName')
        .populate('volunteer', 'name avatar')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      donations = await Donation.find(query)
        .populate('donor', 'name avatar rating organizationName')
        .populate('volunteer', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await Donation.countDocuments(query);
    res.json({ donations, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/donations/my - get current user's donations or assigned deliveries
router.get('/my', auth, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'volunteer') {
      query = { volunteer: req.user._id };
    } else if (req.user.role === 'orphanage') {
      query = { recipient: req.user._id };
    } else {
      query = { donor: req.user._id };
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name avatar organizationName')
      .populate('volunteer', 'name avatar phone')
      .populate('recipient', 'name organizationName')
      .sort({ updatedAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/donations/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name avatar phone address rating')
      .populate('volunteer', 'name avatar phone rating')
      .populate('recipient', 'name organizationName address')
      .populate('comments.user', 'name avatar');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const createDonationSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10),
  foodType: Joi.string().required(),
  quantity: Joi.string().required(),
  servings: Joi.number().integer().min(1).required(),
  expiryTime: Joi.date().greater('now').required()
    .messages({ 'date.greater': 'Food expiry time must be in the future' }),
  pickupAddress: Joi.string().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required(),
  isUrgent: Joi.boolean().default(false),
  dietaryInfo: Joi.array().items(Joi.string()),
  images: Joi.array().items(Joi.string()),
  recipient: Joi.string().allow(null, ''),
  requestId: Joi.string().allow(null, '')
});

// POST /api/donations - create a donation
router.post('/', auth, requireRole('donor', 'admin'), validate(createDonationSchema), async (req, res) => {
  try {
    const { title, description, foodType, quantity, servings, expiryTime,
            pickupAddress, location, isUrgent, dietaryInfo, images, recipient, requestId } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      title, description, foodType, quantity, servings,
      expiryTime, pickupAddress, location, isUrgent, dietaryInfo, images: images || [],
      recipient: recipient || undefined,
    });

    if (requestId) {
      await FoodRequest.findByIdAndUpdate(requestId, {
        status: 'fulfilled',
        $push: { fulfilledBy: donation._id }
      });
    }

    await donation.populate('donor', 'name avatar');
    await logAction('donation_created', req, { title: donation.title }, 'Donation', donation._id);

    // Notify all volunteers via socket
    const io = req.app.get('io');
    io.emit('new_donation', donation);

    // Update donor stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDonations: 1 } });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donations/:id/request - organization requests a donation
router.put('/:id/request', auth, requireRole('orphanage'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'available') return res.status(400).json({ message: 'Donation no longer available' });
    if (donation.recipient) return res.status(400).json({ message: 'Already requested by another organization' });

    donation.recipient = req.user._id;
    await donation.save();
    await donation.populate(['donor', 'recipient']);

    // Notify donor
    await Notification.create({
      recipient: donation.donor._id,
      sender: req.user._id,
      type: 'donation_requested',
      message: `${req.user.organizationName} requested your donation "${donation.title}"`,
      data: { donationId: donation._id },
    });

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donations/:id/accept - volunteer accepts a donation
router.put('/:id/accept', auth, requireRole('volunteer'), async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'available') return res.status(400).json({ message: 'Donation not available' });
    if (!donation.recipient) return res.status(400).json({ message: 'Donation must be requested by an organization before acceptance' });

    // Security Check: Only verified volunteers can accept deliveries
    if (!req.user.isVerified) {
      return res.status(403).json({ message: 'Your account must be verified by an admin before you can accept deliveries.' });
    }

    donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, status: 'available', recipient: { $ne: null } },
      { 
        status: 'accepted',
        volunteer: req.user._id,
        acceptedAt: new Date()
      },
      { new: true }
    ).populate(['donor', 'volunteer', 'recipient']);

    if (!donation) return res.status(400).json({ message: 'Donation not available or not requested by NGO' });

    await logAction('donation_accepted', req, { title: donation.title }, 'Donation', donation._id);

    const io = req.app.get('io');
    io.emit('donation_accepted', donation);
    io.to(`tracking_${donation._id}`).emit('status_changed', { status: 'accepted', donation });

    // Notify donor
    await Notification.create({
      recipient: donation.donor._id,
      sender: req.user._id,
      type: 'donation_accepted',
      message: `${req.user.name} accepted your donation "${donation.title}" for delivery`,
      data: { donationId: donation._id },
    });

    // Notify requesting org
    if (donation.recipient) {
      await Notification.create({
        recipient: donation.recipient._id,
        sender: req.user._id,
        type: 'donation_accepted',
        message: `A volunteer has accepted the delivery of "${donation.title}"`,
        data: { donationId: donation._id },
      });
    }

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donations/:id/pickup - mark as picked up
router.put('/:id/pickup', auth, requireRole('volunteer'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.volunteer?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (donation.status !== 'accepted')
      return res.status(400).json({ message: 'Donation must be accepted before pickup' });

    donation.status = 'picked_up';
    donation.pickedUpAt = new Date();
    await donation.save();
    await logAction('donation_picked_up', req, { title: donation.title }, 'Donation', donation._id);

    const io = req.app.get('io');
    io.to(`tracking_${donation._id}`).emit('status_changed', { status: 'picked_up', donation });

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donations/:id/ontheway - mark as on the way
router.put('/:id/ontheway', auth, requireRole('volunteer'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.volunteer?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (donation.status !== 'picked_up')
      return res.status(400).json({ message: 'Donation must be picked up before marking as on the way' });

    donation.status = 'on_the_way';
    await donation.save();
    await logAction('donation_ontheway', req, { title: donation.title }, 'Donation', donation._id);

    const io = req.app.get('io');
    io.to(`tracking_${donation._id}`).emit('status_changed', { status: 'on_the_way', donation });

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donations/:id/deliver - mark as delivered
router.put('/:id/deliver', auth, requireRole('volunteer'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation || donation.volunteer?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (donation.status !== 'on_the_way')
      return res.status(400).json({ message: 'Donation must be "on the way" before marking as delivered' });

    donation.status = 'delivered';
    donation.deliveredAt = new Date();
    await donation.save();
    await logAction('donation_delivered', req, { title: donation.title }, 'Donation', donation._id);

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalDeliveries: 1 } });

    const io = req.app.get('io');
    io.emit('donation_delivered', donation);
    io.to(`tracking_${donation._id}`).emit('status_changed', { status: 'delivered', donation });

    if (donation.recipient) {
      await Notification.create({
        recipient: donation.recipient,
        sender: req.user._id,
        type: 'donation_delivered',
        message: `Your food request has been fulfilled for "${donation.title}"`,
        data: { donationId: donation._id },
      });
    }

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/donations/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    const idx = donation.likes.indexOf(req.user._id);
    if (idx === -1) donation.likes.push(req.user._id);
    else donation.likes.splice(idx, 1);
    await donation.save();
    res.json({ likes: donation.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/donations/:id/comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    donation.comments.push({ user: req.user._id, text: req.body.text });
    await donation.save();
    await donation.populate('comments.user', 'name avatar');
    res.json(donation.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/donations/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    
    // Auth Check
    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    // State Machine Check: Cannot cancel if already picked up or delivered
    if (['picked_up', 'on_the_way', 'delivered'].includes(donation.status)) {
      return res.status(400).json({ message: `Cannot cancel a donation that is already ${donation.status.replace('_', ' ')}` });
    }

    donation.status = 'cancelled';
    await donation.save();
    res.json({ message: 'Donation cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
