
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from '@/components/MainLayout';
import { TypographySection } from '@/components/TypographySection';
import { ColorPaletteSection } from '@/components/ColorPaletteSection';
import { LogoSection } from '@/components/LogoSection';
import { ExportSection } from '@/components/ExportSection';
import { Input } from '@/components/ui/input';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { WelcomeDialog } from '@/components/WelcomeDialog';
import { storage } from '@/lib/storage';

const Index = () => {
  const { currentGuide, setGuideName, activeTab, setActiveTab } = useBrandGuide();
  const [brandName, setBrandName] = useState(currentGuide.name);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // Initialize welcome dialog
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
