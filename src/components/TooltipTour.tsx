
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
  const { setActiveTab, setBrandName } = useBrandGuide();
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
    
    // Special case handling for certain steps
    if (nextStep === 5) { // After showing the color tab
      setActiveTab('colors');
      setTimeout(() => {
        scrollToRef(colorAddRef);
        setCurrentStep(nextStep);
      }, 300);
      return;
    } else if (nextStep === 7) { // After showing the logo tab
      setActiveTab('logo');
      setTimeout(() => {
        scrollToRef(logoDropzoneRef);
        setCurrentStep(nextStep);
      }, 300);
      return;
    } else if (nextStep === 8) { // Simulate "View Complete Guide" click with validation fail
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
    if (nextStep === 1) {
      scrollToRef(tabsRef);
    } else if (nextStep === 2) {
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
  
  // Position tooltip based on current step
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
      
    case 4: // Colors tab explanation
      return (
        <Tooltip 
          className="fixed top-44 left-1/3 transform -translate-x-1/2"
          onNext={handleNext}
          onClose={handleClose}
        >
          <p>Next, let's set up your brand colors. Click on the Colors tab to continue.</p>
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
          <p>Click the + button to add a primary color. We'll add a suggested color for you.</p>
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
      
    default:
      return null;
  }
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
