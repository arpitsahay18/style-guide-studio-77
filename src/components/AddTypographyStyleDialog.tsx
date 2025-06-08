
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
      medium: 'Display Medium',
      thin: 'Display Thin',
      // Heading styles
      h4: 'Heading H4',
      h5: 'Heading H5',
      h6: 'Heading H6',
      // Body styles
      largeLight: 'Body Alternative Weights',
      largeMedium: 'Body Alternative Weights',
      mediumLight: 'Body Alternative Weights',
      mediumMedium: 'Body Alternative Weights',
      smallLight: 'Body Alternative Weights',
      smallMedium: 'Body Alternative Weights',
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
    let baseFontFamily = '"Inter", sans-serif';

    // Get base font family from the category
    if (category === 'display') {
      baseFontFamily = currentGuide.typography.display.large?.fontFamily || '"Bebas Neue", sans-serif';
    } else if (category === 'heading') {
      baseFontFamily = currentGuide.typography.heading.h1?.fontFamily || '"Inter", sans-serif';
    } else if (category === 'body') {
      baseFontFamily = currentGuide.typography.body.medium?.fontFamily || '"Inter", sans-serif';
    }

    const customStyle = {
      fontFamily: baseFontFamily,
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em'
    };

    addTypographyStyle(category, styleKey, customStyle);
    setCustomStyleName('');
    setIsOpen(false);
  };

  // Group body alternative styles under one option
  const getAvailableStyles = () => {
    if (category === 'body') {
      const bodyAlternatives = ['largeLight', 'largeMedium', 'mediumLight', 'mediumMedium', 'smallLight', 'smallMedium'];
      const hasAnyBodyAlternative = bodyAlternatives.some(style => hiddenStyles.includes(style));
      
      if (hasAnyBodyAlternative) {
        return [{ key: 'bodyAlternatives', label: 'Body Alternative Weights' }];
      }
      return [];
    }
    
    return hiddenStyles.map(styleKey => ({
      key: styleKey,
      label: getStyleDisplayName(styleKey)
    }));
  };

  const handleAddBodyAlternatives = () => {
    const bodyAlternatives = ['largeLight', 'largeMedium', 'mediumLight', 'mediumMedium', 'smallLight', 'smallMedium'];
    bodyAlternatives.forEach(styleKey => {
      if (hiddenStyles.includes(styleKey)) {
        addTypographyStyle(category, styleKey);
      }
    });
    setIsOpen(false);
  };

  const availableStyles = getAvailableStyles();

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
          {availableStyles.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Predefined Styles</Label>
              <div className="grid gap-2 mt-2">
                {availableStyles.map((style) => (
                  <Button
                    key={style.key}
                    variant="outline"
                    onClick={() => {
                      if (style.key === 'bodyAlternatives') {
                        handleAddBodyAlternatives();
                      } else {
                        handleAddExistingStyle(style.key);
                      }
                    }}
                    className="justify-start"
                  >
                    {style.label}
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
