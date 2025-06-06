
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import { useToast } from '@/hooks/use-toast';
import { useBrandGuide } from '@/context/BrandGuideContext';

interface SpotlightTooltipProps {
  children: React.ReactNode;
  targetElement: string;
  className?: string;
  onNext?: () => void;
  onClose?: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showSpotlight?: boolean;
}

// Enhanced tooltip with spotlight effect
const SpotlightTooltip = ({ 
  children, 
  targetElement,
  className, 
  onNext, 
  onClose, 
  position = 'top-right',
  showSpotlight = true
}: SpotlightTooltipProps) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const target = document.querySelector(targetElement);
      if (target && tooltipRef.current) {
        const targetRect = target.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let top = targetRect.top;
        let left = targetRect.right + 10; // Default to top-right
        
        switch (position) {
          case 'top-left':
            top = targetRect.top;
            left = targetRect.left - tooltipRect.width - 10;
            break;
          case 'bottom-right':
            top = targetRect.bottom + 10;
            left = targetRect.right - tooltipRect.width;
            break;
          case 'bottom-left':
            top = targetRect.bottom + 10;
            left = targetRect.left;
            break;
        }
        
        // Ensure tooltip stays within viewport
        const maxLeft = window.innerWidth - tooltipRect.width - 20;
        const maxTop = window.innerHeight - tooltipRect.height - 20;
        
        left = Math.max(10, Math.min(left, maxLeft));
        top = Math.max(10, Math.min(top, maxTop));
        
        setTooltipPosition({ top, left });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetElement, position]);

  useEffect(() => {
    if (showSpotlight) {
      // Add spotlight effect
      const target = document.querySelector(targetElement);
      if (target) {
        target.classList.add('tour-spotlight');
        document.body.classList.add('tour-active');
      }
    }

    return () => {
      // Clean up spotlight effect
      const target = document.querySelector(targetElement);
      if (target) {
        target.classList.remove('tour-spotlight');
      }
      document.body.classList.remove('tour-active');
    };
  }, [targetElement, showSpotlight]);

  return (
    <>
      {showSpotlight && <div className="tour-overlay" />}
      <div 
        ref={tooltipRef}
        className={cn(
          "fixed z-[60] bg-background border shadow-lg p-4 rounded-md max-w-sm",
          className
        )}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground z-10"
          aria-label="Close tooltip"
        >
          <X size={16} />
        </button>
        <div className="mt-2 pr-6">
          {children}
        </div>
        {onNext && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={onNext}>Next</Button>
          </div>
        )}
      </div>
    </>
  );
};

// Main enhanced tooltip tour component
export function EnhancedTooltipTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { activeTab, setActiveTab, currentGuide, updateColors, setGuideName } = useBrandGuide();
  const { toast } = useToast();
  
  // Initialize the tooltip tour
  useEffect(() => {
    if (!storage.hasSeenTooltips() && storage.hasSeenWelcome()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Helper function to process a color
  const processColor = (hex: string) => {
    try {
      const { hexToRgb, formatRgb, rgbToCmyk, formatCmyk, generateTints, generateShades, calculateContrastRatio } = require('@/utils/colorUtils');
      
      const rgb = hexToRgb(hex);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      return {
        hex,
        rgb: formatRgb(rgb),
        cmyk: formatCmyk(cmyk),
        tints: generateTints(hex),
        shades: generateShades(hex),
        blackContrast: calculateContrastRatio(hex, '#000000'),
        whiteContrast: calculateContrastRatio(hex, '#FFFFFF')
      };
    } catch (error) {
      console.error('Error processing color:', error);
      return null;
    }
  };

  // Programmatically set font to Inter
  const setInterFont = () => {
    // This would integrate with the FontSelector component
    // For now, we'll simulate the selection
    console.log('Setting font to Inter programmatically');
  };

  // Programmatically add color and show details
  const addColorAndShowDetails = () => {
    try {
      const newColor = processColor('#FF4C4C');
      if (!newColor) return;

      const updatedColors = {
        ...currentGuide.colors,
        primary: [...currentGuide.colors.primary, newColor]
      };
      updateColors(updatedColors);

      // Simulate clicking on the first color to show details
      setTimeout(() => {
        const firstColorSwatch = document.querySelector('#primary-colors .group:first-child [data-color-swatch]');
        if (firstColorSwatch) {
          (firstColorSwatch as HTMLElement).click();
        }
      }, 100);
    } catch (error) {
      console.error('Error adding color:', error);
    }
  };

  // Focus brand name input
  const focusBrandNameInput = () => {
    const brandNameInput = document.querySelector('#brandName') as HTMLInputElement;
    if (brandNameInput) {
      brandNameInput.focus();
      brandNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle tooltip tour completion
  const completeTour = () => {
    storage.markTooltipsSeen();
    setIsVisible(false);
    setCurrentStep(0);
    // Clean up any remaining spotlight effects
    document.body.classList.remove('tour-active');
    document.querySelectorAll('.tour-spotlight').forEach(el => {
      el.classList.remove('tour-spotlight');
    });
  };

  // Handle advancing to next step
  const handleNext = () => {
    const nextStep = currentStep + 1;
    
    switch (nextStep) {
      case 1:
        // Step 1: Typography tab - set Inter font and show preview
        setActiveTab('typography');
        setTimeout(() => {
          setInterFont();
          setCurrentStep(nextStep);
        }, 300);
        break;
        
      case 2:
        // Step 2: Color tab - add color and show details
        setActiveTab('colors');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          addColorAndShowDetails();
          setCurrentStep(nextStep);
        }, 300);
        break;
        
      case 3:
        // Step 3: Brand name focus
        setActiveTab('typography'); // Go back to main view
        setTimeout(() => {
          focusBrandNameInput();
          setCurrentStep(nextStep);
          
          // Show the error popup
          setTimeout(() => {
            toast({
              title: "psst! Start by adding your Brand Name",
              description: "and then proceed to export tab.",
              duration: 5000,
            });
          }, 500);
        }, 300);
        break;
        
      default:
        completeTour();
        break;
    }
  };
  
  // Close the tour
  const handleClose = () => {
    completeTour();
  };
  
  if (!isVisible) {
    return null;
  }

  // Exit tour button
  const ExitTourButton = () => (
    <button
      onClick={handleClose}
      className="fixed top-4 right-4 z-[70] bg-background border shadow-lg px-3 py-1 rounded text-sm hover:bg-accent transition-colors"
    >
      Exit Tour
    </button>
  );
  
  // Render appropriate tooltip based on current step
  switch (currentStep) {
    case 0:
      return (
        <>
          <ExitTourButton />
          <SpotlightTooltip
            targetElement="#typography-settings, .container"
            onNext={handleNext}
            onClose={handleClose}
            position="top-right"
          >
            <p>Here you can customize your brand's font. Let's choose 'Inter' as your Display Font.</p>
          </SpotlightTooltip>
        </>
      );
      
    case 1:
      return (
        <>
          <ExitTourButton />
          <SpotlightTooltip
            targetElement="#typography-settings, .typography-preview"
            onNext={handleNext}
            onClose={handleClose}
            position="bottom-right"
          >
            <p>This is how 'Inter' looks in Display Large. Click Next to continue.</p>
          </SpotlightTooltip>
        </>
      );
      
    case 2:
      return (
        <>
          <ExitTourButton />
          <SpotlightTooltip
            targetElement="#primary-colors"
            onNext={handleNext}
            onClose={handleClose}
            position="top-right"
          >
            <p>Here's a preview of your primary color's contrast and tint/shade information.</p>
          </SpotlightTooltip>
        </>
      );
      
    case 3:
      return (
        <>
          <ExitTourButton />
          <SpotlightTooltip
            targetElement="#brandName"
            onNext={handleNext}
            onClose={handleClose}
            position="bottom-right"
            showSpotlight={false}
          >
            <p>Enter your brand name here to complete your brand guide setup.</p>
          </SpotlightTooltip>
        </>
      );
      
    default:
      return null;
  }
}
