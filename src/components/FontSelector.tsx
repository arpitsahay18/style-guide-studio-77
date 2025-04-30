
import React, { useState, useEffect, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from 'lucide-react';

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
}

// API key for Google Fonts
const GOOGLE_FONTS_API_KEY = 'AIzaSyAOES8EmKhuJEPMXTVJ9WQvCyOJ3NObCUQ';
const GOOGLE_FONTS_API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`;

export function FontSelector({ value, onChange, placeholder = "Select font..." }: FontSelectorProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const apiLoaded = useRef(false);

  // Function to load and cache Google Fonts
  const loadGoogleFont = (fontFamily: string) => {
    if (!fontFamily || fontFamily === 'inherit' || loadedFonts.has(fontFamily)) {
      return;
    }
    
    const formattedFontFamily = fontFamily.replace(/\s+/g, '+');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    setLoadedFonts(prev => new Set(prev).add(fontFamily));
    console.log(`Loaded font: ${fontFamily}`);
  };

  // Fetch fonts from Google Fonts API
  useEffect(() => {
    if (apiLoaded.current) return;
    
    apiLoaded.current = true;
    setLoading(true);
    
    fetch(GOOGLE_FONTS_API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Google Fonts API responded with status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.items && Array.isArray(data.items)) {
          const fontNames = data.items.map((font: any) => font.family);
          setFonts(fontNames);
          setFilteredFonts(fontNames);
          console.log(`Successfully loaded ${fontNames.length} fonts from Google Fonts API`);
          
          // Preload the first 10 popular fonts
          fontNames.slice(0, 10).forEach(fontFamily => loadGoogleFont(fontFamily));
          
          // Always load the current selected font if it exists
          if (value) loadGoogleFont(value);
        } else {
          throw new Error('Invalid response format from Google Fonts API');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching Google Fonts:', error);
        // Fallback to a limited set of fonts if API fails
        const fallbackFonts = [
          'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
          'Raleway', 'Oswald', 'Merriweather', 'Playfair Display',
          'Source Sans Pro', 'Poppins', 'Roboto Condensed', 'Ubuntu'
        ];
        setFonts(fallbackFonts);
        setFilteredFonts(fallbackFonts);
        setLoading(false);
      });
  }, [value]);

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

  // Load font when it's selected
  useEffect(() => {
    if (value) {
      loadGoogleFont(value);
    }
  }, [value]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFontSelect = (font: string) => {
    onChange(font);
    loadGoogleFont(font);
  };

  // Dynamically load another batch of fonts when scrolling near the end
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 200;
    
    if (nearBottom && filteredFonts.length > 0) {
      // Find index of last visible font
      const lastVisibleFont = filteredFonts[Math.min(filteredFonts.length - 1, 30)];
      if (lastVisibleFont) {
        // Load the next batch of fonts
        const lastIndex = fonts.indexOf(lastVisibleFont);
        const nextBatch = fonts.slice(lastIndex + 1, lastIndex + 11);
        nextBatch.forEach(loadGoogleFont);
      }
    }
  };

  return (
    <Select value={value} onValueChange={handleFontSelect}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="font-selector-content relative">
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
        
        <ScrollArea className="h-72 overflow-y-auto" onScroll={handleScroll}>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFonts.length > 0 ? (
            filteredFonts.map(font => (
              <SelectItem 
                key={font} 
                value={font}
              >
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No fonts found
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 text-xs text-center text-muted-foreground border-t bg-background sticky bottom-0">
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
