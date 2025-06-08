
import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ColorWithVariants } from '@/types';
import { generateColorVariants, getColorName, calculateContrast } from '@/utils/colorUtils';

interface EnhancedColorFormProps {
  onAddColor: (color: ColorWithVariants) => void;
  onCancel: () => void;
  initialColor?: string;
}

export function EnhancedColorForm({ onAddColor, onCancel, initialColor = '#3b82f6' }: EnhancedColorFormProps) {
  const [color, setColor] = useState(initialColor);
  const [colorName, setColorName] = useState('');
  const [variants, setVariants] = useState<ColorWithVariants | null>(null);

  useEffect(() => {
    try {
      const colorVariants = generateColorVariants(color);
      setVariants(colorVariants);
      
      if (!colorName) {
        const suggestedName = getColorName(color);
        setColorName(suggestedName);
      }
    } catch (error) {
      console.error('Error generating color variants:', error);
      setVariants(null);
    }
  }, [color, colorName]);

  const handleSubmit = () => {
    if (!variants) {
      console.error('No variants available');
      return;
    }

    try {
      const finalColor: ColorWithVariants = {
        ...variants,
        name: colorName.trim() || variants.name
      };
      
      onAddColor(finalColor);
    } catch (error) {
      console.error('Error adding color:', error);
    }
  };

  const handleColorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 15);
    setColorName(value);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
      setColor(value);
    }
  };

  if (!variants) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Loading color picker...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="colorName">Color Name</Label>
          <Input
            id="colorName"
            value={colorName}
            onChange={handleColorNameChange}
            placeholder="Enter color name"
            maxLength={15}
          />
        </div>

        <div>
          <Label htmlFor="hexInput">Hex Code</Label>
          <Input
            id="hexInput"
            value={color}
            onChange={handleHexChange}
            placeholder="#000000"
          />
        </div>

        <div className="flex justify-center">
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Color Variants</h4>
        
        <div className="grid grid-cols-5 gap-2">
          {variants.shades.map((shade, index) => (
            <div key={`shade-${index}`} className="text-center">
              <div 
                className="w-full h-12 rounded border"
                style={{ backgroundColor: shade }}
              />
              <p className="text-xs mt-1">Shade {(index + 1) * 100}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {variants.tints.map((tint, index) => (
            <div key={`tint-${index}`} className="text-center">
              <div 
                className="w-full h-12 rounded border"
                style={{ backgroundColor: tint }}
              />
              <p className="text-xs mt-1">Tint {(index + 1) * 100}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h5 className="font-medium">Contrast Information</h5>
          <div className="text-sm space-y-1">
            <p>Contrast with white: {calculateContrast(color, '#ffffff').toFixed(2)}:1</p>
            <p>Contrast with black: {calculateContrast(color, '#000000').toFixed(2)}:1</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Add Color
        </Button>
      </div>
    </div>
  );
}
