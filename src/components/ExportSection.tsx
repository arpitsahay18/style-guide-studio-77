
import React from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, PackageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandGuideWarning } from './BrandGuideWarning';
import { useToast } from '@/hooks/use-toast';
import { LogoPreview, LogoWithSpacingGuidelines } from './ui/LogoPreview';

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

  const handleExportLogoPack = () => {
    if (!currentGuide.logos.original) {
      toast({
        variant: "destructive",
        title: "No logo available",
        description: "Please upload a logo first.",
      });
      return;
    }
    
    // Create a PDF for logo pack
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [800, 1100],
      compress: true
    });
    
    // Set up PDF with brand info
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(`${currentGuide.name} Logo Pack`, 50, 50);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Original Logo", 50, 90);
    
    // Convert the image to dataURL for PDF
    const addImageToPDF = (imgData: string, x: number, y: number, width: number, height: number) => {
      try {
        doc.addImage(imgData, 'PNG', x, y, width, height);
      } catch(e) {
        console.error('Error adding image to PDF:', e);
      }
    };
    
    // Add original logo
    addImageToPDF(currentGuide.logos.original, 50, 100, 150, 150);
    
    // Add logo variations heading
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Logo Variations", 50, 280);
    
    // Add square variation
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Square", 50, 310);
    addImageToPDF(currentGuide.logos.original, 50, 320, 100, 100);
    
    // Add rounded variation
    doc.text("Rounded", 200, 310);
    addImageToPDF(currentGuide.logos.original, 200, 320, 100, 100);
    
    // Add circular variation
    doc.text("Circular", 350, 310);
    addImageToPDF(currentGuide.logos.original, 350, 320, 100, 100);
    
    // Add spacing guidelines heading
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Logo Spacing Guidelines", 50, 450);
    
    // Add spacing guidelines info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Maintain clear space around the logo for maximum impact and legibility.", 50, 480);
    
    // Add spacing guidelines image
    addImageToPDF(currentGuide.logos.original, 50, 500, 200, 200);
    
    // Add grid lines to simulate spacing guidelines
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    
    // Vertical grid lines
    for (let i = 1; i < 4; i++) {
      doc.line(50 + (i * 50), 500, 50 + (i * 50), 700);
    }
    
    // Horizontal grid lines
    for (let i = 1; i < 4; i++) {
      doc.line(50, 500 + (i * 50), 250, 500 + (i * 50));
    }
    
    // Add logo usage notes
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Logo Usage Guidelines", 50, 750);
    
    // Add usage notes
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const guidelines = [
      "• Maintain the logo's proportions when resizing",
      "• Ensure adequate contrast between the logo and background",
      "• Preserve clear space around the logo as shown in the spacing guide",
      "• Do not distort, rotate, or alter the logo's colors",
      "• For questions about logo usage, refer to your complete brand guide"
    ];
    
    guidelines.forEach((line, index) => {
      doc.text(line, 50, 780 + (index * 20));
    });
    
    // Add watermark/footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated with Brand Studio | ${new Date().toLocaleDateString()}`, 50, 1050);
    
    // Save the PDF
    doc.save(`${currentGuide.name.replace(/\s+/g, '-').toLowerCase()}-logo-pack.pdf`);
    
    toast({
      title: "Logo pack exported",
      description: "Your logo pack has been downloaded successfully."
    });
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
          <CardTitle>Export Logo Pack</CardTitle>
          <CardDescription>
            Download a complete logo pack with variations and usage guidelines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The logo pack includes your logo in different formats, along with
            spacing guidelines and usage instructions.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={handleExportLogoPack} className="w-full sm:w-auto">
            <PackageIcon className="mr-2 h-4 w-4" />
            Download Logo Pack
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
