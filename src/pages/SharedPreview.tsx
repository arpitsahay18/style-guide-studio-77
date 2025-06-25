
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuide, TypographyStyle } from '@/types';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

interface SharedGuideData {
  brandGuide: BrandGuide;
  colorNames: { [key: string]: string };
  typographyNames: { [key: string]: string };
  typographyVisibility: {
    display: string[];
    heading: string[];
    body: string[];
  };
  previewText: string;
}

const SharedPreview = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const [guideData, setGuideData] = useState<SharedGuideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSharedGuide = async () => {
      if (!linkId) {
        setError('Invalid link');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading shared guide with linkId:', linkId);
        
        const q = query(
          collection(db, 'shareableLinks'),
          where('linkId', '==', linkId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log('No document found for linkId:', linkId);
          setError('Link not found or invalid.');
          return;
        }
        
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        console.log('Found document data:', data);
        
        // Check if link has expired
        const expiresAt = data.expiresAt.toDate();
        const now = new Date();
        
        if (expiresAt < now) {
          console.log('Link expired:', expiresAt, 'current time:', now);
          setError('This link has expired.');
          return;
        }
        
        // Validate required data
        if (!data.brandGuide) {
          console.log('No brand guide data found');
          setError('Brand guide data not found.');
          return;
        }
        
        setGuideData({
          brandGuide: data.brandGuide,
          colorNames: data.colorNames || {},
          typographyNames: data.typographyNames || {},
          typographyVisibility: data.typographyVisibility || {
            display: ['large', 'regular'],
            heading: ['h1', 'h2', 'h3'],
            body: ['large', 'medium', 'small']
          },
          previewText: data.previewText || 'The quick brown fox jumps over the lazy dog'
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

    loadSharedGuide();
  }, [linkId, toast]);

  const handleExportPDF = async () => {
    if (!guideData) return;

    try {
      toast({
        title: "Generating PDF",
        description: "Creating your brand guide PDF...",
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;

      // Title Page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setFontSize(42);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(guideData.brandGuide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });

      pdf.save(`${guideData.brandGuide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
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

  if (loading) {
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

  if (error) {
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

  if (!guideData) {
    return (
      <MainLayout standalone={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">No guide data available.</p>
        </div>
      </MainLayout>
    );
  }

  const { brandGuide, colorNames, typographyNames, typographyVisibility, previewText } = guideData;

  return (
    <MainLayout standalone={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-gray-900">{brandGuide.name}</h1>
              <p className="text-2xl text-gray-600">Brand Guidelines</p>
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleExportPDF} variant="outline" size="lg">
                <FileDown className="mr-2 h-5 w-5" />
                Save as PDF
              </Button>
            </div>
          </div>

          <div className="space-y-16">
            {/* Typography Section */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4">Typography</h2>
              
              {/* Display Typography */}
              {Object.entries(brandGuide.typography.display).some(([key]) => 
                typographyVisibility.display?.includes(key)
              ) && (
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Display Typography</h3>
                  <div className="space-y-8">
                    {Object.entries(brandGuide.typography.display)
                      .filter(([key]) => typographyVisibility.display?.includes(key))
                      .map(([key, style]) => {
                        const typedStyle = style as TypographyStyle;
                        const styleName = typographyNames[`display-${key}`] || `Display ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        return (
                          <div key={key} className="border-l-4 border-blue-500 pl-6 py-4">
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
                                  {previewText}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Heading Typography */}
              {Object.entries(brandGuide.typography.heading).some(([key]) => 
                typographyVisibility.heading?.includes(key)
              ) && (
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Headings</h3>
                  <div className="space-y-8">
                    {Object.entries(brandGuide.typography.heading)
                      .filter(([key]) => typographyVisibility.heading?.includes(key))
                      .map(([key, style]) => {
                        const typedStyle = style as TypographyStyle;
                        const styleName = typographyNames[`heading-${key}`] || `Heading ${key.toUpperCase()}`;
                        return (
                          <div key={key} className="border-l-4 border-green-500 pl-6 py-4">
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
                                  {previewText}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Body Typography */}
              {Object.entries(brandGuide.typography.body).some(([key]) => 
                typographyVisibility.body?.includes(key)
              ) && (
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Body Text</h3>
                  <div className="space-y-8">
                    {Object.entries(brandGuide.typography.body)
                      .filter(([key]) => typographyVisibility.body?.includes(key))
                      .map(([key, style]) => {
                        const typedStyle = style as TypographyStyle;
                        const styleName = typographyNames[`body-${key}`] || `Body ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                        return (
                          <div key={key} className="border-l-4 border-purple-500 pl-6 py-4">
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
                                  {previewText} This is sample body text to demonstrate the typography style with multiple lines and proper spacing.
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
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4">Color Palette</h2>
              
              {brandGuide.colors.primary && brandGuide.colors.primary.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Primary Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brandGuide.colors.primary.map((color: any, index: number) => {
                      const colorName = colorNames[`primary-${index}`] || color.hex;
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
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

              {brandGuide.colors.secondary && brandGuide.colors.secondary.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Secondary Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {brandGuide.colors.secondary.map((color: any, index: number) => {
                      const colorName = colorNames[`secondary-${index}`] || color.hex;
                      return (
                        <div key={index} className="bg-gray-50 rounded-lg p-6">
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
            {brandGuide.logos.original && (
              <section className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4">Logo</h2>
                
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Primary Logo</h3>
                  <div className="flex justify-center">
                    <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                      <div className="flex items-center justify-center w-64 h-64 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                        <img 
                          src={brandGuide.logos.original} 
                          alt="Primary Logo" 
                          className="max-w-full max-h-full object-contain p-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo Variations */}
                <div className="mb-12">
                  <h3 className="text-3xl font-semibold mb-8 text-gray-800">Logo Variations</h3>
                  
                  {brandGuide.logos.square && brandGuide.logos.square.length > 0 && (
                    <div className="mb-10">
                      <h4 className="text-2xl font-medium mb-6 text-gray-700">Square</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {brandGuide.logos.square.slice(0, 4).map((logo: any, index: number) => (
                          <div key={index} className="text-center bg-gray-50 rounded-lg p-4">
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

                  {brandGuide.logos.rounded && brandGuide.logos.rounded.length > 0 && (
                    <div className="mb-10">
                      <h4 className="text-2xl font-medium mb-6 text-gray-700">Rounded</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {brandGuide.logos.rounded.slice(0, 4).map((logo: any, index: number) => (
                          <div key={index} className="text-center bg-gray-50 rounded-lg p-4">
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

                  {brandGuide.logos.circle && brandGuide.logos.circle.length > 0 && (
                    <div className="mb-10">
                      <h4 className="text-2xl font-medium mb-6 text-gray-700">Circle</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {brandGuide.logos.circle.slice(0, 4).map((logo: any, index: number) => (
                          <div key={index} className="text-center bg-gray-50 rounded-lg p-4">
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

export default SharedPreview;
