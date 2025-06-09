
import React, { useRef } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { MainLayout } from '@/components/MainLayout';
import { TypographyPreview } from '@/components/ui/TypographyPreview';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { LogoPreview } from '@/components/ui/LogoPreview';
import { Button } from '@/components/ui/button';
import { FileDown, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { BrandStudioLogo } from '@/components/BrandStudioLogo';
import { hexToRgb } from '@/utils/colorUtils';

// Helper function to convert hex to Pantone (simplified approximation)
const getClosestPantone = (hex: string): string => {
  const pantoneMap: { [key: string]: string } = {
    '#FF0000': 'Pantone Red 032 C',
    '#00FF00': 'Pantone Green C',
    '#0000FF': 'Pantone Blue 072 C',
    '#FFFF00': 'Pantone Yellow C',
    '#FF00FF': 'Pantone Magenta C',
    '#00FFFF': 'Pantone Cyan C',
    '#000000': 'Pantone Black C',
    '#FFFFFF': 'Pantone White',
    '#007BFF': 'Pantone 279 C',
    '#6C757D': 'Pantone Cool Gray 8 C'
  };

  return pantoneMap[hex.toUpperCase()] || `Pantone ${hex.substring(1).toUpperCase()}`;
};

const Preview = () => {
  const {
    currentGuide,
    previewText,
    colorNames,
    typographyVisibility,
    typographyNames,
    logoGuidelines
  } = useBrandGuide();
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if guide is complete
  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);

  if (!isGuideComplete) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Brand Guide Incomplete</h1>
            <p>Your brand guide is missing important elements. Please add at least one primary color, one secondary color, and upload a logo.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getColorDisplayName = (colorIndex: number, categoryType: 'primary' | 'secondary' | 'neutral') => {
    const colorKey = `${categoryType}-${colorIndex}`;
    const customName = colorNames[colorKey];
    if (customName) return customName;
    const color = currentGuide.colors[categoryType][colorIndex];
    return typeof color === 'string' ? color : color?.hex || 'Unknown Color';
  };

  const getTypographyDisplayName = (category: 'display' | 'heading' | 'body', styleKey: string) => {
    const key = `${category}-${styleKey}`;
    const customName = typographyNames[key];
    if (customName) return customName;
    const defaultNames: { [key: string]: string } = {
      'display-large': 'Display Large',
      'display-medium': 'Display Medium',
      'display-regular': 'Display Regular',
      'display-thin': 'Display Thin',
      'heading-h1': 'Heading H1',
      'heading-h2': 'Heading H2',
      'heading-h3': 'Heading H3',
      'heading-h4': 'Heading H4',
      'heading-h5': 'Heading H5',
      'heading-h6': 'Heading H6',
      'body-large': 'Body Large',
      'body-medium': 'Body Medium',
      'body-small': 'Body Small'
    };
    return defaultNames[key] || styleKey.charAt(0).toUpperCase() + styleKey.slice(1);
  };

  const generateAdvancedPDF = async () => {
    if (!contentRef.current) return;

    try {
      toast({
        title: "Generating Professional PDF",
        description: "Creating your comprehensive brand guide..."
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 25; // Increased left padding
      const contentWidth = pageWidth - (margin * 2);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Helper function to add footer with clickable link
      const addFooter = (pageNumber?: number) => {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        
        // Add page number if provided
        if (pageNumber) {
          pdf.text(`${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
        
        // Add "Made with Brand Studio" as clickable link
        const linkText = "Made with Brand Studio";
        const linkWidth = pdf.getTextWidth(linkText);
        pdf.textWithLink(linkText, pageWidth - margin - linkWidth, pageHeight - 5, {
          url: 'https://your-website.com'
        });
      };

      // PAGE 1: Title Page with border
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add single line border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);
      
      // Brand name centered
      pdf.setFontSize(42);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(currentGuide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      // Subtitle with 1.5 line spacing
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });
      
      addFooter();

      // PAGE 2: Typography Section
      pdf.addPage();
      let currentY = margin + 10;
      
      // Typography title
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Typography', margin, currentY);
      currentY += 20;

      // Display Typography
      if (typographyVisibility.display.length > 0) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Display Typography', margin, currentY);
        currentY += 15;

        typographyVisibility.display.forEach(styleKey => {
          const style = currentGuide.typography.display[styleKey];
          if (!style) return;
          
          const displayName = getTypographyDisplayName('display', styleKey);
          
          if (currentY > pageHeight - 60) {
            pdf.addPage();
            currentY = margin + 10;
          }
          
          // Style name
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(displayName, margin, currentY);
          currentY += 8;
          
          // Font details
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Font: ${style.fontFamily.replace(/"/g, '')}`, margin, currentY);
          currentY += 5;
          pdf.text(`Size: ${style.fontSize}`, margin, currentY);
          currentY += 5;
          pdf.text(`Weight: ${style.fontWeight}`, margin, currentY);
          currentY += 5;
          pdf.text(`Line Height: ${style.lineHeight}`, margin, currentY);
          currentY += 5;
          pdf.text(`Letter Spacing: ${style.letterSpacing}`, margin, currentY);
          currentY += 15;
        });
      }

      // Headings
      if (typographyVisibility.heading.length > 0) {
        if (currentY > pageHeight - 80) {
          pdf.addPage();
          currentY = margin + 10;
        }
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Headings', margin, currentY);
        currentY += 15;

        typographyVisibility.heading.forEach(styleKey => {
          const style = currentGuide.typography.heading[styleKey];
          if (!style) return;
          
          const displayName = getTypographyDisplayName('heading', styleKey);
          
          if (currentY > pageHeight - 40) {
            pdf.addPage();
            currentY = margin + 10;
          }
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(displayName, margin, currentY);
          currentY += 8;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Font: ${style.fontFamily.replace(/"/g, '')}`, margin, currentY);
          currentY += 5;
          pdf.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight}`, margin, currentY);
          currentY += 12;
        });
      }

      // Body Text
      if (typographyVisibility.body.length > 0) {
        if (currentY > pageHeight - 80) {
          pdf.addPage();
          currentY = margin + 10;
        }
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Body Text', margin, currentY);
        currentY += 15;

        typographyVisibility.body.forEach(styleKey => {
          const style = currentGuide.typography.body[styleKey];
          if (!style) return;
          
          const displayName = getTypographyDisplayName('body', styleKey);
          
          if (currentY > pageHeight - 40) {
            pdf.addPage();
            currentY = margin + 10;
          }
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(displayName, margin, currentY);
          currentY += 8;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Font: ${style.fontFamily.replace(/"/g, '')}`, margin, currentY);
          currentY += 5;
          pdf.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight}`, margin, currentY);
          currentY += 12;
        });
      }

      addFooter(2);

      // PAGE 3+: Color Palette Section (fresh page)
      pdf.addPage();
      let pageNumber = 3;
      currentY = margin + 10;
      
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Color Palette', margin, currentY);
      currentY += 20;

      // Helper function to add color section exactly like export page
      const addColorSection = (title: string, colors: any[], categoryType: 'primary' | 'secondary' | 'neutral') => {
        if (colors.length === 0) return;
        
        if (currentY > pageHeight - 100) {
          pdf.addPage();
          pageNumber++;
          currentY = margin + 10;
        }
        
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, margin, currentY);
        currentY += 15;
        
        colors.forEach((color, index) => {
          if (currentY > pageHeight - 120) {
            pdf.addPage();
            pageNumber++;
            currentY = margin + 10;
          }
          
          const colorName = getColorDisplayName(index, categoryType);
          
          // Color swatch (same size as export page)
          const swatchSize = 40;
          const hexColor = color.hex;
          const rgb = hexToRgb(hexColor);
          pdf.setFillColor(rgb.r, rgb.g, rgb.b);
          pdf.rect(margin, currentY, swatchSize, swatchSize, 'F');
          
          // Color details next to swatch
          const detailsX = margin + swatchSize + 10;
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(colorName, detailsX, currentY + 8);
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`HEX: ${color.hex}`, detailsX, currentY + 18);
          pdf.text(`RGB: ${color.rgb}`, detailsX, currentY + 26);
          pdf.text(`CMYK: ${color.cmyk}`, detailsX, currentY + 34);
          pdf.text(`Pantone: ${getClosestPantone(color.hex)}`, detailsX, currentY + 42);
          
          currentY += swatchSize + 15;
          
          // Add tints and shades if available
          if (color.tints && color.tints.length > 0) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Tints:', margin, currentY);
            currentY += 8;
            
            const smallSwatchSize = 15;
            let swatchX = margin;
            color.tints.forEach((tint: string, i: number) => {
              if (swatchX + smallSwatchSize > pageWidth - margin) {
                swatchX = margin;
                currentY += smallSwatchSize + 5;
              }
              const tintRgb = hexToRgb(tint);
              pdf.setFillColor(tintRgb.r, tintRgb.g, tintRgb.b);
              pdf.rect(swatchX, currentY, smallSwatchSize, smallSwatchSize, 'F');
              
              pdf.setFontSize(8);
              pdf.setTextColor(0, 0, 0);
              pdf.text(tint, swatchX, currentY + smallSwatchSize + 3);
              swatchX += smallSwatchSize + 20;
            });
            currentY += smallSwatchSize + 10;
          }
          
          if (color.shades && color.shades.length > 0) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Shades:', margin, currentY);
            currentY += 8;
            
            const smallSwatchSize = 15;
            let swatchX = margin;
            color.shades.forEach((shade: string, i: number) => {
              if (swatchX + smallSwatchSize > pageWidth - margin) {
                swatchX = margin;
                currentY += smallSwatchSize + 5;
              }
              const shadeRgb = hexToRgb(shade);
              pdf.setFillColor(shadeRgb.r, shadeRgb.g, shadeRgb.b);
              pdf.rect(swatchX, currentY, smallSwatchSize, smallSwatchSize, 'F');
              
              pdf.setFontSize(8);
              pdf.setTextColor(0, 0, 0);
              pdf.text(shade, swatchX, currentY + smallSwatchSize + 3);
              swatchX += smallSwatchSize + 20;
            });
            currentY += smallSwatchSize + 10;
          }
          
          currentY += 10;
        });
      };

      addColorSection('Primary Colors', currentGuide.colors.primary, 'primary');
      addColorSection('Secondary Colors', currentGuide.colors.secondary, 'secondary');
      if (currentGuide.colors.neutral.length > 0) {
        addColorSection('Neutral Colors', currentGuide.colors.neutral, 'neutral');
      }

      addFooter(pageNumber);

      // PAGE: Logo Section (fresh page)
      pdf.addPage();
      pageNumber++;
      currentY = margin + 10;
      
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Logo', margin, currentY);
      currentY += 20;

      // Logo Guidelines (if any) - show first
      const hasGuidelines = Object.keys(logoGuidelines).some(key => logoGuidelines[key].length > 0);
      if (hasGuidelines) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Logo Guidelines', margin, currentY);
        currentY += 15;
        
        Object.entries(logoGuidelines).forEach(([shapeKey, guidelines]) => {
          if (guidelines.length > 0) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${shapeKey.replace('-logo', '').charAt(0).toUpperCase() + shapeKey.replace('-logo', '').slice(1)} Logo Guidelines:`, margin, currentY);
            currentY += 8;
            
            guidelines.forEach(guideline => {
              pdf.setFontSize(10);
              pdf.setFont('helvetica', 'normal');
              pdf.text(`• ${guideline.name}: ${Math.round(guideline.position / 20)}px spacing`, margin + 5, currentY);
              currentY += 5;
            });
            currentY += 8;
          }
        });
        currentY += 10;
      }

      // Original Logo
      if (currentGuide.logos.original) {
        try {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Original Logo', margin, currentY);
          currentY += 10;
          pdf.addImage(currentGuide.logos.original, 'PNG', margin, currentY, 60, 60);
          currentY += 70;
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
        }
      }

      // Logo Variations - properly aligned like export page
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Logo Variations', margin, currentY);
      currentY += 15;

      const logoSets = [
        { title: 'Square', logos: currentGuide.logos.square },
        { title: 'Rounded', logos: currentGuide.logos.rounded },
        { title: 'Circle', logos: currentGuide.logos.circle }
      ];

      for (const set of logoSets) {
        if (set.logos.length > 0 && currentY < pageHeight - 80) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(set.title, margin, currentY);
          currentY += 10;
          
          // Show first 3 variations in a row
          const logosToShow = set.logos.slice(0, 3);
          let logoX = margin;
          const logoSize = 25;
          const logoSpacing = 35;
          
          for (let i = 0; i < logosToShow.length; i++) {
            const logo = logosToShow[i];
            try {
              // Create canvas for logo with background
              const canvas = document.createElement('canvas');
              canvas.width = 100;
              canvas.height = 100;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                ctx.fillStyle = logo.background;
                ctx.fillRect(0, 0, 100, 100);
                
                const img = new Image();
                img.crossOrigin = "anonymous";
                
                await new Promise<void>((resolve) => {
                  img.onload = () => {
                    const maxDim = 75;
                    const scale = Math.min(maxDim / img.width, maxDim / img.height);
                    const width = img.width * scale;
                    const height = img.height * scale;
                    const x = (100 - width) / 2;
                    const y = (100 - height) / 2;
                    
                    ctx.drawImage(img, x, y, width, height);
                    
                    const logoDataUrl = canvas.toDataURL('image/png');
                    pdf.addImage(logoDataUrl, 'PNG', logoX, currentY, logoSize, logoSize);
                    resolve();
                  };
                  img.src = logo.src;
                });
              }
            } catch (error) {
              console.error('Error processing logo variation:', error);
            }
            
            logoX += logoSpacing;
          }
          
          currentY += logoSize + 15;
        }
      }

      addFooter(pageNumber);

      // FINAL PAGE: Closing
      pdf.addPage();
      pageNumber++;
      
      // Centered brand name and date at bottom
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Brand Guidelines of ${currentGuide.name}`, pageWidth / 2, pageHeight - 60, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 45, { align: 'center' });
      
      // Footer link
      const linkText = "Made with Brand Studio";
      const linkWidth = pdf.getTextWidth(linkText);
      pdf.setFontSize(10);
      pdf.textWithLink(linkText, pageWidth / 2 - (linkWidth / 2), pageHeight - 15, {
        url: 'https://your-website.com'
      });

      // Save the PDF
      pdf.save(`${currentGuide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
      toast({
        title: "Professional PDF Generated",
        description: "Your comprehensive brand guide has been downloaded successfully."
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error Generating PDF",
        description: "There was a problem generating your PDF. Please try again."
      });
    }
  };

  return (
    <MainLayout>
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="hover:opacity-75 transition-opacity">
              <BrandStudioLogo size="sm" />
            </button>
          </div>
          <Button onClick={generateAdvancedPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Professional PDF
          </Button>
        </div>
      </div>
      
      <div ref={contentRef} className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">{currentGuide.name}</h1>
          <p className="text-lg text-muted-foreground">
            Complete brand guidelines and style specifications
          </p>
        </header>
        
        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">Typography</h2>
          
          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold mb-4">Display Typography</h3>
              <div className="grid gap-6">
                {typographyVisibility.display.map(styleKey => {
                  const style = currentGuide.typography.display[styleKey];
                  if (!style) return null;
                  return (
                    <TypographyPreview 
                      key={styleKey} 
                      name={getTypographyDisplayName('display', styleKey)} 
                      style={style} 
                      previewText={previewText} 
                    />
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Headings</h3>
              <div className="grid gap-6">
                {typographyVisibility.heading.map(styleKey => {
                  const style = currentGuide.typography.heading[styleKey];
                  if (!style) return null;
                  return (
                    <TypographyPreview 
                      key={styleKey} 
                      name={getTypographyDisplayName('heading', styleKey)} 
                      style={style} 
                      previewText={previewText} 
                    />
                  );
                })}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Body Text</h3>
              <div className="grid gap-6">
                {typographyVisibility.body.map(styleKey => {
                  const style = currentGuide.typography.body[styleKey];
                  if (!style) return null;
                  return (
                    <TypographyPreview 
                      key={styleKey} 
                      name={getTypographyDisplayName('body', styleKey)} 
                      style={style} 
                      previewText={previewText} 
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        
        {/* Color Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">Color Palette</h2>
          
          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-semibold mb-4">Primary Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentGuide.colors.primary.map((color, index) => (
                  <div key={index} className="space-y-3">
                    <ColorSwatch color={color} colorName={getColorDisplayName(index, 'primary')} />
                    <div className="text-sm space-y-1">
                      <p><strong>RGB:</strong> {color.rgb}</p>
                      <p><strong>CMYK:</strong> {color.cmyk}</p>
                      <p><strong>Pantone:</strong> {getClosestPantone(color.hex)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Secondary Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentGuide.colors.secondary.map((color, index) => (
                  <div key={index} className="space-y-3">
                    <ColorSwatch color={color} colorName={getColorDisplayName(index, 'secondary')} />
                    <div className="text-sm space-y-1">
                      <p><strong>RGB:</strong> {color.rgb}</p>
                      <p><strong>CMYK:</strong> {color.cmyk}</p>
                      <p><strong>Pantone:</strong> {getClosestPantone(color.hex)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {currentGuide.colors.neutral.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Neutral Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {currentGuide.colors.neutral.map((color, index) => (
                    <div key={index} className="space-y-3">
                      <ColorSwatch color={color} colorName={getColorDisplayName(index, 'neutral')} />
                      <div className="text-sm space-y-1">
                        <p><strong>RGB:</strong> {color.rgb}</p>
                        <p><strong>CMYK:</strong> {color.cmyk}</p>
                        <p><strong>Pantone:</strong> {getClosestPantone(color.hex)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Logo Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b">Logo</h2>
          
          <div className="space-y-10">
            {/* Logo Guidelines */}
            {Object.keys(logoGuidelines).some(key => logoGuidelines[key].length > 0) && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Logo Guidelines</h3>
                <div className="space-y-4">
                  {Object.entries(logoGuidelines).map(([shapeKey, guidelines]) => {
                    if (guidelines.length === 0) return null;
                    return (
                      <div key={shapeKey} className="space-y-2">
                        <h4 className="font-medium">{shapeKey.replace('-logo', '').charAt(0).toUpperCase() + shapeKey.replace('-logo', '').slice(1)} Logo Guidelines:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {guidelines.map(guideline => (
                            <div key={guideline.id} className="bg-gray-50 p-2 rounded">
                              <span className="font-medium">{guideline.name}:</span> {Math.round(guideline.position / 20)}px
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-center mb-8">
              <div className="w-64 h-64 flex items-center justify-center p-4 border rounded-md">
                <img src={currentGuide.logos.original} alt="Original Logo" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Logo Variations</h3>
              
              {/* Square Logo Variations */}
              <h4 className="text-lg font-medium mb-3 mt-6">Square</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {currentGuide.logos.square.slice(0, 4).map((logo, index) => (
                  <LogoPreview key={index} logo={logo} shape="square" />
                ))}
              </div>
              
              {/* Rounded Logo Variations */}
              <h4 className="text-lg font-medium mb-3 mt-6">Rounded</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {currentGuide.logos.rounded.slice(0, 4).map((logo, index) => (
                  <LogoPreview key={index} logo={logo} shape="rounded" />
                ))}
              </div>
              
              {/* Circle Logo Variations */}
              <h4 className="text-lg font-medium mb-3 mt-6">Circle</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {currentGuide.logos.circle.slice(0, 4).map((logo, index) => (
                  <LogoPreview key={index} logo={logo} shape="circle" />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Hidden watermark for PDF - only visible when exported */}
        <div className="hidden print:block text-center text-gray-400 mt-8 pt-8 border-t">
          <p>Made with ❤️ by Brand Studio</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Preview;
