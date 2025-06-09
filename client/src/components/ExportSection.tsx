
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
import { useLocation } from 'wouter';
import { BrandGuideWarning } from './BrandGuideWarning';
import { useToast } from '@/hooks/use-toast';

export function ExportSection() {
  const [, setLocation] = useLocation();
  const { currentGuide, exportGuide, activeSection, logoGuidelines } = useBrandGuide();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  
  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);

  const hasLogo = Boolean(currentGuide.logos.original);
  
  const handleViewGuide = () => {
    setLocation('/preview');
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
      title: "Preparing comprehensive logo pack",
      description: "This might take a few seconds...",
    });
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;

      // Helper function to create logo with guidelines
      const createLogoWithGuidelines = async (logoSrc: string, backgroundColor: string, guidelines: any[], shapeType: string) => {
        return new Promise<string>((resolve) => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve('');
            return;
          }

          // Set background
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            // Draw logo centered
            const maxDim = canvas.width * 0.75;
            const scale = Math.min(maxDim / img.width, maxDim / img.height);
            const width = img.width * scale;
            const height = img.height * scale;
            
            const x = (canvas.width - width) / 2;
            const y = (canvas.height - height) / 2;
            
            ctx.drawImage(img, x, y, width, height);
            
            // Draw guidelines
            if (guidelines && guidelines.length > 0) {
              ctx.setLineDash([5, 5]);
              ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
              ctx.lineWidth = 2;
              
              guidelines.forEach(guideline => {
                if (guideline.type === 'horizontal') {
                  ctx.beginPath();
                  ctx.moveTo(0, guideline.position);
                  ctx.lineTo(canvas.width, guideline.position);
                  ctx.stroke();
                  
                  // Add labels
                  ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                  ctx.fillRect(8, guideline.position - 12, 60, 16);
                  ctx.fillStyle = 'white';
                  ctx.font = '12px Arial';
                  ctx.fillText(`${guideline.name}: ${Math.round(guideline.position)}px`, 10, guideline.position - 2);
                } else {
                  ctx.beginPath();
                  ctx.moveTo(guideline.position, 0);
                  ctx.lineTo(guideline.position, canvas.height);
                  ctx.stroke();
                  
                  // Add labels
                  ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                  ctx.fillRect(guideline.position + 8, 8, 60, 16);
                  ctx.fillStyle = 'white';
                  ctx.font = '12px Arial';
                  ctx.fillText(`${guideline.name}: ${Math.round(guideline.position)}px`, guideline.position + 10, 20);
                }
              });
            }
            
            resolve(canvas.toDataURL('image/png'));
          };
          
          img.onerror = () => resolve('');
          img.src = logoSrc;
        });
      };

      // Title Page
      doc.setFontSize(32);
      doc.setFont("helvetica", "bold");
      doc.text(`${currentGuide.name}`, pageWidth / 2, 60, { align: 'center' });
      
      doc.setFontSize(20);
      doc.setFont("helvetica", "normal");
      doc.text("Logo Pack & Guidelines", pageWidth / 2, 80, { align: 'center' });

      const shapes = ['square', 'rounded', 'circle'] as const;
      
      for (const shape of shapes) {
        const shapeGuidelines = logoGuidelines[`${shape}-logo`] || [];
        const shapeLogos = currentGuide.logos[shape] || [];
        
        if (shapeLogos.length === 0) continue;

        doc.addPage();
        
        // Page title
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        const shapeTitle = shape.charAt(0).toUpperCase() + shape.slice(1) + " Logo Variations";
        doc.text(shapeTitle, margin, margin + 10);

        let yPosition = margin + 30;

        // Show original logo with guidelines if they exist
        if (shapeGuidelines.length > 0) {
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text("Logo with Spacing Guidelines:", margin, yPosition);
          yPosition += 10;

          const logoWithGuidelines = await createLogoWithGuidelines(
            currentGuide.logos.original, 
            '#ffffff', 
            shapeGuidelines, 
            shape
          );

          if (logoWithGuidelines) {
            const logoSize = 80;
            doc.addImage(logoWithGuidelines, 'PNG', margin, yPosition, logoSize, logoSize);
            yPosition += logoSize + 10;

            // Guidelines legend
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Guidelines:", margin, yPosition);
            yPosition += 6;

            shapeGuidelines.forEach((guideline, index) => {
              if (yPosition > pageHeight - 30) {
                doc.addPage();
                yPosition = margin + 10;
              }
              doc.text(`• ${guideline.name}: ${Math.round(guideline.position)}px`, margin + 5, yPosition);
              yPosition += 5;
            });
            
            yPosition += 10;
          }
        }

        // Show logo variations
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Logo Variations:", margin, yPosition);
        yPosition += 15;

        const logosPerRow = 2;
        const logoSize = 60;
        const logoSpacing = (pageWidth - margin * 2 - logoSize * logosPerRow) / (logosPerRow - 1);

        shapeLogos.forEach((logo, index) => {
          const row = Math.floor(index / logosPerRow);
          const col = index % logosPerRow;
          
          if (yPosition + logoSize + 30 > pageHeight - margin) {
            doc.addPage();
            yPosition = margin + 10;
          }

          const xPos = margin + col * (logoSize + logoSpacing);
          const yPos = yPosition + row * (logoSize + 25);

          // Create logo image
          const logoCanvas = document.createElement('canvas');
          logoCanvas.width = 200;
          logoCanvas.height = 200;
          const logoCtx = logoCanvas.getContext('2d');
          
          if (logoCtx) {
            logoCtx.fillStyle = logo.background;
            logoCtx.fillRect(0, 0, logoCanvas.width, logoCanvas.height);
            
            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.onload = () => {
              const maxDim = logoCanvas.width * 0.8;
              const scale = Math.min(maxDim / logoImg.width, maxDim / logoImg.height);
              const width = logoImg.width * scale;
              const height = logoImg.height * scale;
              
              const x = (logoCanvas.width - width) / 2;
              const y = (logoCanvas.height - height) / 2;
              
              logoCtx.drawImage(logoImg, x, y, width, height);
              
              const logoDataUrl = logoCanvas.toDataURL('image/png');
              doc.addImage(logoDataUrl, 'PNG', xPos, yPos, logoSize, logoSize);
              
              // Add description
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              const description = `${logo.type === 'color' ? 'Color' : logo.type === 'white' ? 'White' : 'Black'} on ${logo.background}`;
              doc.text(description, xPos + logoSize/2, yPos + logoSize + 5, { align: 'center' });
            };
            logoImg.src = logo.src;
          }

          if ((index + 1) % logosPerRow === 0) {
            yPosition += logoSize + 25;
          }
        });
      }

      // Save the PDF
      setTimeout(() => {
        doc.save(`${currentGuide.name.replace(/\s+/g, '_')}_logo_pack.pdf`);
        toast({
          title: "Comprehensive logo pack exported",
          description: "Your complete logo pack with all variations and guidelines has been downloaded."
        });
      }, 1000);

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
