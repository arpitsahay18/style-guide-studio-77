import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandGuide, ColorPalette, TypographySet } from '@/types';
import { storage } from '@/lib/storage';
import { saveAs } from 'file-saver';

interface ColorNames {
  [key: string]: string;
}

interface TypographyVisibility {
  display: string[];
  heading: string[];
  body: string[];
}

interface TypographyNames {
  [key: string]: string;
}

interface BrandGuideContextType {
  currentGuide: BrandGuide;
  colorNames: ColorNames;
  typographyVisibility: TypographyVisibility;
  typographyNames: TypographyNames;
  previewText: string;
  activeTab: string;
  setGuideName: (name: string) => void;
  updateColors: (colors: ColorPalette) => void;
  updateTypography: (typography: TypographySet) => void;
  updateLogos: (logos: any) => void;
  setPreviewText: (text: string) => void;
  setActiveTab: (tab: string) => void;
  setColorName: (colorKey: string, name: string) => void;
  setTypographyName: (styleKey: string, name: string) => void;
  setTypographyVisibility: (category: 'display' | 'heading' | 'body', styles: string[]) => void;
  addTypographyStyle: (category: 'display' | 'heading' | 'body', styleKey: string, customStyle?: any) => void;
  removeTypographyStyle: (category: 'display' | 'heading' | 'body', styleKey: string) => void;
  exportGuide: (format: 'json' | 'pdf') => void;
  activeSection: string;
}

const defaultBrandGuide: BrandGuide = {
  name: 'My Brand',
  colors: {
    primary: [
      {
        hex: '#007BFF',
        rgb: 'rgb(0, 123, 255)',
        cmyk: 'cmyk(100%, 52%, 0%, 0%)',
        tints: [],
        shades: [],
        blackContrast: 0,
        whiteContrast: 0
      }
    ],
    secondary: [
      {
        hex: '#6C757D',
        rgb: 'rgb(108, 117, 125)',
        cmyk: 'cmyk(13%, 6%, 0%, 51%)',
        tints: [],
        shades: [],
        blackContrast: 0,
        whiteContrast: 0
      }
    ],
    neutral: []
  },
  typography: {
    display: {
      large: {
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '48px',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.02em'
      },
      regular: {
        fontFamily: '"Bebas Neue", sans-serif',
        fontSize: '32px',
        fontWeight: '400',
        lineHeight: '1.3',
        letterSpacing: '-0.01em'
      }
    },
    heading: {
      h1: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '36px',
        fontWeight: '700',
        lineHeight: '1.2',
        letterSpacing: '-0.01em'
      },
      h2: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '30px',
        fontWeight: '600',
        lineHeight: '1.3',
        letterSpacing: '-0.01em'
      },
      h3: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '24px',
        fontWeight: '500',
        lineHeight: '1.4',
        letterSpacing: '0em'
      }
    },
    body: {
      large: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '18px',
        fontWeight: '400',
        lineHeight: '1.6',
        letterSpacing: '0em'
      },
      medium: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '16px',
        fontWeight: '400',
        lineHeight: '1.5',
        letterSpacing: '0em'
      },
      small: {
        fontFamily: '"Inter", sans-serif',
        fontSize: '14px',
        fontWeight: '400',
        lineHeight: '1.4',
        letterSpacing: '0.02em'
      }
    }
  },
  logos: {
    original: '',
    square: [],
    rounded: [],
    circle: []
  }
};

const BrandGuideContext = createContext<BrandGuideContextType | undefined>(undefined);

export function BrandGuideProvider({ children }: { children: React.ReactNode }) {
  const [currentGuide, setCurrentGuide] = useState<BrandGuide>(defaultBrandGuide);
  const [colorNames, setColorNames] = useState<ColorNames>({});
  const [typographyVisibility, setTypographyVisibilityState] = useState<TypographyVisibility>({
    display: ['large', 'regular'],
    heading: ['h1', 'h2', 'h3'],
    body: ['large', 'medium', 'small']
  });
  const [typographyNames, setTypographyNames] = useState<TypographyNames>({});
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [activeTab, setActiveTab] = useState('typography');
  const [activeSection, setActiveSection] = useState('');

  // Load saved data on mount
  useEffect(() => {
    const saved = storage.loadBrandGuide();
    if (saved) {
      setCurrentGuide(saved.guide);
      if (saved.colorNames) setColorNames(saved.colorNames);
      if (saved.typographyVisibility) setTypographyVisibilityState(saved.typographyVisibility);
      if (saved.typographyNames) setTypographyNames(saved.typographyNames);
      if (saved.previewText) setPreviewText(saved.previewText);
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    storage.saveBrandGuide({
      guide: currentGuide,
      colorNames,
      typographyVisibility,
      typographyNames,
      previewText
    });
  }, [currentGuide, colorNames, typographyVisibility, typographyNames, previewText]);

  const setGuideName = (name: string) => {
    setCurrentGuide(prev => ({ ...prev, name }));
  };

  const updateColors = (colors: ColorPalette) => {
    setCurrentGuide(prev => ({ ...prev, colors }));
  };

  const updateTypography = (typography: TypographySet) => {
    setCurrentGuide(prev => ({ ...prev, typography }));
  };

  const updateLogos = (logos: any) => {
    setCurrentGuide(prev => ({ ...prev, logos }));
  };

  const setColorName = (colorKey: string, name: string) => {
    setColorNames(prev => ({ ...prev, [colorKey]: name }));
  };

  const setTypographyName = (styleKey: string, name: string) => {
    setTypographyNames(prev => ({ ...prev, [styleKey]: name }));
  };

  const setTypographyVisibility = (category: 'display' | 'heading' | 'body', styles: string[]) => {
    setTypographyVisibilityState(prev => ({ ...prev, [category]: styles }));
  };

  const addTypographyStyle = (category: 'display' | 'heading' | 'body', styleKey: string, customStyle?: any) => {
    // Add style to visibility
    setTypographyVisibilityState(prev => ({
      ...prev,
      [category]: [...prev[category], styleKey]
    }));

    // If it's a custom style, add it to the typography
    if (customStyle) {
      setCurrentGuide(prev => ({
        ...prev,
        typography: {
          ...prev.typography,
          [category]: {
            ...prev.typography[category],
            [styleKey]: customStyle
          }
        }
      }));
    }
  };

  const removeTypographyStyle = (category: 'display' | 'heading' | 'body', styleKey: string) => {
    // Don't allow removal if it's the last style
    if (typographyVisibility[category].length <= 1) return;

    setTypographyVisibilityState(prev => ({
      ...prev,
      [category]: prev[category].filter(style => style !== styleKey)
    }));

    // Remove from typography names if exists
    const nameKey = `${category}-${styleKey}`;
    setTypographyNames(prev => {
      const newNames = { ...prev };
      delete newNames[nameKey];
      return newNames;
    });
  };

  const exportGuide = (format: 'json' | 'pdf') => {
    if (format === 'json') {
      const exportData = {
        guide: currentGuide,
        colorNames,
        typographyVisibility,
        typographyNames,
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      saveAs(blob, `${currentGuide.name.replace(/\s+/g, '_')}_brand_guide.json`);
    }
  };

  return (
    <BrandGuideContext.Provider
      value={{
        currentGuide,
        colorNames,
        typographyVisibility,
        typographyNames,
        previewText,
        activeTab,
        activeSection,
        setGuideName,
        updateColors,
        updateTypography,
        updateLogos,
        setPreviewText,
        setActiveTab,
        setColorName,
        setTypographyName,
        setTypographyVisibility,
        addTypographyStyle,
        removeTypographyStyle,
        exportGuide
      }}
    >
      {children}
    </BrandGuideContext.Provider>
  );
}

export function useBrandGuide() {
  const context = useContext(BrandGuideContext);
  if (context === undefined) {
    throw new Error('useBrandGuide must be used within a BrandGuideProvider');
  }
  return context;
}
