
import { GridItem } from './environmental';

export interface PopulationState {
  total: number;
  distribution: {
    residential: number;
    commercial: number;
    industrial: number;
    parks: number;
    other: number;
  };
  density: number; // People per grid cell
  commuters: number; // People commuting from outside
  traffic: number; // Traffic congestion level (0-100)
}

export const DEFAULT_POPULATION: PopulationState = {
  total: 0,
  distribution: {
    residential: 0,
    commercial: 0,
    industrial: 0,
    parks: 0,
    other: 0
  },
  density: 0,
  commuters: 0,
  traffic: 0
};

// Calculate population distribution based on grid layout
export const calculatePopulationDistribution = (
  grid: GridItem[][],
  totalPopulation: number
): PopulationState => {
  // Count different building types
  const residentialCells = grid.flat().filter(cell => 
    cell.building?.category === 'residential'
  ).length;
  
  const commercialCells = grid.flat().filter(cell => 
    cell.building?.category === 'commercial'
  ).length;
  
  const industrialCells = grid.flat().filter(cell => 
    cell.building?.category === 'industrial'
  ).length;
  
  const parkCells = grid.flat().filter(cell => 
    cell.building?.category === 'greenspace'
  ).length;
  
  const otherCells = grid.flat().filter(cell => 
    cell.building && 
    !['residential', 'commercial', 'industrial', 'greenspace'].includes(cell.building.category)
  ).length;
  
  // Residential distribution - based on building size
  const residentialDistribution = residentialCells > 0 ? 
    Math.min(1.0, residentialCells * 0.05) * totalPopulation : 0;
  
  // Calculate employees based on commercial and industrial buildings
  const commercialEmployees = commercialCells * 15;
  const industrialEmployees = industrialCells * 8;
  
  // Calculate commuters - people who work but don't live in the city
  const totalJobs = commercialEmployees + industrialEmployees;
  const workingPopulation = residentialDistribution * 0.6; // 60% of residents work
  const commuters = Math.max(0, totalJobs - workingPopulation);
  
  // Calculate traffic congestion based on commuters and road infrastructure
  const roadCells = grid.flat().filter(cell => 
    cell.building?.id === 'road'
  ).length;
  
  const trafficBase = (commuters / Math.max(1, totalPopulation + commuters)) * 100;
  const trafficReduction = Math.min(0.8, roadCells * 0.05); // Roads reduce traffic
  const traffic = Math.min(100, Math.max(0, trafficBase * (1 - trafficReduction)));
  
  // Calculate population distribution
  const distribution = {
    residential: Math.round(residentialDistribution),
    commercial: Math.round(commercialCells > 0 ? totalPopulation * 0.3 : 0), // 30% of people are in commercial areas
    industrial: Math.round(industrialCells > 0 ? totalPopulation * 0.15 : 0), // 15% in industrial
    parks: Math.round(parkCells > 0 ? totalPopulation * 0.1 : 0), // 10% in parks
    other: Math.round(totalPopulation * 0.05), // 5% elsewhere
  };
  
  // Calculate density
  const totalCells = grid.length * grid[0].length;
  const density = totalPopulation / Math.max(1, totalCells);
  
  return {
    total: totalPopulation,
    distribution,
    density,
    commuters: Math.round(commuters),
    traffic: Math.round(traffic)
  };
};

// Get agent positions for visualization based on population distribution
export const getPopulationAgents = (
  grid: GridItem[][],
  population: PopulationState,
  timeOfDay: string,
  maxAgents: number = 100
): { x: number; y: number; type: 'resident' | 'worker' | 'visitor' }[] => {
  const agents: { x: number; y: number; type: 'resident' | 'worker' | 'visitor' }[] = [];
  
  // Scale down the actual population to a manageable number of agents
  const scaleFactor = Math.min(1, maxAgents / Math.max(1, population.total));
  
  // Number of agents for each category
  const residentCount = Math.round(population.distribution.residential * scaleFactor);
  const workerCount = Math.round((population.distribution.commercial + population.distribution.industrial) * scaleFactor);
  const visitorCount = Math.round((population.distribution.parks + population.distribution.other) * scaleFactor);
  
  // Filter cells by category
  const residentialCells = grid.flat().filter(cell => cell.building?.category === 'residential');
  const workCells = grid.flat().filter(cell => 
    cell.building?.category === 'commercial' || cell.building?.category === 'industrial'
  );
  const leisureCells = grid.flat().filter(cell => 
    cell.building?.category === 'greenspace' || 
    (cell.building && !['residential', 'commercial', 'industrial'].includes(cell.building.category))
  );
  
  // Time of day affects distribution
  let residentialWeight = 0.6;
  let workWeight = 0.3;
  let leisureWeight = 0.1;
  
  if (timeOfDay === 'day') {
    residentialWeight = 0.2;
    workWeight = 0.7;
    leisureWeight = 0.1;
  } else if (timeOfDay === 'dusk') {
    residentialWeight = 0.4;
    workWeight = 0.2;
    leisureWeight = 0.4;
  } else if (timeOfDay === 'night') {
    residentialWeight = 0.8;
    workWeight = 0.1;
    leisureWeight = 0.1;
  }
  
  // Adjusted counts based on time of day
  const adjustedResidentCount = Math.round(maxAgents * residentialWeight);
  const adjustedWorkerCount = Math.round(maxAgents * workWeight);
  const adjustedVisitorCount = Math.round(maxAgents * leisureWeight);
  
  // Place resident agents
  if (residentialCells.length > 0 && adjustedResidentCount > 0) {
    for (let i = 0; i < adjustedResidentCount; i++) {
      const randomCell = residentialCells[Math.floor(Math.random() * residentialCells.length)];
      agents.push({
        x: randomCell.x,
        y: randomCell.y,
        type: 'resident'
      });
    }
  }
  
  // Place worker agents
  if (workCells.length > 0 && adjustedWorkerCount > 0) {
    for (let i = 0; i < adjustedWorkerCount; i++) {
      const randomCell = workCells[Math.floor(Math.random() * workCells.length)];
      agents.push({
        x: randomCell.x,
        y: randomCell.y,
        type: 'worker'
      });
    }
  }
  
  // Place visitor agents
  if (leisureCells.length > 0 && adjustedVisitorCount > 0) {
    for (let i = 0; i < adjustedVisitorCount; i++) {
      const randomCell = leisureCells[Math.floor(Math.random() * leisureCells.length)];
      agents.push({
        x: randomCell.x,
        y: randomCell.y,
        type: 'visitor'
      });
    }
  }
  
  return agents;
};
