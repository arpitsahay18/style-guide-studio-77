
import React from 'react';

interface BrandStudioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  withText?: boolean;
  className?: string;
  onClick?: () => void;
}

export function BrandStudioLogo({ 
  size = 'md', 
  color = 'currentColor', 
  withText = true,
  className = '',
  onClick
}: BrandStudioLogoProps) {
  const sizes = {
    sm: { height: 24 },
    md: { height: 32 },
    lg: { height: 48 },
  };
  
  const { height } = sizes[size];
  
  return (
    <div 
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      <img 
        src="/lovable-uploads/48fbf6d8-ff14-4779-8094-0a66f3212c01.png" 
        alt="Brand Studio"
        style={{ height: height }}
        className="object-contain"
      />
    </div>
  );
}
