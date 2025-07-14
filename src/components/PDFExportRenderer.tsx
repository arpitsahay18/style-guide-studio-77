import React, { forwardRef, useEffect } from 'react';
import { BrandGuideRenderer } from './BrandGuideRenderer';

interface PDFExportRendererProps {
  guide: any;
  colorNames: any;
  typographyNames: any;
  typographyVisibility: any;
  previewText: string;
}

export const PDFExportRenderer = forwardRef<HTMLDivElement, PDFExportRendererProps>(
  ({ guide, colorNames, typographyNames, typographyVisibility, previewText }, ref) => {
    
    useEffect(() => {
      // Ensure logo sections are visible and don't collapse due to async issues
      const ensureLogoSectionVisible = () => {
        const logoBlocks = document.querySelectorAll('.logo-variations-grid, .logo-display-item');
        logoBlocks.forEach((el) => {
          const block = el as HTMLElement;
          block.style.visibility = 'visible';
          block.style.display = 'block';
          block.style.height = 'auto';
        });
      };

      // Delay to allow DOM layout to settle before checking visibility
      const timeout = setTimeout(ensureLogoSectionVisible, 800);

      return () => clearTimeout(timeout);
    }, []);

    return (
      <div ref={ref} className="pdf-export-container">
        {/* No heading section in PDF - title will be added separately by PDF generator */}
        <BrandGuideRenderer
          guide={guide}
          colorNames={colorNames}
          typographyNames={typographyNames}
          typographyVisibility={typographyVisibility}
          previewText={previewText}
        />
      </div>
    );
  }
);

PDFExportRenderer.displayName = 'PDFExportRenderer';
