
import React, { useState, useRef } from 'react';
import { Building } from '@/utils/buildings';
import { GridItem } from '@/utils/environmental';
import { TimeOfDay } from '@/utils/dayNightCycle';
import TimeProgressionControls from '@/components/TimeProgressionControls';
import PopulationPanel from '@/components/PopulationPanel';
import DisasterAlert from '@/components/DisasterAlert';
import { CityPlannerFeatureState, CityPlannerFeatureActions } from '@/hooks/useCityPlannerFeatures';
import BuildingUpgradePanel from '@/components/BuildingUpgradePanel';
import StreetViewMode from '@/components/StreetViewMode';
import StreetViewPegman from '@/components/StreetViewPegman';
import BuildingAssetDialog from '@/components/BuildingAssetDialog';
import { Button } from '@/components/ui/button';
import { LayersIcon } from 'lucide-react';

interface CityLayoutProps {
  grid: GridItem[][];
  setGrid: React.Dispatch<React.SetStateAction<GridItem[][]>>;
  selectedBuilding: Building | null;
  onCellUpdate: () => void;
  environmentalMetrics: any;
  isLoading: boolean;
  currentTime: TimeOfDay;
  featureState: CityPlannerFeatureState;
  featureActions: CityPlannerFeatureActions;
  children?: React.ReactNode;
}

const CityLayout: React.FC<CityLayoutProps> = ({
  grid,
  setGrid,
  selectedBuilding,
  onCellUpdate,
  environmentalMetrics,
  isLoading,
  currentTime,
  featureState,
  featureActions,
  children
}) => {
  const [streetViewMode, setStreetViewMode] = useState(false);
  const [streetViewPosition, setStreetViewPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const cityGridContainerRef = useRef<HTMLDivElement>(null);

  // Define the function to handle building selection properly
  const handleBuildingSelect = (building: Building) => {
    console.log("Building selected:", building);
    featureActions.setSelectedBuilding(building);
  };

  // Handle entering street view at a specific location when clicking on the map
  const handleEnterStreetView = (position?: { x: number; y: number }) => {
    setStreetViewPosition(position);
    setStreetViewMode(true);
  };

  return (
    <main className="flex-1 p-4 md:p-6 flex flex-col">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)]">
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <Button 
            onClick={() => setBuildingDialogOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white w-full"
          >
            <LayersIcon className="mr-2 h-5 w-5" />
            Building Assets
          </Button>
          
          {/* Street View Pegman */}
          <div className="mt-2 p-2 bg-white/10 rounded-lg backdrop-blur-sm flex items-center justify-between">
            <span className="text-sm font-medium">Street View</span>
            <StreetViewPegman 
              onEnterStreetView={handleEnterStreetView} 
              containerRef={cityGridContainerRef}
            />
          </div>
        </div>
        
        <div className="flex-1 glass-panel rounded-lg overflow-hidden relative" ref={cityGridContainerRef}>
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <TimeProgressionControls currentYear={featureState.timeState.currentYear} />
            
            {featureState.popupDisaster && (
              <DisasterAlert 
                disaster={featureState.popupDisaster} 
                onClose={featureActions.dismissDisasterAlert}
                className="ml-4 animate-fade-in"
              />
            )}
          </div>
          
          <CityGrid 
            grid={grid} 
            setGrid={setGrid}
            selectedBuilding={selectedBuilding}
            onCellUpdate={onCellUpdate}
            currentTime={currentTime}
            population={featureState.populationState}
            disasterState={featureState.disasterState}
            onShowBuildingUpgrades={featureActions.showUpgradePanel}
            onEnterStreetView={handleEnterStreetView}
          />
        </div>
        
        <div className="w-full lg:w-72 flex flex-col gap-4">
          <EnvironmentalMetrics metrics={environmentalMetrics} isLoading={isLoading} />
          <PopulationPanel population={featureState.populationState} />
        </div>
      </div>
      
      {children}
      
      <BuildingAssetDialog
        isOpen={buildingDialogOpen}
        onClose={() => setBuildingDialogOpen(false)}
        onBuildingSelect={handleBuildingSelect}
        environmentalMetrics={environmentalMetrics}
      />
      
      <BuildingUpgradePanel 
        building={featureState.selectedBuildingForUpgrade}
        currentYear={featureState.timeState.currentYear}
        isOpen={featureState.showBuildingUpgradePanel}
        onClose={featureActions.hideUpgradePanel}
        onApplyUpgrade={featureActions.applyBuildingUpgrade}
        buildingLocation={featureState.selectedBuildingLocation}
      />
      
      <StreetViewMode 
        grid={grid}
        currentTime={currentTime}
        isOpen={streetViewMode}
        onClose={() => setStreetViewMode(false)}
        initialPosition={streetViewPosition}
      />
    </main>
  );
};

// Import required components to avoid errors
import CityGrid from '@/components/CityGrid';
import EnvironmentalMetrics from '@/components/EnvironmentalMetrics';

export default CityLayout;
