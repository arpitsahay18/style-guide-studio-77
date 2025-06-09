
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetStarted: () => void;
}

export function WelcomeDialog({ open, onOpenChange, onGetStarted }: WelcomeDialogProps) {
  const handleGetStarted = () => {
    storage.markWelcomeSeen();
    onGetStarted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex justify-center mb-4">
          <span className="text-4xl">👋</span>
        </div>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Welcome to Brand Studio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Hello 👋 My name is Arpit Sahay and I made this website because I was lazy enough to not do this myself. 
            It would be a lie if I say I built this website with intense blood and sweat <em>the truth is I often procastinated just like all designers</em>.
          </p>
          <p>
            Nevertheless, I have put in special love and care while building this website. 
            I am planning to add many more features to this as I move forward, so if you have any suggestions please let me know <a 
              href="https://www.linkedin.com/in/arpitsahay18" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >here</a>.
          </p>
        </div>
        <DialogFooter className="mt-6">
          <Button onClick={handleGetStarted} className="w-full">
            Start Generating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
