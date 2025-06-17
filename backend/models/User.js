const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: { 
    type: String, 
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: { 
    type: String, 
    required: [true, 'Phone number is required'],
    match: [/^(\+254|0)[17]\d{8}$/, 'Please enter a valid Kenyan phone number']
  },
  profileImage: { 
    url: String,
    publicId: String
  },
  
  // Account verification
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationExpires: Date,
  
  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Dashboard preferences
  dashboardSettings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true },
    language: { type: String, enum: ['en', 'sw'], default: 'en' },
    currency: { type: String, enum: ['KES', 'USD', 'EUR'], default: 'KES' }
  },
  
  // Subscription/Credits
  credits: { type: Number, default: 3 }, // Free tier gets 3 credits
  subscriptionTier: { 
    type: String, 
    enum: ['free', 'basic', 'premium', 'enterprise'], 
    default: 'free' 
  },
  subscriptionExpiry: Date,
  subscriptionStartDate: Date,
  
  // Activity tracking
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  deviceFingerprints: [{ 
    fingerprint: String,
    lastUsed: { type: Date, default: Date.now },
    deviceInfo: String
  }],
  
  // Account status
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  blockReason: String,
  
  // Analytics
  totalInspections: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has enough credits
userSchema.methods.hasCredits = function(required = 1) {
  return this.credits >= required;
};

// Method to deduct credits
userSchema.methods.deductCredits = function(amount = 1) {
  if (this.credits >= amount) {
    this.credits -= amount;
    return true;
  }
  return false;
};

// Method to add credits
userSchema.methods.addCredits = function(amount) {
  this.credits += amount;
};

// Method to check subscription status
userSchema.methods.isSubscriptionActive = function() {
  if (this.subscriptionTier === 'free') return true;
  return this.subscriptionExpiry && this.subscriptionExpiry > new Date();
};

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ subscriptionTier: 1, subscriptionExpiry: 1 });

module.exports = mongoose.model('User', userSchema);
