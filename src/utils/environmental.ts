import { Building } from './buildings';
import { getWeatherAdjustedImpact } from '@/services/environmentalApi';

export interface GridItem {
  x: number;
  y: number;
  building: Building | null;
}

export interface EnvironmentalMetrics {
  emissions: number;
  energy: number;
  water: number;
  heat: number;
  happiness: number;
  traffic?: number;
  education?: number;
  healthcare?: number;
  economy?: number;
}

function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getNeighboringBuildings(grid: GridItem[][], centerX: number, centerY: number, radius: number): GridItem[] {
  const neighbors: GridItem[] = [];
  
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (x === centerX && y === centerY) continue;
      
      const distance = calculateDistance(centerX, centerY, x, y);
      
      if (distance <= radius && grid[x][y].building) {
        neighbors.push(grid[x][y]);
      }
    }
  }
  
  return neighbors;
}

function calculateMitigationEffect(neighbors: GridItem[]): number {
  let mitigationFactor = 1.0;
  
  for (const neighbor of neighbors) {
    if (neighbor.building) {
      if (neighbor.building.category === 'greenspace') {
        mitigationFactor -= 0.05;
      } else if (neighbor.building.id === 'solar-farm') {
        mitigationFactor -= 0.08;
      } else if (neighbor.building.id === 'wind-farm') {
        mitigationFactor -= 0.07;
      } else if (neighbor.building.id === 'green-roof') {
        mitigationFactor -= 0.03;
      }
    }
  }
  
  return Math.max(0.5, mitigationFactor);
}

function calculateSynergyEffect(cell: GridItem, neighbors: GridItem[]): number {
  let synergyFactor = 1.0;
  
  if (!cell.building) return synergyFactor;
  
  const hasResidential = neighbors.some(n => n.building?.category === 'residential');
  const hasCommercial = neighbors.some(n => n.building?.category === 'commercial');
  const hasEducational = neighbors.some(n => n.building?.category === 'educational');
  const hasHealthcare = neighbors.some(n => n.building?.category === 'healthcare');
  const hasEntertainment = neighbors.some(n => n.building?.category === 'entertainment');
  const hasGreenspace = neighbors.some(n => n.building?.category === 'greenspace');
  
  if (hasResidential && hasCommercial) {
    synergyFactor -= 0.1;
  }
  
  if (hasResidential && hasCommercial && hasEducational && hasHealthcare && hasGreenspace) {
    synergyFactor -= 0.2;
  }
  
  if (cell.building.category === 'residential' && hasEntertainment) {
    synergyFactor -= 0.15;
  }
  
  if (cell.building.category === 'residential' && hasEducational) {
    synergyFactor -= 0.12;
  }
  
  if (cell.building.category === 'residential') {
    const nearbyIndustrial = neighbors.filter(n => n.building?.category === 'industrial');
    if (nearbyIndustrial.length > 0) {
      synergyFactor += 0.15 * nearbyIndustrial.length;
    }
  }
  
  if (cell.building.category === 'residential') {
    const nearbyAgricultural = neighbors.filter(n => n.building?.category === 'agricultural');
    if (nearbyAgricultural.length > 0) {
      synergyFactor -= 0.05 * nearbyAgricultural.length;
    }
  }
  
  return synergyFactor;
}

function calculateTrafficCongestion(grid: GridItem[][]): number {
  let roadCount = 0;
  let residentialCount = 0;
  let commercialCount = 0;
  let industrialCount = 0;
  let educationalCount = 0;
  let healthcareCount = 0;
  
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const building = grid[x][y].building;
      if (building) {
        if (building.id === 'road') roadCount++;
        if (building.category === 'residential') residentialCount++;
        if (building.category === 'commercial') commercialCount++;
        if (building.category === 'industrial') industrialCount++;
        if (building.category === 'educational') educationalCount++;
        if (building.category === 'healthcare') healthcareCount++;
      }
    }
  }
  
  if ((residentialCount + commercialCount + industrialCount + educationalCount + healthcareCount) === 0) return 0;
  if (roadCount === 0) return 80;
  
  const buildingDensity = (
    residentialCount + 
    commercialCount * 1.5 + 
    industrialCount * 2 + 
    educationalCount * 1.3 + 
    healthcareCount * 1.2
  ) / (grid.length * grid[0].length);
  
  const roadCapacityFactor = Math.min(1, (residentialCount + commercialCount + industrialCount + educationalCount + healthcareCount) / (roadCount * 3));
  
  let trafficScore = buildingDensity * 100 * roadCapacityFactor;
  
  const hasPublicTransit = grid.some(row => row.some(cell => cell.building?.id === 'public-transit'));
  if (hasPublicTransit) {
    trafficScore *= 0.6;
  }
  
  return Math.min(100, Math.round(trafficScore));
}

function calculateEducationLevel(grid: GridItem[][]): number {
  let educationScore = 0;
  let residentialCount = 0;
  let schoolCount = 0;
  let universityCount = 0;
  
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const building = grid[x][y].building;
      if (building) {
        if (building.category === 'residential') {
          if (building.id === 'residential-house') residentialCount += 1;
          else if (building.id === 'apartment-building') residentialCount += 3;
          else if (building.id === 'high-rise') residentialCount += 5;
        }
        if (building.id === 'school') schoolCount++;
        if (building.id === 'university') universityCount++;
      }
    }
  }
  
  if (residentialCount === 0) return 0;
  
  const schoolFactor = Math.min(1, schoolCount / Math.max(1, residentialCount / 10));
  const universityFactor = Math.min(1, universityCount / Math.max(1, residentialCount / 20));
  
  educationScore = (schoolFactor * 60) + (universityFactor * 40);
  
  return Math.min(100, Math.round(educationScore));
}

function calculateHealthcareQuality(grid: GridItem[][]): number {
  let healthcareScore = 0;
  let residentialCount = 0;
  let hospitalCount = 0;
  
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const building = grid[x][y].building;
      if (building) {
        if (building.category === 'residential') {
          if (building.id === 'residential-house') residentialCount += 1;
          else if (building.id === 'apartment-building') residentialCount += 3;
          else if (building.id === 'high-rise') residentialCount += 5;
        }
        if (building.id === 'hospital') hospitalCount++;
      }
    }
  }
  
  if (residentialCount === 0) return 0;
  
  const hospitalFactor = Math.min(1, hospitalCount / Math.max(1, residentialCount / 15));
  
  healthcareScore = hospitalFactor * 100;
  
  return Math.min(100, Math.round(healthcareScore));
}

function calculateEconomyStrength(grid: GridItem[][]): number {
  let economyScore = 0;
  let residentialCount = 0;
  let commercialCount = 0;
  let industrialCount = 0;
  let officeCount = 0;
  let retailCount = 0;
  let mallCount = 0;
  let educationLevel = 0;
  
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const building = grid[x][y].building;
      if (building) {
        if (building.category === 'residential') {
          if (building.id === 'residential-house') residentialCount += 1;
          else if (building.id === 'apartment-building') residentialCount += 3;
          else if (building.id === 'high-rise') residentialCount += 5;
        }
        if (building.category === 'commercial') commercialCount++;
        if (building.category === 'industrial') industrialCount++;
        if (building.id === 'office-building') officeCount++;
        if (building.id === 'retail-store') retailCount++;
        if (building.id === 'shopping-mall') mallCount++;
      }
    }
  }
  
  educationLevel = calculateEducationLevel(grid);
  
  if (residentialCount + commercialCount + industrialCount === 0) return 0;
  
  const commercialFactor = commercialCount * 10;
  const industrialFactor = industrialCount * 15;
  const officeFactor = officeCount * 12;
  const retailFactor = retailCount * 8;
  const mallFactor = mallCount * 25;
  
  const populationFactor = Math.min(50, residentialCount);
  const educationBonus = educationLevel * 0.3;
  
  economyScore = (
    commercialFactor + 
    industrialFactor + 
    officeFactor + 
    retailFactor + 
    mallFactor + 
    populationFactor + 
    educationBonus
  ) / 5;
  
  return Math.min(100, Math.round(economyScore));
}

export async function calculateEnvironmentalImpact(grid: GridItem[][]): Promise<EnvironmentalMetrics> {
  const metrics: EnvironmentalMetrics = {
    emissions: 0,
    energy: 0,
    water: 0,
    heat: 0,
    happiness: 0,
    traffic: 0,
    education: 0,
    healthcare: 0,
    economy: 0,
  };

  metrics.traffic = calculateTrafficCongestion(grid);
  
  metrics.education = calculateEducationLevel(grid);
  
  metrics.healthcare = calculateHealthcareQuality(grid);
  
  metrics.economy = calculateEconomyStrength(grid);

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      const cell = grid[x][y];
      if (cell.building) {
        const neighbors = getNeighboringBuildings(grid, x, y, 3);
        
        const mitigationFactor = calculateMitigationEffect(neighbors);
        
        const synergyFactor = calculateSynergyEffect(cell, neighbors);
        
        const scaleFactor = cell.building.size.width * cell.building.size.depth;
        
        metrics.emissions += cell.building.environmentalImpact.emissions * scaleFactor * mitigationFactor * synergyFactor;
        metrics.energy += cell.building.environmentalImpact.energy * scaleFactor * mitigationFactor * synergyFactor;
        metrics.water += cell.building.environmentalImpact.water * scaleFactor * mitigationFactor * synergyFactor;
        metrics.heat += cell.building.environmentalImpact.heat * scaleFactor * mitigationFactor * synergyFactor;
        
        metrics.happiness += cell.building.environmentalImpact.happiness * scaleFactor;
        
        if (cell.building.category === 'residential') {
          const educationalNearby = neighbors.filter(n => n.building?.category === 'educational');
          if (educationalNearby.length > 0) {
            metrics.happiness += 2 * educationalNearby.length;
          }
          
          const greenspaceNearby = neighbors.filter(n => n.building?.category === 'greenspace');
          if (greenspaceNearby.length > 0) {
            metrics.happiness += 3 * greenspaceNearby.length;
          }
          
          const healthcareNearby = neighbors.filter(n => n.building?.category === 'healthcare');
          if (healthcareNearby.length > 0) {
            metrics.happiness += 2 * healthcareNearby.length;
          }
          
          const entertainmentNearby = neighbors.filter(n => n.building?.category === 'entertainment');
          if (entertainmentNearby.length > 0) {
            metrics.happiness += 3 * entertainmentNearby.length;
          }
        }
        
        if (cell.building.category === 'residential') {
          const industrialNearby = neighbors.some(n => n.building?.category === 'industrial');
          if (industrialNearby) {
            metrics.happiness -= 4 * scaleFactor;
          }
          
          const powerPlantNearby = neighbors.some(n => n.building?.id === 'power-plant');
          if (powerPlantNearby) {
            metrics.happiness -= 5 * scaleFactor;
          }
          
          const wasteTreatmentNearby = neighbors.some(n => n.building?.id === 'waste-treatment');
          if (wasteTreatmentNearby) {
            metrics.happiness -= 4 * scaleFactor;
          }
        }
        
        if (metrics.traffic && metrics.traffic > 50) {
          metrics.happiness -= (metrics.traffic - 50) / 5;
        }
      }
    }
  }

  try {
    metrics.emissions = await getWeatherAdjustedImpact(metrics.emissions, 'city');
  } catch (error) {
    console.error("Failed to apply weather adjustments:", error);
  }

  metrics.emissions = parseFloat(metrics.emissions.toFixed(1));
  metrics.energy = parseFloat(metrics.energy.toFixed(1));
  metrics.water = parseFloat(metrics.water.toFixed(1));
  metrics.heat = parseFloat(metrics.heat.toFixed(1));
  metrics.happiness = parseFloat(metrics.happiness.toFixed(1));
  metrics.traffic = Math.round(metrics.traffic || 0);
  metrics.education = Math.round(metrics.education || 0);
  metrics.healthcare = Math.round(metrics.healthcare || 0);
  metrics.economy = Math.round(metrics.economy || 0);

  return metrics;
}

export function getEnvironmentalScore(metrics: EnvironmentalMetrics): number {
  const { emissions, energy, water, heat, happiness, traffic, education, healthcare, economy } = metrics;
  
  const emissionsScore = Math.max(0, Math.min(100, 100 - (emissions / 5)));
  const energyScore = Math.max(0, Math.min(100, 100 - (energy / 5)));
  const waterScore = Math.max(0, Math.min(100, 100 - (water / 5)));
  const heatScore = Math.max(0, Math.min(100, 100 - (heat / 5)));
  const happinessScore = Math.max(0, Math.min(100, (happiness / 2)));
  
  const trafficScore = traffic !== undefined ? Math.max(0, Math.min(100, 100 - (traffic / 1))) : 100;
  const educationScore = education !== undefined ? Math.max(0, Math.min(100, education)) : 0;
  const healthcareScore = healthcare !== undefined ? Math.max(0, Math.min(100, healthcare)) : 0;
  const economyScore = economy !== undefined ? Math.max(0, Math.min(100, economy)) : 0;
  
  const environmentalScore = (
    (emissionsScore * 0.20) +
    (energyScore * 0.15) +
    (waterScore * 0.15) +
    (heatScore * 0.15) +
    (happinessScore * 0.25) +
    (trafficScore * 0.1)
  );
  
  const hasEducation = education !== undefined && education > 0;
  const hasHealthcare = healthcare !== undefined && healthcare > 0;
  const hasEconomy = economy !== undefined && economy > 0;
  
  if (hasEducation || hasHealthcare || hasEconomy) {
    const additionalMetricsCount = (hasEducation ? 1 : 0) + (hasHealthcare ? 1 : 0) + (hasEconomy ? 1 : 0);
    const additionalMetricsWeight = 0.2;
    const environmentalWeight = 1 - additionalMetricsWeight;
    
    let additionalScore = 0;
    if (additionalMetricsCount > 0) {
      additionalScore = (
        (hasEducation ? educationScore : 0) + 
        (hasHealthcare ? healthcareScore : 0) + 
        (hasEconomy ? economyScore : 0)
      ) / additionalMetricsCount;
    }
    
    return Math.round((environmentalScore * environmentalWeight) + (additionalScore * additionalMetricsWeight));
  }
  
  return Math.round(environmentalScore);
}

export function getEnvironmentalRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 50) return 'Mediocre';
  if (score >= 40) return 'Poor';
  if (score >= 30) return 'Very Poor';
  return 'Critical';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-green-400';
  if (score >= 50) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

export function getImprovementTips(metrics: EnvironmentalMetrics): string[] {
  const tips: string[] = [];
  
  if (metrics.emissions > 100) {
    tips.push('High emissions: Add more green spaces and renewable energy sources to reduce your carbon footprint by up to 40%.');
    tips.push('Consider replacing some industrial buildings with cleaner alternatives and position them away from residential areas.');
  } else if (metrics.emissions > 50) {
    tips.push('Moderate emissions: Add solar or wind farms to reduce your carbon footprint and create energy independence.');
  }
  
  if (metrics.energy > 100) {
    tips.push('High energy use: Add renewable energy sources like solar and wind farms to create a sustainable energy grid.');
    tips.push('Consider implementing green roofs and energy-efficient buildings to reduce consumption by up to 30%.');
  } else if (metrics.energy > 50) {
    tips.push('Energy efficiency: Add green roofs to reduce building energy consumption and create a cooler microclimate.');
  }
  
  if (metrics.water > 80) {
    tips.push('High water usage: Add more parks and water retention systems to improve water management and reduce consumption.');
    tips.push('Create rain gardens and bioswales near impervious surfaces to manage stormwater sustainably.');
  } else if (metrics.water > 40) {
    tips.push('Water conservation: Implement water recycling systems and drought-resistant landscaping to reduce usage.');
  }
  
  if (metrics.heat > 70) {
    tips.push('Urban heat island effect: Add more parks, tree-lined streets, and green roofs to reduce temperatures by up to 5°C.');
    tips.push('Create connected green corridors throughout your city to improve air circulation and cooling.');
  } else if (metrics.heat > 40) {
    tips.push('Temperature management: Add more trees and vegetation along streets to provide natural cooling and shade.');
  }
  
  if (metrics.happiness < 40) {
    tips.push('Low happiness: Add parks, entertainment venues, and improve services to boost community satisfaction.');
    tips.push('Create community spaces and mixed-use neighborhoods with easy access to amenities.');
  } else if (metrics.happiness < 70) {
    tips.push('Community wellbeing: Add more recreational areas and ensure access to parks within walking distance of homes.');
  }
  
  if (metrics.traffic && metrics.traffic > 70) {
    tips.push('Heavy traffic congestion: Create a comprehensive public transit network and improve road connectivity.');
    tips.push('Design compact, walkable neighborhoods with essential services within a 15-minute walk.');
  } else if (metrics.traffic && metrics.traffic > 40) {
    tips.push('Moderate traffic: Improve your road network, add public transit, and create pedestrian-friendly zones.');
  }
  
  if (metrics.education && metrics.education < 50) {
    tips.push('Low education: Add schools and universities distributed throughout residential areas for equitable access.');
  }
  
  if (metrics.healthcare && metrics.healthcare < 50) {
    tips.push('Healthcare access: Add hospitals and clinics strategically placed to serve all neighborhoods equitably.');
  }
  
  if (metrics.economy && metrics.economy < 50) {
    tips.push('Economic development: Create innovation districts with mixed commercial, office, and research facilities.');
    tips.push('Balance industrial, commercial, and office spaces with good transportation connections.');
  }
  
  tips.push('Create 15-minute neighborhoods where daily necessities are accessible within a short walk or bike ride.');
  tips.push('Design blue-green infrastructure to manage water while providing recreational spaces.');
  tips.push('Implement circular economy principles by placing recycling facilities near industrial and commercial zones.');
  
  return tips;
}

export interface FuturePrediction {
  timeframe: string;
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export function getFuturePredictions(metrics: EnvironmentalMetrics): FuturePrediction[] {
  const predictions: FuturePrediction[] = [];
  const score = getEnvironmentalScore(metrics);
  
  if (metrics.emissions > 80) {
    predictions.push({
      timeframe: '5 Years',
      description: 'Air quality will continue to deteriorate, leading to increased respiratory health issues and regulatory penalties.',
      impact: 'negative'
    });
  } else if (metrics.emissions < 30) {
    predictions.push({
      timeframe: '5 Years',
      description: 'Your city will become a model for clean air initiatives, attracting eco-conscious residents and businesses.',
      impact: 'positive'
    });
  }
  
  if (metrics.water > 70) {
    predictions.push({
      timeframe: '5 Years',
      description: 'Water scarcity will become a recurring issue, requiring expensive infrastructure improvements.',
      impact: 'negative'
    });
  } else if (metrics.water < 30) {
    predictions.push({
      timeframe: '5 Years',
      description: 'Efficient water systems will make your city resilient against drought conditions and reduce utility costs.',
      impact: 'positive'
    });
  }
  
  if (metrics.heat > 60) {
    predictions.push({
      timeframe: '15 Years',
      description: 'Increasing urban temperatures will stress infrastructure and raise cooling costs substantially.',
      impact: 'negative'
    });
  } else {
    predictions.push({
      timeframe: '15 Years',
      description: 'Your city\'s microclimate management will provide comfortable living conditions despite regional climate changes.',
      impact: 'positive'
    });
  }
  
  if (metrics.happiness < 50) {
    predictions.push({
      timeframe: '15 Years',
      description: 'Population decline as residents seek better quality of life elsewhere, reducing tax base and economic activity.',
      impact: 'negative'
    });
  } else if (metrics.happiness > 70) {
    predictions.push({
      timeframe: '15 Years',
      description: 'Strong community cohesion will drive civic participation and resilience against social challenges.',
      impact: 'positive'
    });
  }
  
  if (score < 40) {
    predictions.push({
      timeframe: '30 Years',
      description: 'Your city will face significant challenges from climate change impacts, requiring costly adaptations and retrofits.',
      impact: 'negative'
    });
  } else if (score > 75) {
    predictions.push({
      timeframe: '30 Years',
      description: 'Your city will be recognized as a global leader in sustainable urban development, creating economic and social benefits.',
      impact: 'positive'
    });
  } else {
    predictions.push({
      timeframe: '30 Years',
      description: 'Your city will maintain moderate resilience to environmental challenges but will require ongoing improvements.',
      impact: 'neutral'
    });
  }
  
  if (metrics.economy && metrics.economy > 70 && metrics.education && metrics.education > 70) {
    predictions.push({
      timeframe: '20 Years',
      description: 'Your city will develop into an innovation hub, attracting talent and investment in sustainable technologies.',
      impact: 'positive'
    });
  }
  
  if (metrics.healthcare && metrics.healthcare > 70 && metrics.emissions < 40) {
    predictions.push({
      timeframe: '25 Years',
      description: 'Your city will report significantly better health outcomes and longevity than regional and national averages.',
      impact: 'positive'
    });
  }
  
  if (predictions.length < 3) {
    if (score > 60) {
      predictions.push({
        timeframe: '10 Years',
        description: 'Your city will adapt well to changing climate conditions with minimal disruption to daily life.',
        impact: 'positive'
      });
    } else {
      predictions.push({
        timeframe: '10 Years',
        description: 'Your city will face increasing challenges from environmental stressors, requiring adaptive management.',
        impact: 'neutral'
      });
    }
    
    predictions.push({
      timeframe: '20 Years',
      description: 'Community character will reflect your planning priorities, either strengthening or diminishing social bonds.',
      impact: score > 50 ? 'positive' : 'neutral'
    });
  }
  
  return predictions;
}
