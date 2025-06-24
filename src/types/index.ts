import { CSSProperties } from 'react';

// Typography Types
export interface FontFamily {
  name: string;
  category: "serif" | "sans-serif" | "monospace" | "display" | "handwriting" | "custom";
  fallback?: string;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number | string;
  lineHeight: string;
  letterSpacing: string;
  textTransform?: CSSProperties['textTransform'];
}

export interface TypographySet {
  display: {
    large: TypographyStyle;
    medium: TypographyStyle;
    regular: TypographyStyle;
    thin?: TypographyStyle;
  };
  heading: {
    h1: TypographyStyle;
    h2: TypographyStyle;
    h3: TypographyStyle;
    h4: TypographyStyle;
    h5: TypographyStyle;
    h6: TypographyStyle;
  };
  body: {
    large: TypographyStyle;
    medium: TypographyStyle;
    small: TypographyStyle;
    largeLight?: TypographyStyle;
    mediumLight?: TypographyStyle;
    smallLight?: TypographyStyle;
    largeMedium?: TypographyStyle;
    mediumMedium?: TypographyStyle;
    smallMedium?: TypographyStyle;
  };
}

// Color Types
export interface ColorInfo {
  hex: string;
  rgb: string;
  cmyk: string;
}

export interface ColorInput {
  hex: string;
}

export interface ColorWithTintsShades extends ColorInfo {
  tints: string[];
  shades: string[];
  blackContrast: number;
  whiteContrast: number;
}

export interface ColorWithVariants extends ColorInfo {
  tints: string[];
  shades: string[];
  blackContrast: number;
  whiteContrast: number;
}

export interface ColorPalette {
  primary: ColorWithVariants[];
  secondary: ColorWithVariants[];
  neutral: ColorWithVariants[];
}

// Logo Types
export interface LogoVariation {
  src: string;
  background: string;
  type: "color" | "white" | "black";
}

export interface LogoSet {
  original: string;
  square: LogoVariation[];
  rounded: LogoVariation[];
  circle: LogoVariation[];
}

// Brand Guide Type
export interface BrandGuide {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  typography: TypographySet;
  colors: ColorPalette;
  logos: LogoSet;
}

// User Type
export interface User {
  id: string;
  email: string;
  name?: string;
  guides: BrandGuide[];
}
