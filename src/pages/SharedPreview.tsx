import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SharedPreview = () => {
  const { linkId } = useParams();
  const { toast } = useToast();
  const [sharedGuide, setSharedGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

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
        console.log('No shareable link found with linkId:', linkId);
        setError('Link not found or invalid.');
        return;
      }

      const linkDoc = querySnapshot.docs[0];
      const linkData = linkDoc.data();
      console.log('Raw shared link data:', linkData);

      // Check if link has expired
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

      console.log('Extracted brand guide data:', brandGuideData);
      console.log('Color names from link:', linkData.colorNames);
      console.log('Typography names from link:', linkData.typographyNames);
      console.log('Typography visibility from link:', linkData.typographyVisibility);
      
      setSharedGuide({
        ...brandGuideData,
        colorNames: linkData.colorNames || {},
        typographyNames: linkData.typographyNames || {},
        typographyVisibility: linkData.typographyVisibility || {
          display: ['large', 'regular'],
          heading: ['h1', 'h2', 'h3'],
          body: ['large', 'medium', 'small']
        },
        previewText: linkData.previewText || 'The quick brown fox jumps over the lazy dog'
      });

    } catch (error) {
      console.error('Error loading shared guide:', error);
      setError('Failed to load the shared guide.');
      toast({
        variant: "destructive",
        title: "Error loading guide",
        description: "There was a problem loading the shared brand guide."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedGuide();
  }, [linkId]);

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
      const contentWidth = pageWidth - margin * 2;

      // Title Page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      pdf.setFontSize(42);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(sharedGuide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });

      // Capture sections separately to avoid page breaks cutting content
      const sections = contentRef.current.querySelectorAll('.pdf-section');
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Add new page for each section
        pdf.addPage();
        
        try {
          const canvas = await html2canvas(section, {
            scale: 1.2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.8);
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * contentWidth) / canvas.width;
          
          pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
        } catch (sectionError) {
          console.error('Error capturing section:', sectionError);
        }
      }

      pdf.save(`${sharedGuide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);

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

  const getColorDisplayName = (color, index, category) => {
    const colorKey = `${category}-${index}`;
    const customName = sharedGuide.colorNames?.[colorKey] || sharedGuide.colorNames?.[color.hex];
    return customName || `${category.charAt(0).toUpperCase() + category.slice(1)} ${index + 1}`;
  };

  const getTypographyDisplayName = (category, styleKey) => {
    const nameKey = `${category}-${styleKey}`;
    return sharedGuide.typographyNames?.[nameKey] || sharedGuide.typographyNames?.[styleKey] || styleKey;
  };

  if (loading) {
    return (
      <MainLayout standalone>
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
      <MainLayout standalone>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mb-4">
              <h2 className="font-bold text-lg mb-2">Unable to Load Brand Guide</h2>
              <p>{error}</p>
            </div>
            <p className="text-gray-600">
              The link may have expired or been removed. Please contact the person who shared this link.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!sharedGuide) {
    return (
      <MainLayout standalone>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No brand guide data found.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  console.log('Rendering shared guide with data:', sharedGuide);

  return (
    <MainLayout standalone>
      <div className="min-h-screen bg-white">
        {/* Header with Export Button */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{sharedGuide.name}</h1>
              <p className="text-gray-600">Brand Guide</p>
            </div>
            <Button onClick={handleExportPDF} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Brand Guide Content */}
        <div ref={contentRef} className="container mx-auto px-4 py-8 space-y-12">
          
          {/* Brand Header */}
          <div className="pdf-section text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg page-break-inside-avoid">
            {sharedGuide.logos?.original && (
              <div className="mb-8">
                <img 
                  src={sharedGuide.logos.original} 
                  alt={`${sharedGuide.name} Logo`}
                  className="h-24 mx-auto object-contain"
                  onError={(e) => {
                    console.error('Error loading logo:', sharedGuide.logos.original);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Logo loaded successfully:', sharedGuide.logos.original);
                  }}
                />
              </div>
            )}
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{sharedGuide.name}</h1>
            <p className="text-xl text-gray-600">Brand Guidelines</p>
          </div>

          {/* Color Palette */}
          {(sharedGuide.colors?.primary?.length > 0 || sharedGuide.colors?.secondary?.length > 0 || sharedGuide.colors?.neutral?.length > 0) && (
            <section className="pdf-section page-break-inside-avoid">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Color Palette</h2>
              
              {/* Primary Colors */}
              {sharedGuide.colors.primary?.length > 0 && (
                <div className="mb-8 page-break-inside-avoid">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Primary Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedGuide.colors.primary.map((color, index) => (
                      <div key={index} className="text-center page-break-inside-avoid">
                        <div 
                          className="w-full h-24 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="font-medium text-gray-900">
                          {getColorDisplayName(color, index, 'primary')}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">{color.hex}</p>
                        <p className="text-xs text-gray-500">{color.rgb}</p>
                        <p className="text-xs text-gray-500">{color.cmyk}</p>
                        
                        {/* Tints and Shades */}
                        {color.tints && color.tints.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Tints</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {color.tints.slice(0, 5).map((tint, tintIndex) => (
                                <div
                                  key={tintIndex}
                                  className="w-4 h-4 rounded border border-gray-200"
                                  style={{ backgroundColor: tint }}
                                  title={tint}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {color.shades && color.shades.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Shades</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {color.shades.slice(0, 5).map((shade, shadeIndex) => (
                                <div
                                  key={shadeIndex}
                                  className="w-4 h-4 rounded border border-gray-200"
                                  style={{ backgroundColor: shade }}
                                  title={shade}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary Colors */}
              {sharedGuide.colors.secondary?.length > 0 && (
                <div className="mb-8 page-break-inside-avoid">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Secondary Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedGuide.colors.secondary.map((color, index) => (
                      <div key={index} className="text-center page-break-inside-avoid">
                        <div 
                          className="w-full h-24 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="font-medium text-gray-900">
                          {getColorDisplayName(color, index, 'secondary')}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">{color.hex}</p>
                        <p className="text-xs text-gray-500">{color.rgb}</p>
                        <p className="text-xs text-gray-500">{color.cmyk}</p>
                        
                        {/* Tints and Shades */}
                        {color.tints && color.tints.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Tints</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {color.tints.slice(0, 5).map((tint, tintIndex) => (
                                <div
                                  key={tintIndex}
                                  className="w-4 h-4 rounded border border-gray-200"
                                  style={{ backgroundColor: tint }}
                                  title={tint}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {color.shades && color.shades.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Shades</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {color.shades.slice(0, 5).map((shade, shadeIndex) => (
                                <div
                                  key={shadeIndex}
                                  className="w-4 h-4 rounded border border-gray-200"
                                  style={{ backgroundColor: shade }}
                                  title={shade}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Neutral Colors */}
              {sharedGuide.colors.neutral?.length > 0 && (
                <div className="page-break-inside-avoid">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Neutral Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedGuide.colors.neutral.map((color, index) => (
                      <div key={index} className="text-center page-break-inside-avoid">
                        <div 
                          className="w-full h-24 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="font-medium text-gray-900">
                          {getColorDisplayName(color, index, 'neutral')}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">{color.hex}</p>
                        <p className="text-xs text-gray-500">{color.rgb}</p>
                        <p className="text-xs text-gray-500">{color.cmyk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Typography */}
          {Object.keys(sharedGuide.typography || {}).length > 0 && (
            <section className="pdf-section page-break-inside-avoid">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Typography</h2>
              
              {Object.entries(sharedGuide.typography).map(([category, fonts]) => (
                <div key={category} className="mb-8 page-break-inside-avoid">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">{category}</h3>
                  <div className="space-y-6">
                    {sharedGuide.typographyVisibility?.[category]?.map((size) => {
                      const sizeConfig = Object.values(fonts)[0]?.[size]; // Get first font's size config
                      if (!sizeConfig) return null;
                      
                      return (
                        <div key={size} className="border border-gray-200 rounded-lg p-6 page-break-inside-avoid">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900">
                              {getTypographyDisplayName(category, size)}
                            </h4>
                            <div className="text-right text-sm text-gray-600">
                              <p className="capitalize">{size}</p>
                              <p>{sizeConfig.fontSize}</p>
                              <p>Weight: {sizeConfig.fontWeight}</p>
                            </div>
                          </div>
                          <div 
                            className="text-gray-900"
                            style={{ 
                              fontFamily: sizeConfig.fontFamily,
                              fontSize: sizeConfig.fontSize,
                              fontWeight: sizeConfig.fontWeight,
                              lineHeight: sizeConfig.lineHeight,
                              letterSpacing: sizeConfig.letterSpacing
                            }}
                          >
                            {sharedGuide.previewText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Logo Section */}
          {sharedGuide.logos?.original && (
            <section className="pdf-section page-break-inside-avoid">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Logo</h2>
              
              {/* Primary Logo */}
              <div className="bg-gray-50 rounded-lg p-8 text-center mb-8">
                <img 
                  src={sharedGuide.logos.original} 
                  alt={`${sharedGuide.name} Logo`}
                  className="h-32 mx-auto object-contain mb-4"
                  onError={(e) => {
                    console.error('Error loading primary logo:', sharedGuide.logos.original);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <p className="text-gray-600">Primary Logo</p>
              </div>

              {/* Logo Variations */}
              {(sharedGuide.logos.square?.length > 0 || sharedGuide.logos.rounded?.length > 0 || sharedGuide.logos.circle?.length > 0) && (
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold text-gray-800">Logo Variations</h3>
                  
                  {/* Square Variations */}
                  {sharedGuide.logos.square?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-4">Square Format</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sharedGuide.logos.square.map((logo, index) => (
                          <div key={index} className="text-center">
                            <div 
                              className="w-full h-32 rounded border border-gray-200 flex items-center justify-center mb-2 p-4"
                              style={{ backgroundColor: logo.background }}
                            >
                              <img 
                                src={logo.src} 
                                alt={`Square Logo ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  console.error('Error loading square logo:', logo.src);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{logo.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rounded Variations */}
                  {sharedGuide.logos.rounded?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-4">Rounded Format</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sharedGuide.logos.rounded.map((logo, index) => (
                          <div key={index} className="text-center">
                            <div 
                              className="w-full h-32 rounded-lg border border-gray-200 flex items-center justify-center mb-2 p-4"
                              style={{ backgroundColor: logo.background }}
                            >
                              <img 
                                src={logo.src} 
                                alt={`Rounded Logo ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  console.error('Error loading rounded logo:', logo.src);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{logo.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Circle Variations */}
                  {sharedGuide.logos.circle?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-4">Circle Format</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sharedGuide.logos.circle.map((logo, index) => (
                          <div key={index} className="text-center">
                            <div 
                              className="w-full h-32 rounded-full border border-gray-200 flex items-center justify-center mb-2 p-4"
                              style={{ backgroundColor: logo.background }}
                            >
                              <img 
                                src={logo.src} 
                                alt={`Circle Logo ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  console.error('Error loading circle logo:', logo.src);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 capitalize">{logo.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default SharedPreview;
