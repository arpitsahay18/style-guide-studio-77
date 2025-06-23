
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
  
  const getClosestPantone = (hex: string): string => {
    const pantoneMap: { [key: string]: string } = {
      '#FF0000': 'Pantone Red 032 C',
      '#00FF00': 'Pantone Green C',
      '#0000FF': 'Pantone Blue 072 C',
      '#FFFF00': 'Pantone Yellow C',
      '#FF00FF': 'Pantone Magenta C',
      '#00FFFF': 'Pantone Cyan C',
      '#000000': 'Pantone Black C',
      '#FFFFFF': 'Pantone White',
      '#007BFF': 'Pantone 279 C',
      '#6C757D': 'Pantone Cool Gray 8 C'
    };

    return pantoneMap[hex.toUpperCase()] || `Pantone ${hex.substring(1).toUpperCase()}`;
  };

  const addClickableFooter = (doc: jsPDF, pageNum: number, totalPages: number) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    if (pageNum === 1 || pageNum === totalPages) {
      const footerY = pageHeight - 25; // Moved up from border
      const footerX = pageWidth / 2;
      const pillWidth = 50;
      const pillHeight = 8;
      
      // Create rounded rectangle for "Made with Brand Studio"
      doc.setFillColor(60, 60, 60);
      doc.roundedRect(footerX - pillWidth/2, footerY - pillHeight/2, pillWidth, pillHeight, 4, 4, 'F');
      
      // Add clickable link
      doc.link(footerX - pillWidth/2, footerY - pillHeight/2, pillWidth, pillHeight, { url: 'https://google.com' });
      
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text("Made with Brand Studio", footerX, footerY + 1, { align: 'center' });
    }
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
      let currentY = margin;

      // Helper function to add page header
      const addPageHeader = (title: string) => {
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, currentY);
        currentY += 15;
        
        // Add separator line
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 15;
      };

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace: number) => {
        if (currentY + requiredSpace > pageHeight - 40) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      // PAGE 1: Title Page
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Add page border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Brand name centered
      doc.setFontSize(42);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(currentGuide.name, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(24);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Brand Guide', pageWidth / 2, pageHeight / 2 + 18, { align: 'center' });
      
      // PAGE 2: Typography Section
      doc.addPage();
      currentY = margin;
      addPageHeader("Typography");

      // Display Typography
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Display Typography", margin, currentY);
      currentY += 15;

      Object.entries(currentGuide.typography.display).forEach(([key, style]) => {
        checkNewPage(40);
        
        const styleName = typographyNames[`display-${key}`] || `Display ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(styleName, margin, currentY);
        currentY += 10;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Font: ${style.fontFamily.replace(/"/g, '')}`, margin, currentY);
        currentY += 6;
        doc.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight} | Line Height: ${style.lineHeight}`, margin, currentY);
        currentY += 15;
      });

      // Heading Typography
      checkNewPage(25);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Headings", margin, currentY);
      currentY += 15;

      Object.entries(currentGuide.typography.heading).forEach(([key, style]) => {
        checkNewPage(40);
        
        const styleName = typographyNames[`heading-${key}`] || `Heading ${key.toUpperCase()}`;
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(styleName, margin, currentY);
        currentY += 10;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Font: ${style.fontFamily.replace(/"/g, '')}`, margin, currentY);
        currentY += 6;
        doc.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight} | Line Height: ${style.lineHeight}`, margin, currentY);
        currentY += 15;
      });

      // Body Typography
      checkNewPage(25);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Body Text", margin, currentY);
      currentY += 15;

      Object.entries(currentGuide.typography.body).forEach(([key, style]) => {
        checkNewPage(40);
        
        const styleName = typographyNames[`body-${key}`] || `Body ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(styleName, margin, currentY);
        currentY += 10;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`Font: ${style.fontFamily.replace(/"/g, '')}`, margin, currentY);
        currentY += 6;
        doc.text(`Size: ${style.fontSize} | Weight: ${style.fontWeight} | Line Height: ${style.lineHeight}`, margin, currentY);
        currentY += 15;
      });

      // PAGE 3: Color Palette Section
      doc.addPage();
      currentY = margin;
      addPageHeader("Color Palette");

      // Primary Colors
      if (currentGuide.colors.primary.length > 0) {
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("Primary Colors", margin, currentY);
        currentY += 15;

        currentGuide.colors.primary.forEach((color, index) => {
          checkNewPage(60);
          
          const colorName = colorNames[`primary-${index}`] || color.hex;
          
          // Color swatch
          doc.setFillColor(color.hex);
          doc.rect(margin, currentY, 30, 20, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(margin, currentY, 30, 20);
          
          // Color details
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(colorName, margin + 35, currentY + 8);
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(`HEX: ${color.hex}`, margin + 35, currentY + 14);
          doc.text(`RGB: ${color.rgb}`, margin + 80, currentY + 14);
          doc.text(`CMYK: ${color.cmyk}`, margin + 130, currentY + 14);
          doc.text(`Pantone: ${getClosestPantone(color.hex)}`, margin + 35, currentY + 18);
          
          currentY += 35;
        });
      }

      // Secondary Colors
      if (currentGuide.colors.secondary.length > 0) {
        checkNewPage(25);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Secondary Colors", margin, currentY);
        currentY += 15;

        currentGuide.colors.secondary.forEach((color, index) => {
          checkNewPage(60);
          
          const colorName = colorNames[`secondary-${index}`] || color.hex;
          
          // Color swatch
          doc.setFillColor(color.hex);
          doc.rect(margin, currentY, 30, 20, 'F');
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(margin, currentY, 30, 20);
          
          // Color details
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(colorName, margin + 35, currentY + 8);
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(80, 80, 80);
          doc.text(`HEX: ${color.hex}`, margin + 35, currentY + 14);
          doc.text(`RGB: ${color.rgb}`, margin + 80, currentY + 14);
          doc.text(`CMYK: ${color.cmyk}`, margin + 130, currentY + 14);
          doc.text(`Pantone: ${getClosestPantone(color.hex)}`, margin + 35, currentY + 18);
          
          currentY += 35;
        });
      }

      // PAGE 4: Logo Section
      if (currentGuide.logos.original) {
        doc.addPage();
        currentY = margin;
        addPageHeader("Logo");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Primary Logo", margin, currentY);
        currentY += 15;

        try {
          doc.addImage(currentGuide.logos.original, 'PNG', margin, currentY, 60, 60);
          currentY += 70;
          
          // Add guidelines if they exist
          const squareGuidelines = logoGuidelines['square-logo'] || [];
          if (squareGuidelines.length > 0) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Logo Guidelines:", margin, currentY);
            currentY += 10;
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            squareGuidelines.forEach((guideline) => {
              doc.text(`${guideline.name}: ${Math.round(guideline.position)}px`, margin, currentY);
              currentY += 6;
            });
          }
        } catch (error) {
          console.error("Error adding logo to PDF:", error);
        }
      }

      // FINAL PAGE: Closing with border
      doc.addPage();
      
      // Add page border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
      
      // Centered brand name and date
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Brand Guidelines of ${currentGuide.name}`, pageWidth / 2, pageHeight - 60, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date().toLocaleDateString(), pageWidth / 2, pageHeight - 45, { align: 'center' });

      // Calculate total pages and add footers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addClickableFooter(doc, i, totalPages);
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
        unit: "mm",
        format: "a4",
        compress: true
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;
      
      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`${currentGuide.name} Logo Pack`, margin, currentY);
      currentY += 25;
      
      // Original Logo Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Original Logo", margin, currentY);
      currentY += 15;
      
      if (typeof currentGuide.logos.original === 'string') {
        doc.addImage(currentGuide.logos.original, 'PNG', margin, currentY, 50, 50);
        currentY += 70;
      }
      
      // Logo Variations Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Logo Variations", margin, currentY);
      currentY += 15;
      
      const logoSets = [
        { title: 'Square', logos: currentGuide.logos.square },
        { title: 'Rounded', logos: currentGuide.logos.rounded },
        { title: 'Circle', logos: currentGuide.logos.circle }
      ];
      
      for (const set of logoSets) {
        if (set.logos.length > 0) {
          // Check if we need a new page
          if (currentY + 80 > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
          }
          
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(set.title, margin, currentY);
          currentY += 10;
          
          // Create 4 logo variations in a row
          const logosToShow = set.logos.slice(0, 4);
          let xPosition = margin;
          const logoSize = 25;
          const spacing = 35;
          
          for (let i = 0; i < logosToShow.length; i++) {
            const logo = logosToShow[i];
            
            try {
              // Create a canvas to render the logo with its background
              const canvas = document.createElement('canvas');
              canvas.width = 200;
              canvas.height = 200;
              const ctx = canvas.getContext('2d');
              
              if (ctx) {
                // Fill background
                ctx.fillStyle = logo.background;
                ctx.fillRect(0, 0, 200, 200);
                
                // Load and draw logo
                const img = new Image();
                img.crossOrigin = "anonymous";
                
                await new Promise<void>((resolve) => {
                  img.onload = () => {
                    const maxDim = 150;
                    const scale = Math.min(maxDim / img.width, maxDim / img.height);
                    const width = img.width * scale;
                    const height = img.height * scale;
                    const x = (200 - width) / 2;
                    const y = (200 - height) / 2;
                    
                    ctx.drawImage(img, x, y, width, height);
                    resolve();
                  };
                  img.onerror = () => resolve(); // Continue even if image fails
                  img.src = logo.src;
                });
                
                const logoDataUrl = canvas.toDataURL('image/png', 0.8);
                doc.addImage(logoDataUrl, 'PNG', xPosition, currentY, logoSize, logoSize);
                
                // Add background label
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                const bgText = logo.background === '#FFFFFF' ? 'White' : 
                              logo.background === '#000000' ? 'Black' : 
                              logo.background;
                doc.text(bgText, xPosition + logoSize/2, currentY + logoSize + 5, { align: 'center' });
              }
            } catch (error) {
              console.error("Error rendering logo variation:", error);
              // Fallback: just add a placeholder
              doc.setFillColor(240, 240, 240);
              doc.rect(xPosition, currentY, logoSize, logoSize, 'F');
            }
            
            xPosition += spacing;
          }
          
          currentY += logoSize + 15;
        }
      }
      
      // Add guidelines if they exist
      const squareGuidelines = logoGuidelines['square-logo'] || [];
      if (squareGuidelines.length > 0) {
        // Check if we need a new page
        if (currentY + 100 > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
        }
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Logo Guidelines", margin, currentY);
        currentY += 15;
        
        try {
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
            
            await new Promise<void>((resolve) => {
              img.onload = () => {
                const maxDim = canvas.width * 0.75;
                const scale = Math.min(maxDim / img.width, maxDim / img.height);
                const width = img.width * scale;
                const height = img.height * scale;
                
                const x = (canvas.width - width) / 2;
                const y = (canvas.height - height) / 2;
                
                ctx.drawImage(img, x, y, width, height);
                
                // Draw guidelines
                ctx.setLineDash([8, 8]);
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.lineWidth = 3;
                
                squareGuidelines.forEach(guideline => {
                  if (guideline.type === 'horizontal') {
                    ctx.beginPath();
                    ctx.moveTo(0, guideline.position);
                    ctx.lineTo(canvas.width, guideline.position);
                    ctx.stroke();
                    
                    // Add label
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                    ctx.fillRect(10, guideline.position - 15, 120, 20);
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.fillText(`${guideline.name}: ${Math.round(guideline.position)}px`, 15, guideline.position - 2);
                  } else {
                    ctx.beginPath();
                    ctx.moveTo(guideline.position, 0);
                    ctx.lineTo(guideline.position, canvas.height);
                    ctx.stroke();
                    
                    // Add label
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
                    ctx.fillRect(guideline.position + 10, 10, 120, 20);
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.fillText(`${guideline.name}: ${Math.round(guideline.position)}px`, guideline.position + 15, 25);
                  }
                });
                
                resolve();
              };
              img.onerror = () => resolve();
              img.src = currentGuide.logos.original;
            });
            
            const logoWithGuidelines = canvas.toDataURL('image/png', 0.8);
            doc.addImage(logoWithGuidelines, 'PNG', margin, currentY, 80, 80);
            currentY += 90;
            
            // Add guidelines list
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Guidelines:", margin, currentY);
            currentY += 8;
            
            squareGuidelines.forEach((guideline) => {
              doc.setFontSize(10);
              doc.text(`• ${guideline.name}: ${Math.round(guideline.position)}px`, margin + 5, currentY);
              currentY += 6;
            });
          }
        } catch (error) {
          console.error("Error creating logo guidelines:", error);
        }
      }
      
      // Add footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 20);
      
      // Save the PDF
      doc.save(`${currentGuide.name.replace(/\s+/g, '_')}_logo_pack.pdf`);
      
      toast({
        title: "Logo pack exported",
        description: "Your logo pack has been downloaded successfully."
      });
      
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
          <CardTitle>Export Logo Pack</CardTitle>
          <CardDescription>
            {hasLogo 
              ? "Download a PDF with all logo variations and guidelines"
              : "Upload a logo to download the logo pack"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {hasLogo 
              ? "The logo pack includes your original logo, all variations, and any guidelines you've created."
              : "Once you upload a logo, you'll be able to download a comprehensive logo pack."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button 
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
