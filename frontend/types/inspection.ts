export interface ChecklistItem {
  checked: boolean;
  notes?: string;
}

export interface RatingItem {
  score: number;
  notes: string;
}

export interface BodyInspection {
  panelGaps: RatingItem;
  paintSeams: RatingItem;
  bondo: RatingItem;
  rust: RatingItem;
  dents: RatingItem;
  scratches: RatingItem;
  repainting: RatingItem;
}

export interface WheelInspection {
  treadWear: RatingItem;
  camberToeAngle: RatingItem;
  turnLockToLock: RatingItem;
  alignment: RatingItem;
}

export interface InteriorInspection {
  seats: RatingItem;
  carpet: RatingItem;
  headliner: RatingItem;
  trunk: RatingItem;
  electronics: RatingItem;
  wearAndTear: RatingItem;
}

export interface TestDrive {
  acceleration: RatingItem;
  turning: RatingItem;
  braking: RatingItem;
  highway: RatingItem;
  city: RatingItem;
}

export interface EngineInspection {
  score: number;
  notes: string;
  checklist?: {
    bonnetOpens?: ChecklistItem;
    bonnetSupports?: ChecklistItem;
    frameStraight?: ChecklistItem;
    noLeaks?: ChecklistItem;
    oilLevelGood?: ChecklistItem;
    coolantGood?: ChecklistItem;
    hosesAndBelts?: ChecklistItem;
  };
}

export interface UndercarInspection {
  score: number;
  notes: string;
  leaks: RatingItem;
  rust: RatingItem;
  suspension: RatingItem;
  frameDamage: RatingItem;
}

export interface ElectronicsChecklist {
  powerWindowsMirrors?: ChecklistItem;
  radio?: ChecklistItem;
  acHeat?: ChecklistItem;
  navigation?: ChecklistItem;
  sunroof?: ChecklistItem;
  parkingSensors?: ChecklistItem;
  emergencyBrake?: ChecklistItem;
  dashboardLights?: ChecklistItem;
  gauges?: ChecklistItem;
  wipers?: ChecklistItem;
  rearviewMirror?: ChecklistItem;
}

export interface InteriorChecklist {
  seatBelts?: ChecklistItem;
  airbags?: ChecklistItem;
  steeringWheel?: ChecklistItem;
  dashboard?: ChecklistItem;
  carpetRust?: ChecklistItem;
  carpetDampness?: ChecklistItem;
  spareTire?: ChecklistItem;
  jackLugWrench?: ChecklistItem;
}

export interface ExteriorChecklist {
  highLowBeams?: ChecklistItem;
  headlights?: ChecklistItem;
  tailLights?: ChecklistItem;
  fogLights?: ChecklistItem;
  turnSignals?: ChecklistItem;
  brakeLights?: ChecklistItem;
  reverseLights?: ChecklistItem;
  hazardLights?: ChecklistItem;
}

// Add ExteriorInspection interface
export interface ExteriorInspection {
  score: number;
  notes: string;
}

export interface Inspector {
  name: string;
  company: string;
  licenseNumber?: string;
  logo?: string; // URL or base64 string for company logo
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface CarBasics {
  make: string;
  model: string;
  manufactureYear: number;
  chassisNumber: string;
  engineNumber: string;
  registrationNumber: string;
  mileage: number;
  mileageUnit: 'km' | 'mi';
  engineSize: number;
  transmission: 'manual' | 'automatic';
  fuel: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  askingPrice: number;
  tradeInValue: number;
  currency: Currency;
}

export interface OwnerQuestions {
  ownershipDuration: string;
  sellingReason: string;
  problemsIssues: string;
  serviceRecords: string;
  carUsage: string;
  mileageAdded: string;
  nextCarPlan: string;
}

// New interface for inspection photos
export interface InspectionPhotos {
  bodyPhotos?: string[];
  wheelPhotos?: string[];
  interiorPhotos?: string[];
  enginePhotos?: string[];
  undercarPhotos?: string[];
  exteriorPhotos?: string[];
}

export interface CarInspection {
  id: string;
  date: string;
  status: 'draft' | 'completed';
  inspector?: Inspector;
  ownerQuestions: OwnerQuestions;
  carBasics?: CarBasics;
  bodyInspection?: BodyInspection;
  wheelInspection?: WheelInspection;
  interiorInspection?: InteriorInspection;
  testDrive?: TestDrive;
  engineInspection?: EngineInspection;
  undercarInspection?: UndercarInspection;
  electronicsChecklist?: ElectronicsChecklist;
  exteriorChecklist?: ExteriorChecklist;
  interiorChecklist?: InteriorChecklist;
  exteriorInspection?: ExteriorInspection;
  photos?: {
    [section: string]: string[];
  };
  finalNotes?: string;
}