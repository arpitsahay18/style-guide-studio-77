
import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
}

// Popular fonts to use as fallback if API fails
const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
  'Raleway', 'Oswald', 'Merriweather', 'Playfair Display',
  'Source Sans Pro', 'Poppins', 'Roboto Condensed', 'Ubuntu',
  'Nunito', 'Work Sans', 'Rubik', 'Quicksand', 'Fira Sans',
  'PT Sans', 'Mukta', 'Noto Sans', 'Titillium Web', 'Heebo'
];

export function FontSelector({ value, onChange, placeholder = "Select font..." }: FontSelectorProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const apiLoaded = useRef(false);
  
  useEffect(() => {
    if (apiLoaded.current) return;
    
    apiLoaded.current = true;
    setLoading(true);
    
    // First, initialize with popular fonts in case API fails
    setFonts(POPULAR_FONTS);
    setFilteredFonts(POPULAR_FONTS);
    
    // Set up preloading of popular fonts for better UX even before API loads
    POPULAR_FONTS.slice(0, 8).forEach(font => {
      const fontFamily = font.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setLoadedFonts(prev => new Set(prev).add(font));
    });
    
    // Then try to fetch Google Fonts using reliable free API
    fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBwIX97bVWr3-6AIUvGkcNnmFgirefZ6Sw&sort=popularity')
      .then(response => {
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.items && Array.isArray(data.items)) {
          const fontNames = data.items.map((font: any) => font.family);
          setFonts(fontNames);
          setFilteredFonts(fontNames);
          console.log(`Loaded ${fontNames.length} fonts from Google Fonts API`);
          
          // Only preload the first 15 most popular fonts to avoid excessive network requests
          fontNames.slice(0, 15).forEach(font => {
            if (!loadedFonts.has(font)) {
              const fontFamily = font.replace(/\s+/g, '+');
              const link = document.createElement('link');
              link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;700&display=swap`;
              link.rel = 'stylesheet';
              document.head.appendChild(link);
              setLoadedFonts(prev => new Set(prev).add(font));
            }
          });
        } else {
          throw new Error('Invalid response format');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching Google Fonts:', error);
        toast({
          title: "Using curated font selection",
          description: "Could not load Google Fonts API. Using our curated selection instead.",
          duration: 5000,
        });
        
        // Already using fallback fonts
        setLoading(false);
      });
  }, [toast]);

  // Filter fonts based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = fonts.filter(font => 
        font.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFonts(filtered);
    } else {
      setFilteredFonts(fonts);
    }
  }, [searchQuery, fonts]);

  // Load font stylesheet when it's selected
  useEffect(() => {
    if (value && !loadedFonts.has(value) && value !== 'inherit') {
      const fontFamily = value.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      setLoadedFonts(prev => new Set(prev).add(value));
    }
  }, [value, loadedFonts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFontSelect = (font: string) => {
    onChange(font);
    
    // Preload the font if it's not already loaded
    if (!loadedFonts.has(font) && font !== 'inherit') {
      const fontFamily = font.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      setLoadedFonts(prev => new Set(prev).add(font));
    }
  };

  return (
    <Select value={value} onValueChange={handleFontSelect}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="font-selector-content">
        <div className="p-2 sticky top-0 bg-background z-10 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search fonts..." 
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 mb-1"
            />
          </div>
        </div>
        
        <ScrollArea className="h-72 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFonts.length > 0 ? (
            filteredFonts.map(font => (
              <SelectItem 
                key={font} 
                value={font}
                style={{ fontFamily: font }}
                className="font-selector-item"
              >
                <span className="font-preview" style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No fonts found
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 text-xs text-center text-muted-foreground border-t mt-auto">
          <div className="flex items-center justify-center">
            <span className="mr-1">Powered by</span>
            <img 
              src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" 
              alt="Google" 
              className="h-3 inline-block mr-1" 
            />
            <span>Fonts</span>
          </div>
        </div>
      </SelectContent>
    </Select>
  );
}
