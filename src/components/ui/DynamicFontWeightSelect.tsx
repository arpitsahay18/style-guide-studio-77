import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface FontVariant {
  weight: string;
  style: string;
  label: string;
}

interface DynamicFontWeightSelectProps {
  fontFamily: string;
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
}

const FALLBACK_WEIGHTS = [
  { weight: '300', style: 'normal', label: 'Light (300)' },
  { weight: '400', style: 'normal', label: 'Regular (400)' },
  { weight: '500', style: 'normal', label: 'Medium (500)' },
  { weight: '600', style: 'normal', label: 'Semi-Bold (600)' },
  { weight: '700', style: 'normal', label: 'Bold (700)' },
];

export function DynamicFontWeightSelect({
  fontFamily,
  value,
  onValueChange,
  id
}: DynamicFontWeightSelectProps) {
  const [availableVariants, setAvailableVariants] = useState<FontVariant[]>(FALLBACK_WEIGHTS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFontVariants = async () => {
      if (!fontFamily || fontFamily.includes('serif') || fontFamily.includes('sans-serif')) {
        setAvailableVariants(FALLBACK_WEIGHTS);
        return;
      }

      setIsLoading(true);
      try {
        const cleanFontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyB6p9g8KC6gCUjmRsBLrCgukIqlM_g4cKs`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch fonts');
        }
        
        const data = await response.json();
        const font = data.items?.find((item: any) => 
          item.family.toLowerCase() === cleanFontName.toLowerCase()
        );

        if (font && font.variants) {
          const variants: FontVariant[] = [];
          
          font.variants.forEach((variant: string) => {
            if (variant === 'regular') {
              variants.push({ weight: '400', style: 'normal', label: 'Regular (400)' });
            } else if (variant === 'italic') {
              variants.push({ weight: '400', style: 'italic', label: 'Regular Italic (400)' });
            } else if (variant.endsWith('italic')) {
              const weight = variant.replace('italic', '');
              const weightLabel = getWeightLabel(weight);
              variants.push({ 
                weight, 
                style: 'italic', 
                label: `${weightLabel} Italic (${weight})` 
              });
            } else if (/^\d+$/.test(variant)) {
              const weightLabel = getWeightLabel(variant);
              variants.push({ 
                weight: variant, 
                style: 'normal', 
                label: `${weightLabel} (${variant})` 
              });
            }
          });

          if (variants.length > 0) {
            setAvailableVariants(variants);
          } else {
            setAvailableVariants(FALLBACK_WEIGHTS);
          }
        } else {
          setAvailableVariants(FALLBACK_WEIGHTS);
        }
      } catch (error) {
        console.error('Error fetching font variants:', error);
        setAvailableVariants(FALLBACK_WEIGHTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFontVariants();
  }, [fontFamily]);

  const getWeightLabel = (weight: string): string => {
    const weightMap: { [key: string]: string } = {
      '100': 'Thin',
      '200': 'Extra Light',
      '300': 'Light',
      '400': 'Regular',
      '500': 'Medium',
      '600': 'Semi-Bold',
      '700': 'Bold',
      '800': 'Extra Bold',
      '900': 'Black'
    };
    return weightMap[weight] || weight;
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={isLoading ? "Loading weights..." : "Select weight"} />
      </SelectTrigger>
      <SelectContent>
        {availableVariants.map((variant) => (
          <SelectItem key={`${variant.weight}-${variant.style}`} value={variant.weight}>
            {variant.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}