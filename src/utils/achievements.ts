
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (metrics: any) => boolean;
  unlocked?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'green-thumbs',
    name: 'Green Thumbs',
    description: 'Place 5 or more parks in your city',
    icon: '🌳',
    condition: (metrics: any) => metrics.parkCount >= 5,
  },
  {
    id: 'renewable-future',
    name: 'Renewable Future',
    description: 'Generate more than 50% of your energy from renewable sources',
    icon: '☀️',
    condition: (metrics: any) => metrics.renewableEnergyPercentage >= 50,
  },
  {
    id: 'water-saver',
    name: 'Water Guardian',
    description: 'Reduce water consumption by 30% through efficient buildings',
    icon: '💧',
    condition: (metrics: any) => metrics.waterEfficiency >= 30,
  },
  {
    id: 'carbon-neutral',
    name: 'Carbon Neutral',
    description: 'Achieve net-zero carbon emissions in your city',
    icon: '🌱',
    condition: (metrics: any) => metrics.emissions <= 0,
  },
  {
    id: 'happy-citizens',
    name: 'Happy Citizens',
    description: 'Reach a happiness score of 80 or higher',
    icon: '😊',
    condition: (metrics: any) => metrics.happiness >= 80,
  },
  {
    id: 'master-planner',
    name: 'Master Planner',
    description: 'Build a city with a sustainability score of 90 or higher',
    icon: '🏆',
    condition: (metrics: any) => metrics.sustainabilityScore >= 90,
  },
  {
    id: 'eco-architect',
    name: 'Eco Architect',
    description: 'Place at least 15 different types of buildings',
    icon: '🏢',
    condition: (metrics: any) => metrics.uniqueBuildingTypes >= 15,
  },
  {
    id: 'traffic-manager',
    name: 'Traffic Manager',
    description: 'Keep traffic congestion below 20 despite having a large population',
    icon: '🚦',
    condition: (metrics: any) => metrics.traffic <= 20 && metrics.population >= 1000,
  },
  // New achievements
  {
    id: 'green-grid',
    name: 'Green Grid',
    description: 'Place at least 10 solar panels in your city',
    icon: '🔋',
    condition: (metrics: any) => metrics.solarPanelCount >= 10,
  },
  {
    id: 'clean-air-initiative',
    name: 'Clean Air Initiative',
    description: 'Reduce emissions by 50% from your initial city design',
    icon: '💨',
    condition: (metrics: any) => metrics.emissionsReduction >= 50,
  },
  {
    id: 'urban-planner',
    name: 'Urban Planner',
    description: 'Create a city with at least 100 buildings',
    icon: '🏙️',
    condition: (metrics: any) => metrics.totalBuildingCount >= 100,
  },
  {
    id: 'balance-master',
    name: 'Balance Master',
    description: 'Maintain equal distribution of residential, commercial, and industrial zones',
    icon: '⚖️',
    condition: (metrics: any) => metrics.zoneBalanceScore >= 80,
  },
  {
    id: 'disaster-survivor',
    name: 'Disaster Survivor',
    description: 'Successfully recover from 3 or more natural disasters',
    icon: '🌪️',
    condition: (metrics: any) => metrics.disastersSurvived >= 3,
  },
  {
    id: 'road-network',
    name: 'Road Network',
    description: 'Build a comprehensive road network with at least 20 road segments',
    icon: '🛣️',
    condition: (metrics: any) => metrics.roadSegments >= 20,
  },
  {
    id: 'economic-marvel',
    name: 'Economic Marvel',
    description: 'Achieve an economic strength score above 90',
    icon: '💰',
    condition: (metrics: any) => metrics.economy >= 90,
  },
  {
    id: 'futuristic-city',
    name: 'Futuristic City',
    description: 'Implement at least 5 advanced technology buildings',
    icon: '🔬',
    condition: (metrics: any) => metrics.advancedTechBuildingCount >= 5,
  }
];

export const checkAchievements = (metrics: any, currentAchievements: Achievement[]): Achievement[] => {
  // Create enhanced metrics with derived values for achievement conditions
  const enhancedMetrics = {
    ...metrics,
    parkCount: metrics.parkCount || 0,
    renewableEnergyPercentage: metrics.renewableEnergyPercentage || 0,
    waterEfficiency: metrics.waterEfficiency || 0,
    sustainabilityScore: metrics.sustainabilityScore || 0,
    uniqueBuildingTypes: metrics.uniqueBuildingTypes || 0,
    population: metrics.population || 0,
    // New metrics for new achievements
    solarPanelCount: (metrics.grid?.flat() || [])
      .filter(cell => cell.building?.id === 'solar-panel').length || 0,
    emissionsReduction: metrics.emissionsReduction || 0,
    totalBuildingCount: (metrics.grid?.flat() || [])
      .filter(cell => cell.building).length || 0,
    zoneBalanceScore: metrics.zoneBalanceScore || 0,
    disastersSurvived: metrics.disastersSurvived || 0,
    roadSegments: (metrics.grid?.flat() || [])
      .filter(cell => cell.building?.id === 'road' || 
                      cell.building?.id === 'highway').length || 0,
    advancedTechBuildingCount: (metrics.grid?.flat() || [])
      .filter(cell => ['smart-grid', 'research-center', 'eco-highrise'].includes(cell.building?.id)).length || 0
  };

  // Check which achievements should be unlocked based on current metrics
  return ACHIEVEMENTS.map(achievement => {
    const existingAchievement = currentAchievements.find(a => a.id === achievement.id);
    const unlocked = existingAchievement?.unlocked || achievement.condition(enhancedMetrics);
    
    return {
      ...achievement,
      unlocked,
    };
  });
};

export const getNewlyUnlockedAchievements = (
  previousAchievements: Achievement[],
  currentAchievements: Achievement[]
): Achievement[] => {
  return currentAchievements.filter(current => {
    const previous = previousAchievements.find(p => p.id === current.id);
    return current.unlocked && (!previous || !previous.unlocked);
  });
};
