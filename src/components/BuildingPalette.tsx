
import React, { useState, useRef, useEffect } from 'react';
import { BUILDINGS, Building, getCategoryBuildings } from '@/utils/buildings';
import { LayersIcon } from 'lucide-react';
import { EnvironmentalMetrics } from '@/utils/environmental';
import PaletteSearchBar from '@/components/palette/PaletteSearchBar';
import PaletteTabs from '@/components/palette/PaletteTabs';
import BuildingCategoryFilter from '@/components/palette/BuildingCategoryFilter';
import BuildingInfoPanel from '@/components/palette/BuildingInfoPanel';
import BuildingsList from '@/components/palette/BuildingsList';
import RecommendationsTab from '@/components/palette/RecommendationsTab';
import PredictionsTab from '@/components/palette/PredictionsTab';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BuildingPaletteProps {
  onBuildingDragStart: (building: Building) => void;
  environmentalMetrics?: EnvironmentalMetrics;
}

const BuildingPalette: React.FC<BuildingPaletteProps> = ({ onBuildingDragStart, environmentalMetrics }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Building['category'] | 'all'>('all');
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);
  const [activeTab, setActiveTab] = useState<'buildings' | 'recommendations' | 'predictions'>('buildings');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  const filteredBuildings = getCategoryBuildings(activeCategory).filter(building => 
    building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    building.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMouseEnter = (building: Building) => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredBuilding(building);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      window.clearTimeout(hoverTimeoutRef.current);
    }
    
    // Add a small delay before hiding the hoveredBuilding details
    // This prevents flashing when moving between close elements
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHoveredBuilding(null);
      hoverTimeoutRef.current = null;
    }, 100);
  };

  // Fix for glitchy behavior - reset drag events on unmount
  useEffect(() => {
    const handleDragEnd = () => {
      document.body.classList.remove('dragging-building');
    };
    
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);
    
    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  return (
    <div
      ref={paletteRef}
      className={`transition-all duration-300 absolute left-4 top-4 bottom-4 z-10 w-[350px] flex flex-col 
      bg-white/90 backdrop-blur-md border border-stone-200 shadow-lg rounded-xl overflow-hidden
      ${isCollapsed ? 'w-[60px] translate-x-[-290px]' : ''}`}
    >
      <div className="p-4 border-b border-stone-200 bg-gradient-to-b from-white to-stone-50 flex justify-between items-center">
        <h2 className={`text-lg font-medium flex items-center text-stone-800 ${isCollapsed ? 'hidden' : 'block'}`}>
          <LayersIcon size={18} className="mr-2 text-teal-600" />
          Building Assets
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 rounded-full"
        >
          {isCollapsed ? '→' : '←'}
        </Button>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="p-3 border-b border-stone-200 space-y-3">
            <PaletteSearchBar 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
            />
            
            <PaletteTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
            />
            
            {activeTab === 'buildings' && (
              <BuildingCategoryFilter 
                activeCategory={activeCategory} 
                onCategoryChange={(value) => setActiveCategory(value as any)} 
              />
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-stone-50/70">
            {activeTab === 'buildings' && (
              <>
                {hoveredBuilding && (
                  <Card className="p-3 bg-white shadow-sm border border-stone-200/80">
                    <BuildingInfoPanel building={hoveredBuilding} />
                  </Card>
                )}
                
                <BuildingsList 
                  buildings={filteredBuildings}
                  onBuildingHover={handleMouseEnter}
                  onBuildingLeave={handleMouseLeave}
                  onBuildingDragStart={onBuildingDragStart}
                />
              </>
            )}
            
            {activeTab === 'recommendations' && (
              <RecommendationsTab environmentalMetrics={environmentalMetrics} />
            )}
            
            {activeTab === 'predictions' && (
              <PredictionsTab environmentalMetrics={environmentalMetrics} />
            )}
          </div>
          
          <div className="p-3 border-t border-stone-200 bg-white/80">
            <div className="text-xs text-stone-500">
              {activeTab === 'buildings' && "Drag buildings onto the grid to place them in your city. Press 'R' to rotate buildings."}
              {activeTab === 'recommendations' && "These recommendations are based on sustainability best practices and your current city design."}
              {activeTab === 'predictions' && "Predictions are based on data analysis of your current city's sustainability metrics."}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BuildingPalette;
