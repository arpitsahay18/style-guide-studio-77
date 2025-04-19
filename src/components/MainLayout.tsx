
import React from 'react';
import { BrandGuideProvider } from '@/context/BrandGuideContext';
import { Toaster } from "@/components/ui/toaster";
import {
  LayoutGrid,
  Type,
  Palette,
  Image,
  FileDown,
  Save,
  Plus,
  User,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  
  return (
    <BrandGuideProvider>
      <div className="flex flex-col min-h-screen">
        <header className="border-b bg-background">
          <div className="container mx-auto py-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-6 w-6" />
              <span className="font-bold text-xl">Brand Studio</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="#"><User className="h-4 w-4 mr-2" /> Account</a>
              </Button>
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" /> Sign In
              </Button>
            </div>
          </div>
        </header>
        
        <nav className="bg-muted/50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto">
              <Button variant="ghost" className="rounded-none py-6 px-4 h-auto">
                <Type className="h-4 w-4 mr-2" /> Typography
              </Button>
              <Button variant="ghost" className="rounded-none py-6 px-4 h-auto">
                <Palette className="h-4 w-4 mr-2" /> Colors
              </Button>
              <Button variant="ghost" className="rounded-none py-6 px-4 h-auto">
                <Image className="h-4 w-4 mr-2" /> Logo
              </Button>
              <Button variant="ghost" className="rounded-none py-6 px-4 h-auto">
                <FileDown className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>
        </nav>
        
        <main className="flex-1 bg-background py-6">
          {children}
        </main>
        
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button className="rounded-full w-12 h-12 shadow-lg">
            <Save className="h-5 w-5" />
          </Button>
          <Button className="rounded-full w-12 h-12 shadow-lg" variant="outline">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        <footer className="bg-muted py-6 border-t">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">
                  Create comprehensive brand guidelines with Brand Studio
                </p>
              </div>
              <div className="flex gap-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Help</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              </div>
            </div>
          </div>
        </footer>
        
        <Toaster />
      </div>
    </BrandGuideProvider>
  );
}
