import { useState, useEffect } from 'react';

interface CheckboxInputProps {
  label: string;
  checked: boolean;
  notes: string;
  onChange: (checked: boolean, notes: string) => void;
  description?: string;
}

export default function CheckboxInput({ 
  label, 
  checked: initialChecked, 
  notes: initialNotes, 
  onChange, 
  description 
}: CheckboxInputProps) {
  const [checked, setChecked] = useState(initialChecked);
  const [notes, setNotes] = useState(initialNotes);
  const [showNotes, setShowNotes] = useState(!!initialNotes);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setChecked(initialChecked);
    setNotes(initialNotes);
    setShowNotes(!!initialNotes);
  }, [initialChecked, initialNotes]);

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked;
    setChecked(newChecked);
    onChange(newChecked, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onChange(checked, newNotes);
  };

  return (
    <div className={`border rounded-lg p-4 shadow-sm ${checked 
      ? 'border-green-300 bg-green-50' 
      : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckChange}
            className="h-5 w-5 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500"
          />
          <div className="ml-2">
            <span className="text-text-primary font-medium">{label}</span>
            {description && (
              <span 
                className="ml-1 cursor-help inline-block relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {showTooltip && (
                  <div className="absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-64 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
                    {description}
                    <div className="absolute border-t-8 border-t-gray-800 border-l-8 border-l-transparent border-r-8 border-r-transparent bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"></div>
                  </div>
                )}
              </span>
            )}
          </div>
        </label>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className={`text-sm ${checked ? 'text-green-700' : 'text-gray-600'} hover:underline flex items-center`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={showNotes 
                ? "M19 9l-7 7-7-7" 
                : "M9 5l7 7-7 7"}
            />
          </svg>
          {showNotes ? 'Hide Notes' : 'Add Notes'}
        </button>
      </div>

      {showNotes && (
        <div className="mt-2">
          <textarea
            value={notes}
            onChange={handleNotesChange}
            className={`w-full border rounded p-2 text-text-primary placeholder-text-light focus:ring-2 focus:outline-none transition-colors ${
              checked 
                ? 'border-green-300 bg-white focus:ring-green-200 focus:border-green-400' 
                : 'border-gray-200 bg-gray-50 focus:ring-blue-100 focus:border-blue-300'
            }`}
            rows={2}
            placeholder="Add any additional notes..."
          />
        </div>
      )}
    </div>
  );
}
