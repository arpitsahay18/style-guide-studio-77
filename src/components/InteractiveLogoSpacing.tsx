import React, { useState, useRef, useEffect } from 'react';
import { LogoVariation } from '@/types';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { useBrandGuide } from '@/context/BrandGuideContext';

interface Guideline {
  id: string;
  type: 'horizontal' | 'vertical';
  position: number;
  name: string;
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
  const { logoGuidelines, setLogoGuidelines } = useBrandGuide();
  
  const shapeKey = `${shape}-logo`;
  const [guidelines, setGuidelines] = useState<Guideline[]>(
    logoGuidelines[shapeKey] || []
  );
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragGuideline, setDragGuideline] = useState<Guideline | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });
  const [isCreatingGuideline, setIsCreatingGuideline] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  const GRID_SIZE = 4;
  const SNAP_THRESHOLD = 3;
  const MAX_GUIDELINES = 20;

  const shapeClasses = {
    square: 'rounded-none',
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  };

  useEffect(() => {
    const updatedLogoGuidelines = {
      ...logoGuidelines,
      [shapeKey]: guidelines
    };
    setLogoGuidelines(updatedLogoGuidelines);
  }, [guidelines, shapeKey]);

  useEffect(() => {
    setGuidelines(logoGuidelines[shapeKey] || []);
  }, [shapeKey, logoGuidelines]);

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

  const generateGuidlineName = (type: 'horizontal' | 'vertical') => {
    const existingNames = guidelines
      .filter(g => g.type === type)
      .map(g => g.name)
      .sort();
    
    const prefix = type === 'horizontal' ? 'Y' : 'X';
    let counter = 1;
    
    while (existingNames.includes(`${prefix}${counter}`)) {
      counter++;
    }
    
    return `${prefix}${counter}`;
  };

  const handleRulerMouseDown = (event: React.MouseEvent, type: 'horizontal' | 'vertical') => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentGuidelines = guidelines.filter(g => g.type === type);
    if (currentGuidelines.length >= MAX_GUIDELINES) return;

    setIsCreatingGuideline(true);
    setDragStartPos({ x: event.clientX, y: event.clientY });

    const handleMouseMove = (e: MouseEvent) => {
      let position: number;
      if (type === 'horizontal') {
        position = e.clientY - rect.top;
        position = snapToGrid(position, containerSize.height);
        position = Math.max(0, Math.min(position, containerSize.height));
      } else {
        position = e.clientX - rect.left;
        position = snapToGrid(position, containerSize.width);
        position = Math.max(0, Math.min(position, containerSize.width));
      }

      const dragDistance = Math.abs(e.clientX - dragStartPos.x) + Math.abs(e.clientY - dragStartPos.y);
      if (dragDistance > 5) {
        const tempGuideline: Guideline = {
          id: `temp-${type}`,
          type,
          position,
          name: generateGuidlineName(type)
        };
        
        setGuidelines(prev => {
          const filtered = prev.filter(g => g.id !== `temp-${type}`);
          return [...filtered, tempGuideline];
        });
      }
    };

    const handleMouseUp = () => {
      setIsCreatingGuideline(false);
      
      setGuidelines(prev => 
        prev.map(g => 
          g.id === `temp-${type}` 
            ? { ...g, id: `${type}-${Date.now()}` }
            : g
        )
      );
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleGuidelineMouseDown = (guideline: Guideline, event: React.MouseEvent) => {
    if (guideline.id.startsWith('temp-')) return;
    
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
    if (guideline.id.startsWith('temp-')) return;
    setGuidelines(prev => prev.filter(g => g.id !== guideline.id));
  };

  const resetGuidelines = () => {
    setGuidelines([]);
  };

  // Generate ruler tick marks - just lines without numbers
  const generateTicks = (dimension: number, isVertical: boolean = false) => {
    const ticks = [];
    const majorTickSpacing = 20; // Major ticks every 20px
    const minorTickSpacing = 5;  // Minor ticks every 5px
    
    for (let i = 0; i <= dimension; i += minorTickSpacing) {
      const isMajorTick = i % majorTickSpacing === 0;
      const tickLength = isMajorTick ? '8px' : '4px';
      
      ticks.push(
        <div
          key={i}
          className="absolute bg-gray-400"
          style={{
            [isVertical ? 'top' : 'left']: `${i}px`,
            [isVertical ? 'left' : 'top']: '0px',
            [isVertical ? 'width' : 'height']: tickLength,
            [isVertical ? 'height' : 'width']: '1px'
          }}
        />
      );
    }
    return ticks;
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Logo Spacing Guidelines</h3>
        {guidelines.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetGuidelines}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Guidelines
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Drag from the rulers to create spacing guidelines for your logo. 
        Guidelines will snap to grid and display measurements.
      </p>
      
      <div className="relative inline-block">
        {/* Top Ruler */}
        <div 
          className="absolute -top-6 left-6 bg-gray-100 border-b cursor-grab select-none hover:bg-gray-200 relative"
          style={{ width: containerSize.width, height: '24px' }}
          onMouseDown={(e) => handleRulerMouseDown(e, 'vertical')}
        >
          {generateTicks(containerSize.width)}
        </div>

        {/* Left Ruler */}
        <div 
          className="absolute -left-6 top-6 bg-gray-100 border-r cursor-grab select-none hover:bg-gray-200 relative"
          style={{ width: '24px', height: containerSize.height }}
          onMouseDown={(e) => handleRulerMouseDown(e, 'horizontal')}
        >
          {generateTicks(containerSize.height, true)}
        </div>

        {/* Logo Container */}
        <div 
          ref={containerRef}
          className="relative border border-dashed border-gray-300 bg-white"
          style={{ width: '400px', height: '400px' }}
        >
          <div 
            className={`w-full h-full ${shapeClasses[shape]} flex items-center justify-center overflow-hidden`}
            style={{ backgroundColor: logo.background }}
          >
            <img 
              src={logo.src} 
              alt="Logo with spacing guidelines" 
              className="max-w-[75%] max-h-[75%] object-contain"
            />
          </div>
          
          {/* Guidelines */}
          {guidelines.map((guideline) => (
            <div key={guideline.id}>
              <div
                className="absolute cursor-move hover:opacity-75"
                style={{
                  ...(guideline.type === 'horizontal' 
                    ? {
                        top: `${guideline.position}px`,
                        left: 0,
                        right: 0,
                        height: '2px',
                        borderTop: '2px dashed rgba(255, 0, 0, 0.8)'
                      }
                    : {
                        left: `${guideline.position}px`,
                        top: 0,
                        bottom: 0,
                        width: '2px',
                        borderLeft: '2px dashed rgba(255, 0, 0, 0.8)'
                      }
                  ),
                  zIndex: 10
                }}
                onMouseDown={(e) => handleGuidelineMouseDown(guideline, e)}
                onDoubleClick={() => handleGuidelineDoubleClick(guideline)}
                title="Drag to move, double-click to remove"
              />
              
              <div
                className="absolute bg-red-500 text-white text-xs px-1 py-0.5 rounded pointer-events-none"
                style={{
                  ...(guideline.type === 'horizontal'
                    ? {
                        top: `${guideline.position - 12}px`,
                        left: '8px'
                      }
                    : {
                        left: `${guideline.position + 8}px`,
                        top: '8px'
                      }
                  ),
                  zIndex: 11
                }}
              >
                {guideline.name}: {Math.round(guideline.position / 20)}px
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>• Drag from rulers to add guidelines</p>
          <p>• Drag guidelines to reposition them</p>
          <p>• Double-click guidelines to remove</p>
          <p>• Guidelines snap to {GRID_SIZE}px grid</p>
          {guidelines.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 rounded">
              <strong>Active Guidelines:</strong>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {guidelines.filter(g => !g.id.startsWith('temp-')).map(g => (
                  <span key={g.id} className="text-xs">
                    {g.name}: {Math.round(g.position / 20)}px
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
