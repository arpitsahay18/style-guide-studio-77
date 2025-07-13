import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface StagedProgressBarProps {
  isActive: boolean;
  onComplete: () => void;
  duration?: number;
}

export function StagedProgressBar({ 
  isActive, 
  onComplete, 
  duration = 8000 
}: StagedProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setProgress(0);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    const runProgressSequence = async () => {
      // Stage 1: Quick jump to 60%
      setProgress(60);
      
      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, duration * 0.1);
      });
      
      // Stage 2: Pause, then jump to 85%
      setProgress(85);
      
      await new Promise(resolve => {
        timeoutId = setTimeout(resolve, duration * 0.15);
      });
      
      // Stage 3: Slowly tick up from 85% to 100%
      const finalStage = duration * 0.75;
      const steps = 15;
      const stepDuration = finalStage / steps;
      
      for (let i = 0; i < steps; i++) {
        await new Promise(resolve => {
          timeoutId = setTimeout(resolve, stepDuration);
        });
        setProgress(85 + (i + 1));
      }
      
      // Complete
      onComplete();
    };

    runProgressSequence();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <div className="w-full space-y-2">
      <Progress value={progress} className="w-full" />
      <div className="text-sm text-muted-foreground text-center">
        Generating PDF... {progress}%
      </div>
    </div>
  );
}