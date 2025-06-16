import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { CarInspection, InspectionPhotos, ChecklistItem } from '../types/inspection';
import RatingInput from './RatingInput';
import PDFPreview from './PDFPreview';
import EnhancedReportGenerator from './EnhancedReportGenerator';
import PhotoUpload from './PhotoUpload';
import { saveInspection, loadInspection } from '../utils/storageManager';
import { commonCurrencies, detectUserCurrency, formatCurrency, CurrencyOption } from '../utils/currency';
import Link from 'next/link';

export default function InspectionForm() {
  const [inspection, setInspection] = useState<Partial<CarInspection>>({
    date: new Date().toISOString(),
    status: 'draft',
    id: crypto.randomUUID(),
    inspector: {
      name: '',
      company: '',
    },
    ownerQuestions: {
      ownershipDuration: '',
      sellingReason: '',
      problemsIssues: '',
      serviceRecords: '',
      carUsage: '',
      mileageAdded: '',
      nextCarPlan: '',
    },
    carBasics: {
      make: '',
      model: '',
      manufactureYear: new Date().getFullYear(),
      chassisNumber: '',
      engineNumber: '',
      registrationNumber: '',
      mileage: 0,
      mileageUnit: 'km',
      engineSize: 0,
      transmission: 'manual',
      fuel: 'petrol',
      askingPrice: 0,
      tradeInValue: 0,
      currency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    },
    bodyInspection: {
      panelGaps: { score: 0, notes: '' },
      paintSeams: { score: 0, notes: '' },
      bondo: { score: 0, notes: '' },
      rust: { score: 0, notes: '' },
      dents: { score: 0, notes: '' },
      scratches: { score: 0, notes: '' },
      repainting: { score: 0, notes: '' },
    },
    wheelInspection: {
      treadWear: { score: 0, notes: '' },
      camberToeAngle: { score: 0, notes: '' },
      turnLockToLock: { score: 0, notes: '' },
      alignment: { score: 0, notes: '' },
    },
    interiorInspection: {
      seats: { score: 0, notes: '' },
      carpet: { score: 0, notes: '' },
      trunk: { score: 0, notes: '' },
      headliner: { score: 0, notes: '' },
      electronics: { score: 0, notes: '' },
      wearAndTear: { score: 0, notes: '' },
    },
    testDrive: {
      acceleration: { score: 0, notes: '' },
      turning: { score: 0, notes: '' },
      braking: { score: 0, notes: '' },
      highway: { score: 0, notes: '' },
      city: { score: 0, notes: '' },
    },
    engineInspection: { 
      score: 0, 
      notes: '',
      checklist: {
        bonnetOpens: { checked: false },
        bonnetSupports: { checked: false },
        frameStraight: { checked: false },
        noLeaks: { checked: false },
        oilLevelGood: { checked: false },
        coolantGood: { checked: false },
        hosesAndBelts: { checked: false }
      }
    },
    undercarInspection: { 
      score: 0, 
      notes: '',
      leaks: { score: 0, notes: '' },
      rust: { score: 0, notes: '' },
      suspension: { score: 0, notes: '' },
      frameDamage: { score: 0, notes: '' },
    },
    electronicsChecklist: {
      powerWindowsMirrors: { checked: false },
      radio: { checked: false },
      acHeat: { checked: false },
      navigation: { checked: false },
      sunroof: { checked: false },
      parkingSensors: { checked: false },
      emergencyBrake: { checked: false },
      dashboardLights: { checked: false },
      gauges: { checked: false },
      wipers: { checked: false },
      rearviewMirror: { checked: false },
    },
    exteriorChecklist: {
      highLowBeams: { checked: false },
      fogLights: { checked: false },
      turnSignals: { checked: false },
      brakeLights: { checked: false },
      reverseLights: { checked: false },
      hazardLights: { checked: false }
    },
    interiorChecklist: {
      carpetRust: { checked: false },
      carpetDampness: { checked: false },
      spareTire: { checked: false },
      jackLugWrench: { checked: false }
    },
    exteriorInspection: {
      score: 0,
      notes: ''
    },
    finalNotes: '',
    photos: {
      bodyPhotos: [],
      wheelPhotos: [],
      interiorPhotos: [],
      enginePhotos: [],
      undercarPhotos: [],
      exteriorPhotos: []
    }
  });

  const [currentSection, setCurrentSection] = useState('basics');
  const [isComplete, setIsComplete] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(commonCurrencies[0]);
  const [sectionStatus, setSectionStatus] = useState<Record<string, 'completed' | 'skipped' | 'pending'>>({
    inspector: 'pending',
    basics: 'pending',
    questions: 'pending',
    body: 'pending',
    wheels: 'pending',
    interior: 'pending',
    exterior: 'pending',
    engine: 'pending',
    undercar: 'pending',
    testdrive: 'pending',
    finalnotes: 'pending'
  });

  // Add currency detection on mount
  useEffect(() => {
    detectUserCurrency().then(currency => {
      setSelectedCurrency(currency);
      // Update inspection state with detected currency
      setInspection(prev => ({
        ...prev,
        carBasics: {
          ...prev.carBasics!,
          currency: currency
        }
      }));
    });
  }, []);

  // Load saved inspection from localStorage on mount
  useEffect(() => {
    const savedInspection = loadInspection();
    if (savedInspection) {
      try {
        setInspection(savedInspection);
        if (savedInspection.status === 'completed') {
          setIsComplete(true);
        }
      } catch (error) {
        console.error("Failed to parse saved inspection:", error);
      }
    }
  }, []);

  // Save inspection to localStorage whenever it changes
  useEffect(() => {
    saveInspection(inspection).catch(error => {
      console.error("Failed to save inspection:", error);
      // Optionally show a notification to the user
    });
  }, [inspection]);

  // Event handlers with proper type definitions
  const handleBasicInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
    if (['manufactureYear', 'value', 'askingPrice', 'tradeInValue'].includes(name)) {
      processedValue = value !== '' ? Number(value) : 0;
    }
    
    setInspection(prev => ({
      ...prev,
      carBasics: {
        ...prev.carBasics!,
        [name]: processedValue
      }
    }));
  };

  const handleInspectorInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInspection(prev => ({
      ...prev,
      inspector: {
        ...prev.inspector!,
        [name]: value
      }
    }));
  };

  const handleOwnerQuestionsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInspection(prev => ({
      ...prev,
      ownerQuestions: {
        ...prev.ownerQuestions!,
        [name]: value
      }
    }));
  };

  const handleRatingChange = (section: keyof CarInspection, item: string, rating: number, notes: string) => {
    setInspection(prev => {
      if (['bodyInspection', 'wheelInspection', 'interiorInspection', 'testDrive'].includes(section)) {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as object || {}),
            [item]: {
              score: rating,
              notes
            }
          }
        };
      }
      
      if (section === 'undercarInspection' && item) {
        const undercar = prev.undercarInspection || { 
          score: 0, 
          notes: '',
          leaks: { score: 0, notes: '' },
          rust: { score: 0, notes: '' },
          suspension: { score: 0, notes: '' },
          frameDamage: { score: 0, notes: '' }
        };
        
        return {
          ...prev,
          undercarInspection: item === 'overall' 
            ? { ...undercar, score: rating, notes }
            : { ...undercar, [item]: { score: rating, notes } }
        };
      }
      
      if (section === 'engineInspection') {
        return {
          ...prev,
          engineInspection: {
            ...(prev.engineInspection || {}),
            score: rating,
            notes,
            checklist: prev.engineInspection?.checklist || {
              bonnetOpens: { checked: false },
              bonnetSupports: { checked: false },
              frameStraight: { checked: false },
              noLeaks: { checked: false },
              oilLevelGood: { checked: false },
              coolantGood: { checked: false },
              hosesAndBelts: { checked: false }
            }
          }
        };
      }
      
      return {
        ...prev,
        [section]: {
          ...(prev[section] as object || {}),
          score: rating,
          notes
        }
      };
    });
  };

  const handleCheckboxChange = (section: keyof CarInspection, item: string, checked: boolean) => {
    setInspection(prev => {
      if (section === 'engineInspection' && item) {
        const engineInspection = prev.engineInspection || { 
          score: 0, 
          notes: '', 
          checklist: {
            bonnetOpens: { checked: false },
            bonnetSupports: { checked: false },
            frameStraight: { checked: false },
            noLeaks: { checked: false },
            oilLevelGood: { checked: false },
            coolantGood: { checked: false },
            hosesAndBelts: { checked: false }
          }
        };
        
        return {
          ...prev,
          engineInspection: {
            ...engineInspection,
            checklist: {
              ...engineInspection.checklist,
              [item]: { checked }
            }
          }
        };
      }
      
      const sectionData = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...(sectionData as object),
          [item]: { checked }
        }
      };
    });
  };

  const handlePhotoChange = (section: keyof InspectionPhotos, photos: string[]) => {
    setInspection(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [section]: photos
      }
    }));
  };

  const handleFinalNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInspection(prev => ({
      ...prev,
      finalNotes: e.target.value
    }));
  };

  const handleComplete = () => {
    if (!inspection.inspector?.name?.trim()) {
      alert('Please fill in at least the inspector name before completing.');
      setCurrentSection('inspector');
      return;
    }

    if (!inspection.carBasics?.make?.trim() && !inspection.carBasics?.model?.trim()) {
      alert('Please fill in at least the car make or model before completing.');
      setCurrentSection('basics');
      return;
    }
    
    const updatedStatus = { ...sectionStatus };
    Object.keys(updatedStatus).forEach(section => {
      if (updatedStatus[section] === 'pending') {
        updatedStatus[section] = 'skipped';
      }
    });
    setSectionStatus(updatedStatus);

    setInspection(prev => ({ ...prev, status: 'completed' }));
    setIsComplete(true);
  };

  const handleSaveDraft = () => {
    setInspection(prev => ({ ...prev, status: 'draft' }));
    alert('Inspection saved as draft.');
  };

  const startNewInspection = () => {
    if (confirm('Are you sure you want to start a new inspection? Current progress will be saved to history.')) {
      const history = JSON.parse(localStorage.getItem('inspectionHistory') || '[]');
      if (inspection.id) {
        const completedInspection = {
          ...inspection,
          status: 'completed'
        };
        history.push(completedInspection);
        localStorage.setItem('inspectionHistory', JSON.stringify(history));
      }

      setInspection({
        date: new Date().toISOString(),
        status: 'draft',
        id: crypto.randomUUID(),
        inspector: { name: inspection.inspector?.name || '', company: inspection.inspector?.company || '' },
        ownerQuestions: { ownershipDuration: '', sellingReason: '', problemsIssues: '', serviceRecords: '', carUsage: '', mileageAdded: '', nextCarPlan: '' },
        carBasics: { engineNumber: '', chassisNumber: '', manufactureYear: new Date().getFullYear(), make: '', model: '', askingPrice: 0, registrationNumber: '', tradeInValue: 0, mileage: 0, mileageUnit: 'km', engineSize: 0, transmission: 'manual', fuel: 'petrol', currency: { code: 'KES', symbol: 'KES', name: 'Kenya Shilling' } },
        bodyInspection: { panelGaps: { score: 0, notes: '' }, paintSeams: { score: 0, notes: '' }, bondo: { score: 0, notes: '' }, rust: { score: 0, notes: '' }, dents: { score: 0, notes: '' }, scratches: { score: 0, notes: '' }, repainting: { score: 0, notes: '' } },
        wheelInspection: { treadWear: { score: 0, notes: '' }, camberToeAngle: { score: 0, notes: '' }, turnLockToLock: { score: 0, notes: '' }, alignment: { score: 0, notes: '' } },
        interiorInspection: { seats: { score: 0, notes: '' }, carpet: { score: 0, notes: '' }, trunk: { score: 0, notes: '' }, headliner: { score: 0, notes: '' }, electronics: { score: 0, notes: '' }, wearAndTear: { score: 0, notes: '' } },
        testDrive: { acceleration: { score: 0, notes: '' }, turning: { score: 0, notes: '' }, braking: { score: 0, notes: '' }, highway: { score: 0, notes: '' }, city: { score: 0, notes: '' } },
        engineInspection: { 
          score: 0, 
          notes: '',
          checklist: {
            bonnetOpens: { checked: false },
            bonnetSupports: { checked: false },
            frameStraight: { checked: false },
            noLeaks: { checked: false },
            oilLevelGood: { checked: false },
            coolantGood: { checked: false },
            hosesAndBelts: { checked: false }
          }
        },
        undercarInspection: { score: 0, notes: '', leaks: { score: 0, notes: '' }, rust: { score: 0, notes: '' }, suspension: { score: 0, notes: '' }, frameDamage: { score: 0, notes: '' } },
        electronicsChecklist: { powerWindowsMirrors: { checked: false }, radio: { checked: false }, acHeat: { checked: false }, navigation: { checked: false }, sunroof: { checked: false }, parkingSensors: { checked: false }, emergencyBrake: { checked: false }, dashboardLights: { checked: false }, gauges: { checked: false }, wipers: { checked: false }, rearviewMirror: { checked: false } },
        exteriorChecklist: { highLowBeams: { checked: false }, fogLights: { checked: false }, turnSignals: { checked: false }, brakeLights: { checked: false }, reverseLights: { checked: false }, hazardLights: { checked: false } },
        finalNotes: '',
        photos: {
          bodyPhotos: [],
          wheelPhotos: [],
          interiorPhotos: [],
          enginePhotos: [],
          undercarPhotos: [],
          exteriorPhotos: []
        }
      });
      setIsComplete(false);
      setCurrentSection('basics');
    }
  };

  const canCompleteSection = (section: string) => {
    switch(section) {
      case 'inspector':
        return inspection.inspector?.name?.trim() !== '';
      case 'basics':
        return inspection.carBasics?.make?.trim() !== '' || 
               inspection.carBasics?.model?.trim() !== '';
      default:
        return true;
    }
  };

  const handleSectionComplete = (section: string) => {
    if (canCompleteSection(section)) {
      setSectionStatus(prev => ({ ...prev, [section]: 'completed' }));
      if (section === 'finalnotes') {
        handleComplete();
      } else {
        handleNextSection();
      }
    } else {
      alert('Please fill in the required information before continuing.');
    }
  };

  const handleSkipSection = (section: string) => {
    if (confirm(`Are you sure you want to skip the ${section} section? This will mark it as N/A.`)) {
      const defaultNA = { score: -1, notes: 'N/A' };
      setInspection(prev => {
        const updates: Record<string, any> = {
          body: { bodyInspection: {
            panelGaps: defaultNA,
            paintSeams: defaultNA,
            bondo: defaultNA,
            rust: defaultNA,
            dents: defaultNA,
            scratches: defaultNA,
            repainting: defaultNA
          }},
          wheels: { wheelInspection: {
            treadWear: defaultNA,
            camberToeAngle: defaultNA,
            turnLockToLock: defaultNA,
            alignment: defaultNA
          }},
          interior: { interiorInspection: {
            seats: defaultNA,
            carpet: defaultNA,
            trunk: defaultNA,
            headliner: defaultNA,
            electronics: defaultNA,
            wearAndTear: defaultNA
          }},
          engine: { engineInspection: defaultNA },
          undercar: { undercarInspection: { score: -1, notes: 'N/A', leaks: defaultNA, rust: defaultNA, suspension: defaultNA, frameDamage: defaultNA } },
          testdrive: { testDrive: {
            acceleration: defaultNA,
            turning: defaultNA,
            braking: defaultNA,
            highway: defaultNA,
            city: defaultNA
          }},
          exterior: { exteriorInspection: defaultNA },
        };
        
        return section in updates ? { ...prev, ...updates[section] } : prev;
      });
      
      setSectionStatus(prev => ({ ...prev, [section]: 'skipped' }));
      handleNextSection();
    }
  };

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousSection = () => {
    const currentIndex = sections.findIndex(s => s.id === currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isSectionNA = (section: string): boolean => {
    const scoreMap: { [key: string]: number | undefined } = {
      body: inspection.bodyInspection?.panelGaps.score,
      wheels: inspection.wheelInspection?.treadWear.score,
      interior: inspection.interiorInspection?.seats.score,
      engine: inspection.engineInspection?.score,
      undercar: inspection.undercarInspection?.score,
      testdrive: inspection.testDrive?.acceleration.score,
      exterior: inspection.exteriorInspection?.score,
    };
    return scoreMap[section] === -1;
  };

  const renderPhotoSection = (section: string) => {
    const photoSectionMapping: Record<string, keyof InspectionPhotos> = {
      'body': 'bodyPhotos',
      'wheels': 'wheelPhotos',
      'interior': 'interiorPhotos',
      'engine': 'enginePhotos',
      'undercar': 'undercarPhotos',
      'exterior': 'exteriorPhotos'
    };
    
    const photoSection = photoSectionMapping[section];
    if (!photoSection) return null;
    
    return (
      <PhotoUpload 
        sectionName={`${section.charAt(0).toUpperCase() + section.slice(1)}`}
        existingPhotos={inspection.photos?.[photoSection] || []}
        onPhotosChange={(photos) => handlePhotoChange(photoSection, photos)}
        maxPhotos={8}
      />
    );
  };

  const renderCarBasicsSection = () => (
    <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
      <h2 className="text-lg sm:text-xl font-bold text-text-primary">Car Basics</h2>
      
      {/* Currency selector */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Currency
          </label>
          <select
            value={selectedCurrency.code}
            onChange={(e) => {
              const currency = commonCurrencies.find(c => c.code === e.target.value) || commonCurrencies[0];
              setSelectedCurrency(currency);
              setInspection(prev => ({
                ...prev,
                carBasics: {
                  ...prev.carBasics!,
                  currency: currency
                }
              }));
            }}
            className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary"
          >
            {commonCurrencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Price inputs with improved mobile layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Asking Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="askingPrice"
              placeholder="Asking Price"
              value={inspection.carBasics?.askingPrice || ''}
              onChange={handleBasicInfoChange}
              min="0"
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-text-primary mb-1">
              Trade-in Value
            </label>
            <input
              type="number"
              name="tradeInValue"
              placeholder="Trade-in Value"
              min="0"
              value={inspection.carBasics?.tradeInValue || ''}
              onChange={handleBasicInfoChange}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Rest of car basics fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="make"
              placeholder="Make"
              value={inspection.carBasics?.make || ''}
              onChange={handleBasicInfoChange}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              placeholder="Model"
              value={inspection.carBasics?.model || ''}
              onChange={handleBasicInfoChange}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              name="manufactureYear"
              value={inspection.carBasics?.manufactureYear || new Date().getFullYear()}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setInspection(prev => ({
                  ...prev,
                  carBasics: {
                    ...prev.carBasics!,
                    manufactureYear: value
                  }
                }));
              }}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {Array.from({length: 50}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Engine Number
            </label>
            <input
              type="text"
              name="engineNumber"
              placeholder="Engine Number"
              value={inspection.carBasics?.engineNumber || ''}
              onChange={handleBasicInfoChange}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Chassis Number (VIN)
            </label>
            <input
              type="text"
              name="chassisNumber"
              placeholder="Chassis Number (VIN)"
              value={inspection.carBasics?.chassisNumber || ''}
              onChange={handleBasicInfoChange}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="registrationNumber"
              placeholder="Registration Number"
              value={inspection.carBasics?.registrationNumber || ''}
              onChange={handleBasicInfoChange}
              maxLength={15}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Transmission
            </label>
            <select
              name="transmission"
              value={inspection.carBasics?.transmission || 'manual'}
              onChange={(e) => {
                setInspection(prev => ({
                  ...prev,
                  carBasics: {
                    ...prev.carBasics!,
                    transmission: e.target.value as 'manual' | 'automatic'
                  }
                }));
              }}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Fuel Type
            </label>
            <select
              name="fuel"
              value={inspection.carBasics?.fuel || 'petrol'}
              onChange={(e) => {
                setInspection(prev => ({
                  ...prev,
                  carBasics: {
                    ...prev.carBasics!,
                    fuel: e.target.value as 'petrol' | 'diesel' | 'electric' | 'hybrid'
                  }
                }));
              }}
              className="w-full border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngineChecklist = () => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2 sm:mb-3">Before Startup Checks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="bonnetOpens"
            checked={inspection.engineInspection?.checklist?.bonnetOpens?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'bonnetOpens', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="bonnetOpens" className="ml-2 text-sm text-text-primary">
            Bonnet opens easily
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="bonnetSupports"
            checked={inspection.engineInspection?.checklist?.bonnetSupports?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'bonnetSupports', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="bonnetSupports" className="ml-2 text-sm text-text-primary">
            Bonnet support/struts work
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="frameStraight"
            checked={inspection.engineInspection?.checklist?.frameStraight?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'frameStraight', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="frameStraight" className="ml-2 text-sm text-text-primary">
            Frame straight, no kinks
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="noLeaks"
            checked={inspection.engineInspection?.checklist?.noLeaks?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'noLeaks', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="noLeaks" className="ml-2 text-sm text-text-primary">
            No leaks (oil, coolant, transmission fluid)
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="oilLevelGood"
            checked={inspection.engineInspection?.checklist?.oilLevelGood?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'oilLevelGood', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="oilLevelGood" className="ml-2 text-sm text-text-primary">
            Oil level good, no metal shavings or froth
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="coolantGood"
            checked={inspection.engineInspection?.checklist?.coolantGood?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'coolantGood', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="coolantGood" className="ml-2 text-sm text-text-primary">
            Coolant level and condition good (checked when cold)
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hosesAndBelts"
            checked={inspection.engineInspection?.checklist?.hosesAndBelts?.checked || false}
            onChange={(e) => handleCheckboxChange('engineInspection', 'hosesAndBelts', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="hosesAndBelts" className="ml-2 text-sm text-text-primary">
            Hoses, belts, battery posts and wires in good condition
          </label>
        </div>
      </div>
    </div>
  );

  const renderInteriorChecklist = () => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2 sm:mb-3">Interior Checklist</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(inspection.interiorChecklist || {}).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <input
              type="checkbox"
              id={key}
              checked={value?.checked || false}
              onChange={(e) => handleCheckboxChange('interiorChecklist', key, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor={key} className="ml-2 text-sm text-text-primary">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExteriorChecklist = () => (
    <div className="mb-4 sm:mb-6">
      <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2 sm:mb-3">Lights Inspection</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="highLowBeams"
            checked={inspection.exteriorChecklist?.highLowBeams?.checked || false}
            onChange={(e) => handleCheckboxChange('exteriorChecklist', 'highLowBeams', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="highLowBeams" className="ml-2 text-sm text-text-primary">
            High/low beam headlights working
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="fogLights"
            checked={inspection.exteriorChecklist?.fogLights?.checked || false}
            onChange={(e) => handleCheckboxChange('exteriorChecklist', 'fogLights', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="fogLights" className="ml-2 text-sm text-text-primary">
            Fog lights working
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="turnSignals"
            checked={inspection.exteriorChecklist?.turnSignals?.checked || false}
            onChange={(e) => handleCheckboxChange('exteriorChecklist', 'turnSignals', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="turnSignals" className="ml-2 text-sm text-text-primary">
            Turn signals working (front & rear)
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="brakeLights"
            checked={inspection.exteriorChecklist?.brakeLights?.checked || false}
            onChange={(e) => handleCheckboxChange('exteriorChecklist', 'brakeLights', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="brakeLights" className="ml-2 text-sm text-text-primary">
            Brake lights working
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="reverseLights"
            checked={inspection.exteriorChecklist?.reverseLights?.checked || false}
            onChange={(e) => handleCheckboxChange('exteriorChecklist', 'reverseLights', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="reverseLights" className="ml-2 text-sm text-text-primary">
            Reverse lights working
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hazardLights"
            checked={inspection.exteriorChecklist?.hazardLights?.checked || false}
            onChange={(e) => handleCheckboxChange('exteriorChecklist', 'hazardLights', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
          />
          <label htmlFor="hazardLights" className="ml-2 text-sm text-text-primary">
            Hazard lights working
          </label>
        </div>
      </div>
    </div>
  );

  const renderInspectorInfo = () => (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold mb-4">Inspector Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ...existing inspector input fields... */}
      </div>
    </div>
  );

  const sections = [
    { id: 'inspector', title: 'Inspector Info' },
    { id: 'basics', title: 'Car Basics' },
    { id: 'questions', title: 'Owner Questions' },
    { id: 'body', title: 'Body Inspection' },
    { id: 'wheels', title: 'Wheel Inspection' },
    { id: 'interior', title: 'Interior Inspection' },
    { id: 'exterior', title: 'Exterior Inspection' }, // Added exterior section
    { id: 'engine', title: 'Engine Inspection' },
    { id: 'undercar', title: 'Under Car Inspection' },
    { id: 'testdrive', title: 'Test Drive' },
    { id: 'finalnotes', title: 'Final Notes' },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-16 sm:pb-32">
      {/* Fixed header with reduced height */}
      <div className="fixed top-0 left-0 right-0 bg-white z-50 shadow-md border-b border-gray-200 w-full">
        <div className="w-full bg-blue-50 px-2 sm:px-4 py-2 sm:py-2">
          <div className="max-w-4xl mx-auto flex flex-row justify-between items-center w-full">
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">Car Inspection Form</h1>
              <nav className="flex gap-4">
                <Link href="/" className="text-text-primary hover:text-primary transition-colors text-sm">
                  Home
                </Link>
                <Link href="/history" className="text-text-primary hover:text-primary transition-colors text-sm">
                  History
                </Link>
              </nav>
            </div>
            <button
              onClick={startNewInspection}
              aria-label="Start new inspection"
              className="px-3 py-1.5 bg-surface-default border border-background-dark text-text-primary rounded hover:bg-background-default transition-colors shadow-sm w-auto text-sm"
            >
              Start New Inspection
            </button>
          </div>
        </div>

        {!isComplete && (
          <nav className="w-full px-2 sm:px-4 py-2 overflow-x-auto bg-gray-50" aria-label="Inspection sections">
            <div className="max-w-4xl mx-auto">
              <ul className="flex flex-nowrap gap-1 sm:gap-2 min-w-max py-1">
                {sections.map((section) => {
                  const isNA = isSectionNA(section.id);
                  
                  return (
                    <li key={section.id}>
                      <button
                        onClick={() => {
                          setCurrentSection(section.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        aria-label={`Go to ${section.title} section${isNA ? ' (Not applicable)' : ''}`}
                        aria-current={currentSection === section.id ? 'page' : undefined}
                        className={`px-4 py-2 rounded transition-colors flex items-center gap-2 whitespace-nowrap ${
                          currentSection === section.id
                            ? 'bg-primary text-white shadow-sm'
                            : isNA
                            ? 'bg-gray-100 text-gray-500 border border-gray-200'
                            : 'bg-surface-default text-text-secondary hover:text-primary border border-background-dark hover:bg-background-default'
                        }`}
                      >
                        {section.title}
                        {isNA && (
                          <span className="text-xs bg-gray-200 px-1 rounded">N/A</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        )}
      </div>

      {/* Adjust main content area spacing */}
      <div className="mt-[140px] sm:mt-[130px] space-y-3 sm:space-y-6 px-2 sm:px-4">
        {!isComplete ? (
          <div className="space-y-3 sm:space-y-6 pb-24">
            {/* Inspector Information Section */}
            {currentSection === 'inspector' && (
              <div className="space-y-3 sm:space-y-4 bg-surface-default p-3 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <h2 className="text-base sm:text-xl font-bold text-text-primary">Inspector Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Inspector Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Inspector Name"
                      value={inspection.inspector?.name || ''}
                      onChange={handleInspectorInfoChange}
                      className="w-full border border-background-dark bg-background-default px-3 py-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      placeholder="Company"
                      value={inspection.inspector?.company || ''}
                      onChange={handleInspectorInfoChange}
                      className="w-full border border-background-dark bg-background-default px-3 py-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      Company Logo
                      <span className="ml-1 text-sm text-text-secondary">(Will appear on reports)</span>
                    </label>
                    <input
                      type="file"
                      name="logo"
                      id="company-logo"
                      accept="image/*"
                      aria-label="Company Logo"
                      title="Select company logo image"
                      placeholder="Upload company logo"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setInspection(prev => ({
                              ...prev,
                              inspector: {
                                ...prev.inspector!,
                                logo: reader.result as string
                              }
                            }));
                          };
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }}
                      className="block w-full text-sm text-text-secondary
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary-light"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Car Basics Section */}
            {currentSection === 'basics' && renderCarBasicsSection()}

            {/* Owner Questions Section */}
            {currentSection === 'questions' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">Owner Questions</h2>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">How long have you owned the car?</label>
                    <textarea
                      name="ownershipDuration"
                      value={inspection.ownerQuestions?.ownershipDuration || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Why are you selling?</label>
                    <textarea
                      name="sellingReason"
                      value={inspection.ownerQuestions?.sellingReason || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Any problems or issues with the car?</label>
                    <textarea
                      name="problemsIssues"
                      value={inspection.ownerQuestions?.problemsIssues || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Service Records & Maintenance History</label>
                    <textarea
                      name="serviceRecords"
                      value={inspection.ownerQuestions?.serviceRecords || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">How was the car used? (Daily driver, weekend car, etc.)</label>
                    <textarea
                      name="carUsage"
                      value={inspection.ownerQuestions?.carUsage || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">Average mileage added per year?</label>
                    <textarea
                      name="mileageAdded"
                      value={inspection.ownerQuestions?.mileageAdded || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">What car are you planning to get next? Why?</label>
                    <textarea
                      name="nextCarPlan"
                      value={inspection.ownerQuestions?.nextCarPlan || ''}
                      onChange={handleOwnerQuestionsChange}
                      className="border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary h-24 w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Body Inspection Section */}
            {currentSection === 'body' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Body Inspection</h2>
                  <button
                    onClick={() => handleSkipSection('body')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                {renderPhotoSection('body')}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Panel Gaps"
                    value={inspection.bodyInspection?.panelGaps.score || 0}
                    notes={inspection.bodyInspection?.panelGaps.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'panelGaps', rating, notes)}
                  />
                  <RatingInput
                    label="Paint & Seams"
                    value={inspection.bodyInspection?.paintSeams.score || 0}
                    notes={inspection.bodyInspection?.paintSeams.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'paintSeams', rating, notes)}
                  />
                  <RatingInput
                    label="Body Filler (Bondo)"
                    value={inspection.bodyInspection?.bondo.score || 0}
                    notes={inspection.bodyInspection?.bondo.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'bondo', rating, notes)}
                  />
                  <RatingInput
                    label="Rust"
                    value={inspection.bodyInspection?.rust.score || 0}
                    notes={inspection.bodyInspection?.rust.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'rust', rating, notes)}
                  />
                  <RatingInput
                    label="Dents"
                    value={inspection.bodyInspection?.dents?.score || 0}
                    notes={inspection.bodyInspection?.dents?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'dents', rating, notes)}
                  />
                  <RatingInput
                    label="Scratches"
                    value={inspection.bodyInspection?.scratches?.score || 0}
                    notes={inspection.bodyInspection?.scratches?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'scratches', rating, notes)}
                  />
                  <RatingInput
                    label="Repainting"
                    value={inspection.bodyInspection?.repainting?.score || 0}
                    notes={inspection.bodyInspection?.repainting?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('bodyInspection', 'repainting', rating, notes)}
                  />
                </div>
              </div>
            )}

            {/* Wheel Inspection Section */}
            {currentSection === 'wheels' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Wheel Inspection</h2>
                  <button
                    onClick={() => handleSkipSection('wheels')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                {renderPhotoSection('wheels')}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Tread Wear"
                    value={inspection.wheelInspection?.treadWear.score || 0}
                    notes={inspection.wheelInspection?.treadWear.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('wheelInspection', 'treadWear', rating, notes)}
                  />
                  <RatingInput
                    label="Camber/Toe Angle"
                    value={inspection.wheelInspection?.camberToeAngle.score || 0}
                    notes={inspection.wheelInspection?.camberToeAngle.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('wheelInspection', 'camberToeAngle', rating, notes)}
                  />
                  <RatingInput
                    label="Turn Lock to Lock"
                    value={inspection.wheelInspection?.turnLockToLock.score || 0}
                    notes={inspection.wheelInspection?.turnLockToLock.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('wheelInspection', 'turnLockToLock', rating, notes)}
                  />
                  <RatingInput
                    label="Alignment"
                    value={(inspection.wheelInspection?.alignment?.score !== undefined) ? 
                      inspection.wheelInspection.alignment.score : 0}
                    notes={inspection.wheelInspection?.alignment?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('wheelInspection', 'alignment', rating, notes)}
                  />
                </div>
              </div>
            )}

            {/* Interior Inspection Section */}
            {currentSection === 'interior' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Interior Inspection</h2>
                  <button
                    onClick={() => handleSkipSection('interior')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                {renderPhotoSection('interior')}
                {renderInteriorChecklist()}
                {/* Interior Electronics Checklist */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2 sm:mb-3">Electronics Checklist</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="powerWindowsMirrors"
                        checked={inspection.electronicsChecklist?.powerWindowsMirrors?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'powerWindowsMirrors', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="powerWindowsMirrors" className="ml-2 text-sm text-text-primary">
                        Power windows/mirrors/locks
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="radio"
                        checked={inspection.electronicsChecklist?.radio?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'radio', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="radio" className="ml-2 text-sm text-text-primary">
                        Radio/sound system
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="acHeat"
                        checked={inspection.electronicsChecklist?.acHeat?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'acHeat', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="acHeat" className="ml-2 text-sm text-text-primary">
                        AC/Heating system
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="navigation"
                        checked={inspection.electronicsChecklist?.navigation?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'navigation', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="navigation" className="ml-2 text-sm text-text-primary">
                        Navigation system
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sunroof"
                        checked={inspection.electronicsChecklist?.sunroof?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'sunroof', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="sunroof" className="ml-2 text-sm text-text-primary">
                        Sunroof operation
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="parkingSensors"
                        checked={inspection.electronicsChecklist?.parkingSensors?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'parkingSensors', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="parkingSensors" className="ml-2 text-sm text-text-primary">
                        Parking sensors/cameras
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emergencyBrake"
                        checked={inspection.electronicsChecklist?.emergencyBrake?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'emergencyBrake', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="emergencyBrake" className="ml-2 text-sm text-text-primary">
                        Emergency brake
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="dashboardLights"
                        checked={inspection.electronicsChecklist?.dashboardLights?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'dashboardLights', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="dashboardLights" className="ml-2 text-sm text-text-primary">
                        Dashboard warning lights
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="gauges"
                        checked={inspection.electronicsChecklist?.gauges?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'gauges', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="gauges" className="ml-2 text-sm text-text-primary">
                        Gauges function correctly
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="wipers"
                        checked={inspection.electronicsChecklist?.wipers?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'wipers', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="wipers" className="ml-2 text-sm text-text-primary">
                        Wipers and washer fluid
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="rearviewMirror"
                        checked={inspection.electronicsChecklist?.rearviewMirror?.checked || false}
                        onChange={(e) => handleCheckboxChange('electronicsChecklist', 'rearviewMirror', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="rearviewMirror" className="ml-2 text-sm text-text-primary">
                        Rearview mirror auto-dimming
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Under Carpet Checks */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-text-primary mb-2 sm:mb-3">Under Carpet Inspection</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="carpetRust"
                        checked={inspection.interiorChecklist?.carpetRust?.checked || false}
                        onChange={(e) => handleCheckboxChange('interiorChecklist', 'carpetRust', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="carpetRust" className="ml-2 text-sm text-text-primary">
                        No rust under carpets
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="carpetDampness"
                        checked={inspection.interiorChecklist?.carpetDampness?.checked || false}
                        onChange={(e) => handleCheckboxChange('interiorChecklist', 'carpetDampness', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="carpetDampness" className="ml-2 text-sm text-text-primary">
                        No dampness under carpets
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="spareTire"
                        checked={inspection.interiorChecklist?.spareTire?.checked || false}
                        onChange={(e) => handleCheckboxChange('interiorChecklist', 'spareTire', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="spareTire" className="ml-2 text-sm text-text-primary">
                        Spare tire present and in good condition
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="jackLugWrench"
                        checked={inspection.interiorChecklist?.jackLugWrench?.checked || false}
                        onChange={(e) => handleCheckboxChange('interiorChecklist', 'jackLugWrench', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                      <label htmlFor="jackLugWrench" className="ml-2 text-sm text-text-primary">
                        Jack and lug wrench present
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Seats"
                    value={inspection.interiorInspection?.seats.score || 0}
                    notes={inspection.interiorInspection?.seats.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('interiorInspection', 'seats', rating, notes)}
                  />
                  <RatingInput
                    label="Carpet"
                    value={inspection.interiorInspection?.carpet.score || 0}
                    notes={inspection.interiorInspection?.carpet.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('interiorInspection', 'carpet', rating, notes)}
                  />
                  <RatingInput
                    label="Trunk"
                    value={inspection.interiorInspection?.trunk.score || 0}
                    notes={inspection.interiorInspection?.trunk.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('interiorInspection', 'trunk', rating, notes)}
                  />
                  <RatingInput
                    label="Headliner"
                    value={inspection.interiorInspection?.headliner.score || 0}
                    notes={inspection.interiorInspection?.headliner.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('interiorInspection', 'headliner', rating, notes)}
                  />
                  <RatingInput
                    label="Electronics"
                    value={inspection.interiorInspection?.electronics.score || 0}
                    notes={inspection.interiorInspection?.electronics.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('interiorInspection', 'electronics', rating, notes)}
                  />
                  <RatingInput
                    label="General Wear and Tear"
                    value={inspection.interiorInspection?.wearAndTear.score || 0}
                    notes={inspection.interiorInspection?.wearAndTear.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('interiorInspection', 'wearAndTear', rating, notes)}
                  />
                </div>
              </div>
            )}

            {/* Engine Inspection Section */}
            {currentSection === 'engine' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Engine Inspection</h2>
                  <button
                    onClick={() => handleSkipSection('engine')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                {renderPhotoSection('engine')}
                {renderEngineChecklist()}
                {/* Engine Overall Rating */}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Engine Overall Condition"
                    value={inspection.engineInspection?.score || 0}
                    notes={inspection.engineInspection?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('engineInspection', '', rating, notes)}
                  />
                </div>
              </div>
            )}

            {/* Under Car Inspection Section */}
            {currentSection === 'undercar' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Under Car Inspection</h2>
                  <button
                    onClick={() => handleSkipSection('undercar')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                {renderPhotoSection('undercar')}
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Undercarriage Condition"
                    value={inspection.undercarInspection?.score || 0}
                    notes={inspection.undercarInspection?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('undercarInspection', '', rating, notes)}
                  />
                  <RatingInput
                    label="Leaks"
                    value={(inspection.undercarInspection?.leaks?.score !== undefined) ? 
                      inspection.undercarInspection.leaks.score : 0}
                    notes={inspection.undercarInspection?.leaks?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('undercarInspection', 'leaks', rating, notes)}
                  />
                  <RatingInput
                    label="Rust"
                    value={(inspection.undercarInspection?.rust?.score !== undefined) ? 
                      inspection.undercarInspection.rust.score : 0}
                    notes={inspection.undercarInspection?.rust?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('undercarInspection', 'rust', rating, notes)}
                  />
                  <RatingInput
                    label="Suspension"
                    value={(inspection.undercarInspection?.suspension?.score !== undefined) ? 
                      inspection.undercarInspection.suspension.score : 0}
                    notes={inspection.undercarInspection?.suspension?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('undercarInspection', 'suspension', rating, notes)}
                  />
                  <RatingInput
                    label="Frame Damage"
                    value={(inspection.undercarInspection?.frameDamage?.score !== undefined) ? 
                      inspection.undercarInspection.frameDamage.score : 0}
                    notes={inspection.undercarInspection?.frameDamage?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('undercarInspection', 'frameDamage', rating, notes)}
                  />
                </div>
              </div>
            )}

            {/* Test Drive Section */}
            {currentSection === 'testdrive' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Test Drive</h2>
                  <button
                    onClick={() => handleSkipSection('testdrive')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Acceleration"
                    value={inspection.testDrive?.acceleration.score || 0}
                    notes={inspection.testDrive?.acceleration.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('testDrive', 'acceleration', rating, notes)}
                  />
                  <RatingInput
                    label="Turning/Handling"
                    value={inspection.testDrive?.turning.score || 0}
                    notes={inspection.testDrive?.turning.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('testDrive', 'turning', rating, notes)}
                  />
                  <RatingInput
                    label="Braking"
                    value={inspection.testDrive?.braking.score || 0}
                    notes={inspection.testDrive?.braking.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('testDrive', 'braking', rating, notes)}
                  />
                  <RatingInput
                    label="Highway Performance"
                    value={inspection.testDrive?.highway.score || 0}
                    notes={inspection.testDrive?.highway.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('testDrive', 'highway', rating, notes)}
                  />
                  <RatingInput
                    label="City Performance"
                    value={inspection.testDrive?.city.score || 0}
                    notes={inspection.testDrive?.city.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('testDrive', 'city', rating, notes)}
                  />
                </div>
              </div>
            )}

            {/* Final Notes Section */}
            {currentSection === 'finalnotes' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">Final Notes</h2>
                <label className="block text-sm font-medium text-text-primary mb-1" htmlFor="finalNotes">
                  Summary and Final Assessment
                </label>
                <textarea
                  id="finalNotes"
                  name="finalNotes"
                  value={inspection.finalNotes || ''}
                  onChange={handleFinalNotesChange}
                  className="w-full h-48 border border-background-dark bg-background-default p-2 rounded text-text-primary placeholder-text-light focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter any final notes or observations..."
                  title="Final inspection notes and summary"
                />
              </div>
            )}

            {/* Exterior Inspection Section */}
            {currentSection === 'exterior' && (
              <div className="space-y-4 bg-surface-default p-4 sm:p-6 rounded-lg shadow-sm border border-background-dark">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">Exterior Inspection</h2>
                  <button
                    onClick={() => handleSkipSection('exterior')}
                    className="text-sm text-text-secondary hover:text-primary underline"
                  >
                    Mark as N/A
                  </button>
                </div>
                {renderPhotoSection('exterior')}
                {renderExteriorChecklist()}
                
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <RatingInput
                    label="Overall Exterior Condition"
                    value={inspection.exteriorInspection?.score || 0}
                    notes={inspection.exteriorInspection?.notes || ''}
                    onChange={(rating, notes) => handleRatingChange('exteriorInspection', '', rating, notes)}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <EnhancedReportGenerator inspection={inspection as CarInspection} />
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Enhanced PDF Preview</h2>
              <PDFPreview inspection={inspection as CarInspection} />
            </div>
          </>
        )}
      </div>

      {/* Fixed footer with improved mobile spacing */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-50 border-t border-gray-200 shadow-md z-50 p-2 sm:p-4 w-full">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          {!isComplete && (
            <>
              <button
                onClick={handlePreviousSection}
                disabled={currentSection === sections[0].id}
                aria-label="Go to previous section"
                className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-md shadow-sm flex items-center gap-1 w-full sm:w-auto text-sm sm:text-base ${
                  currentSection === sections[0].id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-text-primary hover:bg-gray-50 transition-colors'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4 4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={handleSaveDraft}
                  aria-label="Save draft of inspection"
                  className="px-3 sm:px-6 py-1.5 sm:py-2 bg-white border border-gray-200 text-text-primary rounded-md shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto text-sm sm:text-base"
                >
                  Save Draft
                </button>
                
                {currentSection !== sections[sections.length - 1].id ? (
                  <button
                    onClick={() => handleSectionComplete(currentSection)}
                    aria-label="Go to next section"
                    className="px-3 sm:px-6 py-1.5 sm:py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary-light transition-colors flex items-center justify-center gap-1 w-full sm:w-auto text-sm sm:text-base"
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    aria-label="Complete inspection"
                    className="px-6 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition-colors w-full sm:w-auto"
                  >
                    Complete Inspection
                  </button>
                )}
              </div>
            </>
          )}
          {isComplete && (
            <div className="flex flex-col sm:flex-row gap-4 ml-auto w-full sm:w-auto">
              <button
                onClick={startNewInspection}
                aria-label="Start new inspection"
                className="px-6 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary-light transition-colors w-full sm:w-auto"
              >
                New Inspection
              </button>
              <button
                onClick={handleSaveDraft}
                aria-label="Save draft of inspection"
                className="px-6 py-2 bg-white border border-gray-200 text-text-primary rounded-md shadow-sm hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Save Draft
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}