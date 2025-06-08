
import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Brand Guide Data</h3>
                <p className="text-sm text-muted-foreground">
                  We store your brand guide information locally in your browser's storage. This includes colors, typography settings, logos, and custom names you assign to elements.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Uploaded Files</h3>
                <p className="text-sm text-muted-foreground">
                  Logo images and other files you upload are processed locally in your browser and stored temporarily for the duration of your session.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Local Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your brand guide data is stored locally on your device using browser localStorage. This allows your work to persist between sessions without sending data to external servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Processing and Export</h3>
                <p className="text-sm text-muted-foreground">
                  All processing of your brand guides, including PDF generation and color calculations, happens locally in your browser.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Local Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Brand Studio processes all your data locally on your device. Your brand guides, logos, and design elements never leave your browser unless you explicitly export them.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Server Storage</h3>
                <p className="text-sm text-muted-foreground">
                  We do not store your brand guide data on our servers. All information remains on your local device.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  We use minimal essential cookies and localStorage to maintain your session and remember your preferences.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Analytics Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Brand Studio does not use analytics tracking, advertising cookies, or third-party tracking services.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Data Control</h3>
                <p className="text-sm text-muted-foreground">
                  Since all data is stored locally on your device, you have complete control over your information. You can clear your browser's localStorage at any time to remove all stored data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Export and Portability</h3>
                <p className="text-sm text-muted-foreground">
                  You can export your brand guides as JSON files at any time, giving you full portability of your data.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Font Loading</h3>
                <p className="text-sm text-muted-foreground">
                  Brand Studio may load fonts from Google Fonts for typography previews. This involves requests to Google's servers but does not include any personal data.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Other Third Parties</h3>
                <p className="text-sm text-muted-foreground">
                  We do not integrate with any other third-party services that would access your data.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We may update this privacy policy from time to time. Any changes will be reflected on this page with an updated date. Since Brand Studio operates entirely locally, most updates will not affect how your data is handled.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about this privacy policy or how Brand Studio handles your data, please contact us.
              </p>
              <div className="text-sm">
                <p><strong>Email:</strong> privacy@brandstudio.com</p>
                <p><strong>Created by:</strong> Arpit Sahay</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;
