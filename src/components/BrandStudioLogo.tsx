
import React from 'react';

interface BrandStudioLogoProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  withText?: boolean;
  className?: string;
}

export function BrandStudioLogo({ 
  size = 'md', 
  color = 'currentColor', 
  withText = true,
  className = ''
}: BrandStudioLogoProps) {
  const sizes = {
    sm: { logo: 24, font: 'text-sm' },
    md: { logo: 32, font: 'text-lg' },
    lg: { logo: 48, font: 'text-xl' },
  };
  
  const { logo, font } = sizes[size];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: logo, height: logo, color: color }}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Four-point star logo */}
          <path 
            d="M50 15L59.5 40.5L85 50L59.5 59.5L50 85L40.5 59.5L15 50L40.5 40.5L50 15Z" 
            fill="currentColor"
          />
          {/* Inner highlight */}
          <path 
            d="M50 30L54 44L68 50L54 56L50 70L46 56L32 50L46 44L50 30Z" 
            fill="white" 
            fillOpacity="0.3"
          />
        </svg>
      </div>
      
      {withText && (
        <span 
          className={`font-semibold ${font}`} 
          style={{ 
            fontFamily: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", serif', 
            letterSpacing: '0.02em',
            color: color
          }}
        >
          Brand Studio
        </span>
      )}
    </div>
  );
}
