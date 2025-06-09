
import React from 'react';
import { TypographyStyle } from '@/types';
import { Copy, Check, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { generateTypographyCss, typographyToTailwind } from '@/utils/typographyUtils';
import { useState } from "react";

interface TypographyPreviewProps {
  name: string;
  style: TypographyStyle;
  previewText: string;
  showCode?: boolean;
}

export function TypographyPreview({
  name,
  style,
  previewText,
  showCode = true,
}: TypographyPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showCSS, setShowCSS] = useState(false);
  
  const cssCode = generateTypographyCss(style);
  const tailwindCode = typographyToTailwind(style);
  
  const copyToClipboard = () => {
    const textToCopy = showCSS ? cssCode : tailwindCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="mb-8 group">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-mono text-muted-foreground">{name}</h4>
        
        {showCode && (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => setShowCSS(!showCSS)}
            >
              <Code className="h-3 w-3 mr-1" />
              {showCSS ? 'Show Tailwind' : 'Show CSS'}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy {showCSS ? 'CSS' : 'Tailwind'} code</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      <div 
        className="p-4 border border-border rounded-md mb-2 transition-colors hover:bg-accent/20"
        style={{
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform as any,
        }}
      >
        {previewText}
      </div>
      
      {showCode && (
        <div className="text-xs font-mono p-2 bg-muted rounded-md overflow-auto max-h-32">
          {showCSS ? (
            <pre className="text-muted-foreground">{cssCode}</pre>
          ) : (
            <code className="text-muted-foreground">{tailwindCode}</code>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
        <div>
          <span className="font-semibold">Size:</span> {style.fontSize}
        </div>
        <div>
          <span className="font-semibold">Weight:</span> {style.fontWeight}
        </div>
        <div>
          <span className="font-semibold">Line Height:</span> {style.lineHeight}
        </div>
        <div>
          <span className="font-semibold">Letter Spacing:</span> {style.letterSpacing}
        </div>
        <div>
          <span className="font-semibold">Font:</span> {style.fontFamily.split(',')[0]}
        </div>
        {style.textTransform && (
          <div>
            <span className="font-semibold">Transform:</span> {style.textTransform}
          </div>
        )}
      </div>
    </div>
  );
}
