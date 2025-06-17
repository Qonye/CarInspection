const mongoose = require('mongoose');

// Rating schema for individual inspection items
const ratingSchema = new mongoose.Schema({
  score: { 
    type: Number, 
    required: true,
    min: 0, 
    max: 5 
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

const inspectionSchema = new mongoose.Schema({
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
    default: 'routine' 
  },
  inspectionDate: { type: Date, default: Date.now },
  location: { 
    address: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  mileageAtInspection: { 
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  
  // Inspector Information
  inspector: {
    name: { 
      type: String, 
      required: [true, 'Inspector name is required'],
      trim: true
    },
    certification: String,
    experience: String,
    licenseNumber: String,
    contact: String
  },
    // Car Basic Information (snapshot at time of inspection)
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
    transmission: { type: String, enum: ['manual', 'automatic'] },
    fuel: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
    askingPrice: Number,
    tradeInValue: Number,
    currency: currencySchema
  },

  // Owner Questions
  ownerQuestions: {
    ownershipDuration: String,
    sellingReason: String,
    problemsIssues: String,
    serviceRecords: String,
    carUsage: String,
    mileageAdded: String,
    nextCarPlan: String
  },
  // Comprehensive Inspection Sections
  bodyInspection: {
    panelGaps: ratingSchema,
    paintSeams: ratingSchema,
    bondo: ratingSchema,
    rust: ratingSchema,
    dents: ratingSchema,
    scratches: ratingSchema,
    repainting: ratingSchema,
    bumpers: ratingSchema,
    fenders: ratingSchema,
    doors: ratingSchema,
    hood: ratingSchema,
    trunk: ratingSchema,
    roofCondition: ratingSchema,
    moldings: ratingSchema,
    weatherStripping: ratingSchema
  },
  
  wheelAndTireInspection: {
    frontLeftTire: ratingSchema,
    frontRightTire: ratingSchema,
    rearLeftTire: ratingSchema,
    rearRightTire: ratingSchema,
    spareTire: ratingSchema,
    treadDepth: ratingSchema,
    tireAge: ratingSchema,
    wheelAlignment: ratingSchema,
    wheelBalance: ratingSchema,
    rims: ratingSchema,
    hubcaps: ratingSchema,
    tirePressure: ratingSchema
  },

  brakingSystem: {
    frontBrakes: ratingSchema,
    rearBrakes: ratingSchema,
    brakeFluid: ratingSchema,
    brakePedal: ratingSchema,
    handbrake: ratingSchema,
    brakeLines: ratingSchema,
    brakeFeel: ratingSchema,
    abs: ratingSchema,
    brakeNoise: ratingSchema,
    rotorCondition: ratingSchema,
    caliperCondition: ratingSchema
  },

  suspensionAndSteering: {
    frontSuspension: ratingSchema,
    rearSuspension: ratingSchema,
    shockAbsorbers: ratingSchema,
    struts: ratingSchema,
    springs: ratingSchema,
    bushings: ratingSchema,
    ballJoints: ratingSchema,
    steeringWheel: ratingSchema,
    steeringColumn: ratingSchema,
    powerSteering: ratingSchema,
    steeringAlignment: ratingSchema,
    steeringResponse: ratingSchema
  },
  
  interiorInspection: {
    seats: ratingSchema,
    seatBelts: ratingSchema,
    airbags: ratingSchema,
    carpet: ratingSchema,
    headliner: ratingSchema,
    dashboard: ratingSchema,
    instrumentCluster: ratingSchema,
    pedals: ratingSchema,
    gearShift: ratingSchema,
    handbrake: ratingSchema,
    doorPanels: ratingSchema,
    windowControls: ratingSchema,
    mirrors: ratingSchema,
    sunVisors: ratingSchema,
    storage: ratingSchema
  },

  electricalSystem: {
    battery: ratingSchema,
    alternator: ratingSchema,
    starter: ratingSchema,
    wiring: ratingSchema,
    fuses: ratingSchema,
    headlights: ratingSchema,
    taillights: ratingSchema,
    indicators: ratingSchema,
    hazardLights: ratingSchema,
    interiorLights: ratingSchema,
    dashboardLights: ratingSchema,
    hornOperation: ratingSchema,
    wipers: ratingSchema,
    electricalLoad: ratingSchema
  },

  climateAndComfort: {
    airConditioning: ratingSchema,
    heater: ratingSchema,
    ventilation: ratingSchema,
    climateControls: ratingSchema,
    cabinFilter: ratingSchema,
    defogger: ratingSchema,
    seatHeating: ratingSchema,
    seatCooling: ratingSchema
  },

  safetyAndSecurity: {
    immobilizer: ratingSchema,
    alarm: ratingSchema,
    centralLocking: ratingSchema,
    childLocks: ratingSchema,
    emergencyBrake: ratingSchema,
    stabilityControl: ratingSchema,
    tractionControl: ratingSchema,
    parkingBrake: ratingSchema,
    reverseSensors: ratingSchema,
    cameras: ratingSchema,
    blindSpotMonitoring: ratingSchema
  },
  
  testDrive: {
    engineStartup: ratingSchema,
    idling: ratingSchema,
    acceleration: ratingSchema,
    deceleration: ratingSchema,
    steering: ratingSchema,
    braking: ratingSchema,
    gearChanges: ratingSchema,
    clutchOperation: ratingSchema,
    noiseLevel: ratingSchema,
    vibration: ratingSchema,
    cityDriving: ratingSchema,
    highwayDriving: ratingSchema,
    parkingManeuvers: ratingSchema
  },
  
  engineAndMechanical: {
    engineCondition: ratingSchema,
    oilLevel: ratingSchema,
    oilCondition: ratingSchema,
    coolantLevel: ratingSchema,
    coolantCondition: ratingSchema,
    belts: ratingSchema,
    hoses: ratingSchema,
    airFilter: ratingSchema,
    fuelFilter: ratingSchema,
    sparkPlugs: ratingSchema,
    exhaustSystem: ratingSchema,
    emissions: ratingSchema,
    engineMounts: ratingSchema,
    transmissionFluid: ratingSchema,
    brakeFluid: ratingSchema,
    powerSteeringFluid: ratingSchema,
    batteryCondition: ratingSchema
  },
  
  undercarriageInspection: {
    oilLeaks: ratingSchema,
    fluidLeaks: ratingSchema,
    frameCondition: ratingSchema,
    corrosion: ratingSchema,
    exhaust: ratingSchema,
    driveshaft: ratingSchema,
    differential: ratingSchema,
    suspension: ratingSchema,
    brakeLines: ratingSchema,
    fuelLines: ratingSchema,
    undercoating: ratingSchema,
    structuralIntegrity: ratingSchema
  },

  documentationAndHistory: {
    serviceRecords: ratingSchema,
    ownershipHistory: ratingSchema,
    accidentHistory: ratingSchema,
    recallCompliance: ratingSchema,
    registrationStatus: ratingSchema,
    insuranceStatus: ratingSchema,
    lienStatus: ratingSchema,
    titleStatus: ratingSchema
  },

  emissionsAndEnvironmental: {
    emissionTest: ratingSchema,
    catalyticConverter: ratingSchema,
    oxygenSensors: ratingSchema,
    evapSystem: ratingSchema,
    pcvValve: ratingSchema,
    airInjectionSystem: ratingSchema,
    fuelVaporRecovery: ratingSchema
  },

  // Electronics Checklist
  electronicsChecklist: {
    powerWindowsMirrors: checklistSchema,
    radio: checklistSchema,
    acHeat: checklistSchema,
    navigation: checklistSchema,
    sunroof: checklistSchema,
    parkingSensors: checklistSchema,
    emergencyBrake: checklistSchema,
    dashboardLights: checklistSchema,
    gauges: checklistSchema,
    wipers: checklistSchema,
    rearviewMirror: checklistSchema
  },

  // Interior Checklist
  interiorChecklist: {
    seatBelts: checklistSchema,
    airbags: checklistSchema,
    steeringWheel: checklistSchema,
    dashboard: checklistSchema,
    carpetRust: checklistSchema,
    carpetDampness: checklistSchema,
    spareTire: checklistSchema,
    jackLugWrench: checklistSchema
  },

  // Exterior Checklist
  exteriorChecklist: {
    highLowBeams: checklistSchema,
    headlights: checklistSchema,
    tailLights: checklistSchema,
    fogLights: checklistSchema,
    turnSignals: checklistSchema,
    brakeLights: checklistSchema,
    reverseLights: checklistSchema,
    hazardLights: checklistSchema
  },

  // Exterior Inspection
  exteriorInspection: {
    score: { type: Number, min: 0, max: 5, default: 0 },
    notes: { type: String, default: '' }
  },
  
  // Overall Assessment
  overallRating: { 
    type: Number, 
    min: 1, 
    max: 5,
    required: true
  },
  overallCondition: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor', 'critical'],
    required: true
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
  finalNotes: {
    type: String,
    maxlength: [2000, 'Final notes cannot exceed 2000 characters']
  },
  
  // Report Generation
  reportGenerated: { type: Boolean, default: false },
  reportUrl: String,
  reportGeneratedAt: Date,
  reportDownloaded: { type: Boolean, default: false },
  reportDownloadedAt: Date,
  // Images (comprehensive section-wise organized)
  photos: {
    exteriorPhotos: [String],
    interiorPhotos: [String],
    enginePhotos: [String],
    undercarriagePhotos: [String],
    wheelPhotos: [String],
    damagePhotos: [String],
    documentPhotos: [String],
    testDrivePhotos: [String],
    specificIssuePhotos: [String]
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
inspectionSchema.virtual('duration').get(function() {
  if (!this.createdAt || !this.updatedAt) return null;
  return Math.ceil((this.updatedAt - this.createdAt) / (1000 * 60)); // minutes
});

// Virtual for days since inspection
inspectionSchema.virtual('daysSinceInspection').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.inspectionDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for completion percentage
inspectionSchema.virtual('completionPercentage').get(function() {
  const sections = ['bodyInspection', 'wheelInspection', 'interiorInspection', 'engineInspection', 'undercarriageInspection', 'testDriveAssessment'];
  let totalItems = 0;
  let completedItems = 0;
  
  sections.forEach(section => {
    if (this[section]) {
      Object.keys(this[section]).forEach(item => {
        if (this[section][item] && typeof this[section][item] === 'object') {
          totalItems++;
          if (this[section][item].rating) {
            completedItems++;
          }
        }
      });
    }
  });
  
  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
});

// Method to calculate section averages
inspectionSchema.methods.getSectionAverage = function(sectionName) {
  const section = this[sectionName];
  if (!section) return 0;
  
  const ratings = [];
  
  // Handle different section types
  if (sectionName === 'engineInspection' || sectionName === 'undercarInspection' || sectionName === 'exteriorInspection') {
    // These sections have a direct score field
    if (section.score !== undefined) {
      return section.score;
    }
  } else {
    // Regular sections with rating items
    Object.keys(section).forEach(item => {
      if (section[item] && typeof section[item] === 'object' && section[item].score !== undefined) {
        ratings.push(section[item].score);
      }
    });
  }
  
  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
};

// Method to get all critical issues
inspectionSchema.methods.getCriticalIssues = function() {
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

// Pre-save middleware to calculate overall rating
inspectionSchema.pre('save', function(next) {
  const sectionsToCheck = [
    'bodyInspection', 
    'wheelAndTireInspection', 
    'brakingSystem',
    'suspensionAndSteering',
    'interiorInspection', 
    'electricalSystem',
    'climateAndComfort',
    'safetyAndSecurity',
    'testDrive',
    'engineAndMechanical',
    'undercarriageInspection',
    'documentationAndHistory',
    'emissionsAndEnvironmental'
  ];
  
  const hasModifiedSections = sectionsToCheck.some(section => this.isModified(section));
  
  if (hasModifiedSections) {
    const sectionAverages = sectionsToCheck
      .map(section => this.getSectionAverage(section))
      .filter(avg => avg > 0);
    
    if (sectionAverages.length > 0) {
      this.overallRating = Math.round(sectionAverages.reduce((a, b) => a + b, 0) / sectionAverages.length * 10) / 10;
      
      // Set overall condition based on rating
      if (this.overallRating >= 4.5) this.overallCondition = 'excellent';
      else if (this.overallRating >= 3.5) this.overallCondition = 'good';
      else if (this.overallRating >= 2.5) this.overallCondition = 'fair';
      else if (this.overallRating >= 1.5) this.overallCondition = 'poor';
      else this.overallCondition = 'critical';
    }
  }
  
  next();
});

// Indexes for performance
inspectionSchema.index({ user: 1, status: 1 });
inspectionSchema.index({ car: 1, inspectionDate: -1 });
inspectionSchema.index({ inspectionNumber: 1 }, { unique: true });
inspectionSchema.index({ createdAt: -1 });
inspectionSchema.index({ overallRating: 1 });
inspectionSchema.index({ status: 1, paymentStatus: 1 });

module.exports = mongoose.model('Inspection', inspectionSchema);
