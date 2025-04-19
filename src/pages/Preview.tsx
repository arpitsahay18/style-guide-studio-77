
import React, { useEffect, useRef } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { TypographyPreview } from '@/components/ui/TypographyPreview';
import { ColorSwatch } from '@/components/ui/ColorSwatch';
import { LogoPreview } from '@/components/ui/LogoPreview';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate, useParams } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';

const Preview = () => {
  const { currentGuide, previewText } = useBrandGuide();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { guideId } = useParams();
  
  // Function to generate and download PDF
  const generatePDF = async () => {
    if (!previewRef.current) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your brand guide...",
      });
      
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      let position = 0;
      
      // If content is longer than a single page, create multiple pages
      while (position < imgHeight) {
        const contentHeight = Math.min(297, imgHeight - position); // A4 height is 297mm
        
        if (position > 0) {
          pdf.addPage();
        }
        
        // Add content to PDF
        pdf.addImage(
          imgData, 
          'JPEG', 
          0, // x
          position === 0 ? 0 : -(position % 297), // y 
          imgWidth, // width
          imgHeight // height
        );
        
        position += contentHeight;
      }
      
      // Add watermark to the last page
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      pdf.text('Made with Brand Studio', 105, 290, { align: 'center' });
      
      pdf.save(`${currentGuide.name.replace(/\s+/g, '-').toLowerCase()}-brand-guide.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your brand guide has been downloaded as a PDF.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error creating your PDF. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Auto-generate PDF if this was opened from Export page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoPdf = urlParams.get('pdf');
    
    if (autoPdf === 'true') {
      setTimeout(() => {
        generatePDF();
      }, 1500); // Give time for images to load
    }
  }, []);

  // Default sample text if not available in typography settings
  const defaultSampleText = "The quick brown fox jumps over the lazy dog.";
  
  return (
    <div className="bg-white text-black min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
          
          <Button
            onClick={generatePDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Download as PDF
          </Button>
        </div>
      </div>
      
      <div className="pt-16"> {/* Added padding to accommodate fixed header */}
        <div className="container mx-auto px-4 py-8">
          <div ref={previewRef} className="bg-white p-8 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-2">{currentGuide.name || 'Brand Guidelines'}</h1>
              <p className="text-lg text-gray-600">Brand Identity Guidelines</p>
            </div>
            
            {/* Typography Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6 pb-2 border-b">Typography</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Display Typography</h3>
                <div className="space-y-6">
                  {Object.entries(currentGuide.typography.display).map(([key, style]) => (
                    <TypographyPreview 
                      key={key}
                      name={`Display ${key}`}
                      style={style}
                      previewText={previewText || defaultSampleText}
                      showCode={false}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Heading Typography</h3>
                <div className="space-y-6">
                  {Object.entries(currentGuide.typography.heading).map(([key, style]) => (
                    <TypographyPreview 
                      key={key}
                      name={`Heading ${key}`}
                      style={style}
                      previewText={previewText || defaultSampleText}
                      showCode={false}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-4">Body Typography</h3>
                <div className="space-y-6">
                  {Object.entries(currentGuide.typography.body)
                    .filter(([key]) => !key.includes('Light') && !key.includes('Medium'))
                    .map(([key, style]) => (
                      <TypographyPreview 
                        key={key}
                        name={`Body ${key}`}
                        style={style}
                        previewText={previewText || defaultSampleText}
                        showCode={false}
                      />
                    ))}
                </div>
              </div>
            </section>
            
            {/* Color Section */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-6 pb-2 border-b">Color Palette</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Primary Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentGuide.colors.primary.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <ColorSwatch color={color.hex} size="lg" className="w-full h-24" />
                      <div className="p-2">
                        <p className="font-mono font-bold">{color.hex}</p>
                        <p className="text-sm text-gray-600 font-mono">{color.rgb}</p>
                        <div className="mt-2">
                          <p className="text-sm">
                            <span className="font-medium">White Contrast:</span> {color.whiteContrast.toFixed(2)}
                            <span className={color.whiteContrast >= 4.5 ? " text-green-600 ml-1" : " text-red-600 ml-1"}>
                              {color.whiteContrast >= 4.5 ? "AA Pass" : "AA Fail"}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Black Contrast:</span> {color.blackContrast.toFixed(2)}
                            <span className={color.blackContrast >= 4.5 ? " text-green-600 ml-1" : " text-red-600 ml-1"}>
                              {color.blackContrast >= 4.5 ? "AA Pass" : "AA Fail"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">Secondary Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentGuide.colors.secondary.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <ColorSwatch color={color.hex} size="lg" className="w-full h-24" />
                      <div className="p-2">
                        <p className="font-mono font-bold">{color.hex}</p>
                        <p className="text-sm text-gray-600 font-mono">{color.rgb}</p>
                        <div className="mt-2">
                          <div className="grid grid-cols-5 gap-1 mb-2">
                            {color.tints.map((tint, i) => (
                              <div 
                                key={i} 
                                className="w-full aspect-square rounded-sm border border-gray-200" 
                                style={{ backgroundColor: tint }} 
                                title={tint}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {color.shades.map((shade, i) => (
                              <div 
                                key={i} 
                                className="w-full aspect-square rounded-sm border border-gray-200" 
                                style={{ backgroundColor: shade }} 
                                title={shade}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-4">Neutral Colors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {currentGuide.colors.neutral.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <ColorSwatch color={color.hex} size="lg" className="w-full h-24" />
                      <div className="p-2">
                        <p className="font-mono font-bold">{color.hex}</p>
                        <p className="text-sm text-gray-600 font-mono">{color.rgb}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            
            {/* Logo Section */}
            {currentGuide.logos.original && (
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-6 pb-2 border-b">Logo Guidelines</h2>
                
                <div className="flex justify-center mb-8">
                  <img 
                    src={currentGuide.logos.original} 
                    alt="Primary Logo" 
                    className="max-w-xs max-h-60 object-contain"
                  />
                </div>
                
                <h3 className="text-xl font-medium mb-4">Logo Variations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {currentGuide.logos.square.map((logo, index) => (
                    <LogoPreview
                      key={index}
                      logo={logo}
                      shape="square"
                      showDownload={false}
                    />
                  ))}
                </div>
                
                <h3 className="text-xl font-medium mb-4">Logo Usage</h3>
                <div className="space-y-4 text-gray-700">
                  <p>• Always maintain the logo's proportions when resizing.</p>
                  <p>• Ensure adequate clear space around the logo - at least equal to the height of the logo divided by 4.</p>
                  <p>• Don't alter the logo colors outside of the approved variations.</p>
                  <p>• Don't add effects such as shadows, outlines, or other decorations to the logo.</p>
                  <p>• Don't place the logo on busy backgrounds that reduce visibility and impact.</p>
                </div>
              </section>
            )}
            
            {/* Hidden watermark - only visible in PDF */}
            <div className="hidden print:block text-center text-gray-400 text-sm mt-8 pt-8 border-t">
              Made with Brand Studio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
