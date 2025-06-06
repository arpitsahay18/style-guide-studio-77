
import React from 'react';
import { ColorWithVariants } from '@/types';

interface ColorSwatchProps {
  color: ColorWithVariants | string;
  className?: string;
  onClick?: () => void;
}

export function ColorSwatch({ color, className = '', onClick }: ColorSwatchProps) {
  // Handle both string and ColorWithVariants types with proper error checking
  let colorValue = '#000000'; // Default fallback color
  
  if (typeof color === 'string') {
    colorValue = color;
  } else if (color && typeof color === 'object' && color.hex) {
    colorValue = color.hex;
  } else {
    console.warn('Invalid color provided to ColorSwatch:', color);
  }
  
  return (
    <div 
      className={`rounded-md overflow-hidden shadow-sm border ${className}`}
      onClick={onClick}
      data-color-swatch
    >
      <div 
        className="h-24 w-full" 
        style={{ backgroundColor: colorValue }}
      />
      <div className="p-3 bg-white dark:bg-gray-800">
        <p className="font-medium">{colorValue}</p>
      </div>
    </div>
  );
}
