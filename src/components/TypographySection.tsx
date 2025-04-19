
import React, { useState } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { TypographySet, TypographyStyle } from '@/types';
import { TypographyPreview } from '@/components/ui/TypographyPreview';
import { setFontFamily } from '@/utils/typographyUtils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Common web-safe fonts
const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter', category: 'sans-serif' },
  { value: 'Arial, sans-serif', label: 'Arial', category: 'sans-serif' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica', category: 'sans-serif' },
  { value: 'Roboto, sans-serif', label: 'Roboto', category: 'sans-serif' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans', category: 'sans-serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', category: 'sans-serif' },
  { value: 'Georgia, serif', label: 'Georgia', category: 'serif' },
  { value: 'Times New Roman, serif', label: 'Times New Roman', category: 'serif' },
  { value: 'Merriweather, serif', label: 'Merriweather', category: 'serif' },
  { value: 'Playfair Display, serif', label: 'Playfair Display', category: 'serif' },
  { value: 'Courier New, monospace', label: 'Courier New', category: 'monospace' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono', category: 'monospace' },
];

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
    setPreviewText 
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
  
  // Handle font family changes
  const handleFontFamilyChange = (
    value: string, 
    category: 'display' | 'heading' | 'body'
  ) => {
    const selectedFont = fontOptions.find(f => f.value === value);
    
    if (!selectedFont) return;
    
    const updatedTypography = setFontFamily(
      currentGuide.typography,
      selectedFont.value,
      category
    );
    
    updateTypography(updatedTypography);
    
    // Update local state for display
    if (category === 'display') {
      setDisplayFontFamily(selectedFont.label);
    } else if (category === 'heading') {
      setHeadingFontFamily(selectedFont.label);
    } else if (category === 'body') {
      setBodyFontFamily(selectedFont.label);
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
                <Select 
                  value={fontOptions.find(f => f.label === displayFontFamily)?.value}
                  onValueChange={(value) => handleFontFamilyChange(value, 'display')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Removed the empty value Select.Item and replaced with default SelectItem */}
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Heading Font</Label>
                <Select
                  value={fontOptions.find(f => f.label === headingFontFamily)?.value}
                  onValueChange={(value) => handleFontFamilyChange(value, 'heading')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Removed the empty value Select.Item and replaced with default SelectItem */}
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Body Font</Label>
                <Select
                  value={fontOptions.find(f => f.label === bodyFontFamily)?.value}
                  onValueChange={(value) => handleFontFamilyChange(value, 'body')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Removed the empty value Select.Item and replaced with default SelectItem */}
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Accordion type="single" collapsible className="w-full">
                {/* Display Large */}
                <AccordionItem value="display-large">
                  <AccordionTrigger>Display Large</AccordionTrigger>
                  <AccordionContent>
                    <TypographyPreview
                      name="Display Large"
                      style={currentGuide.typography.display.large}
                      previewText={previewText}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="display-large-size">Font Size</Label>
                        <Input
                          id="display-large-size"
                          type="text"
                          value={currentGuide.typography.display.large.fontSize}
                          onChange={(e) => handleStyleUpdate('display', 'large', 'fontSize', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display-large-weight">Font Weight</Label>
                        <Select
                          value={currentGuide.typography.display.large.fontWeight.toString()}
                          onValueChange={(value) => handleStyleUpdate('display', 'large', 'fontWeight', value)}
                        >
                          <SelectTrigger id="display-large-weight">
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
                        <Label htmlFor="display-large-line-height">Line Height</Label>
                        <Input
                          id="display-large-line-height"
                          type="text"
                          value={currentGuide.typography.display.large.lineHeight}
                          onChange={(e) => handleStyleUpdate('display', 'large', 'lineHeight', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display-large-letter-spacing">Letter Spacing</Label>
                        <Input
                          id="display-large-letter-spacing"
                          type="text"
                          value={currentGuide.typography.display.large.letterSpacing}
                          onChange={(e) => handleStyleUpdate('display', 'large', 'letterSpacing', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Display Medium */}
                <AccordionItem value="display-medium">
                  <AccordionTrigger>Display Medium</AccordionTrigger>
                  <AccordionContent>
                    <TypographyPreview
                      name="Display Medium"
                      style={currentGuide.typography.display.medium}
                      previewText={previewText}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="display-medium-size">Font Size</Label>
                        <Input
                          id="display-medium-size"
                          type="text"
                          value={currentGuide.typography.display.medium.fontSize}
                          onChange={(e) => handleStyleUpdate('display', 'medium', 'fontSize', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display-medium-weight">Font Weight</Label>
                        <Select
                          value={currentGuide.typography.display.medium.fontWeight.toString()}
                          onValueChange={(value) => handleStyleUpdate('display', 'medium', 'fontWeight', value)}
                        >
                          <SelectTrigger id="display-medium-weight">
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
                        <Label htmlFor="display-medium-line-height">Line Height</Label>
                        <Input
                          id="display-medium-line-height"
                          type="text"
                          value={currentGuide.typography.display.medium.lineHeight}
                          onChange={(e) => handleStyleUpdate('display', 'medium', 'lineHeight', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display-medium-letter-spacing">Letter Spacing</Label>
                        <Input
                          id="display-medium-letter-spacing"
                          type="text"
                          value={currentGuide.typography.display.medium.letterSpacing}
                          onChange={(e) => handleStyleUpdate('display', 'medium', 'letterSpacing', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Display Regular */}
                <AccordionItem value="display-regular">
                  <AccordionTrigger>Display Regular</AccordionTrigger>
                  <AccordionContent>
                    <TypographyPreview
                      name="Display Regular"
                      style={currentGuide.typography.display.regular}
                      previewText={previewText}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor="display-regular-size">Font Size</Label>
                        <Input
                          id="display-regular-size"
                          type="text"
                          value={currentGuide.typography.display.regular.fontSize}
                          onChange={(e) => handleStyleUpdate('display', 'regular', 'fontSize', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display-regular-weight">Font Weight</Label>
                        <Select
                          value={currentGuide.typography.display.regular.fontWeight.toString()}
                          onValueChange={(value) => handleStyleUpdate('display', 'regular', 'fontWeight', value)}
                        >
                          <SelectTrigger id="display-regular-weight">
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
                        <Label htmlFor="display-regular-line-height">Line Height</Label>
                        <Input
                          id="display-regular-line-height"
                          type="text"
                          value={currentGuide.typography.display.regular.lineHeight}
                          onChange={(e) => handleStyleUpdate('display', 'regular', 'lineHeight', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="display-regular-letter-spacing">Letter Spacing</Label>
                        <Input
                          id="display-regular-letter-spacing"
                          type="text"
                          value={currentGuide.typography.display.regular.letterSpacing}
                          onChange={(e) => handleStyleUpdate('display', 'regular', 'letterSpacing', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Display Thin */}
                {currentGuide.typography.display.thin && (
                  <AccordionItem value="display-thin">
                    <AccordionTrigger>Display Thin</AccordionTrigger>
                    <AccordionContent>
                      <TypographyPreview
                        name="Display Thin"
                        style={currentGuide.typography.display.thin}
                        previewText={previewText}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="display-thin-size">Font Size</Label>
                          <Input
                            id="display-thin-size"
                            type="text"
                            value={currentGuide.typography.display.thin.fontSize}
                            onChange={(e) => handleStyleUpdate('display', 'thin', 'fontSize', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="display-thin-weight">Font Weight</Label>
                          <Select
                            value={currentGuide.typography.display.thin.fontWeight.toString()}
                            onValueChange={(value) => handleStyleUpdate('display', 'thin', 'fontWeight', value)}
                          >
                            <SelectTrigger id="display-thin-weight">
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
                          <Label htmlFor="display-thin-line-height">Line Height</Label>
                          <Input
                            id="display-thin-line-height"
                            type="text"
                            value={currentGuide.typography.display.thin.lineHeight}
                            onChange={(e) => handleStyleUpdate('display', 'thin', 'lineHeight', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="display-thin-letter-spacing">Letter Spacing</Label>
                          <Input
                            id="display-thin-letter-spacing"
                            type="text"
                            value={currentGuide.typography.display.thin.letterSpacing}
                            onChange={(e) => handleStyleUpdate('display', 'thin', 'letterSpacing', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
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
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(currentGuide.typography.heading).map(([key, style]) => (
                  <AccordionItem key={key} value={`heading-${key}`}>
                    <AccordionTrigger>Heading {key.toUpperCase()}</AccordionTrigger>
                    <AccordionContent>
                      <TypographyPreview
                        name={`Heading ${key.toUpperCase()}`}
                        style={style}
                        previewText={previewText}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor={`heading-${key}-size`}>Font Size</Label>
                          <Input
                            id={`heading-${key}-size`}
                            type="text"
                            value={style.fontSize}
                            onChange={(e) => handleStyleUpdate('heading', key, 'fontSize', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`heading-${key}-weight`}>Font Weight</Label>
                          <Select
                            value={style.fontWeight.toString()}
                            onValueChange={(value) => handleStyleUpdate('heading', key, 'fontWeight', value)}
                          >
                            <SelectTrigger id={`heading-${key}-weight`}>
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
                          <Label htmlFor={`heading-${key}-line-height`}>Line Height</Label>
                          <Input
                            id={`heading-${key}-line-height`}
                            type="text"
                            value={style.lineHeight}
                            onChange={(e) => handleStyleUpdate('heading', key, 'lineHeight', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`heading-${key}-letter-spacing`}>Letter Spacing</Label>
                          <Input
                            id={`heading-${key}-letter-spacing`}
                            type="text"
                            value={style.letterSpacing}
                            onChange={(e) => handleStyleUpdate('heading', key, 'letterSpacing', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(currentGuide.typography.body)
                  .filter(([key]) => !key.includes('Light') && !key.includes('Medium'))
                  .map(([key, style]) => (
                    <AccordionItem key={key} value={`body-${key}`}>
                      <AccordionTrigger>Body {key.charAt(0).toUpperCase() + key.slice(1)}</AccordionTrigger>
                      <AccordionContent>
                        <TypographyPreview
                          name={`Body ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                          style={style}
                          previewText={previewText}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label htmlFor={`body-${key}-size`}>Font Size</Label>
                            <Input
                              id={`body-${key}-size`}
                              type="text"
                              value={style.fontSize}
                              onChange={(e) => handleStyleUpdate('body', key, 'fontSize', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`body-${key}-weight`}>Font Weight</Label>
                            <Select
                              value={style.fontWeight.toString()}
                              onValueChange={(value) => handleStyleUpdate('body', key, 'fontWeight', value)}
                            >
                              <SelectTrigger id={`body-${key}-weight`}>
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
                            <Label htmlFor={`body-${key}-line-height`}>Line Height</Label>
                            <Input
                              id={`body-${key}-line-height`}
                              type="text"
                              value={style.lineHeight}
                              onChange={(e) => handleStyleUpdate('body', key, 'lineHeight', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`body-${key}-letter-spacing`}>Letter Spacing</Label>
                            <Input
                              id={`body-${key}-letter-spacing`}
                              type="text"
                              value={style.letterSpacing}
                              onChange={(e) => handleStyleUpdate('body', key, 'letterSpacing', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                
                {/* Alternative Weights */}
                <AccordionItem value="body-alt-weights">
                  <AccordionTrigger>Alternative Weights</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Light variants */}
                      <div>
                        <h4 className="font-medium mb-4">Light Variants</h4>
                        {Object.entries(currentGuide.typography.body)
                          .filter(([key]) => key.includes('Light'))
                          .map(([key, style]) => (
                            <div key={key} className="mb-6">
                              <TypographyPreview
                                name={`${key.replace('Light', ' Light')}`}
                                style={style}
                                previewText={previewText}
                              />
                            </div>
                          ))}
                      </div>
                      
                      {/* Medium variants */}
                      <div>
                        <h4 className="font-medium mb-4">Medium Variants</h4>
                        {Object.entries(currentGuide.typography.body)
                          .filter(([key]) => key.includes('Medium'))
                          .map(([key, style]) => (
                            <div key={key} className="mb-6">
                              <TypographyPreview
                                name={`${key.replace('Medium', ' Medium')}`}
                                style={style}
                                previewText={previewText}
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
