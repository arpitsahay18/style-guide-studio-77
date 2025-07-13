
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
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.loom.com/embed/3f93bc8a9fe24c828edbbc411be7df77?sid=14aa0740-64a2-4b12-a631-2d7a923d8283"
                frameBorder="0"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                title="Brand Studio Tutorial"
              />
            </div>
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
