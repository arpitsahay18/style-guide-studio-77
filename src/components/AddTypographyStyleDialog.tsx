
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImprovedFontSelector } from './ImprovedFontSelector';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { Plus } from 'lucide-react';
import { FontFamily } from '@/types';

interface AddTypographyStyleDialogProps {
  category: 'display' | 'heading' | 'body';
}

const predefinedStyles = {
  display: [
    { key: 'thin', name: 'Display Thin', style: { fontWeight: '100' } },
    { key: 'italics', name: 'Display Italics', style: { fontStyle: 'italic' } },
    { key: 'condensed', name: 'Display Condensed', style: { fontStretch: 'condensed' } }
  ],
  heading: [],
  body: [
    { key: 'caption', name: 'Captions/Footnote', style: { fontSize: '12px', fontWeight: '400' } },
    { key: 'button', name: 'Buttons', style: { fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' } }
  ]
};

const availableFonts: FontFamily[] = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Source Sans Pro', category: 'sans-serif' },
  { name: 'Raleway', category: 'sans-serif' },
  { name: 'Ubuntu', category: 'sans-serif' },
  { name: 'Nunito', category: 'sans-serif' },
  { name: 'PT Sans', category: 'sans-serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Source Serif Pro', category: 'serif' },
  { name: 'Crimson Text', category: 'serif' },
  { name: 'Libre Baskerville', category: 'serif' },
  { name: 'Cormorant Garamond', category: 'serif' },
  { name: 'EB Garamond', category: 'serif' },
  { name: 'Roboto Mono', category: 'monospace' },
  { name: 'Source Code Pro', category: 'monospace' },
  { name: 'JetBrains Mono', category: 'monospace' },
  { name: 'Fira Code', category: 'monospace' },
  { name: 'Space Mono', category: 'monospace' },
];

export function AddTypographyStyleDialog({ category }: AddTypographyStyleDialogProps) {
  const { addTypographyStyle } = useBrandGuide();
  const [open, setOpen] = useState(false);
  const [styleType, setStyleType] = useState<'predefined' | 'custom'>('predefined');
  const [selectedPredefined, setSelectedPredefined] = useState('');
  const [customName, setCustomName] = useState('');
  const [customStyle, setCustomStyle] = useState({
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.5',
    letterSpacing: '0em'
  });

  const availablePredefined = predefinedStyles[category];

  const handleAddStyle = () => {
    if (styleType === 'predefined' && selectedPredefined) {
      const predefined = availablePredefined.find(p => p.key === selectedPredefined);
      if (predefined) {
        const fullStyle = {
          ...customStyle,
          ...predefined.style
        };
        addTypographyStyle(category, predefined.key, fullStyle);
      }
    } else if (styleType === 'custom' && customName) {
      const styleKey = customName.toLowerCase().replace(/\s+/g, '-');
      addTypographyStyle(category, styleKey, customStyle);
    }
    
    setOpen(false);
    setSelectedPredefined('');
    setCustomName('');
    setStyleType('predefined');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Style
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add {category} Style</DialogTitle>
          <DialogDescription>
            Choose a predefined style or create a custom one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {availablePredefined.length > 0 && (
            <>
              <div className="grid gap-2">
                <Label>Predefined Styles</Label>
                <Select value={selectedPredefined} onValueChange={setSelectedPredefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a predefined style" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePredefined.map((style) => (
                      <SelectItem key={style.key} value={style.key}>
                        {style.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                or
              </div>
            </>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Custom Style Name</Label>
            <Input
              id="name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g., Large Bold"
            />
          </div>

          <div className="grid gap-2">
            <Label>Font Family</Label>
            <ImprovedFontSelector
              value={customStyle.fontFamily}
              onChange={(font) => setCustomStyle(prev => ({ ...prev, fontFamily: font }))}
              availableFonts={availableFonts}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fontSize">Font Size</Label>
              <Input
                id="fontSize"
                value={customStyle.fontSize}
                onChange={(e) => setCustomStyle(prev => ({ ...prev, fontSize: e.target.value }))}
                placeholder="16px"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fontWeight">Font Weight</Label>
              <Select 
                value={customStyle.fontWeight} 
                onValueChange={(value) => setCustomStyle(prev => ({ ...prev, fontWeight: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 - Thin</SelectItem>
                  <SelectItem value="300">300 - Light</SelectItem>
                  <SelectItem value="400">400 - Regular</SelectItem>
                  <SelectItem value="500">500 - Medium</SelectItem>
                  <SelectItem value="600">600 - Semibold</SelectItem>
                  <SelectItem value="700">700 - Bold</SelectItem>
                  <SelectItem value="800">800 - Extra Bold</SelectItem>
                  <SelectItem value="900">900 - Black</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lineHeight">Line Height</Label>
              <Input
                id="lineHeight"
                value={customStyle.lineHeight}
                onChange={(e) => setCustomStyle(prev => ({ ...prev, lineHeight: e.target.value }))}
                placeholder="1.5"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="letterSpacing">Letter Spacing</Label>
              <Input
                id="letterSpacing"
                value={customStyle.letterSpacing}
                onChange={(e) => setCustomStyle(prev => ({ ...prev, letterSpacing: e.target.value }))}
                placeholder="0em"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={handleAddStyle} 
            disabled={!selectedPredefined && !customName}
          >
            Add Style
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
