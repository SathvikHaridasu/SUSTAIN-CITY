
import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    // Show tutorial toast once
    toast({
      title: "Street View Available",
      description: "Drag & drop the pegman onto the map to explore street view!",
    });
  }, [toast]);

  const handleDragStart = (e: React.MouseEvent) => {
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
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !pegmanRef.current) return;
    
    // Update pegman position to follow cursor
    setPosition({
      x: e.clientX - 20, // Offset for centering
      y: e.clientY - 20  // Offset for centering
    });
  };

  const handleDragEnd = (e: MouseEvent) => {
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
      
      // Enter street view at this position
      onEnterStreetView({ x: gridX, y: gridY });
      
      // Reset pegman position with animation
      setTimeout(() => {
        setPosition({ x: 0, y: 0 });
      }, 100);
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
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, containerRef]);

  return (
    <div className="relative">
      <div
        ref={pegmanRef}
        className={`flex items-center justify-center bg-white border-2 border-primary rounded-full p-1.5 cursor-grab shadow-md transition-all duration-300 ${isDragging ? 'cursor-grabbing shadow-lg z-50 fixed' : 'hover:bg-primary/10'}`}
        style={
          isDragging 
            ? { position: 'fixed', left: `${position.x}px`, top: `${position.y}px` } 
            : {}
        }
        onMouseDown={handleDragStart}
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
