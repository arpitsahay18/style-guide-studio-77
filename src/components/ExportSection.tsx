
import React, { useState } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Share, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandGuideWarning } from './BrandGuideWarning';
import { useToast } from '@/hooks/use-toast';
import { useShareableLinks } from '@/hooks/useShareableLinks';
import { useAuth } from '@/hooks/useAuth';

export function ExportSection() {
  const navigate = useNavigate();
  const { currentGuide, activeSection, colorNames, typographyNames } = useBrandGuide();
  const { generateShareableLink } = useShareableLinks();
  const { user } = useAuth();
  const { toast } = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  const isGuideComplete = 
    currentGuide.colors.primary.length > 0 && 
    currentGuide.colors.secondary.length > 0 && 
    Boolean(currentGuide.logos.original);
  
  const handleViewGuide = () => {
    navigate('/preview');
  };
  
  const handleGenerateShareableLink = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to generate shareable links.",
      });
      return;
    }

    if (!isGuideComplete) {
      toast({
        variant: "destructive",
        title: "Incomplete brand guide",
        description: "Please complete your brand guide first.",
      });
      return;
    }

    setIsGeneratingLink(true);
    try {
      const link = await generateShareableLink(currentGuide);
      if (link) {
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      }
    } finally {
      setIsGeneratingLink(false);
    }
  };
  
  const showWarning = activeSection === 'export' && !isGuideComplete;
  
  return (
    <div className="grid gap-6">
      {showWarning && <BrandGuideWarning />}
      
      <Card>
        <CardHeader>
          <CardTitle>View Your Brand Guide</CardTitle>
          <CardDescription>
            {isGuideComplete 
              ? "See how your brand guide looks in a complete presentation format" 
              : "Add at least one primary color, one secondary color, and a logo to view your brand guide"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {isGuideComplete 
              ? "This will take you to a comprehensive view of your brand guide, perfect for presentations or sharing with your team."
              : "Complete your brand guide by adding the missing elements to unlock the preview."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleViewGuide} 
            className="w-full sm:w-auto"
            disabled={!isGuideComplete}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isGuideComplete ? "View Complete Guide" : "Complete Guide First"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Shareable Link</CardTitle>
          <CardDescription>
            {!user 
              ? "Sign in to create shareable links for your brand guide"
              : isGuideComplete 
                ? "Create a temporary link to share your brand guide with others (valid for 72 hours)"
                : "Complete your brand guide to generate shareable links"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {!user 
              ? "Sign in with Google to unlock the ability to generate and manage shareable links."
              : isGuideComplete 
                ? "Generate a unique link that allows others to view your brand guide. Links expire after 72 hours for security."
                : "Once you complete your brand guide, you'll be able to create shareable links."
            }
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateShareableLink}
            className="w-full sm:w-auto"
            disabled={!user || !isGuideComplete || isGeneratingLink}
          >
            {linkCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Share className="mr-2 h-4 w-4" />
            )}
            {isGeneratingLink 
              ? "Generating..." 
              : linkCopied 
                ? "Link Copied!" 
                : !user 
                  ? "Sign in Required"
                  : !isGuideComplete 
                    ? "Complete Guide First" 
                    : "Generate Shareable Link"
            }
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
