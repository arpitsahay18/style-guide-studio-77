
export async function convertImageToBase64(url: string, retries: number = 3): Promise<string> {
  // If it's already base64, return it
  if (url.startsWith('data:')) {
    return url;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      console.log(`Converting image to base64 (attempt ${attempt + 1}):`, url);
      
      // Try different approaches for Firebase Storage URLs
      let response;
      
      try {
        // First try with no-cors mode for Firebase Storage
        response = await fetch(url, {
          mode: 'no-cors',
          credentials: 'omit',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
      } catch (corsError) {
        console.log('CORS fetch failed, trying alternative method');
        // Fallback: create image element and convert to canvas
        return await convertImageViaCanvas(url);
      }
      
      if (!response.ok && response.type !== 'opaque') {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // For opaque responses (no-cors), we need to use canvas method
      if (response.type === 'opaque') {
        return await convertImageViaCanvas(url);
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
      console.warn(`Image conversion attempt ${attempt + 1} failed:`, error);
      if (attempt === retries - 1) {
        // Final fallback: try canvas method
        try {
          return await convertImageViaCanvas(url);
        } catch (canvasError) {
          console.error('All image conversion attempts failed, including canvas fallback');
          throw error;
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Failed to convert image after all retries');
}

async function convertImageViaCanvas(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
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
        console.log('Successfully converted image via canvas');
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for canvas conversion'));
    };
    
    // Add timestamp to bypass cache
    const urlWithCache = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
    img.src = urlWithCache;
  });
}
