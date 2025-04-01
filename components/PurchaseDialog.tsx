import { useState } from 'react';
import { calculatePrice, addDownloadCredits } from '../utils/licensing';
import { validateMpesaCode, verifyMpesaPayment } from '../utils/payments';

interface PurchaseDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseDialog({ onClose, onSuccess }: PurchaseDialogProps) {
  const [step, setStep] = useState<'instructions' | 'verification'>('instructions');
  const [quantity, setQuantity] = useState(1);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const price = calculatePrice(quantity);
  const discount = ((500 - (price / quantity)) / 500) * 100;

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setVerificationStatus('Verifying...');

    try {
      // Client-side format validation
      if (!validateMpesaCode(mpesaCode)) {
        setError('Invalid M-PESA code format. Please check and try again.');
        setVerificationStatus('Format error');
        return;
      }
      
      // Enhanced verification with our improved logic
      const verificationResult = verifyMpesaPayment(mpesaCode, mpesaNumber, price);
      
      if (!verificationResult.success) {
        setError(verificationResult.message);
        setVerificationStatus('Failed');
        return;
      }
      
      // If verification succeeded, add the credits
      addDownloadCredits(quantity, mpesaCode, price);
      setVerificationStatus('Verified ✓');
      
      // Show success briefly before closing
      setTimeout(() => {
        onSuccess();
      }, 1500);
      
    } catch (err) {
      console.error('Verification error:', err);
      setError('An error occurred during verification. Please try again.');
      setVerificationStatus('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Purchase Download Credits</h2>
        
        {step === 'instructions' ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded space-y-2">
                <h3 className="font-medium">M-PESA Payment Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Go to M-PESA on your phone</li>
                  <li>Select Pay Bill</li>
                  <li>Enter Business No: <span className="font-medium">303030</span></li>
                  <li>Enter Account No: <span className="font-medium">2039841064</span></li>
                  <li>Enter Amount: <span className="font-medium">{price} KES</span></li>
                  <li>Enter your M-PESA PIN</li>
                  <li>Wait for M-PESA confirmation message</li>
                </ol>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Total: {price} KES
                  {discount > 0 && (
                    <span className="ml-2 text-green-600">
                      (Save {discount.toFixed(0)}%)
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You will receive an SMS confirmation with a transaction code after payment.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('verification')}
                  className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                >
                  I've Made the Payment
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">M-PESA Number Used</label>
                <input
                  type="tel"
                  value={mpesaNumber}
                  onChange={(e) => setMpesaNumber(e.target.value)}
                  placeholder="254700000000"
                  disabled={loading}
                  className="w-full border rounded p-2 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: 254XXXXXXXXX (e.g. 254712345678)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">M-PESA Transaction Code</label>
                <input
                  type="text"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  placeholder="Enter code from M-PESA message"
                  disabled={loading}
                  className="w-full border rounded p-2 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: PL12345678 (from your M-PESA confirmation SMS)
                </p>
              </div>

              {verificationStatus && (
                <div className={`p-3 rounded text-sm font-medium ${
                  verificationStatus === 'Verified ✓' 
                    ? 'bg-green-50 text-green-700' 
                    : verificationStatus === 'Failed' || verificationStatus === 'Format error' || verificationStatus === 'Error'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {verificationStatus}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleVerify}
                  disabled={loading || !mpesaNumber || !mpesaCode}
                  className="flex-1 bg-blue-600 text-white p-2 rounded disabled:opacity-50 hover:bg-blue-700 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify Payment'}
                </button>
                <button
                  onClick={() => {
                    if (!loading) {
                      setStep('instructions');
                      setError('');
                      setVerificationStatus(null);
                    }
                  }}
                  disabled={loading}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Back
                </button>
              </div>
              
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>Each M-PESA code can be used on up to 2 devices.</p>
                <p>Codes expire after 48 hours from the time of payment.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
