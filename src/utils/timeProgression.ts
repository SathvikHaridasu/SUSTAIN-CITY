
import { GridItem } from './environmental';

export type SimulationYear = number;
export type GrowthRate = number;

// Define simulation speeds
export const SIMULATION_SPEEDS = {
  slow: 5000,  // 5 seconds per year
  medium: 3000, // 3 seconds per year
  fast: 1000    // 1 second per year
};

export interface TimeProgressionState {
  currentYear: SimulationYear;
  isSimulating?: boolean;
  simulationSpeed: 'slow' | 'medium' | 'fast';
}

export const DEFAULT_TIME_STATE: TimeProgressionState = {
  currentYear: 2025,
  isSimulating: false,
  simulationSpeed: 'medium'
};

// Dummy function for calculateCityGrowth to resolve import error
export const calculateCityGrowth = (
  grid: GridItem[][],
  currentPopulation: number,
  growthRate: number = 0.05
): number => {
  // This function is a placeholder and won't actually be used
  // since we're removing time simulation functionality
  return currentPopulation;
};

export const calculateTrafficLevel = (grid: GridItem[][]): number => {
  // Count roads and buildings to calculate traffic congestion
  const roadCells = grid.flat().filter(cell => 
    cell.building?.id === 'road' || 
    cell.building?.id === 'highway'
  ).length;
  
  const buildingCells = grid.flat().filter(cell => 
    cell.building && 
    cell.building.id !== 'road' && 
    cell.building.id !== 'highway'
  ).length;
  
  if (buildingCells === 0) return 0;
  if (roadCells === 0) return 100; // Maximum traffic with no roads
  
  // Calculate road to building ratio - better ratio means less traffic
  const ratio = roadCells / buildingCells;
  
  // Optimal ratio is around 0.4 (40% roads to 60% buildings)
  // Below 0.2 means severe traffic, above 0.6 means overbuilt roads
  if (ratio < 0.1) return 95; // Severe traffic congestion
  if (ratio < 0.2) return 80;
  if (ratio < 0.3) return 60;
  if (ratio < 0.4) return 40;
  if (ratio < 0.5) return 20;
  if (ratio < 0.6) return 10; // Optimal traffic flow
  return 15; // Slightly overbuilt road network
};

export const calculateZoneBalance = (grid: GridItem[][]): number => {
  const residentialCells = grid.flat().filter(cell => 
    cell.building?.category === 'residential'
  ).length;
  
  const commercialCells = grid.flat().filter(cell => 
    cell.building?.category === 'commercial'
  ).length;
  
  const industrialCells = grid.flat().filter(cell => 
    cell.building?.category === 'industrial'
  ).length;
  
  const totalZonedCells = residentialCells + commercialCells + industrialCells;
  
  if (totalZonedCells === 0) return 0;
  
  // Calculate percentages
  const residentialPercent = (residentialCells / totalZonedCells) * 100;
  const commercialPercent = (commercialCells / totalZonedCells) * 100;
  const industrialPercent = (industrialCells / totalZonedCells) * 100;
  
  // Ideal balance is approximately 60% residential, 30% commercial, 10% industrial
  const residentialBalance = Math.abs(residentialPercent - 60);
  const commercialBalance = Math.abs(commercialPercent - 30);
  const industrialBalance = Math.abs(industrialPercent - 10);
  
  // Calculate balance score (lower deviation = higher score)
  const maxDeviation = 100; // Maximum possible deviation
  const actualDeviation = residentialBalance + commercialBalance + industrialBalance;
  
  return Math.max(0, 100 - (actualDeviation / maxDeviation * 100));
};
