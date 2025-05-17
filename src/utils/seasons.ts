
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface SeasonImpact {
  energyModifier: number;
  waterModifier: number;
  emissionsModifier: number;
  heatModifier: number;
}

export interface SeasonData {
  name: Season;
  displayName: string;
  description: string;
  icon: string;
  impact: SeasonImpact;
  color: string;
}

export const SEASONS: Record<Season, SeasonData> = {
  spring: {
    name: 'spring',
    displayName: 'Spring',
    description: 'Moderate temperatures and rainfall. Good balance for most city systems.',
    icon: '🌱',
    impact: {
      energyModifier: 0.9, // Lower energy usage due to mild temperatures
      waterModifier: 1.1, // More water usage for growing plants/gardens
      emissionsModifier: 0.95, // Slightly lower emissions
      heatModifier: 0.7, // Reduced urban heat effect
    },
    color: 'bg-green-500',
  },
  summer: {
    name: 'summer',
    displayName: 'Summer',
    description: 'Hot temperatures increase cooling costs but improve solar efficiency.',
    icon: '☀️',
    impact: {
      energyModifier: 1.3, // Higher energy use for cooling
      waterModifier: 1.5, // Much higher water usage due to heat
      emissionsModifier: 1.2, // Higher emissions from increased energy use
      heatModifier: 1.8, // Significant heat island effect
    },
    color: 'bg-yellow-500',
  },
  fall: {
    name: 'fall',
    displayName: 'Fall',
    description: 'Cooling temperatures reduce energy usage but fallen leaves require maintenance.',
    icon: '🍂',
    impact: {
      energyModifier: 0.85, // Lower energy needs
      waterModifier: 0.9, // Lower water usage
      emissionsModifier: 0.9, // Lower emissions
      heatModifier: 0.8, // Reduced heat effect
    },
    color: 'bg-orange-500',
  },
  winter: {
    name: 'winter',
    displayName: 'Winter',
    description: 'Cold temperatures increase heating costs but reduce water usage.',
    icon: '❄️',
    impact: {
      energyModifier: 1.4, // Higher energy use for heating
      waterModifier: 0.7, // Lower water usage
      emissionsModifier: 1.3, // Higher emissions from heating
      heatModifier: 0.4, // Very low heat island effect
    },
    color: 'bg-blue-500',
  }
};

export const getNextSeason = (currentSeason: Season): Season => {
  const seasons: Season[] = ['spring', 'summer', 'fall', 'winter'];
  const currentIndex = seasons.indexOf(currentSeason);
  return seasons[(currentIndex + 1) % seasons.length];
};

export const applySeasonalEffects = (metrics: any, season: Season) => {
  const seasonData = SEASONS[season];
  const { impact } = seasonData;
  
  return {
    ...metrics,
    energy: metrics.energy * impact.energyModifier,
    water: metrics.water * impact.waterModifier,
    emissions: metrics.emissions * impact.emissionsModifier,
    heat: metrics.heat * impact.heatModifier,
  };
};
