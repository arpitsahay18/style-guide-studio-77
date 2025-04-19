
/**
 * Converts a HEX color to RGB format
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove the hash if present
  const cleanHex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return { r, g, b };
};

/**
 * Converts RGB to HEX format
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
};

/**
 * Helper function for rgbToHex
 */
const componentToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

/**
 * Converts RGB to CMYK format
 */
export const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
  // Convert RGB to 0-1 scale
  const rRatio = r / 255;
  const gRatio = g / 255;
  const bRatio = b / 255;
  
  // Calculate CMY
  let k = 1 - Math.max(rRatio, gRatio, bRatio);
  
  // Edge case: if k is 1, CMYK is (0,0,0,1) - pure black
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  
  // Calculate CMY components
  const c = (1 - rRatio - k) / (1 - k);
  const m = (1 - gRatio - k) / (1 - k);
  const y = (1 - bRatio - k) / (1 - k);
  
  // Convert to percentage
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
};

/**
 * Formats RGB object to string
 */
export const formatRgb = (rgb: { r: number; g: number; b: number }): string => {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

/**
 * Formats CMYK object to string
 */
export const formatCmyk = (cmyk: { c: number; m: number; y: number; k: number }): string => {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
};

/**
 * Generates tints of a color (lighter variants)
 */
export const generateTints = (hex: string, steps: number = 5): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const tints: string[] = [];
  
  for (let i = 1; i <= steps; i++) {
    const tintFactor = i / (steps + 1);
    const tintR = Math.round(r + (255 - r) * tintFactor);
    const tintG = Math.round(g + (255 - g) * tintFactor);
    const tintB = Math.round(b + (255 - b) * tintFactor);
    
    tints.push(rgbToHex(tintR, tintG, tintB));
  }
  
  return tints;
};

/**
 * Generates shades of a color (darker variants)
 */
export const generateShades = (hex: string, steps: number = 5): string[] => {
  const { r, g, b } = hexToRgb(hex);
  const shades: string[] = [];
  
  for (let i = 1; i <= steps; i++) {
    const shadeFactor = 1 - i / (steps + 1);
    const shadeR = Math.round(r * shadeFactor);
    const shadeG = Math.round(g * shadeFactor);
    const shadeB = Math.round(b * shadeFactor);
    
    shades.push(rgbToHex(shadeR, shadeG, shadeB));
  }
  
  return shades;
};

/**
 * Calculates the contrast ratio between two colors
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string): number => {
    const { r, g, b } = hexToRgb(hex);
    
    // Convert RGB to relative luminance following WCAG formula
    const getRGBComponent = (component: number): number => {
      const value = component / 255;
      return value <= 0.03928 
        ? value / 12.92 
        : Math.pow((value + 0.055) / 1.055, 2.4);
    };
    
    const R = getRGBComponent(r);
    const G = getRGBComponent(g);
    const B = getRGBComponent(b);
    
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };
  
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  // Calculate contrast ratio
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Gets complementary color
 */
export const getComplementaryColor = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(255 - r, 255 - g, 255 - b);
};

/**
 * Generates harmonious colors (triadic)
 */
export const getTriadicColors = (hex: string): string[] => {
  const { r, g, b } = hexToRgb(hex);
  return [
    hex,
    rgbToHex(b, r, g), // 120° rotation
    rgbToHex(g, b, r)  // 240° rotation
  ];
};

/**
 * Checks if a color is light or dark
 */
export const isLightColor = (hex: string): boolean => {
  const { r, g, b } = hexToRgb(hex);
  // Using the YIQ formula to determine brightness
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128;
};

/**
 * Gets a readable text color (black or white) based on background
 */
export const getReadableTextColor = (backgroundColor: string): string => {
  return isLightColor(backgroundColor) ? '#000000' : '#FFFFFF';
};
