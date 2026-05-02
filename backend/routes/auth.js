const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { logAction } = require('../utils/logger');
const { sendEmail } = require('../utils/mailer');

const validate = require('../middleware/validate');
const Joi = require('joi');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'annapurna_secret', { expiresIn: '7d' });

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
    }),
  role: Joi.string().valid('donor', 'volunteer', 'orphanage', 'admin').required(),
  phone: Joi.string().allow(''),
  address: Joi.string().allow(''),
  organizationName: Joi.string().allow('')
});

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, role, phone, address, organizationName } = req.body;
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, phone, address, organizationName });
    const token = generateToken(user._id);
    
    await logAction('user_registered', req, { role: user.role }, 'User', user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    await logAction('user_logged_in', req, {}, 'User', user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, bio, location } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, bio, location },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(Joi.object({ email: Joi.string().email().required() })), async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins
    await user.save();

    // Send Email
    await sendEmail({
      to: user.email,
      subject: 'Annapurna Password Reset Request',
      text: `You requested a password reset. Use this token to reset your password: ${resetToken}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>You requested a password reset for your Annapurna account.</p>
          <p>Please use the following token to reset your password:</p>
          <div style="background: #f3f4f6; padding: 10px; font-weight: bold; font-size: 1.2rem; text-align: center; border-radius: 5px;">
            ${resetToken}
          </div>
          <p style="color: #6b7280; font-size: 0.8rem; margin-top: 20px;">This token will expire in 30 minutes.</p>
        </div>
      `
    });

    await logAction('forgot_password_requested', req, { email: user.email }, 'User', user._id);
    res.json({ message: 'Password reset link sent (Check your email)', resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/reset-password/:token
router.post('/reset-password/:token', validate(Joi.object({ 
  password: Joi.string().min(8).required()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
    .messages({ 'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' })
})), async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
