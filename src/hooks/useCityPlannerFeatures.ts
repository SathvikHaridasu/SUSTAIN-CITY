// This is a helper file to keep the main useCityPlanner hook from getting too large
import { useState, useCallback, useEffect, useRef } from 'react';
import { GridItem, EnvironmentalMetrics } from '@/utils/environmental';
import { Building } from '@/utils/buildings';
import { 
  TimeProgressionState, 
  DEFAULT_TIME_STATE, 
  calculateCityGrowth,
  SIMULATION_SPEEDS
} from '@/utils/timeProgression';
import {
  DisasterState,
  DEFAULT_DISASTER_STATE,
  checkForNaturalDisaster,
  applyDisasterEffects,
  Disaster
} from '@/utils/naturalDisasters';
import {
  PopulationState,
  DEFAULT_POPULATION,
  calculatePopulationDistribution,
  getPopulationAgents
} from '@/utils/populationSimulation';
import {
  BuildingUpgrade,
  applyBuildingUpgrade
} from '@/utils/buildingUpgrades';
import { useToast } from '@/components/ui/use-toast';
import { Season } from '@/utils/seasons';

export interface CityPlannerFeatureState {
  timeState: TimeProgressionState;
  disasterState: DisasterState;
  populationState: PopulationState;
  showBuildingUpgradePanel: boolean;
  selectedBuildingForUpgrade: Building | null;
  selectedBuildingLocation: { x: number; y: number } | null;
  popupDisaster: Disaster | null;
  streetViewActive: boolean;  // Added missing property
}

export interface CityPlannerFeatureActions {
  startTimeSimulation: () => void;
  pauseTimeSimulation: () => void;
  changeSimulationSpeed: (speed: 'slow' | 'medium' | 'fast') => void;
  dismissDisasterAlert: () => void;
  showUpgradePanel: (building: Building, location: { x: number; y: number }) => void;
  hideUpgradePanel: () => void;
  applyBuildingUpgrade: (location: { x: number; y: number }, upgradeId: string) => void;
  setSelectedBuilding: (building: Building | null) => void;
  setStreetViewActive: (active: boolean) => void;  // Added missing action
}

export const useCityPlannerFeatures = (
  grid: GridItem[][],
  setGrid: React.Dispatch<React.SetStateAction<GridItem[][]>>,
  currentSeason: Season,
  metrics: EnvironmentalMetrics,
  setMetrics: React.Dispatch<React.SetStateAction<EnvironmentalMetrics>>,
  onCellUpdate: () => void,
  currentTime: string
): [CityPlannerFeatureState, CityPlannerFeatureActions] => {
  const [timeState, setTimeState] = useState<TimeProgressionState>(DEFAULT_TIME_STATE);
  const [disasterState, setDisasterState] = useState<DisasterState>(DEFAULT_DISASTER_STATE);
  const [populationState, setPopulationState] = useState<PopulationState>(DEFAULT_POPULATION);
  const [showBuildingUpgradePanel, setShowBuildingUpgradePanel] = useState<boolean>(false);
  const [selectedBuildingForUpgrade, setSelectedBuildingForUpgrade] = useState<Building | null>(null);
  const [selectedBuildingLocation, setSelectedBuildingLocation] = useState<{ x: number; y: number } | null>(null);
  const [popupDisaster, setPopupDisaster] = useState<Disaster | null>(null);
  const [streetViewActive, setStreetViewActive] = useState<boolean>(false);  // Added street view state
  
  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Calculate initial population
  useEffect(() => {
    const initialPopulation = calculatePopulation(grid);
    const population = calculatePopulationDistribution(grid, initialPopulation);
    setPopulationState(population);
  }, [grid]);

  // Calculate population based on residential buildings - keep at 0 as requested
  const calculatePopulation = (grid: GridItem[][]): number => {
    // Return 0 to ensure population stays at 0 as requested
    return 0;
  };

  // Time progression simulation
  const startTimeSimulation = useCallback(() => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }
    
    setTimeState(prev => ({ ...prev, isSimulating: true }));
    
    // Set interval based on simulation speed
    const intervalTime = SIMULATION_SPEEDS[timeState.simulationSpeed];
    
    simulationInterval.current = setInterval(() => {
      // Advance simulation by one year
      advanceSimulationYear();
    }, intervalTime);
  }, [timeState.simulationSpeed]);

  const pauseTimeSimulation = useCallback(() => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
    
    setTimeState(prev => ({ ...prev, isSimulating: false }));
  }, []);

  const changeSimulationSpeed = useCallback((speed: 'slow' | 'medium' | 'fast') => {
    setTimeState(prev => ({ ...prev, simulationSpeed: speed }));
    
    // If simulation is running, restart with new speed
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      
      const intervalTime = SIMULATION_SPEEDS[speed];
      
      simulationInterval.current = setInterval(() => {
        advanceSimulationYear();
      }, intervalTime);
    }
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    };
  }, []);

  // Function to advance simulation by one year
  const advanceSimulationYear = useCallback(() => {
    setTimeState(prev => {
      const newYear = prev.currentYear + 1;
      return { ...prev, currentYear: newYear };
    });
    
    // Check for natural disasters with more realistic simulation
    setDisasterState(prev => {
      // Calculate disaster probability based on city metrics and season
      const disasterProbability = calculateDisasterProbability(grid, currentSeason, metrics);
      
      // Fixed: Removed the extra parameter to match the function signature
      const newDisasterState = checkForNaturalDisaster(
        grid,
        currentSeason,
        metrics,
        timeState.currentYear,
        prev
      );
      
      // If there's a new disaster, show notification
      const newDisaster = newDisasterState.activeDisasters.find(
        disaster => !prev.activeDisasters.some(prevDisaster => prevDisaster.type === disaster.type)
      );
      
      if (newDisaster) {
        toast({
          title: `${newDisaster.name} Alert!`,
          description: newDisaster.description,
          variant: "destructive",
        });
        
        // Set popup disaster
        setPopupDisaster(newDisaster);
        
        // Apply immediate visual effects to affected areas if possible
        applyDisasterVisualEffects(newDisaster, setGrid);
      }
      
      return newDisasterState;
    });
    
    // Keep population at 0 as requested
    setPopulationState(prev => {
      return {
        ...prev,
        total: 0,
        distribution: {
          ...prev.distribution,
          residential: 0,
          commercial: 0,
          industrial: 0,
          parks: 0,
          other: 0
        }
      };
    });
    
    // Update metrics with disaster effects
    setMetrics(prevMetrics => {
      const disasterEffects = applyDisasterEffects(prevMetrics, disasterState.activeDisasters);
      return disasterEffects;
    });
  }, [grid, currentSeason, metrics, timeState, disasterState.activeDisasters, toast, setGrid]);
  
  // New helper functions for enhanced disaster simulation
  const calculateDisasterProbability = (grid: GridItem[][], season: Season, metrics: EnvironmentalMetrics) => {
    // Base probabilities by season
    const baseProbability = {
      spring: 0.05,
      summer: 0.08,
      fall: 0.04,
      winter: 0.07
    };
    
    // Factor in environmental metrics
    let modifiedProbability = baseProbability[season];
    
    // Higher emissions increase disaster probability
    if (metrics.emissions > 50) {
      modifiedProbability += (metrics.emissions - 50) / 200;
    }
    
    // High heat island effect increases probability
    if (metrics.heat > 40) {
      modifiedProbability += (metrics.heat - 40) / 300;
    }
    
    // More green space reduces probability
    const greenSpaceCount = grid.flat().filter(cell => 
      cell.building?.category === 'greenspace'
    ).length;
    const totalBuildings = grid.flat().filter(cell => cell.building).length;
    const greenSpaceRatio = totalBuildings > 0 ? greenSpaceCount / totalBuildings : 0;
    
    modifiedProbability -= greenSpaceRatio / 5;
    
    // Ensure probability is within reasonable bounds
    return Math.max(0.01, Math.min(0.25, modifiedProbability));
  };
  
  // Apply visual effects to cells affected by disasters
  const applyDisasterVisualEffects = (disaster: Disaster, setGrid: React.Dispatch<React.SetStateAction<GridItem[][]>>) => {
    if (!disaster) return;
    
    // For now, we're not actually modifying the grid visually, but this function could be expanded later
    // to add visual indicators of disasters on the grid
    
    // This is where you would implement code to visually affect grid cells based on disaster type
  };

  // Handle building upgrades
  const showUpgradePanel = useCallback((building: Building, location: { x: number; y: number }) => {
    setSelectedBuildingForUpgrade(building);
    setSelectedBuildingLocation(location);
    setShowBuildingUpgradePanel(true);
  }, []);

  const hideUpgradePanel = useCallback(() => {
    setShowBuildingUpgradePanel(false);
    setSelectedBuildingForUpgrade(null);
    setSelectedBuildingLocation(null);
  }, []);

  const handleApplyBuildingUpgrade = useCallback((location: { x: number; y: number }, upgradeId: string) => {
    const { x, y } = location;
    
    if (!grid[x] || !grid[x][y] || !grid[x][y].building) {
      return;
    }
    
    const currentBuilding = grid[x][y].building!;
    const upgradedBuilding = applyBuildingUpgrade(currentBuilding, upgradeId);
    
    // Update grid with upgraded building
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[x][y] = { ...newGrid[x][y], building: upgradedBuilding };
      return newGrid;
    });
    
    // Update metrics
    onCellUpdate();
    
    toast({
      title: "Building Upgraded",
      description: `Applied upgrade: ${upgradeId}`,
      duration: 3000,
    });
    
    // Update selected building reference
    setSelectedBuildingForUpgrade(upgradedBuilding);
  }, [grid, setGrid, onCellUpdate, toast]);

  const dismissDisasterAlert = useCallback(() => {
    setPopupDisaster(null);
  }, []);

  // Set selected building function
  const setSelectedBuilding = useCallback((building: Building | null) => {
    console.log("Setting selected building in features:", building);
    
    // If there's a setter function passed from the parent, call it
    if (typeof window !== 'undefined') {
      // This is a hacky way to communicate with the parent component
      // Ideally, this should be replaced with proper state management
      if (window.setSelectedBuilding && typeof window.setSelectedBuilding === 'function') {
        window.setSelectedBuilding(building);
      }
    }
  }, []);

  // Added the setStreetViewActive callback function
  const handleSetStreetViewActive = useCallback((active: boolean) => {
    setStreetViewActive(active);
  }, []);

  // Feature state and actions
  const featureState: CityPlannerFeatureState = {
    timeState,
    disasterState: {
      ...disasterState,
      // Add disaster history for tracking achievements
      disasterHistory: disasterState.disasterHistory || []
    },
    populationState,
    showBuildingUpgradePanel,
    selectedBuildingForUpgrade,
    selectedBuildingLocation,
    popupDisaster,
    streetViewActive,  // Added the property to the state
  };

  // Include the setSelectedBuilding in the featureActions object
  const featureActions: CityPlannerFeatureActions = {
    startTimeSimulation,
    pauseTimeSimulation,
    changeSimulationSpeed,
    dismissDisasterAlert,
    showUpgradePanel,
    hideUpgradePanel,
    applyBuildingUpgrade: handleApplyBuildingUpgrade,
    setSelectedBuilding,
    setStreetViewActive: handleSetStreetViewActive,  // Added the action to the object
  };

  return [featureState, featureActions];
};

// Add this to global.d.ts or extend Window interface here
declare global {
  interface Window {
    setSelectedBuilding?: (building: Building | null) => void;
  }
}
