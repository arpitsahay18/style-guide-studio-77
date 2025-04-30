
import React from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { saveAs } from 'file-saver';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandGuideWarning } from './BrandGuideWarning';
import { useToast } from '@/hooks/use-toast';

export function ExportSection() {
  const navigate = useNavigate();
  const { currentGuide, exportGuide, activeSection } = useBrandGuide();
  const { toast } = useToast();
  
  // Check if guide is complete
  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);
  
  const handleViewGuide = () => {
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
  
  const handleExportJSON = () => {
    if (!isGuideComplete) {
      toast({
        variant: "destructive",
        title: "Brand guide incomplete",
        description: "Please add at least one primary color, one secondary color, and a logo.",
      });
      return;
    }
    
    exportGuide('json');
  };
  
  // Only show warning when active section is export
  const showWarning = activeSection === 'export' && !isGuideComplete;
  
  return (
    <div className="grid gap-6">
      {showWarning && <BrandGuideWarning />}
      
      <Card>
        <CardHeader>
          <CardTitle>View Your Brand Guide</CardTitle>
          <CardDescription>
            See how your brand guide looks in a complete presentation format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This will take you to a comprehensive view of your brand guide, 
            perfect for presentations or sharing with your team.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleViewGuide} className="w-full sm:w-auto">
            <Eye className="mr-2 h-4 w-4" />
            View Complete Guide
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Export as JSON</CardTitle>
          <CardDescription>
            Export your brand guide as a JSON file that can be imported into other systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A JSON export contains all the technical definitions of your brand elements 
            and can be integrated with your design systems.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleExportJSON} className="w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
