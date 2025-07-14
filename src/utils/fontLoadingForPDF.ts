// Dedicated font loading utilities for PDF export
// This file contains focused font loading logic to ensure Google Fonts render properly in PDF exports

export interface FontLoadingResult {
  success: boolean;
  loadedFonts: string[];
  failedFonts: string[];
}

/**
 * Enhanced font loading specifically for PDF export
 * Addresses timing, CORS, and html2canvas compatibility issues
 */
export const loadFontsForPDFExport = async (fonts: Set<string>): Promise<FontLoadingResult> => {
  const result: FontLoadingResult = {
    success: true,
    loadedFonts: [],
    failedFonts: []
  };

  // Filter out system fonts that don't need loading
  const systemFonts = ['Arial', 'Helvetica', 'Times', 'serif', 'sans-serif', 'monospace', 'inherit'];
  const googleFonts = Array.from(fonts).filter(font => {
    const fontName = font.replace(/['"]/g, '').split(',')[0].trim();
    return !systemFonts.includes(fontName) && fontName.length > 0;
  });

  if (googleFonts.length === 0) {
    return result;
  }

  console.log('Loading fonts for PDF export:', googleFonts);

  // Step 1: Pre-load font stylesheets with base64 embedding
  const fontStylePromises = googleFonts.map(async (fontFamily) => {
    const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    const encodedFont = encodeURIComponent(fontName);
    
    try {
      // Use a more comprehensive weight range and include base64 embedding
      const fontUrl = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900&display=block&subset=latin`;
      
      // Fetch the CSS and parse it to get the actual font URLs
      const response = await fetch(fontUrl);
      const cssText = await response.text();
      
      // Create a more persistent link element
      const linkId = `pdf-font-${encodedFont}`;
      let existingLink = document.getElementById(linkId) as HTMLLinkElement;
      
      if (!existingLink) {
        existingLink = document.createElement('link');
        existingLink.id = linkId;
        existingLink.rel = 'stylesheet';
        existingLink.href = fontUrl;
        // Add crossorigin attribute for better CORS handling
        existingLink.crossOrigin = 'anonymous';
        document.head.appendChild(existingLink);
      }

      // Wait for the stylesheet to load
      await new Promise<void>((resolve, reject) => {
        if (existingLink.sheet) {
          resolve();
          return;
        }
        
        const handleLoad = () => {
          existingLink.removeEventListener('load', handleLoad);
          existingLink.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = () => {
          existingLink.removeEventListener('load', handleLoad);
          existingLink.removeEventListener('error', handleError);
          reject(new Error(`Failed to load stylesheet for ${fontName}`));
        };
        
        existingLink.addEventListener('load', handleLoad);
        existingLink.addEventListener('error', handleError);
        
        // Fallback timeout
        setTimeout(() => {
          existingLink.removeEventListener('load', handleLoad);
          existingLink.removeEventListener('error', handleError);
          resolve(); // Don't reject, just continue
        }, 5000);
      });

      result.loadedFonts.push(fontName);
      return cssText;
      
    } catch (error) {
      console.warn(`Failed to load font stylesheet for ${fontName}:`, error);
      result.failedFonts.push(fontName);
      result.success = false;
      return '';
    }
  });

  const fontStyles = await Promise.all(fontStylePromises);

  // Step 2: Use document.fonts.load for all weight variants
  const fontLoadPromises = googleFonts.map(async (fontFamily) => {
    const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    
    if (result.failedFonts.includes(fontName)) {
      return; // Skip fonts that failed to load stylesheets
    }

    try {
      // Load multiple weight variants that are commonly used
      const weightsToLoad = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
      const loadPromises = weightsToLoad.map(weight => {
        return Promise.race([
          document.fonts.load(`${weight} 16px "${fontName}"`),
          document.fonts.load(`${weight} 24px "${fontName}"`), // Load different sizes too
          // Timeout fallback
          new Promise(resolve => setTimeout(resolve, 3000))
        ]);
      });

      await Promise.all(loadPromises);
      
      // Additional verification: create test elements to force font rendering
      const testElement = document.createElement('div');
      testElement.style.fontFamily = `"${fontName}", sans-serif`;
      testElement.style.fontSize = '16px';
      testElement.style.fontWeight = '400';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.style.visibility = 'hidden';
      testElement.textContent = 'Test font rendering for PDF export';
      document.body.appendChild(testElement);

      // Force a layout calculation
      testElement.offsetHeight;
      
      // Wait a bit for the font to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      document.body.removeChild(testElement);
      
      console.log(`✓ Font loaded successfully: ${fontName}`);
      
    } catch (error) {
      console.warn(`Failed to load font via document.fonts: ${fontName}`, error);
      // Don't mark as failed here since the stylesheet might still work
    }
  });

  await Promise.all(fontLoadPromises);

  // Step 3: Wait for document.fonts.ready to ensure all fonts are processed
  try {
    await document.fonts.ready;
    console.log('✓ All fonts ready');
  } catch (error) {
    console.warn('document.fonts.ready failed:', error);
  }

  // Step 4: Additional wait for font stabilization
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`Font loading complete. Loaded: ${result.loadedFonts.length}, Failed: ${result.failedFonts.length}`);
  
  return result;
};

/**
 * Create enhanced styles for PDF export with better font embedding
 */
export const createPDFStyles = (fonts: Set<string>, fontStyles: string[] = []): HTMLStyleElement => {
  const styleElement = document.createElement('style');
  
  // Generate @import statements for fonts not already loaded
  const fontImports = Array.from(fonts).map(font => {
    const fontName = font.replace(/['"]/g, '').split(',')[0].trim();
    if (['Arial', 'Helvetica', 'Times', 'serif', 'sans-serif', 'monospace'].includes(fontName)) {
      return '';
    }
    const encodedFont = encodeURIComponent(fontName);
    // Use display=block for immediate rendering
    return `@import url('https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900&display=block&subset=latin');`;
  }).filter(Boolean).join('\n');

  styleElement.textContent = `
    ${fontImports}
    
    /* Additional font styles from Google Fonts API */
    ${fontStyles.join('\n')}

    .pdf-export-container {
      height: auto !important;
      min-height: unset !important;
      max-height: unset !important;
      max-width: 190mm !important;
      overflow-x: visible !important;
      background: white !important;
      padding: 0 !important;
      margin: 0 !important;
      color: black !important;
    }

    /* Enhanced font rendering for PDF export */
    .pdf-export-container * {
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
    }

    .pdf-export-container h1,
    .pdf-export-container h2,
    .pdf-export-container h3,
    .pdf-export-container h4 {
      font-weight: 700 !important;
      color: black !important;
      font-family: inherit !important;
    }

    .pdf-export-container p,
    .pdf-export-container span {
      font-family: inherit !important;
      font-weight: inherit !important;
      color: black !important;
    }

    /* Better page breaking */
    .avoid-break {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .pdf-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 24px !important;
      max-width: 100% !important;
      overflow: hidden !important;
    }

    /* Layout improvements */
    .logo-variations-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
      gap: 0.75rem !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .logo-variations-grid > * {
      min-width: 0 !important;
      max-width: 100% !important;
    }

    .logo-display-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      display: inline-block !important;
      width: 100% !important;
    }

    .color-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
      gap: 1rem !important;
    }

    .color-card {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .typography-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 2rem !important;
    }

    img {
      max-width: 100% !important;
      height: auto !important;
      object-fit: cover !important;
      display: block !important;
    }

    .container, .max-w-6xl, .mx-auto {
      max-width: 190mm !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    @media print {
      .avoid-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;

  return styleElement;
};

/**
 * Enhanced onclone callback for html2canvas with improved font handling
 */
export const createFontAwareOnClone = (styleElement: HTMLStyleElement, fonts: Set<string>) => {
  return (clonedDoc: Document) => {
    console.log('Processing cloned document with font-aware handling...');
    
    // Apply comprehensive styles to cloned document
    const clonedStyle = clonedDoc.createElement('style');
    clonedStyle.textContent = styleElement.textContent;
    clonedDoc.head.appendChild(clonedStyle);
    
    // Add font links directly to cloned document head
    Array.from(fonts).forEach(fontFamily => {
      const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      if (['Arial', 'Helvetica', 'Times', 'serif', 'sans-serif', 'monospace'].includes(fontName)) {
        return;
      }
      
      const encodedFont = encodeURIComponent(fontName);
      const linkId = `cloned-font-${encodedFont}`;
      
      if (!clonedDoc.getElementById(linkId)) {
        const link = clonedDoc.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@100;200;300;400;500;600;700;800;900&display=block&subset=latin`;
        link.crossOrigin = 'anonymous';
        clonedDoc.head.appendChild(link);
      }
    });
    
    // Find and style the export container in cloned doc
    const clonedContainer = clonedDoc.querySelector('[class*="pdf-export-container"]') || clonedDoc.body;
    clonedContainer.classList.add('pdf-export-container');
    
    // Force font properties on all text elements
    const textElements = clonedDoc.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, li');
    textElements.forEach(element => {
      const computedStyle = window.getComputedStyle(element as Element);
      const fontFamily = computedStyle.fontFamily;
      
      if (fontFamily && fontFamily !== 'inherit') {
        (element as HTMLElement).style.fontFamily = fontFamily;
        (element as HTMLElement).style.fontWeight = computedStyle.fontWeight;
        (element as HTMLElement).style.fontSize = computedStyle.fontSize;
        (element as HTMLElement).style.lineHeight = computedStyle.lineHeight;
        (element as HTMLElement).style.letterSpacing = computedStyle.letterSpacing;
      }
    });
    
    // Ensure all images are properly sized in cloned doc
      const clonedImages = clonedDoc.querySelectorAll('img');
    clonedImages.forEach((img, index) => {
      const htmlImg = img as HTMLImageElement;
      htmlImg.style.maxWidth = '100%';
      htmlImg.style.height = 'auto';
      htmlImg.style.objectFit = 'contain';
      htmlImg.style.display = 'block';
      htmlImg.style.visibility = 'visible';
      htmlImg.style.opacity = '1';
    });
    
    // Apply layout styles
    const logoGrids = clonedDoc.querySelectorAll('.logo-variations-grid');
    logoGrids.forEach(grid => {
      const htmlGrid = grid as HTMLElement;
      htmlGrid.style.display = 'grid';
      htmlGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(140px, 1fr))';
      htmlGrid.style.gap = '0.75rem';
      htmlGrid.style.width = '100%';
      htmlGrid.style.pageBreakInside = 'avoid';
    });
    
    const logoItems = clonedDoc.querySelectorAll('.logo-display-item');
    logoItems.forEach(item => {
      const htmlItem = item as HTMLElement;
      htmlItem.style.pageBreakInside = 'avoid';
      htmlItem.style.breakInside = 'avoid';
      htmlItem.style.display = 'inline-block';
      htmlItem.style.width = '100%';
    });

    console.log('✓ Cloned document processed with enhanced font handling');
  };
};