
import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Help = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brand Studio
          </Button>
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">Get help with using Brand Studio to create your brand guidelines</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Creating Your First Brand Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Start by uploading your logo, then add your primary and secondary colors. Define your typography styles to complete your brand guide.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Required Elements</h3>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>At least one primary color</li>
                  <li>At least one secondary color</li>
                  <li>A logo upload</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working with Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Adding Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Use the color picker or enter hex codes to add colors to your palette. Each color automatically generates tints, shades, and contrast ratios.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Naming Colors</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any color name to customize it. Color names are saved and will appear in your exported brand guide.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Font Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Organize your typography into Display (for headlines), Heading (for sections), and Body (for content) styles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Adding Custom Styles</h3>
                <p className="text-sm text-muted-foreground">
                  Use the "Add Style" button to add predefined styles or create custom typography styles with your own specifications.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Editing Style Names</h3>
                <p className="text-sm text-muted-foreground">
                  Click on any typography style name in the accordion header to rename it. Names are limited to 20 characters.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Logo Variations</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your main logo and automatically generate square, rounded, and circular variations with different background colors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Spacing Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  Use the interactive ruler tool to create spacing guidelines for your logo. Drag from the rulers to add guidelines, and double-click to remove them.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exporting Your Brand Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Preview Mode</h3>
                <p className="text-sm text-muted-foreground">
                  View your complete brand guide in presentation format before exporting. This shows exactly how your guide will look when shared.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Export Options</h3>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>PDF export for presentations and sharing</li>
                  <li>JSON export for technical integration</li>
                  <li>Logo pack with usage guidelines</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Common Issues</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li><strong>Preview button not showing:</strong> Ensure you have at least one primary color, one secondary color, and a logo uploaded.</li>
                  <li><strong>Color names resetting:</strong> Make sure to press Enter or click outside the input field to save color names.</li>
                  <li><strong>Typography changes not visible:</strong> Check that letter spacing values include units (e.g., "0em" not just "0").</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Need additional help? Feel free to reach out for support with any questions about Brand Studio.
              </p>
              <div className="text-sm">
                <p><strong>Email:</strong> support@brandstudio.com</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Help;
