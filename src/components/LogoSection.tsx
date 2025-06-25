
import React, { useState, useRef, useEffect } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { LogoVariation, LogoSet } from '@/types';
import { LogoPreview } from '@/components/ui/LogoPreview';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UploadCloud, 
  AlertCircle, 
  X, 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Download,
  ArrowRight
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { LogoDropzone } from './LogoDropzone';
import { LogoCropper } from './LogoCropper';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface LogoVariationCreatorProps {
  originalLogo: string;
  onComplete: (variations: LogoVariation[]) => void;
}

function LogoVariationCreator({ originalLogo, onComplete }: LogoVariationCreatorProps) {
  const generateVariations = () => {
    const variations: LogoVariation[] = [];
    
    variations.push({
      src: originalLogo,
      background: '#FFFFFF',
      type: 'color'
    });
    
    variations.push({
      src: originalLogo,
      background: '#000000',
      type: 'color'
    });
    
    variations.push({
      src: originalLogo,
      background: '#0062FF',
      type: 'white'
    });
    
    variations.push({
      src: originalLogo,
      background: '#FFFFFF',
      type: 'black'
    });
    
    onComplete(variations);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Create Logo Variations</h3>
        <p className="text-sm text-muted-foreground">
          We'll create standard logo variations for different backgrounds and use cases.
          In a real application, this would process the logo to create true single-color versions.
        </p>
      </div>
      
      <div className="w-full max-w-xs mx-auto">
        <img 
          src={originalLogo} 
          alt="Original Logo" 
          className="w-full h-auto border border-border rounded-md p-4"
        />
        <p className="text-center text-sm mt-2">Your Uploaded Logo</p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={generateVariations}>
          Generate Logo Variations
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export function LogoSection() {
  const { currentGuide, updateLogos } = useBrandGuide();
  const { toast } = useToast();
  const [showUploader, setShowUploader] = useState(!currentGuide.logos.original);
  const [showCropper, setShowCropper] = useState(false);
  const [uploadedImage, setUploadedImage] = useState('');
  const [croppedImage, setCroppedImage] = useState('');
  const [showVariationCreator, setShowVariationCreator] = useState(false);
  
  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
        setShowUploader(false);
        setShowCropper(true);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleCropComplete = (croppedImage: string) => {
    setCroppedImage(croppedImage);
    
    const updatedLogos: LogoSet = {
      ...currentGuide.logos,
      original: croppedImage
    };
    
    updateLogos(updatedLogos);
    setShowCropper(false);
    setShowVariationCreator(true);
  };
  
  const handleVariationsComplete = (variations: LogoVariation[]) => {
    const updatedLogos: LogoSet = {
      ...currentGuide.logos,
      square: variations,
      rounded: variations,
      circle: variations
    };
    
    updateLogos(updatedLogos);
    setShowVariationCreator(false);
  };
  
  const handleDeleteLogo = () => {
    const updatedLogos: LogoSet = {
      original: '',
      square: [],
      rounded: [],
      circle: []
    };
    
    updateLogos(updatedLogos);
    setShowUploader(true);
    setShowCropper(false);
    setShowVariationCreator(false);
    setUploadedImage('');
    setCroppedImage('');
  };
  
  const handleDownloadLogoPack = async () => {
    if (!currentGuide.logos.original) {
      toast({
        variant: "destructive",
        title: "No logo available",
        description: "Please upload a logo first.",
      });
      return;
    }
    
    toast({
      title: "Generating logo pack",
      description: "Creating PDF with all variations...",
    });
    
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(`${currentGuide.name || 'Brand'} Logo Pack`, 20, 30);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text('Original Logo', 20, 50);
      
      if (currentGuide.logos.original) {
        doc.addImage(currentGuide.logos.original, 'PNG', 20, 60, 60, 60);
      }
      
      doc.text('Logo Variations', 20, 140);
      
      let yPosition = 150;
      const logoSets = [
        { title: 'Square', logos: currentGuide.logos.square },
        { title: 'Rounded', logos: currentGuide.logos.rounded },
        { title: 'Circle', logos: currentGuide.logos.circle }
      ];
      
      for (const set of logoSets) {
        if (set.logos.length > 0) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(set.title, 20, yPosition);
          yPosition += 10;
          
          const logosToShow = set.logos.slice(0, 4);
          let xPosition = 20;
          
          for (let i = 0; i < logosToShow.length; i++) {
            const logo = logosToShow[i];
            
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              ctx.fillStyle = logo.background;
              ctx.fillRect(0, 0, 100, 100);
              
              const img = new Image();
              img.crossOrigin = "anonymous";
              
              await new Promise<void>((resolve) => {
                img.onload = () => {
                  const maxDim = 75;
                  const scale = Math.min(maxDim / img.width, maxDim / img.height);
                  const width = img.width * scale;
                  const height = img.height * scale;
                  const x = (100 - width) / 2;
                  const y = (100 - height) / 2;
                  
                  ctx.drawImage(img, x, y, width, height);
                  resolve();
                };
                img.src = logo.src;
              });
              
              const logoDataUrl = canvas.toDataURL('image/png');
              doc.addImage(logoDataUrl, 'PNG', xPosition, yPosition, 30, 30);
            }
            
            xPosition += 40;
          }
          
          yPosition += 40;
        }
      }
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280);
      
      const filename = `${(currentGuide.name || 'Brand').replace(/\s+/g, '_')}_logo_pack.pdf`;
      doc.save(filename);
      
      toast({
        title: "Logo pack downloaded",
        description: "Your complete logo pack has been saved as PDF.",
      });
      
    } catch (error) {
      console.error("Error generating logo pack:", error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error generating your logo pack.",
      });
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Logo Implementation</CardTitle>
          <CardDescription>
            Upload your logo and create variations for different use cases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showUploader && (
            <LogoDropzone onUpload={handleLogoUpload} />
          )}
          
          {showCropper && (
            <LogoCropper 
              imageUrl={uploadedImage}
              onCrop={handleCropComplete}
              onCancel={() => {
                setShowCropper(false);
                setShowUploader(true);
              }}
            />
          )}
          
          {showVariationCreator && (
            <LogoVariationCreator 
              originalLogo={croppedImage || currentGuide.logos.original}
              onComplete={handleVariationsComplete}
            />
          )}
          
          {!showUploader && !showCropper && !showVariationCreator && currentGuide.logos.original && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Logo</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage your logo variations.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Remove Logo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove your current logo and all variations. You'll need to upload a new logo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteLogo}>
                          Yes, remove logo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <Button size="sm" onClick={handleDownloadLogoPack}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Logo Pack
                  </Button>
                </div>
              </div>
              
              <div>
                <img 
                  src={currentGuide.logos.original}
                  alt="Original Logo"
                  className="w-40 h-40 object-contain border border-border rounded-md p-4 mx-auto"
                />
              </div>
              
              <Tabs defaultValue="square" className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-8">
                  <TabsTrigger value="square">Square</TabsTrigger>
                  <TabsTrigger value="rounded">Rounded</TabsTrigger>
                  <TabsTrigger value="circle">Circle</TabsTrigger>
                </TabsList>
                
                <TabsContent value="square" className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentGuide.logos.square.map((logo, index) => (
                      <LogoPreview 
                        key={index}
                        logo={logo}
                        shape="square"
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="rounded" className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentGuide.logos.rounded.map((logo, index) => (
                      <LogoPreview 
                        key={index}
                        logo={logo}
                        shape="rounded"
                      />
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="circle" className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentGuide.logos.circle.map((logo, index) => (
                      <LogoPreview 
                        key={index}
                        logo={logo}
                        shape="circle"
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
