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
export function getTriadicColors(baseColor: string): string[] {
  try {
    // Ensure baseColor is a valid hex
    if (!baseColor.startsWith('#')) {
      baseColor = '#' + baseColor;
    }
    
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(baseColor)) {
      throw new Error('Invalid hex color');
    }
    
    // Convert hex to HSL
    const rgb = hexToRgb(baseColor);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else {
        h = (r - g) / d + 4;
      }
      
      h /= 6;
    }
    
    // Create triadic colors (120° apart in the color wheel)
    const h1 = h;
    const h2 = (h + 1/3) % 1;
    const h3 = (h + 2/3) % 1;
    
    // Convert HSL back to hex
    const color1 = baseColor;
    const color2 = hslToHex(h2, s, l);
    const color3 = hslToHex(h3, s, l);
    
    return [color1, color2, color3];
  } catch (error) {
    console.error('Error generating triadic colors:', error);
    return ['#FF0000', '#00FF00', '#0000FF']; // Fallback to basic RGB
  }
}

/**
 * Helper function to convert HSL to Hex
 */
export function hslToHex(h: number, s: number, l: number): string {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

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
