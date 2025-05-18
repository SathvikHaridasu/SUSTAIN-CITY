
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface StreetViewPegmanProps {
  onEnterStreetView: (position: { x: number; y: number }) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const StreetViewPegman: React.FC<StreetViewPegmanProps> = ({ onEnterStreetView, containerRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pegmanRef = useRef<HTMLDivElement>(null);
  const originalPositionRef = useRef({ x: 0, y: 0 });
  const { toast } = useToast();
  const [hasShownTutorial, setHasShownTutorial] = useState(false);

  useEffect(() => {
    // Show tutorial toast only once
    if (!hasShownTutorial) {
      toast({
        title: "Street View Available",
        description: "Click or drag & drop the pegman to explore street view!",
      });
      setHasShownTutorial(true);
    }
  }, [toast, hasShownTutorial]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!pegmanRef.current) return;
    
    setIsDragging(true);
    
    // Store original position for potential reset
    const rect = pegmanRef.current.getBoundingClientRect();
    originalPositionRef.current = { 
      x: rect.left,
      y: rect.top 
    };

    // Make pegman larger during drag
    pegmanRef.current.style.transform = 'scale(1.2)';
    
    // Show visual feedback
    document.body.classList.add('dragging-pegman');
    
    // Update initial position
    setPosition({
      x: e.clientX - 20, // Offset for centering
      y: e.clientY - 20  // Offset for centering
    });
  }, []);

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    // Update pegman position to follow cursor
    setPosition({
      x: e.clientX - 20, // Offset for centering
      y: e.clientY - 20  // Offset for centering
    });
  }, [isDragging]);

  const handleDragEnd = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || !pegmanRef.current) return;
    
    setIsDragging(false);
    document.body.classList.remove('dragging-pegman');
    
    // Reset pegman size
    pegmanRef.current.style.transform = 'scale(1)';
    
    // Check if drop position is within map container
    const mapRect = containerRef.current.getBoundingClientRect();
    
    if (
      e.clientX >= mapRect.left &&
      e.clientX <= mapRect.right &&
      e.clientY >= mapRect.top &&
      e.clientY <= mapRect.bottom
    ) {
      // Convert drop position to grid coordinates
      const gridX = Math.floor(((e.clientX - mapRect.left) / mapRect.width) * 20);
      const gridY = Math.floor(((e.clientY - mapRect.top) / mapRect.height) * 20);
      
      // Enter street view at this position with a delay for animation
      setTimeout(() => {
        onEnterStreetView({ x: gridX, y: gridY });
      }, 100);
      
      // Reset pegman position with animation
      setTimeout(() => {
        setPosition({ x: 0, y: 0 });
      }, 100);
      
      // Show a success toast
      toast({
        title: "Entering Street View",
        description: `Exploring position (${gridX}, ${gridY})`,
      });
    } else {
      // Reset position if dropped outside map with spring-back animation
      setPosition({ x: 0, y: 0 });
      
      if (pegmanRef.current) {
        pegmanRef.current.classList.add('animate-bounce');
        setTimeout(() => {
          if (pegmanRef.current) {
            pegmanRef.current.classList.remove('animate-bounce');
          }
        }, 500);
      }
    }
  }, [isDragging, containerRef, onEnterStreetView, toast]);

  // Enhanced handleClick function to support direct clicking
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Don't trigger click when starting a drag
    if (isDragging) return;
    
    if (!containerRef.current || !pegmanRef.current) return;
    
    // Find a good position in the middle of the map
    const centerX = Math.floor(10); // Center of 20x20 grid
    const centerY = Math.floor(10); // Center of 20x20 grid
    
    // Animate pegman
    pegmanRef.current.classList.add('animate-pulse');
    setTimeout(() => {
      if (pegmanRef.current) {
        pegmanRef.current.classList.remove('animate-pulse');
      }
    }, 500);
    
    // Enter street view at center position with delay for animation
    setTimeout(() => {
      onEnterStreetView({ x: centerX, y: centerY });
    }, 100);
    
    // Show a success toast
    toast({
      title: "Entering Street View",
      description: `Quick jump to center position (${centerX}, ${centerY})`,
    });
  }, [isDragging, containerRef, onEnterStreetView, toast]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      
      // Also handle touch events for mobile
      window.addEventListener('touchmove', (e) => handleDrag(e.touches[0] as unknown as MouseEvent));
      window.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          handleDragEnd(e.changedTouches[0] as unknown as MouseEvent);
        }
      });
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', (e) => handleDrag(e.touches[0] as unknown as MouseEvent));
      window.removeEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length > 0) {
          handleDragEnd(e.changedTouches[0] as unknown as MouseEvent);
        }
      });
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  return (
    <div className="relative">
      <div
        ref={pegmanRef}
        className={`flex items-center justify-center bg-white border-2 border-primary rounded-full p-1.5 cursor-pointer shadow-md transition-all duration-300 ${isDragging ? 'cursor-grabbing shadow-lg z-50 fixed' : 'hover:bg-primary/10'}`}
        style={
          isDragging 
            ? { position: 'fixed', left: `${position.x}px`, top: `${position.y}px` } 
            : {}
        }
        onMouseDown={handleDragStart}
        onClick={handleClick}
        onTouchStart={(e) => {
          e.preventDefault();
          handleDragStart(e as unknown as React.MouseEvent);
        }}
        title="Click to enter Street View at center, or drag to a specific location"
      >
        <User size={24} className="text-primary" />
      </div>
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-transparent pointer-events-none">
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
            Drop on any road to explore in street view
          </div>
        </div>
      )}
    </div>
  );
};

export default StreetViewPegman;
