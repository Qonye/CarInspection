const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .matches(/^(\+254|0)[17]\d{8}$/)
    .withMessage('Please provide a valid Kenyan phone number'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
    });
  }

  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    verificationToken,
    verificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration if email fails
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully. Please check your email for verification.',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        subscriptionTier: user.subscriptionTier,
        credits: user.credits
      },
      token,
      refreshToken
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  if (user.isBlocked) {
    return res.status(401).json({
      success: false,
      message: 'Account is blocked',
      reason: user.blockReason
    });
  }

  // Update login stats
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        subscriptionTier: user.subscriptionTier,
        credits: user.credits,
        profileImage: user.profileImage,
        dashboardSettings: user.dashboardSettings
      },
      token,
      refreshToken
    }
  });
}));

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { token } = req.body;

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token'
    });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  
  // Give 2 bonus credits for email verification
  user.credits += 2;
  
  await user.save();

  res.json({
    success: true,
    message: 'Email verified successfully. You received 2 bonus credits!',
    data: {
      credits: user.credits
    }
  });
}));

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found with this email'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  await user.save();

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName);
    
    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive || user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        isVerified: req.user.isVerified,
        subscriptionTier: req.user.subscriptionTier,
        credits: req.user.credits,
        profileImage: req.user.profileImage,
        dashboardSettings: req.user.dashboardSettings,
        totalInspections: req.user.totalInspections,
        totalSpent: req.user.totalSpent,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    }
  });
}));

// @desc    Logout user (client-side action mainly)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // In a more complex setup, you might invalidate the token server-side
  // For now, this is mainly for analytics and client-side token removal
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

module.exports = router;
