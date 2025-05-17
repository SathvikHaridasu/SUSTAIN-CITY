import { useState, useCallback, useEffect } from 'react';
import { GridItem, EnvironmentalMetrics, calculateEnvironmentalImpact } from '@/utils/environmental';
import { Building } from '@/utils/buildings';
import { saveCity, getCurrentCity, createNewCity } from '@/utils/cityStorage';
import { useToast } from '@/components/ui/use-toast';
import { Season, SEASONS, applySeasonalEffects } from '@/utils/seasons';
import { TimeOfDay, TIME_SETTINGS } from '@/utils/dayNightCycle';
import { ACHIEVEMENTS, checkAchievements, getNewlyUnlockedAchievements, Achievement } from '@/utils/achievements';
import { CityTemplate } from '@/utils/cityTemplates';
import { useCityPlannerFeatures, CityPlannerFeatureState, CityPlannerFeatureActions } from './useCityPlannerFeatures';
import { createEmptyGrid } from '@/utils/gridUtils';

export interface CityPlannerState {
  grid: GridItem[][];
  metrics: EnvironmentalMetrics;
  cityName: string;
  selectedBuilding: Building | null;
  isLoading: boolean;
  isSaving: boolean;
  currentSeason: Season;
  currentTime: TimeOfDay;
  achievements: Achievement[];
  featureState: CityPlannerFeatureState;
}

export interface CityPlannerActions {
  setGrid: React.Dispatch<React.SetStateAction<GridItem[][]>>;
  setCityName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedBuilding: React.Dispatch<React.SetStateAction<Building | null>>;
  handleCellUpdate: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleReset: () => void;
  handleCreateNewCity: () => Promise<void>;
  loadCityData: () => Promise<void>;
  handleSeasonChange: (season: Season) => void;
  handleTimeChange: (time: TimeOfDay) => void;
  handleSelectTemplate: (template: CityTemplate) => void;
  featureActions: CityPlannerFeatureActions;
}

export const useCityPlanner = (): [CityPlannerState, CityPlannerActions] => {
  const [grid, setGrid] = useState<GridItem[][]>(createEmptyGrid());
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [metrics, setMetrics] = useState<EnvironmentalMetrics>({
    emissions: 0,
    energy: 0,
    water: 0,
    heat: 0,
    happiness: 0,
    traffic: 0,
  });
  const [cityName, setCityName] = useState<string>('My EcoCity');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewCity, setIsNewCity] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season>('spring');
  const [currentTime, setCurrentTime] = useState<TimeOfDay>('day');
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const { toast } = useToast();

  // Initialize features integration
  const [featureState, featureActions] = useCityPlannerFeatures(
    grid,
    setGrid,
    currentSeason,
    metrics,
    setMetrics,
    handleCellUpdate,
    currentTime
  );
  
  // Update metrics when grid or season changes
  useEffect(() => {
    const updateMetrics = async () => {
      setIsLoading(true);
      try {
        // Calculate base environmental impact
        const baseMetrics = await calculateEnvironmentalImpact(grid);
        
        // Apply seasonal effects
        const seasonalMetrics = applySeasonalEffects(baseMetrics, currentSeason);
        
        // Apply disaster effects if there are any
        let modifiedMetrics = seasonalMetrics;
        if (featureState.disasterState.activeDisasters.length > 0) {
          const { applyDisasterEffects } = await import('@/utils/naturalDisasters');
          modifiedMetrics = applyDisasterEffects(
            seasonalMetrics, 
            featureState.disasterState.activeDisasters
          );
        }
        
        // Count buildings for enhanced metrics
        const buildings = grid.flat().filter(cell => cell.building);
        const buildingTypes = new Set(buildings.map(cell => cell.building?.id));
        const parkCount = buildings.filter(cell => cell.building?.category === 'greenspace').length;
        const roadCount = buildings.filter(cell => 
          cell.building?.id === 'road' || cell.building?.id === 'highway'
        ).length;
        
        // Calculate traffic based on road density and city size
        const citySize = buildings.length;
        const roadDensity = citySize > 0 ? (roadCount / citySize) * 100 : 0;
        const trafficLevel = Math.max(0, Math.min(100, 
          100 - roadDensity * 5 + (citySize / 10)
        ));
        
        // Calculate economy score based on commercial and industrial buildings
        const commercialCount = buildings.filter(cell => cell.building?.category === 'commercial').length;
        const industrialCount = buildings.filter(cell => cell.building?.category === 'industrial').length;
        const economyScore = Math.min(100, (commercialCount * 5 + industrialCount * 7));
        
        // Calculate zone balance score
        const residentialCount = buildings.filter(cell => cell.building?.category === 'residential').length;
        const zoneBalanceScore = calculateZoneBalance(residentialCount, commercialCount, industrialCount);
        
        // Calculate emissions reduction from initial state
        const initialEmissions = 100; // baseline for new cities
        const emissionsReduction = Math.max(0, Math.min(100, 
          ((initialEmissions - modifiedMetrics.emissions) / initialEmissions) * 100
        ));
        
        // Add additional derived metrics for achievements
        const enhancedMetrics = {
          ...modifiedMetrics,
          parkCount,
          renewableEnergyPercentage: calculateRenewablePercentage(grid),
          waterEfficiency: calculateWaterEfficiency(grid, modifiedMetrics),
          sustainabilityScore: 100 - Math.min(100, modifiedMetrics.emissions / 2 + modifiedMetrics.heat * 10),
          uniqueBuildingTypes: buildingTypes.size,
          population: 0, // Keep population at 0 as requested
          traffic: trafficLevel,
          economy: economyScore,
          grid: grid, // Pass the grid for achievement checks
          totalBuildingCount: buildings.length,
          zoneBalanceScore,
          emissionsReduction,
          disastersSurvived: featureState.disasterState.disasterHistory.length || 0,
          // Add education and healthcare metrics
          education: calculateEducationScore(grid),
          healthcare: calculateHealthcareScore(grid),
        };
        
        setMetrics(enhancedMetrics);
        
        // Check for achievements
        const prevAchievements = [...achievements];
        const updatedAchievements = checkAchievements(enhancedMetrics, prevAchievements);
        setAchievements(updatedAchievements);
        
        // Show notifications for newly unlocked achievements
        const newlyUnlocked = getNewlyUnlockedAchievements(prevAchievements, updatedAchievements);
        newlyUnlocked.forEach(achievement => {
          toast({
            title: `Achievement Unlocked: ${achievement.name}`,
            description: achievement.description,
          });
        });
      } catch (error) {
        console.error("Error calculating environmental impact:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updateMetrics();
  }, [grid, currentSeason, toast, featureState.disasterState.activeDisasters]);
  
  // Helper functions for metrics calculations
  const calculateRenewablePercentage = (grid: GridItem[][]): number => {
    const renewableBuildings = grid.flat().filter(cell => 
      cell.building?.category === 'infrastructure' && 
      ['solar-panel', 'wind-turbine', 'hydro-power'].includes(cell.building?.id || '')
    ).length;
    
    const totalEnergyBuildings = grid.flat().filter(cell => 
      cell.building?.category === 'infrastructure' && 
      ['solar-panel', 'wind-turbine', 'hydro-power', 'power-plant', 'geothermal-plant'].includes(cell.building?.id || '')
    ).length;
    
    return totalEnergyBuildings > 0 ? (renewableBuildings / totalEnergyBuildings) * 100 : 0;
  };
  
  const calculateWaterEfficiency = (grid: GridItem[][], metrics: EnvironmentalMetrics): number => {
    const waterTreatmentCount = grid.flat().filter(cell => 
      cell.building?.id === 'water-treatment'
    ).length;
    
    // Simplified calculation - each water treatment reduces water usage by 10%
    return Math.min(100, waterTreatmentCount * 10);
  };
  
  const calculateEducationScore = (grid: GridItem[][]): number => {
    const schools = grid.flat().filter(cell => 
      cell.building?.id === 'school' || 
      cell.building?.id === 'university' || 
      cell.building?.id === 'library'
    ).length;
    
    // Base score plus bonus for each educational building
    return Math.min(100, 20 + schools * 15);
  };
  
  const calculateHealthcareScore = (grid: GridItem[][]): number => {
    const healthcareFacilities = grid.flat().filter(cell => 
      cell.building?.id === 'hospital' || 
      cell.building?.id === 'clinic'
    ).length;
    
    // Base score plus bonus for each healthcare facility
    return Math.min(100, 15 + healthcareFacilities * 20);
  };
  
  const calculateZoneBalance = (residential: number, commercial: number, industrial: number): number => {
    // Perfect balance would be approximately 50% residential, 30% commercial, 20% industrial
    const total = residential + commercial + industrial;
    if (total === 0) return 0;
    
    const residentialRatio = residential / total;
    const commercialRatio = commercial / total;
    const industrialRatio = industrial / total;
    
    // Calculate how close the ratios are to the ideal distribution
    const residentialBalance = Math.abs(residentialRatio - 0.5);
    const commercialBalance = Math.abs(commercialRatio - 0.3);
    const industrialBalance = Math.abs(industrialRatio - 0.2);
    
    // Convert to a score where lower deviation = higher score
    const balanceScore = 100 - (residentialBalance + commercialBalance + industrialBalance) * 100;
    return Math.max(0, Math.min(100, balanceScore));
  };

  // Load city data on mount or when isNewCity changes
  const loadCityData = useCallback(async () => {
    // Skip loading current city if we've just created a new one
    if (isNewCity) {
      setIsNewCity(false);
      return;
    }
    
    try {
      // Try to load current city if it exists
      const currentCity = await getCurrentCity();
      if (currentCity) {
        setGrid(currentCity.grid);
        setMetrics(currentCity.metrics);
        setCityName(currentCity.name);
        toast({
          title: `Loaded "${currentCity.name}"`,
          description: "Continue building your sustainable city.",
        });
      } else {
        toast({
          title: "Welcome to EcoCity Planner",
          description: "Drag buildings from the palette to start building your sustainable city.",
        });
      }
    } catch (error) {
      console.error("Error loading city:", error);
      toast({
        title: "Error Loading City",
        description: "There was a problem loading your city data.",
        variant: "destructive",
      });
    }
  }, [isNewCity, toast]);

  // Cell update handler
  async function handleCellUpdate() {
    setIsLoading(true);
    try {
      const baseMetrics = await calculateEnvironmentalImpact(grid);
      const seasonalMetrics = applySeasonalEffects(baseMetrics, currentSeason);
      setMetrics(seasonalMetrics);
    } catch (error) {
      console.error("Error updating metrics:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Grid reset handler
  const handleReset = () => {
    setGrid(createEmptyGrid());
    setMetrics({
      emissions: 0,
      energy: 0,
      water: 0,
      heat: 0,
      happiness: 0,
      traffic: 0,
    });
    setSelectedBuilding(null);
    setCurrentSeason('spring');
    setAchievements(ACHIEVEMENTS);
    toast({
      title: "City Reset",
      description: "Your city has been cleared. Start building again!",
    });
  };

  // Save city handler
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cityId = await saveCity(cityName, grid, metrics);
      toast({
        title: "City Saved Successfully",
        description: `"${cityName}" has been saved to your collection.`,
      });
    } catch (error) {
      console.error("Error saving city:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your city. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create new city handler
  const handleCreateNewCity = async () => {
    setIsLoading(true);
    try {
      // Reset the state first
      setGrid(createEmptyGrid());
      setMetrics({
        emissions: 0,
        energy: 0,
        water: 0,
        heat: 0,
        happiness: 0,
        traffic: 0,
      });
      setCityName("New EcoCity");
      setSelectedBuilding(null);
      setCurrentSeason('spring');
      setAchievements(ACHIEVEMENTS);
      
      // Create a completely new city
      await createNewCity("New EcoCity");
      // Set flag to prevent loading the old city
      setIsNewCity(true);
      
      toast({
        title: "New City Created",
        description: "Start building your new sustainable city!",
      });
    } catch (error) {
      console.error("Error creating new city:", error);
      toast({
        title: "Error Creating City",
        description: "There was a problem creating a new city.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Season change handler
  const handleSeasonChange = (season: Season) => {
    setCurrentSeason(season);
  };

  // Time of day change handler
  const handleTimeChange = (time: TimeOfDay) => {
    setCurrentTime(time);
  };

  // Template selection handler
  const handleSelectTemplate = (template: CityTemplate) => {
    setGrid(template.grid);
    setCityName(`${template.name} City`);
    
    toast({
      title: `Applied "${template.name}" Template`,
      description: "The template has been applied to your city. You can now customize it further.",
    });
  };

  // State and actions
  const state: CityPlannerState = {
    grid,
    metrics,
    cityName,
    selectedBuilding,
    isLoading,
    isSaving,
    currentSeason,
    currentTime,
    achievements,
    featureState,
  };

  const actions: CityPlannerActions = {
    setGrid,
    setCityName,
    setSelectedBuilding,
    handleCellUpdate,
    handleSave,
    handleReset,
    handleCreateNewCity,
    loadCityData,
    handleSeasonChange,
    handleTimeChange,
    handleSelectTemplate,
    featureActions,
  };

  return [state, actions];
};
