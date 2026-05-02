const express = require('express');
const router = express.Router();
const FoodRequest = require('../models/FoodRequest');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/requests
router.get('/', auth, async (req, res) => {
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
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/requests
router.post('/', auth, requireRole('orphanage', 'admin'), async (req, res) => {
  try {
    const { title, description, foodType, quantity, servingsNeeded, requiredBy,
            deliveryAddress, location, urgencyLevel, beneficiaryCount, dietaryRestrictions } = req.body;

    const request = await FoodRequest.create({
      requester: req.user._id,
      title, description, foodType, quantity, servingsNeeded, requiredBy,
      deliveryAddress, location, urgencyLevel, beneficiaryCount, dietaryRestrictions,
    });

    await request.populate('requester', 'name avatar organizationName');

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

    const updated = await FoodRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    res.json({ message: 'Request cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
