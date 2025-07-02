
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
import { PDFExportRenderer } from '@/components/PDFExportRenderer';
import { ShareableLinkModal } from '@/components/ShareableLinkModal';
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
import { showProgressToast } from '@/components/ui/progress-toast';
import { convertImageToBase64, preloadImages, createPrintStyles, extractFontsFromContainer, preloadGoogleFonts } from '@/utils/pdfExportUtils';

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

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
    if (!exportRef.current) return;

    const dismissProgress = showProgressToast("Preparing your brand guide PDF...", 30000);

    try {
      const guide = sharedGuide || currentGuide;
      console.log('Starting enhanced PDF export for guide:', guide.name);
      
      // Step 1: Extract fonts and create print styles
      const fonts = extractFontsFromContainer(exportRef.current);
      const styleElement = createPrintStyles(fonts);
      document.head.appendChild(styleElement);
      
      // Step 2: Preload Google Fonts
      console.log('Preloading Google Fonts for PDF...');
      await preloadGoogleFonts(fonts);
      
      // Step 3: Apply CSS classes for better page breaking
      const sections = exportRef.current.querySelectorAll('[class*="section"], .color-card, .logo-display, [class*="typography"]');
      sections.forEach((section) => {
        section.classList.add('avoid-break');
      });

      // Step 4: Convert all Firebase images to base64 and preload
      console.log('Converting Firebase images to base64...');
      await preloadImages(exportRef.current);
      console.log('All images converted and preloaded');
      
      // Step 5: Extended wait for layout stabilization and font loading
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 6: Create PDF with optimized settings
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
      
      // Step 7: Create enhanced cover page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(36);
      pdf.setTextColor(0, 0, 0);
      pdf.text(guide.name, pageWidth / 2, pageHeight / 2 - 15, { align: 'center' });
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(20);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });

      // Add brand attribution
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

      // Step 8: Render content with html2canvas
      console.log('Rendering content with html2canvas...');
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
          // Apply styles to cloned document
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.textContent = styleElement.textContent;
          clonedDoc.head.appendChild(clonedStyle);
          
          // Ensure images are properly sized
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img) => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'cover';
            img.style.display = 'block';
          });
          
          // Apply avoid-break classes
          const clonedSections = clonedDoc.querySelectorAll('.logo-display, .color-card, [class*="typography"], [class*="section"]');
          clonedSections.forEach((section) => {
            section.classList.add('avoid-break');
          });
        }
      });

      console.log('Canvas rendered, generating PDF pages...');

      // Step 9: Multi-page PDF generation with better pagination
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      const safePageHeight = contentHeight - 10; // Conservative margin
      const totalPages = Math.ceil(imgHeight / safePageHeight);
      
      console.log(`Generating ${totalPages} pages...`);
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        pdf.addPage();
        
        const sourceY = pageNum * safePageHeight * (canvas.width / contentWidth);
        const remainingHeight = canvas.height - sourceY;
        const sourceHeight = Math.min(safePageHeight * (canvas.width / contentWidth), remainingHeight);
        
        if (sourceHeight > 50) { // Only add if there's meaningful content
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
            console.log(`Added page ${pageNum + 1}/${totalPages}`);
          }
        }
      }

      // Step 10: Cleanup
      document.head.removeChild(styleElement);
      dismissProgress();

      // Step 11: Save PDF
      const fileName = `${guide.name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guide.pdf`;
      pdf.save(fileName);
      
      console.log('Enhanced PDF export completed successfully');
      toast({
        title: "Brand Guide Exported",
        description: "Your brand guide has been exported as PDF. Your download should begin soon.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      dismissProgress();
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was a problem exporting your brand guide. Please try again.",
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
        setShareableLink(link);
        setShowShareModal(true);
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

          {/* Hidden PDF export renderer */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <PDFExportRenderer
              ref={exportRef}
              guide={guide}
              colorNames={displayColorNames}
              typographyNames={displayTypographyNames}
              typographyVisibility={displayTypographyVisibility}
              previewText={displayPreviewText}
            />
          </div>
        </div>
      </div>

      <ShareableLinkModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        link={shareableLink}
      />
    </MainLayout>
  );
};

export default Preview;
