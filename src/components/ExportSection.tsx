
import React, { useState } from 'react';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  FileDown,
  FileJson,
  FileCode,
  Link,
  Check,
  Copy,
  Share,
  Mail
} from 'lucide-react';
import { generateTypographyCss } from '@/utils/typographyUtils';

export function ExportSection() {
  const { currentGuide, exportGuide } = useBrandGuide();
  const [shareUrl, setShareUrl] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareOptions, setShareOptions] = useState({
    viewOnly: true,
    expiresIn: '30'
  });
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  
  // Generate a complete CSS stylesheet from the brand guide
  const generateCSS = () => {
    let css = `/* ${currentGuide.name} Brand Guide CSS */\n\n`;
    
    // Root variables for colors
    css += ':root {\n';
    
    // Primary colors
    currentGuide.colors.primary.forEach((color, index) => {
      css += `  --color-primary-${index + 1}: ${color.hex};\n`;
    });
    
    // Secondary colors
    currentGuide.colors.secondary.forEach((color, index) => {
      css += `  --color-secondary-${index + 1}: ${color.hex};\n`;
    });
    
    // Neutral colors
    currentGuide.colors.neutral.forEach((color, index) => {
      css += `  --color-neutral-${index + 1}: ${color.hex};\n`;
    });
    
    css += '}\n\n';
    
    // Typography styles
    css += '/* Display Typography */\n';
    Object.entries(currentGuide.typography.display).forEach(([key, style]) => {
      css += `.display-${key} {\n${generateTypographyCss(style)}}\n\n`;
    });
    
    css += '/* Heading Typography */\n';
    Object.entries(currentGuide.typography.heading).forEach(([key, style]) => {
      css += `.heading-${key} {\n${generateTypographyCss(style)}}\n\n`;
    });
    
    css += '/* Body Typography */\n';
    Object.entries(currentGuide.typography.body).forEach(([key, style]) => {
      if (!key.includes('Light') && !key.includes('Medium')) {
        css += `.body-${key} {\n${generateTypographyCss(style)}}\n\n`;
      }
    });
    
    return css;
  };
  
  // Generate a sharable link (mock function)
  const generateShareableLink = () => {
    setIsGeneratingLink(true);
    
    // Mock API call delay
    setTimeout(() => {
      // In a real app, this would make an API call to create a shareable link
      const mockUrl = `https://brand-studio.example.com/share/${currentGuide.id}?expires=${shareOptions.expiresIn}&view=${shareOptions.viewOnly ? 'only' : 'edit'}`;
      setShareUrl(mockUrl);
      setIsGeneratingLink(false);
    }, 1500);
  };
  
  // Copy link to clipboard
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Mock email sharing function
  const shareViaEmail = () => {
    // In a real app, this would send an API request to share via email
    console.log(`Shared guide with ${shareEmail}`);
    setShareEmail('');
    alert(`Brand guide has been shared with ${shareEmail}`);
  };
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Export Brand Guide</CardTitle>
          <CardDescription>
            Export your brand guide in different formats or share it with your team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Download Formats</CardTitle>
                <CardDescription>
                  Export your brand guide in different file formats.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => exportGuide('pdf')}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  onClick={() => exportGuide('json')}
                  variant="outline"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  onClick={() => {
                    const css = generateCSS();
                    const blob = new Blob([css], { type: 'text/css' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${currentGuide.name.replace(/\s+/g, '-').toLowerCase()}-styles.css`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  variant="outline"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Export as CSS Variables
                </Button>
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground">
                    The PDF export includes all typography, colors, and logo guidelines in a presentation-ready format.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Share Brand Guide</CardTitle>
                <CardDescription>
                  Share your brand guide with team members or clients.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    onClick={generateShareableLink}
                    disabled={isGeneratingLink}
                  >
                    <Link className="h-4 w-4 mr-2" />
                    {isGeneratingLink ? 'Generating Link...' : 'Generate Shareable Link'}
                  </Button>
                  
                  {shareUrl && (
                    <div className="flex gap-2">
                      <Input value={shareUrl} readOnly className="text-xs" />
                      <Button 
                        size="icon" 
                        variant="outline" 
                        onClick={copyLinkToClipboard}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="view-only">View-only access</Label>
                    <Switch 
                      id="view-only" 
                      checked={shareOptions.viewOnly}
                      onCheckedChange={(checked) => setShareOptions(prev => ({ ...prev, viewOnly: checked }))}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="expires">Link expires in (days)</Label>
                    <Input 
                      id="expires" 
                      type="number" 
                      value={shareOptions.expiresIn}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, expiresIn: e.target.value }))}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-2">Share via Email</h4>
                  <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="colleague@example.com"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Button 
                      size="icon" 
                      onClick={shareViaEmail}
                      disabled={!shareEmail.includes('@')}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>CSS Preview</CardTitle>
              <CardDescription>
                Preview the generated CSS variables and styles for your brand guide.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-muted rounded-md overflow-auto max-h-80 text-xs font-mono">
                {generateCSS()}
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
