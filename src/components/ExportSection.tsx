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
  const { currentGuide, exportGuide, activeSection, logoGuidelines, colorNames, typographyNames } = useBrandGuide();
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
  
  const handleExportPDF = async () => {
    if (!isGuideComplete) {
      toast({
        variant: "destructive",
        title: "Incomplete brand guide",
        description: "Please complete your brand guide first.",
      });
      return;
    }

    toast({
      title: "Generating PDF",
      description: "This might take a few seconds...",
    });

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = margin;

      // Helper function to add page header
      const addPageHeader = (title: string) => {
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, currentY);
        currentY += 15;
        
        // Add separator line
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // Helper function to add footer
      const addFooter = (pageNum: number, totalPages: number) => {
        const footerY = pageHeight - 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin - 30, footerY);
        
        if (pageNum === 1 || pageNum === totalPages) {
          doc.text("Made with Brand Studio", margin, footerY);
        }
      };

      // Cover Page
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      const titleY = pageHeight / 2 - 30;
      doc.text(`${currentGuide.name}`, margin, titleY);
      
      doc.setFontSize(18);
      doc.setFont("helvetica", "normal");
      doc.text("Brand Guidelines", margin, titleY + 15);
      
      doc.setFontSize(12);
      const date = new Date().toLocaleDateString();
      doc.text(`Generated on ${date}`, margin, titleY + 30);

      // Typography Section
      doc.addPage();
      currentY = margin;
      addPageHeader("Typography");

      // Display Typography
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Display Typography", margin, currentY);
      currentY += 10;

      Object.entries(currentGuide.typography.display).forEach(([key, style]) => {
        if (checkNewPage(25)) {
          addPageHeader("Typography (continued)");
        }
        
        const styleName = typographyNames[`display-${key}`] || `Display ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(styleName, margin, currentY);
        currentY += 8;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Font: ${style.fontFamily}`, margin, currentY);
        currentY += 5;
        doc.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight} | Line Height: ${style.lineHeight}`, margin, currentY);
        currentY += 10;
      });

      // Heading Typography
      checkNewPage(15);
      currentY += 5;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Heading Typography", margin, currentY);
      currentY += 10;

      Object.entries(currentGuide.typography.heading).forEach(([key, style]) => {
        if (checkNewPage(25)) {
          addPageHeader("Typography (continued)");
        }
        
        const styleName = typographyNames[`heading-${key}`] || `Heading ${key.toUpperCase()}`;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(styleName, margin, currentY);
        currentY += 8;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Font: ${style.fontFamily}`, margin, currentY);
        currentY += 5;
        doc.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight} | Line Height: ${style.lineHeight}`, margin, currentY);
        currentY += 10;
      });

      // Body Typography
      checkNewPage(15);
      currentY += 5;
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Body Typography", margin, currentY);
      currentY += 10;

      Object.entries(currentGuide.typography.body).forEach(([key, style]) => {
        if (checkNewPage(25)) {
          addPageHeader("Typography (continued)");
        }
        
        const styleName = typographyNames[`body-${key}`] || `Body ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(styleName, margin, currentY);
        currentY += 8;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Font: ${style.fontFamily}`, margin, currentY);
        currentY += 5;
        doc.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight} | Line Height: ${style.lineHeight}`, margin, currentY);
        currentY += 10;
      });

      // Color Palette Section
      doc.addPage();
      currentY = margin;
      addPageHeader("Color Palette");

      // Primary Colors
      if (currentGuide.colors.primary.length > 0) {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Primary Colors", margin, currentY);
        currentY += 10;

        currentGuide.colors.primary.forEach((color, index) => {
          if (checkNewPage(40)) {
            addPageHeader("Color Palette (continued)");
          }
          
          const colorName = colorNames[`primary-${index}`] || color.hex;
          
          // Color swatch
          doc.setFillColor(color.hex);
          doc.rect(margin, currentY, 20, 15, 'F');
          
          // Color details
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(colorName, margin + 25, currentY + 8);
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`HEX: ${color.hex}`, margin + 25, currentY + 12);
          doc.text(`RGB: ${color.rgb}`, margin + 80, currentY + 12);
          doc.text(`CMYK: ${color.cmyk}`, margin + 130, currentY + 12);
          
          currentY += 25;
        });
      }

      // Secondary Colors
      if (currentGuide.colors.secondary.length > 0) {
        checkNewPage(15);
        currentY += 5;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Secondary Colors", margin, currentY);
        currentY += 10;

        currentGuide.colors.secondary.forEach((color, index) => {
          if (checkNewPage(40)) {
            addPageHeader("Color Palette (continued)");
          }
          
          const colorName = colorNames[`secondary-${index}`] || color.hex;
          
          // Color swatch
          doc.setFillColor(color.hex);
          doc.rect(margin, currentY, 20, 15, 'F');
          
          // Color details
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(colorName, margin + 25, currentY + 8);
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`HEX: ${color.hex}`, margin + 25, currentY + 12);
          doc.text(`RGB: ${color.rgb}`, margin + 80, currentY + 12);
          doc.text(`CMYK: ${color.cmyk}`, margin + 130, currentY + 12);
          
          currentY += 25;
        });
      }

      // Logo Section
      if (currentGuide.logos.original) {
        doc.addPage();
        currentY = margin;
        addPageHeader("Logo");

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Primary Logo", margin, currentY);
        currentY += 10;

        try {
          // Add logo image
          const logoImg = new Image();
          logoImg.crossOrigin = "anonymous";
          logoImg.onload = () => {
            doc.addImage(logoImg, 'PNG', margin, currentY, 60, 60);
            
            // Add guidelines if they exist
            const squareGuidelines = logoGuidelines['square-logo'] || [];
            if (squareGuidelines.length > 0) {
              currentY += 70;
              doc.setFontSize(12);
              doc.setFont("helvetica", "bold");
              doc.text("Logo Guidelines:", margin, currentY);
              currentY += 8;
              
              doc.setFontSize(10);
              doc.setFont("helvetica", "normal");
              squareGuidelines.forEach((guideline) => {
                doc.text(`${guideline.name}: ${Math.round(guideline.position)}px`, margin, currentY);
                currentY += 5;
              });
            }
          };
          logoImg.src = currentGuide.logos.original;
        } catch (error) {
          console.error("Error adding logo to PDF:", error);
        }
      }

      // Calculate total pages and add footers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addFooter(i, totalPages);
      }

      // Save PDF
      doc.save(`${currentGuide.name.replace(/\s+/g, '_')}_brand_guide.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: "Your brand guide has been downloaded."
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your PDF. Please try again."
      });
    }
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
          <CardTitle>Export Brand Guide as PDF</CardTitle>
          <CardDescription>
            {isGuideComplete 
              ? "Download a complete PDF version of your brand guide"
              : "Complete your brand guide to download as PDF"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isGuideComplete 
              ? "The PDF includes all your typography, colors, and logo with proper formatting and guidelines."
              : "Once you complete your brand guide, you'll be able to download a professional PDF."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleExportPDF} 
            className="w-full sm:w-auto"
            disabled={!isGuideComplete}
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isGuideComplete ? "Download PDF" : "Complete Guide First"}
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
