
import React, { forwardRef } from 'react';
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
