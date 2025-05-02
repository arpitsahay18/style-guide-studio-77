
import React, { useRef } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { MainLayout } from '@/components/MainLayout';
import { TypographyPreview } from '@/components/ui/TypographyPreview';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { LogoPreview } from '@/components/ui/LogoPreview';
import { Button } from '@/components/ui/button';
import { Download, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

const Preview = () => {
  const { currentGuide, previewText } = useBrandGuide();
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
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
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const generatePDF = async () => {
    if (!contentRef.current) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your PDF...",
      });
      
      const content = contentRef.current;
      
      // Improved PDF generation with better quality/size balance
      const canvas = await html2canvas(content, {
        scale: 1, // Lower scale for better file size
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Optimize image quality vs file size
      const imgData = canvas.toDataURL('image/jpeg', 0.7); // Use JPEG with 70% quality
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate aspect ratio
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Split into pages if content is too long
      const pageHeight = 297; // A4 height in mm
      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;
      
      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add subsequent pages if needed
      while (heightLeft > 0) {
        position = -pageHeight * page;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        page++;
      }
      
      // Add watermark
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Created with Brand Studio', 105, 290, { align: 'center' });
      
      pdf.save(`${currentGuide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your brand guide has been downloaded.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: "destructive",
        title: "Error Generating PDF",
        description: "There was a problem generating your PDF. Please try again.",
      });
    }
  };

  return (
    <MainLayout>
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Brand Guide Preview</h1>
          <Button onClick={generatePDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Download as PDF
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
                {Object.entries(currentGuide.typography.display).map(([key, style]) => (
                  <TypographyPreview 
                    key={key}
                    name={`Display ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    style={style}
                    previewText={previewText}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Headings</h3>
              <div className="grid gap-6">
                {Object.entries(currentGuide.typography.heading).map(([key, style]) => (
                  <TypographyPreview 
                    key={key}
                    name={`Heading ${key.toUpperCase()}`}
                    style={style}
                    previewText={previewText}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Body Text</h3>
              <div className="grid gap-6">
                {Object.entries(currentGuide.typography.body).map(([key, style]) => (
                  <TypographyPreview 
                    key={key}
                    name={`Body ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                    style={style}
                    previewText={previewText}
                  />
                ))}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentGuide.colors.primary.map((color, index) => (
                  <ColorSwatch key={index} color={color} />
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Secondary Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentGuide.colors.secondary.map((color, index) => (
                  <ColorSwatch key={index} color={color} />
                ))}
              </div>
            </div>
            
            {currentGuide.colors.neutral.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Neutral Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentGuide.colors.neutral.map((color, index) => (
                    <ColorSwatch key={index} color={color} />
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
            <div className="flex justify-center mb-8">
              <div className="w-64 h-64 flex items-center justify-center p-4 border rounded-md">
                <img 
                  src={currentGuide.logos.original} 
                  alt="Original Logo" 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Logo Variations</h3>
              
              {/* Square Logo Variations */}
              <h4 className="text-lg font-medium mb-3 mt-6">Square</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {currentGuide.logos.square.slice(0, 4).map((logo, index) => (
                  <LogoPreview 
                    key={index}
                    logo={logo}
                    shape="square"
                  />
                ))}
              </div>
              
              {/* Rounded Logo Variations */}
              <h4 className="text-lg font-medium mb-3 mt-6">Rounded</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {currentGuide.logos.rounded.slice(0, 4).map((logo, index) => (
                  <LogoPreview 
                    key={index}
                    logo={logo}
                    shape="rounded"
                  />
                ))}
              </div>
              
              {/* Circle Logo Variations */}
              <h4 className="text-lg font-medium mb-3 mt-6">Circle</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {currentGuide.logos.circle.slice(0, 4).map((logo, index) => (
                  <LogoPreview 
                    key={index}
                    logo={logo}
                    shape="circle"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Hidden watermark for PDF - only visible when exported */}
        <div className="hidden print:block text-center text-gray-400 mt-8 pt-8 border-t">
          <p>Created with Brand Studio</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Preview;

