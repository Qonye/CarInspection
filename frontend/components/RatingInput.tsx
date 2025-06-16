import { useState, useEffect } from 'react';

interface RatingInputProps {
  label: string;
  value: number;
  notes: string;
  onChange: (rating: number, notes: string) => void;
  description?: string;
  checkboxes?: Array<{
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }>;
  error?: string;
  required?: boolean;
}

export default function RatingInput({ 
  label, 
  value = 0, 
  notes: initialNotes = '', 
  onChange,
  description,
  checkboxes = [],
  error,
  required
}: RatingInputProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleRatingChange = (newRating: number) => {
    onChange(newRating, notes);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    onChange(value, newNotes);
  };

  const getRatingColor = (rating: number, currentValue: number) => {
    if (currentValue === -1) return 'bg-gray-500 border-gray-600'; // N/A state
    if (rating <= currentValue) {
      switch (currentValue) {
        case 1: return 'bg-red-500 border-red-600';
        case 2: return 'bg-orange-500 border-orange-600';
        case 3: return 'bg-yellow-500 border-yellow-600';
        case 4: return 'bg-lime-500 border-lime-600';
        case 5: return 'bg-green-500 border-green-600';
        default: return 'bg-gray-200 border-gray-300';
      }
    }
    return 'bg-gray-200 border-gray-300';
  };

  const getRatingText = (rating: number) => {
    if (rating === -1) return 'Not Applicable';
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Not Rated';
    }
  };

  const getRatingDescription = (rating: number) => {
    switch (rating) {
      case -1: return 'This criterion is not applicable to this vehicle';
      case 1: return 'Major problems found, requires significant repair/replacement';
      case 2: return 'Some noticeable issues that need attention';
      case 3: return 'Average condition with normal wear';
      case 4: return 'Above average condition with minimal issues';
      case 5: return 'Excellent condition with no noticeable issues';
      default: return 'Please select a rating';
    }
  };

  // Get specific descriptions for common inspection items
  const getSpecificDescription = (label: string, rating: number) => {
    const specificDescriptions: Record<string, Record<number, string>> = {
      "Rust": {
        1: "Severe rust damage in multiple areas, structural integrity may be compromised",
        2: "Noticeable rust in several areas, may require some repair",
        3: "Some surface rust, easily addressable",
        4: "Minor surface rust spots if any",
        5: "No visible rust anywhere on the vehicle",
        "-1": "Not examined or not applicable"
      },
      "Leaks": {
        1: "Active leaks that require immediate attention",
        2: "Signs of seepage or minor leaks",
        3: "Slight residue or staining, but no active leaks",
        4: "Very minimal signs of past leaks, currently dry",
        5: "No evidence of current or past leaks",
        "-1": "Not examined or not applicable"
      },
      "Tread Wear": {
        1: "Tires severely worn, need immediate replacement",
        2: "Significant wear, replacement advised soon",
        3: "Average tread depth, acceptable for continued use",
        4: "Good tread depth, plenty of life remaining",
        5: "Like new tread depth across all tires",
        "-1": "Not examined or not applicable"
      },
      "Alignment": {
        1: "Severe misalignment, car pulls strongly to one side",
        2: "Noticeable alignment issues, drifts while driving",
        3: "Minor alignment correction needed",
        4: "Properly aligned with minimal deviation",
        5: "Perfect alignment, car tracks straight with no drift",
        "-1": "Not examined or not applicable"
      }
    };

    // Check if we have specific descriptions for this label
    const normalizedLabel = label.toLowerCase().trim();
    for (const key in specificDescriptions) {
      if (normalizedLabel.includes(key.toLowerCase())) {
        return specificDescriptions[key][rating] || getRatingDescription(rating);
      }
    }
    
    return getRatingDescription(rating);
  };

  return (
    <div className={`space-y-2 ${error ? 'text-red-500' : 'text-text-primary'}`}>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 ${isExpanded ? 'pb-3' : ''}`}>
        <div 
          className="flex items-center justify-between p-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-text-primary">
              {label}
              {description && (
                <span 
                  className="ml-1 cursor-help inline-block relative"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {showTooltip && (
                    <div className="absolute z-10 bg-gray-800 text-white text-xs p-2 rounded w-64 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
                      {description}
                      <div className="absolute border-t-8 border-t-gray-800 border-l-8 border-l-transparent border-r-8 border-r-transparent bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"></div>
                    </div>
                  )}
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center">
            {/* Show rating badge if a rating is selected */}
            {value !== 0 && (
              <span className={`px-2 py-0.5 mr-2 text-sm font-medium rounded-full ${getRatingColor(value, value)} text-white`}>
                {getRatingText(value)}
              </span>
            )}
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isExpanded && (
          <div className="px-3 space-y-3">
            {/* Rating description when a rating is selected */}
            {value !== 0 && (
              <div className="bg-gray-50 p-2 rounded-md text-sm">
                <p className="font-semibold">{getRatingText(value)}</p>
                <p className="text-gray-600">{getSpecificDescription(label, value)}</p>
              </div>
            )}

            {/* Rating buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleRatingChange(-1)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                  ${value === -1 
                    ? 'bg-gray-500 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                title="Not applicable to this vehicle"
              >
                N/A
              </button>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(rating)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                    ${value === rating 
                      ? getRatingColor(rating, rating) + ' text-white' 
                      : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                  title={getSpecificDescription(label, rating)}
                >
                  {getRatingText(rating)}
                </button>
              ))}
            </div>

            {/* Rating scale description */}
            <div className="pt-2 text-xs text-gray-500 grid grid-cols-5 gap-1">
              <div className="text-center">
                <div className="h-2 bg-red-500 rounded mb-1"></div>
                <span>Major issues</span>
              </div>
              <div className="text-center">
                <div className="h-2 bg-orange-500 rounded mb-1"></div>
                <span>Needs attention</span>
              </div>
              <div className="text-center">
                <div className="h-2 bg-yellow-500 rounded mb-1"></div>
                <span>Average</span>
              </div>
              <div className="text-center">
                <div className="h-2 bg-lime-500 rounded mb-1"></div>
                <span>Above average</span>
              </div>
              <div className="text-center">
                <div className="h-2 bg-green-500 rounded mb-1"></div>
                <span>Excellent</span>
              </div>
            </div>

            {/* Checkboxes if provided */}
            {checkboxes.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-sm font-medium text-text-primary mb-2">Inspection Checklist</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                  {checkboxes.map((checkbox) => (
                    <div key={checkbox.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={checkbox.id}
                        checked={checkbox.checked}
                        onChange={(e) => checkbox.onChange(e.target.checked)}
                        className="w-4 h-4 text-primary bg-background-default border-background-dark rounded focus:ring-primary"
                      />
                      <label htmlFor={checkbox.id} className="ml-2 text-sm text-text-primary">
                        {checkbox.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes textarea */}
            <div>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Add notes here..."
                rows={3}
                className="w-full px-3 py-2 text-text-primary placeholder-text-light bg-background-default border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}