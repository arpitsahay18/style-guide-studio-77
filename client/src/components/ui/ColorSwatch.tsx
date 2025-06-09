
import React, { useState } from 'react';
import { ColorWithVariants } from '@/types';
import { Input } from '@/components/ui/input';

interface ColorSwatchProps {
  color: ColorWithVariants | string;
  colorKey?: string;
  colorName?: string;
  onNameChange?: (name: string) => void;
  className?: string;
  onClick?: () => void;
  showNameEditor?: boolean;
}

export function ColorSwatch({ 
  color, 
  colorKey,
  colorName, 
  onNameChange, 
  className = '', 
  onClick,
  showNameEditor = false 
}: ColorSwatchProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(colorName || '');
  
  // Handle both string and ColorWithVariants types with proper error checking
  let colorValue = '#000000'; // Default fallback color
  
  if (typeof color === 'string') {
    colorValue = color;
  } else if (color && typeof color === 'object' && color.hex) {
    colorValue = color.hex;
  } else {
    console.warn('Invalid color provided to ColorSwatch:', color);
  }
  
  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showNameEditor && onNameChange) {
      setIsEditing(true);
      setTempName(colorName || colorValue);
    }
  };

  const handleNameSave = () => {
    if (onNameChange) {
      const finalName = tempName.trim().slice(0, 20) || colorValue;
      onNameChange(finalName);
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setTempName(colorName || colorValue);
      setIsEditing(false);
    }
  };
  
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
        {isEditing ? (
          <Input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleKeyPress}
            className="font-medium text-sm h-6 px-1"
            maxLength={20}
            autoFocus
          />
        ) : (
          <p 
            className={`font-medium text-sm ${showNameEditor && onNameChange ? 'cursor-pointer hover:text-primary' : ''}`}
            onClick={handleNameClick}
            title={showNameEditor && onNameChange ? 'Click to edit name (max 20 characters)' : undefined}
          >
            {colorName || colorValue}
          </p>
        )}
      </div>
    </div>
  );
}
