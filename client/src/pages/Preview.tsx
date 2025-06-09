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
import { useLocation } from 'wouter';
import { BrandStudioLogo } from '@/components/BrandStudioLogo';
import { hexToRgb } from '@/utils/colorUtils';

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
  const [, setLocation] = useLocation();

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
            <Button onClick={() => setLocation('/')}>
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

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const maxContentHeight = pageHeight - (margin * 2);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const addFooter = (isFirstOrLast: boolean = false) => {
        if (isFirstOrLast) {
          const footerY = pageHeight - 15;
          const footerX = pageWidth / 2;
          const pillWidth = 50;
          const pillHeight = 8;
          
          pdf.setFillColor(60, 60, 60);
          pdf.roundedRect(footerX - pillWidth/2, footerY - pillHeight/2, pillWidth, pillHeight, 4, 4, 'F');
          
          pdf.setFontSize(8);
          pdf.setTextColor(255, 255, 255);
          pdf.text("Made with Brand Studio", footerX, footerY + 1, { align: 'center' });
        }
      };

      // PAGE 1: Title Page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setFontSize(42);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(currentGuide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });
      
      addFooter(true);

      // Helper function to split content across multiple pages
      const addContentToPages = async (element: HTMLElement, sectionTitle: string) => {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 800
        });
        
        const imgData = canvas.toDataURL('image/png', 0.9);
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // If content fits on one page
        if (imgHeight <= maxContentHeight) {
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
          return;
        }
        
        // Split content across multiple pages
        const pagesNeeded = Math.ceil(imgHeight / maxContentHeight);
        const pageChunkHeight = canvas.height / pagesNeeded;
        
        for (let pageIndex = 0; pageIndex < pagesNeeded; pageIndex++) {
          pdf.addPage();
          
          // Add section title on first page
          if (pageIndex === 0) {
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(0, 0, 0);
            pdf.text(sectionTitle, margin, margin + 10);
          }
          
          // Create a canvas for this page chunk
          const chunkCanvas = document.createElement('canvas');
          chunkCanvas.width = canvas.width;
          chunkCanvas.height = pageChunkHeight;
          const chunkCtx = chunkCanvas.getContext('2d');
          
          if (chunkCtx) {
            chunkCtx.drawImage(
              canvas,
              0, pageIndex * pageChunkHeight,
              canvas.width, pageChunkHeight,
              0, 0,
              canvas.width, pageChunkHeight
            );
            
            const chunkImgData = chunkCanvas.toDataURL('image/png', 0.9);
            const chunkHeight = (pageChunkHeight * imgWidth) / canvas.width;
            const yPosition = pageIndex === 0 ? margin + 15 : margin;
            
            pdf.addImage(chunkImgData, 'PNG', margin, yPosition, imgWidth, chunkHeight);
          }
        }
      };

      // Process each section
      const sections = contentRef.current.querySelectorAll('section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        const sectionTitle = section.querySelector('h2')?.textContent || `Section ${i + 1}`;
        
        try {
          await addContentToPages(section, sectionTitle);
        } catch (error) {
          console.error('Error processing section:', error);
          // Fallback: add a simple text page
          pdf.addPage();
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(sectionTitle, margin, margin + 20);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Content could not be rendered properly.', margin, margin + 40);
        }
      }

      // Add special handling for logo guidelines if they exist
      const logoGuidelinesExist = Object.keys(logoGuidelines).some(key => logoGuidelines[key].length > 0);
      if (logoGuidelinesExist) {
        pdf.addPage();
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Logo Spacing Guidelines', margin, margin + 10);
        
        let yPos = margin + 25;
        
        Object.entries(logoGuidelines).forEach(([shapeKey, guidelines]) => {
          if (guidelines.length === 0) return;
          
          const shapeName = shapeKey.replace('-logo', '').charAt(0).toUpperCase() + shapeKey.replace('-logo', '').slice(1);
          
          if (yPos > pageHeight - 80) {
            pdf.addPage();
            yPos = margin + 10;
          }
          
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${shapeName} Logo Guidelines:`, margin, yPos);
          yPos += 8;
          
          guidelines.forEach((guideline) => {
            if (yPos > pageHeight - 30) {
              pdf.addPage();
              yPos = margin + 10;
            }
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`• ${guideline.name}: ${Math.round(guideline.position)}px (${guideline.type})`, margin + 5, yPos);
            yPos += 5;
          });
          
          yPos += 10;
        });
      }

      // FINAL PAGE
      pdf.addPage();
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Brand Guidelines of ${currentGuide.name}`, pageWidth / 2, pageHeight - 60, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 45, { align: 'center' });
      
      addFooter(true);

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
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-end items-center">
          <Button onClick={generateAdvancedPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Download Professional PDF
          </Button>
        </div>
      </div>
      
      <div ref={contentRef} className="container mx-auto px-6 py-12 space-y-16">
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">{currentGuide.name}</h1>
          <p className="text-lg text-muted-foreground">
            Complete brand guidelines and style specifications
          </p>
        </header>
        
        {/* Typography Section */}
        <section className="space-y-12">
          <div className="border-b pb-4">
            <h2 className="text-3xl font-bold">Typography</h2>
          </div>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Display Typography</h3>
              <div className="grid gap-8">
                {typographyVisibility.display.map(styleKey => {
                  const style = (currentGuide.typography.display as any)[styleKey];
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
              <h3 className="text-2xl font-semibold mb-6">Headings</h3>
              <div className="grid gap-8">
                {typographyVisibility.heading.map(styleKey => {
                  const style = (currentGuide.typography.heading as any)[styleKey];
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
              <h3 className="text-2xl font-semibold mb-6">Body Text</h3>
              <div className="grid gap-8">
                {typographyVisibility.body.map(styleKey => {
                  const style = (currentGuide.typography.body as any)[styleKey];
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
        <section className="space-y-12">
          <div className="border-b pb-4">
            <h2 className="text-3xl font-bold">Color Palette</h2>
          </div>
          
          <div className="space-y-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Primary Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {currentGuide.colors.primary.map((color, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex flex-col items-center">
                      <ColorSwatch color={color} colorName={getColorDisplayName(index, 'primary')} />
                    </div>
                    <div className="text-sm space-y-2 text-center">
                      <p><strong>HEX:</strong> {color.hex}</p>
                      <p><strong>RGB:</strong> {color.rgb}</p>
                      <p><strong>CMYK:</strong> {color.cmyk}</p>
                      <p><strong>Pantone:</strong> {getClosestPantone(color.hex)}</p>
                    </div>
                    
                    {/* Tints and Shades */}
                    {color.tints && color.tints.length > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">Tints:</p>
                        <div className="flex gap-1 justify-center">
                          {color.tints.map((tint, tintIndex) => (
                            <div key={tintIndex} className="w-6 h-6 rounded border" style={{ backgroundColor: tint }} title={tint} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {color.shades && color.shades.length > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">Shades:</p>
                        <div className="flex gap-1 justify-center">
                          {color.shades.map((shade, shadeIndex) => (
                            <div key={shadeIndex} className="w-6 h-6 rounded border" style={{ backgroundColor: shade }} title={shade} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">Secondary Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {currentGuide.colors.secondary.map((color, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex flex-col items-center">
                      <ColorSwatch color={color} colorName={getColorDisplayName(index, 'secondary')} />
                    </div>
                    <div className="text-sm space-y-2 text-center">
                      <p><strong>HEX:</strong> {color.hex}</p>
                      <p><strong>RGB:</strong> {color.rgb}</p>
                      <p><strong>CMYK:</strong> {color.cmyk}</p>
                      <p><strong>Pantone:</strong> {getClosestPantone(color.hex)}</p>
                    </div>
                    
                    {color.tints && color.tints.length > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">Tints:</p>
                        <div className="flex gap-1 justify-center">
                          {color.tints.map((tint, tintIndex) => (
                            <div key={tintIndex} className="w-6 h-6 rounded border" style={{ backgroundColor: tint }} title={tint} />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {color.shades && color.shades.length > 0 && (
                      <div className="text-center">
                        <p className="text-sm font-semibold mb-2">Shades:</p>
                        <div className="flex gap-1 justify-center">
                          {color.shades.map((shade, shadeIndex) => (
                            <div key={shadeIndex} className="w-6 h-6 rounded border" style={{ backgroundColor: shade }} title={shade} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {currentGuide.colors.neutral.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-6">Neutral Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {currentGuide.colors.neutral.map((color, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex flex-col items-center">
                        <ColorSwatch color={color} colorName={getColorDisplayName(index, 'neutral')} />
                      </div>
                      <div className="text-sm space-y-2 text-center">
                        <p><strong>HEX:</strong> {color.hex}</p>
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
        <section className="space-y-12">
          <div className="border-b pb-4">
            <h2 className="text-3xl font-bold">Logo</h2>
          </div>
          
          <div className="space-y-12">
            {/* Logo Guidelines */}
            {Object.keys(logoGuidelines).some(key => logoGuidelines[key].length > 0) && (
              <div>
                <h3 className="text-2xl font-semibold mb-6">Logo Guidelines</h3>
                <div className="space-y-8">
                  {Object.entries(logoGuidelines).map(([shapeKey, guidelines]) => {
                    if (guidelines.length === 0) return null;
                    const shapeName = shapeKey.replace('-logo', '').charAt(0).toUpperCase() + shapeKey.replace('-logo', '').slice(1);
                    return (
                      <div key={shapeKey} className="space-y-6">
                        <h4 className="text-lg font-medium">{shapeName} Logo Guidelines:</h4>
                        
                        {/* Logo with Guidelines Visualization */}
                        <div className="flex justify-center">
                          <div className="relative inline-block bg-white" style={{ paddingLeft: '30px', paddingTop: '30px' }}>
                            {/* Top Ruler */}
                            <div 
                              className="absolute bg-gray-100 border-b border-gray-300"
                              style={{ 
                                width: '400px', 
                                height: '24px',
                                top: '0px',
                                left: '30px'
                              }}
                            >
                              {/* Ruler ticks */}
                              {Array.from({ length: 41 }, (_, i) => i * 10).map(pos => (
                                <div
                                  key={pos}
                                  className="absolute bg-gray-400"
                                  style={{
                                    left: `${pos}px`,
                                    top: '0px',
                                    width: '1px',
                                    height: '4px'
                                  }}
                                />
                              ))}
                            </div>

                            {/* Left Ruler */}
                            <div 
                              className="absolute bg-gray-100 border-r border-gray-300"
                              style={{ 
                                width: '24px', 
                                height: '400px',
                                top: '30px',
                                left: '0px'
                              }}
                            >
                              {/* Ruler ticks */}
                              {Array.from({ length: 41 }, (_, i) => i * 10).map(pos => (
                                <div
                                  key={pos}
                                  className="absolute bg-gray-400"
                                  style={{
                                    top: `${pos}px`,
                                    left: '0px',
                                    height: '1px',
                                    width: '4px'
                                  }}
                                />
                              ))}
                            </div>

                            {/* Logo Container */}
                            <div className="relative border border-dashed border-gray-300 bg-white" style={{ width: '400px', height: '400px' }}>
                              <div className="w-full h-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: currentGuide.logos.square?.[0]?.background || '#ffffff' }}>
                                <img 
                                  src={currentGuide.logos.original} 
                                  alt={`${shapeName} Logo with Guidelines`} 
                                  className="max-w-[75%] max-h-[75%] object-contain"
                                />
                              </div>
                              
                              {/* Render guidelines as dashed lines - exact same positioning as interactive */}
                              {guidelines.map(guideline => (
                                <div key={guideline.id}>
                                  <div
                                    className="absolute"
                                    style={{
                                      ...(guideline.type === 'horizontal' 
                                        ? {
                                            top: `${guideline.position}px`,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            borderTop: '2px dashed rgba(255, 0, 0, 0.8)'
                                          }
                                        : {
                                            left: `${guideline.position}px`,
                                            top: 0,
                                            bottom: 0,
                                            width: '2px',
                                            borderLeft: '2px dashed rgba(255, 0, 0, 0.8)'
                                          }
                                      ),
                                      zIndex: 10
                                    }}
                                  />
                                  
                                  {/* Guideline Label */}
                                  <div
                                    className="absolute bg-red-500 text-white text-xs px-1 py-0.5 rounded pointer-events-none"
                                    style={{
                                      ...(guideline.type === 'horizontal'
                                        ? {
                                            top: `${guideline.position - 12}px`,
                                            left: '8px'
                                          }
                                        : {
                                            left: `${guideline.position + 8}px`,
                                            top: '8px'
                                          }
                                      ),
                                      zIndex: 11
                                    }}
                                  >
                                    {guideline.name}: {Math.round(guideline.position)}px
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Guidelines List */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          {guidelines.map(guideline => (
                            <div key={guideline.id} className="bg-gray-50 p-2 rounded text-center">
                              <span className="font-medium">{guideline.name}:</span> {Math.round(guideline.position)}px
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex justify-center mb-12">
              <div className="w-64 h-64 flex items-center justify-center p-4 border rounded-md">
                <img src={currentGuide.logos.original} alt="Original Logo" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-6">Logo Variations</h3>
              
              <h4 className="text-lg font-medium mb-4 mt-8">Square</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {currentGuide.logos.square.slice(0, 4).map((logo, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <div className="flex justify-center">
                      <LogoPreview logo={logo} shape="square" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {logo.type === 'color' ? 'Color' : logo.type === 'white' ? 'White' : 'Black'} on {logo.background}
                    </p>
                  </div>
                ))}
              </div>
              
              <h4 className="text-lg font-medium mb-4 mt-8">Rounded</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                {currentGuide.logos.rounded.slice(0, 4).map((logo, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <div className="flex justify-center">
                      <LogoPreview logo={logo} shape="rounded" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {logo.type === 'color' ? 'Color' : logo.type === 'white' ? 'White' : 'Black'} on {logo.background}
                    </p>
                  </div>
                ))}
              </div>
              
              <h4 className="text-lg font-medium mb-4 mt-8">Circle</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {currentGuide.logos.circle.slice(0, 4).map((logo, index) => (
                  <div key={index} className="flex flex-col items-center space-y-3">
                    <div className="flex justify-center">
                      <LogoPreview logo={logo} shape="circle" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      {logo.type === 'color' ? 'Color' : logo.type === 'white' ? 'White' : 'Black'} on {logo.background}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <div className="hidden print:block text-center text-gray-400 mt-8 pt-8 border-t">
          <p>Made with ❤️ by Brand Studio</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Preview;
