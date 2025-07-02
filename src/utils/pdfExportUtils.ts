
// PDF Export Utilities
export const convertImageToBase64 = async (url: string, retries: number = 3): Promise<string> => {
  // If already base64, return as-is
  if (url.startsWith('data:image/')) {
    return url;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Converting image to base64 (attempt ${attempt + 1}):`, url);
      
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
          console.log('Successfully converted image to base64');
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) {
        console.error('All attempts failed, returning original URL:', url);
        return url; // Return original URL as final fallback
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return url;
};

export const preloadGoogleFonts = async (fonts: Set<string>): Promise<void> => {
  console.log('Starting Google Fonts preloading...');
  
  const fontPromises = Array.from(fonts).map(async (fontFamily) => {
    const fontName = fontFamily.replace(/'/g, '').split(',')[0].trim();
    
    // Skip if it's a system font
    if (['Inter', 'Arial', 'Helvetica', 'Times', 'serif', 'sans-serif', 'monospace'].includes(fontName)) {
      return;
    }
    
    console.log(`Preloading font: ${fontName}`);
    
    try {
      // Create a test element to force font loading
      const testElement = document.createElement('div');
      testElement.style.fontFamily = fontFamily;
      testElement.style.fontSize = '16px';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.textContent = 'Test';
      document.body.appendChild(testElement);
      
      // Use Font Loading API if available
      if ('fonts' in document) {
        await document.fonts.load(`16px "${fontName}"`);
        await document.fonts.load(`400 16px "${fontName}"`);
        await document.fonts.load(`700 16px "${fontName}"`);
      }
      
      // Wait a bit for the font to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      document.body.removeChild(testElement);
      console.log(`Font preloaded: ${fontName}`);
    } catch (error) {
      console.warn(`Failed to preload font ${fontName}:`, error);
    }
  });
  
  await Promise.all(fontPromises);
  console.log('All Google Fonts preloaded');
};

export const extractFontsFromContainer = (container: HTMLElement): Set<string> => {
  const fonts = new Set<string>();
  
  // Find all elements with inline font-family styles
  const elementsWithFonts = container.querySelectorAll('[style*="font-family"]');
  elementsWithFonts.forEach(element => {
    const style = (element as HTMLElement).style;
    if (style.fontFamily) {
      fonts.add(style.fontFamily);
    }
  });
  
  console.log('Extracted fonts for PDF:', Array.from(fonts));
  return fonts;
};

export const preloadImages = async (container: HTMLElement): Promise<void> => {
  console.log('Starting image preloading process...');
  const images = container.querySelectorAll('img');
  console.log(`Found ${images.length} images to preload`);
  
  const imagePromises = Array.from(images).map(async (img, index) => {
    console.log(`Processing image ${index + 1}/${images.length}:`, img.src);
    
    // Convert Firebase URLs to base64
    if (img.src.startsWith('https://firebasestorage.googleapis.com') || 
        img.src.startsWith('https://storage.googleapis.com')) {
      try {
        const base64 = await convertImageToBase64(img.src);
        img.src = base64;
        console.log(`Converted Firebase image ${index + 1} to base64`);
      } catch (error) {
        console.error(`Failed to convert image ${index + 1}:`, error);
      }
    }
    
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        console.log(`Image ${index + 1} already loaded`);
        resolve();
      } else {
        const handleLoad = () => {
          console.log(`Image ${index + 1} loaded successfully`);
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve();
        };
        
        const handleError = () => {
          console.warn(`Image ${index + 1} failed to load:`, img.src);
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve();
        };
        
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        
        // Timeout fallback
        setTimeout(() => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          console.log(`Image ${index + 1} timeout, continuing...`);
          resolve();
        }, 8000);
      }
    });
  });
  
  await Promise.all(imagePromises);
  console.log('All images preloaded');
  
  // Additional wait for layout stabilization
  await new Promise(resolve => setTimeout(resolve, 1500));
};

export const createPrintStyles = (fonts: Set<string> = new Set()): HTMLStyleElement => {
  const styleElement = document.createElement('style');
  
  // Generate Google Fonts import URL for all unique fonts with proper weights
  const fontImports = Array.from(fonts).map(font => {
    const fontName = font.replace(/'/g, '').split(',')[0].trim();
    
    // Skip system fonts
    if (['Inter', 'Arial', 'Helvetica', 'Times', 'serif', 'sans-serif', 'monospace'].includes(fontName)) {
      return '';
    }
    
    const encodedFont = encodeURIComponent(fontName);
    return `@import url('https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;600;700&display=block');`;
  }).filter(Boolean).join('\n');
  
  styleElement.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=block');
    ${fontImports}
    
    .pdf-export-container {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
      max-width: 190mm !important;
      overflow-x: hidden !important;
      background: white !important;
      padding: 0 !important;
      margin: 0 !important;
      color: black !important;
    }
    
    .pdf-export-container h1, 
    .pdf-export-container h2, 
    .pdf-export-container h3, 
    .pdf-export-container h4 {
      font-weight: 700 !important;
      color: black !important;
    }
    
    .pdf-export-container p, 
    .pdf-export-container span {
      font-family: inherit !important;
      font-weight: inherit !important;
      color: black !important;
    }
    
    .avoid-break {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      -webkit-column-break-inside: avoid !important;
      -moz-column-break-inside: avoid !important;
      column-break-inside: avoid !important;
    }
    
    .pdf-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 24px !important;
      max-width: 100% !important;
      overflow: hidden !important;
    }
    
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
