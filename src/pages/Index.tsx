
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from '@/components/MainLayout';
import { TypographySection } from '@/components/TypographySection';
import { ColorPaletteSection } from '@/components/ColorPaletteSection';
import { LogoSection } from '@/components/LogoSection';
import { ExportSection } from '@/components/ExportSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { useToast } from '@/hooks/use-toast';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { EnhancedTooltipTour } from '@/components/EnhancedTooltipTour';
import { storage } from '@/lib/storage';

const Index = () => {
  const navigate = useNavigate();
  const { currentGuide, setGuideName, activeTab, setActiveTab } = useBrandGuide();
  const { toast } = useToast();
  const [brandName, setBrandName] = useState(currentGuide.name);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // Initialize welcome dialog and tour
  useEffect(() => {
    // Check if user has seen the welcome dialog
    if (!storage.hasSeenWelcome()) {
      setWelcomeOpen(true);
    }
  }, []);

  // Handle welcome dialog completion
  const handleWelcomeComplete = () => {
    storage.markWelcomeSeen();
    setWelcomeOpen(false);
  };

  useEffect(() => {
    setBrandName(currentGuide.name);
  }, [currentGuide.name]);

  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);
  
  const viewPreview = () => {
    if (!brandName.trim()) {
      toast({
        variant: "destructive",
        title: "Brand name missing",
        description: "Please enter a brand name before previewing the guide.",
      });
      return;
    }
    
    if (!isGuideComplete) {
      toast({
        variant: "destructive",
        title: "Brand guide incomplete",
        description: "Please add at least one primary color, one secondary color, and a logo.",
      });
      return;
    }
    
    navigate('/preview');
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setBrandName(newName);
    setGuideName(newName);
  };

  // Add overlay class when welcome is open
  const overlayClass = welcomeOpen ? 'pointer-events-none blur-sm' : '';

  return (
    <MainLayout>
      <style>
        {`
          /* Enhanced Tooltip Tour Styles */
          .tour-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.6);
            z-index: 50;
            pointer-events: none;
          }

          .tour-active {
            overflow: hidden;
          }

          .tour-spotlight {
            position: relative;
            z-index: 55 !important;
            border: 2px solid rgba(255, 255, 255, 0.8) !important;
            border-radius: 8px;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 
                        0 0 20px rgba(59, 130, 246, 0.2) !important;
            background-color: inherit !important;
            animation: spotlight-appear 0.3s ease-out;
          }

          .tour-active .tour-spotlight {
            filter: brightness(1) !important;
          }

          @keyframes spotlight-appear {
            from {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
              border-color: transparent;
            }
            to {
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 
                          0 0 20px rgba(59, 130, 246, 0.2);
              border-color: rgba(255, 255, 255, 0.8);
            }
          }

          @media (max-width: 768px) {
            .tour-spotlight {
              border-width: 1px;
              box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 
                          0 0 10px rgba(59, 130, 246, 0.2) !important;
            }
          }

          .shake {
            animation: shake 0.5s ease-in-out;
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}
      </style>
      
      <WelcomeDialog 
        open={welcomeOpen} 
        onOpenChange={setWelcomeOpen} 
        onGetStarted={handleWelcomeComplete} 
      />
      
      <EnhancedTooltipTour />
      
      <div className={`container mx-auto px-4 transition-all duration-300 ${overlayClass}`}>
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Brand Guideline Generator</h1>
            <Button onClick={viewPreview} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview Brand Guide
            </Button>
          </div>
          
          <div className="w-full max-w-md">
            <label htmlFor="brandName" className="text-sm font-medium mb-2 block">
              Brand Name
            </label>
            <Input
              id="brandName"
              placeholder="Enter brand name"
              value={brandName}
              onChange={handleNameChange}
              className="w-full"
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-8">
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="typography" className="animate-fade-in">
            <div id="typography-settings">
              <TypographySection />
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="animate-fade-in">
            <ColorPaletteSection />
          </TabsContent>
          
          <TabsContent value="logo" className="animate-fade-in">
            <LogoSection />
          </TabsContent>
          
          <TabsContent value="export" className="animate-fade-in">
            <ExportSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Index;
