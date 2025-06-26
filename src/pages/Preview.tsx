
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
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

  // Helper function to convert Firebase Storage URL to base64
  const convertImageToBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

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
        title: "Preparing your PDF...",
        description: "Converting your brand guide to PDF format. This may take a moment.",
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

      // Convert Firebase Storage URLs to base64 before capturing
      const images = contentRef.current.querySelectorAll('img');
      const imagePromises = Array.from(images).map(async (img) => {
        if (img.src.startsWith('https://firebasestorage.googleapis.com')) {
          try {
            const base64 = await convertImageToBase64(img.src);
            img.src = base64;
          } catch (error) {
            console.error('Failed to convert image to base64:', error);
          }
        }
      });
      
      await Promise.all(imagePromises);

      // Capture the entire content with high resolution
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb', // Match bg-gray-50
        height: contentRef.current.scrollHeight,
        width: contentRef.current.scrollWidth
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
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
            
            const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.9);
            const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
            
            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
          }
        }
      } else {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      }

      pdf.save(`${guide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
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

          <div ref={contentRef}>
            <BrandGuideRenderer
              guide={guide}
              colorNames={displayColorNames}
              typographyNames={displayTypographyNames}
              typographyVisibility={displayTypographyVisibility}
              previewText={displayPreviewText}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Preview;
