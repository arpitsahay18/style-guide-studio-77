import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/MainLayout';
import { BrandGuideRenderer } from '@/components/BrandGuideRenderer';
import { PDFExportRenderer } from '@/components/PDFExportRenderer';
import { ShareableLinkModal } from '@/components/ShareableLinkModal';
import { StagedProgressBar } from '@/components/ui/StagedProgressBar';
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
import { convertImageToBase64, preloadImages, createPrintStyles, extractFontsFromContainer, preloadGoogleFonts } from '@/utils/pdfExportUtils';

// Font mapping for PDF export - maps common fonts to jsPDF supported fonts
const getFontMapping = (fontFamily) => {
  const fontName = fontFamily.toLowerCase().replace(/['"]/g, '');
  
  // Common serif fonts
  if (fontName.includes('times') || fontName.includes('serif') || 
      fontName.includes('georgia') || fontName.includes('garamond') ||
      fontName.includes('baskerville') || fontName.includes('minion')) {
    return 'times';
  }
  
  // Common monospace fonts
  if (fontName.includes('courier') || fontName.includes('mono') || 
      fontName.includes('consolas') || fontName.includes('menlo') ||
      fontName.includes('monaco') || fontName.includes('roboto mono')) {
    return 'courier';
  }
  
  // Everything else defaults to helvetica (sans-serif)
  return 'helvetica';
};

// Simplified font loading utility
const loadCustomFonts = async (fonts) => {
  try {
    // Wait for any existing fonts to load
    await document.fonts.ready;
    
    // Load common Google Fonts
    const commonFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat'];
    for (const font of commonFonts) {
      if (!document.querySelector(`link[href*="fonts.googleapis.com"][href*="${font.replace(/ /g, '+')}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
    
    // Wait a bit for fonts to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    return fonts;
  } catch (error) {
    console.warn('Font loading failed:', error);
    return [];
  }
};

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
  const [sharedGuide, setSharedGuide] = useState(null);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [loading, setLoading] = useState(!!guideId);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const contentRef = useRef(null);
  const exportRef = useRef(null);

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
  if (!exportRef.current) {
    console.error('Export ref is not available');
    toast({
      variant: "destructive",
      title: "Export Error",
      description: "Export component is not ready. Please try again.",
    });
    return;
  }

  setIsExportingPDF(true);

  try {
    const guide = sharedGuide || currentGuide;
    console.log('Starting PDF export for guide:', guide.name);
    
    // Step 1: Enhanced font loading with better timing
    console.log('Loading fonts...');
    const extractedFonts = extractFontsFromContainer(exportRef.current);
    await preloadGoogleFonts(extractedFonts);
    
    // Step 2: Create comprehensive styles including the original utils
    console.log('Creating styles...');
    const styleElement = createPrintStyles(extractedFonts);
    document.head.appendChild(styleElement);
    
    // Step 3: Apply PDF classes and prepare container
    exportRef.current.classList.add('pdf-export-container');
    
    // Step 4: CRITICAL - Enhanced image handling with better error handling
    console.log('Processing images...');
    const images = exportRef.current.querySelectorAll('img');
    console.log(`Found ${images.length} images to process`);
    
    // Convert images to base64 with better error handling
    const imagePromises = Array.from(images).map(async (img, index) => {
      try {
        console.log(`Processing image ${index + 1}/${images.length}: ${img.src}`);
        
        // Skip if already base64
        if (img.src.startsWith('data:image/')) {
          console.log(`Image ${index + 1} already base64`);
          return Promise.resolve();
        }
        
        // Convert to base64
        const base64 = await convertImageToBase64(img.src, 5); // Increase retries
        if (base64 !== img.src) {
          img.src = base64;
          console.log(`Image ${index + 1} converted to base64`);
        }
        
        // Wait for image to load
        return new Promise((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve();
          } else {
            const handleLoad = () => {
              img.removeEventListener('load', handleLoad);
              img.removeEventListener('error', handleError);
              resolve();
            };
            
            const handleError = () => {
              console.warn(`Image ${index + 1} failed to load:`, img.src);
              img.removeEventListener('load', handleLoad);
              img.removeEventListener('error', handleError);
              resolve(); // Continue even if image fails
            };
            
            img.addEventListener('load', handleLoad);
            img.addEventListener('error', handleError);
            
            // Longer timeout for logo images
            setTimeout(() => {
              img.removeEventListener('load', handleLoad);
              img.removeEventListener('error', handleError);
              resolve();
            }, 15000); // Increased from 8000ms
          }
        });
      } catch (error) {
        console.error(`Error processing image ${index + 1}:`, error);
        return Promise.resolve(); // Continue even if conversion fails
      }
    });
    
    // Wait for ALL images to be processed
    await Promise.all(imagePromises);
    console.log('All images processed');
    
    // Step 5: Additional wait for layout stabilization
    console.log('Waiting for layout stabilization...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time
    
    // Step 6: Force layout recalculation
    exportRef.current.style.height = 'auto';
    exportRef.current.offsetHeight; // Force reflow
    
    // Step 7: Enhanced canvas creation with better settings
    console.log('Creating canvas...');
    const canvas = await html2canvas(exportRef.current, {
      scale: 2, // Increased scale for better quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      height: exportRef.current.scrollHeight,
      width: exportRef.current.scrollWidth,
      logging: true,
      windowWidth: 1400, // Increased window width
      windowHeight: exportRef.current.scrollHeight,
      imageTimeout: 20000, // Increased timeout
      removeContainer: false,
      onclone: (clonedDoc) => {
        console.log('Processing cloned document...');
        
        // Apply comprehensive styles to cloned document
        const clonedStyle = clonedDoc.createElement('style');
        clonedStyle.textContent = styleElement.textContent;
        clonedDoc.head.appendChild(clonedStyle);
        
        // Find and style the export container in cloned doc
        const clonedContainer = clonedDoc.querySelector('[class*="pdf-export-container"]') || clonedDoc.body;
        clonedContainer.classList.add('pdf-export-container');
        
        // Ensure all images are properly sized in cloned doc
        const clonedImages = clonedDoc.querySelectorAll('img');
        clonedImages.forEach((img, index) => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.objectFit = 'contain';
          img.style.display = 'block';
          
          // Force visibility
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          
          console.log(`Cloned image ${index + 1} styled:`, img.src.substring(0, 50) + '...');
        });
        
        // Apply logo-specific styles to cloned doc
        const logoGrids = clonedDoc.querySelectorAll('.logo-variations-grid');
        logoGrids.forEach(grid => {
          grid.style.display = 'grid';
          grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
          grid.style.gap = '0.75rem';
          grid.style.width = '100%';
          grid.style.pageBreakInside = 'avoid';
        });
        
        // Style logo items
        const logoItems = clonedDoc.querySelectorAll('.logo-display-item');
        logoItems.forEach(item => {
          item.style.pageBreakInside = 'avoid';
          item.style.breakInside = 'avoid';
          item.style.display = 'inline-block';
          item.style.width = '100%';
        });
      }
    });

    console.log('Canvas created successfully, size:', canvas.width, 'x', canvas.height);
    
    // Verify canvas has content
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas creation failed - empty canvas');
    }

    // Step 8: Create PDF with optimized settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 16
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const contentHeight = pageHeight - (margin * 2);
    
    // Step 9: Create cover page
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

    // Step 10: Add content pages with better image handling
    const imgData = canvas.toDataURL('image/png', 1.0); // Use PNG for better quality
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    
    const safePageHeight = contentHeight - 5; // Reduced margin for more content
    const totalPages = Math.ceil(imgHeight / safePageHeight);
    
    console.log(`Generating ${totalPages} content pages...`);
    
    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      pdf.addPage();
      
      const sourceY = pageNum * safePageHeight * (canvas.width / contentWidth);
      const remainingHeight = canvas.height - sourceY;
      const sourceHeight = Math.min(safePageHeight * (canvas.width / contentWidth), remainingHeight);
      
      if (sourceHeight > 5) { // Reduced minimum height
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          // Fill with white background
          tempCtx.fillStyle = 'white';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          
          // Draw the content
          tempCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );
          
          const pageImgData = tempCanvas.toDataURL('image/png', 1.0);
          const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
          
          pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, pageImgHeight);
          console.log(`Added page ${pageNum + 1}/${totalPages}`);
        }
      }
    }

    // Step 11: Cleanup
    document.head.removeChild(styleElement);
    exportRef.current.classList.remove('pdf-export-container');
    exportRef.current.style.height = ''; // Reset height

    // Step 12: Save PDF
    const fileName = `${guide.name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guide.pdf`;
    pdf.save(fileName);
    
    console.log('PDF export completed successfully');
    toast({
      title: "Brand Guide Exported",
      description: "Your brand guide has been exported as PDF successfully.",
    });

  } catch (err) {
    const error = err;
    console.error('Error generating PDF:', error);
    toast({
      variant: "destructive",
      title: "Export Failed",
      description: `There was a problem exporting your brand guide: ${error.message}`,
    });
  } finally {
    setIsExportingPDF(false);
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
              <Button 
                onClick={handleExportPDF} 
                variant="outline" 
                size="lg"
                disabled={isExportingPDF}
              >
                <FileDown className="mr-2 h-5 w-5" />
                {isExportingPDF ? "Generating..." : "Save as PDF"}
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

          {isExportingPDF && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <StagedProgressBar 
                  isActive={isExportingPDF}
                  onComplete={() => {}} // Progress completes automatically when PDF is done
                />
              </div>
            </div>
          )}

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
