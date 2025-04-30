
import React from 'react';
import { ColorWithVariants } from '@/types';

interface ColorSwatchProps {
  color: ColorWithVariants | string;
  className?: string;
  onClick?: () => void;
}

export function ColorSwatch({ color, className = '', onClick }: ColorSwatchProps) {
  // Handle both string and ColorWithVariants types
  const colorValue = typeof color === 'string' ? color : color.hex;
  
  return (
    <div 
      className={`rounded-md overflow-hidden shadow-sm border ${className}`}
      onClick={onClick}
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
