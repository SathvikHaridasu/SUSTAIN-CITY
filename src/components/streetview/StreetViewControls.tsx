
import React from 'react';
import { Button } from '@/components/ui/button';

interface StreetViewControlsProps {
  onClose: () => void;
  onEnterVR?: () => void;
  isVRSupported?: boolean;
}

const StreetViewControls: React.FC<StreetViewControlsProps> = ({ 
  onClose, 
  onEnterVR,
  isVRSupported 
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
      <div className="bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md">
        <p className="text-sm font-medium">
          W: Forward | S: Backward | A: Left | D: Right | Space: Up | Shift: Down | Look around with your head or mouse | ESC to exit
        </p>
      </div>
      
      <div className="flex gap-2">
        {isVRSupported && onEnterVR && (
          <Button 
            onClick={onEnterVR} 
            className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-medium"
          >
            Enter VR Mode
          </Button>
        )}
        
        <Button onClick={onClose} variant="destructive" className="rounded-full">
          Exit SustainCity View
        </Button>
      </div>
    </div>
  );
};

export default StreetViewControls;
