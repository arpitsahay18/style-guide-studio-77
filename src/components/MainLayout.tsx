import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { useNavigate } from 'react-router-dom';
import { BrandStudioLogo } from '@/components/BrandStudioLogo';
import { AuthButton } from '@/components/AuthButton';
import { useBrandGuide } from '@/context/BrandGuideContext';
import { useToast } from '@/hooks/use-toast';
interface MainLayoutProps {
  children: React.ReactNode;
  standalone?: boolean;
}
export function MainLayout({
  children,
  standalone = false
}: MainLayoutProps) {
  const navigate = !standalone ? useNavigate() : null;
  const {
    currentGuide
  } = useBrandGuide();
  const {
    toast
  } = useToast();
  const handleNavigation = (path: string) => {
    if (navigate) {
      if (!currentGuide.name.trim() && path !== '/') {
        toast({
          variant: "destructive",
          title: "Brand name missing",
          description: "Please enter a brand name before proceeding."
        });
        return;
      }
      navigate(path);
    }
  };
  const handleHeaderClick = () => {
    if (navigate) {
      navigate('/');
    } else {
      window.location.href = '/';
    }
  };
  const content = <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between bg-[eae4d8]">
          <BrandStudioLogo onClick={handleHeaderClick} className="cursor-pointer" />
          
          <div className="flex items-center gap-4">
            <AuthButton />
          </div>
        </div>
      </header>
      
      <nav className="bg-muted/50 border-b">
        <div className="container mx-auto px-4">
          
        </div>
      </nav>
      
      <main className="flex-1 bg-background py-6">
        {children}
      </main>
      
      <footer className="bg-muted py-6 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                Create comprehensive brand guidelines with Brand Studio
              </p>
            </div>
            <div className="flex gap-4">
              <a href="/help" className="text-sm text-muted-foreground hover:text-foreground">Help</a>
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="https://www.linkedin.com/in/arpitsahay18" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                Made by Arpit Sahay
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      <Toaster />
    </div>;
  return content;
}