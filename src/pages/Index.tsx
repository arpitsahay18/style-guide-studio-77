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

const Index = () => {
  const [activeTab, setActiveTab] = useState('typography');
  const navigate = useNavigate();
  const { currentGuide, setGuideName } = useBrandGuide();
  const { toast } = useToast();
  const [brandName, setBrandName] = useState(currentGuide.name);

  useEffect(() => {
    setBrandName(currentGuide.name);
  }, [currentGuide.name]);

  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);
  
  const viewPreview = () => {
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
            />
          </div>
        </div>
        
        <Tabs defaultValue="typography" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-8">
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="typography" className="animate-fade-in">
            <TypographySection />
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
