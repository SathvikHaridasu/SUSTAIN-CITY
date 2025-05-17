
import React from 'react';
import { GridItem } from '@/utils/environmental';

interface CityMiniMapProps {
  grid: GridItem[][];
  position: { x: number; y: number };
}

const CityMiniMap: React.FC<CityMiniMapProps> = ({ grid, position }) => {
  return (
    <div className="absolute bottom-4 right-4 w-32 h-32 bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 z-10">
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Simplified top-down view of the city */}
          {grid.map((row, x) => 
            row.map((cell, y) => {
              // Calculate position in the mini-map
              const left = (y / 20) * 100 + '%';
              const top = (x / 20) * 100 + '%';
              const width = (1 / 20) * 100 + '%';
              const height = (1 / 20) * 100 + '%';
              
              // Determine color based on building type
              let bgColor = 'bg-gray-700';
              if (cell.building) {
                if (cell.building.id === 'road') bgColor = 'bg-gray-500';
                else if (cell.building.category === 'residential') bgColor = 'bg-blue-400';
                else if (cell.building.category === 'commercial') bgColor = 'bg-purple-400';
                else if (cell.building.category === 'industrial') bgColor = 'bg-yellow-400';
                else if (cell.building.category === 'entertainment' && 
                         (cell.building.id === 'park' || cell.building.id === 'garden')) 
                  bgColor = 'bg-green-400';
                else if (cell.building.category === 'educational' && 
                         cell.building.id === 'farm') 
                  bgColor = 'bg-lime-400';
                else if (cell.building.category === 'infrastructure') bgColor = 'bg-gray-400';
              }
              
              return (
                <div 
                  key={`${x}-${y}`} 
                  className={`absolute ${bgColor}`}
                  style={{
                    left,
                    top,
                    width,
                    height,
                  }}
                />
              );
            })
          )}
          
          {/* Player position indicator */}
          <div 
            className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: (position.y / 20) * 100 + '%',
              top: (position.x / 20) * 100 + '%',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CityMiniMap;
