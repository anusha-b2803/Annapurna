const express = require('express');
const router = express.Router();
const FoodRequest = require('../models/FoodRequest');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const validate = require('../middleware/validate');
const Joi = require('joi');

const getRequestsSchema = Joi.object({
  lat: Joi.number().min(-90).max(90),
  lng: Joi.number().min(-180).max(180),
  radius: Joi.number().integer().min(0).default(20000),
  status: Joi.string().valid('open', 'fulfilled', 'cancelled').default('open'),
  urgencyLevel: Joi.string().valid('low', 'medium', 'high', 'emergency'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const createRequestSchema = Joi.object({
  title: Joi.string().required().min(3).max(100),
  description: Joi.string().required().min(10),
  foodType: Joi.string().required(),
  quantity: Joi.string().required(),
  servingsNeeded: Joi.number().integer().min(1).required(),
  requiredBy: Joi.date().greater('now').required(),
  deliveryAddress: Joi.string().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required()
  }).required(),
  urgencyLevel: Joi.string().valid('low', 'medium', 'high', 'emergency').default('medium'),
  beneficiaryCount: Joi.number().integer().min(1),
  dietaryRestrictions: Joi.array().items(Joi.string())
});

// GET /api/requests
router.get('/', auth, validate(getRequestsSchema, 'query'), async (req, res) => {
  try {
    const { lat, lng, radius = 20000, status = 'open', urgencyLevel, page = 1, limit = 20 } = req.query;
    let query = { status };
    if (urgencyLevel) query.urgencyLevel = urgencyLevel;

    let requests;
    if (lat && lng) {
      requests = await FoodRequest.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius),
          },
        },
      })
        .populate('requester', 'name avatar organizationName')
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      requests = await FoodRequest.find(query)
        .populate('requester', 'name avatar organizationName')
        .sort({ createdAt: -1, urgencyLevel: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await FoodRequest.countDocuments(query);
    res.json({ requests, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/my
router.get('/my', auth, async (req, res) => {
  try {
    const requests = await FoodRequest.find({ requester: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/requests/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id)
      .populate('requester', 'name avatar phone organizationName address');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // PII Protection: Hide phone/address unless owner or involved
    const isOwner = request.requester._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      const plainRequest = request.toObject();
      delete plainRequest.requester.phone;
      delete plainRequest.requester.address;
      return res.json(plainRequest);
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests
router.post('/', auth, requireRole('orphanage', 'admin'), validate(createRequestSchema), async (req, res) => {
  try {
    /* Security Check: Only verified organizations can create requests
    if (!req.user.isVerified && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Your organization must be verified by an admin before you can create requests.' });
    } */

    const { title, description, foodType, quantity, servingsNeeded, requiredBy,
            deliveryAddress, location, urgencyLevel, beneficiaryCount, dietaryRestrictions } = req.body;

    const request = await FoodRequest.create({
      requester: req.user._id,
      title, description, foodType, quantity, servingsNeeded, requiredBy,
      deliveryAddress, location, urgencyLevel, beneficiaryCount, dietaryRestrictions,
    });

    await request.populate('requester', 'name avatar organizationName');
    await logAction('food_request_created', req, { title: request.title }, 'FoodRequest', request._id);

    const io = req.app.get('io');
    io.emit('new_food_request', request);

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const { title, description, servingsNeeded, urgencyLevel, beneficiaryCount, dietaryRestrictions } = req.body;
    const updated = await FoodRequest.findByIdAndUpdate(
      req.params.id, 
      { title, description, servingsNeeded, urgencyLevel, beneficiaryCount, dietaryRestrictions }, 
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/requests/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Not found' });
    if (request.requester.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    request.status = 'cancelled';
    await request.save();
    await logAction('food_request_cancelled', req, { title: request.title }, 'FoodRequest', request._id);
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/like
router.post('/:id/like', auth, async (req, res) => {
  try {
    const request = await FoodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const index = request.likes.indexOf(req.user._id);
    if (index === -1) {
      request.likes.push(req.user._id);
    } else {
      request.likes.splice(index, 1);
    }
    await request.save();
    res.json({ liked: index === -1, likes: request.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests/:id/comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const request = await FoodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.comments.push({ user: req.user._id, text });
    await request.save();
    
    const populated = await FoodRequest.findById(req.params.id).populate('comments.user', 'name avatar');
    res.json(populated.comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
