// PDF Export Utilities

// Convert image URLs to base64 with robust error handling and timeout
export const convertImageToBase64 = async (url: string, retries: number = 5): Promise<string> => {
  if (url.startsWith('data:image/')) {
    return url;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'image/*',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();

      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      if (attempt === retries - 1) {
        console.error(`Final attempt failed for image: ${url}`);
        return url;
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return url;
};

// Preload all images inside a container and convert to base64 if needed
export const preloadImages = async (container: HTMLElement): Promise<void> => {
  const images = container.querySelectorAll('img');

  const imagePromises = Array.from(images).map(async (img) => {
    if (
      img.src.startsWith('https://firebasestorage.googleapis.com') ||
      img.src.startsWith('https://storage.googleapis.com')
    ) {
      try {
        const base64 = await convertImageToBase64(img.src);
        img.src = base64;
      } catch (error) {
        console.error('Failed to convert image:', img.src, error);
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
          resolve();
        };

        img.addEventListener('load', handleLoad);
        img.addEventListener('error', handleError);

        setTimeout(() => {
          img.removeEventListener('load', handleLoad);
          img.removeEventListener('error', handleError);
          resolve();
        }, 15000);
      }
    });
  });

  await Promise.all(imagePromises);
  await new Promise(resolve => setTimeout(resolve, 2000));
};

// Preload Google Fonts dynamically
export const preloadGoogleFonts = async (fonts: Set<string>): Promise<void> => {
  const fontPromises = Array.from(fonts).map(async (fontFamily) => {
    const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
    const encodedFont = encodeURIComponent(fontName);
    const linkId = `google-font-${encodedFont}`;

    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }

    try {
      const testElement = document.createElement('div');
      testElement.style.fontFamily = fontFamily;
      testElement.style.fontSize = '16px';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.textContent = 'Test';
      document.body.appendChild(testElement);

      if ('fonts' in document) {
        await document.fonts.load(`16px "${fontName}"`);
        await document.fonts.load(`400 16px "${fontName}"`);
        await document.fonts.load(`700 16px "${fontName}"`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      document.body.removeChild(testElement);
    } catch {
      // Silent fail fallback
    }
  });

  await Promise.all(fontPromises);
};

// Extract font families from a container
export const extractFontsFromContainer = (container: HTMLElement): Set<string> => {
  const fonts = new Set<string>();
  const elementsWithFonts = container.querySelectorAll('[style*="font-family"]');
  elementsWithFonts.forEach(element => {
    const style = (element as HTMLElement).style;
    if (style.fontFamily) {
      fonts.add(style.fontFamily);
    }
  });
  return fonts;
};

// Inject styles into DOM for PDF rendering
export const createPrintStyles = (fonts: Set<string> = new Set()): HTMLStyleElement => {
  const styleElement = document.createElement('style');

  const fontImports = Array.from(fonts).map(font => {
    const fontName = font.replace(/['"]/g, '').split(',')[0].trim();
    if (['Arial', 'Helvetica', 'Times', 'serif', 'sans-serif', 'monospace'].includes(fontName)) {
      return '';
    }
    const encodedFont = encodeURIComponent(fontName);
    return `@import url('https://fonts.googleapis.com/css2?family=${encodedFont}:wght@300;400;500;600;700&display=block');`;
  }).filter(Boolean).join('\n');

  styleElement.textContent = `
    ${fontImports}

    .pdf-export-container {
      height: auto !important;
      max-width: 190mm !important;
      overflow-x: visible !important;
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
    }

    .pdf-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 24px !important;
      width: 100% !important;
    }

    .logo-variations-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
      gap: 0.75rem !important;
      width: 100% !important;
    }

    .logo-variations-grid > * {
      min-width: 0 !important;
    }

    .logo-display-item {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      width: 100% !important;
    }

    .color-grid {
      display: grid !important;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)) !important;
      gap: 1rem !important;
    }

    .typography-section {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      margin-bottom: 2rem !important;
    }

    img {
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
      object-fit: contain !important;
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
