
// PDF Export Utilities
export const convertImageToBase64 = async (url: string, retries: number = 3): Promise<string> => {
  // If already base64, return as-is
  if (url.startsWith('data:image/')) {
    console.log('Image is already base64, returning as-is');
    return url;
  }

  console.log(`Converting Firebase image to base64: ${url}`);

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Conversion attempt ${attempt + 1}/${retries}`);
      
      // Create a canvas to convert the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/png');
            
            console.log('Successfully converted Firebase image to base64');
            resolve(base64);
          } catch (error) {
            reject(error);
          }
        };
        
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${url}`));
        };
        
        // Add timeout
        setTimeout(() => {
          reject(new Error(`Image load timeout: ${url}`));
        }, 10000);
      });
      
      img.src = url;
      return await base64Promise;
      
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) {
        console.error('All conversion attempts failed, returning original URL');
        return url; // Fallback to original URL
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return url;
};

export const preloadImages = async (container: HTMLElement): Promise<void> => {
  console.log('Starting comprehensive image preloading...');
  const images = container.querySelectorAll('img');
  console.log(`Found ${images.length} images to process`);
  
  const imagePromises = Array.from(images).map(async (img, index) => {
    console.log(`Processing image ${index + 1}: ${img.src}`);
    
    // Convert Firebase Storage URLs to base64
    if (img.src.includes('firebasestorage.googleapis.com') || 
        img.src.includes('storage.googleapis.com')) {
      try {
        console.log(`Converting Firebase image ${index + 1} to base64...`);
        const base64 = await convertImageToBase64(img.src);
        img.src = base64;
        console.log(`✅ Firebase image ${index + 1} converted successfully`);
      } catch (error) {
        console.error(`❌ Failed to convert Firebase image ${index + 1}:`, error);
      }
    }
    
    // Ensure image is loaded
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        console.log(`Image ${index + 1} already loaded`);
        resolve();
      } else {
        const handleLoad = () => {
          console.log(`✅ Image ${index + 1} loaded`);
          cleanup();
          resolve();
        };
        
        const handleError = () => {
          console.warn(`❌ Image ${index + 1} failed to load`);
          cleanup();
          resolve();
        };
        
        const cleanup = () => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
        };
        
        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);
        
        // Timeout fallback
        setTimeout(() => {
          cleanup();
          console.log(`⏰ Image ${index + 1} timeout, continuing...`);
          resolve();
        }, 8000);
      }
    });
  });
  
  await Promise.all(imagePromises);
  console.log('✅ All images processed and preloaded');
  
  // Additional stabilization wait
  await new Promise(resolve => setTimeout(resolve, 2000));
};

export const createPrintStyles = (): HTMLStyleElement => {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    .pdf-export-container {
      font-family: 'Inter', sans-serif !important;
      max-width: 210mm !important;
      overflow-x: hidden !important;
      background: white !important;
      padding: 20mm !important;
      margin: 0 !important;
      color: black !important;
      line-height: 1.6 !important;
    }
    
    .pdf-export-container * {
      font-family: 'Inter', sans-serif !important;
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
      margin-bottom: 32px !important;
      padding: 16px !important;
      border: 1px solid #f0f0f0 !important;
      border-radius: 8px !important;
    }
    
    .logo-variations-grid {
      display: grid !important;
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 16px !important;
      margin: 16px 0 !important;
    }
    
    .logo-display-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      text-align: center !important;
      padding: 12px !important;
      background: #f8f9fa !important;
      border-radius: 8px !important;
    }
    
    .color-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
      gap: 16px !important;
      margin: 16px 0 !important;
    }
    
    .color-card {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      text-align: center !important;
    }
    
    .typography-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 24px !important;
      padding: 16px !important;
      background: #fafafa !important;
      border-radius: 8px !important;
    }
    
    img {
      max-width: 100% !important;
      height: auto !important;
      object-fit: contain !important;
      display: block !important;
      margin: 0 auto !important;
    }
    
    @media print {
      .avoid-break {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .pdf-section {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .logo-display-item {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .color-card {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      
      .typography-section {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;
  
  return styleElement;
};
