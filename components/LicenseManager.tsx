import { useState, useEffect } from 'react';
import { validateLicense, activateLicense, getLicenseInfo, getRemainingDownloads, addDownloadCredits, calculatePrice, pricingTiers } from '../utils/licensing';

interface LicenseManagerProps {
  onLicenseChange: (isValid: boolean) => void;
}

export default function LicenseManager({ onLicenseChange }: LicenseManagerProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [currentLicense, setCurrentLicense] = useState<{
    key: string;
    expiresAt: string;
    inspectionsLeft: number;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const remainingDownloads = getRemainingDownloads();

  useEffect(() => {
    loadCurrentLicense();
  }, []);

  const loadCurrentLicense = async () => {
    try {
      const license = await getLicenseInfo();
      if (license) {
        setCurrentLicense(license);
        onLicenseChange(true);
      }
    } catch (err) {
      console.error('Failed to load license:', err);
      onLicenseChange(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError('');

    try {
      // Add credits after successful payment
      const mpesaCode = 'DUMMY123'; // This should come from actual M-PESA response
      const price = calculatePrice(quantity); // Calculate the price as a number
      addDownloadCredits(quantity, mpesaCode, price);
      setSuccess(true);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const price = calculatePrice(quantity);
      await addDownloadCredits(quantity, mpesaNumber, price);
      setSuccess(true);
      // Reset form
      setQuantity(1);
      setMpesaNumber('');
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">License Management</h2>

      {/* Show remaining downloads */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-blue-700">Remaining Downloads: {remainingDownloads}</p>
      </div>

      {/* Pricing tiers */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Pricing Tiers:</h3>
        <div className="space-y-2">
          {pricingTiers.map((tier) => (
            <div 
              key={tier.quantity}
              className={`p-3 border rounded cursor-pointer ${
                quantity === tier.quantity ? 'border-primary bg-primary/5' : 'border-gray-200'
              }`}
              onClick={() => setQuantity(tier.quantity)}
            >
              <div className="flex justify-between">
                <span>{tier.quantity} Reports</span>
                <span>{tier.pricePerUnit} KES/report</span>
              </div>
              <div className="text-sm text-gray-600">
                Total: {tier.total} KES
                {tier.pricePerUnit < 500 && (
                  <span className="ml-2 text-green-600">
                    Save {((500 - tier.pricePerUnit) / 500 * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom quantity input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Or enter custom quantity:
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full border rounded p-2"
        />
        <p className="text-sm text-gray-600 mt-1">
          Total: {calculatePrice(quantity)} KES
        </p>
      </div>

      {/* M-PESA input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          M-PESA Phone Number:
        </label>
        <input
          type="tel"
          pattern="[0-9]*"
          value={mpesaNumber}
          onChange={(e) => setMpesaNumber(e.target.value)}
          placeholder="254700000000"
          className="w-full border rounded p-2"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-3 bg-green-50 text-green-700 rounded">
          Purchase successful! Your downloads have been credited.
        </div>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={loading || !mpesaNumber}
          className="w-full bg-primary text-white p-3 rounded disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Purchase with M-PESA'}
        </button>
      )}
    </div>
  );
}
