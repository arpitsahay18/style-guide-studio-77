
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareableLinkPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: string;
  onCopy: () => void;
}

export const ShareableLinkPopup: React.FC<ShareableLinkPopupProps> = ({
  open,
  onOpenChange,
  link,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Your link is ready!
          </DialogTitle>
          <DialogDescription>
            Share this link with anyone to give them read-only access to your brand guide. 
            This link will expire in 72 hours.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              readOnly
              value={link}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md"
            />
            <Button
              onClick={handleCopy}
              size="sm"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            This link will be accessible to anyone with the URL and will expire automatically after 72 hours.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
