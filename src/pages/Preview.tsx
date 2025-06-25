import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { Button } from '@/components/ui/button';
import { FileDown, Share } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { useShareableLinks } from '@/hooks/useShareableLinks';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TypographyStyle } from '@/types';

const Preview = () => {
  const { guideId } = useParams();
  const { 
    currentGuide, 
    colorNames, 
    typographyNames, 
    typographyVisibility,
    previewText
  } = useBrandGuide();
  const { toast } = useToast();
  const { generateShareableLink } = useShareableLinks();
  const { user } = useAuth();
  const [sharedGuide, setSharedGuide] = useState<any>(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [loading, setLoading] = useState(!!guideId);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const loadSharedGuide = async () => {
    if (!guideId) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Loading shared guide with linkId:', guideId);
      
      const q = query(
        collection(db, 'shareableLinks'), 
        where('linkId', '==', guideId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('No shareable link found with linkId:', guideId);
        setError('Link not found or invalid.');
        return;
      }
      
      const linkDoc = querySnapshot.docs[0];
      const linkData = linkDoc.data();
      
      console.log('Found shareable link data:', linkData);
      
      const expiresAt = linkData.expiresAt?.toDate?.() || new Date(linkData.expiresAt);
      const now = new Date();
      
      if (expiresAt < now) {
        console.log('Link has expired:', expiresAt, 'current time:', now);
        setError('This link has expired.');
        return;
      }
      
      const brandGuideData = linkData.brandGuide;
      
      if (!brandGuideData) {
        console.log('No brand guide data found in shareable link');
        setError('Brand guide data not found.');
        return;
      }
      
      console.log('Setting shared guide data:', brandGuideData);
      setSharedGuide({
        ...brandGuideData,
        colorNames: linkData.colorNames || {},
        typographyNames: linkData.typographyNames || {},
        typographyVisibility: linkData.typographyVisibility || {},
        previewText: linkData.previewText || ''
      });
      
    } catch (error) {
      console.error('Error loading shared guide:', error);
      setError('Failed to load the shared guide.');
      toast({
        variant: "destructive",
        title: "Error loading guide",
        description: "There was a problem loading the shared brand guide.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guideId) {
      loadSharedGuide();
    }
  }, [guideId]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Creating your brand guide PDF..."
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      const guide = sharedGuide || currentGuide;
      
      // Title Page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setFontSize(42);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(guide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });

      // Capture sections separately to avoid page breaks cutting content
      const sections = contentRef.current.querySelectorAll('.pdf-section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        // Add new page for each section
        pdf.addPage();
        
        try {
          const canvas = await html2canvas(section, {
            scale: 1.2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            height: section.scrollHeight,
            width: section.scrollWidth
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * contentWidth) / canvas.width;
          
          // If content is too tall, split it across multiple pages
          if (imgHeight > contentHeight) {
            const totalPages = Math.ceil(imgHeight / contentHeight);
            
            for (let pageNum = 0; pageNum < totalPages; pageNum++) {
              if (pageNum > 0) pdf.addPage();
              
              const sourceY = (pageNum * contentHeight * canvas.width) / contentWidth;
              const sourceHeight = Math.min(
                (contentHeight * canvas.width) / contentWidth,
                canvas.height - sourceY
              );
              
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = canvas.width;
              tempCanvas.height = sourceHeight;
              const tempCtx = tempCanvas.getContext('2d');
              
              if (tempCtx) {
                tempCtx.drawImage(
                  canvas,
                  0, sourceY, canvas.width, sourceHeight,
                  0, 0, canvas.width, sourceHeight
                );
                
                const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.8);
                const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
                
                pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
              }
            }
          } else {
            pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
          }
        } catch (sectionError) {
          console.error('Error capturing section:', sectionError);
        }
      }

      pdf.save(`${guide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your brand guide has been downloaded."
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

  if (loading && guideId) {
    return (
      <MainLayout standalone={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading brand guide...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error && guideId) {
    return (
      <MainLayout standalone={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4">
              <h2 className="font-bold text-lg mb-2">Link Error</h2>
              <p>{error}</p>
            </div>
            <p className="text-gray-600">
              This link may have expired or been removed. Please contact the person who shared it with you.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const guide = sharedGuide || currentGuide;
  const displayColorNames = sharedGuide?.colorNames || colorNames;
  const displayTypographyNames = sharedGuide?.typographyNames || typographyNames;
  const displayTypographyVisibility = sharedGuide?.typographyVisibility || typographyVisibility;
  const displayPreviewText = sharedGuide?.previewText || previewText;

  const convertToCSS = (style: TypographyStyle): React.CSSProperties => {
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    };
  };

  return (
    <MainLayout standalone={!!guideId}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-gray-900">{guide.name}</h1>
              <p className="text-2xl text-gray-600">Brand Guidelines</p>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleExportPDF} variant="outline" size="lg">
                <FileDown className="mr-2 h-5 w-5" />
                Save as PDF
              </Button>
              {!guideId && (
                <Button 
                  onClick={handleGenerateShareableLink}
                  disabled={!user || isGeneratingLink}
                  size="lg"
                >
                  <Share className="mr-2 h-5 w-5" />
                  {isGeneratingLink ? "Generating..." : "Share Link"}
                </Button>
              )}
            </div>
          </div>

          <div ref={contentRef} className="space-y-16">
            {/* Typography Section */}
            <section className="pdf-section bg-white rounded-lg shadow-sm p-8 page-break-inside-avoid">
              <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4">Typography</h2>
              
              {Object.entries(guide.typography.display).some(([key]) => 
                displayTypographyVisibility.display?.includes(key)
              ) && (
                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Display Typography</h3>
                  <div className="space-y-8">
                    {Object.entries(guide.typography.display)
                      .filter(([key]) => displayTypographyVisibility.display?.includes(key))
                      .map(([key, style]) => {
                        const typedStyle = style as TypographyStyle;
                        const styleName = displayTypographyNames[`display-${key}`] || `Display ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        return (
                          <div key={key} className="border-l-4 border-blue-500 pl-6 py-4 page-break-inside-avoid">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                              <div className="lg:col-span-1">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">{styleName}</h4>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p>{typedStyle.fontFamily.replace(/"/g, '')}</p>
                                  <p>{typedStyle.fontSize} • {typedStyle.fontWeight}</p>
                                  <p>{typedStyle.lineHeight} • {typedStyle.letterSpacing}</p>
                                </div>
                              </div>
                              <div className="lg:col-span-3">
                                <p style={convertToCSS(typedStyle)} className="break-words">
                                  {displayPreviewText || "The quick brown fox jumps over the lazy dog"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {Object.entries(guide.typography.heading).some(([key]) => 
                displayTypographyVisibility.heading?.includes(key)
              ) && (
                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Headings</h3>
                  <div className="space-y-8">
                    {Object.entries(guide.typography.heading)
                      .filter(([key]) => displayTypographyVisibility.heading?.includes(key))
                      .map(([key, style]) => {
                        const typedStyle = style as TypographyStyle;
                        const styleName = displayTypographyNames[`heading-${key}`] || `Heading ${key.toUpperCase()}`;
                        return (
                          <div key={key} className="border-l-4 border-green-500 pl-6 py-4 page-break-inside-avoid">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                              <div className="lg:col-span-1">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">{styleName}</h4>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p>{typedStyle.fontFamily.replace(/"/g, '')}</p>
                                  <p>{typedStyle.fontSize} • {typedStyle.fontWeight}</p>
                                  <p>{typedStyle.lineHeight} • {typedStyle.letterSpacing}</p>
                                </div>
                              </div>
                              <div className="lg:col-span-3">
                                <p style={convertToCSS(typedStyle)} className="break-words">
                                  {displayPreviewText || "The quick brown fox jumps over the lazy dog"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {Object.entries(guide.typography.body).some(([key]) => 
                displayTypographyVisibility.body?.includes(key)
              ) && (
                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Body Text</h3>
                  <div className="space-y-8">
                    {Object.entries(guide.typography.body)
                      .filter(([key]) => displayTypographyVisibility.body?.includes(key))
                      .map(([key, style]) => {
                        const typedStyle = style as TypographyStyle;
                        const styleName = displayTypographyNames[`body-${key}`] || `Body ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        return (
                          <div key={key} className="border-l-4 border-purple-500 pl-6 py-4 page-break-inside-avoid">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                              <div className="lg:col-span-1">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">{styleName}</h4>
                                <div className="text-sm text-gray-500 space-y-1">
                                  <p>{typedStyle.fontFamily.replace(/"/g, '')}</p>
                                  <p>{typedStyle.fontSize} • {typedStyle.fontWeight}</p>
                                  <p>{typedStyle.lineHeight} • {typedStyle.letterSpacing}</p>
                                </div>
                              </div>
                              <div className="lg:col-span-3">
                                <p style={convertToCSS(typedStyle)} className="break-words">
                                  {displayPreviewText || "The quick brown fox jumps over the lazy dog. This is sample body text to demonstrate the typography style with multiple lines and proper spacing."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </section>

            {/* Colors Section */}
            <section className="pdf-section bg-white rounded-lg shadow-sm p-8 page-break-inside-avoid">
              <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4">Color Palette</h2>
              
              {guide.colors.primary && guide.colors.primary.length > 0 && (
                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Primary Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {guide.colors.primary.map((color: any, index: number) => {
                      const colorName = displayColorNames[`primary-${index}`] || color.hex;
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-6 page-break-inside-avoid">
                          <div 
                            className="w-full h-24 rounded-lg border shadow-sm mb-4"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg text-gray-900">{colorName}</h4>
                            <p className="text-sm text-gray-600">HEX: {color.hex}</p>
                            <p className="text-sm text-gray-600">RGB: {color.rgb}</p>
                            <p className="text-sm text-gray-600">CMYK: {color.cmyk}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {guide.colors.secondary && guide.colors.secondary.length > 0 && (
                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Secondary Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {guide.colors.secondary.map((color: any, index: number) => {
                      const colorName = displayColorNames[`secondary-${index}`] || color.hex;
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-6 page-break-inside-avoid">
                          <div 
                            className="w-full h-24 rounded-lg border shadow-sm mb-4"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="space-y-2">
                            <h4 className="font-semibold text-lg text-gray-900">{colorName}</h4>
                            <p className="text-sm text-gray-600">HEX: {color.hex}</p>
                            <p className="text-sm text-gray-600">RGB: {color.rgb}</p>
                            <p className="text-sm text-gray-600">CMYK: {color.cmyk}</p>
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
              <section className="pdf-section bg-white rounded-lg shadow-sm p-8 page-break-inside-avoid">
                <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4">Logo</h2>
                
                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Primary Logo</h3>
                  <div className="flex justify-center">
                    <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                      <div className="flex items-center justify-center w-64 h-64 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                        <img 
                          src={guide.logos.original} 
                          alt="Primary Logo" 
                          className="max-w-full max-h-full object-contain p-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-12 page-break-inside-avoid">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Logo Variations</h3>
                  
                  {guide.logos.square && guide.logos.square.length > 0 && (
                    <div className="mb-10 page-break-inside-avoid">
                      <h4 className="text-2xl font-medium mb-6 text-gray-700">Square</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {guide.logos.square.slice(0, 4).map((logo: any, index: number) => (
                          <div key={index} className="text-center bg-gray-50 rounded-lg p-4 page-break-inside-avoid">
                            <div 
                              className="w-24 h-24 rounded border-2 border-gray-200 flex items-center justify-center mb-3 mx-auto shadow-sm"
                              style={{ backgroundColor: logo.background }}
                            >
                              <img 
                                src={logo.src} 
                                alt={`Square logo ${index + 1}`}
                                className="w-20 h-20 object-contain"
                              />
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                              {logo.background === '#FFFFFF' ? 'White Background' : 
                               logo.background === '#000000' ? 'Black Background' : 'Color Background'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guide.logos.rounded && guide.logos.rounded.length > 0 && (
                    <div className="mb-10 page-break-inside-avoid">
                      <h4 className="text-2xl font-medium mb-6 text-gray-700">Rounded</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {guide.logos.rounded.slice(0, 4).map((logo: any, index: number) => (
                          <div key={index} className="text-center bg-gray-50 rounded-lg p-4 page-break-inside-avoid">
                            <div 
                              className="w-24 h-24 rounded-lg border-2 border-gray-200 flex items-center justify-center mb-3 mx-auto shadow-sm"
                              style={{ backgroundColor: logo.background }}
                            >
                              <img 
                                src={logo.src} 
                                alt={`Rounded logo ${index + 1}`}
                                className="w-20 h-20 object-contain"
                              />
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                              {logo.background === '#FFFFFF' ? 'White Background' : 
                               logo.background === '#000000' ? 'Black Background' : 'Color Background'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {guide.logos.circle && guide.logos.circle.length > 0 && (
                    <div className="mb-10 page-break-inside-avoid">
                      <h4 className="text-2xl font-medium mb-6 text-gray-700">Circle</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {guide.logos.circle.slice(0, 4).map((logo: any, index: number) => (
                          <div key={index} className="text-center bg-gray-50 rounded-lg p-4 page-break-inside-avoid">
                            <div 
                              className="w-24 h-24 rounded-full border-2 border-gray-200 flex items-center justify-center mb-3 mx-auto shadow-sm"
                              style={{ backgroundColor: logo.background }}
                            >
                              <img 
                                src={logo.src} 
                                alt={`Circle logo ${index + 1}`}
                                className="w-20 h-20 object-contain rounded-full"
                              />
                            </div>
                            <p className="text-sm font-medium text-gray-600">
                              {logo.background === '#FFFFFF' ? 'White Background' : 
                               logo.background === '#000000' ? 'Black Background' : 'Color Background'}
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
        </div>
      </div>
    </MainLayout>
  );
};

export default Preview;
