
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ProgressToastProps {
  message: string;
  progress: number;
  onComplete?: () => void;
}

export function showProgressToast(message: string, duration: number = 5000) {
  let progress = 0;
  const interval = 100;
  const increment = 100 / (duration / interval);

  const toastId = toast(
    <div className="flex flex-col space-y-2">
      <p className="text-sm font-medium">{message}</p>
      <Progress value={progress} className="w-full" />
      <p className="text-xs text-muted-foreground">This may take a few moments...</p>
    </div>,
    {
      duration: duration + 500,
      dismissible: false,
    }
  );

  const progressInterval = setInterval(() => {
    progress += increment;
    if (progress >= 100) {
      clearInterval(progressInterval);
      toast.dismiss(toastId);
      return;
    }
    
    // Update the toast with new progress
    toast(
      <div className="flex flex-col space-y-2">
        <p className="text-sm font-medium">{message}</p>
        <Progress value={progress} className="w-full" />
        <p className="text-xs text-muted-foreground">This may take a few moments...</p>
      </div>,
      {
        id: toastId,
        duration: duration + 500,
        dismissible: false,
      }
    );
  }, interval);

  return () => {
    clearInterval(progressInterval);
    toast.dismiss(toastId);
  };
}
