import { useState, useRef, useEffect } from 'react';
import { compressImage } from '../utils/storageManager';

interface PhotoUploadProps {
  sectionName: string;
  existingPhotos?: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ sectionName, existingPhotos = [], onPhotosChange, maxPhotos = 8 }: PhotoUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeThumbnail, setActiveThumbnail] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Close active thumbnail when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (activeThumbnail !== null && !(event.target as Element)?.closest('.thumbnail-container')) {
        setActiveThumbnail(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeThumbnail]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement> | null, droppedFiles?: FileList) => {
    const files = event?.target?.files || droppedFiles;
    if (!files?.length) return;
    
    setIsLoading(true);

    try {
      const newPhotos: string[] = [];
      const filesArray = Array.from(files);
      const totalPhotos = existingPhotos.length + filesArray.length;

      if (totalPhotos > maxPhotos) {
        alert(`Maximum ${maxPhotos} photos allowed per section. Only the first ${maxPhotos - existingPhotos.length} will be added.`);
        // Take only what we can fit
        filesArray.splice(maxPhotos - existingPhotos.length);
      }

      for (const file of filesArray) {
        if (!file.type.startsWith('image/')) {
          console.warn('Skipping non-image file:', file.name);
          continue;
        }

        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onloadend = async () => {
            if (typeof reader.result === 'string') {
              try {
                // Compress the image before saving
                const compressed = await compressImage(reader.result);
                newPhotos.push(compressed);
              } catch (err) {
                console.error('Error compressing image:', err);
              }
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      onPhotosChange([...existingPhotos, ...newPhotos]);
    } catch (error) {
      console.error('Error processing photos:', error);
      alert('Error processing photos. Please try again.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setDragActive(false);
    }
  };

  const handleRemovePhoto = (index: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    const updatedPhotos = existingPhotos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
    if (activeThumbnail === index) {
      setActiveThumbnail(null);
    } else if (activeThumbnail !== null && activeThumbnail > index) {
      setActiveThumbnail(activeThumbnail - 1);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handlePhotoUpload(null, e.dataTransfer.files);
    }
    setDragActive(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const canAddMorePhotos = existingPhotos.length < maxPhotos;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h3 className="text-sm font-medium text-text-primary">{sectionName} Photos ({existingPhotos.length}/{maxPhotos})</h3>
          <p className="text-xs text-text-secondary">
            {canAddMorePhotos 
              ? `Add up to ${maxPhotos - existingPhotos.length} more photos`
              : `Maximum number of photos reached (${maxPhotos})`}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={triggerFileInput}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isLoading || !canAddMorePhotos}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isLoading ? 'Processing...' : 'Upload Photos'}
          </button>
          <button
            type="button"
            onClick={triggerFileInput}
            aria-label="Take photo with camera"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isLoading || !canAddMorePhotos}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handlePhotoUpload(e)}
            className="hidden"
            disabled={isLoading || !canAddMorePhotos}
            aria-label="Upload photos"
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${!canAddMorePhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={canAddMorePhotos ? handleDrag : undefined}
        onDragOver={canAddMorePhotos ? handleDrag : undefined}
        onDragLeave={canAddMorePhotos ? handleDrag : undefined}
        onDrop={canAddMorePhotos ? handleDrop : undefined}
        onClick={canAddMorePhotos ? triggerFileInput : undefined}
      >
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium text-blue-500">Processing images...</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">
                {canAddMorePhotos 
                  ? 'Drag & drop photos here or click to upload' 
                  : 'Maximum number of photos reached'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {canAddMorePhotos && `You can upload up to ${maxPhotos - existingPhotos.length} more photos`}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      {existingPhotos.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {existingPhotos.map((photo, index) => (
              <div 
                key={index} 
                className={`relative group thumbnail-container aspect-square rounded-lg overflow-hidden shadow-sm border ${
                  activeThumbnail === index 
                    ? 'ring-2 ring-blue-500 border-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveThumbnail(activeThumbnail === index ? null : index)}
              >
                <img
                  src={photo}
                  alt={`${sectionName} photo ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <button
                  onClick={(e) => handleRemovePhoto(index, e)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  {index + 1}/{existingPhotos.length}
                </div>
              </div>
            ))}
          </div>

          {/* Modal for active thumbnail */}
          {activeThumbnail !== null && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setActiveThumbnail(null)}>
              <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-xl p-2" onClick={(e) => e.stopPropagation()}>
                <img 
                  src={existingPhotos[activeThumbnail]} 
                  alt={`${sectionName} photo ${activeThumbnail + 1}`} 
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button 
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    onClick={() => setActiveThumbnail((activeThumbnail - 1 + existingPhotos.length) % existingPhotos.length)}
                    aria-label="Previous photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    onClick={() => setActiveThumbnail((activeThumbnail + 1) % existingPhotos.length)}
                    aria-label="Next photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button 
                    className="p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
                    onClick={() => handleRemovePhoto(activeThumbnail)}
                    aria-label="Delete photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button 
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    onClick={() => setActiveThumbnail(null)}
                    aria-label="Close preview"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
                  {activeThumbnail + 1} / {existingPhotos.length}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}