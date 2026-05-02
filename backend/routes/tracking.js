const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const TrackingPath = require('../models/TrackingPath');
const { auth } = require('../middleware/auth');

// GET /api/tracking/:donationId - get tracking info
router.get('/:donationId', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('donor', 'name avatar phone address location')
      .populate('volunteer', 'name avatar phone location')
      .populate('recipient', 'name organizationName address location');

    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Privacy Check: Only donor, volunteer, recipient, or admin can track
    const isParticipant = [
      donation.donor?._id.toString(),
      donation.volunteer?._id.toString(),
      donation.recipient?._id.toString()
    ].includes(req.user._id.toString());

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to track this donation' });
    }

    const trackingPath = await TrackingPath.findOne({ donation: req.params.donationId });
    res.json({ donation, path: trackingPath?.path || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tracking/:donationId/update-location - volunteer updates location
router.post('/:donationId/update-location', auth, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    if (donation.volunteer?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // Update volunteer location
    await require('../models/User').findByIdAndUpdate(req.user._id, {
      location: { type: 'Point', coordinates: [lng, lat] },
    });

    // Save to TrackingPath history
    await TrackingPath.findOneAndUpdate(
      { donation: req.params.donationId, volunteer: req.user._id },
      { $push: { path: { lat, lng, timestamp: new Date() } } },
      { upsert: true, new: true }
    );

    const io = req.app.get('io');
    io.to(`tracking_${req.params.donationId}`).emit('volunteer_moved', {
      donationId: req.params.donationId,
      location: { lat, lng },
      volunteerId: req.user._id,
    });

    res.json({ message: 'Location updated and persisted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
