
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
import BrandGuidePDF from '@/components/BrandGuidePDF';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { convertImageToBase64 } from '@/utils/imageUtils';

const SharedPreview = () => {
  const { linkId } = useParams();
  const { toast } = useToast();
  const [sharedGuide, setSharedGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [preparingPDF, setPreparingPDF] = useState(false);

  const loadSharedGuide = async () => {
    if (!linkId) return;

    setLoading(true);
    setError(null);

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
      const guideData = {
        guide: brandGuideData,
        colorNames: linkData.colorNames || {},
        typographyNames: linkData.typographyNames || {},
        typographyVisibility: linkData.typographyVisibility || {
          display: ['large', 'regular'],
          heading: ['h1', 'h2', 'h3'],
          body: ['large', 'medium', 'small']
        },
        previewText: linkData.previewText || 'The quick brown fox jumps over the lazy dog'
      };
      
      setSharedGuide(guideData);
      
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
    loadSharedGuide();
  }, [linkId]);

  // Prepare logo for PDF export
  const preparePDFData = async () => {
    if (!sharedGuide?.guide.logos.original) return '';
    
    setPreparingPDF(true);
    
    try {
      let base64Logo = '';
      if (sharedGuide.guide.logos.original.startsWith('data:')) {
        base64Logo = sharedGuide.guide.logos.original;
      } else {
        base64Logo = await convertImageToBase64(sharedGuide.guide.logos.original);
      }
      setLogoBase64(base64Logo);
      return base64Logo;
    } catch (error) {
      console.error('Error preparing PDF data:', error);
      toast({
        variant: "destructive",
        title: "Error preparing PDF",
        description: "There was a problem preparing the logo for PDF export.",
      });
      return '';
    } finally {
      setPreparingPDF(false);
    }
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

  if (!sharedGuide) {
    return (
      <MainLayout standalone={true}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">No brand guide data found.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout standalone={true}>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-gray-900">{sharedGuide.guide.name}</h1>
              <p className="text-2xl text-gray-600">Brand Guidelines</p>
            </div>
            
            <div className="flex gap-4">
              <PDFDownloadLink
                document={
                  <BrandGuidePDF
                    guide={sharedGuide.guide}
                    colorNames={sharedGuide.colorNames}
                    typographyNames={sharedGuide.typographyNames}
                    typographyVisibility={sharedGuide.typographyVisibility}
                    previewText={sharedGuide.previewText}
                    logoBase64={logoBase64}
                  />
                }
                fileName={`${sharedGuide.guide.name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guide.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button 
                    variant="outline" 
                    size="lg"
                    disabled={pdfLoading || preparingPDF}
                    onClick={!logoBase64 && sharedGuide.guide.logos.original ? preparePDFData : undefined}
                  >
                    <FileDown className="mr-2 h-5 w-5" />
                    {pdfLoading ? "Generating PDF..." : preparingPDF ? "Preparing..." : "Save as PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>

          <div>
            <BrandGuideRenderer
              guide={sharedGuide.guide}
              colorNames={sharedGuide.colorNames}
              typographyNames={sharedGuide.typographyNames}
              typographyVisibility={sharedGuide.typographyVisibility}
              previewText={sharedGuide.previewText}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SharedPreview;
