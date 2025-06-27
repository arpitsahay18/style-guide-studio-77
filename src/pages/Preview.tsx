import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
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

  // Enhanced font loading with explicit font face creation
  const loadFontsForPDF = async (guide: any): Promise<void> => {
    const fontFamilies = new Set<string>();
    
    // Collect all unique font families from typography
    Object.values(guide.typography.display || {}).forEach((style: any) => {
      if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
        const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        fontFamilies.add(fontName);
      }
    });
    
    Object.values(guide.typography.heading || {}).forEach((style: any) => {
      if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
        const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        fontFamilies.add(fontName);
      }
    });
    
    Object.values(guide.typography.body || {}).forEach((style: any) => {
      if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
        const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        fontFamilies.add(fontName);
      }
    });

    // Load fonts explicitly
    const fontPromises = Array.from(fontFamilies).map(async (fontFamily) => {
      return new Promise<void>((resolve) => {
        const formattedFontFamily = fontFamily.replace(/\s+/g, '+');
        
        // Check if font link already exists
        const existingLink = document.querySelector(`link[href*="${formattedFontFamily}"]`);
        if (existingLink) {
          resolve();
          return;
        }
        
        // Create and load font
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        
        link.onload = () => {
          // Wait for font to be actually available
          setTimeout(() => resolve(), 500);
        };
        
        link.onerror = () => {
          console.warn(`Failed to load font: ${fontFamily}`);
          resolve(); // Don't block PDF generation
        };
        
        document.head.appendChild(link);
        
        // Fallback timeout
        setTimeout(() => resolve(), 3000);
      });
    });
    
    await Promise.all(fontPromises);
    
    // Additional wait for font rendering
    if ('fonts' in document) {
      try {
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('Font loading check failed:', error);
      }
    }
  };

  // Enhanced image conversion with better error handling
  const convertImageToBase64 = async (url: string): Promise<string> => {
    try {
      // Handle both Firebase URLs and regular URLs
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return url; // Return original URL as fallback
    }
  };

  // Enhanced image loading with retry logic
  const waitForImagesToLoad = async (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img');
    const imagePromises = Array.from(images).map(async (img) => {
      // Convert Firebase URLs to base64
      if (img.src.startsWith('https://firebasestorage.googleapis.com')) {
        try {
          const base64 = await convertImageToBase64(img.src);
          img.src = base64;
        } catch (error) {
          console.error('Failed to convert image:', error);
        }
      }
      
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          const handleLoad = () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = () => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            console.warn('Image failed to load:', img.src);
            resolve();
          };
          
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          
          // Timeout fallback
          setTimeout(() => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve();
          }, 5000);
        }
      });
    });
    
    await Promise.all(imagePromises);
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

    const dismissProgress = showProgressToast("Preparing your brand guide PDF...", 20000);

    try {
      const guide = sharedGuide || currentGuide;
      
      // Step 1: Load all fonts
      await loadFontsForPDF(guide);
      
      // Step 2: Setup PDF
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
      
      // Step 3: Create cover page
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(42);
      pdf.setTextColor(0, 0, 0);
      pdf.text(guide.name, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
      
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

      // Step 4: Prepare content for PDF with enhanced styling
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .pdf-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          max-width: 180mm !important;
          overflow-x: hidden !important;
          background: white !important;
        }
        
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4 {
          font-weight: 700 !important;
          page-break-after: avoid !important;
        }
        
        .pdf-content p:not([style*="font-family"]), 
        .pdf-content span:not([style*="font-family"]) {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-weight: 400 !important;
        }
        
        .pdf-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 30px !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }
        
        .avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
        }
        
        .grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
          gap: 1rem !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .grid > * {
          min-width: 0 !important;
          max-width: 100% !important;
        }
        
        /* Logo specific styles */
        .logo-variations {
          page-break-inside: avoid !important;
        }
        
        .logo-display {
          page-break-inside: avoid !important;
          display: inline-block !important;
          width: 100% !important;
        }
        
        /* Ensure images are properly sized */
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Typography preview styles */
        [style*="font-family"] {
          font-family: inherit !important;
        }
      `;
      
      // Load fonts in the style element
      const guide_fonts = new Set<string>();
      Object.values(guide.typography.display || {}).forEach((style: any) => {
        if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
          const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          guide_fonts.add(fontName);
        }
      });
      Object.values(guide.typography.heading || {}).forEach((style: any) => {
        if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
          const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          guide_fonts.add(fontName);
        }
      });
      Object.values(guide.typography.body || {}).forEach((style: any) => {
        if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
          const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          guide_fonts.add(fontName);
        }
      });
      
      // Add font imports to CSS
      const fontImports = Array.from(guide_fonts).map(font => 
        `@import url('https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap');`
      ).join('\n');
      
      styleElement.textContent = fontImports + '\n' + styleElement.textContent;
      document.head.appendChild(styleElement);
      
      contentRef.current.classList.add('pdf-content');

      // Step 5: Wait for content to stabilize
      await waitForImagesToLoad(contentRef.current);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 6: Render with html2canvas
      const canvas = await html2canvas(contentRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        height: contentRef.current.scrollHeight,
        width: contentRef.current.scrollWidth,
        logging: false,
        windowWidth: 1200,
        windowHeight: contentRef.current.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedStyle = clonedDoc.createElement('style');
          clonedStyle.textContent = styleElement.textContent;
          clonedDoc.head.appendChild(clonedStyle);
          
          // Ensure all images are properly sized in cloned document
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img) => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.objectFit = 'cover';
          });
        }
      });

      // Step 7: Add content to PDF with improved pagination
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      // Calculate pages more accurately
      const effectivePageHeight = contentHeight - 5; // Small margin for safety
      const totalPages = Math.ceil(imgHeight / effectivePageHeight);
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        pdf.addPage();
        
        const sourceY = pageNum * effectivePageHeight * (canvas.width / contentWidth);
        const remainingHeight = canvas.height - sourceY;
        const sourceHeight = Math.min(effectivePageHeight * (canvas.width / contentWidth), remainingHeight);
        
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
            
            const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.98);
            const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
            
            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
          }
        }
      }

      // Step 8: Cleanup
      contentRef.current.classList.remove('pdf-content');
      document.head.removeChild(styleElement);
      dismissProgress();

      // Step 9: Save PDF
      pdf.save(`${guide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
      toast({
        title: "PDF Generated Successfully",
        description: "Your brand guide has been downloaded with all content included.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      dismissProgress();
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
