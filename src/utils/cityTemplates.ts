import { GridItem } from '@/utils/environmental';
import { BUILDINGS } from '@/utils/buildings';
import { createEmptyGrid } from '@/utils/gridUtils';

export interface CityTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  thumbnail: string;
  grid: GridItem[][];
}

// Helper to place a building in the template grid
const placeBuilding = (grid: GridItem[][], x: number, y: number, buildingId: string) => {
  const building = BUILDINGS.find(b => b.id === buildingId);
  if (building) {
    grid[x][y] = { x, y, building };
  }
  return grid;
};

// Helper to place roads in a line
const placeRoads = (grid: GridItem[][], startX: number, startY: number, length: number, direction: 'horizontal' | 'vertical') => {
  for (let i = 0; i < length; i++) {
    if (direction === 'horizontal') {
      placeBuilding(grid, startX + i, startY, 'road');
    } else {
      placeBuilding(grid, startX, startY + i, 'road');
    }
  }
  return grid;
};

// Helper for creating grid patterns
const placeGridPattern = (grid: GridItem[][], startX: number, startY: number, width: number, height: number, roadSpacing: number) => {
  // Horizontal roads
  for (let y = 0; y < height; y += roadSpacing) {
    placeRoads(grid, startX, startY + y, width, 'horizontal');
  }
  
  // Vertical roads
  for (let x = 0; x < width; x += roadSpacing) {
    placeRoads(grid, startX + x, startY, height, 'vertical');
  }
  
  return grid;
};

// Helper to fill empty blocks with buildings randomly
const fillEmptyBlocksWithBuildings = (grid: GridItem[][], buildingTypes: string[], density = 0.8) => {
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      // Skip if there's already something here
      if (grid[x][y]?.building) continue;
      
      // Random chance to place a building based on density
      if (Math.random() < density) {
        const randomBuildingType = buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
        placeBuilding(grid, x, y, randomBuildingType);
      }
    }
  }
  return grid;
};

export const CITY_TEMPLATES: CityTemplate[] = [
  {
    id: 'eco-village',
    name: 'Eco Village',
    description: 'A small village focused on sustainability and self-sufficiency.',
    difficulty: 'easy',
    thumbnail: '🏡',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Road network to reduce traffic
      placeRoads(grid, 3, 6, 14, 'horizontal'); // Main east-west road
      placeRoads(grid, 3, 12, 14, 'horizontal'); // Secondary east-west road
      placeRoads(grid, 6, 6, 6, 'vertical'); // North-south connector 1
      placeRoads(grid, 10, 6, 6, 'vertical'); // North-south connector 2
      placeRoads(grid, 14, 6, 6, 'vertical'); // North-south connector 3
      
      // Additional roads for better connectivity
      placeRoads(grid, 3, 9, 14, 'horizontal'); // Middle connector road
      placeRoads(grid, 8, 6, 6, 'vertical'); // Extra north-south connector
      placeRoads(grid, 12, 6, 6, 'vertical'); // Extra north-south connector
      
      // Place multiple solar panels in a solar farm area
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 3 + i, 3 + j, 'solar-panel');
        }
      }
      
      // Wind farm
      placeBuilding(grid, 8, 2, 'wind-turbine');
      placeBuilding(grid, 10, 2, 'wind-turbine');
      placeBuilding(grid, 12, 2, 'wind-turbine');
      placeBuilding(grid, 14, 2, 'wind-turbine');
      placeBuilding(grid, 16, 2, 'wind-turbine'); // Added extra turbine
      
      // Renewable energy
      placeBuilding(grid, 16, 3, 'solar-farm');
      placeBuilding(grid, 16, 4, 'solar-farm'); // Added extra solar farm
      
      // Residential district - increased density
      placeBuilding(grid, 4, 7, 'residential-house');
      placeBuilding(grid, 5, 7, 'residential-house');
      placeBuilding(grid, 6, 7, 'residential-house');
      placeBuilding(grid, 7, 7, 'residential-house');
      placeBuilding(grid, 4, 8, 'residential-house');
      placeBuilding(grid, 6, 8, 'residential-house');
      placeBuilding(grid, 8, 8, 'residential-house');
      placeBuilding(grid, 4, 10, 'residential-house');
      placeBuilding(grid, 5, 10, 'residential-house');
      placeBuilding(grid, 7, 10, 'residential-house');
      placeBuilding(grid, 8, 10, 'residential-house');
      placeBuilding(grid, 10, 7, 'apartment-building');
      placeBuilding(grid, 12, 7, 'apartment-building');
      placeBuilding(grid, 10, 9, 'apartment-building');
      placeBuilding(grid, 12, 9, 'apartment-building');
      placeBuilding(grid, 5, 14, 'green-apartment');
      placeBuilding(grid, 7, 14, 'green-apartment');
      placeBuilding(grid, 9, 14, 'green-apartment');
      
      // Commercial area - expanded
      placeBuilding(grid, 11, 6, 'retail-store');
      placeBuilding(grid, 12, 6, 'retail-store');
      placeBuilding(grid, 13, 6, 'retail-store');
      placeBuilding(grid, 14, 6, 'office-building');
      placeBuilding(grid, 15, 6, 'office-building');
      placeBuilding(grid, 12, 4, 'farmers-market');
      placeBuilding(grid, 13, 4, 'retail-store');
      
      // Parks and green spaces
      placeBuilding(grid, 6, 12, 'park');
      placeBuilding(grid, 8, 12, 'park');
      placeBuilding(grid, 4, 16, 'community-garden');
      placeBuilding(grid, 6, 16, 'community-garden');
      placeBuilding(grid, 8, 16, 'community-garden');
      placeBuilding(grid, 12, 16, 'rain-garden');
      placeBuilding(grid, 14, 16, 'rain-garden');
      
      // Infrastructure
      placeBuilding(grid, 14, 10, 'water-treatment');
      placeBuilding(grid, 14, 12, 'recycling-center');
      placeBuilding(grid, 16, 8, 'public-transit');
      placeBuilding(grid, 16, 10, 'public-transit');
      placeBuilding(grid, 16, 12, 'public-transit');
      placeBuilding(grid, 16, 14, 'electric-vehicle-station');
      
      // Education and community
      placeBuilding(grid, 10, 12, 'school');
      placeBuilding(grid, 12, 14, 'library');
      placeBuilding(grid, 10, 14, 'hospital');
      
      // Fill empty spaces with additional buildings
      const buildingTypes = ['residential-house', 'green-apartment', 'office-building', 'retail-store', 'park'];
      fillEmptyBlocksWithBuildings(grid, buildingTypes, 0.3);
      
      return grid;
    })()
  },
  {
    id: 'dense-urban',
    name: 'Dense Urban Core',
    description: 'A high-density urban center with efficient public transportation.',
    difficulty: 'medium',
    thumbnail: '🏙️',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Comprehensive road network
      // Main avenues
      placeRoads(grid, 2, 4, 16, 'horizontal');
      placeRoads(grid, 2, 8, 16, 'horizontal');
      placeRoads(grid, 2, 12, 16, 'horizontal');
      placeRoads(grid, 2, 16, 16, 'horizontal');
      
      // Cross streets
      placeRoads(grid, 2, 4, 12, 'vertical');
      placeRoads(grid, 6, 4, 12, 'vertical');
      placeRoads(grid, 10, 4, 12, 'vertical');
      placeRoads(grid, 14, 4, 12, 'vertical');
      placeRoads(grid, 18, 4, 12, 'vertical');
      
      // Additional cross streets for better connectivity
      placeRoads(grid, 4, 4, 12, 'vertical');
      placeRoads(grid, 8, 4, 12, 'vertical');
      placeRoads(grid, 12, 4, 12, 'vertical');
      placeRoads(grid, 16, 4, 12, 'vertical');
      
      // Downtown commercial district - increased density
      placeBuilding(grid, 5, 5, 'office-building');
      placeBuilding(grid, 7, 5, 'office-building');
      placeBuilding(grid, 9, 5, 'office-building');
      placeBuilding(grid, 11, 5, 'office-building');
      placeBuilding(grid, 13, 5, 'office-building');
      placeBuilding(grid, 15, 5, 'office-building');
      
      placeBuilding(grid, 7, 7, 'office-building');
      placeBuilding(grid, 9, 7, 'office-building');
      placeBuilding(grid, 11, 7, 'office-building');
      placeBuilding(grid, 13, 7, 'office-building');
      placeBuilding(grid, 15, 7, 'shopping-mall');
      
      // Add more commercial buildings
      placeBuilding(grid, 7, 9, 'shopping-mall');
      placeBuilding(grid, 9, 9, 'retail-store');
      placeBuilding(grid, 11, 9, 'retail-store');
      placeBuilding(grid, 13, 9, 'retail-store');
      placeBuilding(grid, 15, 9, 'retail-store');
      placeBuilding(grid, 17, 7, 'retail-store');
      
      // High-density residential areas - more buildings
      placeBuilding(grid, 3, 5, 'high-rise');
      placeBuilding(grid, 5, 9, 'high-rise');
      placeBuilding(grid, 5, 11, 'high-rise');
      placeBuilding(grid, 5, 13, 'high-rise');
      placeBuilding(grid, 5, 15, 'high-rise');
      placeBuilding(grid, 15, 5, 'high-rise');
      placeBuilding(grid, 15, 11, 'high-rise');
      placeBuilding(grid, 15, 13, 'high-rise');
      placeBuilding(grid, 17, 9, 'high-rise');
      placeBuilding(grid, 17, 11, 'high-rise');
      
      // Medium-density residential - more buildings
      placeBuilding(grid, 3, 7, 'apartment-building');
      placeBuilding(grid, 3, 9, 'apartment-building');
      placeBuilding(grid, 3, 11, 'apartment-building');
      placeBuilding(grid, 3, 13, 'apartment-building');
      placeBuilding(grid, 3, 15, 'apartment-building');
      placeBuilding(grid, 3, 17, 'apartment-building');
      placeBuilding(grid, 17, 5, 'apartment-building');
      placeBuilding(grid, 17, 13, 'apartment-building');
      placeBuilding(grid, 17, 15, 'apartment-building');
      placeBuilding(grid, 17, 17, 'apartment-building');
      
      // Green apartments
      placeBuilding(grid, 5, 17, 'green-apartment');
      placeBuilding(grid, 7, 15, 'green-apartment');
      placeBuilding(grid, 7, 17, 'green-apartment');
      placeBuilding(grid, 9, 15, 'green-apartment');
      
      // Public transit network - expanded
      placeBuilding(grid, 7, 5, 'public-transit');
      placeBuilding(grid, 11, 5, 'public-transit');
      placeBuilding(grid, 7, 13, 'public-transit');
      placeBuilding(grid, 11, 13, 'public-transit');
      placeBuilding(grid, 15, 17, 'public-transit');
      placeBuilding(grid, 9, 5, 'public-transit');
      placeBuilding(grid, 9, 13, 'public-transit');
      
      // Green spaces interspersed
      placeBuilding(grid, 9, 11, 'park');
      placeBuilding(grid, 9, 17, 'park');
      placeBuilding(grid, 11, 17, 'park');
      placeBuilding(grid, 13, 15, 'green-roof');
      placeBuilding(grid, 13, 17, 'green-roof');
      placeBuilding(grid, 15, 15, 'rain-garden');
      placeBuilding(grid, 13, 11, 'community-garden');
      
      // Infrastructure and services
      placeBuilding(grid, 13, 5, 'hospital');
      placeBuilding(grid, 11, 11, 'school');
      placeBuilding(grid, 11, 15, 'library');
      placeBuilding(grid, 7, 11, 'electric-vehicle-station');
      placeBuilding(grid, 11, 9, 'electric-vehicle-station');
      placeBuilding(grid, 15, 11, 'bike-sharing');
      
      // Clean energy sources
      placeBuilding(grid, 17, 17, 'solar-farm');
      placeBuilding(grid, 3, 17, 'recycling-center');
      placeBuilding(grid, 19, 5, 'geothermal-plant');
      placeBuilding(grid, 19, 9, 'geothermal-plant');
      
      // Fill empty spaces with additional buildings
      const buildingTypes = ['apartment-building', 'office-building', 'retail-store', 'high-rise', 'green-roof'];
      fillEmptyBlocksWithBuildings(grid, buildingTypes, 0.6);
      
      return grid;
    })()
  },
  {
    id: 'sustainable-tech',
    name: 'Sustainable Tech Hub',
    description: 'A modern city focused on technology and green innovation.',
    difficulty: 'hard',
    thumbnail: '🔬',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Comprehensive smart road network
      // Main avenues (horizontal)
      placeRoads(grid, 2, 2, 16, 'horizontal');
      placeRoads(grid, 2, 6, 16, 'horizontal');
      placeRoads(grid, 2, 9, 16, 'horizontal');
      placeRoads(grid, 2, 13, 16, 'horizontal');
      placeRoads(grid, 2, 17, 16, 'horizontal');
      
      // Additional horizontal roads
      placeRoads(grid, 2, 4, 16, 'horizontal');
      placeRoads(grid, 2, 11, 16, 'horizontal');
      placeRoads(grid, 2, 15, 16, 'horizontal');
      
      // Cross streets (vertical)
      placeRoads(grid, 2, 2, 16, 'vertical');
      placeRoads(grid, 6, 2, 16, 'vertical');
      placeRoads(grid, 10, 2, 16, 'vertical');
      placeRoads(grid, 14, 2, 16, 'vertical');
      placeRoads(grid, 18, 2, 16, 'vertical');
      
      // Additional vertical roads
      placeRoads(grid, 4, 2, 16, 'vertical');
      placeRoads(grid, 8, 2, 16, 'vertical');
      placeRoads(grid, 12, 2, 16, 'vertical');
      placeRoads(grid, 16, 2, 16, 'vertical');
      
      // Tech campus - large office buildings - increased density
      placeBuilding(grid, 5, 5, 'office-building');
      placeBuilding(grid, 7, 5, 'office-building');
      placeBuilding(grid, 9, 5, 'office-building');
      placeBuilding(grid, 11, 5, 'office-building');
      placeBuilding(grid, 13, 5, 'office-building');
      
      placeBuilding(grid, 5, 7, 'office-building');
      placeBuilding(grid, 7, 7, 'office-building');
      placeBuilding(grid, 9, 7, 'office-building');
      placeBuilding(grid, 11, 7, 'office-building');
      placeBuilding(grid, 13, 7, 'office-building');
      
      placeBuilding(grid, 5, 3, 'office-building');
      placeBuilding(grid, 7, 3, 'office-building');
      placeBuilding(grid, 9, 3, 'office-building');
      placeBuilding(grid, 11, 3, 'office-building');
      placeBuilding(grid, 13, 3, 'office-building');
      
      // Research facilities - expanded
      placeBuilding(grid, 3, 5, 'research-lab');
      placeBuilding(grid, 3, 7, 'research-lab');
      placeBuilding(grid, 15, 5, 'research-lab');
      placeBuilding(grid, 15, 7, 'research-lab');
      placeBuilding(grid, 17, 5, 'research-lab');
      placeBuilding(grid, 17, 7, 'research-lab');
      placeBuilding(grid, 7, 18, 'research-lab');
      placeBuilding(grid, 9, 18, 'research-lab');
      placeBuilding(grid, 11, 18, 'research-lab');
      
      // Renewable energy sources - large deployment
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 3, 10 + i, 'solar-panel');
          placeBuilding(grid, 5, 10 + i, 'solar-panel');
        }
      }
      
      // Wind turbines in a wind farm
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 15 + j*2, 10 + i, 'wind-turbine');
        }
      }
      
      // Solar farm - expanded
      placeBuilding(grid, 15, 16, 'solar-farm');
      placeBuilding(grid, 17, 16, 'solar-farm');
      
      // Sustainable housing - increased density
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 7 + i*2, 10 + j, 'green-apartment');
        }
      }
      
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 7 + i*2, 12 + j, 'green-apartment');
        }
      }
      
      placeBuilding(grid, 3, 18, 'residential-house');
      placeBuilding(grid, 5, 18, 'residential-house');
      
      // Commercial and community spaces
      placeBuilding(grid, 7, 15, 'farmers-market');
      placeBuilding(grid, 9, 15, 'library');
      placeBuilding(grid, 11, 15, 'retail-store');
      placeBuilding(grid, 13, 15, 'retail-store');
      placeBuilding(grid, 15, 14, 'retail-store');
      
      // Innovative green infrastructure
      placeBuilding(grid, 7, 3, 'rain-garden');
      placeBuilding(grid, 9, 3, 'rain-garden');
      placeBuilding(grid, 11, 3, 'rain-garden');
      placeBuilding(grid, 13, 3, 'rain-garden');
      
      // Green roofs on buildings
      placeBuilding(grid, 7, 14, 'green-roof');
      placeBuilding(grid, 9, 14, 'green-roof');
      placeBuilding(grid, 11, 14, 'green-roof');
      placeBuilding(grid, 13, 14, 'green-roof');
      placeBuilding(grid, 15, 12, 'green-roof');
      
      // Sustainable transportation
      placeBuilding(grid, 3, 3, 'bike-sharing');
      placeBuilding(grid, 3, 8, 'bike-sharing');
      placeBuilding(grid, 5, 15, 'electric-vehicle-station');
      placeBuilding(grid, 7, 17, 'public-transit');
      placeBuilding(grid, 11, 17, 'public-transit');
      placeBuilding(grid, 15, 17, 'public-transit');
      
      // Parks and green spaces
      placeBuilding(grid, 17, 14, 'park');
      placeBuilding(grid, 19, 14, 'park');
      placeBuilding(grid, 17, 18, 'community-garden');
      placeBuilding(grid, 19, 18, 'community-garden');
      placeBuilding(grid, 13, 18, 'park');
      placeBuilding(grid, 15, 18, 'park');
      
      // Water treatment and recycling
      placeBuilding(grid, 3, 16, 'water-treatment');
      placeBuilding(grid, 5, 16, 'recycling-center');
      placeBuilding(grid, 19, 5, 'geothermal-plant');
      placeBuilding(grid, 19, 7, 'geothermal-plant');
      
      // Additional infrastructure
      placeBuilding(grid, 17, 3, 'hospital');
      placeBuilding(grid, 19, 11, 'school');
      placeBuilding(grid, 19, 13, 'sports-complex');
      
      // Fill remaining blocks with buildings
      const buildingTypes = ['office-building', 'research-lab', 'green-apartment', 'retail-store', 'green-roof'];
      fillEmptyBlocksWithBuildings(grid, buildingTypes, 0.7);
      
      return grid;
    })()
  },
  {
    id: 'green-suburbia',
    name: 'Green Suburbia',
    description: 'A suburban layout with focus on green spaces and sustainable living.',
    difficulty: 'easy',
    thumbnail: '🌳',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Suburban road network with cul-de-sacs
      placeRoads(grid, 2, 5, 16, 'horizontal'); // Main road
      placeRoads(grid, 2, 10, 16, 'horizontal'); // Secondary road
      placeRoads(grid, 2, 15, 16, 'horizontal'); // Tertiary road
      
      // Vertical connecting roads
      placeRoads(grid, 5, 5, 10, 'vertical');
      placeRoads(grid, 10, 5, 10, 'vertical');
      placeRoads(grid, 15, 5, 10, 'vertical');
      
      // Cul-de-sacs
      placeRoads(grid, 2, 7, 2, 'vertical');
      placeRoads(grid, 2, 12, 2, 'vertical');
      placeRoads(grid, 18, 7, 2, 'vertical');
      placeRoads(grid, 18, 12, 2, 'vertical');
      
      // Residential houses throughout the suburb
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 3 + i, 6 + j, 'residential-house');
          placeBuilding(grid, 12 + i, 6 + j, 'residential-house');
          placeBuilding(grid, 3 + i, 11 + j, 'residential-house');
          placeBuilding(grid, 12 + i, 11 + j, 'residential-house');
        }
      }
      
      // Green apartments in select areas
      placeBuilding(grid, 7, 7, 'green-apartment');
      placeBuilding(grid, 9, 7, 'green-apartment');
      placeBuilding(grid, 7, 12, 'green-apartment');
      placeBuilding(grid, 9, 12, 'green-apartment');
      
      // Local commercial center
      placeBuilding(grid, 6, 3, 'retail-store');
      placeBuilding(grid, 8, 3, 'retail-store');
      placeBuilding(grid, 10, 3, 'retail-store');
      placeBuilding(grid, 12, 3, 'retail-store');
      placeBuilding(grid, 14, 3, 'farmers-market');
      
      // Community facilities
      placeBuilding(grid, 7, 16, 'school');
      placeBuilding(grid, 10, 16, 'library');
      placeBuilding(grid, 13, 16, 'sports-complex');
      
      // Distributed parks and green spaces
      placeBuilding(grid, 4, 3, 'park');
      placeBuilding(grid, 16, 3, 'park');
      placeBuilding(grid, 4, 17, 'community-garden');
      placeBuilding(grid, 16, 17, 'community-garden');
      placeBuilding(grid, 10, 9, 'park');
      placeBuilding(grid, 10, 14, 'park');
      
      // Sustainable infrastructure
      placeBuilding(grid, 3, 9, 'solar-panel');
      placeBuilding(grid, 3, 14, 'solar-panel');
      placeBuilding(grid, 17, 9, 'solar-panel');
      placeBuilding(grid, 17, 14, 'solar-panel');
      placeBuilding(grid, 7, 17, 'water-treatment');
      placeBuilding(grid, 13, 17, 'recycling-center');
      
      // EV stations and bike sharing
      placeBuilding(grid, 6, 5, 'electric-vehicle-station');
      placeBuilding(grid, 15, 5, 'electric-vehicle-station');
      placeBuilding(grid, 6, 15, 'bike-sharing');
      placeBuilding(grid, 15, 15, 'bike-sharing');
      
      // Rain gardens and green roofs for stormwater management
      placeBuilding(grid, 4, 8, 'rain-garden');
      placeBuilding(grid, 4, 13, 'rain-garden');
      placeBuilding(grid, 16, 8, 'rain-garden');
      placeBuilding(grid, 16, 13, 'rain-garden');
      
      return grid;
    })()
  },
  {
    id: 'industrial-revival',
    name: 'Industrial Revival',
    description: 'A former industrial area being transformed into a sustainable mixed-use district.',
    difficulty: 'hard',
    thumbnail: '🏭',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Industrial-style grid road network
      placeGridPattern(grid, 2, 2, 16, 16, 4);
      
      // Add additional roads for better traffic flow
      placeRoads(grid, 4, 3, 12, 'horizontal');
      placeRoads(grid, 4, 7, 12, 'horizontal');
      placeRoads(grid, 4, 11, 12, 'horizontal');
      placeRoads(grid, 4, 15, 12, 'horizontal');
      
      // Former industrial buildings being repurposed
      placeBuilding(grid, 3, 3, 'factory');
      placeBuilding(grid, 7, 3, 'factory');
      placeBuilding(grid, 11, 3, 'factory');
      placeBuilding(grid, 15, 3, 'factory');
      
      // New green industry
      placeBuilding(grid, 3, 7, 'recycling-center');
      placeBuilding(grid, 7, 7, 'research-lab');
      placeBuilding(grid, 11, 7, 'research-lab');
      placeBuilding(grid, 15, 7, 'green-manufacturing');
      
      // Mixed-use development
      placeBuilding(grid, 3, 11, 'office-building');
      placeBuilding(grid, 5, 11, 'office-building');
      placeBuilding(grid, 7, 11, 'green-apartment');
      placeBuilding(grid, 9, 11, 'green-apartment');
      placeBuilding(grid, 11, 11, 'retail-store');
      placeBuilding(grid, 13, 11, 'retail-store');
      placeBuilding(grid, 15, 11, 'shopping-mall');
      
      // Community and recreational spaces
      placeBuilding(grid, 3, 15, 'community-garden');
      placeBuilding(grid, 5, 15, 'library');
      placeBuilding(grid, 7, 15, 'park');
      placeBuilding(grid, 9, 15, 'park');
      placeBuilding(grid, 11, 15, 'sports-complex');
      placeBuilding(grid, 15, 15, 'public-transit');
      
      // Green infrastructure
      placeBuilding(grid, 3, 5, 'solar-farm');
      placeBuilding(grid, 11, 5, 'water-treatment');
      placeBuilding(grid, 15, 5, 'geothermal-plant');
      
      // Sustainable housing in former warehouse district
      placeBuilding(grid, 3, 9, 'high-rise');
      placeBuilding(grid, 5, 9, 'high-rise');
      placeBuilding(grid, 15, 9, 'apartment-building');
      placeBuilding(grid, 17, 9, 'apartment-building');
      
      // Green roofs to reduce heat island effect
      placeBuilding(grid, 7, 5, 'green-roof');
      placeBuilding(grid, 9, 5, 'green-roof');
      placeBuilding(grid, 13, 9, 'green-roof');
      placeBuilding(grid, 17, 11, 'green-roof');
      
      // Rain gardens for stormwater management
      placeBuilding(grid, 5, 13, 'rain-garden');
      placeBuilding(grid, 9, 13, 'rain-garden');
      placeBuilding(grid, 13, 13, 'rain-garden');
      placeBuilding(grid, 17, 13, 'rain-garden');
      
      // Mobility options
      placeBuilding(grid, 13, 5, 'electric-vehicle-station');
      placeBuilding(grid, 5, 7, 'bike-sharing');
      placeBuilding(grid, 13, 7, 'bike-sharing');
      placeBuilding(grid, 13, 15, 'public-transit');
      placeBuilding(grid, 17, 15, 'public-transit');
      
      return grid;
    })()
  },
  {
    id: 'coastal-resilience',
    name: 'Coastal Resilience',
    description: 'A coastal city designed to withstand climate change and rising sea levels.',
    difficulty: 'medium',
    thumbnail: '🌊',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Elevated road network to handle flooding
      placeRoads(grid, 2, 3, 16, 'horizontal'); // Main coastal road
      placeRoads(grid, 2, 7, 16, 'horizontal'); // Secondary road
      placeRoads(grid, 2, 11, 16, 'horizontal'); // Tertiary road
      placeRoads(grid, 2, 15, 16, 'horizontal'); // Inland road
      
      // North-south connections
      placeRoads(grid, 5, 3, 12, 'vertical');
      placeRoads(grid, 10, 3, 12, 'vertical');
      placeRoads(grid, 15, 3, 12, 'vertical');
      
      // Coastal protection infrastructure
      for (let i = 0; i < 9; i++) {
        placeBuilding(grid, 2 + (i*2), 1, 'sea-wall');
      }
      
      // Rain gardens for stormwater management
      for (let i = 0; i < 7; i++) {
        placeBuilding(grid, 3 + (i*2), 5, 'rain-garden');
      }
      
      // Elevated housing
      placeBuilding(grid, 4, 8, 'residential-house');
      placeBuilding(grid, 6, 8, 'residential-house');
      placeBuilding(grid, 8, 8, 'residential-house');
      placeBuilding(grid, 4, 10, 'residential-house');
      placeBuilding(grid, 6, 10, 'residential-house');
      placeBuilding(grid, 8, 10, 'residential-house');
      
      // Resilient apartment buildings
      placeBuilding(grid, 12, 8, 'green-apartment');
      placeBuilding(grid, 14, 8, 'green-apartment');
      placeBuilding(grid, 16, 8, 'green-apartment');
      placeBuilding(grid, 12, 10, 'green-apartment');
      placeBuilding(grid, 14, 10, 'green-apartment');
      placeBuilding(grid, 16, 10, 'green-apartment');
      
      // Commercial district on higher ground
      placeBuilding(grid, 3, 13, 'retail-store');
      placeBuilding(grid, 5, 13, 'retail-store');
      placeBuilding(grid, 7, 13, 'retail-store');
      placeBuilding(grid, 9, 13, 'office-building');
      placeBuilding(grid, 11, 13, 'office-building');
      
      // Clean energy
      placeBuilding(grid, 14, 13, 'wind-turbine');
      placeBuilding(grid, 16, 13, 'wind-turbine');
      placeBuilding(grid, 18, 13, 'wind-turbine');
      placeBuilding(grid, 3, 17, 'solar-farm');
      placeBuilding(grid, 7, 17, 'solar-farm');
      
      // Water management
      placeBuilding(grid, 11, 17, 'water-treatment');
      placeBuilding(grid, 13, 17, 'water-treatment');
      
      // Green spaces designed for flood control
      placeBuilding(grid, 15, 17, 'park');
      placeBuilding(grid, 17, 17, 'park');
      
      // Emergency services and community resources
      placeBuilding(grid, 9, 17, 'hospital');
      placeBuilding(grid, 17, 7, 'school');
      placeBuilding(grid, 17, 5, 'library');
      
      // Transportation hubs on elevated areas
      placeBuilding(grid, 3, 8, 'public-transit');
      placeBuilding(grid, 11, 8, 'public-transit');
      placeBuilding(grid, 13, 5, 'public-transit');
      
      // Bike sharing for resilient transportation
      placeBuilding(grid, 7, 5, 'bike-sharing');
      placeBuilding(grid, 11, 5, 'bike-sharing');
      
      // Electric vehicle stations
      placeBuilding(grid, 7, 13, 'electric-vehicle-station');
      placeBuilding(grid, 13, 13, 'electric-vehicle-station');
      
      return grid;
    })()
  },
  {
    id: 'smart-city',
    name: 'Smart City',
    description: 'A city powered by IoT, data analytics, and sustainable technology.',
    difficulty: 'hard',
    thumbnail: '🧠',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Smart grid road network
      placeGridPattern(grid, 2, 2, 16, 16, 4);
      
      // Smart traffic management systems
      for (let i = 0; i < 4; i++) {
        placeBuilding(grid, 6 + i*4, 10, 'smart-traffic-system');
      }
      
      // Central innovation district
      placeBuilding(grid, 9, 9, 'tech-hub');
      placeBuilding(grid, 11, 9, 'research-lab');
      placeBuilding(grid, 9, 7, 'research-lab');
      placeBuilding(grid, 11, 7, 'tech-hub');
      placeBuilding(grid, 7, 7, 'office-building');
      placeBuilding(grid, 7, 9, 'office-building');
      
      // Smart residential areas
      placeBuilding(grid, 5, 5, 'smart-apartment');
      placeBuilding(grid, 7, 5, 'smart-apartment');
      placeBuilding(grid, 9, 5, 'smart-apartment');
      placeBuilding(grid, 11, 5, 'smart-apartment');
      placeBuilding(grid, 13, 5, 'smart-apartment');
      
      // Renewable energy infrastructure
      placeBuilding(grid, 14, 14, 'solar-farm');
      placeBuilding(grid, 14, 16, 'solar-farm');
      placeBuilding(grid, 16, 14, 'wind-turbine');
      placeBuilding(grid, 16, 16, 'wind-turbine');
      placeBuilding(grid, 5, 14, 'geothermal-plant');
      placeBuilding(grid, 5, 16, 'geothermal-plant');
      
      // Autonomous vehicle infrastructure
      for (let i = 0; i < 3; i++) {
        placeBuilding(grid, 3 + i*6, 12, 'autonomous-vehicle-hub');
      }
      
      // Smart waste management
      placeBuilding(grid, 3, 3, 'recycling-center');
      placeBuilding(grid, 5, 3, 'water-treatment');
      
      // Green smart buildings
      placeBuilding(grid, 15, 5, 'green-roof');
      placeBuilding(grid, 17, 5, 'green-roof');
      placeBuilding(grid, 15, 7, 'green-roof');
      placeBuilding(grid, 17, 7, 'green-roof');
      
      // Urban farming centers
      placeBuilding(grid, 3, 5, 'community-garden');
      placeBuilding(grid, 3, 7, 'vertical-farm');
      placeBuilding(grid, 3, 9, 'community-garden');
      
      // Data centers with renewable energy
      placeBuilding(grid, 17, 9, 'data-center');
      placeBuilding(grid, 17, 11, 'data-center');
      
      // Smart public services
      placeBuilding(grid, 9, 3, 'smart-hospital');
      placeBuilding(grid, 11, 3, 'smart-school');
      placeBuilding(grid, 13, 3, 'library');
      
      // Micro-mobility hubs
      for (let i = 0; i < 4; i++) {
        placeBuilding(grid, 7 + i*3, 18, 'bike-sharing');
      }
      
      return grid;
    })()
  },
  {
    id: 'carbon-neutral',
    name: 'Carbon Neutral City',
    description: 'A zero-emissions city with cutting-edge green technology and passive design.',
    difficulty: 'medium',
    thumbnail: '♻️',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Car-free pedestrian roads
      for (let i = 0; i < 3; i++) {
        placeRoads(grid, 3, 5 + i*5, 16, 'horizontal');
      }
      for (let i = 0; i < 4; i++) {
        placeRoads(grid, 5 + i*4, 5, 11, 'vertical');
      }
      
      // Massive solar & wind generation
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          placeBuilding(grid, 2 + j*2, 2 + i*2, 'solar-panel');
          placeBuilding(grid, 16 + j*2, 2 + i*2, 'wind-turbine');
        }
      }
      
      // Green building cluster
      placeBuilding(grid, 7, 7, 'passive-house');
      placeBuilding(grid, 9, 7, 'passive-house');
      placeBuilding(grid, 11, 7, 'passive-house');
      placeBuilding(grid, 13, 7, 'passive-house');
      
      // Mixed-use sustainable development
      placeBuilding(grid, 7, 9, 'green-apartment');
      placeBuilding(grid, 9, 9, 'green-apartment');
      placeBuilding(grid, 11, 9, 'green-office');
      placeBuilding(grid, 13, 9, 'green-office');
      
      // Zero-waste infrastructure
      placeBuilding(grid, 5, 12, 'recycling-center');
      placeBuilding(grid, 5, 14, 'compost-facility');
      placeBuilding(grid, 5, 16, 'water-treatment');
      
      // Urban farming & green spaces
      placeBuilding(grid, 15, 16, 'vertical-farm');
      placeBuilding(grid, 17, 16, 'vertical-farm');
      placeBuilding(grid, 15, 18, 'community-garden');
      placeBuilding(grid, 17, 18, 'community-garden');
      
      // Biophilic design centers
      placeBuilding(grid, 9, 12, 'green-roof');
      placeBuilding(grid, 11, 12, 'green-roof');
      placeBuilding(grid, 9, 14, 'rain-garden');
      placeBuilding(grid, 11, 14, 'rain-garden');
      
      // Community buildings
      placeBuilding(grid, 15, 12, 'community-center');
      placeBuilding(grid, 17, 12, 'library');
      placeBuilding(grid, 15, 14, 'co-working-space');
      
      // Sustainable transportation
      for (let i = 0; i < 4; i++) {
        placeBuilding(grid, 7 + i*3, 16, 'electric-vehicle-station');
      }
      
      // Clean energy research
      placeBuilding(grid, 9, 3, 'research-lab');
      placeBuilding(grid, 11, 3, 'research-lab');
      
      // Renewable material manufacturing
      placeBuilding(grid, 13, 16, 'green-manufacturing');
      placeBuilding(grid, 13, 18, 'green-manufacturing');
      
      return grid;
    })()
  },
  {
    id: 'circular-economy',
    name: 'Circular Economy',
    description: 'A city where waste is eliminated and resources are continuously reused.',
    difficulty: 'hard',
    thumbnail: '🔄',
    grid: (() => {
      const grid = createEmptyGrid();
      
      // Ring road structure
      // Outer ring
      for (let i = 5; i <= 15; i++) {
        placeBuilding(grid, i, 5, 'road');
        placeBuilding(grid, i, 15, 'road');
      }
      for (let i = 6; i <= 14; i++) {
        placeBuilding(grid, 5, i, 'road');
        placeBuilding(grid, 15, i, 'road');
      }
      
      // Inner ring
      for (let i = 8; i <= 12; i++) {
        placeBuilding(grid, i, 8, 'road');
        placeBuilding(grid, i, 12, 'road');
      }
      for (let i = 9; i <= 11; i++) {
        placeBuilding(grid, 8, i, 'road');
        placeBuilding(grid, 12, i, 'road');
      }
      
      // Spokes connecting rings
      placeBuilding(grid, 7, 7, 'road');
      placeBuilding(grid, 13, 7, 'road');
      placeBuilding(grid, 7, 13, 'road');
      placeBuilding(grid, 13, 13, 'road');
      
      // Material recovery and processing facilities
      placeBuilding(grid, 10, 2, 'recycling-center');
      placeBuilding(grid, 10, 4, 'material-recovery');
      placeBuilding(grid, 10, 18, 'waste-to-energy');
      placeBuilding(grid, 10, 16, 'compost-facility');
      
      // Remanufacturing centers
      placeBuilding(grid, 2, 10, 'remanufacturing-hub');
      placeBuilding(grid, 4, 10, 'repair-cafe');
      placeBuilding(grid, 18, 10, 'upcycling-center');
      placeBuilding(grid, 16, 10, 'sharing-depot');
      
      // Circular housing
      placeBuilding(grid, 6, 6, 'modular-housing');
      placeBuilding(grid, 6, 9, 'modular-housing');
      placeBuilding(grid, 6, 11, 'modular-housing');
      placeBuilding(grid, 6, 14, 'modular-housing');
      
      // Circular businesses
      placeBuilding(grid, 14, 6, 'circular-office');
      placeBuilding(grid, 14, 9, 'circular-retail');
      placeBuilding(grid, 14, 11, 'circular-factory');
      placeBuilding(grid, 14, 14, 'circular-retail');
      
      // Central innovation district
      placeBuilding(grid, 9, 9, 'research-lab');
      placeBuilding(grid, 9, 11, 'research-lab');
      placeBuilding(grid, 11, 9, 'tech-hub');
      placeBuilding(grid, 11, 11, 'tech-hub');
      
      // Clean energy
      placeBuilding(grid, 3, 3, 'solar-farm');
      placeBuilding(grid, 3, 17, 'solar-farm');
      placeBuilding(grid, 17, 3, 'wind-turbine');
      placeBuilding(grid, 17, 17, 'wind-turbine');
      
      // Water management
      placeBuilding(grid, 7, 2, 'water-treatment');
      placeBuilding(grid, 7, 18, 'water-harvesting');
      
      // Urban agriculture
      placeBuilding(grid, 2, 7, 'vertical-farm');
      placeBuilding(grid, 18, 7, 'aquaponics-farm');
      placeBuilding(grid, 2, 13, 'community-garden');
      placeBuilding(grid, 18, 13, 'food-forest');
      
      return grid;
    })()
  }
];

export const getCityTemplateById = (id: string): CityTemplate | undefined => {
  return CITY_TEMPLATES.find(template => template.id === id);
};
