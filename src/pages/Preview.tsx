import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { Button } from '@/components/ui/button';
import { FileDown, Share } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { useShareableLinks } from '@/hooks/useShareableLinks';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const { guideId } = useParams();
  const { 
    currentGuide, 
    colorNames, 
    typographyNames, 
    typographyVisibility,
    previewText,
    logoGuidelines
  } = useBrandGuide();
  const { toast } = useToast();
  const { generateShareableLink } = useShareableLinks();
  const { user } = useAuth();
  const [sharedGuide, setSharedGuide] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  const loadSharedGuide = async () => {
    if (guideId) {
      const q = query(collection(db, 'guides'), where('id', '==', guideId));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Guide not found",
          description: "The requested brand guide was not found.",
        });
        return;
      }
      const guide = querySnapshot.docs[0].data();
      setSharedGuide(guide);
    }
  };

  useEffect(() => {
    loadSharedGuide();
  }, [guideId]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      toast({
        title: "Generating Professional PDF",
        description: "Creating your comprehensive brand guide..."
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const addFooter = (isFirstOrLast: boolean = false) => {
        if (isFirstOrLast) {
          // Add gradient pill footer for first and last page
          const footerY = pageHeight - 20; // Positioned above border
          const footerX = pageWidth / 2;
          const pillWidth = 50;
          const pillHeight = 8;
          
          // Create gradient effect with rounded rectangle
          pdf.setFillColor(60, 60, 60);
          pdf.roundedRect(footerX - pillWidth/2, footerY - pillHeight/2, pillWidth, pillHeight, 4, 4, 'F');
          
          // Add clickable link
          pdf.link(footerX - pillWidth/2, footerY - pillHeight/2, pillWidth, pillHeight, { url: 'https://google.com' });
          
          pdf.setFontSize(8);
          pdf.setTextColor(255, 255, 255);
          pdf.text("Made with Brand Studio", footerX, footerY + 1, { align: 'center' });
        }
      };

      // PAGE 1: Title Page with border
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add page border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Brand name centered
      pdf.setFontSize(42);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(currentGuide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });
      
      addFooter(true);

      // Capture sections individually for better quality
      const sections = contentRef.current.querySelectorAll('section');
      
      for (let i = 0; i < sections.length; i++) {
        pdf.addPage();
        
        try {
          const canvas = await html2canvas(sections[i] as HTMLElement, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 800,
            height: 1000
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgWidth = pageWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Scale down if too tall
          const maxHeight = pageHeight - (margin * 2) - 10;
          const finalHeight = Math.min(imgHeight, maxHeight);
          const finalWidth = (canvas.width * finalHeight) / canvas.height;
          
          pdf.addImage(imgData, 'JPEG', margin, margin, finalWidth, finalHeight);
          
        } catch (error) {
          console.error('Error capturing section:', error);
          // Fallback: just add section title
          pdf.setFontSize(18);
          pdf.setFont('helvetica', 'bold');
          pdf.text(sections[i].querySelector('h2')?.textContent || 'Section', margin, margin + 20);
        }
      }

      // FINAL PAGE: Closing with border
      pdf.addPage();
      
      // Add page border
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Centered brand name and date
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

  const handleGenerateShareableLink = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to generate shareable links.",
      });
      return;
    }

    setIsGeneratingLink(true);
    try {
      const link = await generateShareableLink(currentGuide);
      if (link) {
        toast({
          title: "Link generated and copied!",
          description: "The shareable link has been copied to your clipboard.",
        });
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const guide = sharedGuide || currentGuide;
  const displayColorNames = sharedGuide?.colorNames || colorNames;
  const displayTypographyNames = sharedGuide?.typographyNames || typographyNames;
  const displayTypographyVisibility = sharedGuide?.typographyVisibility || typographyVisibility;
  const displayPreviewText = sharedGuide?.previewText || previewText;
  const displayLogoGuidelines = sharedGuide?.logoGuidelines || logoGuidelines;

  return (
    <MainLayout standalone={!!guideId}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{guide.name}</h1>
            <p className="text-xl text-muted-foreground">Brand Guidelines</p>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={handleExportPDF} variant="outline">
              <FileDown className="mr-2 h-4 w-4" />
              Save as PDF
            </Button>
            {!guideId && (
              <Button 
                onClick={handleGenerateShareableLink}
                disabled={!user || isGeneratingLink}
              >
                <Share className="mr-2 h-4 w-4" />
                {isGeneratingLink ? "Generating..." : "Share Link"}
              </Button>
            )}
          </div>
        </div>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Typography</h2>
          
          {/* Display Typography */}
          {Object.entries(guide.typography.display).some(([key]) => 
            displayTypographyVisibility.display?.includes(key)
          ) && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Display Typography</h3>
              <div className="grid gap-6">
                {Object.entries(guide.typography.display)
                  .filter(([key]) => displayTypographyVisibility.display?.includes(key))
                  .map(([key, style]) => {
                    const styleName = displayTypographyNames[`display-${key}`] || `Display ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-baseline gap-4">
                          <h4 className="text-lg font-medium text-muted-foreground min-w-[120px]">{styleName}</h4>
                          <p style={style} className="flex-1">
                            {displayPreviewText || "The quick brown fox jumps over the lazy dog"}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground ml-[136px]">
                          {style.fontFamily.replace(/"/g, '')} • {style.fontSize} • {style.fontWeight} • {style.lineHeight}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Heading Typography */}
          {Object.entries(guide.typography.heading).some(([key]) => 
            displayTypographyVisibility.heading?.includes(key)
          ) && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Headings</h3>
              <div className="grid gap-6">
                {Object.entries(guide.typography.heading)
                  .filter(([key]) => displayTypographyVisibility.heading?.includes(key))
                  .map(([key, style]) => {
                    const styleName = displayTypographyNames[`heading-${key}`] || `Heading ${key.toUpperCase()}`;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-baseline gap-4">
                          <h4 className="text-lg font-medium text-muted-foreground min-w-[120px]">{styleName}</h4>
                          <p style={style} className="flex-1">
                            {displayPreviewText || "The quick brown fox jumps over the lazy dog"}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground ml-[136px]">
                          {style.fontFamily.replace(/"/g, '')} • {style.fontSize} • {style.fontWeight} • {style.lineHeight}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Body Typography */}
          {Object.entries(guide.typography.body).some(([key]) => 
            displayTypographyVisibility.body?.includes(key)
          ) && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Body Text</h3>
              <div className="grid gap-6">
                {Object.entries(guide.typography.body)
                  .filter(([key]) => displayTypographyVisibility.body?.includes(key))
                  .map(([key, style]) => {
                    const styleName = displayTypographyNames[`body-${key}`] || `Body ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-baseline gap-4">
                          <h4 className="text-lg font-medium text-muted-foreground min-w-[120px]">{styleName}</h4>
                          <p style={style} className="flex-1">
                            {displayPreviewText || "The quick brown fox jumps over the lazy dog. This is sample body text to demonstrate the typography style with multiple lines and proper spacing."}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground ml-[136px]">
                          {style.fontFamily.replace(/"/g, '')} • {style.fontSize} • {style.fontWeight} • {style.lineHeight}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </section>

        {/* Colors Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Color Palette</h2>
          
          {guide.colors.primary.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Primary Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guide.colors.primary.map((color, index) => {
                  const colorName = displayColorNames[`primary-${index}`] || color.hex;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <h4 className="font-medium">{colorName}</h4>
                        <p className="text-sm text-muted-foreground">{color.hex}</p>
                        <p className="text-sm text-muted-foreground">{color.rgb}</p>
                        <p className="text-sm text-muted-foreground">{color.cmyk}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {guide.colors.secondary.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Secondary Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guide.colors.secondary.map((color, index) => {
                  const colorName = displayColorNames[`secondary-${index}`] || color.hex;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div 
                        className="w-16 h-16 rounded-lg border shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div>
                        <h4 className="font-medium">{colorName}</h4>
                        <p className="text-sm text-muted-foreground">{color.hex}</p>
                        <p className="text-sm text-muted-foreground">{color.rgb}</p>
                        <p className="text-sm text-muted-foreground">{color.cmyk}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Logo Section */}
        {guide.logos.original && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Logo</h2>
            
            {/* Logo Guidelines */}
            {displayLogoGuidelines && Object.keys(displayLogoGuidelines).length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-6">Logo Guidelines</h3>
                {Object.entries(displayLogoGuidelines).map(([logoType, guidelines]) => (
                  guidelines.length > 0 && (
                    <div key={logoType} className="mb-6">
                      <h4 className="text-lg font-medium mb-4 capitalize">
                        {logoType.replace('-', ' ')} Guidelines
                      </h4>
                      <div className="relative inline-block">
                        <div 
                          className="relative bg-white border rounded-lg p-4"
                          style={{ width: '300px', height: '300px' }}
                        >
                          <img 
                            src={guide.logos.original} 
                            alt="Logo with guidelines"
                            className="absolute inset-4 w-auto h-auto max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] object-contain"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                          {/* Guidelines overlay */}
                          {guidelines.map((guideline) => (
                            <div key={guideline.id}>
                              {guideline.type === 'horizontal' ? (
                                <div
                                  className="absolute border-t-2 border-dashed border-red-500"
                                  style={{
                                    top: `${(guideline.position / 400) * 100}%`,
                                    left: 0,
                                    right: 0,
                                  }}
                                >
                                  <span className="absolute left-2 -top-3 text-xs bg-red-500 text-white px-1 rounded">
                                    {guideline.name}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className="absolute border-l-2 border-dashed border-red-500"
                                  style={{
                                    left: `${(guideline.position / 400) * 100}%`,
                                    top: 0,
                                    bottom: 0,
                                  }}
                                >
                                  <span className="absolute top-2 -left-8 text-xs bg-red-500 text-white px-1 rounded transform -rotate-90">
                                    {guideline.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-sm text-muted-foreground">
                          <p className="font-medium mb-2">Guidelines:</p>
                          <ul className="space-y-1">
                            {guidelines.map((guideline) => (
                              <li key={guideline.id}>
                                {guideline.name}: {Math.round(guideline.position)}px
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Primary Logo */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Primary Logo</h3>
              <div className="flex items-center justify-center w-48 h-48 bg-white border rounded-lg">
                <img 
                  src={guide.logos.original} 
                  alt="Primary Logo" 
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            </div>

            {/* Logo Variations */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-6">Logo Variations</h3>
              
              {guide.logos.square.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Square</h4>
                  <div className="flex gap-4 flex-wrap">
                    {guide.logos.square.slice(0, 4).map((logo, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-20 h-20 rounded border flex items-center justify-center mb-2"
                          style={{ backgroundColor: logo.background }}
                        >
                          <img 
                            src={logo.src} 
                            alt={`Square logo ${index + 1}`}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {logo.background === '#FFFFFF' ? 'White' : 
                           logo.background === '#000000' ? 'Black' : 'Color'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {guide.logos.rounded.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Rounded</h4>
                  <div className="flex gap-4 flex-wrap">
                    {guide.logos.rounded.slice(0, 4).map((logo, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-20 h-20 rounded-lg border flex items-center justify-center mb-2"
                          style={{ backgroundColor: logo.background }}
                        >
                          <img 
                            src={logo.src} 
                            alt={`Rounded logo ${index + 1}`}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {logo.background === '#FFFFFF' ? 'White' : 
                           logo.background === '#000000' ? 'Black' : 'Color'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {guide.logos.circle.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Circle</h4>
                  <div className="flex gap-4 flex-wrap">
                    {guide.logos.circle.slice(0, 4).map((logo, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-20 h-20 rounded-full border flex items-center justify-center mb-2"
                          style={{ backgroundColor: logo.background }}
                        >
                          <img 
                            src={logo.src} 
                            alt={`Circle logo ${index + 1}`}
                            className="w-16 h-16 object-contain rounded-full"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {logo.background === '#FFFFFF' ? 'White' : 
                           logo.background === '#000000' ? 'Black' : 'Color'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
};

export default Preview;
