import { calculatePrice } from './licensing';

interface MpesaTransaction {
  code: string;
  phoneNumber: string;
  amount: number;
  timestamp: string;
  verified: boolean;
  deviceId: string;
  maxDevices: number;
  devices: string[];
  usageCount: number;      // Track how many times code has been used
  lastUsed: string;        // Track when code was last used
  verificationAttempts: number; // Track verification attempts
}

// Blacklist for known fraudulent codes
const BLACKLISTED_CODES = new Set([
  'PLFRAUD123', 'QKFAKE1234', 'PLINVALID'
]);

// Maximum number of allowed devices per transaction code
const MAX_DEVICES_PER_CODE = 2;

// Time window constraints (in hours)
const CODE_EXPIRY_HOURS = 48; // M-PESA codes older than this are rejected
const MIN_TIME_BETWEEN_USES = 1; // Minimum hours between reuses of same code

function isMpesaCodeValid(code: string): boolean {
  // Basic validation
  if (!code || typeof code !== 'string') return false;
  
  // Remove spaces and hyphens, convert to uppercase
  code = code.replace(/[\s-]/g, '').toUpperCase();
  
  // Allow 9-11 characters total (typical M-Pesa code length)
  if (code.length < 9 || code.length > 11) return false;
  
  // Check that code is alphanumeric
  if (!/^[A-Z0-9]+$/.test(code)) return false;
  
  // Check blacklist
  if (BLACKLISTED_CODES.has(code)) return false;
  
  return true;
}

function isMpesaNumberValid(phoneNumber: string): boolean {
  // Validate Kenyan phone numbers (254 followed by 9 digits, typically starting with 7 or 1)
  return /^254[7|1][0-9]{8}$/.test(phoneNumber);
}

function isAmountReasonable(actualAmount: number, expectedAmount: number): boolean {
  // Allow small variance (5 KES or 2%, whichever is greater) to account for fees
  const allowedVariance = Math.max(5, expectedAmount * 0.02);
  return Math.abs(actualAmount - expectedAmount) <= allowedVariance;
}

function isCodeRecentlyUsed(code: string): boolean {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  
  if (transactions[code]) {
    const lastUsed = new Date(transactions[code].lastUsed || transactions[code].timestamp);
    const currentTime = new Date();
    const hoursSinceLastUsed = (currentTime.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
    
    return hoursSinceLastUsed < MIN_TIME_BETWEEN_USES;
  }
  
  return false;
}

function isCodeExpired(timestamp: string): boolean {
  const transactionTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const hoursSinceTransaction = (currentTime - transactionTime) / (1000 * 60 * 60);
  
  return hoursSinceTransaction > CODE_EXPIRY_HOURS;
}

function getTransactionAgeInHours(timestamp: string): number {
  const transactionTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  return (currentTime - transactionTime) / (1000 * 60 * 60);
}

function detectSuspiciousPatterns(code: string, phoneNumber: string): string | null {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  
  // Check how many different codes from this phone in the past 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  let recentCodesFromPhone = 0;
  
  Object.values(transactions).forEach((tx: any) => {
    if (tx.phoneNumber === phoneNumber && new Date(tx.timestamp) >= oneDayAgo) {
      recentCodesFromPhone++;
    }
  });
  
  // More than 5 different transactions from same phone in 24 hours is suspicious
  if (recentCodesFromPhone >= 5) {
    return "Too many codes from same phone number in 24 hours";
  }
  
  // Check for sequential code patterns (possible brute force)
  const alphanumericPart = code.substring(2);
  const existingCodes = Object.keys(transactions)
    .filter(c => c.startsWith(code.substring(0, 2)))
    .map(c => c.substring(2));
  
  // Check for sequential attempts (basic pattern)
  if (existingCodes.length >= 3) {
    // This is a simplified check - a real implementation would be more sophisticated
    const sequentialAttempts = existingCodes.some(c => 
      Math.abs(parseInt(c, 36) - parseInt(alphanumericPart, 36)) <= 5
    );
    
    if (sequentialAttempts) {
      return "Sequential code attempt pattern detected";
    }
  }
  
  return null; // No suspicious pattern detected
}

export const validateMpesaCode = (code: string): boolean => {
  return isMpesaCodeValid(code);
};

export const getDeviceId = (): string => {
  // Enhanced device fingerprinting for better fraud prevention
  const { userAgent, language, platform } = navigator;
  const screenRes = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fonts = getFontFingerprint();
  const canvas = getCanvasFingerprint();
  
  return btoa(`${userAgent}${language}${platform}${screenRes}${timeZone}${fonts}${canvas}`).slice(0, 48);
};

// Helper function to get a canvas fingerprint (helps with device identification)
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Draw elements that will vary slightly between browsers/devices
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('CarInspection', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('M-PESA Verify', 4, 17);
    
    return canvas.toDataURL().substring(0, 50);
  } catch (e) {
    return '';
  }
}

// Helper function to get font fingerprint
function getFontFingerprint(): string {
  const fontsList = [
    'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
    'Tahoma', 'Impact', 'Comic Sans MS'
  ];
  
  try {
    const testString = 'abcdefghijklmnopqrstuvwxyz';
    const testElement = document.createElement('span');
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.fontSize = '72px';
    testElement.textContent = testString;
    document.body.appendChild(testElement);

    const result = fontsList.map(font => {
      testElement.style.fontFamily = font;
      return `${font}:${testElement.offsetWidth}x${testElement.offsetHeight}`;
    }).join(';');

    document.body.removeChild(testElement);
    return result.substring(0, 50);
  } catch (e) {
    return fontsList.join(',');
  }
}

export const verifyMpesaPayment = (code: string, phoneNumber: string, amount: number): { success: boolean; message: string } => {
  // Step 1: Basic validation
  if (!isMpesaCodeValid(code)) {
    return { success: false, message: "Invalid M-PESA code format" };
  }
  
  if (!isMpesaNumberValid(phoneNumber)) {
    return { success: false, message: "Invalid phone number format" };
  }
  
  // Get unique device identifier
  const deviceId = getDeviceId();
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  
  // Step 2: Check for suspicious patterns
  const suspiciousPattern = detectSuspiciousPatterns(code, phoneNumber);
  if (suspiciousPattern) {
    // Log the suspicious activity but don't tell the user the specific reason
    console.warn('Suspicious activity detected:', suspiciousPattern, { code, phoneNumber });
    return { success: false, message: "Transaction verification failed" };
  }
  
  // Step 3: Check for code reuse
  if (transactions[code]) {
    const transaction = transactions[code] as MpesaTransaction;
    
    // Check if code is expired
    if (isCodeExpired(transaction.timestamp)) {
      return { success: false, message: "This M-PESA code has expired" };
    }
    
    // Check if code was used too recently
    if (isCodeRecentlyUsed(code)) {
      // Increment verification attempts
      transaction.verificationAttempts = (transaction.verificationAttempts || 0) + 1;
      transactions[code] = transaction;
      localStorage.setItem('mpesa_transactions', JSON.stringify(transactions));
      
      return { success: false, message: "Please wait before retrying this code" };
    }
    
    // Check if this device already used the code
    if (transaction.devices.includes(deviceId)) {
      // Update last used timestamp
      transaction.lastUsed = new Date().toISOString();
      transaction.usageCount = (transaction.usageCount || 0) + 1;
      transactions[code] = transaction;
      localStorage.setItem('mpesa_transactions', JSON.stringify(transactions));
      
      return { success: true, message: "Payment verified successfully" };
    }
    
    // Check if device limit reached
    if (transaction.devices.length >= transaction.maxDevices) {
      // Increment verification attempts
      transaction.verificationAttempts = (transaction.verificationAttempts || 0) + 1;
      transactions[code] = transaction;
      localStorage.setItem('mpesa_transactions', JSON.stringify(transactions));
      
      return { success: false, message: "This code has reached its device limit" };
    }
    
    // Add new device
    transaction.devices.push(deviceId);
    transaction.usageCount = (transaction.usageCount || 0) + 1;
    transaction.lastUsed = new Date().toISOString();
    transactions[code] = transaction;
    localStorage.setItem('mpesa_transactions', JSON.stringify(transactions));
    
    return { success: true, message: "Payment verified successfully" };
  }
  
  // Step 4: Create new transaction record
  const newTransaction: MpesaTransaction = {
    code,
    phoneNumber,
    amount,
    timestamp: new Date().toISOString(),
    verified: true,
    deviceId,
    maxDevices: MAX_DEVICES_PER_CODE,
    devices: [deviceId],
    usageCount: 1,
    lastUsed: new Date().toISOString(),
    verificationAttempts: 1
  };
  
  transactions[code] = newTransaction;
  localStorage.setItem('mpesa_transactions', JSON.stringify(transactions));
  
  return { success: true, message: "Payment verified successfully" };
};

export const getMpesaTransactions = (): MpesaTransaction[] => {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  return Object.values(transactions);
};

export function getMpesaTransactionHistory(): MpesaTransaction[] {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  return Object.values(transactions);
}

export function getPendingTransaction(mpesaCode: string): MpesaTransaction | null {
  const transactions = JSON.parse(localStorage.getItem('mpesa_transactions') || '{}');
  return transactions[mpesaCode] || null;
}
