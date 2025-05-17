
import React from 'react';
import { Button } from '@/components/ui/button';

interface StreetViewTutorialProps {
  isTransitioning: boolean;
  showTutorial: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

const StreetViewTutorial: React.FC<StreetViewTutorialProps> = ({ 
  isTransitioning, 
  showTutorial, 
  position, 
  onClose 
}) => {
  if (!isTransitioning && !showTutorial) return null;
  
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 animate-fade-in">
      {isTransitioning ? (
        <div className="text-center">
          <div className="mb-4 text-xl font-bold text-white">
            Entering Street View at position ({position.x}, {position.y})
          </div>
          <div className="w-24 h-24 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-background/90 backdrop-blur-sm p-6 rounded-lg max-w-md">
          <h3 className="text-xl font-bold mb-4">Welcome to Street View!</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <span className="font-bold">WASD</span> - Move around
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">Mouse</span> - Look around
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">V</span> - Toggle 1st/3rd person view
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">M</span> - Toggle sound effects
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">ESC</span> - Exit street view
            </li>
          </ul>
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </div>
      )}
    </div>
  );
};

export default StreetViewTutorial;
