
import React from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BrandGuideWarningProps {
  onClose?: () => void;
}

export function BrandGuideWarning({ onClose }: BrandGuideWarningProps) {
  const { currentGuide } = useBrandGuide();

  // Check if primary colors are missing
  const hasPrimaryColors = currentGuide.colors.primary.length > 0;
  
  // Check if secondary colors are missing
  const hasSecondaryColors = currentGuide.colors.secondary.length > 0;
  
  // Check if logo is missing
  const hasLogo = Boolean(currentGuide.logos.original);
  
  // If all requirements are met, don't show the warning
  if (hasPrimaryColors && hasSecondaryColors && hasLogo) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Brand Guide Incomplete</AlertTitle>
      <AlertDescription className="mt-2">
        <p>Your brand guide is missing important elements:</p>
        <ul className="list-disc list-inside mt-2">
          {!hasPrimaryColors && (
            <li>Add at least one primary color</li>
          )}
          {!hasSecondaryColors && (
            <li>Add at least one secondary color</li>
          )}
          {!hasLogo && (
            <li>Upload a logo</li>
          )}
        </ul>
        <p className="mt-2">Please complete these sections before exporting or viewing your guide.</p>
      </AlertDescription>
    </Alert>
  );
}
