const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donation = require('../models/Donation');

// GET /api/public/stats - Get public platform stats
router.get('/stats', async (req, res) => {
  try {
    const [mealsResult, totalVolunteers, totalOrgs, totalCities] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$servings', 1] } } } }
      ]),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: { $in: ['orphanage', 'donor'] } }),
      Promise.resolve(12),
    ]);

    res.json({
      mealsSaved: mealsResult[0]?.total || 0,
      volunteers: totalVolunteers,
      organizations: totalOrgs,
      cities: totalCities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
