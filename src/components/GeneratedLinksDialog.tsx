
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useShareableLinks } from '@/hooks/useShareableLinks';
import { X, Copy } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GeneratedLinksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GeneratedLinksDialog: React.FC<GeneratedLinksDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { links, loading, deleteLink, copyLinkToClipboard } = useShareableLinks();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Generated Links</DialogTitle>
          <DialogDescription>
            Your shareable brand guide links (valid for 72 hours)
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto"></div>
              </div>
            ) : links.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No links generated yet
              </div>
            ) : (
              links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{link.brandGuideName}</p>
                    <p className="text-sm text-muted-foreground">
                      Created: {formatDate(link.createdAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires: {formatDate(link.expiresAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyLinkToClipboard(link.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLink(link.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
