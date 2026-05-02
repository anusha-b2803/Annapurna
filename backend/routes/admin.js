const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');
const FoodRequest = require('../models/FoodRequest');
const { auth, requireRole } = require('../middleware/auth');
const { logAction } = require('../utils/logger');

// GET /api/admin/stats
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers, totalDonors, totalVolunteers, totalOrphanages,
      totalDonations, activeDonations, deliveredDonations,
      totalRequests, openRequests, fulfilledRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: 'orphanage' }),
      Donation.countDocuments(),
      Donation.countDocuments({ status: 'available' }),
      Donation.countDocuments({ status: 'delivered' }),
      FoodRequest.countDocuments(),
      FoodRequest.countDocuments({ status: 'open' }),
      FoodRequest.countDocuments({ status: 'fulfilled' }),
    ]);

    // Recent activity - last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentDonations = await Donation.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      users: { total: totalUsers, donors: totalDonors, volunteers: totalVolunteers, orphanages: totalOrphanages, recentNew: recentUsers },
      donations: { total: totalDonations, active: activeDonations, delivered: deliveredDonations, recentNew: recentDonations },
      requests: { total: totalRequests, open: openRequests, fulfilled: fulfilledRequests },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const validate = require('../middleware/validate');
const Joi = require('joi');

const getUsersSchema = Joi.object({
  role: Joi.string().valid('donor', 'volunteer', 'orphanage', 'admin', ''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().allow('')
});

// GET /api/admin/users
router.get('/users', auth, requireRole('admin'), validate(getUsersSchema, 'query'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/toggle-active
router.put('/users/:id/toggle-active', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    
    await logAction(`admin_user_${user.isActive ? 'activated' : 'deactivated'}`, req, { targetUser: user.email }, 'User', user._id);
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/verify
router.put('/users/:id/verify', auth, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    await logAction('admin_user_verified', req, { targetUser: user.email }, 'User', user._id);
    res.json({ message: 'User verified', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/donations
router.get('/donations', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const donations = await Donation.find(query)
      .populate('donor', 'name email')
      .populate('volunteer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Donation.countDocuments(query);
    res.json({ donations, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/requests
router.get('/requests', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const requests = await FoodRequest.find(query)
      .populate('requester', 'name email organizationName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await FoodRequest.countDocuments(query);
    res.json({ requests, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/analytics/daily
router.get('/analytics/daily', auth, requireRole('admin'), async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const donations = await Donation.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
