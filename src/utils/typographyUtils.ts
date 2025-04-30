
import { TypographySet, TypographyStyle } from '@/types';

/**
 * Default typography settings with Inter font
 */
export const defaultTypographySet: TypographySet = {
  display: {
    large: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '64px',
      fontWeight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    medium: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '48px',
      fontWeight: 700,
      lineHeight: '1.1',
      letterSpacing: '-0.01em',
    },
    regular: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '40px',
      fontWeight: 600,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    thin: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '40px',
      fontWeight: 400,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
  },
  heading: {
    h1: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '36px',
      fontWeight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    h2: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '32px',
      fontWeight: 700,
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: '1.3',
      letterSpacing: '0',
    },
    h4: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: '1.3',
      letterSpacing: '0',
    },
    h5: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '20px',
      fontWeight: 600,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    h6: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontWeight: 600,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
  },
  body: {
    large: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    medium: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    small: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    largeLight: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    mediumLight: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      fontWeight: 300,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    smallLight: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 300,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    largeMedium: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    mediumMedium: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    smallMedium: {
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
  },
};

/**
 * Load a Google Font
 */
export const loadGoogleFont = (fontFamily: string): void => {
  if (!fontFamily || fontFamily === 'inherit') return;
  
  const formattedFontFamily = fontFamily.replace(/\s+/g, '+');
  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@300;400;500;600;700&display=swap`;
  link.rel = 'stylesheet';
  
  // Check if this font is already loaded
  const existingLinks = document.querySelectorAll(`link[href^="https://fonts.googleapis.com/css2?family=${formattedFontFamily}"]`);
  if (existingLinks.length === 0) {
    document.head.appendChild(link);
    console.log(`Loaded font: ${fontFamily}`);
  }
};

/**
 * Generates CSS rule text for a typography style
 */
export const generateTypographyCss = (style: TypographyStyle): string => {
  return `font-family: ${style.fontFamily};
font-size: ${style.fontSize};
font-weight: ${style.fontWeight};
line-height: ${style.lineHeight};
letter-spacing: ${style.letterSpacing};
${style.textTransform ? `text-transform: ${style.textTransform};` : ''}`;
};

/**
 * Sets the font family across all typography styles
 */
export const setFontFamily = (
  typographySet: TypographySet,
  fontFamily: string,
  category: 'display' | 'heading' | 'body' | 'all' = 'all'
): TypographySet => {
  const newTypographySet = JSON.parse(JSON.stringify(typographySet)) as TypographySet;
  
  if (category === 'all' || category === 'display') {
    for (const key in newTypographySet.display) {
      if (Object.prototype.hasOwnProperty.call(newTypographySet.display, key)) {
        // @ts-ignore - Dealing with dynamic keys
        newTypographySet.display[key].fontFamily = fontFamily;
      }
    }
  }
  
  if (category === 'all' || category === 'heading') {
    for (const key in newTypographySet.heading) {
      if (Object.prototype.hasOwnProperty.call(newTypographySet.heading, key)) {
        // @ts-ignore - Dealing with dynamic keys
        newTypographySet.heading[key].fontFamily = fontFamily;
      }
    }
  }
  
  if (category === 'all' || category === 'body') {
    for (const key in newTypographySet.body) {
      if (Object.prototype.hasOwnProperty.call(newTypographySet.body, key)) {
        // @ts-ignore - Dealing with dynamic keys
        newTypographySet.body[key].fontFamily = fontFamily;
      }
    }
  }
  
  // Load the Google Font
  loadGoogleFont(fontFamily);
  
  return newTypographySet;
};

/**
 * Suggests line height based on font size
 */
export const suggestLineHeight = (fontSize: string): string => {
  const size = parseInt(fontSize);
  
  if (size >= 40) return '1.1';
  if (size >= 32) return '1.2';
  if (size >= 24) return '1.3';
  if (size >= 18) return '1.4';
  return '1.5';
};

/**
 * Suggests letter spacing based on font size and weight
 */
export const suggestLetterSpacing = (fontSize: string, fontWeight: number | string): string => {
  const size = parseInt(fontSize);
  const weight = typeof fontWeight === 'string' ? parseInt(fontWeight) : fontWeight;
  
  if (size >= 40 && weight >= 700) return '-0.02em';
  if (size >= 24 && weight >= 600) return '-0.01em';
  return '0';
};

/**
 * Generates tailwind classes for a typography style
 */
export const typographyToTailwind = (style: TypographyStyle): string => {
  // Convert font size to tailwind
  const fontSize = parseInt(style.fontSize);
  let fontSizeClass = '';
  
  if (fontSize >= 64) fontSizeClass = 'text-6xl';
  else if (fontSize >= 48) fontSizeClass = 'text-5xl';
  else if (fontSize >= 40) fontSizeClass = 'text-4xl';
  else if (fontSize >= 36) fontSizeClass = 'text-3xl';
  else if (fontSize >= 30) fontSizeClass = 'text-2xl';
  else if (fontSize >= 24) fontSizeClass = 'text-xl';
  else if (fontSize >= 20) fontSizeClass = 'text-lg';
  else if (fontSize >= 16) fontSizeClass = 'text-base';
  else if (fontSize >= 14) fontSizeClass = 'text-sm';
  else fontSizeClass = 'text-xs';
  
  // Convert font weight to tailwind
  const weight = typeof style.fontWeight === 'string' 
    ? parseInt(style.fontWeight)
    : style.fontWeight;
  
  let fontWeightClass = '';
  if (weight >= 700) fontWeightClass = 'font-bold';
  else if (weight >= 600) fontWeightClass = 'font-semibold';
  else if (weight >= 500) fontWeightClass = 'font-medium';
  else if (weight >= 400) fontWeightClass = 'font-normal';
  else fontWeightClass = 'font-light';
  
  // Line height
  let lineHeightClass = '';
  const lineHeight = parseFloat(style.lineHeight);
  
  if (lineHeight <= 1.1) lineHeightClass = 'leading-none';
  else if (lineHeight <= 1.25) lineHeightClass = 'leading-tight';
  else if (lineHeight <= 1.375) lineHeightClass = 'leading-snug';
  else if (lineHeight <= 1.5) lineHeightClass = 'leading-normal';
  else if (lineHeight <= 1.625) lineHeightClass = 'leading-relaxed';
  else lineHeightClass = 'leading-loose';
  
  // Letter spacing
  let letterSpacingClass = '';
  if (style.letterSpacing === '-0.02em') letterSpacingClass = 'tracking-tighter';
  else if (style.letterSpacing === '-0.01em') letterSpacingClass = 'tracking-tight';
  else if (style.letterSpacing === '0') letterSpacingClass = 'tracking-normal';
  else if (style.letterSpacing === '0.01em') letterSpacingClass = 'tracking-wide';
  else if (style.letterSpacing === '0.02em') letterSpacingClass = 'tracking-wider';
  else letterSpacingClass = 'tracking-widest';
  
  // Text transform
  const textTransformClass = style.textTransform ? `${style.textTransform}` : '';
  
  return `${fontSizeClass} ${fontWeightClass} ${lineHeightClass} ${letterSpacingClass} ${textTransformClass}`.trim();
};
