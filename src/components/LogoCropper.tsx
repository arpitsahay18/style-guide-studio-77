
import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { ZoomIn, ZoomOut, Crop as CropIcon } from 'lucide-react';

interface LogoCropperProps {
  imageUrl: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop,
  scale = 1,
  rotate = 0,
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const pixelRatio = window.devicePixelRatio;
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const centerX = image.naturalWidth / 2;
  const centerY = image.naturalHeight / 2;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotate * (Math.PI / 180));
  ctx.scale(scale, scale);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
  );
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Canvas is empty');
      }
      resolve(URL.createObjectURL(blob));
    }, 'image/png');
  });
}

export function LogoCropper({ imageUrl, onCrop, onCancel }: LogoCropperProps) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const handleComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageUrl = await getCroppedImg(
          imgRef.current,
          completedCrop,
          scale
        );
        onCrop(croppedImageUrl);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Crop Your Logo</h3>
        <p className="text-sm text-muted-foreground">
          Position your logo within the square crop frame. You can drag to position and use the zoom slider for better fit.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1}
          className="max-h-[500px] mx-auto border rounded-lg overflow-hidden"
        >
          <img
            ref={imgRef}
            src={imageUrl}
            style={{ transform: `scale(${scale})` }}
            alt="Logo to crop"
          />
        </ReactCrop>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Zoom</label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setScale((prev) => Math.min(3, prev + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Slider
            value={[scale * 100]}
            onValueChange={(values) => setScale(values[0] / 100)}
            min={50}
            max={300}
            step={10}
            className="my-4"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleComplete}>
            <CropIcon className="h-4 w-4 mr-2" />
            Crop Logo
          </Button>
        </div>
      </div>
    </div>
  );
}
