
import React, { useState } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { TypographySet, TypographyStyle } from '@/types';
import { TypographyPreview } from '@/components/ui/TypographyPreview';
import { AddTypographyStyleDialog } from '@/components/AddTypographyStyleDialog';
import { setFontFamily } from '@/utils/typographyUtils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FontSelector } from '@/components/FontSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { X } from 'lucide-react';

// Font weight options
const fontWeightOptions = [
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi-Bold (600)' },
  { value: '700', label: 'Bold (700)' },
];

export function TypographySection() {
  const { 
    currentGuide, 
    updateTypography, 
    previewText, 
    setPreviewText,
    typographyVisibility,
    typographyNames,
    setTypographyName,
    removeTypographyStyle
  } = useBrandGuide();
  
  const [displayFontFamily, setDisplayFontFamily] = useState(
    currentGuide.typography.display.large.fontFamily.split(',')[0].trim()
  );
  
  const [headingFontFamily, setHeadingFontFamily] = useState(
    currentGuide.typography.heading.h1.fontFamily.split(',')[0].trim()
  );
  
  const [bodyFontFamily, setBodyFontFamily] = useState(
    currentGuide.typography.body.medium.fontFamily.split(',')[0].trim()
  );

  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // Handle font family changes
  const handleFontFamilyChange = (
    value: string, 
    category: 'display' | 'heading' | 'body'
  ) => {
    const updatedTypography = setFontFamily(
      currentGuide.typography,
      value,
      category
    );
    
    updateTypography(updatedTypography);
    
    // Update local state for display
    if (category === 'display') {
      setDisplayFontFamily(value.split(',')[0].trim());
    } else if (category === 'heading') {
      setHeadingFontFamily(value.split(',')[0].trim());
    } else if (category === 'body') {
      setBodyFontFamily(value.split(',')[0].trim());
    }
  };
  
  // Handle style updates for a specific typography element
  const handleStyleUpdate = (
    category: 'display' | 'heading' | 'body',
    key: string,
    property: keyof TypographyStyle,
    value: string | number
  ) => {
    const updatedTypography: TypographySet = {
      ...currentGuide.typography,
      [category]: {
        ...currentGuide.typography[category],
        [key]: {
          // @ts-ignore - Dealing with dynamic keys
          ...currentGuide.typography[category][key],
          [property]: value
        }
      }
    };
    
    updateTypography(updatedTypography);
  };
  
  const handleTypographyNameChange = (category: 'display' | 'heading' | 'body', styleKey: string, name: string) => {
    const key = `${category}-${styleKey}`;
    setTypographyName(key, name);
  };

  const getDisplayName = (category: 'display' | 'heading' | 'body', styleKey: string) => {
    const key = `${category}-${styleKey}`;
    const customName = typographyNames[key];
    if (customName) return customName;

    const defaultNames: { [key: string]: string } = {
      // Display
      'display-large': 'Display Large',
      'display-medium': 'Display Medium',
      'display-regular': 'Display Regular',
      'display-thin': 'Display Thin',
      // Heading
      'heading-h1': 'Heading H1',
      'heading-h2': 'Heading H2',
      'heading-h3': 'Heading H3',
      'heading-h4': 'Heading H4',
      'heading-h5': 'Heading H5',
      'heading-h6': 'Heading H6',
      // Body
      'body-large': 'Body Large',
      'body-medium': 'Body Medium',
      'body-small': 'Body Small',
      'body-largeLight': 'Large Light',
      'body-largeMedium': 'Large Medium',
      'body-mediumLight': 'Medium Light',
      'body-mediumMedium': 'Medium Medium',
      'body-smallLight': 'Small Light',
      'body-smallMedium': 'Small Medium',
    };

    return defaultNames[key] || styleKey.charAt(0).toUpperCase() + styleKey.slice(1);
  };

  const getHiddenStyles = (category: 'display' | 'heading' | 'body') => {
    const allStyles = {
      display: ['medium', 'thin'],
      heading: ['h4', 'h5', 'h6'],
      body: ['largeLight', 'largeMedium', 'mediumLight', 'mediumMedium', 'smallLight', 'smallMedium']
    };

    return allStyles[category].filter(style => 
      !typographyVisibility[category].includes(style) &&
      currentGuide.typography[category][style]
    );
  };

  const handleNameClick = (category: 'display' | 'heading' | 'body', styleKey: string, currentName: string) => {
    const key = `${category}-${styleKey}`;
    setEditingName(key);
    setTempName(currentName);
  };

  const handleNameSave = (category: 'display' | 'heading' | 'body', styleKey: string) => {
    if (editingName) {
      const finalName = tempName.trim().slice(0, 20) || getDisplayName(category, styleKey);
      handleTypographyNameChange(category, styleKey, finalName);
      setEditingName(null);
      setTempName('');
    }
  };

  const handleNameKeyPress = (e: React.KeyboardEvent, category: 'display' | 'heading' | 'body', styleKey: string) => {
    if (e.key === 'Enter') {
      handleNameSave(category, styleKey);
    } else if (e.key === 'Escape') {
      setEditingName(null);
      setTempName('');
    }
  };

  const renderTypographyAccordion = (category: 'display' | 'heading' | 'body') => {
    const visibleStyles = typographyVisibility[category];
    const categoryData = currentGuide.typography[category];

    return (
      <Accordion type="single" collapsible className="w-full">
        {visibleStyles.map((styleKey) => {
          const style = categoryData[styleKey];
          if (!style) return null;

          const canRemove = visibleStyles.length > 1;
          const displayName = getDisplayName(category, styleKey);
          const editKey = `${category}-${styleKey}`;
          const isEditing = editingName === editKey;

          return (
            <AccordionItem key={styleKey} value={`${category}-${styleKey}`} className="group">
              <AccordionTrigger className="relative hover:no-underline">
                <div className="flex items-center justify-between w-full pr-8">
                  {isEditing ? (
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => handleNameSave(category, styleKey)}
                      onKeyDown={(e) => handleNameKeyPress(e, category, styleKey)}
                      className="font-medium text-sm h-8 max-w-48"
                      maxLength={20}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNameClick(category, styleKey, displayName);
                      }}
                      title="Click to edit name (max 20 characters)"
                    >
                      {displayName}
                    </span>
                  )}
                </div>
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-8 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTypographyStyle(category, styleKey);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 border border-border rounded-md bg-card mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{displayName}</h3>
                    <div className="text-sm text-muted-foreground">
                      {style.fontSize} / {style.fontWeight} / {style.lineHeight}
                    </div>
                  </div>
                  <div 
                    className="text-foreground" 
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      lineHeight: style.lineHeight,
                      letterSpacing: style.letterSpacing
                    }}
                  >
                    {previewText}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`${category}-${styleKey}-size`}>Font Size</Label>
                    <Input
                      id={`${category}-${styleKey}-size`}
                      type="text"
                      value={style.fontSize}
                      onChange={(e) => handleStyleUpdate(category, styleKey, 'fontSize', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${category}-${styleKey}-weight`}>Font Weight</Label>
                    <Select
                      value={style.fontWeight.toString()}
                      onValueChange={(value) => handleStyleUpdate(category, styleKey, 'fontWeight', value)}
                    >
                      <SelectTrigger id={`${category}-${styleKey}-weight`}>
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeightOptions.map((weight) => (
                          <SelectItem key={weight.value} value={weight.value}>
                            {weight.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`${category}-${styleKey}-line-height`}>Line Height</Label>
                    <Input
                      id={`${category}-${styleKey}-line-height`}
                      type="text"
                      value={style.lineHeight}
                      onChange={(e) => handleStyleUpdate(category, styleKey, 'lineHeight', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`${category}-${styleKey}-letter-spacing`}>Letter Spacing</Label>
                    <Input
                      id={`${category}-${styleKey}-letter-spacing`}
                      type="text"
                      value={style.letterSpacing || '0em'}
                      onChange={(e) => handleStyleUpdate(category, styleKey, 'letterSpacing', e.target.value)}
                      className="mt-1"
                      placeholder="0em"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
        
        <div className="mt-4">
          <AddTypographyStyleDialog 
            category={category} 
            hiddenStyles={getHiddenStyles(category)} 
          />
        </div>
      </Accordion>
    );
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Typography Settings</CardTitle>
          <CardDescription>
            Configure the typography styles for your brand guidelines. Define fonts, sizes, and weights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="preview-text">Preview Text</Label>
              <Textarea
                id="preview-text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Enter sample text to preview your typography styles"
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label>Display Font</Label>
                <FontSelector 
                  value={displayFontFamily}
                  onChange={(value) => handleFontFamilyChange(value, 'display')}
                  placeholder="Select display font"
                />
              </div>
              
              <div>
                <Label>Heading Font</Label>
                <FontSelector
                  value={headingFontFamily}
                  onChange={(value) => handleFontFamilyChange(value, 'heading')}
                  placeholder="Select heading font"
                />
              </div>
              
              <div>
                <Label>Body Font</Label>
                <FontSelector
                  value={bodyFontFamily}
                  onChange={(value) => handleFontFamilyChange(value, 'body')}
                  placeholder="Select body font"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="display" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-8">
          <TabsTrigger value="display">Display Typography</TabsTrigger>
          <TabsTrigger value="heading">Heading Typography</TabsTrigger>
          <TabsTrigger value="body">Body Typography</TabsTrigger>
        </TabsList>
        
        <TabsContent value="display" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Display Typography</CardTitle>
              <CardDescription>
                Large, impactful type styles for hero sections, landing pages, and main headings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTypographyAccordion('display')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="heading" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Heading Typography</CardTitle>
              <CardDescription>
                Typography styles for section titles, subheadings, and content headers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTypographyAccordion('heading')}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="body" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Body Typography</CardTitle>
              <CardDescription>
                Typography styles for body text, paragraphs, and general content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTypographyAccordion('body')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
