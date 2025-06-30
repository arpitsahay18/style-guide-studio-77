import React from 'react';
import { MainLayout } from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const Privacy = () => {
  return <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            How we handle your data and protect your privacy
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Collection</CardTitle>
              <CardDescription>What information we collect and why</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Brand Guide Content</h3>
                <p className="text-sm text-muted-foreground">
                  We store your brand names, colors, typography settings, and uploaded logos to provide the brand guide service. 
                  This data is necessary for the functionality of the application.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Authentication Data</h3>
                <p className="text-sm text-muted-foreground">
                  When you sign in with Google, we receive your email address and profile information to identify your account 
                  and associate your brand guides with your profile.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  We may collect anonymous usage statistics to improve the service, but this data cannot be used to identify you personally.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Storage</CardTitle>
              <CardDescription>How and where your data is stored</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Cloud Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your brand guide data is stored securely in Firebase, Google's cloud database service. 
                  All data is encrypted in transit and at rest.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">File Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Uploaded logos and images are stored in Firebase Storage with secure access controls. 
                  Only you can access your uploaded files.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Local Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Some preferences and temporary data may be stored locally in your browser to improve your experience.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing</CardTitle>
              <CardDescription>How your data may be shared</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Shareable Links</h3>
                <p className="text-sm text-muted-foreground">
                  When you create a shareable link, the brand guide content is made accessible to anyone with that link. 
                  These links expire after 72 hours for security.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">No Third-Party Sharing</h3>
                <p className="text-sm text-muted-foreground">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, 
                  except as described in this policy.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Legal Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  We may disclose your information if required by law or to protect our rights, property, or safety.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
              <CardDescription>What you can do with your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Access and Control</h3>
                <p className="text-sm text-muted-foreground">
                  You can view, edit, and delete your brand guides at any time through the application interface.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Deletion</h3>
                <p className="text-sm text-muted-foreground">
                  You can request complete deletion of your account and associated data by contacting us.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  You can export your brand guides as PDF files at any time to maintain your own copies.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How to reach us about privacy concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <a href="https://www.linkedin.com/in/arpitsahay18" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Arpit Sahay on LinkedIn
              </a>
              <p className="text-xs text-muted-foreground mt-4">Last updated: June 2025</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>;
};
export default Privacy;