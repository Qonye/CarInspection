const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
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

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// Middleware to check if user has required subscription tier
const requireSubscription = (requiredTier) => {
  const tiers = { free: 0, basic: 1, premium: 2, enterprise: 3 };
  
  return (req, res, next) => {
    const userTier = tiers[req.user.subscriptionTier];
    const required = tiers[requiredTier];
    
    if (userTier < required) {
      return res.status(403).json({
        success: false,
        message: `${requiredTier} subscription required`,
        currentTier: req.user.subscriptionTier,
        requiredTier
      });
    }
    
    // Check if subscription is still active (except for free tier)
    if (req.user.subscriptionTier !== 'free' && !req.user.isSubscriptionActive()) {
      return res.status(403).json({
        success: false,
        message: 'Subscription has expired',
        subscriptionExpiry: req.user.subscriptionExpiry
      });
    }
    
    next();
  };
};

// Middleware to check if user has enough credits
const requireCredits = (requiredCredits = 1) => {
  return (req, res, next) => {
    if (!req.user.hasCredits(requiredCredits)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient credits',
        required: requiredCredits,
        available: req.user.credits
      });
    }
    
    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }
      
      // Check if user owns the resource
      if (resource.owner && resource.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not the owner'
        });
      }
      
      // Check if user is associated with the resource (for inspections)
      if (resource.user && resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not authorized'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking ownership',
        error: error.message
      });
    }
  };
};

// Middleware to validate device fingerprint
const validateDevice = async (req, res, next) => {
  try {
    const deviceFingerprint = req.headers['x-device-fingerprint'];
    
    if (!deviceFingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Device fingerprint required'
      });
    }
    
    // Check if device is registered for this user
    const isRegistered = req.user.deviceFingerprints.some(
      device => device.fingerprint === deviceFingerprint
    );
    
    if (!isRegistered) {
      // Register new device
      req.user.deviceFingerprints.push({
        fingerprint: deviceFingerprint,
        deviceInfo: req.headers['user-agent'],
        lastUsed: new Date()
      });
      
      // Keep only last 5 devices
      if (req.user.deviceFingerprints.length > 5) {
        req.user.deviceFingerprints = req.user.deviceFingerprints
          .sort((a, b) => b.lastUsed - a.lastUsed)
          .slice(0, 5);
      }
      
      await req.user.save();
    } else {
      // Update last used timestamp
      const device = req.user.deviceFingerprints.find(
        d => d.fingerprint === deviceFingerprint
      );
      device.lastUsed = new Date();
      await req.user.save();
    }
    
    req.deviceFingerprint = deviceFingerprint;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Device validation failed',
      error: error.message
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive && !user.isBlocked) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireSubscription,
  requireCredits,
  checkOwnership,
  validateDevice,
  optionalAuth
};
