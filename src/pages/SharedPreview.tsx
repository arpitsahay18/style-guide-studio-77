
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
      console.log('Found shareable link data:', linkData);

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

      console.log('Setting shared guide data:', brandGuideData);
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

      // Capture the main content
      const canvas = await html2canvas(contentRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);

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
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            {sharedGuide.logos?.original && (
              <div className="mb-8">
                <img 
                  src={sharedGuide.logos.original} 
                  alt={`${sharedGuide.name} Logo`}
                  className="h-24 mx-auto object-contain"
                />
              </div>
            )}
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{sharedGuide.name}</h1>
            <p className="text-xl text-gray-600">Brand Guidelines</p>
          </div>

          {/* Color Palette */}
          {(sharedGuide.colors?.primary?.length > 0 || sharedGuide.colors?.secondary?.length > 0) && (
            <section className="pdf-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Color Palette</h2>
              
              {sharedGuide.colors.primary?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Primary Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedGuide.colors.primary.map((color, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-full h-24 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="font-medium text-gray-900">
                          {sharedGuide.colorNames?.[color.hex] || `Primary ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">{color.hex}</p>
                        {color.rgb && (
                          <p className="text-xs text-gray-500">RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sharedGuide.colors.secondary?.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Secondary Colors</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sharedGuide.colors.secondary.map((color, index) => (
                      <div key={index} className="text-center">
                        <div 
                          className="w-full h-24 rounded-lg border border-gray-200 mb-2"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <p className="font-medium text-gray-900">
                          {sharedGuide.colorNames?.[color.hex] || `Secondary ${index + 1}`}
                        </p>
                        <p className="text-sm text-gray-600 font-mono">{color.hex}</p>
                        {color.rgb && (
                          <p className="text-xs text-gray-500">RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Typography */}
          {Object.keys(sharedGuide.typography || {}).length > 0 && (
            <section className="pdf-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Typography</h2>
              
              {Object.entries(sharedGuide.typography).map(([category, fonts]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 capitalize">{category}</h3>
                  <div className="space-y-6">
                    {Object.entries(fonts).map(([fontName, fontData]) => (
                      <div key={fontName} className="border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                          {sharedGuide.typographyNames?.[fontName] || fontName}
                        </h4>
                        <div className="space-y-4">
                          {sharedGuide.typographyVisibility?.[category]?.map((size) => {
                            const sizeConfig = fontData[size];
                            if (!sizeConfig) return null;
                            
                            return (
                              <div key={size} className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p 
                                    style={{ 
                                      fontFamily: fontData.family,
                                      fontSize: sizeConfig.fontSize,
                                      fontWeight: sizeConfig.fontWeight,
                                      lineHeight: sizeConfig.lineHeight
                                    }}
                                  >
                                    {sharedGuide.previewText}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-gray-600 ml-4">
                                  <p className="capitalize">{size}</p>
                                  <p>{sizeConfig.fontSize}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Logo Section */}
          {sharedGuide.logos?.original && (
            <section className="pdf-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Logo</h2>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <img 
                  src={sharedGuide.logos.original} 
                  alt={`${sharedGuide.name} Logo`}
                  className="h-32 mx-auto object-contain mb-4"
                />
                <p className="text-gray-600">Primary Logo</p>
              </div>
            </section>
          )}

        </div>
      </div>
    </MainLayout>
  );
};

export default SharedPreview;
