
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from 'lucide-react';

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  placeholder?: string;
}

export function FontSelector({ value, onChange, placeholder = "Select font..." }: FontSelectorProps) {
  const [fonts, setFonts] = useState<string[]>([]);
  const [filteredFonts, setFilteredFonts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch Google Fonts
    fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAOES8EmKhuJEPMXTVJ9WQvCyOJ3NObCUQ')
      .then(response => response.json())
      .then(data => {
        const fontNames = data.items.map((font: any) => font.family);
        setFonts(fontNames);
        setFilteredFonts(fontNames);
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
  }, []);

  // Filter fonts based on search query
  useEffect(() => {
    if (searchQuery) {
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
      <SelectContent>
        <div className="p-2 sticky top-0 bg-background z-10 border-b">
          <Input 
            placeholder="Search fonts..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="mb-1"
          />
        </div>
        <ScrollArea className="h-72">
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
      </SelectContent>
    </Select>
  );
}
