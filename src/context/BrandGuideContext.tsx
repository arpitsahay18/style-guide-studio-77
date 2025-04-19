
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  BrandGuide, 
  TypographySet, 
  ColorPalette, 
  LogoSet 
} from '@/types';
import { defaultTypographySet } from '@/utils/typographyUtils';
import { supabase } from '@/integrations/supabase/client';

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

export const BrandGuideProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentGuide, setCurrentGuide] = useState<BrandGuide>(createDefaultBrandGuide());
  const [savedGuides, setSavedGuides] = useState<BrandGuide[]>([]);
  const [activeSection, setActiveSection] = useState<'typography' | 'colors' | 'logos' | 'preview' | 'export'>('typography');
  const [previewText, setPreviewText] = useState<string>('The quick brown fox jumps over the lazy dog');
  const [sessionId] = useState<string>(getSessionId());

  // Load user's guide from localStorage/Supabase on initial load
  useEffect(() => {
    const loadSavedGuide = async () => {
      try {
        // Try to get from Supabase first
        const { data, error } = await supabase
          .from('brand_guides')
          .select('*')
          .eq('session_id', sessionId)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (data && data.length > 0 && !error) {
          // Found guide in Supabase
          const guide = data[0];
          const loadedGuide: BrandGuide = {
            ...guide.guide_data,
            id: guide.id,
            createdAt: new Date(guide.created_at),
            updatedAt: new Date(guide.updated_at)
          };
          setCurrentGuide(loadedGuide);
          setSavedGuides([loadedGuide]);
          return;
        }
        
        // Fall back to localStorage if not in Supabase
        const savedGuideJson = localStorage.getItem('currentBrandGuide');
        if (savedGuideJson) {
          const savedGuide = JSON.parse(savedGuideJson);
          setCurrentGuide(savedGuide);
          setSavedGuides([savedGuide]);
        }
      } catch (error) {
        console.error("Error loading saved guide:", error);
        // If there's an error, use the default guide
      }
    };
    
    loadSavedGuide();
  }, [sessionId]);

  // Auto-save guide changes to localStorage
  useEffect(() => {
    const autoSave = async () => {
      // Save to localStorage as a backup
      localStorage.setItem('currentBrandGuide', JSON.stringify(currentGuide));
      
      try {
        // Save to Supabase
        const { data, error } = await supabase
          .from('brand_guides')
          .upsert({
            id: currentGuide.id,
            session_id: sessionId,
            guide_data: currentGuide,
            created_at: currentGuide.createdAt.toISOString(),
            updated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry
          }, { onConflict: 'id' })
          .select();
          
        if (error) {
          console.error("Error saving to Supabase:", error);
        }
      } catch (error) {
        console.error("Error in auto-save:", error);
      }
    };
    
    // Don't auto-save on first render or if guide is empty
    if (currentGuide.colors.primary.length > 0 || 
        currentGuide.colors.secondary.length > 0 || 
        currentGuide.logos.original) {
      autoSave();
    }
  }, [currentGuide, sessionId]);

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

  const saveCurrentGuide = async () => {
    // Update local state
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
    
    // Save to Supabase
    try {
      const { error } = await supabase
        .from('brand_guides')
        .upsert({
          id: currentGuide.id,
          session_id: sessionId,
          guide_data: currentGuide,
          created_at: currentGuide.createdAt.toISOString(),
          updated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days expiry
        }, { onConflict: 'id' });
        
      if (error) {
        console.error("Error saving to Supabase:", error);
      }
    } catch (error) {
      console.error("Error saving guide:", error);
    }
  };

  const createNewGuide = () => {
    // Save current guide first if it has changes
    saveCurrentGuide();
    // Create new guide
    setCurrentGuide(createDefaultBrandGuide());
  };

  const loadGuide = async (guideId: string) => {
    // Try to load from Supabase first
    try {
      const { data, error } = await supabase
        .from('brand_guides')
        .select('*')
        .eq('id', guideId)
        .limit(1);
        
      if (data && data.length > 0 && !error) {
        // Found guide in Supabase
        const guide = data[0];
        const loadedGuide: BrandGuide = {
          ...guide.guide_data,
          id: guide.id,
          createdAt: new Date(guide.created_at),
          updatedAt: new Date(guide.updated_at)
        };
        setCurrentGuide(loadedGuide);
        return;
      }
    } catch (error) {
      console.error("Error loading guide from Supabase:", error);
    }
    
    // Fall back to local state
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
      
      // Save the duplicated guide to Supabase
      saveCurrentGuide();
    }
  };

  const deleteGuide = async (guideId: string) => {
    setSavedGuides(prev => prev.filter(guide => guide.id !== guideId));
    
    // If the current guide is deleted, create a new one
    if (currentGuide.id === guideId) {
      setCurrentGuide(createDefaultBrandGuide());
    }
    
    // Remove from Supabase
    try {
      const { error } = await supabase
        .from('brand_guides')
        .delete()
        .eq('id', guideId);
        
      if (error) {
        console.error("Error deleting guide from Supabase:", error);
      }
    } catch (error) {
      console.error("Error deleting guide:", error);
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
