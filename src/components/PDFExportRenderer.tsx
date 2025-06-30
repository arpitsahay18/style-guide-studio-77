
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
        {/* Title Section */}
        <div className="pdf-section avoid-break">
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            marginBottom: '16px', 
            color: 'black',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif'
          }}>
            {guide.name}
          </h1>
          <p style={{ 
            fontSize: '24px', 
            color: '#666', 
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif'
          }}>
            Brand Guidelines
          </p>
        </div>
        
        {/* Logo Section */}
        {guide.logos.original && (
          <div className="pdf-section avoid-break">
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '24px', 
              color: 'black',
              fontFamily: 'Inter, sans-serif'
            }}>
              Logo
            </h2>
            
            {/* Primary Logo */}
            <div className="avoid-break" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <img 
                src={guide.logos.original}
                alt="Primary Logo"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  margin: '0 auto 16px auto',
                  display: 'block'
                }}
              />
              <p style={{ fontSize: '14px', color: '#666', fontFamily: 'Inter, sans-serif' }}>
                Primary Logo
              </p>
            </div>
            
            {/* Logo Variations */}
            {guide.logos.square && guide.logos.square.length > 0 && (
              <>
                <h3 style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  marginBottom: '16px', 
                  color: 'black',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Logo Variations
                </h3>
                
                {['square', 'rounded', 'circle'].map((shape) => (
                  guide.logos[shape] && guide.logos[shape].length > 0 && (
                    <div key={shape} className="avoid-break" style={{ marginBottom: '24px' }}>
                      <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '500', 
                        marginBottom: '12px', 
                        color: 'black',
                        textTransform: 'capitalize',
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {shape} Variations
                      </h4>
                      
                      <div className="logo-variations-grid">
                        {guide.logos[shape].slice(0, 4).map((logo: any, index: number) => {
                          const backgrounds = ['#FFFFFF', '#000000', '#3E3BFF', '#FFEAEA'];
                          const backgroundLabels = ['White', 'Black', 'Blue', 'Light Pink'];
                          const bgColor = backgrounds[index % backgrounds.length];
                          const bgLabel = backgroundLabels[index % backgroundLabels.length];
                          
                          return (
                            <div key={index} className="logo-display-item avoid-break">
                              <div style={{
                                width: '80px',
                                height: '80px',
                                backgroundColor: bgColor,
                                border: bgColor === '#FFFFFF' ? '2px solid #e0e0e0' : 'none',
                                borderRadius: shape === 'circle' ? '50%' : shape === 'rounded' ? '8px' : '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 8px auto',
                                overflow: 'hidden'
                              }}>
                                <img 
                                  src={guide.logos.original}
                                  alt={`${shape} logo on ${bgLabel}`}
                                  style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'contain'
                                  }}
                                />
                              </div>
                              <p style={{ 
                                fontSize: '12px', 
                                color: '#666',
                                fontFamily: 'Inter, sans-serif',
                                textAlign: 'center'
                              }}>
                                On {bgLabel}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
          </div>
        )}
        
        {/* Colors Section */}
        {(guide.colors.primary.length > 0 || guide.colors.secondary.length > 0) && (
          <div className="pdf-section avoid-break">
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '24px', 
              color: 'black',
              fontFamily: 'Inter, sans-serif'
            }}>
              Color Palette
            </h2>
            
            {guide.colors.primary.length > 0 && (
              <div className="avoid-break" style={{ marginBottom: '24px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: 'black',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Primary Colors
                </h3>
                <div className="color-grid">
                  {guide.colors.primary.map((color: any, index: number) => (
                    <div key={index} className="color-card avoid-break">
                      <div style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: color.hex,
                        borderRadius: '8px',
                        margin: '0 auto 8px auto',
                        border: '1px solid #e0e0e0'
                      }} />
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: 'black',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center'
                      }}>
                        {colorNames[color.id] || `Color ${index + 1}`}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center'
                      }}>
                        {color.hex}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {guide.colors.secondary.length > 0 && (
              <div className="avoid-break">
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: 'black',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Secondary Colors
                </h3>
                <div className="color-grid">
                  {guide.colors.secondary.map((color: any, index: number) => (
                    <div key={index} className="color-card avoid-break">
                      <div style={{
                        width: '100px',
                        height: '100px',
                        backgroundColor: color.hex,
                        borderRadius: '8px',
                        margin: '0 auto 8px auto',
                        border: '1px solid #e0e0e0'
                      }} />
                      <p style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: 'black',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center'
                      }}>
                        {colorNames[color.id] || `Color ${index + 1}`}
                      </p>
                      <p style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        fontFamily: 'Inter, sans-serif',
                        textAlign: 'center'
                      }}>
                        {color.hex}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Typography Section */}
        {guide.typography.length > 0 && (
          <div className="pdf-section avoid-break">
            <h2 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '24px', 
              color: 'black',
              fontFamily: 'Inter, sans-serif'
            }}>
              Typography
            </h2>
            
            {guide.typography.map((typo: any, index: number) => (
              <div key={index} className="typography-section avoid-break">
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px', 
                  color: 'black',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {typographyNames[typo.id] || typo.category || `Typography ${index + 1}`}
                </h3>
                <p style={{
                  fontFamily: `${typo.fontFamily}, Inter, sans-serif`,
                  fontSize: '24px',
                  color: 'black',
                  marginBottom: '8px'
                }}>
                  {previewText}
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Font: {typo.fontFamily}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

PDFExportRenderer.displayName = 'PDFExportRenderer';
