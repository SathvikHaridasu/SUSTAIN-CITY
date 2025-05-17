
import React from 'react';

interface PositionIndicatorProps {
  position: { x: number; y: number };
}

const PositionIndicator: React.FC<PositionIndicatorProps> = ({ position }) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white py-2 px-4 rounded-full backdrop-blur-sm z-10">
      <p className="text-sm">
        Position: X: {position.x}, Y: {position.y}
      </p>
    </div>
  );
};

export default PositionIndicator;
