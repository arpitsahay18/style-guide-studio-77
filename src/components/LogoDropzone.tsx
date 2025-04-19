
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle } from 'lucide-react';

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

interface LogoDropzoneProps {
  onUpload: (file: File) => void;
}

export function LogoDropzone({ onUpload }: LogoDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert('Invalid file type. Please upload PNG, JPG, or SVG files only.');
        return;
      }
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 transition-colors text-center ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : isDragReject
          ? 'border-destructive bg-destructive/5'
          : 'border-border hover:border-primary/50 hover:bg-accent/10'
      }`}
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
      
      <input {...getInputProps()} />
    </div>
  );
}
