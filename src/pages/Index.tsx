
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
import { TooltipTour, tourRefs } from '@/components/TooltipTour';
import { storage } from '@/lib/storage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('typography');
  const navigate = useNavigate();
  const { currentGuide, setGuideName } = useBrandGuide();
  const { toast } = useToast();
  const [brandName, setBrandName] = useState(currentGuide.name);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Initialize welcome dialog and tour
  useEffect(() => {
    // Check if user has seen the welcome dialog
    if (!storage.hasSeenWelcome()) {
      setWelcomeOpen(true);
    }
  }, []);

  // Handle welcome dialog completion
  const handleWelcomeComplete = () => {
    setWelcomeOpen(false);
    
    // Start the tour after welcome dialog closes
    if (!storage.hasSeenTooltips()) {
      setShowTour(true);
    }
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

  return (
    <MainLayout>
      {welcomeOpen && <div className="welcome-overlay" />}
      
      <WelcomeDialog 
        open={welcomeOpen} 
        onOpenChange={setWelcomeOpen} 
        onGetStarted={handleWelcomeComplete} 
      />
      
      {showTour && <TooltipTour />}
      
      <div className="container mx-auto px-4">
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
              ref={tourRefs.brandNameRef}
            />
          </div>
        </div>
        
        <div ref={tourRefs.tabsRef}>
          <Tabs defaultValue="typography" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-4 mb-8">
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
            
            <TabsContent value="typography" className="animate-fade-in">
              <div ref={tourRefs.fontSelectorRef}>
                <div ref={tourRefs.typographyPreviewRef}>
                  <TypographySection />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="animate-fade-in">
              <div ref={tourRefs.colorAddRef}>
                <ColorPaletteSection />
              </div>
            </TabsContent>
            
            <TabsContent value="logo" className="animate-fade-in">
              <div ref={tourRefs.logoDropzoneRef}>
                <LogoSection />
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="animate-fade-in">
              <ExportSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
