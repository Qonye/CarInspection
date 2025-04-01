interface License {
  downloadsLeft: number;
  purchaseDate?: string;
  mpesaTransactions: {
    code: string;
    amount: number;
    credits: number;
    date: string;
  }[];
}

const DEMO_DOWNLOADS = 15;

export const initializeDemoLicense = (): void => {
  const existing = localStorage.getItem('license');
  if (!existing) {
    const demoLicense: License = {
      downloadsLeft: DEMO_DOWNLOADS,
      mpesaTransactions: []
    };
    localStorage.setItem('license', JSON.stringify(demoLicense));
  }
};

export const getRemainingDownloads = (): number => {
  const license = JSON.parse(localStorage.getItem('license') || '{}');
  return license.downloadsLeft || 0;
};

export const canDownloadReport = (): boolean => {
  return getRemainingDownloads() > 0;
};

export const deductDownload = (): boolean => {
  const license = JSON.parse(localStorage.getItem('license') || '{}');
  if (license.downloadsLeft > 0) {
    license.downloadsLeft--;
    localStorage.setItem('license', JSON.stringify(license));
    return true;
  }
  return false;
};

export const addDownloadCredits = (quantity: number, mpesaCode: string, amount: number): void => {
  const existing = JSON.parse(localStorage.getItem('license') || '{}') as License;
  const transaction = {
    code: mpesaCode,
    amount: amount,
    credits: quantity,
    date: new Date().toISOString()
  };

  const license: License = {
    downloadsLeft: (existing.downloadsLeft || 0) + quantity,
    purchaseDate: new Date().toISOString(),
    mpesaTransactions: [...(existing.mpesaTransactions || []), transaction]
  };
  
  localStorage.setItem('license', JSON.stringify(license));
};

export const getTransactionHistory = (): License['mpesaTransactions'] => {
  const license = JSON.parse(localStorage.getItem('license') || '{}') as License;
  return license.mpesaTransactions || [];
};

export const calculatePrice = (quantity: number): number => {
  if (quantity >= 100) return 300 * quantity; // 40% off
  if (quantity >= 50) return 350 * quantity;  // 30% off
  if (quantity >= 20) return 400 * quantity;  // 20% off
  if (quantity >= 10) return 450 * quantity;  // 10% off
  return 500 * quantity; // Base price 500 KES per report
};

export const pricingTiers = [
  { quantity: 1, pricePerUnit: 500, total: 500 },
  { quantity: 10, pricePerUnit: 450, total: 4500 },
  { quantity: 20, pricePerUnit: 400, total: 8000 },
  { quantity: 50, pricePerUnit: 350, total: 17500 },
  { quantity: 100, pricePerUnit: 300, total: 30000 },
];

interface MPESATransaction {
  code: string;
  amount: number;
  date: string;
  credits: number;
  devices: string[];
  maxDevices: number;
}

export const validateMpesaCode = (code: string): boolean => {
  // M-PESA codes are typically 10 characters, starting with PL or QK
  const mpesaPattern = /^[A-Z0-9]{10}$/;
  return mpesaPattern.test(code);
};

export const storeTransaction = (transaction: MPESATransaction): void => {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  transactions[transaction.code] = transaction;
  localStorage.setItem('mpesa_transactions', JSON.stringify(transactions));
};

export const verifyAndStoreMpesaPayment = (code: string, amount: number): boolean => {
  if (!validateMpesaCode(code)) return false;

  const deviceId = getDeviceFingerprint();
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');

  // Check if code already used
  if (transactions[code]) {
    const existingTx = transactions[code] as MPESATransaction;
    
    // Check if device limit reached
    if (existingTx.devices.length >= existingTx.maxDevices) {
      return false;
    }
    
    // Add new device if not already registered
    if (!existingTx.devices.includes(deviceId)) {
      existingTx.devices.push(deviceId);
      storeTransaction(existingTx);
    }
    
    return true;
  }

  // Create new transaction
  const credits = calculateCredits(amount);
  const newTransaction: MPESATransaction = {
    code,
    amount,
    date: new Date().toISOString(),
    credits,
    devices: [deviceId],
    maxDevices: 3 // Allow up to 3 devices per transaction
  };

  storeTransaction(newTransaction);
  return true;
};

// Generate a simple device fingerprint
const getDeviceFingerprint = (): string => {
  const { userAgent, language, platform } = navigator;
  const screenRes = `${window.screen.width}x${window.screen.height}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a hash of device information
  const fingerprint = `${userAgent}${language}${platform}${screenRes}${timeZone}`;
  return btoa(fingerprint).slice(0, 32); // Base64 encode and trim
};

const calculateCredits = (amount: number): number => {
  // 500 KES = 1 credit
  return Math.floor(amount / 500);
};

// Add missing functions
export const validateLicense = async (key: string): Promise<boolean> => {
  // In a real app, this would validate with a server
  return Promise.resolve(true);
};

export const activateLicense = async (key: string): Promise<boolean> => {
  // In a real app, this would activate with a server
  return Promise.resolve(true);
};

export const getLicenseInfo = async () => {
  const license = localStorage.getItem('license');
  if (!license) return null;
  
  try {
    return JSON.parse(license);
  } catch {
    return null;
  }
};
