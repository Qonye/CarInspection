/**
 * Utility functions for generating recommendations based on inspection ratings
 */

export interface RecommendationConfig {
  category: string;
  thresholds: {
    [key: number]: string;
  };
  defaultMessage?: string;
}

/**
 * Recommendation templates for different inspection categories
 */
export const recommendationTemplates: { [key: string]: RecommendationConfig } = {
  bodyInspection: {
    category: "Body",
    thresholds: {
      5: "Body in excellent condition with minimal wear. No immediate action required.",
      4: "Body is in very good condition with minor wear consistent with vehicle age. No significant issues detected.",
      3: "Body shows normal wear for vehicle age. Consider touch-up paint for minor scratches.",
      2: "Several body issues require attention. Recommend professional body assessment.",
      1: "Significant body issues detected. Immediate professional repair recommended.",
      0: "Major structural concerns identified. Not recommended for purchase without extensive repairs."
    }
  },
  
  engineInspection: {
    category: "Engine",
    thresholds: {
      5: "Engine performs excellently. Continue regular maintenance schedule.",
      4: "Engine operates very well with no significant issues. Follow manufacturer's maintenance recommendations.",
      3: "Engine shows normal wear. Recommend standard service within next 3 months.",
      2: "Engine requires attention. Consider professional diagnostics and tune-up.",
      1: "Significant engine issues detected. Budget for repairs in the near future.",
      0: "Critical engine problems identified. Major repair or replacement likely needed."
    }
  },
  
  wheelInspection: {
    category: "Wheels & Tires",
    thresholds: {
      5: "Tires in excellent condition with proper tread depth and alignment.",
      4: "Tires show minimal wear with good overall condition.",
      3: "Tires show normal wear. Rotation recommended within 5,000 miles.",
      2: "Uneven wear detected. Alignment and balance recommended.",
      1: "Tires require replacement. Budget for new set within 3 months.",
      0: "Immediate tire replacement necessary for safe operation."
    }
  },
  
  interiorInspection: {
    category: "Interior",
    thresholds: {
      5: "Interior in excellent condition with no notable wear or issues.",
      4: "Interior very well maintained with minimal wear consistent with vehicle age.",
      3: "Interior shows normal wear. Consider professional cleaning for optimal appearance.",
      2: "Interior has several issues that require attention or repair.",
      1: "Significant interior wear or damage detected. Budget for repairs or refurbishment.",
      0: "Extensive interior damage. Major restoration required."
    }
  },
  
  undercarInspection: {
    category: "Undercarriage",
    thresholds: {
      5: "Undercarriage in excellent condition. No signs of leaks or damage.",
      4: "Undercarriage well maintained with normal wear for vehicle age.",
      3: "Minor undercarriage issues noted. Recommend preventative maintenance.",
      2: "Several undercarriage concerns identified. Professional inspection recommended.",
      1: "Significant undercarriage issues detected. Repairs needed in the near term.",
      0: "Severe undercarriage problems. Immediate attention required for safety."
    }
  },
  
  testDrive: {
    category: "Performance",
    thresholds: {
      5: "Vehicle performs exceptionally well in all driving conditions.",
      4: "Very good overall performance with no significant concerns.",
      3: "Vehicle performs adequately. Minor driving characteristics require attention.",
      2: "Performance issues detected. Professional assessment recommended.",
      1: "Significant performance problems. Major service likely required.",
      0: "Serious drivability concerns. Not recommended for regular use without repairs."
    }
  }
};

/**
 * Calculate the average rating for a section with multiple ratings
 * @param ratings Object containing multiple rating items
 * @returns Average rating rounded to nearest 0.5
 */
export function calculateAverageRating(ratings: { [key: string]: { score: number, notes: string } }): number {
  const validRatings = Object.values(ratings).filter(r => r.score >= 0);
  if (validRatings.length === 0) return 0;
  
  const sum = validRatings.reduce((total, rating) => total + rating.score, 0);
  const average = sum / validRatings.length;
  
  // Round to nearest 0.5
  return Math.round(average * 2) / 2;
}

/**
 * Get an appropriate recommendation based on a rating value
 * @param category The inspection category
 * @param rating The rating value (0-5)
 * @returns Recommendation string
 */
export function getTemplateRecommendation(category: string, rating: number): string {
  const template = recommendationTemplates[category];
  if (!template) return "No recommendation available.";
  
  // Round down to nearest whole number for thresholds
  const ratingKey = Math.floor(rating);
  
  // Find the threshold that matches this rating
  let recommendation = template.thresholds[ratingKey] || template.defaultMessage;
  
  if (!recommendation) {
    // Find the closest threshold if exact match not found
    const thresholds = Object.keys(template.thresholds).map(Number).sort((a, b) => a - b);
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (thresholds[i] <= ratingKey) {
        recommendation = template.thresholds[thresholds[i]];
        break;
      }
    }
    
    if (!recommendation) {
      recommendation = template.thresholds[thresholds[0]] || "No specific recommendation available.";
    }
  }
  
  return recommendation;
}

/**
 * Generate an overall vehicle assessment based on all inspection areas
 * @param averageRatings Object with average ratings for each inspection area
 * @returns Overall assessment text
 */
export function generateOverallAssessment(averageRatings: { [key: string]: number }): string {
  const overallAverage = Object.values(averageRatings).reduce((sum, rating) => sum + rating, 0) / 
                         Object.values(averageRatings).length;
  
  if (overallAverage >= 4.5) {
    return "Excellent condition vehicle. Minimal issues detected. Recommended purchase with high confidence.";
  } else if (overallAverage >= 3.5) {
    return "Very good condition vehicle. Minor issues noted. Recommended purchase after addressing minor concerns.";
  } else if (overallAverage >= 2.5) {
    return "Average condition vehicle. Several issues require attention. Consider purchase after professional assessment of noted concerns.";
  } else if (overallAverage >= 1.5) {
    return "Below average condition. Significant issues detected. Purchase only recommended after addressing major concerns and negotiating accordingly.";
  } else {
    return "Poor condition vehicle. Major issues in multiple areas. Not recommended for purchase without extensive repairs.";
  }
}

/**
 * Get color code based on a rating
 * @param rating Rating value (0-5)
 * @returns Hex color code
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4) return "#4CAF50"; // Green
  if (rating >= 3) return "#8BC34A"; // Light Green
  if (rating >= 2) return "#FFC107"; // Amber
  if (rating >= 1) return "#FF9800"; // Orange
  return "#F44336"; // Red
}

export const getRatingColorClass = (rating: number): string => {
  if (rating === -1) return 'bg-gray-200 text-gray-700';
  switch (rating) {
    case 1: return 'bg-red-100 text-red-800';
    case 2: return 'bg-orange-100 text-orange-800';
    case 3: return 'bg-yellow-100 text-yellow-800';
    case 4: return 'bg-lime-100 text-lime-800';
    case 5: return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getRatingText = (rating: number): string => {
  if (rating === -1) return 'N/A';
  switch (rating) {
    case 1: return 'Poor';
    case 2: return 'Fair';
    case 3: return 'Good';
    case 4: return 'Very Good';
    case 5: return 'Excellent';
    default: return 'Not Rated';
  }
};

export const getRecommendation = (section: string, rating: number): string => {
  const sectionName = section.replace('Inspection', '').toLowerCase();
  
  switch(sectionName) {
    case 'body':
      if (rating >= 4.5) {
        return 'The body is in excellent condition with no significant cosmetic issues. Paint finish is consistent and well-maintained, with proper panel gaps and no signs of previous repairs.';
      } else if (rating >= 3.5) {
        return 'The body shows minor wear consistent with age. May have small scratches or dings that can be easily addressed. Panel alignment is generally good with no major structural concerns.';
      } else if (rating >= 2.5) {
        return 'The body shows noticeable wear and may require some cosmetic repairs. There could be minor rust spots, dents, or paint issues that need attention.';
      } else {
        return 'The body condition is poor and requires significant repairs. May have extensive rust, major dents, or serious structural issues that need professional attention.';
      }
    
    case 'wheel':
      if (rating >= 4.5) {
        return 'Wheels and tires are in excellent condition with even wear patterns. Alignment is perfect with no vibration issues.';
      } else if (rating >= 3.5) {
        return 'Wheels and tires show normal wear but are still in good condition. Minor alignment adjustments may be needed.';
      } else if (rating >= 2.5) {
        return 'Tires show uneven wear patterns and may need replacement soon. Alignment issues should be addressed.';
      } else {
        return 'Immediate attention needed for wheels/tires. May have serious alignment issues or require complete replacement.';
      }
    
    case 'interior':
      if (rating >= 4.5) {
        return 'Interior is immaculate with no significant wear. All features and controls function perfectly.';
      } else if (rating >= 3.5) {
        return 'Interior shows minor wear consistent with age. Most features work well with only minor issues.';
      } else if (rating >= 2.5) {
        return 'Interior has noticeable wear and may need some repairs. Some features may not work properly.';
      } else {
        return 'Interior requires significant restoration. Multiple features may not work and materials show heavy wear.';
      }
    
    case 'engine':
      if (rating >= 4.5) {
        return 'Engine performs excellently with no issues. Regular maintenance has been well documented.';
      } else if (rating >= 3.5) {
        return 'Engine runs well with only minor issues. May need routine maintenance or minor repairs.';
      } else if (rating >= 2.5) {
        return 'Engine shows signs of wear and may need attention soon. Some performance issues noted.';
      } else {
        return 'Engine requires immediate attention. Major repairs may be needed to ensure safe operation.';
      }

    case 'undercar':
      if (rating >= 4.5) {
        return 'Undercarriage is in excellent condition with no rust or damage. All components are well-maintained.';
      } else if (rating >= 3.5) {
        return 'Undercarriage shows normal wear. Minor surface rust may be present but no structural concerns.';
      } else if (rating >= 2.5) {
        return 'Some rust and wear visible on undercarriage. May need repairs to suspension or other components.';
      } else {
        return 'Significant rust or damage to undercarriage. Major repairs needed to ensure vehicle safety.';
      }

    case 'testdrive':
      if (rating >= 4.5) {
        return 'Vehicle performs exceptionally well in all driving conditions. No mechanical or handling issues detected.';
      } else if (rating >= 3.5) {
        return 'Good overall performance with minor quirks. Some minor adjustments may improve driving experience.';
      } else if (rating >= 2.5) {
        return 'Several performance issues noted during test drive. Professional inspection recommended.';
      } else {
        return 'Significant performance issues detected. Major repairs likely needed before safe operation.';
      }
    
    default:
      return 'No specific recommendation available for this section.';
  }
};
