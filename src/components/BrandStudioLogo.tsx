import React from 'react';

interface BrandStudioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  withText?: boolean;
  className?: string;
  onClick?: () => void;
  logoSrc?: string;
  useSimpleStroke?: boolean;
}

export function BrandStudioLogo({ 
  size = 'md', 
  color = 'currentColor', 
  withText = true,
  className = '',
  onClick,
  logoSrc,
  useSimpleStroke = false
}: BrandStudioLogoProps) {
  const sizes = {
    sm: { height: 24 },
    md: { height: 32 },
    lg: { height: 48 },
  };
  
  const { height } = sizes[size];

  // Simple stroke logic for logo preview
  const getStrokeColor = (src: string) => {
    if (!useSimpleStroke) return 'transparent';
    
    // Simple heuristic: if filename contains 'white' or 'light', use black stroke
    // Otherwise use white stroke (this is a simplified approach)
    const isLightLogo = src.toLowerCase().includes('white') || src.toLowerCase().includes('light');
    return isLightLogo ? '#000000' : '#ffffff';
  };
  
  const displaySrc = logoSrc || "/lovable-uploads/48fbf6d8-ff14-4779-8094-0a66f3212c01.png";
  const strokeColor = useSimpleStroke ? getStrokeColor(displaySrc) : 'transparent';
  
  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      <img 
        src={displaySrc}
        alt="Brand Studio"
        style={{ 
          height: height,
          border: useSimpleStroke ? `2px solid ${strokeColor}` : 'none',
          borderRadius: useSimpleStroke ? '8px' : '0'
        }}
        className="object-contain"
      />
    </div>
  );
}
