import { GridItem, EnvironmentalMetrics } from './environmental';
import { Season } from './seasons';

export type DisasterType = 'flood' | 'heat-wave' | 'storm' | 'drought' | 'wildfire';

export interface Disaster {
  type: DisasterType;
  name: string;
  description: string;
  duration: number; // In simulation years
  remainingDuration: number;
  icon: string;
  impactModifiers: {
    emissions: number;
    energy: number;
    water: number;
    heat: number;
    happiness: number;
    traffic: number;
  };
  affectedCategories: string[];
}

export interface DisasterState {
  activeDisasters: Disaster[];
  lastDisasterYear?: number;
  disasterHistory: Disaster[]; // To track disasters for achievements
  disasterChance: number; // Adding this missing property
}

export const DISASTER_TYPES: Record<DisasterType, Omit<Disaster, 'remainingDuration'>> = {
  'flood': {
    type: 'flood',
    name: 'Flood',
    description: 'Rising water levels have caused flooding in low-lying areas',
    duration: 2,
    icon: '🌊',
    impactModifiers: {
      emissions: 0.9, // Reduced industrial activity
      energy: 0.7, // Power infrastructure damage
      water: 1.5, // Excess water but reduced clean water
      heat: 0.8, // Cooling effect
      happiness: 0.6, // Significant negative impact
      traffic: 0.5, // Major traffic disruption
    },
    affectedCategories: ['residential', 'commercial', 'industrial']
  },
  'heat-wave': {
    type: 'heat-wave',
    name: 'Heat Wave',
    description: 'Extreme temperatures are straining energy systems and affecting residents',
    duration: 1,
    icon: '🔥',
    impactModifiers: {
      emissions: 1.2, // Increased energy usage
      energy: 1.5, // High cooling demand
      water: 1.4, // Increased water usage
      heat: 2.0, // Major heat increase
      happiness: 0.7, // Significant negative impact
      traffic: 0.8, // Minor traffic impact
    },
    affectedCategories: ['residential', 'greenspace', 'agricultural']
  },
  'storm': {
    type: 'storm',
    name: 'Severe Storm',
    description: 'Strong winds and rain are causing damage to infrastructure',
    duration: 1,
    icon: '⛈️',
    impactModifiers: {
      emissions: 0.8,
      energy: 0.6, // Power outages
      water: 1.3, // Excess water
      heat: 0.9,
      happiness: 0.7,
      traffic: 0.6, // Major traffic disruption
    },
    affectedCategories: ['infrastructure', 'commercial', 'residential']
  },
  'drought': {
    type: 'drought',
    name: 'Drought',
    description: 'Water shortages are affecting agriculture and quality of life',
    duration: 3,
    icon: '🏜️',
    impactModifiers: {
      emissions: 1.0,
      energy: 1.1, // Slightly increased energy usage
      water: 0.4, // Severe water shortage
      heat: 1.3, // Increased heat
      happiness: 0.8,
      traffic: 1.0, // No impact on traffic
    },
    affectedCategories: ['agricultural', 'greenspace', 'residential']
  },
  'wildfire': {
    type: 'wildfire',
    name: 'Wildfire',
    description: 'Fires are threatening areas of the city and reducing air quality',
    duration: 2,
    icon: '🔥',
    impactModifiers: {
      emissions: 1.5, // Increased emissions from fire
      energy: 0.9,
      water: 0.7, // Water diverted to firefighting
      heat: 1.4, // Increased heat
      happiness: 0.5, // Major negative impact
      traffic: 0.7, // Evacuation traffic
    },
    affectedCategories: ['greenspace', 'agricultural', 'residential']
  }
};

export const DEFAULT_DISASTER_STATE: DisasterState = {
  activeDisasters: [],
  disasterHistory: [], // Initialize as empty array
  disasterChance: 0.05 // Default disaster chance
};

export const checkForNaturalDisaster = (
  grid: GridItem[][],
  season: Season,
  metrics: EnvironmentalMetrics,
  currentYear: number,
  disasterState: DisasterState,
  disasterProbability?: number // Optional parameter
): DisasterState => {
  const newDisasterState = { ...disasterState };
  
  // Update existing disasters
  newDisasterState.activeDisasters = newDisasterState.activeDisasters
    .map(disaster => ({
      ...disaster,
      remainingDuration: disaster.remainingDuration - 1
    }))
    .filter(disaster => disaster.remainingDuration > 0);

  // Calculate chance of a new disaster based on environmental factors
  let disasterChance = disasterState.disasterChance;
  
  // If a probability was passed in, use that instead
  if (disasterProbability !== undefined) {
    disasterChance = disasterProbability;
  }
  
  // High emissions increase disaster chance
  if (metrics.emissions > 500) disasterChance += 0.05;
  
  // Seasonal effects
  if (season === 'summer' && metrics.heat > 300) {
    disasterChance += 0.1; // Heat waves more common in summer with high heat
  } else if (season === 'spring') {
    disasterChance += 0.05; // Floods more common in spring
  }

  // Random check if a disaster occurs
  if (Math.random() < disasterChance && newDisasterState.activeDisasters.length === 0) {
    // Determine which disaster type based on conditions
    const possibleDisasters: DisasterType[] = [];
    
    // Consider seasonal and environmental conditions for disaster selection
    if (season === 'summer' && metrics.heat > 200) {
      possibleDisasters.push('heat-wave', 'drought', 'wildfire');
    } else if (season === 'spring' && metrics.water > 200) {
      possibleDisasters.push('flood', 'storm');
    } else if (season === 'fall') {
      possibleDisasters.push('storm', 'wildfire');
    } else if (season === 'winter') {
      possibleDisasters.push('storm');
    }
    
    // Default options if none match specific conditions
    if (possibleDisasters.length === 0) {
      possibleDisasters.push('flood', 'storm', 'heat-wave', 'drought', 'wildfire');
    }
    
    // Select random disaster from possible options
    const disasterType = possibleDisasters[Math.floor(Math.random() * possibleDisasters.length)];
    const disasterTemplate = DISASTER_TYPES[disasterType];
    
    // Create new disaster
    const newDisaster: Disaster = {
      ...disasterTemplate,
      remainingDuration: disasterTemplate.duration
    };
    
    newDisasterState.activeDisasters.push(newDisaster);
    newDisasterState.disasterHistory.push(newDisaster);
    newDisasterState.lastDisasterYear = currentYear;
  }
  
  return newDisasterState;
};

// Apply disaster effects to environmental metrics
export const applyDisasterEffects = (
  metrics: EnvironmentalMetrics,
  activeDisasters: Disaster[]
): EnvironmentalMetrics => {
  if (activeDisasters.length === 0) return metrics;
  
  // Apply effects from all active disasters
  return activeDisasters.reduce((modifiedMetrics, disaster) => {
    return {
      emissions: modifiedMetrics.emissions * disaster.impactModifiers.emissions,
      energy: modifiedMetrics.energy * disaster.impactModifiers.energy,
      water: modifiedMetrics.water * disaster.impactModifiers.water,
      heat: modifiedMetrics.heat * disaster.impactModifiers.heat,
      happiness: modifiedMetrics.happiness * disaster.impactModifiers.happiness,
      traffic: modifiedMetrics.traffic * disaster.impactModifiers.traffic,
    };
  }, metrics);
};
