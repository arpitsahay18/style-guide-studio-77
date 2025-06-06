
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import { useToast } from '@/hooks/use-toast';
import { useBrandGuide } from '@/context/BrandGuideContext';

interface TooltipProps {
  children: React.ReactNode;
  className?: string;
  onNext?: () => void;
  onClose?: () => void;
  highlight?: boolean;
  arrowPosition?: 'top' | 'right' | 'bottom' | 'left';
}

// Individual tooltip component
const Tooltip = ({ 
  children, 
  className, 
  onNext, 
  onClose, 
  highlight = false, 
  arrowPosition = 'top' 
}: TooltipProps) => {
  let arrowClasses = '';
  
  switch (arrowPosition) {
    case 'top':
      arrowClasses = 'before:left-1/2 before:-top-2 before:border-b-background before:border-l-transparent before:border-r-transparent';
      break;
    case 'right':
      arrowClasses = 'before:top-1/2 before:-right-2 before:border-l-background before:border-t-transparent before:border-b-transparent';
      break;
    case 'bottom':
      arrowClasses = 'before:left-1/2 before:-bottom-2 before:border-t-background before:border-l-transparent before:border-r-transparent';
      break;
    case 'left':
      arrowClasses = 'before:top-1/2 before:-left-2 before:border-r-background before:border-t-transparent before:border-b-transparent';
      break;
  }

  return (
    <div 
      className={cn(
        "bg-background border shadow-lg p-4 rounded-md max-w-xs z-50 relative",
        highlight && "ring-4 ring-primary/20 animate-pulse",
        "before:absolute before:w-0 before:h-0 before:border-8",
        arrowClasses,
        className
      )}
    >
      <button 
        onClick={onClose} 
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Close tooltip"
      >
        <X size={16} />
      </button>
      <div className="mt-2">
        {children}
      </div>
      {onNext && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={onNext}>Next</Button>
        </div>
      )}
    </div>
  );
};

// Main tooltip tour component
export function TooltipTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { activeTab, setActiveTab, currentGuide, updateColors } = useBrandGuide();
  const { toast } = useToast();
  
  // References to scroll to
  const tabsRef = useRef<HTMLDivElement>(null);
  const fontSelectorRef = useRef<HTMLDivElement>(null);
  const typographyPreviewRef = useRef<HTMLDivElement>(null);
  const colorAddRef = useRef<HTMLDivElement>(null);
  const logoDropzoneRef = useRef<HTMLDivElement>(null);
  const brandNameRef = useRef<HTMLInputElement>(null);
  
  // Initialize the tooltip tour after a short delay
  useEffect(() => {
    if (!storage.hasSeenTooltips() && storage.hasSeenWelcome()) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Monitor tab changes to ensure tooltips are shown on the correct tab
  useEffect(() => {
    if (isVisible) {
      const step = currentStep;
      
      // If we're on a step that requires a specific tab
      if ((step >= 1 && step <= 3) && activeTab !== 'typography') {
        setActiveTab('typography');
      } else if ((step >= 4 && step <= 6) && activeTab !== 'colors') {
        setActiveTab('colors');
      } else if ((step === 7) && activeTab !== 'logo') {
        setActiveTab('logo');
      }
    }
  }, [currentStep, isVisible, activeTab, setActiveTab]);

  // Helper function to process a color when added
  const processColor = (hex: string) => {
    try {
      // Import color utility functions
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

  // Add a color automatically during the tour
  const addTourColor = (colorHex: string) => {
    try {
      const newColor = processColor(colorHex);
      if (!newColor) {
        console.error('Failed to process color:', colorHex);
        return;
      }

      const updatedColors = {
        ...currentGuide.colors,
        primary: [...currentGuide.colors.primary, newColor]
      };
      updateColors(updatedColors);
    } catch (error) {
      console.error('Error adding tour color:', error);
    }
  };
  
  // Handle tooltip tour completion
  const completeTour = () => {
    storage.markTooltipsSeen();
    setIsVisible(false);
    setCurrentStep(0);
  };
  
  // Scrolling helper
  const scrollToRef = (ref: React.RefObject<HTMLElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Handle advancing to next step
  const handleNext = () => {
    const nextStep = currentStep + 1;
    
    // First handle any special tab changes or scrolling needed
    if (nextStep === 1) {
      // Overview -> Typography tab
      setActiveTab('typography');
      setTimeout(() => {
        scrollToRef(tabsRef);
        setCurrentStep(nextStep);
      }, 300);
      return;
    } else if (nextStep === 4) {
      // Typography -> Colors tab
      setActiveTab('colors');
      setTimeout(() => {
        scrollToRef(colorAddRef);
        setCurrentStep(nextStep);
      }, 300);
      return;
    } else if (nextStep === 5) {
      // Add the tour color automatically
      addTourColor('#4A4A4A');
      setCurrentStep(nextStep);
      return;
    } else if (nextStep === 7) {
      // Colors -> Logo tab
      setActiveTab('logo');
      setTimeout(() => {
        scrollToRef(logoDropzoneRef);
        setCurrentStep(nextStep);
      }, 300);
      return;
    } else if (nextStep === 8) {
      // Simulate "View Complete Guide" click with validation fail
      // Shake effect and brand name required toast
      document.body.classList.add('shake');
      setTimeout(() => {
        document.body.classList.remove('shake');
        
        // Show toast message
        toast({
          variant: "destructive",
          title: "Brand name missing",
          description: "Hello dummy, you forgot to name your brand here.",
        });
        
        // Highlight the brand name field
        if (brandNameRef.current) {
          brandNameRef.current.focus();
          scrollToRef(brandNameRef);
        }
        
        // Finish the tour
        completeTour();
        setActiveTab('typography');
      }, 500);
      return;
    }
    
    // Handle scrolling for specific steps
    if (nextStep === 2) {
      scrollToRef(fontSelectorRef); 
    } else if (nextStep === 3) {
      scrollToRef(typographyPreviewRef);
    }
    
    if (nextStep >= 9) {
      completeTour();
    } else {
      setCurrentStep(nextStep);
    }
  };
  
  // Close the tour
  const handleClose = () => {
    completeTour();
  };
  
  if (!isVisible) {
    return null;
  }
  
  // Position tooltip based on current step and active tab
  // This ensures we only show tooltips relevant to the current tab
  if (activeTab === 'typography') {
    switch (currentStep) {
      case 0: // Tabs overview
        return (
          <Tooltip 
            className="fixed top-32 left-1/2 transform -translate-x-1/2"
            onNext={handleNext}
            onClose={handleClose}
            highlight={true}
          >
            <p>Welcome to Brand Studio! Let's get started by exploring the tabs where you can enter details about your brand.</p>
          </Tooltip>
        );
        
      case 1: // Typography tab explanation
        return (
          <Tooltip 
            className="fixed top-44 left-1/4 transform -translate-x-1/2"
            onNext={handleNext}
            onClose={handleClose}
          >
            <p>Start with the Typography tab to set up your brand's fonts and text styles.</p>
          </Tooltip>
        );
        
      case 2: // Font selector explanation
        return (
          <Tooltip 
            className="fixed top-60 left-1/4"
            onNext={handleNext}
            onClose={handleClose}
          >
            <p>Select your brand fonts from this dropdown. We've integrated with Google Fonts to provide you with hundreds of options.</p>
          </Tooltip>
        );
        
      case 3: // Typography preview explanation
        return (
          <Tooltip 
            className="fixed top-80 left-1/2"
            onNext={handleNext}
            onClose={handleClose}
          >
            <p>Preview how your selected fonts will look in different text styles. You can adjust size, weight, line height and letter spacing.</p>
          </Tooltip>
        );
    }
  } else if (activeTab === 'colors') {
    switch (currentStep) {
      case 4: // Colors tab explanation
        return (
          <Tooltip 
            className="fixed top-44 left-1/3 transform -translate-x-1/2"
            onNext={handleNext}
            onClose={handleClose}
          >
            <p>Now, let's set up your brand colors by adding primary and secondary colors.</p>
          </Tooltip>
        );
        
      case 5: // Add color explanation  
        return (
          <Tooltip 
            className="fixed top-60 right-1/4"
            onNext={handleNext}
            onClose={handleClose}
            highlight={true}
          >
            <p>I've added a sample color for you. Click on it to see the color details.</p>
          </Tooltip>
        );
        
      case 6: // Color details explanation
        return (
          <Tooltip 
            className="fixed top-80 right-1/4"
            onNext={handleNext}
            onClose={handleClose}
          >
            <p>Check out the color's contrast ratio, tints and shades to fine-tune your selection.</p>
          </Tooltip>
        );
    }
  } else if (activeTab === 'logo') {
    switch (currentStep) {
      case 7: // Logo upload explanation
        return (
          <Tooltip 
            className="fixed top-60 left-1/2 transform -translate-x-1/2"
            onNext={handleNext}
            onClose={handleClose}
          >
            <p>Upload your brand logo here. It's advisable to use a transparent PNG for best results.</p>
          </Tooltip>
        );
    }
  }
  
  // If we're in a state that doesn't match the current tab, help navigate
  return (
    <Tooltip 
      className="fixed top-32 left-1/2 transform -translate-x-1/2"
      onNext={() => {
        // Smart redirect based on step
        if (currentStep <= 3) {
          setActiveTab('typography');
        } else if (currentStep <= 6) {
          setActiveTab('colors');
        } else {
          setActiveTab('logo');
        }
      }}
      onClose={handleClose}
    >
      <p>Please navigate to the {currentStep <= 3 ? 'Typography' : currentStep <= 6 ? 'Colors' : 'Logo'} tab to continue the tour.</p>
    </Tooltip>
  );
}

// Export references to be forwarded to respective components
export const tourRefs = {
  tabsRef: React.createRef<HTMLDivElement>(),
  fontSelectorRef: React.createRef<HTMLDivElement>(),
  typographyPreviewRef: React.createRef<HTMLDivElement>(),
  colorAddRef: React.createRef<HTMLDivElement>(),
  logoDropzoneRef: React.createRef<HTMLDivElement>(),
  brandNameRef: React.createRef<HTMLInputElement>()
};
