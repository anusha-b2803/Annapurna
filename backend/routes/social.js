const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// GET /api/social/feed - community feed (all recent donations)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const donations = await Donation.find({
      status: { $in: ['available', 'accepted', 'delivered'] },
    })
      .populate('donor', 'name avatar role totalDonations')
      .populate('volunteer', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/social/discover - discover users
router.get('/discover', auth, async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
      isActive: true,
    })
      .select('name avatar role bio totalDonations totalDeliveries')
      .sort({ totalDonations: -1, totalDeliveries: -1 })
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/social/profile/:id
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const isOwner = req.user._id.toString() === req.params.id;
    const profile = await User.findById(req.params.id)
      .select(isOwner ? '-password' : '-password -phone -address');
    
    if (!profile) return res.status(404).json({ message: 'User not found' });

    const donations = await Donation.find({ donor: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ profile, donations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/social/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/social/notifications/read
router.put('/notifications/read', auth, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/social/leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor', totalDonations: { $gt: 0 } })
      .select('name avatar totalDonations rating')
      .sort({ totalDonations: -1 })
      .limit(10);

    const volunteers = await User.find({ role: 'volunteer', totalDeliveries: { $gt: 0 } })
      .select('name avatar totalDeliveries rating')
      .sort({ totalDeliveries: -1 })
      .limit(10);

    res.json({ donors, volunteers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
