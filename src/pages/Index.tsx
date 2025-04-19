import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MainLayout } from '@/components/MainLayout';
import { TypographySection } from '@/components/TypographySection';
import { ColorPaletteSection } from '@/components/ColorPaletteSection';
import { LogoSection } from '@/components/LogoSection';
import { ExportSection } from '@/components/ExportSection';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Index = () => {
  const [activeTab, setActiveTab] = useState('typography');
  const navigate = useNavigate();
  const viewPreview = () => {
    navigate('/preview');
  };
  return <MainLayout>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Brand Guideline Generator</h1>
          
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
    </MainLayout>;
};
export default Index;