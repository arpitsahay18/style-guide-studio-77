
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            👋 Welcome to Brand Studio
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="aspect-video w-full">
            <iframe 
              src="https://player.vimeo.com/video/853228097?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479" 
              className="w-full h-full rounded-lg"
              frameBorder="0" 
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
              title="Brand Studio Tutorial"
            />
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={handleGetStarted} className="w-full" size="lg">
            Start Generating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
