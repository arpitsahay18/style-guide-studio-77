
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: string;
}

export function ShareableLinkModal({ open, onOpenChange, link }: ShareableLinkModalProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: "Copied!",
        description: "Link copied to your clipboard.",
      });
    } catch (error) {
      // Fallback method for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast({
            title: "Copied!",
            description: "Link copied to your clipboard.",
          });
        } else {
          throw new Error('Copy command was unsuccessful');
        }
      } catch (fallbackError) {
        console.error('Copy failed:', fallbackError);
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Could not copy link to clipboard.",
        });
      }
    }
  };

  const handleOpenLink = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[90vw] sm:max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Your shareable link is ready!</DialogTitle>
          <DialogDescription>
            Your link has been copied to your clipboard and will expire in 72 hours.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background overflow-hidden">
                <span className="truncate text-muted-foreground text-xs sm:text-sm whitespace-nowrap overflow-x-auto">
                  {link}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleCopyLink}
              className="flex-1"
              variant="default"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
            <Button 
              onClick={handleOpenLink}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
