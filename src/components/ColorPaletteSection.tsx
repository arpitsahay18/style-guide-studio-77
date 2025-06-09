import React, { useState } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { ColorWithVariants, ColorPalette } from '@/types';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { EnhancedColorForm } from '@/components/EnhancedColorForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, X, Copy, Check } from 'lucide-react';
import { hexToRgb, formatRgb, rgbToCmyk, formatCmyk, generateTints, generateShades, calculateContrastRatio } from '@/utils/colorUtils';
import { useToast } from "@/components/ui/use-toast";

interface ColorDetailProps {
  color: ColorWithVariants;
}

function ColorDetail({ color }: ColorDetailProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string>('');
  
  // Add safety check for color object
  if (!color || !color.hex) {
    return (
      <div className="p-4 border border-border rounded-md bg-card">
        <p className="text-muted-foreground">Unable to display color details</p>
      </div>
    );
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    toast({
      title: "Color code copied!",
      description: `${text} has been copied to your clipboard.`
    });
    setTimeout(() => setCopied(''), 2000);
  };
  
  return (
    <div className="p-4 border border-border rounded-md bg-card animate-scale-in">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{color.hex}</h3>
            <p className="text-sm text-muted-foreground">
              {color.rgb} · {color.cmyk}
            </p>
          </div>
          <div className="flex gap-2">
            <div 
              className="w-16 h-16 rounded-md border border-border shadow-sm" 
              style={{ backgroundColor: color.hex }} 
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => copyToClipboard(color.hex)} 
              className="h-8 w-8"
            >
              {copied === color.hex ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Contrast Ratio</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-white border border-border"></div>
              <span className="text-sm">
                White: {color.whiteContrast?.toFixed(2) || 'N/A'}
                <span className={color.whiteContrast >= 4.5 ? "text-green-500 ml-1" : "text-destructive ml-1"}>
                  {color.whiteContrast >= 4.5 ? "✓" : "✗"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-black border border-border"></div>
              <span className="text-sm">
                Black: {color.blackContrast?.toFixed(2) || 'N/A'}
                <span className={color.blackContrast >= 4.5 ? "text-green-500 ml-1" : "text-destructive ml-1"}>
                  {color.blackContrast >= 4.5 ? "✓" : "✗"}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Tints</h4>
          <div className="grid grid-cols-5 gap-1">
            {color.tints?.map((tint, index) => (
              <div 
                key={`tint-${index}`} 
                className="w-full aspect-square rounded-sm border border-border cursor-pointer relative group" 
                style={{ backgroundColor: tint }} 
                onClick={() => copyToClipboard(tint)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
                    {copied === tint ? 'Copied!' : 'Copy'}
                  </span>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  {tint}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Shades</h4>
          <div className="grid grid-cols-5 gap-1">
            {color.shades?.map((shade, index) => (
              <div 
                key={`shade-${index}`} 
                className="w-full aspect-square rounded-sm border border-border cursor-pointer relative group" 
                style={{ backgroundColor: shade }} 
                onClick={() => copyToClipboard(shade)}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
                    {copied === shade ? 'Copied!' : 'Copy'}
                  </span>
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  {shade}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ColorCategoryProps {
  title: string;
  description: string;
  colors: ColorWithVariants[];
  onAddColor: (color: string) => void;
  onRemoveColor: (index: number) => void;
  maxColors?: number;
  categoryType: 'primary' | 'secondary' | 'neutral';
}

function ColorCategory({
  title,
  description,
  colors,
  onAddColor,
  onRemoveColor,
  maxColors = 3,
  categoryType
}: ColorCategoryProps) {
  const { colorNames, setColorName } = useBrandGuide();
  const [showColorForm, setShowColorForm] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  
  const handleAddColor = (color: string) => {
    onAddColor(color);
    setShowColorForm(false);
  };
  
  const handleColorClick = (index: number) => {
    setSelectedColorIndex(index === selectedColorIndex ? null : index);
  };
  
  const handleRemoveColor = (index: number) => {
    // Close color detail if the removed color was selected
    if (selectedColorIndex === index) {
      setSelectedColorIndex(null);
    } else if (selectedColorIndex !== null && selectedColorIndex > index) {
      // Adjust selected index if a color before it was removed
      setSelectedColorIndex(selectedColorIndex - 1);
    }
    onRemoveColor(index);
  };

  const handleColorNameChange = (index: number, name: string) => {
    const colorKey = `${categoryType}-${index}`;
    setColorName(colorKey, name);
  };
  
  return (
    <Card className="mb-8" id={`${categoryType}-colors`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {colors.map((color, index) => {
            const colorKey = `${categoryType}-${index}`;
            const colorName = colorNames[colorKey];
            
            return (
              <div key={`${categoryType}-${index}`} className="relative group">
                <ColorSwatch 
                  color={color} 
                  colorKey={colorKey}
                  colorName={colorName}
                  onNameChange={(name) => handleColorNameChange(index, name)}
                  showNameEditor={true}
                  className={`w-full cursor-pointer transition-all duration-300 ${
                    selectedColorIndex === index ? 'ring-2 ring-primary' : ''
                  }`} 
                  onClick={() => handleColorClick(index)} 
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveColor(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
          
          {colors.length < maxColors && !showColorForm && (
            <button 
              className="h-32 rounded-md border border-dashed border-border flex items-center justify-center transition-colors hover:bg-accent/20" 
              onClick={() => setShowColorForm(true)}
              id={`add-${categoryType}-color`}
            >
              <Plus className="h-6 w-6 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {showColorForm && (
          <div className="border border-border rounded-md p-4 bg-card animate-fade-in">
            <EnhancedColorForm 
              onAdd={handleAddColor} 
              onCancel={() => setShowColorForm(false)} 
            />
          </div>
        )}
        
        {selectedColorIndex !== null && colors[selectedColorIndex] && (
          <ColorDetail color={colors[selectedColorIndex]} />
        )}
      </CardContent>
    </Card>
  );
}

export function ColorPaletteSection() {
  const { currentGuide, updateColors } = useBrandGuide();
  const { toast } = useToast();
  const [colorNames, setColorNames] = useState<{ [key: string]: string }>({});

  // Helper function to process a color when added
  const processColor = (hex: string): ColorWithVariants | null => {
    try {
      const rgb = hexToRgb(hex);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      return {
        hex,
        rgb: formatRgb(rgb),
        cmyk: formatCmyk(cmyk),
        tints: generateTints(hex),
        shades: generateShades(hex),
        blackContrast: calculateContrastRatio(hex, '#000000'),
        whiteContrast: calculateContrastRatio(hex, '#FFFFFF')
      };
    } catch (error) {
      console.error('Error processing color:', error);
      toast({
        variant: "destructive",
        title: "Invalid color",
        description: "Please enter a valid hex color code."
      });
      return null;
    }
  };

  // Add a color to a specific category
  const addColor = (category: 'primary' | 'secondary' | 'neutral', colorHex: string) => {
    const newColor = processColor(colorHex);
    if (!newColor) return;

    const updatedColors: ColorPalette = {
      ...currentGuide.colors,
      [category]: [...currentGuide.colors[category], newColor]
    };
    updateColors(updatedColors);
  };

  // Remove a color from a specific category with safety checks
  const removeColor = (category: 'primary' | 'secondary' | 'neutral', index: number) => {
    const currentColors = currentGuide.colors[category];
    
    // Safety check to ensure index is valid
    if (index < 0 || index >= currentColors.length) {
      console.error('Invalid color index for removal:', index);
      return;
    }

    const updatedColors: ColorPalette = {
      ...currentGuide.colors,
      [category]: currentColors.filter((_, i) => i !== index)
    };
    
    updateColors(updatedColors);
    
    // Remove color name
    const colorKey = `${category}-${index}`;
    setColorNames(prev => {
      const newNames = { ...prev };
      delete newNames[colorKey];
      
      // Adjust indices for remaining colors
      const adjustedNames: { [key: string]: string } = {};
      Object.entries(newNames).forEach(([key, value]) => {
        if (key.startsWith(`${category}-`)) {
          const keyIndex = parseInt(key.split('-')[1]);
          if (keyIndex > index) {
            adjustedNames[`${category}-${keyIndex - 1}`] = value;
          } else {
            adjustedNames[key] = value;
          }
        } else {
          adjustedNames[key] = value;
        }
      });
      
      return adjustedNames;
    });
    
    toast({
      title: "Color removed",
      description: `Removed color from ${category} palette.`
    });
  };

  // Update color name
  const updateColorName = (category: 'primary' | 'secondary' | 'neutral', index: number, name: string) => {
    const colorKey = `${category}-${index}`;
    setColorNames(prev => ({
      ...prev,
      [colorKey]: name
    }));
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in" id="color-settings">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Color Palette</h2>
      </div>
      
      <div className="space-y-8">
        <ColorCategory 
          title="Primary Colors" 
          description="The main brand colors that represent your identity. These colors should be used for main UI elements and branding." 
          colors={currentGuide.colors.primary} 
          onAddColor={(color) => addColor('primary', color)} 
          onRemoveColor={(index) => removeColor('primary', index)}
          categoryType="primary"
        />
        
        <ColorCategory 
          title="Secondary Colors" 
          description="Complementary colors that support the primary palette. Use these for accents, highlights, and to add visual interest." 
          colors={currentGuide.colors.secondary} 
          onAddColor={(color) => addColor('secondary', color)} 
          onRemoveColor={(index) => removeColor('secondary', index)}
          categoryType="secondary"
        />
        
        <ColorCategory 
          title="Neutral Colors" 
          description="Grayscale and background tones for text, backgrounds, and UI elements. These provide balance to your color scheme." 
          colors={currentGuide.colors.neutral} 
          onAddColor={(color) => addColor('neutral', color)} 
          onRemoveColor={(index) => removeColor('neutral', index)}
          categoryType="neutral"
        />
      </div>
    </div>
  );
}
