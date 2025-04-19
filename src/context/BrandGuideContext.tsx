
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  BrandGuide, 
  TypographySet, 
  ColorPalette, 
  LogoSet 
} from '@/types';
import { defaultTypographySet } from '@/utils/typographyUtils';

// Default empty color palette
const defaultColorPalette: ColorPalette = {
  primary: [],
  secondary: [],
  neutral: []
};

// Default empty logo set
const defaultLogoSet: LogoSet = {
  original: '',
  square: [],
  rounded: [],
  circle: []
};

// Create a new default brand guide
const createDefaultBrandGuide = (): BrandGuide => ({
  id: uuidv4(),
  name: 'Untitled Brand Guide',
  createdAt: new Date(),
  updatedAt: new Date(),
  typography: defaultTypographySet,
  colors: defaultColorPalette,
  logos: defaultLogoSet
});

interface BrandGuideContextType {
  currentGuide: BrandGuide;
  savedGuides: BrandGuide[];
  activeSection: 'typography' | 'colors' | 'logos' | 'preview' | 'export';
  setActiveSection: (section: 'typography' | 'colors' | 'logos' | 'preview' | 'export') => void;
  setGuideName: (name: string) => void;
  updateTypography: (typography: TypographySet) => void;
  updateColors: (colors: ColorPalette) => void;
  updateLogos: (logos: LogoSet) => void;
  saveCurrentGuide: () => void;
  createNewGuide: () => void;
  loadGuide: (guideId: string) => void;
  duplicateGuide: (guideId: string) => void;
  deleteGuide: (guideId: string) => void;
  exportGuide: (format: 'pdf' | 'json' | 'css' | 'link') => void;
  previewText: string;
  setPreviewText: (text: string) => void;
}

const BrandGuideContext = createContext<BrandGuideContextType | undefined>(undefined);

// Helper to get a unique session ID for the current user
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('brandStudioSessionId');
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('brandStudioSessionId', sessionId);
  }
  return sessionId;
}

// Helper to load guides from localStorage
const loadGuidesFromStorage = (): BrandGuide[] => {
  const guidesJson = localStorage.getItem('brandStudioGuides');
  if (guidesJson) {
    try {
      const guidesData = JSON.parse(guidesJson);
      return guidesData.map((guide: any) => ({
        ...guide,
        createdAt: new Date(guide.createdAt),
        updatedAt: new Date(guide.updatedAt)
      }));
    } catch (error) {
      console.error('Error parsing guides from localStorage:', error);
    }
  }
  return [];
};

// Helper to save guides to localStorage
const saveGuidesToStorage = (guides: BrandGuide[]): void => {
  localStorage.setItem('brandStudioGuides', JSON.stringify(guides));
};

export const BrandGuideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGuide, setCurrentGuide] = useState<BrandGuide>(createDefaultBrandGuide());
  const [savedGuides, setSavedGuides] = useState<BrandGuide[]>([]);
  const [activeSection, setActiveSection] = useState<'typography' | 'colors' | 'logos' | 'preview' | 'export'>('typography');
  const [previewText, setPreviewText] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [sessionId] = useState<string>(getSessionId());

  // Load user's guide from localStorage on initial load
  useEffect(() => {
    const loadSavedGuide = () => {
      try {
        // Get all saved guides
        const guides = loadGuidesFromStorage();
        if (guides.length > 0) {
          setSavedGuides(guides);
          
          // Try to find the last edited guide
          const lastGuide = guides.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          
          if (lastGuide) {
            setCurrentGuide(lastGuide);
            return;
          }
        }
        
        // If no guides found, check for the current guide in localStorage
        const savedGuideJson = localStorage.getItem('currentBrandGuide');
        if (savedGuideJson) {
          const savedGuide = JSON.parse(savedGuideJson);
          // Convert string dates back to Date objects
          savedGuide.createdAt = new Date(savedGuide.createdAt);
          savedGuide.updatedAt = new Date(savedGuide.updatedAt);
          setCurrentGuide(savedGuide);
          // Also add to saved guides if not already there
          setSavedGuides(prev => {
            if (!prev.some(g => g.id === savedGuide.id)) {
              return [...prev, savedGuide];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error loading saved guide:", error);
        // If there's an error, use the default guide
      }
    };
    
    loadSavedGuide();
  }, []);

  // Auto-save guide changes to localStorage
  useEffect(() => {
    const autoSave = () => {
      // Save current guide to localStorage
      localStorage.setItem('currentBrandGuide', JSON.stringify(currentGuide));
      
      // Update guide in saved guides array if it exists
      setSavedGuides(prev => {
        const existingIndex = prev.findIndex(g => g.id === currentGuide.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = currentGuide;
          saveGuidesToStorage(updated);
          return updated;
        }
        return prev;
      });
    };
    
    // Don't auto-save on first render or if guide is empty
    if (currentGuide.colors.primary.length > 0 || 
        currentGuide.colors.secondary.length > 0 || 
        currentGuide.logos.original) {
      autoSave();
    }
  }, [currentGuide]);

  const setGuideName = (name: string) => {
    setCurrentGuide(prev => ({
      ...prev,
      name,
      updatedAt: new Date()
    }));
  };

  const updateTypography = (typography: TypographySet) => {
    setCurrentGuide(prev => ({
      ...prev,
      typography,
      updatedAt: new Date()
    }));
  };

  const updateColors = (colors: ColorPalette) => {
    setCurrentGuide(prev => ({
      ...prev,
      colors,
      updatedAt: new Date()
    }));
  };

  const updateLogos = (logos: LogoSet) => {
    setCurrentGuide(prev => ({
      ...prev,
      logos,
      updatedAt: new Date()
    }));
  };

  const saveCurrentGuide = () => {
    // Update local state
    setSavedGuides(prev => {
      // Check if the guide already exists
      const existingIndex = prev.findIndex(guide => guide.id === currentGuide.id);
      
      let updatedGuides;
      if (existingIndex >= 0) {
        // Update existing guide
        updatedGuides = [...prev];
        updatedGuides[existingIndex] = currentGuide;
      } else {
        // Add new guide
        updatedGuides = [...prev, currentGuide];
      }
      
      // Save to localStorage
      saveGuidesToStorage(updatedGuides);
      return updatedGuides;
    });
  };

  const createNewGuide = () => {
    // Save current guide first if it has changes
    saveCurrentGuide();
    // Create new guide
    setCurrentGuide(createDefaultBrandGuide());
  };

  const loadGuide = (guideId: string) => {
    const guide = savedGuides.find(g => g.id === guideId);
    if (guide) {
      setCurrentGuide(guide);
    }
  };

  const duplicateGuide = (guideId: string) => {
    const guide = savedGuides.find(g => g.id === guideId);
    if (guide) {
      const duplicatedGuide: BrandGuide = {
        ...JSON.parse(JSON.stringify(guide)),
        id: uuidv4(),
        name: `${guide.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSavedGuides(prev => {
        const updatedGuides = [...prev, duplicatedGuide];
        saveGuidesToStorage(updatedGuides);
        return updatedGuides;
      });
      
      setCurrentGuide(duplicatedGuide);
    }
  };

  const deleteGuide = (guideId: string) => {
    setSavedGuides(prev => {
      const updatedGuides = prev.filter(guide => guide.id !== guideId);
      saveGuidesToStorage(updatedGuides);
      return updatedGuides;
    });
    
    // If the current guide is deleted, create a new one
    if (currentGuide.id === guideId) {
      setCurrentGuide(createDefaultBrandGuide());
    }
  };

  const exportGuide = (format: 'pdf' | 'json' | 'css' | 'link') => {
    // Implementation depends on the format
    console.log(`Exporting guide in ${format} format`);
    
    // For now, we'll just handle JSON
    if (format === 'json') {
      const dataStr = JSON.stringify(currentGuide, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportName = `${currentGuide.name.replace(/\s+/g, '-').toLowerCase()}_brand-guide.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
    }
    
    // The PDF and link exports would require additional implementation
  };

  return (
    <BrandGuideContext.Provider
      value={{
        currentGuide,
        savedGuides,
        activeSection,
        setActiveSection,
        setGuideName,
        updateTypography,
        updateColors,
        updateLogos,
        saveCurrentGuide,
        createNewGuide,
        loadGuide,
        duplicateGuide,
        deleteGuide,
        exportGuide,
        previewText,
        setPreviewText,
      }}
    >
      {children}
    </BrandGuideContext.Provider>
  );
};

export const useBrandGuide = (): BrandGuideContextType => {
  const context = useContext(BrandGuideContext);
  if (!context) {
    throw new Error('useBrandGuide must be used within a BrandGuideProvider');
  }
  return context;
};
