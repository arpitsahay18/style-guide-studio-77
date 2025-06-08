
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Copy, Check, Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { hexToRgb, formatRgb, rgbToCmyk, formatCmyk, generateTints, generateShades, calculateContrastRatio } from '@/utils/colorUtils';
import { useToast } from "@/components/ui/use-toast";

interface EnhancedColorFormProps {
  onAdd: (color: string) => void;
  onCancel: () => void;
}

export function EnhancedColorForm({ onAdd, onCancel }: EnhancedColorFormProps) {
  const [colorValue, setColorValue] = useState('#FF4C4C');
  const [error, setError] = useState('');
  const [colorDetails, setColorDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Process color and generate details in real-time
  useEffect(() => {
    try {
      const rgb = hexToRgb(colorValue);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      const details = {
        hex: colorValue,
        rgb: formatRgb(rgb),
        cmyk: formatCmyk(cmyk),
        tints: generateTints(colorValue),
        shades: generateShades(colorValue),
        blackContrast: calculateContrastRatio(colorValue, '#000000'),
        whiteContrast: calculateContrastRatio(colorValue, '#FFFFFF')
      };
      
      setColorDetails(details);
      setError('');
    } catch (err) {
      setError('Invalid color value');
      setColorDetails(null);
    }
  }, [colorValue]);

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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    setColorValue(value.toUpperCase());
  };

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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="color-hex">Hex Color Code</Label>
          <div className="flex gap-2 mt-1">
            <Input 
              id="color-hex" 
              type="text" 
              value={colorValue} 
              onChange={handleInputChange}
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
          {error && (
            <p className="text-destructive text-sm mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" /> {error}
            </p>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Color</Button>
        </div>
      </form>

      {/* Real-time Context Panel */}
      {colorDetails && (
        <div className="p-4 border border-border rounded-md bg-card animate-fade-in">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{colorDetails.hex}</h3>
                <p className="text-sm text-muted-foreground">
                  {colorDetails.rgb} · {colorDetails.cmyk}
                </p>
              </div>
              <div className="flex gap-2">
                <div 
                  className="w-16 h-16 rounded-md border border-border shadow-sm" 
                  style={{ backgroundColor: colorDetails.hex }} 
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => copyToClipboard(colorDetails.hex)} 
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
                    White: {colorDetails.whiteContrast?.toFixed(2) || 'N/A'}
                    <span className={colorDetails.whiteContrast >= 4.5 ? "text-green-500 ml-1" : "text-destructive ml-1"}>
                      {colorDetails.whiteContrast >= 4.5 ? "✓" : "✗"}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-black border border-border"></div>
                  <span className="text-sm">
                    Black: {colorDetails.blackContrast?.toFixed(2) || 'N/A'}
                    <span className={colorDetails.blackContrast >= 4.5 ? "text-green-500 ml-1" : "text-destructive ml-1"}>
                      {colorDetails.blackContrast >= 4.5 ? "✓" : "✗"}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Tints</h4>
              <div className="grid grid-cols-5 gap-1">
                {colorDetails.tints?.map((tint: string, index: number) => (
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
                {colorDetails.shades?.map((shade: string, index: number) => (
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
      )}
    </div>
  );
}
