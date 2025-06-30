
import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Help = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about using Brand Studio
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Learn the basics of creating your brand guide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Enter Your Brand Name</h3>
                <p className="text-sm text-muted-foreground">Start by entering your brand name in the input field on the main page.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Upload Your Logo</h3>
                <p className="text-sm text-muted-foreground">Go to the Logo tab and upload your brand logo. You can crop and adjust it as needed.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Define Your Colors</h3>
                <p className="text-sm text-muted-foreground">Add your primary and secondary brand colors in the Colors tab.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Set Typography</h3>
                <p className="text-sm text-muted-foreground">Choose fonts for headings, body text, and display text in the Typography tab.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">5. Export Your Guide</h3>
                <p className="text-sm text-muted-foreground">Once complete, use the Export tab to generate a PDF or shareable link.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>What you can do with Brand Studio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">🎨 Color Management</h3>
                <p className="text-sm text-muted-foreground">Add, edit, and organize your brand colors with custom names and hex codes.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📝 Typography System</h3>
                <p className="text-sm text-muted-foreground">Define font families, sizes, and styles for different text elements.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🖼️ Logo Variations</h3>
                <p className="text-sm text-muted-foreground">Upload and display different versions of your logo (square, rounded, etc.).</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📄 PDF Export</h3>
                <p className="text-sm text-muted-foreground">Generate professional PDF brand guides for sharing and printing.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🔗 Shareable Links</h3>
                <p className="text-sm text-muted-foreground">Create secure, time-limited links to share your brand guide online.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Issues</CardTitle>
              <CardDescription>Solutions to frequently encountered problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Logo not showing in PDF</h3>
                <p className="text-sm text-muted-foreground">Make sure your logo is uploaded and visible in the preview before exporting.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can't rename colors</h3>
                <p className="text-sm text-muted-foreground">Click the rename button and type in the dialog that appears. Press Enter to save.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shareable link expired</h3>
                <p className="text-sm text-muted-foreground">Shareable links expire after 72 hours. Generate a new one from the Export tab.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need More Help?</CardTitle>
              <CardDescription>Get in touch with our support</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you need additional assistance, feel free to reach out:
              </p>
              <a 
                href="https://www.linkedin.com/in/arpitsahay18" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Contact Arpit Sahay on LinkedIn
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Help;
