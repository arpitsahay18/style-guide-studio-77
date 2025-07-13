
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useBrandGuide } from '@/context/BrandGuideContext';
import { Plus } from 'lucide-react';

interface AddTypographyStyleDialogProps {
  category: 'display' | 'heading' | 'body';
  defaultFontFamily?: string;
}

const predefinedStyles = {
  display: [
    { key: 'thin', name: 'Display Thin', style: { fontWeight: '100' } },
    { key: 'italics', name: 'Display Italics', style: { fontStyle: 'italic' } },
    { key: 'condensed', name: 'Display Condensed', style: { fontStretch: 'condensed' } }
  ],
  heading: [
    { key: 'h4', name: 'Heading H4', style: { fontSize: '20px', fontWeight: '600' } },
    { key: 'h5', name: 'Heading H5', style: { fontSize: '18px', fontWeight: '600' } },
    { key: 'h6', name: 'Heading H6', style: { fontSize: '16px', fontWeight: '600' } }
  ],
  body: [
    { key: 'caption', name: 'Captions/Footnote', style: { fontSize: '12px', fontWeight: '400' } },
    { key: 'button', name: 'Buttons', style: { fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' } }
  ]
};

export function AddTypographyStyleDialog({ category, defaultFontFamily }: AddTypographyStyleDialogProps) {
  const { addTypographyStyle } = useBrandGuide();
  const [open, setOpen] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState('');

  const availablePredefined = predefinedStyles[category];

  const handleAddPredefinedStyle = () => {
    if (selectedPredefined) {
      const predefined = availablePredefined.find(p => p.key === selectedPredefined);
      if (predefined) {
        const baseStyle = {
          fontFamily: defaultFontFamily || '"Inter", sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '1.5',
          letterSpacing: '0em'
        };
        const fullStyle = {
          ...baseStyle,
          ...predefined.style
        };
        addTypographyStyle(category, predefined.key, fullStyle);
      }
    }
    
    setOpen(false);
    setSelectedPredefined('');
  };

  const handleAddCustomStyle = () => {
    const customKey = `custom-${Date.now()}`;
    const customStyle = {
      fontFamily: defaultFontFamily || '"Inter", sans-serif',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em'
    };
    addTypographyStyle(category, customKey, customStyle);
    setOpen(false);
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
            Choose a predefined style or add a custom one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {availablePredefined.length > 0 && (
            <div className="grid gap-3">
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
              {selectedPredefined && (
                <Button onClick={handleAddPredefinedStyle} className="w-full">
                  Add {availablePredefined.find(s => s.key === selectedPredefined)?.name}
                </Button>
              )}
            </div>
          )}
          
          {availablePredefined.length > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              or
            </div>
          )}

          <div className="grid gap-3">
            <Label>Custom Style</Label>
            <Button variant="outline" onClick={handleAddCustomStyle} className="w-full">
              Add Custom Style
            </Button>
            <p className="text-xs text-muted-foreground">
              You can customize all properties after adding the style.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
