
import React from 'react';
import { Button } from '@/components/ui/button';

interface StreetViewControlsProps {
  onClose: () => void;
}

const StreetViewControls: React.FC<StreetViewControlsProps> = ({ onClose }) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
      <div className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm">
        <p className="text-sm font-medium">
          W: Forward | S: Backward | A: Left | D: Right | Hold right-click to look around | ESC to exit
        </p>
      </div>
      
      <Button onClick={onClose} variant="destructive" className="rounded-full">
        Exit Street View
      </Button>
    </div>
  );
};

export default StreetViewControls;
