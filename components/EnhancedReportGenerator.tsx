import { useState, useEffect } from 'react';
import { CarInspection } from '../types/inspection';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { canDownloadReport, deductDownload, getRemainingDownloads } from '../utils/licensing';
import PurchaseDialog from './PurchaseDialog';

interface EnhancedReportGeneratorProps {
  inspection: CarInspection;
  theme?: 'light' | 'dark';
}

// Helper functions to fix type issues
const calculateAverageRating = (section: any): number => {
  if (!section) return 0;
  
  // Special case for engineInspection which has a direct score property
  if ('score' in section && typeof section.score === 'number') {
    return section.score >= 0 ? section.score : 0;
  }
  
  const validEntries = Object.entries(section)
    .filter(([key, value]: [string, any]) => 
      value && 
      typeof value === 'object' && 
      'score' in value && 
      typeof value.score === 'number' && 
      value.score !== -1  // Filter out N/A ratings
    );
  
  if (validEntries.length === 0) return 0;
  
  const sum = validEntries.reduce((acc, [_, value]: [string, any]) => acc + value.score, 0);
  return sum / validEntries.length;
};

const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#22c55e'; // Green
  if (rating >= 3.5) return '#3b82f6'; // Blue
  if (rating >= 2.5) return '#f59e0b'; // Orange
  if (rating <= 0) return '#6b7280'; // Gray for N/A or invalid ratings
  return '#ef4444'; // Red
};

const getRecommendation = (section: string, rating: number): string => {
  const sectionName = section.replace('Inspection', '').toLowerCase();
  
  switch(sectionName) {
    case 'body':
      if (rating >= 4.5) {
        return 'The body is in excellent condition with no significant cosmetic issues. Paint finish is consistent and well-maintained, with proper panel gaps and no signs of previous repairs.';
      } else if (rating >= 3.5) {
        return 'The body shows minor wear consistent with age. May have small scratches or dings that can be easily addressed. Panel alignment is generally good with no major structural concerns.';
      } else if (rating >= 2.5) {
        return 'Body requires attention with noticeable cosmetic issues. May have inconsistent paint, panel gap variations, or signs of previous repairs. Professional body shop evaluation recommended.';
      } else {
        return 'Significant body issues present. Shows evidence of major repairs, rust, or structural concerns. Requires comprehensive professional assessment and likely extensive repairs.';
      }

    case 'wheels':
      if (rating >= 4.5) {
        return 'Wheels and tires are in excellent condition. Tires show even wear with plenty of tread life remaining. Alignment is precise with no pulling or vibration issues.';
      } else if (rating >= 3.5) {
        return 'Wheels and tires are in good working order. Minor alignment adjustments may be needed. Tires have adequate tread but replacement should be planned within the next year.';
      } else if (rating >= 2.5) {
        return 'Wheel system needs attention. Tires show uneven wear patterns suggesting alignment issues. Suspension components should be inspected and tires may need immediate replacement.';
      } else {
        return 'Immediate attention required for wheels and tires. Safety concerns present with significant wear or damage. Professional suspension and alignment service necessary.';
      }

    case 'interior':
      if (rating >= 4.5) {
        return 'Interior is exceptionally well-maintained. Upholstery, carpets, and trim are clean and show minimal wear. All features and controls function properly.';
      } else if (rating >= 3.5) {
        return 'Interior shows normal wear for age. Minor cosmetic issues present but no significant damage. Most features work correctly with perhaps minor electrical issues.';
      } else if (rating >= 2.5) {
        return 'Interior requires attention. Noticeable wear on high-touch surfaces, possible tears or stains. Several features may need repair or replacement.';
      } else {
        return 'Interior needs major reconditioning. Significant wear, damage, or missing components. Multiple systems require repair or replacement.';
      }

    case 'engine':
      if (rating >= 4.5) {
        return 'Engine performs excellently with no mechanical issues. Clean operation, no leaks, proper compression, and all systems functioning optimally. Maintenance records likely complete.';
      } else if (rating >= 3.5) {
        return 'Engine runs well with minor issues. May need routine maintenance or minor repairs. No major mechanical concerns but should be monitored for developing issues.';
      } else if (rating >= 2.5) {
        return 'Engine requires attention. Shows signs of wear or potential problems. Professional diagnostic testing recommended. Budget for repairs or maintenance should be considered.';
      } else {
        return 'Serious engine concerns present. Major mechanical issues detected. Complete professional evaluation needed before purchase. Significant repair costs likely.';
      }

    case 'undercar':
      if (rating >= 4.5) {
        return 'Undercarriage is exceptionally clean and well-maintained. No structural rust, all components are secure, and no fluid leaks. Suspension and brake systems in excellent condition.';
      } else if (rating >= 3.5) {
        return 'Undercarriage shows normal wear. Minor surface rust may be present but no structural concerns. Some components may need maintenance in the near future.';
      } else if (rating >= 2.5) {
        return 'Undercarriage needs attention. Moderate rust or wear on critical components. Suspension or brake components may need replacement. Professional inspection recommended.';
      } else {
        return 'Major undercarriage concerns. Significant rust damage or structural issues present. Safety-critical components require immediate attention. Not recommended for purchase without major repairs.';
      }

    case 'testDrive':
      if (rating >= 4.5) {
        return 'Vehicle performs excellently in all driving conditions. Smooth acceleration, precise handling, and strong braking. No unusual noises or vibrations.';
      } else if (rating >= 3.5) {
        return 'Generally good performance with minor quirks. Some mechanical or comfort adjustments may be needed but vehicle is safe and reliable.';
      } else if (rating >= 2.5) {
        return 'Performance issues need addressing. Noticeable problems with acceleration, handling, or braking. Professional mechanical inspection strongly recommended.';
      } else {
        return 'Significant drivability concerns. Multiple performance issues affect safety and reliability. Major mechanical work required before regular use.';
      }

    default:
      if (rating >= 4.5) return `The ${sectionName} is in excellent condition.`;
      if (rating >= 3.5) return `The ${sectionName} is in good condition with minor issues.`;
      if (rating >= 2.5) return `The ${sectionName} needs attention in some areas.`;
      return `The ${sectionName} has significant issues that need to be addressed.`;
  }
};

const getDetailedRecommendation = (section: string, rating: number, details: any): string => {
  const sectionName = section.replace('Inspection', '').toLowerCase();
  
  switch(sectionName) {
    case 'body':
      const bodyIssues = [];
      if (details.rust?.score < 3.5) bodyIssues.push("rust concerns");
      if (details.panelGaps?.score < 3.5) bodyIssues.push("panel alignment issues");
      if (details.paintSeams?.score < 3.5) bodyIssues.push("paint inconsistencies");
      if (details.dents?.score < 3.5) bodyIssues.push("body damage");
      
      if (rating >= 4.5) {
        return `The body is in exceptional condition showing professional care and maintenance. Paint finish is uniform with factory-standard panel gaps. No evidence of prior accidents or repairs detected.${details.repainting?.notes ? ` Note: ${details.repainting.notes}` : ''}`;
      } else if (rating >= 3.5) {
        return `The body shows age-appropriate wear with minor cosmetic issues that can be addressed through standard detailing or minor bodywork. ${bodyIssues.length ? `Areas needing attention: ${bodyIssues.join(", ")}.` : ''}`;
      } else if (rating >= 2.5) {
        return `Significant body work required. Multiple areas show damage or deterioration including ${bodyIssues.join(", ")}. Professional body shop assessment recommended for repair cost estimation.`;
      }
      return `Major structural and cosmetic issues present including severe ${bodyIssues.join(", ")}. Comprehensive restoration needed. Recommend thorough professional evaluation before purchase consideration.`;

    case 'engine':
      const engineChecks = details.checklist || {};
      const failedChecks = Object.entries(engineChecks)
        .filter(([_, value]: [string, any]) => !value.checked)
        .map(([key]: [string, any]) => key.replace(/([A-Z])/g, ' $1').toLowerCase().trim());
      
      if (rating >= 4.5) {
        return `Engine performs flawlessly with no mechanical issues. All fluids are clean and at proper levels. No leaks detected. Cold start and idle are smooth. Maintenance records verify regular service.`;
      } else if (rating >= 3.5) {
        return `Engine runs reliably but shows normal wear. ${failedChecks.length ? `Attention needed for: ${failedChecks.join(", ")}.` : ''} Recommend standard maintenance and monitoring.`;
      } else if (rating >= 2.5) {
        return `Engine requires service attention. Issues include: ${failedChecks.join(", ")}. Professional diagnostic testing strongly recommended before purchase.`;
      }
      return `Significant engine problems detected. Multiple systems require repair including: ${failedChecks.join(", ")}. Major mechanical overhaul likely needed.`;

    case 'interior':
      const interiorIssues = [];
      if (details.seats?.score < 3.5) interiorIssues.push("seat wear/damage");
      if (details.carpet?.score < 3.5) interiorIssues.push("carpet concerns");
      if (details.electronics?.score < 3.5) interiorIssues.push("electrical issues");
      
      if (rating >= 4.5) {
        return `Interior is immaculately maintained. All surfaces show minimal wear, electronics function perfectly, and no odors detected. Original materials in excellent condition.`;
      } else if (rating >= 3.5) {
        return `Interior is well-maintained with normal wear patterns. ${interiorIssues.length ? `Minor issues noted: ${interiorIssues.join(", ")}.` : ''} All essential functions operate correctly.`;
      } else if (rating >= 2.5) {
        return `Interior needs significant attention. Problems include ${interiorIssues.join(", ")}. Some features may require professional repair or replacement.`;
      }
      return `Interior requires comprehensive renovation. Major issues with ${interiorIssues.join(", ")}. Consider full interior restoration costs in purchase decision.`;

    // Add similar detailed cases for other sections...
    default:
      return getRecommendation(section, rating);
  }
};

const generateOverallAssessment = (ratings: Record<string, number>): string => {
  const average = Object.values(ratings).reduce((sum, val) => sum + val, 0) / Object.values(ratings).length;
  
  if (average >= 4.5) {
    return `This vehicle is in excellent overall condition with a rating of ${average.toFixed(1)}/5. It shows minimal signs of wear and appears to have been well-maintained.`;
  } else if (average >= 3.5) {
    return `This vehicle is in good condition with a rating of ${average.toFixed(1)}/5. It shows normal wear for its age and mileage with only minor issues noted.`;
  } else if (average >= 2.5) {
    return `This vehicle is in fair condition with a rating of ${average.toFixed(1)}/5. It shows significant wear and will need repairs in several areas.`;
  } else {
    return `This vehicle is in poor condition with a rating of ${average.toFixed(1)}/5. It has major issues that need to be addressed before purchase consideration.`;
  }
};

// Add jsPDF-AutoTable type extension
interface ExtendedJsPDF extends jsPDF {
  previousAutoTable?: { finalY: number };
}

// Function to safely add images to PDF
const addImageToPDF = async (doc: jsPDF, imageUrl: string, x: number, y: number, width: number, height: number): Promise<boolean> => {
  if (!imageUrl) return false;
  
  return new Promise((resolve) => {
    try {
      // For base64 images
      if (imageUrl.startsWith('data:image')) {
        const quality = 0.95; // High quality for base64 images
        doc.addImage(imageUrl, 'JPEG', x, y, width, height);
        resolve(true);
        return;
      }
      
      // For URL images, load them first
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          // Calculate aspect ratio
          const aspectRatio = img.width / img.height;
          // Adjust dimensions while maintaining aspect ratio
          let finalWidth = width;
          let finalHeight = height;
          
          if (width / height > aspectRatio) {
            finalWidth = height * aspectRatio;
          } else {
            finalHeight = width / aspectRatio;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF'; // White background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            doc.addImage(dataUrl, 'JPEG', x + (width - finalWidth) / 2, y + (height - finalHeight) / 2, 
                        finalWidth, finalHeight, undefined, 'MEDIUM');
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          console.error('Error converting image:', err);
          resolve(false);
        }
      };
      img.src = imageUrl;
    } catch (err) {
      console.error('Error adding image to PDF:', err);
      resolve(false);
    }
  });
};

// Add a new function for creating photo galleries
const addPhotoGallery = async (doc: jsPDF, photos: string[], title: string, startY: number): Promise<number> => {
  if (!photos || photos.length === 0) return startY;

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const spacing = 10;
  
  // Add section title
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text(title, margin, startY);
  let currentY = startY + 10;

  // Calculate image dimensions
  const imagesPerRow = 2;
  const imageWidth = (pageWidth - (2 * margin) - spacing) / imagesPerRow;
  const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

  for (let i = 0; i < photos.length; i++) {
    const currentX = margin + (i % imagesPerRow) * (imageWidth + spacing);
    
    // Check if we need a new page
    if (currentY + imageHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin;
    }

    // Add image with frame and shadow effect
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(currentX - 1, currentY - 1, imageWidth + 2, imageHeight + 2, 2, 2, 'FD');
    
    await addImageToPDF(doc, photos[i], currentX, currentY, imageWidth, imageHeight);
    
    // Add caption
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Image ${i + 1}`, currentX, currentY + imageHeight + 5);
    
    // Move to next row if needed
    if ((i + 1) % imagesPerRow === 0) {
      currentY += imageHeight + spacing + 10;
    }
  }

  return currentY + imageHeight + 20;
};

const RatingSection = ({ title, ratings }: { title: string; ratings: any }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3 text-text-primary">{title}</h3>
    <div className="space-y-4">
      {Object.entries(ratings)
        .filter(([key, value]: [string, any]) => value && typeof value === 'object')
        .map(([key, value]: [string, any]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-text-primary">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {value.score !== undefined && (
                <span 
                  className="px-2 py-1 rounded text-sm font-medium"
                  style={{ 
                    backgroundColor: getRatingColor(value.score),
                    color: value.score === -1 ? '#374151' : '#ffffff'
                  }}
                >
                  {value.score === -1 ? 'N/A' : `${value.score}/5`}
                </span>
              )}
            </div>
            {value.notes && (
              <p className="text-sm text-text-primary whitespace-pre-wrap">{value.notes}</p>
            )}
          </div>
        ))}
    </div>
  </div>
);

export default function EnhancedReportGenerator({ inspection, theme = 'light' }: EnhancedReportGeneratorProps) {
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});
  const [overallAssessment, setOverallAssessment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  // Get text colors based on theme
  const getTextColor = (type: 'primary' | 'secondary'): string => {
    if (theme === 'dark') {
      return type === 'primary' ? 'text-white' : 'text-gray-300';
    }
    return type === 'primary' ? 'text-text-primary' : 'text-text-secondary';
  };

  useEffect(() => {
    // Calculate average ratings for each section
    const bodyRating = calculateAverageRating(inspection.bodyInspection);
    const wheelRating = calculateAverageRating(inspection.wheelInspection);
    const interiorRating = calculateAverageRating(inspection.interiorInspection);
    
    // Fix for engine rating - ensure we use the correct score value
    const engineRating = inspection.engineInspection?.score || 0;
    
    const undercarRating = inspection.undercarInspection?.score || 0;
    const testDriveRating = calculateAverageRating(inspection.testDrive);
    
    const ratings = {
      body: bodyRating,
      wheels: wheelRating,
      interior: interiorRating,
      engine: engineRating,
      undercar: undercarRating,
      testDrive: testDriveRating
    };
    
    setAverageRatings(ratings);
    setOverallAssessment(generateOverallAssessment(ratings));
  }, [inspection]);

  const generateReport = async () => {
    if (!canDownloadReport()) {
      setShowPurchaseDialog(true);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const doc = new jsPDF();
      const extendedDoc = doc as ExtendedJsPDF;
      
      // Get currency from user's selection
      const currencyCode = inspection.carBasics?.currency?.code || 'USD';
      const currencySymbol = inspection.carBasics?.currency?.symbol || '$';
      
      // Format currency values according to user selection
      const formatCurrencyValue = (value: number | undefined): string => {
        if (value === undefined || value === null) return 'N/A';
        return `${currencySymbol}${value.toLocaleString()}`;
      };
      
      // Add professional cover page
      doc.setFillColor(0, 51, 102); // Dark blue header
      doc.rect(0, 0, 210, 60, 'F');
      
      // Add company logo if available
      if (inspection.inspector?.logo) {
        try {
          doc.addImage(inspection.inspector.logo, 'JPEG', 20, 15, 50, 30);
        } catch (e) {
          console.error('Failed to add logo to PDF', e);
        }
      }

      // Cover page title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Vehicle Inspection Report', 105, 30, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`${inspection.carBasics?.manufactureYear || ''} ${inspection.carBasics?.make || ''} ${inspection.carBasics?.model || ''}`, 105, 45, { align: 'center' });

      // White info box
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, 80, 170, 100, 3, 3, 'F');
      doc.setTextColor(0, 51, 102);
      
      // Vehicle and inspector info
      doc.setFontSize(12);
      const infoY = 95;
      doc.text('Vehicle Details:', 30, infoY);
      doc.text('Inspector Information:', 115, infoY);
      
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.text([
        `VIN: ${inspection.carBasics?.chassisNumber || 'N/A'}`,
        `Engine: ${inspection.carBasics?.engineNumber || 'N/A'}`,
        `Asking Price: ${formatCurrencyValue(inspection.carBasics?.askingPrice)}`
      ], 30, infoY + 15);

      doc.text([
        `Name: ${inspection.inspector?.name || 'N/A'}`,
        `Company: ${inspection.inspector?.company || 'N/A'}`,
        `Date: ${new Date(inspection.date).toLocaleDateString()}`
      ], 115, infoY + 15);

      // Add a professional footer to cover page
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 270, 190, 270);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Professional Vehicle Inspection Service', 105, 280, { align: 'center' });

      // Start each major section on a new page with consistent styling
      const addSectionHeader = (title: string, y: number = 20) => {
        doc.setFillColor(0, 51, 102);
        doc.rect(0, y - 15, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(title, 20, y);
      };

      // Car details section with all information
      doc.addPage();
      addSectionHeader('Vehicle Details');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 22, 190, 22);
      
      // Create a comprehensive table for car details
      const carDetailsHeaders = [
        ['Make', 'Model', 'Year', 'VIN/Chassis', 'Engine Number', 'Registration', 'Asking Price', 'Trade-in Value']
      ];
      
      const carDetailsData = [
        [
          inspection.carBasics?.make || 'N/A', 
          inspection.carBasics?.model || 'N/A', 
          inspection.carBasics?.manufactureYear?.toString() || 'N/A',
          inspection.carBasics?.chassisNumber || 'N/A',
          inspection.carBasics?.engineNumber || 'N/A',
          inspection.carBasics?.registrationNumber || 'N/A',
          inspection.carBasics?.askingPrice ? formatCurrencyValue(inspection.carBasics.askingPrice) : 'N/A',
          inspection.carBasics?.tradeInValue ? formatCurrencyValue(inspection.carBasics.tradeInValue) : 'N/A'
        ]
      ];

      autoTable(doc, {
        head: carDetailsHeaders,
        body: carDetailsData,
        startY: 35, // Increased from 25
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Make
          1: { cellWidth: 25 }, // Model
          2: { cellWidth: 20 }, // Year
          3: { cellWidth: 30 }, // VIN
          4: { cellWidth: 30 }, // Engine
          5: { cellWidth: 25 }, // Registration
          6: { cellWidth: 25 }, // Asking Price
          7: { cellWidth: 25 }  // Trade-in Value
        }
      });

      // Add value assessment section
      addSectionHeader('Value Assessment');
      const valueData = [
        ['Asking Price', formatCurrencyValue(inspection.carBasics?.askingPrice)],
        ['Trade-in Value', formatCurrencyValue(inspection.carBasics?.tradeInValue)],
        ['Market Value', formatCurrencyValue(inspection.carBasics?.askingPrice)] // Changed from value to askingPrice
      ];

      // Value assessment table
      autoTable(doc, {
        body: valueData,
        theme: 'grid',
        styles: { 
          fontSize: 9,  // Reduced font size for better fit
          cellPadding: 4,
          halign: 'left',
          minCellHeight: 10
        },
        columnStyles: {
          0: { cellWidth: 90 },  // Increased for item text
          1: { cellWidth: 80 }   // Increased for values
        },
        margin: { left: 20, right: 20, top: 30 }  // Equal margins for proper centering
      });
      
      // Engine Inspection Section with Checklist
      doc.addPage();
      addSectionHeader('Engine Inspection');
      
      doc.setFontSize(11);
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 22, 190, 22);

      // Keep only one instance of these declarations
      const engineCheckHeaders = [
        ['Check Item', 'Status', 'Notes']
      ];
      
      const engineCheckData = [
        ['Bonnet opens easily', inspection.engineInspection?.checklist?.bonnetOpens?.checked ? 'Yes' : 'No', ''],
        ['Bonnet support/struts work', inspection.engineInspection?.checklist?.bonnetSupports?.checked ? 'Yes' : 'No', ''],
        ['Frame straight, no kinks', inspection.engineInspection?.checklist?.frameStraight?.checked ? 'Yes' : 'No', ''],
        ['No leaks (oil, coolant, transmission)', inspection.engineInspection?.checklist?.noLeaks?.checked ? 'Yes' : 'No', ''],
        ['Oil level good, no metal shavings/froth', inspection.engineInspection?.checklist?.oilLevelGood?.checked ? 'Yes' : 'No', ''],
        ['Coolant level and condition good', inspection.engineInspection?.checklist?.coolantGood?.checked ? 'Yes' : 'No', ''],
        ['Hoses, belts, battery in good condition', inspection.engineInspection?.checklist?.hosesAndBelts?.checked ? 'Yes' : 'No', ''],
        ['Overall Engine Condition', `${inspection.engineInspection?.score || 0}/5`, inspection.engineInspection?.notes || 'N/A']
      ];
      
      autoTable(doc, {
        head: engineCheckHeaders,
        body: engineCheckData,
        startY: 35, // Increased from 25
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },  // Wider column for item names
          1: { cellWidth: 30 },  // Status column
          2: { cellWidth: 65 }   // Notes column
        }
      });
      
      // Body Inspection Section with Photos
      doc.addPage();
      addSectionHeader('Body Inspection');
      let currentY = 45;
      
      if (inspection.photos?.bodyPhotos?.length) {
        currentY = await addPhotoGallery(doc, inspection.photos.bodyPhotos, 'Body Photos:', currentY);
      }
      
      // Add body inspection data
      const bodyHeaders = [['Inspection Item', 'Rating', 'Notes']];
      const bodyData = [
        ['Panel Gaps', `${inspection.bodyInspection?.panelGaps?.score || 0}/5`, inspection.bodyInspection?.panelGaps?.notes || 'N/A'],
        ['Paint & Seams', `${inspection.bodyInspection?.paintSeams?.score || 0}/5`, inspection.bodyInspection?.paintSeams?.notes || 'N/A'],
        ['Body Filler (Bondo)', `${inspection.bodyInspection?.bondo?.score || 0}/5`, inspection.bodyInspection?.bondo?.notes || 'N/A'],
        ['Rust', `${inspection.bodyInspection?.rust?.score || 0}/5`, inspection.bodyInspection?.rust?.notes || 'N/A'],
        ['Dents', `${inspection.bodyInspection?.dents?.score || 0}/5`, inspection.bodyInspection?.dents?.notes || 'N/A'],
        ['Scratches', `${inspection.bodyInspection?.scratches?.score || 0}/5`, inspection.bodyInspection?.scratches?.notes || 'N/A'],
        ['Repainting', `${inspection.bodyInspection?.repainting?.score || 0}/5`, inspection.bodyInspection?.repainting?.notes || 'N/A']
      ];
      
      autoTable(doc, {
        head: bodyHeaders,
        body: bodyData,
        startY: currentY,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },
          1: { cellWidth: 30 },
          2: { cellWidth: 65 }
        }
      });

      // Engine Inspection Section with Photos
      doc.addPage();
      addSectionHeader('Engine Inspection');
      currentY = 45;
      
      if (inspection.photos?.enginePhotos?.length) {
        currentY = await addPhotoGallery(doc, inspection.photos.enginePhotos, 'Engine Photos:', currentY);
      }
      
      // Add engine inspection data
      autoTable(doc, {
        head: engineCheckHeaders,
        body: engineCheckData,
        startY: currentY,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },  // Wider column for item names
          1: { cellWidth: 30 },  // Status column
          2: { cellWidth: 65 }   // Notes column
        }
      });

      // Interior Inspection Section with Photos
      doc.addPage();
      addSectionHeader('Interior Inspection');
      currentY = 45;
      
      if (inspection.photos?.interiorPhotos?.length) {
        currentY = await addPhotoGallery(doc, inspection.photos.interiorPhotos, 'Interior Photos:', currentY);
      }
      
      // Add interior inspection data
      const interiorHeaders = [
        ['Inspection Item', 'Rating', 'Notes']
      ];
      
      const interiorData = [
        ['Seats', `${inspection.interiorInspection?.seats?.score || 0}/5`, inspection.interiorInspection?.seats?.notes || 'N/A'],
        ['Carpet', `${inspection.interiorInspection?.carpet?.score || 0}/5`, inspection.interiorInspection?.carpet?.notes || 'N/A'],
        ['Trunk', `${inspection.interiorInspection?.trunk?.score || 0}/5`, inspection.interiorInspection?.trunk?.notes || 'N/A'],
        ['Headliner', `${inspection.interiorInspection?.headliner?.score || 0}/5`, inspection.interiorInspection?.headliner?.notes || 'N/A'],
        ['Electronics', `${inspection.interiorInspection?.electronics?.score || 0}/5`, inspection.interiorInspection?.electronics?.notes || 'N/A'],
        ['General Wear and Tear', `${inspection.interiorInspection?.wearAndTear?.score || 0}/5`, inspection.interiorInspection?.wearAndTear?.notes || 'N/A']
      ];
      
      autoTable(doc, {
        head: interiorHeaders,
        body: interiorData,
        startY: currentY,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },  // Wider column for item names
          1: { cellWidth: 30 },  // Rating column
          2: { cellWidth: 65 }   // Notes column
        }
      });

      // Wheel Inspection Section with Photos
      doc.addPage();
      addSectionHeader('Wheel Inspection');
      currentY = 45;
      
      if (inspection.photos?.wheelPhotos?.length) {
        currentY = await addPhotoGallery(doc, inspection.photos.wheelPhotos, 'Wheel Photos:', currentY);
      }
      
      // Add wheel inspection data
      const wheelHeaders = [
        ['Inspection Item', 'Rating', 'Notes']
      ];
      
      const wheelData = [
        ['Tread Wear', `${inspection.wheelInspection?.treadWear?.score || 0}/5`, inspection.wheelInspection?.treadWear?.notes || 'N/A'],
        ['Camber/Toe Angle', `${inspection.wheelInspection?.camberToeAngle?.score || 0}/5`, inspection.wheelInspection?.camberToeAngle?.notes || 'N/A'],
        ['Turn Lock to Lock', `${inspection.wheelInspection?.turnLockToLock?.score || 0}/5`, inspection.wheelInspection?.turnLockToLock?.notes || 'N/A'],
        ['Alignment', `${inspection.wheelInspection?.alignment?.score || 0}/5`, inspection.wheelInspection?.alignment?.notes || 'N/A']
      ];
      
      autoTable(doc, {
        head: wheelHeaders,
        body: wheelData,
        startY: currentY,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },
          1: { cellWidth: 30 },
          2: { cellWidth: 65 }
        }
      });

      // Undercar Inspection Section with Photos
      doc.addPage();
      addSectionHeader('Undercar Inspection');
      currentY = 45;
      
      if (inspection.photos?.undercarPhotos?.length) {
        currentY = await addPhotoGallery(doc, inspection.photos.undercarPhotos, 'Undercar Photos:', currentY);
      }
      
      // Add undercar inspection data
      const undercarHeaders = [
        ['Inspection Item', 'Rating', 'Notes']
      ];
      
      const undercarData = [
        ['Overall Undercarriage', `${inspection.undercarInspection?.score || 0}/5`, inspection.undercarInspection?.notes || 'N/A'],
        ['Leaks', `${inspection.undercarInspection?.leaks?.score || 0}/5`, inspection.undercarInspection?.leaks?.notes || 'N/A'],
        ['Rust', `${inspection.undercarInspection?.rust?.score || 0}/5`, inspection.undercarInspection?.rust?.notes || 'N/A'],
        ['Suspension', `${inspection.undercarInspection?.suspension?.score || 0}/5`, inspection.undercarInspection?.suspension?.notes || 'N/A'],
        ['Frame Damage', `${inspection.undercarInspection?.frameDamage?.score || 0}/5`, inspection.undercarInspection?.frameDamage?.notes || 'N/A']
      ];
      
      autoTable(doc, {
        head: undercarHeaders,
        body: undercarData,
        startY: currentY,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },
          1: { cellWidth: 30 },
          2: { cellWidth: 65 }
        }
      });
      
      // Add a new page for test drive, electronics/exterior checklists, and final notes
      doc.addPage();
      addSectionHeader('Test Drive');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 22, 190, 22);
      
      const testDriveHeaders = [
        ['Inspection Item', 'Rating', 'Notes']
      ];
      
      const testDriveData = [
        ['Acceleration', `${inspection.testDrive?.acceleration?.score || 0}/5`, inspection.testDrive?.acceleration?.notes || 'N/A'],
        ['Turning/Handling', `${inspection.testDrive?.turning?.score || 0}/5`, inspection.testDrive?.turning?.notes || 'N/A'],
        ['Braking', `${inspection.testDrive?.braking?.score || 0}/5`, inspection.testDrive?.braking?.notes || 'N/A'],
        ['Highway Performance', `${inspection.testDrive?.highway?.score || 0}/5`, inspection.testDrive?.highway?.notes || 'N/A'],
        ['City Performance', `${inspection.testDrive?.city?.score || 0}/5`, inspection.testDrive?.city?.notes || 'N/A']
      ];
      
      autoTable(doc, {
        head: testDriveHeaders,
        body: testDriveData,
        startY: 25,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 85 },
          1: { cellWidth: 30 },
          2: { cellWidth: 65 }
        }
      });

      // Electronics Checklist Section
      addSectionHeader('Electronics Checklist', extendedDoc.previousAutoTable?.finalY ? extendedDoc.previousAutoTable.finalY + 15 : 110);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(220, 220, 220);
      if (extendedDoc.previousAutoTable?.finalY) {
        doc.line(20, extendedDoc.previousAutoTable.finalY + 17, 190, extendedDoc.previousAutoTable.finalY + 17);
      }

      const electronicsHeaders = [
        ['Item', 'Status']
      ];
      
      const electronicsData = [
        ['Power Windows & Mirrors', inspection.electronicsChecklist?.powerWindowsMirrors?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Radio/Sound System', inspection.electronicsChecklist?.radio?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['AC & Heating', inspection.electronicsChecklist?.acHeat?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Navigation System', inspection.electronicsChecklist?.navigation?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Sunroof', inspection.electronicsChecklist?.sunroof?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Parking Sensors', inspection.electronicsChecklist?.parkingSensors?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Emergency Brake', inspection.electronicsChecklist?.emergencyBrake?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Dashboard Lights', inspection.electronicsChecklist?.dashboardLights?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Gauges', inspection.electronicsChecklist?.gauges?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Wipers', inspection.electronicsChecklist?.wipers?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Rearview Mirror', inspection.electronicsChecklist?.rearviewMirror?.checked ? 'Working' : 'Not Working/Not Checked']
      ];
      
      autoTable(doc, {
        head: electronicsHeaders,
        body: electronicsData,
        startY: extendedDoc.previousAutoTable?.finalY ? extendedDoc.previousAutoTable.finalY + 20 : 115,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60 }
        }
      });

      // Exterior Lights Checklist Section
      addSectionHeader('Exterior Lights Checklist', extendedDoc.previousAutoTable?.finalY ? extendedDoc.previousAutoTable.finalY + 15 : 200);
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(220, 220, 220);
      if (extendedDoc.previousAutoTable?.finalY) {
        doc.line(20, extendedDoc.previousAutoTable.finalY + 17, 190, extendedDoc.previousAutoTable.finalY + 17);
      }

      const exteriorHeaders = [
        ['Item', 'Status']
      ];
      
      const exteriorData = [
        ['High/Low Beam Headlights', inspection.exteriorChecklist?.highLowBeams?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Fog Lights', inspection.exteriorChecklist?.fogLights?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Turn Signals', inspection.exteriorChecklist?.turnSignals?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Brake Lights', inspection.exteriorChecklist?.brakeLights?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Reverse Lights', inspection.exteriorChecklist?.reverseLights?.checked ? 'Working' : 'Not Working/Not Checked'],
        ['Hazard Lights', inspection.exteriorChecklist?.hazardLights?.checked ? 'Working' : 'Not Working/Not Checked']
      ];
      
      autoTable(doc, {
        head: exteriorHeaders,
        body: exteriorData,
        startY: extendedDoc.previousAutoTable?.finalY ? extendedDoc.previousAutoTable.finalY + 20 : 205,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60 }
        }
      });

      // Add Interior Items Checklist section after Electronics Checklist
      addSectionHeader('Interior Items Inspection', extendedDoc.previousAutoTable?.finalY ? extendedDoc.previousAutoTable.finalY + 15 : 280);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(220, 220, 220);
      if (extendedDoc.previousAutoTable?.finalY) {
        doc.line(20, extendedDoc.previousAutoTable.finalY + 17, 190, extendedDoc.previousAutoTable.finalY + 17);
      }

      const interiorItemsHeaders = [
        ['Item', 'Status']
      ];

      const interiorItemsData = [
        ['No Rust Under Carpets', inspection.interiorChecklist?.carpetRust?.checked ? 'Pass' : 'Issue Found/Not Checked'],
        ['No Dampness Under Carpets', inspection.interiorChecklist?.carpetDampness?.checked ? 'Pass' : 'Issue Found/Not Checked'],
        ['Spare Tire Present and Good', inspection.interiorChecklist?.spareTire?.checked ? 'Present' : 'Missing/Not Checked'],
        ['Jack and Lug Wrench Present', inspection.interiorChecklist?.jackLugWrench?.checked ? 'Present' : 'Missing/Not Checked']
      ];

      autoTable(doc, {
        head: interiorItemsHeaders,
        body: interiorItemsData,
        startY: extendedDoc.previousAutoTable?.finalY ? extendedDoc.previousAutoTable.finalY + 20 : 285,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60 }
        }
      });

      // Owner Questions Section
      doc.addPage();
      addSectionHeader('Owner Questions');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(220, 220, 220);
      doc.line(20, 22, 190, 22);
      
      const ownerQuestionsHeaders = [
        ['Question', 'Response']
      ];
      
      const ownerQuestionsData = [
        ['How long have you owned the car?', inspection.ownerQuestions?.ownershipDuration || 'N/A'],
        ['Why are you selling?', inspection.ownerQuestions?.sellingReason || 'N/A'],
        ['Problems or issues with the car?', inspection.ownerQuestions?.problemsIssues || 'N/A'],
        ['Service Records & Maintenance', inspection.ownerQuestions?.serviceRecords || 'N/A'],
        ['Car Usage', inspection.ownerQuestions?.carUsage || 'N/A'],
        ['Yearly Mileage', inspection.ownerQuestions?.mileageAdded || 'N/A'],
        ['Next Car Plans', inspection.ownerQuestions?.nextCarPlan || 'N/A']
      ];
      
      autoTable(doc, {
        head: ownerQuestionsHeaders,
        body: ownerQuestionsData,
        startY: 25,
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 10,
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 90 },
          1: { cellWidth: 90 }
        }
      });
      
      // Final Assessment Section - Start on new page
      doc.addPage();
      addSectionHeader('Final Assessment and Recommendations');
      
      // Add comprehensive assessment
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text('Overall Vehicle Assessment:', 20, 40);
      
      // Format overall assessment with proper spacing
      const splitAssessment = doc.splitTextToSize(overallAssessment, 170);
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(splitAssessment, 20, 55);

      // Add section-by-section recommendations
      let yPos = 85;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 51, 102);
      doc.text('Detailed Section Recommendations:', 20, yPos);
      yPos += 15;

      Object.entries(averageRatings).forEach(([section, rating]) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 30;
        }

        const sectionName = section.replace('Inspection', '').replace(/([A-Z])/g, ' $1').trim();
        const sectionKey = `${section}Inspection` as keyof CarInspection;
        const sectionDetails = inspection[sectionKey];
        
        // Add section title with rating
        doc.setFontSize(11);
        doc.setTextColor(0, 51, 102);
        doc.text(`${sectionName} (${rating.toFixed(1)}/5):`, 20, yPos);
        
        // Add recommendation with proper spacing
        const recommendation = getDetailedRecommendation(section, rating, sectionDetails);
        const splitRecommendation = doc.splitTextToSize(recommendation, 165);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(splitRecommendation, 25, yPos + 8);
        
        // Update yPos based on text length
        yPos += 10 + (splitRecommendation.length * 5);
        yPos += 8; // Add extra spacing between sections
      });

      // Add inspector's final notes on a new page
      doc.addPage();
      addSectionHeader('Inspector\'s Final Notes');
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const finalNotes = inspection.finalNotes || 'No additional notes provided.';
      const splitNotes = doc.splitTextToSize(finalNotes, 170);
      doc.text(splitNotes, 20, 40);

      // Enhanced footer for all pages
      const pageCount = doc.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(240, 240, 240);
        doc.rect(0, 275, 210, 22, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Inspection Date: ${new Date(inspection.date).toLocaleDateString()}`, 20, 285);
        doc.text(`Page ${i} of ${pageCount}`, 180, 285);
        if (inspection.inspector?.company) {
          doc.text(inspection.inspector.company, 105, 285, { align: 'center' });
        }
      }
      
      // Save the PDF with a timestamp to avoid caching issues
      const timestamp = new Date().getTime();
      const fileName = `${inspection.carBasics?.make || 'Vehicle'}_${inspection.carBasics?.model || ''}_Inspection_${timestamp}.pdf`;
      doc.save(fileName);
      
      deductDownload();
      setLoading(false);
      console.log("PDF generation completed");
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError('Failed to generate report. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className={`text-2xl font-bold ${getTextColor('primary')} mb-4`}>Complete Inspection Report</h2>
      
      <div className={`${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-surface-default border-background-dark'} p-6 rounded-lg shadow-sm border`}>
        <h3 className={`font-medium text-lg mb-4 ${getTextColor('primary')}`}>Overall Assessment</h3>
        <p className={`text-sm ${getTextColor('secondary')}`}>{overallAssessment}</p>
        
        {/* Individual Section Ratings */}
        <div className="mt-8">
          <h3 className={`font-medium text-lg mb-4 ${getTextColor('primary')}`}>Section Ratings</h3>
          <div className="space-y-6">
            {Object.entries(averageRatings).map(([section, rating]) => {
              const sectionName = section.replace('Inspection', '').replace(/([A-Z])/g, ' $1').trim();
              const sectionKey = `${section}Inspection` as keyof CarInspection;
              const sectionDetails = inspection[sectionKey];
              
              return (
                <div key={section} className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-surface-default border-background-dark'} p-4 rounded-lg border`}>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className={`font-medium ${getTextColor('primary')}`}>{sectionName}</h4>
                    <div className="flex items-center">
                      <span className="font-bold" style={{ color: getRatingColor(rating) }}>
                        {rating.toFixed(1)}
                      </span>
                      <span className={`${getTextColor('secondary')} text-sm`}>/5</span>
                    </div>
                  </div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} h-2 rounded-full mb-3`}>
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${(rating / 5) * 100}%`,
                        backgroundColor: getRatingColor(rating)
                      }}
                    ></div>
                  </div>
                  <p className={`text-sm ${getTextColor('secondary')}`}>
                    {getDetailedRecommendation(section, rating, sectionDetails)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-900 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      <div className="mt-6 flex gap-4">
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Report...
            </>
          ) : (
            <>
              Download Report
              {getRemainingDownloads() > 0 && (
                <span className="ml-2 text-sm">
                  ({getRemainingDownloads()} remaining)
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {showPurchaseDialog && (
        <PurchaseDialog
          onClose={() => setShowPurchaseDialog(false)}
          onSuccess={() => {
            setShowPurchaseDialog(false);
            generateReport();
          }}
        />
      )}
    </div>
  );
}