import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  suffix: string;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  placeholder?: string;
}

export function NumericInput({
  value,
  onChange,
  suffix,
  step = 1,
  min,
  max,
  className,
  id,
  placeholder
}: NumericInputProps) {
  const [numericValue, setNumericValue] = useState<number>(0);

  useEffect(() => {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    setNumericValue(isNaN(parsed) ? 0 : parsed);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    
    if (cleanValue === '' || cleanValue === '-') {
      setNumericValue(0);
      onChange(`0${suffix}`);
    } else if (!isNaN(parsed)) {
      const clampedValue = min !== undefined ? Math.max(min, parsed) : parsed;
      const finalValue = max !== undefined ? Math.min(max, clampedValue) : clampedValue;
      setNumericValue(finalValue);
      onChange(`${finalValue}${suffix}`);
    }
  };

  const handleStep = (direction: 'up' | 'down') => {
    const newValue = direction === 'up' ? numericValue + step : numericValue - step;
    const clampedValue = min !== undefined ? Math.max(min, newValue) : newValue;
    const finalValue = max !== undefined ? Math.min(max, clampedValue) : clampedValue;
    
    setNumericValue(finalValue);
    onChange(`${finalValue}${suffix}`);
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Input
        id={id}
        type="text"
        value={numericValue.toString()}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="pr-16"
      />
      <div className="absolute right-1 flex items-center">
        <div className="flex flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => handleStep('up')}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => handleStep('down')}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground ml-1 min-w-[20px]">
          {suffix}
        </span>
      </div>
    </div>
  );
}