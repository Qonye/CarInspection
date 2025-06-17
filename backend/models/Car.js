const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  // Basic Information
  make: { 
    type: String, 
    required: [true, 'Car make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: { 
    type: String, 
    required: [true, 'Car model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: { 
    type: Number, 
    required: [true, 'Year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  vin: { 
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    match: [/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format']
  },
  licensePlate: { 
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [15, 'License plate cannot exceed 15 characters']
  },
  color: { 
    type: String,
    trim: true,
    maxlength: [30, 'Color cannot exceed 30 characters']
  },
  
  // Engine & Performance
  engineSize: { 
    type: String,
    trim: true,
    maxlength: [20, 'Engine size cannot exceed 20 characters']
  },
  transmission: { 
    type: String, 
    enum: ['manual', 'automatic', 'cvt', 'semi-automatic'],
    lowercase: true
  },
  fuelType: { 
    type: String, 
    enum: ['petrol', 'diesel', 'hybrid', 'electric', 'lpg', 'cng'],
    lowercase: true
  },
  drivetrain: {
    type: String,
    enum: ['fwd', 'rwd', 'awd', '4wd'],
    lowercase: true
  },
  
  // Mileage tracking
  mileage: { 
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  currentMileage: { 
    type: Number,
    min: [0, 'Current mileage cannot be negative']
  },
  mileageUnit: {
    type: String,
    enum: ['km', 'miles'],
    default: 'km'
  },
  
  // Images
  images: [{
    url: { type: String, required: true },
    publicId: String,
    description: String,
    isPrimary: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Purchase Information
  purchaseDate: Date,
  purchasePrice: { 
    type: Number,
    min: [0, 'Purchase price cannot be negative']
  },
  purchaseLocation: String,
  purchaseCurrency: {
    type: String,
    enum: ['KES', 'USD', 'EUR', 'GBP'],
    default: 'KES'
  },
  
  // Insurance & Registration
  insuranceProvider: String,
  insuranceExpiry: Date,
  insurancePolicyNumber: String,
  registrationExpiry: Date,
  registrationNumber: String,
  
  // Service Information
  lastServiceDate: Date,
  nextServiceDue: Date,
  serviceInterval: { // in kilometers or miles
    type: Number,
    default: 10000
  },
  
  // Market Information
  estimatedValue: {
    amount: Number,
    currency: { type: String, default: 'KES' },
    lastUpdated: Date,
    source: String
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isForSale: { type: Boolean, default: false },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
    default: 'unknown'
  },
  
  // Analytics & Statistics
  totalInspections: { type: Number, default: 0 },
  averageRating: { 
    type: Number, 
    min: 0, 
    max: 5,
    default: 0 
  },
  lastInspectionDate: Date,
  maintenanceCost: { type: Number, default: 0 },
  
  // Additional metadata
  notes: String,
  tags: [String],
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for car display name
carSchema.virtual('displayName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Virtual for age
carSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for primary image
carSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || (this.images.length > 0 ? this.images[0] : null);
});

// Virtual for service status
carSchema.virtual('serviceStatus').get(function() {
  if (!this.nextServiceDue) return 'unknown';
  
  const now = new Date();
  const daysUntilService = Math.ceil((this.nextServiceDue - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilService < 0) return 'overdue';
  if (daysUntilService <= 7) return 'due-soon';
  if (daysUntilService <= 30) return 'due-this-month';
  return 'up-to-date';
});

// Pre-save middleware
carSchema.pre('save', function(next) {
  // Ensure current mileage is not less than original mileage
  if (this.currentMileage && this.mileage && this.currentMileage < this.mileage) {
    this.currentMileage = this.mileage;
  }
  
  // Calculate next service due if not set
  if (this.lastServiceDate && !this.nextServiceDue && this.serviceInterval) {
    const nextService = new Date(this.lastServiceDate);
    // This is simplified - in reality you'd calculate based on mileage too
    nextService.setDate(nextService.getDate() + (this.serviceInterval / 100)); // rough estimate
    this.nextServiceDue = nextService;
  }
  
  next();
});

// Method to update mileage
carSchema.methods.updateMileage = function(newMileage) {
  if (newMileage > this.currentMileage) {
    this.currentMileage = newMileage;
    return true;
  }
  return false;
};

// Method to check if service is due
carSchema.methods.isServiceDue = function(threshold = 30) {
  if (!this.nextServiceDue) return false;
  
  const now = new Date();
  const daysUntilService = Math.ceil((this.nextServiceDue - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilService <= threshold;
};

// Indexes for performance
carSchema.index({ owner: 1, isActive: 1 });
carSchema.index({ make: 1, model: 1, year: 1 });
carSchema.index({ vin: 1 }, { sparse: true });
carSchema.index({ licensePlate: 1 }, { sparse: true });
carSchema.index({ createdAt: -1 });
carSchema.index({ nextServiceDue: 1 });

module.exports = mongoose.model('Car', carSchema);
