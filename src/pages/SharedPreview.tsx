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

  // Enhanced font loading specifically for shared guides
  const loadFontsForSharedGuide = async (guide: any): Promise<void> => {
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

    // Load fonts with explicit DOM injection
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
          console.log(`Loaded font for shared guide: ${fontFamily}`);
          setTimeout(() => resolve(), 500);
        };
        
        link.onerror = () => {
          console.warn(`Failed to load font for shared guide: ${fontFamily}`);
          resolve();
        };
        
        document.head.appendChild(link);
        
        // Fallback timeout
        setTimeout(() => resolve(), 3000);
      });
    });
    
    await Promise.all(fontPromises);
    
    // Wait for fonts to be ready
    if ('fonts' in document) {
      try {
        await document.fonts.ready;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn('Font loading check failed:', error);
      }
    }
  };

  // Use the same enhanced image conversion function as Preview.tsx
  const convertImageToBase64 = async (url: string, retries: number = 3): Promise<string> => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`Converting shared image to base64 (attempt ${attempt + 1}):`, url);
        
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            console.log('Successfully converted shared image to base64');
            resolve(reader.result as string);
          };
          reader.onerror = () => reject(new Error('Failed to convert shared image to base64'));
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn(`Shared image conversion attempt ${attempt + 1} failed:`, error);
        if (attempt === retries - 1) {
          console.error('All shared image conversion attempts failed, returning original URL:', url);
          return url;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return url;
  };

  // Enhanced image loading for shared preview
  const waitForImagesToLoad = async (container: HTMLElement): Promise<void> => {
    console.log('Starting shared preview image loading...');
    const images = container.querySelectorAll('img');
    console.log(`Found ${images.length} images in shared preview`);
    
    const imagePromises = Array.from(images).map(async (img, index) => {
      console.log(`Processing shared image ${index + 1}/${images.length}:`, img.src);
      
      if (img.src.startsWith('https://firebasestorage.googleapis.com') || 
          img.src.startsWith('https://storage.googleapis.com')) {
        try {
          const base64 = await convertImageToBase64(img.src);
          img.src = base64;
          console.log(`Converted shared Firebase image ${index + 1} to base64`);
        } catch (error) {
          console.error(`Failed to convert shared image ${index + 1}:`, error);
        }
      }
      
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          console.log(`Shared image ${index + 1} already loaded`);
          resolve();
        } else {
          const handleLoad = () => {
            console.log(`Shared image ${index + 1} loaded successfully`);
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve();
          };
          
          const handleError = () => {
            console.warn(`Shared image ${index + 1} failed to load:`, img.src);
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            resolve();
          };
          
          img.addEventListener('load', handleLoad);
          img.addEventListener('error', handleError);
          
          setTimeout(() => {
            img.removeEventListener('load', handleLoad);
            img.removeEventListener('error', handleError);
            console.log(`Shared image ${index + 1} timeout, continuing...`);
            resolve();
          }, 8000);
        }
      });
    });
    
    await Promise.all(imagePromises);
    console.log('All shared preview images processed');
    await new Promise(resolve => setTimeout(resolve, 2000));
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
      
      // Load fonts after setting the guide data
      await loadFontsForSharedGuide(brandGuideData);
      
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

    const dismissProgress = showProgressToast("Preparing your brand guide PDF...", 25000);

    try {
      console.log('Starting shared preview PDF export');
      
      // Ensure fonts are loaded
      await loadFontsForSharedGuide(sharedGuide.guide);
      console.log('Fonts loaded for shared PDF');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 12;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Create cover page (same as Preview.tsx)
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

      // Use the same enhanced styling as Preview.tsx
      const styleElement = document.createElement('style');
      
      const guide_fonts = new Set<string>();
      Object.values(sharedGuide.guide.typography.display || {}).forEach((style: any) => {
        if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
          const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          guide_fonts.add(fontName);
        }
      });
      Object.values(sharedGuide.guide.typography.heading || {}).forEach((style: any) => {
        if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
          const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          guide_fonts.add(fontName);
        }
      });
      Object.values(sharedGuide.guide.typography.body || {}).forEach((style: any) => {
        if (style.fontFamily && style.fontFamily !== 'Inter, sans-serif') {
          const fontName = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          guide_fonts.add(fontName);
        }
      });
      
      const fontImports = Array.from(guide_fonts).map(font => 
        `@import url('https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap');`
      ).join('\n');
      
      styleElement.textContent = `
        ${fontImports}
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .pdf-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          max-width: 186mm !important;
          overflow-x: hidden !important;
          background: white !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4 {
          font-weight: 700 !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        
        .pdf-content p:not([style*="font-family"]), 
        .pdf-content span:not([style*="font-family"]) {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          font-weight: 400 !important;
        }
        
        .pdf-section {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 24px !important;
          max-width: 100% !important;
          overflow: hidden !important;
        }
        
        .avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          -webkit-column-break-inside: avoid !important;
          -moz-column-break-inside: avoid !important;
          column-break-inside: avoid !important;
        }
        
        .grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
          gap: 0.75rem !important;
          width: 100% !important;
          max-width: 100% !important;
        }
        
        .grid > * {
          min-width: 0 !important;
          max-width: 100% !important;
        }
        
        .logo-variations {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        
        .logo-display {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          display: inline-block !important;
          width: 100% !important;
        }
        
        img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: cover !important;
          display: block !important;
        }
        
        [style*="font-family"] {
          font-family: inherit !important;
        }
        
        .container, .max-w-6xl, .mx-auto {
          max-width: 186mm !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
        
        .color-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
          gap: 1rem !important;
        }
      `;
      
      document.head.appendChild(styleElement);
      contentRef.current.classList.add('pdf-content');

      // Enhanced image loading and conversion
      console.log('Converting shared preview images...');
      await waitForImagesToLoad(contentRef.current);
      console.log('Shared images converted, waiting for layout...');
      
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Render with html2canvas (same settings as Preview.tsx)
      console.log('Rendering shared preview with html2canvas...');
      const canvas = await html2canvas(contentRef.current, {
        scale: 2.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        height: contentRef.current.scrollHeight,
        width: contentRef.current.scrollWidth,
        logging: false,
        windowWidth: 1200,
        windowHeight: contentRef.current.scrollHeight,
        imageTimeout: 10000,
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
          
          const logoSections = clonedDoc.querySelectorAll('.logo-display, .color-card, [class*="typography"]');
          logoSections.forEach((section) => {
            section.classList.add('avoid-break');
          });
        }
      });

      // Multi-page PDF generation (same logic as Preview.tsx)
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;
      
      const effectivePageHeight = contentHeight - 8;
      const totalPages = Math.ceil(imgHeight / effectivePageHeight);
      
      console.log(`Generating ${totalPages} pages for shared preview...`);
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        pdf.addPage();
        
        const sourceY = pageNum * effectivePageHeight * (canvas.width / contentWidth);
        const remainingHeight = canvas.height - sourceY;
        const sourceHeight = Math.min(effectivePageHeight * (canvas.width / contentWidth), remainingHeight);
        
        if (sourceHeight > 100) {
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
            
            const pageImgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            const pageImgHeight = (sourceHeight * contentWidth) / canvas.width;
            
            pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
            console.log(`Added shared preview page ${pageNum + 1}/${totalPages}`);
          }
        }
      }

      // Cleanup
      contentRef.current.classList.remove('pdf-content');
      document.head.removeChild(styleElement);
      dismissProgress();

      const fileName = `${sharedGuide.guide.name.replace(/[^a-zA-Z0-9]/g, '_')}_brand_guide.pdf`;
      pdf.save(fileName);
      
      console.log('Shared preview PDF export completed successfully');
      toast({
        title: "PDF Generated Successfully",
        description: "The brand guide has been downloaded with all content included.",
      });

    } catch (error) {
      console.error('Error generating shared preview PDF:', error);
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
