
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ColorSwatchProps {
  color: string;
  name?: string;
  showHex?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  showCopyButton?: boolean;
}

export function ColorSwatch({
  color,
  name,
  showHex = true,
  size = 'md',
  onClick,
  className = '',
  showCopyButton = true,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className={`flex flex-col items-center gap-2 ${className}`}
      onClick={onClick}
    >
      <div
        className={`${sizeClasses[size]} rounded-md border border-border relative group overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer`}
        style={{ backgroundColor: color }}
      >
        {showCopyButton && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="absolute right-1 top-1 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-600" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? 'Copied!' : 'Copy hex code'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {name && <span className="text-sm font-medium text-center">{name}</span>}
      {showHex && <Badge variant="outline" className="text-xs font-mono">{color}</Badge>}
    </div>
  );
}
