
import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export const BrandGuideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGuide, setCurrentGuide] = useState<BrandGuide>(createDefaultBrandGuide());
  const [savedGuides, setSavedGuides] = useState<BrandGuide[]>([]);
  const [activeSection, setActiveSection] = useState<'typography' | 'colors' | 'logos' | 'preview' | 'export'>('typography');
  const [previewText, setPreviewText] = useState<string>('The quick brown fox jumps over the lazy dog');

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
    setSavedGuides(prev => {
      // Check if the guide already exists
      const existingIndex = prev.findIndex(guide => guide.id === currentGuide.id);
      
      if (existingIndex >= 0) {
        // Update existing guide
        const updatedGuides = [...prev];
        updatedGuides[existingIndex] = currentGuide;
        return updatedGuides;
      } else {
        // Add new guide
        return [...prev, currentGuide];
      }
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
      
      setSavedGuides(prev => [...prev, duplicatedGuide]);
      setCurrentGuide(duplicatedGuide);
    }
  };

  const deleteGuide = (guideId: string) => {
    setSavedGuides(prev => prev.filter(guide => guide.id !== guideId));
    
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
