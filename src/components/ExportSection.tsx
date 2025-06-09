
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
  const { currentGuide, exportGuide, activeSection } = useBrandGuide();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Check if guide is complete
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
      
      // Add original logo as string
      if (typeof currentGuide.logos.original === 'string') {
        doc.addImage(currentGuide.logos.original, 'PNG', 50, 100, 150, 150);
      }
      
      // Add logo variations heading
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Logo Variations", 50, 280);
      
      // Get first logo from each variation type
      const squareLogo = currentGuide.logos.square[0];
      const roundedLogo = currentGuide.logos.rounded[0];
      const circleLogo = currentGuide.logos.circle[0];
      
      // Generate logo variations with proper shapes
      let squareDataUrl = '';
      let roundedDataUrl = '';
      let circleDataUrl = '';
      
      try {
        squareDataUrl = await getLogoDataUrl(squareLogo, 'square');
        roundedDataUrl = await getLogoDataUrl(roundedLogo, 'rounded');
        circleDataUrl = await getLogoDataUrl(circleLogo, 'circle');
      } catch (error) {
        console.error("Error generating logo variations:", error);
      }
      
      // Add square variation
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Square", 50, 310);
      if (squareDataUrl) {
        doc.addImage(squareDataUrl, 'PNG', 50, 320, 100, 100);
      }
      
      // Add rounded variation
      doc.text("Rounded", 200, 310);
      if (roundedDataUrl) {
        doc.addImage(roundedDataUrl, 'PNG', 200, 320, 100, 100);
      }
      
      // Add circular variation
      doc.text("Circular", 350, 310);
      if (circleDataUrl) {
        doc.addImage(circleDataUrl, 'PNG', 350, 320, 100, 100);
      }
      
      // Add spacing guidelines heading
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Logo Spacing Guidelines", 50, 450);
      
      // Add spacing guidelines info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Maintain clear space around the logo for maximum impact and legibility.", 50, 480);
      
      // Add spacing guidelines image
      if (typeof currentGuide.logos.original === 'string') {
        doc.addImage(currentGuide.logos.original, 'PNG', 50, 500, 200, 200);
      }
      
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
    } catch (error) {
      console.error("Error exporting logo pack:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your logo pack. Please try again."
      });
    }
  };

  // Helper function to convert logo to data URL
  const getLogoDataUrl = async (logo, shape): Promise<string> => {
    try {
      // Create a temporary canvas to render the logo with the correct shape
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Draw background
      ctx.fillStyle = logo.background;
      ctx.beginPath();
      
      switch (shape) {
        case 'square':
          ctx.rect(0, 0, canvas.width, canvas.height);
          break;
        case 'rounded':
          ctx.roundRect(0, 0, canvas.width, canvas.height, 30);
          break;
        case 'circle':
          ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
          break;
        default:
          ctx.rect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.fill();
      
      // Load and draw the logo
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          // Calculate dimensions to maintain aspect ratio and fit within 75% of the canvas
          const maxDim = canvas.width * 0.75;
          const scale = Math.min(maxDim / img.width, maxDim / img.height);
          const width = img.width * scale;
          const height = img.height * scale;
          
          // Center the logo
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          // Draw the logo
          ctx.drawImage(img, x, y, width, height);
          
          // Get the data URL
          resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => {
          reject(new Error("Failed to load logo image"));
        };
        
        img.src = logo.src;
      });
    } catch (error) {
      console.error("Error generating logo data URL:", error);
      return ''; // Return empty string on error
    }
  };

  const generateShareableLink = () => {
    // Generate a unique ID for this brand guide
    const brandGuideId = `brand-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the brand guide data with expiry (8 hours)
    const expiryTime = Date.now() + (8 * 60 * 60 * 1000); // 8 hours
    const shareData = {
      guide: currentGuide,
      expiryTime,
      createdAt: Date.now()
    };
    
    // In a real app, this would be stored in a database
    // For now, we'll store it in localStorage with the ID
    localStorage.setItem(`shared-brand-${brandGuideId}`, JSON.stringify(shareData));
    
    // Generate the shareable URL
    const baseUrl = window.location.origin;
    const shareableUrl = `${baseUrl}/shared/${brandGuideId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setLinkCopied(true);
      toast({
        title: "Shareable link generated",
        description: "Link copied to clipboard. Valid for 8 hours.",
      });
      
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Failed to copy link",
        description: "Please copy the link manually.",
      });
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
            Generate a shareable link that allows others to view your brand guide. 
            Links expire after 8 hours for security.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={generateShareableLink} 
            className="w-full sm:w-auto"
            disabled={!isGuideComplete}
          >
            {linkCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Share className="mr-2 h-4 w-4" />
            )}
            {linkCopied ? "Link Copied!" : "Generate Shareable Link"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
