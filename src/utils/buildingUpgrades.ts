
import { Building } from './buildings';
import { GridItem } from './environmental';

export interface BuildingUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  applicableBuildings: string[]; // Building IDs this upgrade applies to
  applicableCategories: string[]; // Building categories this upgrade applies to
  environmentalImpact: {
    emissions: number; // Multiplier for the building's emissions (e.g., 0.8 means 20% reduction)
    energy: number;
    water: number;
    heat: number;
    happiness: number; // Usually positive for upgrades
  };
  icon: string;
  requiresYear?: number; // Minimum simulation year required
}

export const BUILDING_UPGRADES: BuildingUpgrade[] = [
  {
    id: 'solar-panels',
    name: 'Solar Panels',
    description: 'Add solar panels to reduce energy usage and emissions',
    cost: 100,
    applicableBuildings: [],
    applicableCategories: ['residential', 'commercial', 'industrial'],
    environmentalImpact: {
      emissions: 0.8,
      energy: 0.7,
      water: 1.0,
      heat: 0.95,
      happiness: 1.1
    },
    icon: '☀️'
  },
  {
    id: 'green-roof',
    name: 'Green Roof',
    description: 'Install a green roof to reduce heat and increase happiness',
    cost: 150,
    applicableBuildings: [],
    applicableCategories: ['residential', 'commercial'],
    environmentalImpact: {
      emissions: 0.9,
      energy: 0.85,
      water: 1.2,
      heat: 0.7,
      happiness: 1.2
    },
    icon: '🌱'
  },
  {
    id: 'water-recycling',
    name: 'Water Recycling',
    description: 'Implement water recycling systems to reduce water consumption',
    cost: 120,
    applicableBuildings: [],
    applicableCategories: ['residential', 'commercial', 'industrial'],
    environmentalImpact: {
      emissions: 1.0,
      energy: 1.05,
      water: 0.6,
      heat: 1.0,
      happiness: 1.05
    },
    icon: '💧'
  },
  {
    id: 'energy-efficient-appliances',
    name: 'Energy Efficient Appliances',
    description: 'Upgrade to energy efficient appliances and systems',
    cost: 80,
    applicableBuildings: [],
    applicableCategories: ['residential', 'commercial'],
    environmentalImpact: {
      emissions: 0.85,
      energy: 0.75,
      water: 0.9,
      heat: 0.95,
      happiness: 1.05
    },
    icon: '⚡'
  },
  {
    id: 'advanced-insulation',
    name: 'Advanced Insulation',
    description: 'Improve building insulation to reduce energy usage',
    cost: 90,
    applicableBuildings: [],
    applicableCategories: ['residential', 'commercial', 'industrial'],
    environmentalImpact: {
      emissions: 0.9,
      energy: 0.8,
      water: 1.0,
      heat: 0.85,
      happiness: 1.1
    },
    icon: '🧱'
  },
  {
    id: 'clean-production',
    name: 'Clean Production Methods',
    description: 'Implement cleaner production processes to reduce pollution',
    cost: 200,
    applicableBuildings: [],
    applicableCategories: ['industrial'],
    environmentalImpact: {
      emissions: 0.6,
      energy: 0.9,
      water: 0.8,
      heat: 0.9,
      happiness: 1.15
    },
    icon: '🏭',
    requiresYear: 2030
  },
  {
    id: 'smart-grid',
    name: 'Smart Grid Integration',
    description: 'Connect buildings to a smart energy grid for optimal efficiency',
    cost: 150,
    applicableBuildings: [],
    applicableCategories: ['residential', 'commercial', 'industrial'],
    environmentalImpact: {
      emissions: 0.8,
      energy: 0.7,
      water: 1.0,
      heat: 0.9,
      happiness: 1.1
    },
    icon: '🔌',
    requiresYear: 2028
  }
];

export interface UpgradedBuilding extends Building {
  upgrades: string[]; // IDs of applied upgrades
}

export const isUpgradedBuilding = (building: Building): building is UpgradedBuilding => {
  return 'upgrades' in building;
};

export const canUpgradeBuilding = (
  building: Building, 
  upgrade: BuildingUpgrade,
  currentYear: number
): boolean => {
  // Check if the building already has this upgrade
  if (isUpgradedBuilding(building) && building.upgrades.includes(upgrade.id)) {
    return false;
  }
  
  // Check if upgrade is applicable to this building type
  const isApplicableCategory = upgrade.applicableCategories.includes(building.category);
  const isApplicableBuilding = upgrade.applicableBuildings.includes(building.id);
  
  // Check year requirement
  const meetsYearRequirement = !upgrade.requiresYear || currentYear >= upgrade.requiresYear;
  
  return (isApplicableCategory || isApplicableBuilding) && meetsYearRequirement;
};

export const applyBuildingUpgrade = (
  building: Building,
  upgradeId: string
): UpgradedBuilding => {
  const existingUpgrades = isUpgradedBuilding(building) ? building.upgrades : [];
  
  // Create new upgraded building
  return {
    ...building,
    upgrades: [...existingUpgrades, upgradeId]
  };
};

// Calculate the environmental impact of all upgrades on a building
export const calculateUpgradesImpact = (
  building: Building,
  baseImpact: { emissions: number; energy: number; water: number; heat: number; happiness: number; }
): { emissions: number; energy: number; water: number; heat: number; happiness: number; } => {
  if (!isUpgradedBuilding(building) || building.upgrades.length === 0) {
    return baseImpact;
  }
  
  return building.upgrades.reduce((impact, upgradeId) => {
    const upgrade = BUILDING_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return impact;
    
    return {
      emissions: impact.emissions * upgrade.environmentalImpact.emissions,
      energy: impact.energy * upgrade.environmentalImpact.energy,
      water: impact.water * upgrade.environmentalImpact.water,
      heat: impact.heat * upgrade.environmentalImpact.heat,
      happiness: impact.happiness * upgrade.environmentalImpact.happiness,
    };
  }, baseImpact);
};
