
import React, { useState } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { ColorWithVariants, ColorPalette } from '@/types';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, X, AlertCircle, Copy, Check, Palette } from 'lucide-react';
import { hexToRgb, formatRgb, rgbToCmyk, formatCmyk, generateTints, generateShades, calculateContrastRatio, getTriadicColors } from '@/utils/colorUtils';
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

interface ColorFormProps {
  onAdd: (color: string) => void;
  onCancel: () => void;
}
function ColorForm({
  onAdd,
  onCancel
}: ColorFormProps) {
  const [colorValue, setColorValue] = useState('#000000');
  const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate hex color
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(colorValue)) {
      setError('Please enter a valid hex color (e.g., #FF5733)');
      return;
    }
    onAdd(colorValue.toUpperCase());
  };
  const handleColorChange = (color: string) => {
    setColorValue(color.toUpperCase());
    setError(''); // Clear any previous errors
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="color-hex">Hex Color Code</Label>
        <div className="flex gap-2 mt-1">
          <Input 
            id="color-hex" 
            type="text" 
            value={colorValue} 
            onChange={e => setColorValue(e.target.value)} 
            placeholder="#000000" 
            className="font-mono" 
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="w-10 h-10 p-0" 
                style={{backgroundColor: colorValue}}
              >
                <span className="sr-only">Pick a color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="flex flex-col gap-4">
                <h4 className="font-medium">Pick a color</h4>
                <HexColorPicker color={colorValue} onChange={handleColorChange} />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Selected: {colorValue}
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onAdd(colorValue.toUpperCase())}
                  >
                    <Palette className="h-4 w-4 mr-1" />
                    Select
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {error && <p className="text-destructive text-sm mt-1 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" /> {error}
          </p>}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Color</Button>
      </div>
    </form>;
}

interface ColorDetailProps {
  color: ColorWithVariants;
}

function ColorDetail({ color }: ColorDetailProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
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
    setCopied(true);
    toast({
      title: "Color code copied!",
      description: `${text} has been copied to your clipboard.`
    });
    setTimeout(() => setCopied(false), 2000);
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
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                className="w-full aspect-square rounded-sm border border-border cursor-pointer" 
                style={{ backgroundColor: tint }} 
                title={tint} 
                onClick={() => copyToClipboard(tint)} 
              />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Shades</h4>
          <div className="grid grid-cols-5 gap-1">
            {color.shades?.map((shade, index) => (
              <div 
                key={`shade-${index}`} 
                className="w-full aspect-square rounded-sm border border-border cursor-pointer" 
                style={{ backgroundColor: shade }} 
                title={shade} 
                onClick={() => copyToClipboard(shade)} 
              />
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
  
  return (
    <Card className="mb-8" id={`${categoryType}-colors`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {colors.map((color, index) => (
            <div key={`${categoryType}-${index}`} className="relative group">
              <ColorSwatch 
                color={color} 
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
          ))}
          
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
            <ColorForm onAdd={handleAddColor} onCancel={() => setShowColorForm(false)} />
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
    
    toast({
      title: "Color removed",
      description: `Removed color from ${category} palette.`
    });
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
