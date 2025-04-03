import React from 'react';
import { CarInspection } from '../types/inspection';
import { getRatingColorClass, getRatingText } from '../utils/reportRecommendations';

interface PDFPreviewProps {
  inspection: CarInspection;
  theme?: 'light' | 'dark';
}

export default function PDFPreview({ inspection, theme = 'light' }: PDFPreviewProps) {
  const getInspectionDate = () => {
    try {
      return new Date(inspection.date).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: inspection.carBasics?.currency?.code || 'USD'
    }).format(value);
  };

  // Get text color classes based on theme
  const getTextColor = (type: 'heading' | 'primary' | 'secondary' | 'accent'): string => {
    if (theme === 'dark') {
      switch (type) {
        case 'heading': return 'text-white';
        case 'primary': return 'text-gray-200';
        case 'secondary': return 'text-gray-400';
        case 'accent': return 'text-blue-300';
        default: return 'text-white';
      }
    } else {
      switch (type) {
        case 'heading': return 'text-gray-800';
        case 'primary': return 'text-gray-800';
        case 'secondary': return 'text-gray-600';
        case 'accent': return 'text-blue-600';
        default: return 'text-gray-800';
      }
    }
  };

  // Get background color classes based on theme
  const getBgColor = (type: 'card' | 'section'): string => {
    if (theme === 'dark') {
      return type === 'card' ? 'bg-gray-800' : 'bg-gray-900';
    } else {
      return type === 'card' ? 'bg-white' : 'bg-gray-50';
    }
  };

  // Get rating color class that works with current theme
  const getThemeAwareRatingColorClass = (score: number): string => {
    // Use the existing getRatingColorClass but modify for dark theme if needed
    const baseClasses = getRatingColorClass(score);
    
    if (theme === 'dark') {
      // For dark theme, use higher contrast text colors
      if (score === 1) return 'bg-red-900 text-red-100';
      if (score === 2) return 'bg-orange-900 text-orange-100';
      if (score === 3) return 'bg-yellow-900 text-yellow-100';
      if (score === 4) return 'bg-lime-900 text-lime-100';
      if (score === 5) return 'bg-green-900 text-green-100';
      return 'bg-gray-700 text-gray-200';
    }
    
    return baseClasses;
  };

  const renderCarBasics = () => (
    <div className="mb-6 text-center">
      <h2 className={`text-lg font-semibold ${getTextColor('heading')} mb-3`}>Vehicle Information</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {inspection.carBasics && [
          { label: 'Make', value: inspection.carBasics.make },
          { label: 'Model', value: inspection.carBasics.model },
          { label: 'Year', value: inspection.carBasics.manufactureYear },
          { label: 'Engine', value: `${inspection.carBasics.engineSize}cc` },
          { label: 'Transmission', value: inspection.carBasics.transmission },
          { label: 'Fuel Type', value: inspection.carBasics.fuel },
          { label: 'Registration', value: inspection.carBasics.registrationNumber },
          { label: 'Chassis', value: inspection.carBasics.chassisNumber },
          { label: 'Engine No.', value: inspection.carBasics.engineNumber },
        ].map(({ label, value }) => (
          <div key={label} className={`p-3 rounded-lg ${getBgColor('card')} shadow-sm`}>
            <p className={`text-xs ${getTextColor('secondary')} mb-1`}>{label}</p>
            <p className={`text-sm font-medium ${getTextColor('primary')}`}>{value || 'N/A'}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'} shadow-sm`}>
          <p className={`text-xs ${getTextColor('secondary')} mb-1`}>Asking Price</p>
          <p className={`text-sm font-medium text-blue-600`}>{formatCurrency(inspection.carBasics?.askingPrice || 0)}</p>
        </div>
        {inspection.carBasics?.tradeInValue > 0 && (
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'} shadow-sm`}>
            <p className={`text-xs ${getTextColor('secondary')} mb-1`}>Trade-in Value</p>
            <p className={`text-sm font-medium text-green-600`}>{formatCurrency(inspection.carBasics?.tradeInValue || 0)}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${getBgColor('card')} shadow-lg rounded-lg p-4 md:p-8 w-full overflow-hidden ${theme === 'dark' ? 'border border-gray-700' : ''}`}>
      <div className="text-center mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${getTextColor('heading')} mb-2`}>Vehicle Inspection Report</h1>
        <p className={`${getTextColor('secondary')} text-sm md:text-base`}>Preview</p>
      </div>

      {/* Vehicle Basic Information - Preview */}
      {renderCarBasics()}

      {/* Key Inspection Results - Snapshot */}
      <div className="mb-6">
        <h2 className={`text-lg font-semibold ${getTextColor('heading')} mb-3`}>Key Findings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Body Condition */}
          <div className={`border ${theme === 'dark' ? 'border-gray-700' : ''} rounded-lg p-3 ${getBgColor('card')} shadow-sm`}>
            <h3 className={`text-sm font-medium ${getTextColor('primary')} mb-2`}>Body Condition</h3>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded ${getThemeAwareRatingColorClass(inspection.bodyInspection?.panelGaps?.score || 0)}`}>
                {getRatingText(inspection.bodyInspection?.panelGaps?.score || 0)}
              </span>
            </div>
          </div>

          {/* Engine Condition */}
          <div className={`border ${theme === 'dark' ? 'border-gray-700' : ''} rounded-lg p-3 ${getBgColor('card')} shadow-sm`}>
            <h3 className={`text-sm font-medium ${getTextColor('primary')} mb-2`}>Engine</h3>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 text-xs rounded ${getThemeAwareRatingColorClass(inspection.engineInspection?.score || 0)}`}>
                {getRatingText(inspection.engineInspection?.score || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Preview */}
      {(inspection.photos?.bodyPhotos?.length || inspection.photos?.enginePhotos?.length) && (
        <div className="mb-6">
          <h2 className={`text-lg font-semibold ${getTextColor('heading')} mb-3`}>Inspection Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[...(inspection.photos?.bodyPhotos || []), ...(inspection.photos?.enginePhotos || [])].slice(0, 3).map((photo, index) => (
              <div key={index} className="relative aspect-w-4 aspect-h-3">
                <img 
                  src={photo} 
                  alt={`Inspection photo ${index + 1}`} 
                  className="object-cover rounded-lg w-full h-full"
                />
              </div>
            ))}
            {(inspection.photos?.bodyPhotos?.length || 0) + (inspection.photos?.enginePhotos?.length || 0) > 3 && (
              <div className={`relative aspect-w-4 aspect-h-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>+ More photos in full report</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Preview */}
      <div className={`text-center text-xs md:text-sm ${getTextColor('secondary')} mt-6`}>
        <p>Inspection Date: {getInspectionDate()}</p>
        <p className="mt-1">Download the full report for complete details</p>
      </div>
    </div>
  );
}
