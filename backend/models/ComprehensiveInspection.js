const mongoose = require('mongoose');

// Rating schema for individual inspection items (score 0-5)
const ratingSchema = new mongoose.Schema({
  score: { 
    type: Number, 
    required: true,
    min: 0, 
    max: 5,
    default: 0
  },
  notes: { 
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  }
}, { _id: false });

// Checklist item schema
const checklistSchema = new mongoose.Schema({
  checked: { 
    type: Boolean, 
    default: false 
  },
  notes: { 
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters'],
    default: ''
  }
}, { _id: false });

// Currency schema
const currencySchema = new mongoose.Schema({
  code: { type: String, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true }
}, { _id: false });

// Location schema
const locationSchema = new mongoose.Schema({
  address: String,
  city: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  }
}, { _id: false });

const comprehensiveInspectionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car', 
    required: true,
    index: true
  },
  
  // Inspection Metadata
  inspectionNumber: {
    type: String,
    unique: true,
    default: function() {
      return 'INS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  inspectionType: { 
    type: String, 
    enum: ['pre-purchase', 'routine', 'insurance', 'warranty', 'sale', 'custom'], 
    default: 'pre-purchase' 
  },
  inspectionDate: { type: Date, default: Date.now },
  location: locationSchema,
  mileageAtInspection: { 
    type: Number,
    min: [0, 'Mileage cannot be negative'],
    default: 0
  },
  weatherConditions: String,
  inspectionDuration: Number, // in minutes
  
  // Inspector Information
  inspector: {
    name: { 
      type: String, 
      required: [true, 'Inspector name is required'],
      trim: true
    },
    company: String,
    licenseNumber: String,
    certification: String,
    experience: String,
    contact: String
  },
  
  // Car Basic Information (comprehensive snapshot)
  carBasics: {
    make: String,
    model: String,
    manufactureYear: Number,
    chassisNumber: String,
    engineNumber: String,
    registrationNumber: String,
    mileage: Number,
    mileageUnit: { type: String, enum: ['km', 'mi'], default: 'km' },
    engineSize: Number,
    transmission: { type: String, enum: ['manual', 'automatic', 'cvt', 'semi-automatic'] },
    fuel: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid', 'lpg', 'cng'] },
    drivetrain: { type: String, enum: ['fwd', 'rwd', 'awd', '4wd'] },
    color: String,
    bodyType: { type: String, enum: ['sedan', 'suv', 'hatchback', 'wagon', 'coupe', 'pickup', 'van'] },
    doors: Number,
    seats: Number,
    askingPrice: Number,
    tradeInValue: Number,
    currency: currencySchema
  },

  // Owner Questions (comprehensive)
  ownerQuestions: {
    ownershipDuration: String,
    sellingReason: String,
    problemsIssues: String,
    serviceRecords: String,
    carUsage: String,
    mileageAdded: String,
    nextCarPlan: String,
    accidentHistory: String,
    majorRepairs: String,
    warrantyStatus: String
  },

  // Comprehensive Inspection Sections
  exteriorInspection: {
    paintCondition: ratingSchema,
    panelGaps: ratingSchema,
    rust: ratingSchema,
    dents: ratingSchema,
    scratches: ratingSchema,
    bumpers: ratingSchema,
    trim: ratingSchema,
    glass: ratingSchema,
    mirrors: ratingSchema,
    weatherSeals: ratingSchema
  },

  lightingSystem: {
    headlights: checklistSchema,
    tailLights: checklistSchema,
    brakeLights: checklistSchema,
    turnSignals: checklistSchema,
    hazardLights: checklistSchema,
    reverseLights: checklistSchema,
    fogLights: checklistSchema,
    interiorLights: checklistSchema,
    dashboardLights: checklistSchema
  },

  tiresAndWheels: {
    frontLeftTire: ratingSchema,
    frontRightTire: ratingSchema,
    rearLeftTire: ratingSchema,
    rearRightTire: ratingSchema,
    spareTire: ratingSchema,
    wheelAlignment: ratingSchema,
    wheelBalance: ratingSchema,
    treadDepth: ratingSchema,
    tireCondition: ratingSchema,
    wheelCondition: ratingSchema
  },

  brakingSystem: {
    brakeResponse: ratingSchema,
    brakePedal: ratingSchema,
    handbrake: ratingSchema,
    brakeFluid: ratingSchema,
    brakeDiscs: ratingSchema,
    brakePads: ratingSchema,
    brakeLines: ratingSchema,
    absSystem: checklistSchema
  },

  steeringAndSuspension: {
    steeringResponse: ratingSchema,
    steeringWheel: ratingSchema,
    powerSteering: ratingSchema,
    frontSuspension: ratingSchema,
    rearSuspension: ratingSchema,
    shockAbsorbers: ratingSchema,
    ballJoints: ratingSchema,
    alignmentCheck: ratingSchema
  },

  engineAndPerformance: {
    engineStart: ratingSchema,
    idleQuality: ratingSchema,
    engineNoise: ratingSchema,
    oilLevel: ratingSchema,
    oilCondition: ratingSchema,
    coolantLevel: ratingSchema,
    coolantCondition: ratingSchema,
    belts: ratingSchema,
    hoses: ratingSchema,
    batteryCondition: ratingSchema,
    alternator: ratingSchema,
    airFilter: ratingSchema
  },

  transmissionAndDrivetrain: {
    gearShifting: ratingSchema,
    clutchOperation: ratingSchema,
    transmissionFluid: ratingSchema,
    differentialOil: ratingSchema,
    driveshaft: ratingSchema,
    cvJoints: ratingSchema,
    transferCase: ratingSchema
  },

  interiorCondition: {
    seats: ratingSchema,
    seatBelts: checklistSchema,
    dashboard: ratingSchema,
    steeringWheelCondition: ratingSchema,
    pedals: ratingSchema,
    carpetCondition: ratingSchema,
    headliner: ratingSchema,
    doorPanels: ratingSchema,
    windowOperation: ratingSchema,
    mirrors: ratingSchema
  },

  electricalSystems: {
    battery: checklistSchema,
    alternator: checklistSchema,
    starter: checklistSchema,
    powerWindows: checklistSchema,
    centralLocking: checklistSchema,
    airConditioning: checklistSchema,
    heating: checklistSchema,
    radio: checklistSchema,
    navigation: checklistSchema,
    chargers: checklistSchema
  },

  safetyFeatures: {
    airbags: checklistSchema,
    abs: checklistSchema,
    esp: checklistSchema,
    tractionControl: checklistSchema,
    parkingSensors: checklistSchema,
    reverseCameras: checklistSchema,
    blindSpotMonitoring: checklistSchema,
    laneAssist: checklistSchema,
    adaptiveCruise: checklistSchema,
    emergencyBraking: checklistSchema
  },

  undercarriageInspection: {
    frameCondition: ratingSchema,
    exhaustSystem: ratingSchema,
    oilLeaks: ratingSchema,
    fuelLeaks: ratingSchema,
    coolantLeaks: ratingSchema,
    suspensionMounts: ratingSchema,
    drivelineComponents: ratingSchema,
    undercoating: ratingSchema
  },

  testDriveAssessment: {
    enginePerformance: ratingSchema,
    acceleration: ratingSchema,
    braking: ratingSchema,
    steering: ratingSchema,
    transmission: ratingSchema,
    suspension: ratingSchema,
    noiseLevel: ratingSchema,
    vibration: ratingSchema,
    electricalSystems: ratingSchema,
    roadHandling: ratingSchema
  },

  fluidLevelsAndCondition: {
    engineOil: ratingSchema,
    coolant: ratingSchema,
    brakeFluid: ratingSchema,
    powerSteeringFluid: ratingSchema,
    transmissionFluid: ratingSchema,
    windshieldWasher: ratingSchema,
    differentialOil: ratingSchema
  },

  documentationAndHistory: {
    serviceRecords: checklistSchema,
    registrationDocuments: checklistSchema,
    insuranceDocuments: checklistSchema,
    ownerManual: checklistSchema,
    spareCertificates: checklistSchema,
    recallNotices: checklistSchema,
    warrantyInformation: checklistSchema
  },
  
  // Overall Assessment
  overallRating: { 
    type: Number, 
    min: 0, 
    max: 5,
    default: 0
  },
  overallCondition: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    default: 'fair'
  },
  
  // Recommendations
  immediateActions: [{ 
    item: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    estimatedCost: Number,
    description: String
  }],
  
  recommendedServices: [{
    service: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    estimatedCost: Number,
    timeframe: String, // e.g., "within 1 month"
    description: String
  }],
  
  // Market Value Assessment
  marketValue: {
    estimatedValue: Number,
    currency: { type: String, default: 'KES' },
    condition: String,
    marketPosition: String, // e.g., "above average", "below average"
    notes: String
  },
  
  // Final Notes
  inspectorNotes: {
    type: String,
    maxlength: [2000, 'Inspector notes cannot exceed 2000 characters'],
    default: ''
  },
  customerNotes: {
    type: String,
    maxlength: [1000, 'Customer notes cannot exceed 1000 characters'],
    default: ''
  },
  finalSummary: {
    type: String,
    maxlength: [2000, 'Final summary cannot exceed 2000 characters'],
    default: ''
  },
  
  // Report Generation
  reportGenerated: { type: Boolean, default: false },
  reportUrl: String,
  reportGeneratedAt: Date,
  reportDownloaded: { type: Boolean, default: false },
  reportDownloadedAt: Date,
  
  // Comprehensive Photos Structure
  photos: {
    exteriorPhotos: [String],
    interiorPhotos: [String],
    enginePhotos: [String],
    undercarriagePhotos: [String],
    tiresPhotos: [String],
    damagePhotos: [String],
    documentPhotos: [String],
    generalPhotos: [String]
  },
  
  // Status & Workflow
  status: { 
    type: String, 
    enum: ['draft', 'in-progress', 'completed', 'reported', 'archived'], 
    default: 'draft' 
  },
  
  // Payment & Billing
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  creditsUsed: { type: Number, default: 1 },
  
  // Quality Control
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  qualityScore: { type: Number, min: 0, max: 100 },
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for inspection duration
comprehensiveInspectionSchema.virtual('duration').get(function() {
  if (!this.createdAt || !this.updatedAt) return null;
  return Math.ceil((this.updatedAt - this.createdAt) / (1000 * 60)); // minutes
});

// Virtual for days since inspection
comprehensiveInspectionSchema.virtual('daysSinceInspection').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.inspectionDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage
comprehensiveInspectionSchema.virtual('completionPercentage').get(function() {
  const sections = [
    'exteriorInspection', 'lightingSystem', 'tiresAndWheels', 'brakingSystem',
    'steeringAndSuspension', 'engineAndPerformance', 'transmissionAndDrivetrain',
    'interiorCondition', 'electricalSystems', 'safetyFeatures', 'undercarriageInspection',
    'testDriveAssessment', 'fluidLevelsAndCondition', 'documentationAndHistory'
  ];
  
  let totalItems = 0;
  let completedItems = 0;
  
  sections.forEach(section => {
    if (this[section]) {
      Object.keys(this[section]).forEach(item => {
        if (this[section][item] && typeof this[section][item] === 'object') {
          totalItems++;
          // Check if it's a rating item with score > 0 or checklist item with checked = true
          if ((this[section][item].score !== undefined && this[section][item].score > 0) ||
              (this[section][item].checked !== undefined && this[section][item].checked)) {
            completedItems++;
          }
        }
      });
    }
  });
  
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
});

// Method to calculate section averages
comprehensiveInspectionSchema.methods.getSectionAverage = function(sectionName) {
  const section = this[sectionName];
  if (!section) return 0;
  
  const ratings = [];
  
  Object.keys(section).forEach(item => {
    if (section[item] && typeof section[item] === 'object' && section[item].score !== undefined) {
      ratings.push(section[item].score);
    }
  });
  
  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
};

// Method to get all critical issues
comprehensiveInspectionSchema.methods.getCriticalIssues = function() {
  const criticalIssues = [];
  
  // Check immediate actions
  this.immediateActions.forEach(action => {
    if (action.priority === 'critical') {
      criticalIssues.push(action);
    }
  });
  
  // Check recommended services
  this.recommendedServices.forEach(service => {
    if (service.priority === 'critical') {
      criticalIssues.push(service);
    }
  });
  
  return criticalIssues;
};

// Method to calculate overall condition score
comprehensiveInspectionSchema.methods.calculateOverallRating = function() {
  const sections = [
    'exteriorInspection', 'tiresAndWheels', 'brakingSystem', 'steeringAndSuspension',
    'engineAndPerformance', 'transmissionAndDrivetrain', 'interiorCondition',
    'undercarriageInspection', 'testDriveAssessment', 'fluidLevelsAndCondition'
  ];
  
  const sectionAverages = sections.map(section => this.getSectionAverage(section)).filter(avg => avg > 0);
  
  if (sectionAverages.length > 0) {
    const overall = sectionAverages.reduce((a, b) => a + b, 0) / sectionAverages.length;
    return Math.round(overall * 10) / 10;
  }
  
  return 0;
};

// Pre-save middleware to calculate overall rating
comprehensiveInspectionSchema.pre('save', function(next) {
  // Calculate overall rating based on section averages
  this.overallRating = this.calculateOverallRating();
  
  // Set overall condition based on rating
  if (this.overallRating >= 4.5) this.overallCondition = 'excellent';
  else if (this.overallRating >= 3.5) this.overallCondition = 'good';
  else if (this.overallRating >= 2.5) this.overallCondition = 'fair';
  else if (this.overallRating >= 1.5) this.overallCondition = 'poor';
  else this.overallCondition = 'critical';
  
  next();
});

// Indexes for performance
comprehensiveInspectionSchema.index({ user: 1, status: 1 });
comprehensiveInspectionSchema.index({ car: 1, inspectionDate: -1 });
comprehensiveInspectionSchema.index({ inspectionNumber: 1 }, { unique: true });
comprehensiveInspectionSchema.index({ createdAt: -1 });
comprehensiveInspectionSchema.index({ overallRating: 1 });
comprehensiveInspectionSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('ComprehensiveInspection', comprehensiveInspectionSchema);
