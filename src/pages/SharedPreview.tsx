import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
import { PDFExportRenderer } from '@/components/PDFExportRenderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { showProgressToast } from '@/components/ui/progress-toast';
import { convertImageToBase64, preloadImages, createPrintStyles } from '@/utils/pdfExportUtils';

const SharedPreview = () => {
  const { linkId } = useParams();
  const { toast } = useToast();
  const [sharedGuide, setSharedGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = async () => {
    if (!exportRef.current || !sharedGuide) return;

    const dismissProgress = showProgressToast("Preparing your brand guide PDF...", 30000);

    try {
      console.log('Starting shared preview PDF export');
      
      // Step 1: Create and apply print styles
      const styleElement = createPrintStyles();
      document.head.appendChild(styleElement);
      
      // Step 2: Apply CSS classes for better page breaking
      const sections = exportRef.current.querySelectorAll('[class*="section"], .color-card, .logo-display, [class*="typography"]');
      sections.forEach((section) => {
        section.classList.add('avoid-break');
      });

      // Step 3: Convert all Firebase images to base64 and preload
      console.log('Converting shared preview images...');
      await preloadImages(exportRef.current);
      console.log('Shared images converted and preloaded');
      
      // Step 4: Extended wait for layout stabilization
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 5: Create PDF with optimized settings (same as Preview.tsx)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Step 6: Create enhanced cover page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(36);
      pdf.setTextColor(0, 0, 0);
      pdf.text(sharedGuide.guide.name, pageWidth / 2, pageHeight / 2 - 15, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(20);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });

      const pillWidth = 50;
      const pillHeight = 10;
      const pillX = (pageWidth - pillWidth) / 2;
      const pillY = pageHeight / 2 + 25;
      
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(pillX, pillY, pillWidth, pillHeight, 5, 5, 'F');
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Made with Brand Studio', pageWidth / 2, pillY + 6.5, { align: 'center' });

      // Step 7: Render with html2canvas (same settings as Preview.tsx)
      console.log('Rendering shared preview with html2canvas...');
      const canvas = await html2canvas(exportRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        height: exportRef.current.scrollHeight,
        width: exportRef.current.scrollWidth,
        logging: false,
        windowWidth: 1200,
        windowHeight: exportRef.current.scrollHeight,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.textContent = styleElement.textContent;
          clonedDoc.head.appendChild(clonedStyle);
          
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img) => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
          });
          
          const clonedSections = clonedDoc.querySelectorAll('.logo-display, .color-card, [class*="typography"], [class*="section"]');
          clonedSections.forEach((section) => {
            section.classList.add('avoid-break');
          });
        }
      });

      // Step 8: Multi-page PDF generation (same logic as Preview.tsx)
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      const safePageHeight = contentHeight - 10;
      const totalPages = Math.ceil(imgHeight / safePageHeight);
      
      console.log(`Generating ${totalPages} pages for shared preview...`);
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        pdf.addPage();
        
        const sourceY = pageNum * safePageHeight * (canvas.width / contentWidth);
        const remainingHeight = canvas.height - sourceY;
        const sourceHeight = Math.min(safePageHeight * (canvas.width / contentWidth), remainingHeight);
        
        if (sourceHeight > 50) {
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
            console.log(`Added shared preview page ${pageNum + 1}/${totalPages}`);
          }
        }
      }

      // Step 9: Cleanup
      document.head.removeChild(styleElement);
      dismissProgress();

      const fileName = `${sharedGuide.guide.name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guide.pdf`;
      pdf.save(fileName);
      
      console.log('Shared preview PDF export completed successfully');
      toast({
        title: "Brand Guide Exported",
        description: "Your brand guide has been exported as PDF. Your download should begin soon.",
      });

    } catch (error) {
      console.error('Error generating shared preview PDF:', error);
      dismissProgress();
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was a problem exporting the brand guide. Please try again.",
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

          {/* Hidden PDF export renderer */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <PDFExportRenderer
              ref={exportRef}
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
