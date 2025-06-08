
import React, { useState, useRef, useEffect } from 'react';
import { LogoVariation } from '@/types';

interface Guideline {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
}

interface InteractiveLogoSpacingProps {
  logo: LogoVariation;
  shape?: 'square' | 'rounded' | 'circle';
}

export function InteractiveLogoSpacing({
  logo,
  shape = 'square'
}: InteractiveLogoSpacingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragGuideline, setDragGuideline] = useState<Guideline | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });
  
  const GRID_SIZE = 8;
  const SNAP_THRESHOLD = 5;
  const MAX_GUIDELINES = 20;

  const shapeClasses = {
    square: 'rounded-none',
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  };

  // Safety check for logo
  if (!logo || !logo.src) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg">
        <p className="text-muted-foreground">No logo available for spacing guidelines</p>
      </div>
    );
  }

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const snapToGrid = (position: number, containerDimension: number) => {
    const gridSnapped = Math.round(position / GRID_SIZE) * GRID_SIZE;
    
    if (Math.abs(position) < SNAP_THRESHOLD) return 0;
    if (Math.abs(position - containerDimension) < SNAP_THRESHOLD) return containerDimension;
    
    return gridSnapped;
  };

  const handleRulerClick = (event: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentGuidelines = guidelines.filter(g => g.type === type);
    if (currentGuidelines.length >= MAX_GUIDELINES) return;

    let position: number;
    if (type === 'horizontal') {
      position = event.clientY - rect.top;
      position = snapToGrid(position, containerSize.height);
    } else {
      position = event.clientX - rect.left;
      position = snapToGrid(position, containerSize.width);
    }

    const newGuideline: Guideline = {
      id: `${type}-${Date.now()}`,
      type,
      position
    };

    setGuidelines(prev => [...prev, newGuideline]);
  };

  const handleGuidelineMouseDown = (guideline: Guideline, event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setDragGuideline(guideline);

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let newPosition: number;

      if (guideline.type === 'horizontal') {
        newPosition = e.clientY - rect.top;
        newPosition = snapToGrid(newPosition, containerSize.height);
        newPosition = Math.max(0, Math.min(newPosition, containerSize.height));
      } else {
        newPosition = e.clientX - rect.left;
        newPosition = snapToGrid(newPosition, containerSize.width);
        newPosition = Math.max(0, Math.min(newPosition, containerSize.width));
      }

      setGuidelines(prev =>
        prev.map(g =>
          g.id === guideline.id ? { ...g, position: newPosition } : g
        )
      );
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragGuideline(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleGuidelineDoubleClick = (guideline: Guideline) => {
    setGuidelines(prev => prev.filter(g => g.id !== guideline.id));
  };

  const generateTicks = (dimension: number, isVertical: boolean = false) => {
    const ticks = [];
    const tickSpacing = 20;
    
    for (let i = 0; i <= dimension; i += tickSpacing) {
      ticks.push(
        <div
          key={i}
          className="absolute text-xs text-muted-foreground"
          style={{
            [isVertical ? 'top' : 'left']: `${i}px`,
            [isVertical ? 'left' : 'top']: '2px'
          }}
        >
          {i}
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="relative">
      <h3 className="text-lg font-medium mb-4">Logo Spacing Guidelines</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Drag from the top or left ruler to create spacing guidelines for your Brand Logo. 
        Lines will snap to the grid and edges of your logo.
      </p>
      
      <div className="relative inline-block">
        <div 
          className="absolute -top-6 left-6 bg-gray-100 border-b cursor-crosshair select-none"
          style={{ width: containerSize.width, height: '24px' }}
          onClick={(e) => handleRulerClick(e, 'vertical')}
        >
          {generateTicks(containerSize.width)}
        </div>

        <div 
          className="absolute -left-6 top-6 bg-gray-100 border-r cursor-crosshair select-none"
          style={{ width: '24px', height: containerSize.height }}
          onClick={(e) => handleRulerClick(e, 'horizontal')}
        >
          {generateTicks(containerSize.height, true)}
        </div>

        <div 
          ref={containerRef}
          className="relative border border-dashed border-gray-300 bg-white"
          style={{ width: '400px', height: '400px' }}
        >
          <div 
            className={`w-full h-full ${shapeClasses[shape]} flex items-center justify-center overflow-hidden`}
            style={{ backgroundColor: logo.background || '#ffffff' }}
          >
            <img 
              src={logo.src} 
              alt="Logo with spacing guidelines" 
              className="max-w-[75%] max-h-[75%] object-contain"
              onError={(e) => {
                console.error('Logo failed to load:', logo.src);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {guidelines.map((guideline) => (
            <div
              key={guideline.id}
              className="absolute cursor-move hover:opacity-75"
              style={{
                ...(guideline.type === 'horizontal' 
                  ? {
                      top: `${guideline.position}px`,
                      left: 0,
                      right: 0,
                      height: '2px',
                      borderTop: '2px dashed rgba(255, 0, 0, 0.6)'
                    }
                  : {
                      left: `${guideline.position}px`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      borderLeft: '2px dashed rgba(255, 0, 0, 0.6)'
                    }
                ),
                zIndex: 10
              }}
              onMouseDown={(e) => handleGuidelineMouseDown(guideline, e)}
              onDoubleClick={() => handleGuidelineDoubleClick(guideline)}
              title="Drag to move, double-click to remove"
            />
          ))}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Click on rulers to add guidelines</p>
          <p>• Drag guidelines to reposition</p>
          <p>• Double-click guidelines to remove</p>
          <p>• Guidelines snap to {GRID_SIZE}px grid and edges</p>
        </div>
      </div>
    </div>
  );
}
