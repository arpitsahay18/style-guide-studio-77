
import React, { useState, useRef } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { LogoVariation, LogoSet } from '@/types';
import { LogoPreview, LogoWithSpacingGuidelines } from '@/components/ui/LogoPreview';
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

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

interface LogoUploadProps {
  onUpload: (file: File) => void;
}

function LogoUpload({ onUpload }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };
  
  const validateAndProcessFile = (file: File) => {
    setError('');
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload PNG, JPG, or SVG files only.');
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB limit.');
      return;
    }
    
    onUpload(file);
  };
  
  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-accent/10'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
          <UploadCloud className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="font-medium">Drag and drop your logo here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse your files
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            PNG, JPG, SVG up to 5MB
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".png,.jpg,.jpeg,.svg"
          onChange={handleFileSelect}
        />
      </div>
      
      {error && (
        <div className="mt-2 text-destructive text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" /> {error}
        </div>
      )}
    </div>
  );
}

interface LogoCropperProps {
  imageUrl: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

function LogoCropper({ imageUrl, onCrop, onCancel }: LogoCropperProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };
  
  // Handle drag operations
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      e.preventDefault();
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerSize = containerRect.width;
      const imageSize = containerSize * zoom;
      
      // Calculate new position
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      
      // Constrain position within boundaries
      const maxOffset = (imageSize - containerSize) / 2;
      newX = Math.max(-maxOffset, Math.min(newX, maxOffset));
      newY = Math.max(-maxOffset, Math.min(newY, maxOffset));
      
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && containerRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerSize = containerRect.width;
      const imageSize = containerSize * zoom;
      
      // Calculate new position
      let newX = touch.clientX - dragStart.x;
      let newY = touch.clientY - dragStart.y;
      
      // Constrain position within boundaries
      const maxOffset = (imageSize - containerSize) / 2;
      newX = Math.max(-maxOffset, Math.min(newX, maxOffset));
      newY = Math.max(-maxOffset, Math.min(newY, maxOffset));
      
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  // Execute crop operation
  const handleCrop = () => {
    if (!imageRef.current || !containerRef.current) return;
    
    const canvas = document.createElement('canvas');
    const containerSize = containerRef.current.getBoundingClientRect().width;
    
    canvas.width = containerSize;
    canvas.height = containerSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Calculate source dimensions and position for cropping
    const imageSize = containerSize * zoom;
    const sourceX = (imageSize / 2) - (containerSize / 2) - position.x;
    const sourceY = (imageSize / 2) - (containerSize / 2) - position.y;
    
    // Create a temporary image to ensure it's fully loaded
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      ctx.drawImage(
        img,
        sourceX, sourceY,
        containerSize, containerSize,
        0, 0,
        containerSize, containerSize
      );
      
      // Convert to data URL
      const croppedImage = canvas.toDataURL('image/png');
      onCrop(croppedImage);
    };
    
    img.src = imageUrl;
  };
  
  // Effect to initialize the image position
  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  }, [imageUrl]);
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Crop Your Logo</h3>
        <p className="text-sm text-muted-foreground">
          Position your logo within the square crop frame. You can drag to position and use the zoom slider for better fit.
        </p>
      </div>
      
      <div 
        ref={containerRef}
        className="w-full aspect-square overflow-hidden border border-border rounded-md relative mx-auto"
        style={{ maxWidth: '300px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: '50%',
            top: '50%',
            width: `${zoom * 100}%`,
            transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
            opacity: isDragging ? 0.8 : 1,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            pointerEvents: 'none', // Prevent image from interfering with drag events
          }}
          alt="Logo to crop"
          draggable={false}
        />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
          {Array.from({ length: 2 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="absolute border-r border-white h-full" style={{ left: `${(i + 1) * 33.33}%` }} />
              <div className="absolute border-b border-white w-full" style={{ top: `${(i + 1) * 33.33}%` }} />
            </React.Fragment>
          ))}
        </div>
        
        {/* Drag hint */}
        <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1.5 pointer-events-none">
          <Move className="h-4 w-4 text-white" />
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="zoom-slider">Zoom</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Slider
            id="zoom-slider"
            value={[zoom]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={handleZoomChange}
          />
        </div>
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleCrop}>
            <Crop className="h-4 w-4 mr-2" />
            Crop Logo
          </Button>
        </div>
      </div>
    </div>
  );
}

interface LogoVariationCreatorProps {
  originalLogo: string;
  onComplete: (variations: LogoVariation[]) => void;
}

function LogoVariationCreator({ originalLogo, onComplete }: LogoVariationCreatorProps) {
  // Generate the standard logo variations
  const generateVariations = () => {
    // Create variations for each container shape and background
    const variations: LogoVariation[] = [];
    
    // Full color on white background
    variations.push({
      src: originalLogo,
      background: '#FFFFFF',
      type: 'color'
    });
    
    // Full color on black background
    variations.push({
      src: originalLogo,
      background: '#000000',
      type: 'color'
    });
    
    // White on primary color background (using a default blue for now)
    variations.push({
      src: originalLogo,
      background: '#0062FF',
      type: 'white'
    });
    
    // Black on white background
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
  const [showUploader, setShowUploader] = useState(!currentGuide.logos.original);
  const [showCropper, setShowCropper] = useState(false);
  const [showVariationCreator, setShowVariationCreator] = useState(false);
  const [uploadedImage, setUploadedImage] = useState('');
  const [croppedImage, setCroppedImage] = useState('');
  
  // Handle logo upload
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
  
  // Handle logo crop completion
  const handleCropComplete = (croppedImage: string) => {
    setCroppedImage(croppedImage);
    
    // Update the original logo in the guide
    const updatedLogos: LogoSet = {
      ...currentGuide.logos,
      original: croppedImage
    };
    
    updateLogos(updatedLogos);
    
    setShowCropper(false);
    setShowVariationCreator(true);
  };
  
  // Handle logo variations completion
  const handleVariationsComplete = (variations: LogoVariation[]) => {
    // Create variations for each container shape
    const updatedLogos: LogoSet = {
      ...currentGuide.logos,
      square: variations,
      rounded: variations,
      circle: variations
    };
    
    updateLogos(updatedLogos);
    setShowVariationCreator(false);
  };
  
  // Handle logo deletion and restart the process
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
  
  // Mock function for logo download
  const handleDownloadLogo = () => {
    // In a real application, this would generate a zip file with all logo variations
    console.log('Downloading logo pack...');
    
    // For demo, just download the original
    if (currentGuide.logos.original) {
      const link = document.createElement('a');
      link.download = 'logo.png';
      link.href = currentGuide.logos.original;
      link.click();
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Logo Implementation</CardTitle>
          <CardDescription>
            Upload your logo, create variations, and generate guidelines for proper usage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showUploader && (
            <LogoUpload onUpload={handleLogoUpload} />
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
                    View and manage your logo variations and guidelines.
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
                  
                  <Button size="sm" onClick={handleDownloadLogo}>
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
              
              <div>
                <h3 className="text-lg font-medium mb-4">Logo Spacing Guidelines</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Maintain adequate clear space around your logo to ensure visibility and impact.
                  The minimum clear space is equal to the height of the logo divided by 4.
                </p>
                
                <div className="flex justify-center">
                  {currentGuide.logos.square.length > 0 && (
                    <LogoWithSpacingGuidelines logo={currentGuide.logos.square[0]} />
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
