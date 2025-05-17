
import React from 'react';
import { Building } from '@/utils/buildings';
import BuildingItem from '@/components/BuildingItem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface BuildingsListProps {
  buildings: Building[];
  onBuildingHover: (building: Building) => void;
  onBuildingLeave: () => void;
  onBuildingDragStart: (building: Building) => void;
}

const BuildingsList: React.FC<BuildingsListProps> = ({
  buildings,
  onBuildingHover,
  onBuildingLeave,
  onBuildingDragStart,
}) => {
  if (buildings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-white/50 rounded-lg">
        No buildings match your search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {buildings.map(building => (
        <TooltipProvider key={building.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                onMouseEnter={() => onBuildingHover(building)}
                onMouseLeave={onBuildingLeave}
                className="hover-scale focus-ring"
              >
                <BuildingItem 
                  building={building} 
                  onDragStart={onBuildingDragStart}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] bg-white/90 border-primary/20">
              <div className="text-xs">
                <p className="font-medium">{building.name}</p>
                <p className="text-muted-foreground mt-1">{building.description}</p>
                <div className="mt-1 flex gap-1 flex-wrap">
                  <Badge variant="outline" className="text-[10px] py-0">
                    {building.size.width}x{building.size.depth}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0">
                    {building.category}
                  </Badge>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default BuildingsList;
