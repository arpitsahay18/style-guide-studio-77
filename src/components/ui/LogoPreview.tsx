
import React from 'react';
import { LogoVariation } from '@/types';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoPreviewProps {
  logo: LogoVariation;
  shape: 'square' | 'rounded' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  showDownload?: boolean;
  onDownload?: () => void;
}

export function LogoPreview({
  logo,
  shape,
  size = 'md',
  showDownload = true,
  onDownload,
}: LogoPreviewProps) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64',
  };

  const shapeClasses = {
    square: 'rounded-none',
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  };

  // Determine if we should use white or black outline based on background color
  const needsOutline = logo.background === '#FFFFFF' || logo.background === '#ffffff';

  return (
    <div className="relative group">
      <div 
        className={`${sizeClasses[size]} ${shapeClasses[shape]} flex items-center justify-center overflow-hidden ${needsOutline ? 'border border-border' : ''}`}
        style={{ backgroundColor: logo.background }}
      >
        <img 
          src={logo.src} 
          alt="Logo" 
          className="w-full h-full object-contain"
          style={{ padding: '0' }}
        />
      </div>
      
      {showDownload && onDownload && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={onDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      )}
      
      <div className="mt-2 text-center">
        <p className="text-sm font-medium">
          {logo.type === 'color' ? 'Full Color' : 
           logo.type === 'white' ? 'White' : 'Black'} on 
          {logo.background === '#FFFFFF' || logo.background === '#ffffff' 
            ? ' White' 
            : logo.background === '#000000' || logo.background === '#000000' 
              ? ' Black' 
              : ' Colored'} Background
        </p>
      </div>
    </div>
  );
}

// Grid display for logo with spacing guidelines
export function LogoWithSpacingGuidelines({
  logo,
  shape = 'square',
}: {
  logo: LogoVariation;
  shape?: 'square' | 'rounded' | 'circle';
}) {
  const shapeClasses = {
    square: 'rounded-none',
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  };

  return (
    <div className="relative border border-dashed border-gray-300 p-8 w-64 h-64">
      {/* Grid lines */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <React.Fragment key={`v-${i}`}>
            <div 
              className="absolute top-0 bottom-0 border-l border-dashed border-gray-300"
              style={{ left: `${(i + 1) * 25}%` }}
            />
            <div 
              className="absolute left-0 right-0 border-t border-dashed border-gray-300"
              style={{ top: `${(i + 1) * 25}%` }}
            />
          </React.Fragment>
        ))}
      </div>
      
      {/* Logo */}
      <div 
        className={`w-full h-full ${shapeClasses[shape]} flex items-center justify-center overflow-hidden`}
        style={{ backgroundColor: logo.background }}
      >
        <img 
          src={logo.src} 
          alt="Logo with spacing guidelines" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Spacing indicators */}
      <div className="absolute -left-6 top-1/2 transform -translate-y-1/2">
        <div className="h-32 border-l border-r border-gray-400 w-4 flex items-center justify-center">
          <div className="text-xs -rotate-90 whitespace-nowrap">Clear Space</div>
        </div>
      </div>
      
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6">
        <div className="w-32 border-t border-b border-gray-400 h-4 flex items-center justify-center">
          <div className="text-xs">Clear Space</div>
        </div>
      </div>
    </div>
  );
}
