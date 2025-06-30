
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
        <div className="pdf-section avoid-break">
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem', color: 'black' }}>
            {guide.name}
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#666', marginBottom: '3rem' }}>
            Brand Guidelines
          </p>
        </div>
        
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
