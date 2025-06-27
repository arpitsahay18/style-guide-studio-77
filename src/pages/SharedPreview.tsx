import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRef } from 'react';
import { showProgressToast } from '@/components/ui/progress-toast';

const SharedPreview = () => {
  const { linkId } = useParams();
  const { toast } = useToast();
  const [sharedGuide, setSharedGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Helper function to convert Firebase Storage URL to base64
  const convertImageToBase64 = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return url; // fallback to original URL
    }
  };

  // Helper function to wait for all fonts to load
  const waitForFontsToLoad = (): Promise<void> => {
    return new Promise((resolve) => {
      if ('fonts' in document) {
        document.fonts.ready.then(() => {
          setTimeout(resolve, 1500);
        });
      } else {
        setTimeout(resolve, 2500);
      }
    });
  };

  // Helper function to wait for all images to load
  const waitForImagesToLoad = (container: HTMLElement): Promise<void> => {
    return new Promise((resolve) => {
      const images = container.querySelectorAll('img');
      const imagePromises = Array.from(images).map((img) => {
        return new Promise((imgResolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            imgResolve(true);
          } else {
            img.onload = () => imgResolve(true);
            img.onerror = () => imgResolve(true);
            setTimeout(() => imgResolve(true), 5000);
          }
        });
      });
      
      Promise.all(imagePromises).then(() => {
        setTimeout(resolve, 1000);
      });
    });
  };

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
      setSharedGuide({
        guide: brandGuideData,
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
        description: "There was a problem loading the shared brand guide.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedGuide();
  }, [linkId]);

  const handleExportPDF = async () => {
    if (!contentRef.current || !sharedGuide) return;

    const dismissProgress = showProgressToast("Preparing your brand guide PDF...", 15000);

    try {
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
      
      // Cover Page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(42);
      pdf.setTextColor(0, 0, 0);
      pdf.text(sharedGuide.guide.name, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(24);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 8, { align: 'center' });

      const pillWidth = 60;
      const pillHeight = 12;
      const pillX = (pageWidth - pillWidth) / 2;
      const pillY = pageHeight / 2 + 30;
      
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(pillX, pillY, pillWidth, pillHeight, 6, 6, 'F');
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Made with Brand Studio', pageWidth / 2, pillY + 8, { align: 'center' });
      pdf.link(pillX, pillY, pillWidth, pillHeight, { url: 'https://www.google.com' });

      // Enhanced content preparation for PDF
      await waitForFontsToLoad();
      await waitForImagesToLoad(contentRef.current);

      // Convert Firebase Storage URLs to base64
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

      // Enhanced PDF styling with better layout constraints and page breaks
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .pdf-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          max-width: 180mm !important;
          overflow-x: hidden !important;
        }
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4 {
          font-weight: 700 !important;
        }
        .pdf-content p:not([style*="font-family"]), .pdf-content span:not([style*="font-family"]) {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-weight: 400 !important;
        }
        .pdf-section {
          page-break-inside: avoid;
          break-inside: avoid;
          margin-bottom: 30px;
          max-width: 100% !important;
          overflow: hidden !important;
        }
        .avoid-break {
          page-break-inside: avoid;
          break-inside: avoid;
          -webkit-column-break-inside: avoid;
        }
        .pdf-section:last-child {
          margin-bottom: 0;
        }
        .grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
          gap: 1rem !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        .grid > * {
          min-width: 0 !important;
          max-width: 100% !important;
        }
        .break-all {
          word-break: break-all !important;
          overflow-wrap: break-word !important;
        }
        .truncate {
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .flex-wrap {
          flex-wrap: wrap !important;
        }
        .min-w-[32px] {
          min-width: 32px !important;
        }
      `;
      document.head.appendChild(styleElement);
      
      contentRef.current.classList.add('pdf-content');

      // Extended wait for complete layout stabilization
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Enhanced html2canvas settings for better PDF quality
      const canvas = await html2canvas(contentRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f9fafb',
        height: contentRef.current.scrollHeight,
        width: contentRef.current.scrollWidth,
        logging: false,
        windowWidth: 1200,
        windowHeight: contentRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.textContent = styleElement.textContent;
          clonedDoc.head.appendChild(clonedStyle);
          
          // Ensure all images are loaded in cloned document
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img) => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Improved multi-page handling with better overlap calculation and content preservation
      const totalPages = Math.ceil(imgHeight / contentHeight);
      const pageOverlap = 8; // Slightly increased overlap for better content continuity
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        pdf.addPage();
        
        // Calculate source position with improved logic to prevent content cutoff
        const effectiveContentHeight = contentHeight - (pageNum > 0 ? pageOverlap : 0);
        const sourceY = Math.max(0, (pageNum * (contentHeight - pageOverlap) * canvas.width) / contentWidth);
        const maxSourceY = Math.max(0, canvas.height - ((contentHeight * canvas.width) / contentWidth));
        const adjustedSourceY = Math.min(sourceY, maxSourceY);
        
        const sourceHeight = Math.min(
          (contentHeight * canvas.width) / contentWidth,
          canvas.height - adjustedSourceY
        );
        
        if (sourceHeight > 100) { // Only render if there's meaningful content
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = sourceHeight;
          const tempCtx = tempCanvas.getContext('2d');
          
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0, adjustedSourceY, canvas.width, sourceHeight,
              0, 0, canvas.width, sourceHeight
            );
            
            const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
            const yOffset = pageNum > 0 ? margin - (pageOverlap / 2) : margin;
            
            pdf.addImage(pageImgData, 'JPEG', margin, yOffset, imgWidth, pageImgHeight);
          }
        }
      }

      // Clean up
      contentRef.current.classList.remove('pdf-content');
      document.head.removeChild(styleElement);
      dismissProgress();

      pdf.save(`${sharedGuide.guide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "The brand guide has been downloaded.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      dismissProgress();
      toast({
        variant: "destructive",
        title: "Error Generating PDF",
        description: "There was a problem generating the PDF. Please try again.",
      });
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
              <Button onClick={handleExportPDF} variant="outline" size="lg">
                <FileDown className="mr-2 h-5 w-5" />
                Save as PDF
              </Button>
            </div>
          </div>

          <div ref={contentRef}>
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
