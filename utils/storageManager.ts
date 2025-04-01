const MAX_PHOTOS_SIZE = 5 * 1024 * 1024; // 5MB limit for photos
const MAX_INSPECTION_SIZE = 10 * 1024 * 1024; // 10MB total limit

export const compressImage = async (base64String: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions (max 800px width/height)
      let width = img.width;
      let height = img.height;
      const maxSize = 800;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      // Compress to JPEG with 0.7 quality
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = base64String;
  });
};

export const saveInspection = async (inspection: any) => {
  try {
    // Deep clone inspection to modify photos
    const inspectionToSave = JSON.parse(JSON.stringify(inspection));
    
    // Compress photos if they exist
    if (inspectionToSave.photos) {
      for (const section in inspectionToSave.photos) {
        if (Array.isArray(inspectionToSave.photos[section])) {
          const compressedPhotos = await Promise.all(
            inspectionToSave.photos[section].map((photo: string) => compressImage(photo))
          );
          inspectionToSave.photos[section] = compressedPhotos;
        }
      }
    }
    
    // Calculate size
    const inspectionString = JSON.stringify(inspectionToSave);
    const size = new Blob([inspectionString]).size;
    
    if (size > MAX_INSPECTION_SIZE) {
      throw new Error('Inspection data exceeds maximum size limit');
    }
    
    // Clear old data if needed
    try {
      localStorage.setItem('currentInspection', inspectionString);
    } catch (e) {
      // If storage is full, clear old history
      const history = JSON.parse(localStorage.getItem('inspectionHistory') || '[]');
      if (history.length > 0) {
        history.shift(); // Remove oldest inspection
        localStorage.setItem('inspectionHistory', JSON.stringify(history));
        localStorage.setItem('currentInspection', inspectionString);
      } else {
        throw e;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to save inspection:', error);
    return false;
  }
};

export const loadInspection = () => {
  try {
    const savedInspection = localStorage.getItem('currentInspection');
    return savedInspection ? JSON.parse(savedInspection) : null;
  } catch (error) {
    console.error('Failed to load inspection:', error);
    return null;
  }
};
