
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from 'lucide-react';
import { useBrandGuide } from '@/context/BrandGuideContext';

interface AddTypographyStyleDialogProps {
  category: 'display' | 'heading' | 'body';
  hiddenStyles: string[];
}

export function AddTypographyStyleDialog({ category, hiddenStyles }: AddTypographyStyleDialogProps) {
  const { currentGuide, addTypographyStyle } = useBrandGuide();
  const [isOpen, setIsOpen] = useState(false);
  const [customStyleName, setCustomStyleName] = useState('');

  const getStyleDisplayName = (styleKey: string) => {
    const displayNames: { [key: string]: string } = {
      // Display styles
      thin: 'Display Thin',
      // Heading styles
      h4: 'Heading H4',
      h5: 'Heading H5',
      h6: 'Heading H6',
      // Body styles
      largeLight: 'Large Light',
      largeMedium: 'Large Medium',
      mediumLight: 'Medium Light',
      mediumMedium: 'Medium Medium',
      smallLight: 'Small Light',
      smallMedium: 'Small Medium',
    };
    return displayNames[styleKey] || styleKey;
  };

  const handleAddExistingStyle = (styleKey: string) => {
    addTypographyStyle(category, styleKey);
    setIsOpen(false);
  };

  const handleAddCustomStyle = () => {
    if (!customStyleName.trim()) return;

    const styleKey = customStyleName.toLowerCase().replace(/\s+/g, '');
    const baseFontFamily = currentGuide.typography[category]?.large?.fontFamily || 
                          currentGuide.typography[category]?.h1?.fontFamily ||
                          '"Inter", sans-serif';

    const customStyle = {
      fontFamily: baseFontFamily,
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0'
    };

    addTypographyStyle(category, styleKey, customStyle);
    setCustomStyleName('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Style
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {category.charAt(0).toUpperCase() + category.slice(1)} Style</DialogTitle>
          <DialogDescription>
            Choose from predefined styles or create a custom one.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {hiddenStyles.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Predefined Styles</Label>
              <div className="grid gap-2 mt-2">
                {hiddenStyles.map((styleKey) => (
                  <Button
                    key={styleKey}
                    variant="outline"
                    onClick={() => handleAddExistingStyle(styleKey)}
                    className="justify-start"
                  >
                    {getStyleDisplayName(styleKey)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t pt-4">
            <Label htmlFor="custom-style" className="text-sm font-medium">
              Custom Style Name
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="custom-style"
                value={customStyleName}
                onChange={(e) => setCustomStyleName(e.target.value)}
                placeholder="Enter custom style name"
                maxLength={20}
              />
              <Button onClick={handleAddCustomStyle} disabled={!customStyleName.trim()}>
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
