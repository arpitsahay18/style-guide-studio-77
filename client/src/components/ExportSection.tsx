
import React, { useState } from 'react';
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
import { FileDown, Eye, PackageIcon, Share, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandGuideWarning } from './BrandGuideWarning';
import { useToast } from '@/hooks/use-toast';

export function ExportSection() {
  const navigate = useNavigate();
  const { currentGuide, exportGuide, activeSection, logoGuidelines } = useBrandGuide();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  
  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);

  const hasLogo = Boolean(currentGuide.logos.original);
  
  const handleViewGuide = () => {
    navigate('/preview');
  };
  
  const handleExportLogoPack = async () => {
    if (!currentGuide.logos.original) {
      toast({
        variant: "destructive",
        title: "No logo available",
        description: "Please upload a logo first.",
      });
      return;
    }
    
    toast({
      title: "Preparing logo pack",
      description: "This might take a few seconds...",
    });
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [800, 1100],
        compress: true
      });
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(`${currentGuide.name} Logo Pack`, 50, 50);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Original Logo", 50, 90);
      
      if (typeof currentGuide.logos.original === 'string') {
        doc.addImage(currentGuide.logos.original, 'PNG', 50, 100, 150, 150);
      }
      
      // Add logo guidelines if they exist
      const squareGuidelines = logoGuidelines['square-logo'] || [];
      if (squareGuidelines.length > 0) {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Logo Guidelines", 50, 280);
        
        // Create logo with guidelines
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // White background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Load and draw logo
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const maxDim = canvas.width * 0.75;
            const scale = Math.min(maxDim / img.width, maxDim / img.height);
            const width = img.width * scale;
            const height = img.height * scale;
            
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.drawImage(img, x, y, width, height);
            
            // Draw guidelines
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            
            squareGuidelines.forEach(guideline => {
              if (guideline.type === 'horizontal') {
                ctx.beginPath();
                ctx.moveTo(0, guideline.position);
                ctx.lineTo(canvas.width, guideline.position);
                ctx.stroke();
              } else {
                ctx.beginPath();
                ctx.moveTo(guideline.position, 0);
                ctx.lineTo(guideline.position, canvas.height);
                ctx.stroke();
              }
            });
            
            const logoWithGuidelines = canvas.toDataURL('image/png');
            doc.addImage(logoWithGuidelines, 'PNG', 50, 300, 200, 200);
            
            // Add guidelines list
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Guidelines:", 50, 520);
            
            squareGuidelines.forEach((guideline, index) => {
              doc.text(`${guideline.name}: ${Math.round(guideline.position)}px`, 50, 540 + (index * 15));
            });
            
            // Save the PDF
            doc.save(`${currentGuide.name.replace(/\s+/g, '_')}_logo_pack.pdf`);
            
            toast({
              title: "Logo pack exported",
              description: "Your logo pack has been downloaded successfully."
            });
          };
          
          img.onerror = () => {
            // Fallback without guidelines
            doc.save(`${currentGuide.name.replace(/\s+/g, '_')}_logo_pack.pdf`);
            toast({
              title: "Logo pack exported",
              description: "Your logo pack has been downloaded successfully."
            });
          };
          
          img.src = currentGuide.logos.original;
        }
      } else {
        // No guidelines, just save
        doc.save(`${currentGuide.name.replace(/\s+/g, '_')}_logo_pack.pdf`);
        toast({
          title: "Logo pack exported",
          description: "Your logo pack has been downloaded successfully."
        });
      }
    } catch (error) {
      console.error("Error exporting logo pack:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your logo pack. Please try again."
      });
    }
  };
  
  const showWarning = activeSection === 'export' && !isGuideComplete;
  
  return (
    <div className="grid gap-6">
      {showWarning && <BrandGuideWarning />}
      
      <Card>
        <CardHeader>
          <CardTitle>View Your Brand Guide</CardTitle>
          <CardDescription>
            {isGuideComplete 
              ? "See how your brand guide looks in a complete presentation format" 
              : "Add at least one primary color, one secondary color, and a logo to view your brand guide"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isGuideComplete 
              ? "This will take you to a comprehensive view of your brand guide, perfect for presentations or sharing with your team."
              : "Complete your brand guide by adding the missing elements to unlock the preview."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleViewGuide} 
            className="w-full sm:w-auto"
            disabled={!isGuideComplete}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isGuideComplete ? "View Complete Guide" : "Complete Guide First"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Export Logo Pack</CardTitle>
          <CardDescription>
            {hasLogo 
              ? "Download a complete logo pack with variations and usage guidelines"
              : "Upload a logo to generate and download a logo pack"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {hasLogo 
              ? "The logo pack includes your logo in different formats, along with spacing guidelines and usage instructions."
              : "Once you upload a logo, you'll be able to download a professional logo pack with variations."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={handleExportLogoPack} 
            className="w-full sm:w-auto"
            disabled={!hasLogo}
          >
            <PackageIcon className="mr-2 h-4 w-4" />
            {hasLogo ? "Download Logo Pack" : "Upload Logo First"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Shareable Link</CardTitle>
          <CardDescription>
            Create a temporary link to share your brand guide with others
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This feature is coming soon! You'll be able to generate shareable links 
            that allow others to view your brand guide.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            disabled={true}
            className="w-full sm:w-auto"
          >
            <Share className="mr-2 h-4 w-4" />
            Coming Soon!
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
