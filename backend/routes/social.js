const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// GET /api/social/feed - community feed
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(req.user._id);
    const followingIds = [...user.following, req.user._id];

    const donations = await Donation.find({
      donor: { $in: followingIds },
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
    const user = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $ne: req.user._id, $nin: user.following },
      isActive: true,
    })
      .select('name avatar role bio totalDonations totalDeliveries followers')
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
      .select(isOwner ? '-password' : '-password -phone -address')
      .populate('followers', 'name avatar role')
      .populate('following', 'name avatar role');
    if (!profile) return res.status(404).json({ message: 'User not found' });

    const donations = await Donation.find({ donor: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ profile, donations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/social/follow/:id
router.post('/follow/:id', auth, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot follow yourself' });

    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const isFollowing = currentUser.following.includes(req.params.id);
    
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      const updatedTarget = await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } }, { new: true });

      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow',
        message: `${req.user.name} started following you`,
      });
      
      res.json({ following: true, followerCount: updatedTarget.followers.length });
      return;
    }

    const finalTarget = await User.findById(req.params.id);
    res.json({ following: false, followerCount: finalTarget.followers.length });
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
