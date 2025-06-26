
import React from 'react';
import { BrandGuide, TypographyStyle } from '@/types';

interface BrandGuideRendererProps {
  guide: BrandGuide;
  colorNames: { [key: string]: string };
  typographyNames: { [key: string]: string };
  typographyVisibility: {
    display: string[];
    heading: string[];
    body: string[];
  };
  previewText: string;
  isPrintMode?: boolean;
}

export function BrandGuideRenderer({
  guide,
  colorNames,
  typographyNames,
  typographyVisibility,
  previewText,
  isPrintMode = false
}: BrandGuideRendererProps) {
  const convertToCSS = (style: TypographyStyle): React.CSSProperties => {
    return {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      textTransform: style.textTransform,
      wordWrap: 'break-word',
      overflowWrap: 'break-word'
    };
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Error loading image:', e.currentTarget.src);
    (e.target as HTMLImageElement).style.display = 'none';
  };

  // Logo component with proper shape cropping
  const LogoDisplay = ({ logo, shape, index }: { logo: any; shape: 'square' | 'rounded' | 'circle'; index: number }) => {
    const getContainerClass = () => {
      const baseClass = "w-24 h-24 border-2 border-gray-200 flex items-center justify-center mb-3 mx-auto shadow-sm";
      switch (shape) {
        case 'square':
          return `${baseClass} overflow-hidden`;
        case 'rounded':
          return `${baseClass} rounded-lg overflow-hidden`;
        case 'circle':
          return `${baseClass} rounded-full overflow-hidden`;
        default:
          return `${baseClass} overflow-hidden`;
      }
    };

    const getImageClass = () => {
      // Use object-fit: cover for proper cropping while maintaining aspect ratio
      return "w-full h-full object-cover";
    };

    const getTypeLabel = () => {
      return logo.type === 'color' ? 'Full Color' : 
             logo.type === 'white' ? 'White' : 'Black';
    };

    const getBackgroundLabel = () => {
      return logo.background === '#FFFFFF' ? ' White' : 
             logo.background === '#000000' ? ' Black' : ' Color';
    };

    return (
      <div className={`text-center bg-gray-50 rounded-lg p-4 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
        <div 
          className={getContainerClass()}
          style={{ backgroundColor: logo.background }}
        >
          <img 
            src={logo.src} 
            alt={`${shape} logo ${index + 1}`}
            className={getImageClass()}
            onError={handleImageError}
          />
        </div>
        <p className="text-sm font-medium text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          {getTypeLabel()} on{getBackgroundLabel()} Background
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-16" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Typography Section */}
      <section className={`pdf-section bg-white rounded-lg shadow-sm p-8 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
        <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Typography</h2>
        
        {/* Display Typography */}
        {Object.entries(guide.typography.display).some(([key]) => 
          typographyVisibility.display?.includes(key)
        ) && (
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Display Typography</h3>
            <div className="space-y-8">
              {Object.entries(guide.typography.display)
                .filter(([key]) => typographyVisibility.display?.includes(key))
                .map(([key, style]) => {
                  const typedStyle = style as TypographyStyle;
                  const styleName = typographyNames[`display-${key}`] || `Display ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                  return (
                    <div key={key} className={`border-l-4 border-blue-500 pl-6 py-4 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <div className="lg:col-span-1">
                          <h4 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{styleName}</h4>
                          <div className="text-sm text-gray-500 space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <p>{typedStyle.fontFamily.replace(/"/g, '')}</p>
                            <p>{typedStyle.fontSize} • {typedStyle.fontWeight}</p>
                            <p>{typedStyle.lineHeight} • {typedStyle.letterSpacing}</p>
                          </div>
                        </div>
                        <div className="lg:col-span-3">
                          <p style={convertToCSS(typedStyle)} className="break-words">
                            {previewText || "The quick brown fox jumps over the lazy dog"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Heading Typography */}
        {Object.entries(guide.typography.heading).some(([key]) => 
          typographyVisibility.heading?.includes(key)
        ) && (
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Headings</h3>
            <div className="space-y-8">
              {Object.entries(guide.typography.heading)
                .filter(([key]) => typographyVisibility.heading?.includes(key))
                .map(([key, style]) => {
                  const typedStyle = style as TypographyStyle;
                  const styleName = typographyNames[`heading-${key}`] || `Heading ${key.toUpperCase()}`;
                  return (
                    <div key={key} className={`border-l-4 border-green-500 pl-6 py-4 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <div className="lg:col-span-1">
                          <h4 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{styleName}</h4>
                          <div className="text-sm text-gray-500 space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <p>{typedStyle.fontFamily.replace(/"/g, '')}</p>
                            <p>{typedStyle.fontSize} • {typedStyle.fontWeight}</p>
                            <p>{typedStyle.lineHeight} • {typedStyle.letterSpacing}</p>
                          </div>
                        </div>
                        <div className="lg:col-span-3">
                          <p style={convertToCSS(typedStyle)} className="break-words">
                            {previewText || "The quick brown fox jumps over the lazy dog"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Body Typography */}
        {Object.entries(guide.typography.body).some(([key]) => 
          typographyVisibility.body?.includes(key)
        ) && (
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Body Text</h3>
            <div className="space-y-8">
              {Object.entries(guide.typography.body)
                .filter(([key]) => typographyVisibility.body?.includes(key))
                .map(([key, style]) => {
                  const typedStyle = style as TypographyStyle;
                  const styleName = typographyNames[`body-${key}`] || `Body ${key.charAt(0).toUpperCase() + key.slice(1)}`;
                  return (
                    <div key={key} className={`border-l-4 border-purple-500 pl-6 py-4 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                        <div className="lg:col-span-1">
                          <h4 className="text-lg font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>{styleName}</h4>
                          <div className="text-sm text-gray-500 space-y-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <p>{typedStyle.fontFamily.replace(/"/g, '')}</p>
                            <p>{typedStyle.fontSize} • {typedStyle.fontWeight}</p>
                            <p>{typedStyle.lineHeight} • {typedStyle.letterSpacing}</p>
                          </div>
                        </div>
                        <div className="lg:col-span-3">
                          <p style={convertToCSS(typedStyle)} className="break-words">
                            {previewText || "The quick brown fox jumps over the lazy dog. This is sample body text to demonstrate the typography style with multiple lines and proper spacing."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </section>

      {/* Colors Section */}
      <section className={`pdf-section bg-white rounded-lg shadow-sm p-8 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
        <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Color Palette</h2>
        
        {/* Primary Colors */}
        {guide.colors.primary && guide.colors.primary.length > 0 && (
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Primary Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guide.colors.primary.map((color: any, index: number) => {
                const colorName = colorNames[`primary-${index}`] || color.hex;
                return (
                  <div key={index} className={`bg-gray-50 rounded-lg p-6 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                    <div 
                      className="w-full h-24 rounded-lg border shadow-sm mb-4"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{colorName}</h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>HEX: {color.hex}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>RGB: {color.rgb}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>CMYK: {color.cmyk}</p>
                    </div>
                    
                    {/* Tints */}
                    {color.tints && color.tints.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Tints</p>
                        <div className="flex gap-1">
                          {color.tints.slice(0, 5).map((tint: string, tintIndex: number) => (
                            <div 
                              key={tintIndex}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: tint }}
                              title={tint}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Shades */}
                    {color.shades && color.shades.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Shades</p>
                        <div className="flex gap-1">
                          {color.shades.slice(0, 5).map((shade: string, shadeIndex: number) => (
                            <div 
                              key={shadeIndex}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: shade }}
                              title={shade}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Secondary Colors */}
        {guide.colors.secondary && guide.colors.secondary.length > 0 && (
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Secondary Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guide.colors.secondary.map((color: any, index: number) => {
                const colorName = colorNames[`secondary-${index}`] || color.hex;
                return (
                  <div key={index} className={`bg-gray-50 rounded-lg p-6 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                    <div 
                      className="w-full h-24 rounded-lg border shadow-sm mb-4"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{colorName}</h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>HEX: {color.hex}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>RGB: {color.rgb}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>CMYK: {color.cmyk}</p>
                    </div>
                    
                    {/* Tints */}
                    {color.tints && color.tints.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Tints</p>
                        <div className="flex gap-1">
                          {color.tints.slice(0, 5).map((tint: string, tintIndex: number) => (
                            <div 
                              key={tintIndex}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: tint }}
                              title={tint}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Shades */}
                    {color.shades && color.shades.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Shades</p>
                        <div className="flex gap-1">
                          {color.shades.slice(0, 5).map((shade: string, shadeIndex: number) => (
                            <div 
                              key={shadeIndex}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: shade }}
                              title={shade}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Neutral Colors */}
        {guide.colors.neutral && guide.colors.neutral.length > 0 && (
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Neutral Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guide.colors.neutral.map((color: any, index: number) => {
                const colorName = colorNames[`neutral-${index}`] || color.hex;
                return (
                  <div key={index} className={`bg-gray-50 rounded-lg p-6 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                    <div 
                      className="w-full h-24 rounded-lg border shadow-sm mb-4"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>{colorName}</h4>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>HEX: {color.hex}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>RGB: {color.rgb}</p>
                      <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>CMYK: {color.cmyk}</p>
                    </div>
                    
                    {/* Tints */}
                    {color.tints && color.tints.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Tints</p>
                        <div className="flex gap-1">
                          {color.tints.slice(0, 5).map((tint: string, tintIndex: number) => (
                            <div 
                              key={tintIndex}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: tint }}
                              title={tint}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Shades */}
                    {color.shades && color.shades.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Shades</p>
                        <div className="flex gap-1">
                          {color.shades.slice(0, 5).map((shade: string, shadeIndex: number) => (
                            <div 
                              key={shadeIndex}
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: shade }}
                              title={shade}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Logo Section */}
      {guide.logos.original && (
        <section className={`pdf-section bg-white rounded-lg shadow-sm p-8 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
          <h2 className="text-4xl font-bold mb-12 text-gray-900 border-b pb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Logo</h2>
          
          {/* Primary Logo */}
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Primary Logo</h3>
            <div className="flex justify-center">
              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <div className="flex items-center justify-center w-64 h-64 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
                  <img 
                    src={guide.logos.original} 
                    alt="Primary Logo" 
                    className="max-w-full max-h-full object-contain p-6"
                    onError={handleImageError}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Variations */}
          <div className={`mb-12 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
            <h3 className="text-3xl font-semibold mb-8 text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>Logo Variations</h3>
            
            {/* Square Logos */}
            {guide.logos.square && guide.logos.square.length > 0 && (
              <div className={`mb-10 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                <h4 className="text-2xl font-medium mb-6 text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Square</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {guide.logos.square.slice(0, 4).map((logo: any, index: number) => (
                    <LogoDisplay key={index} logo={logo} shape="square" index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Rounded Logos */}
            {guide.logos.rounded && guide.logos.rounded.length > 0 && (
              <div className={`mb-10 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                <h4 className="text-2xl font-medium mb-6 text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Rounded</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {guide.logos.rounded.slice(0, 4).map((logo: any, index: number) => (
                    <LogoDisplay key={index} logo={logo} shape="rounded" index={index} />
                  ))}
                </div>
              </div>
            )}

            {/* Circle Logos */}
            {guide.logos.circle && guide.logos.circle.length > 0 && (
              <div className={`mb-10 ${isPrintMode ? 'page-break-inside-avoid' : ''}`}>
                <h4 className="text-2xl font-medium mb-6 text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Circle</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {guide.logos.circle.slice(0, 4).map((logo: any, index: number) => (
                    <LogoDisplay key={index} logo={logo} shape="circle" index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
