import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, Search } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
  label: string;
  availableFonts: { name: string; category: string }[];
}

export function ImprovedFontSelector({ value, onChange, label, availableFonts }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter fonts based on search
  const filteredFonts = availableFonts.filter(font =>
    font.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Keep input focused when dropdown is open
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleFontSelect = (fontName: string) => {
    onChange(fontName);
    setOpen(false);
    setSearchValue('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="truncate">
              {value || "Select font..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                ref={inputRef}
                placeholder="Search fonts..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-auto">
              {filteredFonts.length === 0 && (
                <div className="py-6 text-center text-sm">No fonts found.</div>
              )}
              <CommandGroup>
                {filteredFonts.map((font) => (
                  <CommandItem
                    key={font.name}
                    onSelect={() => handleFontSelect(font.name)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span style={{ fontFamily: font.name }}>
                        {font.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {font.category}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
