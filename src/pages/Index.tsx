
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
  const {
    currentGuide,
    setGuideName,
    activeTab,
    setActiveTab
  } = useBrandGuide();
  const [brandName, setBrandName] = useState(currentGuide.name);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  // Initialize welcome dialog
  useEffect(() => {
    if (!storage.hasSeenWelcome()) {
      setWelcomeOpen(true);
    }
  }, []);

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

  // Determine logo border color based on logo analysis
  const getLogoBorderColor = () => {
    if (!currentGuide.logos.original) {
      return 'white';
    }

    // Simple heuristic: if there are primary colors, use them for border
    if (currentGuide.colors.primary.length === 1) {
      return currentGuide.colors.primary[0].hex;
    } else if (currentGuide.colors.primary.length > 1) {
      const colors = currentGuide.colors.primary.map(color => color.hex).join(', ');
      return `linear-gradient(45deg, ${colors})`;
    }

    // Default to a simple border approach
    return '#e5e7eb'; // gray-200
  };

  const overlayClass = welcomeOpen ? 'pointer-events-none blur-sm' : '';

  return (
    <MainLayout>
      <WelcomeDialog open={welcomeOpen} onOpenChange={setWelcomeOpen} onGetStarted={handleWelcomeComplete} />
      
      <div className={`container mx-auto px-4 transition-all duration-300 ${overlayClass}`}>
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Brand Guideline Generator</h1>
          </div>
          
          <div className="flex items-center gap-4 w-full max-w-md">
            {/* Brand Logo Placeholder */}
            {currentGuide.logos.original && (
              <div 
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center overflow-hidden bg-white flex-shrink-0"
                style={{
                  borderColor: currentGuide.colors.primary.length === 1 
                    ? currentGuide.colors.primary[0].hex 
                    : currentGuide.colors.primary.length > 1 
                      ? 'transparent'
                      : '#e5e7eb',
                  background: currentGuide.colors.primary.length > 1 
                    ? `linear-gradient(45deg, ${currentGuide.colors.primary.map(color => color.hex).join(', ')})` 
                    : 'white'
                }}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <img 
                    src={currentGuide.logos.original} 
                    alt="Brand Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="flex-1">
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
