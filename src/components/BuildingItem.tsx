
import React from 'react';
import { Building } from '@/utils/buildings';
import { cn } from '@/lib/utils';

// Building placeholder images for when original images don't load
const BUILDING_PLACEHOLDERS: Record<string, string> = {
  residential: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace',
  commercial: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833',
  industrial: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb',
  energy: 'https://images.unsplash.com/photo-1460574283810-2aab119d8511',
  government: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e',
  parks: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
  transport: 'https://images.unsplash.com/photo-1524230572899-a752b3835840',
  education: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
  healthcare: 'https://images.unsplash.com/photo-1551038247-3d9af20df552',
  infrastructure: 'https://images.unsplash.com/photo-1431576901776-e539bd916ba2'
};

interface BuildingItemProps {
  building: Building;
  onDragStart: (building: Building) => void;
  className?: string;
}

const BuildingItem: React.FC<BuildingItemProps> = ({ building, onDragStart, className }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ buildingId: building.id }));
    onDragStart(building);
  };

  // Determine badge color based on environmental impact
  const getBadgeColor = () => {
    const impact = building.environmentalImpact.emissions;
    if (impact < -20) return 'bg-green-100 text-green-800 border border-green-300';
    if (impact < 0) return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (impact < 10) return 'bg-blue-100 text-blue-800 border border-blue-300';
    if (impact < 25) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-red-100 text-red-800 border border-red-300';
  };

  const getImpactLabel = () => {
    const impact = building.environmentalImpact.emissions;
    if (impact < -20) return 'Highly Sustainable';
    if (impact < 0) return 'Eco-friendly';
    if (impact < 10) return 'Low Impact';
    if (impact < 25) return 'Moderate';
    return 'High Impact';
  };

  // Get fallback image based on building category
  const getFallbackImage = () => {
    return BUILDING_PLACEHOLDERS[building.category.toLowerCase()] || 
           BUILDING_PLACEHOLDERS.residential; // Default fallback
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = getFallbackImage();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        'p-3 bg-white/95 rounded-lg border border-border/60 cursor-grab hover-scale focus-ring subtle-shadow',
        'hover:border-primary/30 hover:shadow-md transition-all duration-200',
        className
      )}
    >
      <div className="aspect-square w-full bg-muted/50 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
        <img 
          src={building.image || getFallbackImage()} 
          alt={building.name}
          className="w-full h-full object-cover absolute inset-0"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-2">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium backdrop-blur-sm',
            getBadgeColor()
          )}>
            {getImpactLabel()}
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium truncate">{building.name}</h3>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-muted-foreground">{building.category}</span>
        <span className="text-xs font-medium bg-slate-100 px-1.5 py-0.5 rounded">
          {building.size.width}×{building.size.depth}
        </span>
      </div>
    </div>
  );
};

export default BuildingItem;
