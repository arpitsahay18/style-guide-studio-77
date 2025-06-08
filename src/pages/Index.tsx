
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

const Index = () => {
  const navigate = useNavigate();
  const { currentGuide, setGuideName, activeTab, setActiveTab } = useBrandGuide();
  const { toast } = useToast();
  const [brandName, setBrandName] = useState(currentGuide?.name || '');
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Error boundary-like behavior
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Application error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Initialize welcome dialog safely
  useEffect(() => {
    try {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setWelcomeOpen(true);
      }
    } catch (error) {
      console.error('Error checking welcome status:', error);
    }
  }, []);

  // Handle welcome dialog completion
  const handleWelcomeComplete = () => {
    try {
      localStorage.setItem('hasSeenWelcome', 'true');
      setWelcomeOpen(false);
    } catch (error) {
      console.error('Error saving welcome status:', error);
      setWelcomeOpen(false);
    }
  };

  useEffect(() => {
    if (currentGuide?.name) {
      setBrandName(currentGuide.name);
    }
  }, [currentGuide?.name]);

  // Safety check for currentGuide
  if (!currentGuide) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading brand guide...</p>
        </div>
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">Please refresh the page to try again.</p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isGuideComplete = 
    currentGuide.colors?.primary?.length > 0 && 
    currentGuide.colors?.secondary?.length > 0 && 
    Boolean(currentGuide.logos?.original);
  
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
      <WelcomeDialog 
        open={welcomeOpen} 
        onOpenChange={setWelcomeOpen} 
        onGetStarted={handleWelcomeComplete} 
      />
      
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
