
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Building } from '@/utils/buildings';
import { BUILDINGS } from '@/utils/buildings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { LayersIcon, SearchIcon } from 'lucide-react';
import BuildingCategoryFilter from '@/components/palette/BuildingCategoryFilter';
import BuildingsList from '@/components/palette/BuildingsList';
import PredictionsTab from '@/components/palette/PredictionsTab';
import RecommendationsTab from '@/components/palette/RecommendationsTab';
import BuildingInfoPanel from '@/components/palette/BuildingInfoPanel';
import { Card } from '@/components/ui/card';
import { EnvironmentalMetrics } from '@/utils/environmental';

interface BuildingAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingSelect: (building: Building) => void;
  environmentalMetrics?: EnvironmentalMetrics;
}

const BuildingAssetDialog: React.FC<BuildingAssetDialogProps> = ({
  isOpen,
  onClose,
  onBuildingSelect,
  environmentalMetrics
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Building['category'] | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'buildings' | 'recommendations' | 'predictions'>('buildings');
  const [hoveredBuilding, setHoveredBuilding] = useState<Building | null>(null);

  const handleBuildingClick = (building: Building) => {
    onBuildingSelect(building);
    onClose();
  };
  
  const handleMouseEnter = (building: Building) => {
    setHoveredBuilding(building);
  };

  const handleMouseLeave = () => {
    setHoveredBuilding(null);
  };

  const filteredBuildings = BUILDINGS.filter(building => 
    (activeCategory === 'all' || building.category === activeCategory) && 
    (building.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    building.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <LayersIcon size={20} className="mr-2 text-teal-600" />
            Sustainability Building Assets
          </DialogTitle>
          <DialogDescription>
            Select a building to place in your sustainable city
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          <div className="flex items-center space-x-2">
            <div className="relative w-full">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search building assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="buildings">Buildings</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="predictions">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buildings" className="flex-1 overflow-hidden flex flex-col space-y-4 mt-0">
              <BuildingCategoryFilter
                activeCategory={activeCategory}
                onCategoryChange={(value) => setActiveCategory(value as any)}
              />
              
              <div className="flex flex-col md:flex-row gap-4 flex-1 overflow-hidden">
                <div className="md:w-1/3 overflow-y-auto p-1">
                  {hoveredBuilding && (
                    <Card className="p-3 bg-white shadow-sm border border-stone-200/80 mb-4">
                      <BuildingInfoPanel building={hoveredBuilding} />
                    </Card>
                  )}
                </div>
                
                <div className="md:w-2/3 overflow-y-auto p-1">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {filteredBuildings.map((building) => (
                      <div
                        key={building.id}
                        className="cursor-pointer p-2 border rounded-md hover:bg-slate-50 transition-colors"
                        onClick={() => handleBuildingClick(building)}
                        onMouseEnter={() => handleMouseEnter(building)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="flex flex-col items-center">
                          <div 
                            className="w-16 h-16 mb-2 bg-contain bg-center bg-no-repeat" 
                            style={{ backgroundImage: `url(${building.image || '/placeholder.svg'})` }}
                          />
                          <span className="text-sm font-medium text-center">{building.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="flex-1 overflow-y-auto mt-0">
              <RecommendationsTab environmentalMetrics={environmentalMetrics} />
            </TabsContent>
            
            <TabsContent value="predictions" className="flex-1 overflow-y-auto mt-0">
              <PredictionsTab environmentalMetrics={environmentalMetrics} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuildingAssetDialog;
