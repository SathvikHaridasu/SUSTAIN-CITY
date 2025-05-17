export interface Building {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'greenspace' | 'agricultural' | 'educational' | 'healthcare' | 'entertainment';
  size: { width: number; depth: number; height: number };
  image: string;
  model: string;
  incompatibleWith?: string[]; // Property for placement restrictions
  environmentalImpact: {
    emissions: number; // CO2 emissions (negative value = reduction)
    energy: number; // Energy consumption
    water: number; // Water usage/runoff
    heat: number; // Heat island effect
    happiness: number; // Community well-being
  }
}

export const BUILDINGS: Building[] = [
  {
    id: 'residential-house',
    name: 'Residential House',
    description: 'Single-family residential building with minimal environmental impact',
    category: 'residential',
    size: { width: 1, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=150&h=150',
    model: 'house',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 10,
      energy: 8,
      water: 7,
      heat: 5,
      happiness: 7,
    }
  },
  {
    id: 'apartment-building',
    name: 'Apartment Building',
    description: 'Multi-family residential building with efficient land use',
    category: 'residential',
    size: { width: 1, depth: 1, height: 3 },
    image: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?auto=format&fit=crop&w=150&h=150',
    model: 'apartment',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 25,
      energy: 20,
      water: 18,
      heat: 15,
      happiness: 6,
    }
  },
  {
    id: 'high-rise',
    name: 'High-Rise Apartment',
    description: 'Tall residential tower for high-density urban living',
    category: 'residential',
    size: { width: 1, depth: 1, height: 5 },
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=150&h=150',
    model: 'high-rise',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 35,
      energy: 30,
      water: 25,
      heat: 20,
      happiness: 5,
    }
  },
  {
    id: 'office-building',
    name: 'Office Building',
    description: 'Commercial office space with modern amenities',
    category: 'commercial',
    size: { width: 1, depth: 1, height: 4 },
    image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?auto=format&fit=crop&w=150&h=150',
    model: 'office',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 30,
      energy: 28,
      water: 20,
      heat: 22,
      happiness: 5,
    }
  },
  {
    id: 'retail-store',
    name: 'Retail Store',
    description: 'Commercial retail space for shopping and services',
    category: 'commercial',
    size: { width: 1, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=150&h=150',
    model: 'retail',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 15,
      energy: 12,
      water: 8,
      heat: 10,
      happiness: 8,
    }
  },
  {
    id: 'shopping-mall',
    name: 'Shopping Mall',
    description: 'Large commercial center with multiple retail stores',
    category: 'commercial',
    size: { width: 2, depth: 2, height: 2 },
    image: 'https://images.unsplash.com/photo-1519567770579-c2fc5a52f0d2?auto=format&fit=crop&w=150&h=150',
    model: 'mall',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 40,
      energy: 35,
      water: 25,
      heat: 30,
      happiness: 7,
    }
  },
  {
    id: 'factory',
    name: 'Factory',
    description: 'Industrial manufacturing facility with high environmental impact',
    category: 'industrial',
    size: { width: 2, depth: 2, height: 2 },
    image: 'https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?auto=format&fit=crop&w=150&h=150',
    model: 'factory',
    incompatibleWith: ['residential-house', 'apartment-building', 'high-rise', 'park', 'farm', 'office-building', 'retail-store', 'hospital', 'school', 'university'],
    environmentalImpact: {
      emissions: 50,
      energy: 45,
      water: 40,
      heat: 35,
      happiness: 2,
    }
  },
  {
    id: 'industrial-zone',
    name: 'Industrial Zone',
    description: 'Mixed industrial area with high pollution levels',
    category: 'industrial',
    size: { width: 2, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?auto=format&fit=crop&w=150&h=150',
    model: 'industrial',
    incompatibleWith: ['residential-house', 'apartment-building', 'high-rise', 'park', 'farm', 'retail-store', 'hospital', 'school', 'university'],
    environmentalImpact: {
      emissions: 40,
      energy: 35,
      water: 30,
      heat: 32,
      happiness: 3,
    }
  },
  {
    id: 'waste-treatment',
    name: 'Waste Treatment',
    description: 'Facility for processing urban waste and recycling',
    category: 'industrial',
    size: { width: 2, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1621436338972-39882e4a6875?auto=format&fit=crop&w=150&h=150',
    model: 'waste',
    incompatibleWith: ['residential-house', 'apartment-building', 'high-rise', 'retail-store', 'hospital', 'school', 'farm'],
    environmentalImpact: {
      emissions: 20,
      energy: 25,
      water: 35,
      heat: 15,
      happiness: 4,
    }
  },
  {
    id: 'solar-farm',
    name: 'Solar Farm',
    description: 'Renewable energy generation with solar panels',
    category: 'infrastructure',
    size: { width: 2, depth: 2, height: 1 },
    image: 'https://images.unsplash.com/photo-1579353977828-2a4eab540b9a?auto=format&fit=crop&w=150&h=150',
    model: 'solar',
    environmentalImpact: {
      emissions: -40,
      energy: -30,
      water: 0,
      heat: 5,
      happiness: 7,
    }
  },
  {
    id: 'wind-farm',
    name: 'Wind Farm',
    description: 'Clean energy production using wind turbines',
    category: 'infrastructure',
    size: { width: 2, depth: 2, height: 2 },
    image: 'https://images.unsplash.com/photo-1548089699-bfad5be4f1b9?auto=format&fit=crop&w=150&h=150',
    model: 'wind',
    environmentalImpact: {
      emissions: -35,
      energy: -25,
      water: 0,
      heat: 0,
      happiness: 6,
    }
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    description: 'Conventional power generation facility',
    category: 'infrastructure',
    size: { width: 2, depth: 2, height: 2 },
    image: 'https://images.unsplash.com/photo-1548621641-ced098211f3b?auto=format&fit=crop&w=150&h=150',
    model: 'power',
    incompatibleWith: ['residential-house', 'apartment-building', 'high-rise', 'park', 'farm', 'hospital', 'school'],
    environmentalImpact: {
      emissions: 60,
      energy: -50,
      water: 40,
      heat: 45,
      happiness: 2,
    }
  },
  {
    id: 'park',
    name: 'City Park',
    description: 'Green recreational space with trees and vegetation',
    category: 'greenspace',
    size: { width: 2, depth: 2, height: 1 },
    image: 'https://images.unsplash.com/photo-1460574283810-2aab119d8511?auto=format&fit=crop&w=150&h=150',
    model: 'park',
    incompatibleWith: ['factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: -15,
      energy: 0,
      water: 10,
      heat: -20,
      happiness: 10,
    }
  },
  {
    id: 'green-roof',
    name: 'Green Roof',
    description: 'Vegetation installed on building tops to improve insulation and air quality',
    category: 'greenspace',
    size: { width: 1, depth: 1, height: 0.2 },
    image: 'https://images.unsplash.com/photo-1599958302466-e2a28c558ac4?auto=format&fit=crop&w=150&h=150',
    model: 'green-roof',
    environmentalImpact: {
      emissions: -10,
      energy: -5,
      water: 5,
      heat: -15,
      happiness: 8,
    }
  },
  {
    id: 'public-transit',
    name: 'Public Transit',
    description: 'Bus or train station for efficient urban transportation',
    category: 'infrastructure',
    size: { width: 1, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1519583272095-6433daf26b6e?auto=format&fit=crop&w=150&h=150',
    model: 'transit',
    environmentalImpact: {
      emissions: -20,
      energy: 10,
      water: 5,
      heat: 5,
      happiness: 8,
    }
  },
  {
    id: 'road',
    name: 'Road',
    description: 'Urban transportation infrastructure for vehicles',
    category: 'infrastructure',
    size: { width: 1, depth: 1, height: 0.1 },
    image: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?auto=format&fit=crop&w=150&h=150',
    model: 'road',
    environmentalImpact: {
      emissions: 5,
      energy: 3,
      water: 5,
      heat: 8,
      happiness: 6,
    }
  },
  {
    id: 'hospital',
    name: 'Hospital',
    description: 'Healthcare facility providing medical services',
    category: 'healthcare',
    size: { width: 2, depth: 2, height: 3 },
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=150&h=150',
    model: 'hospital',
    incompatibleWith: ['factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 30,
      energy: 40,
      water: 35,
      heat: 20,
      happiness: 12,
    }
  },
  {
    id: 'school',
    name: 'School',
    description: 'Educational institution for children and young adults',
    category: 'educational',
    size: { width: 2, depth: 1, height: 2 },
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=150&h=150',
    model: 'school',
    incompatibleWith: ['factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 15,
      energy: 20,
      water: 15,
      heat: 10,
      happiness: 15,
    }
  },
  {
    id: 'university',
    name: 'University',
    description: 'Higher education campus with multiple buildings',
    category: 'educational',
    size: { width: 2, depth: 2, height: 3 },
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=150&h=150',
    model: 'university',
    incompatibleWith: ['factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 25,
      energy: 30,
      water: 25,
      heat: 15,
      happiness: 18,
    }
  },
  {
    id: 'sports-complex',
    name: 'Sports Complex',
    description: 'Facility for sports and recreational activities',
    category: 'entertainment',
    size: { width: 2, depth: 2, height: 1 },
    image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=150&h=150',
    model: 'sports',
    environmentalImpact: {
      emissions: 10,
      energy: 15,
      water: 20,
      heat: 5,
      happiness: 14,
    }
  },
  {
    id: 'farm',
    name: 'Farm',
    description: 'Agricultural production area for local food',
    category: 'agricultural',
    size: { width: 2, depth: 2, height: 0.5 },
    image: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=150&h=150',
    model: 'farm',
    incompatibleWith: ['residential-house', 'apartment-building', 'high-rise', 'office-building', 'retail-store', 'factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: -5,
      energy: 5,
      water: 15,
      heat: -10,
      happiness: 8,
    }
  },
  {
    id: 'community-garden',
    name: 'Community Garden',
    description: 'Shared garden space for growing local produce and fostering community bonds',
    category: 'greenspace',
    size: { width: 1, depth: 1, height: 0.5 },
    image: 'https://images.unsplash.com/photo-1621928372481-72a22f4aa8aa?auto=format&fit=crop&w=150&h=150',
    model: 'garden',
    environmentalImpact: {
      emissions: -8,
      energy: 0,
      water: 12,
      heat: -12,
      happiness: 15,
    }
  },
  {
    id: 'rain-garden',
    name: 'Rain Garden',
    description: 'Designed to reduce rainwater runoff and filter pollutants',
    category: 'greenspace',
    size: { width: 1, depth: 1, height: 0.2 },
    image: 'https://images.unsplash.com/photo-1534710961216-75c88202f43e?auto=format&fit=crop&w=150&h=150',
    model: 'rain-garden',
    environmentalImpact: {
      emissions: -5,
      energy: 0,
      water: -15,
      heat: -8,
      happiness: 7,
    }
  },
  {
    id: 'geothermal-plant',
    name: 'Geothermal Plant',
    description: 'Renewable energy facility harnessing heat from under the Earth\'s surface',
    category: 'infrastructure',
    size: { width: 2, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=150&h=150',
    model: 'geothermal',
    environmentalImpact: {
      emissions: -30,
      energy: -35,
      water: 5,
      heat: 0,
      happiness: 5,
    }
  },
  {
    id: 'recycling-center',
    name: 'Recycling Center',
    description: 'Facility for processing and sorting recyclable materials',
    category: 'infrastructure',
    size: { width: 1, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=150&h=150',
    model: 'recycling',
    environmentalImpact: {
      emissions: -10,
      energy: 5,
      water: 3,
      heat: 2,
      happiness: 8,
    }
  },
  {
    id: 'library',
    name: 'Public Library',
    description: 'Community resource for books, research, and educational programs',
    category: 'educational',
    size: { width: 1, depth: 1, height: 2 },
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=150&h=150',
    model: 'library',
    incompatibleWith: ['factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 8,
      energy: 12,
      water: 5,
      heat: 5,
      happiness: 16,
    }
  },
  {
    id: 'farmers-market',
    name: 'Farmers Market',
    description: 'Local marketplace for fresh produce and artisan goods',
    category: 'commercial',
    size: { width: 1, depth: 1, height: 1 },
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=150&h=150',
    model: 'market',
    incompatibleWith: ['factory', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: -5,
      energy: 5,
      water: 8,
      heat: 2,
      happiness: 17,
    }
  },
  {
    id: 'electric-vehicle-station',
    name: 'EV Charging Station',
    description: 'Infrastructure for charging electric vehicles',
    category: 'infrastructure',
    size: { width: 1, depth: 1, height: 0.5 },
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba53b0998?auto=format&fit=crop&w=150&h=150',
    model: 'ev-station',
    environmentalImpact: {
      emissions: -15,
      energy: 10,
      water: 0,
      heat: -2,
      happiness: 10,
    }
  },
  {
    id: 'green-apartment',
    name: 'Green Apartment',
    description: 'Multi-family housing with sustainable features like solar panels and rainwater collection',
    category: 'residential',
    size: { width: 1, depth: 1, height: 3 },
    image: 'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?auto=format&fit=crop&w=150&h=150',
    model: 'green-apartment',
    incompatibleWith: ['factory', 'farm', 'industrial-zone', 'waste-treatment'],
    environmentalImpact: {
      emissions: 5,
      energy: 5,
      water: 8,
      heat: 5,
      happiness: 12,
    }
  },
  {
    id: 'research-lab',
    name: 'Research Laboratory',
    description: 'Facility for scientific research and innovation',
    category: 'educational',
    size: { width: 1, depth: 1, height: 2 },
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=150&h=150',
    model: 'lab',
    incompatibleWith: ['factory', 'industrial-zone'],
    environmentalImpact: {
      emissions: 15,
      energy: 25,
      water: 10,
      heat: 8,
      happiness: 12,
    }
  },
  {
    id: 'bike-sharing',
    name: 'Bike Sharing Station',
    description: 'Public bicycle rental service for eco-friendly urban transportation',
    category: 'infrastructure',
    size: { width: 1, depth: 1, height: 0.5 },
    image: 'https://images.unsplash.com/photo-1531869437884-6fe7057d6ed7?auto=format&fit=crop&w=150&h=150',
    model: 'bike-sharing',
    environmentalImpact: {
      emissions: -12,
      energy: 0,
      water: 0,
      heat: -5,
      happiness: 14,
    }
  },
];

export function getCategoryBuildings(category: Building['category'] | 'all'): Building[] {
  if (category === 'all') return BUILDINGS;
  return BUILDINGS.filter(building => building.category === category);
}

export function getBuildingById(id: string): Building | undefined {
  return BUILDINGS.find(building => building.id === id);
}

export const BUILDING_CATEGORIES = [
  { value: 'all', label: 'All Buildings' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'greenspace', label: 'Green Space' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'educational', label: 'Educational' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'entertainment', label: 'Entertainment' },
];

// Enhanced placement validation with better spatial awareness
export function isValidPlacement(grid: { building: Building | null }[][], x: number, y: number, building: Building): { valid: boolean; reason?: string } {
  // Check if the building fits within the grid boundary
  const width = building.size.width;
  const depth = building.size.depth;
  
  if (x + width > grid.length || y + depth > grid[0].length) {
    return { 
      valid: false, 
      reason: `Building would extend outside the grid boundaries.` 
    };
  }
  
  // Check if the space is already occupied by another building
  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < depth; dy++) {
      if (x + dx >= grid.length || y + dy >= grid[0].length) continue;
      
      const cell = grid[x + dx][y + dy];
      if (cell.building) {
        return { 
          valid: false, 
          reason: `Space is already occupied by another building.` 
        };
      }
    }
  }

  // If there are no incompatibility rules, placement is valid
  if (!building.incompatibleWith || building.incompatibleWith.length === 0) {
    return { valid: true };
  }

  // Check surrounding cells with wider radius for larger buildings
  const checkRadius = Math.max(1, Math.min(width, depth));
  
  for (let dx = -checkRadius; dx <= width + checkRadius - 1; dx++) {
    for (let dy = -checkRadius; dy <= depth + checkRadius - 1; dy++) {
      const nx = x + dx;
      const ny = y + dy;
      
      // Skip if out of bounds or within the building's footprint
      if (nx < 0 || ny < 0 || nx >= grid.length || ny >= grid[0].length ||
          (dx >= 0 && dx < width && dy >= 0 && dy < depth)) {
        continue;
      }
      
      const neighbor = grid[nx][ny].building;
      if (!neighbor) continue;
      
      // Check if current building can't be placed near neighbor
      if (building.incompatibleWith.includes(neighbor.id)) {
        return { 
          valid: false, 
          reason: `${building.name} cannot be placed near ${neighbor.name}` 
        };
      }
      
      // Check if neighbor can't be placed near current building
      if (neighbor.incompatibleWith && neighbor.incompatibleWith.includes(building.id)) {
        return { 
          valid: false, 
          reason: `${building.name} cannot be placed near ${neighbor.name}` 
        };
      }
    }
  }
  
  return { valid: true };
}

export function getCompatibilityTips(buildingId: string): string[] {
  const building = getBuildingById(buildingId);
  if (!building) return [];
  
  const tips: string[] = [];
  
  // Generate tips based on building type
  switch (building.category) {
    case 'residential':
      tips.push('Residential buildings work well near parks and retail.');
      tips.push('Keep residential areas away from industrial zones.');
      break;
    case 'commercial':
      tips.push('Commercial buildings benefit from being near residential areas.');
      tips.push('Place retail near roads for better accessibility.');
      break;
    case 'industrial':
      tips.push('Industrial buildings should be placed away from residential and educational areas.');
      tips.push('Consider placing industrial zones near power infrastructure.');
      break;
    case 'infrastructure':
      if (building.id === 'solar-farm' || building.id === 'wind-farm') {
        tips.push('Renewable energy sources can be placed almost anywhere.');
        tips.push('Multiple renewable sources can significantly reduce city emissions.');
      } else if (building.id === 'road') {
        tips.push('Roads connect different parts of the city.');
        tips.push('A good road network improves city efficiency.');
      }
      break;
    case 'greenspace':
      tips.push('Parks improve happiness and reduce heat in surrounding areas.');
      tips.push('Strategically placed green spaces can offset pollution from other buildings.');
      break;
    case 'agricultural':
      tips.push('Farms should be placed away from dense urban development.');
      tips.push('Agricultural areas have low environmental impact.');
      break;
    case 'educational':
      tips.push('Schools and universities improve community happiness.');
      tips.push('Educational buildings work well near residential areas.');
      break;
    case 'healthcare':
      tips.push('Hospitals provide essential services and increase happiness.');
      tips.push('Healthcare facilities should be accessible from residential areas.');
      break;
    case 'entertainment':
      tips.push('Entertainment venues boost community happiness.');
      tips.push('These facilities work well near commercial and residential areas.');
      break;
  }
  
  // Add specific incompatibility warnings
  if (building.incompatibleWith && building.incompatibleWith.length > 0) {
    const incompatibleBuildings = building.incompatibleWith
      .map(id => getBuildingById(id)?.name)
      .filter(name => name !== undefined);
    
    if (incompatibleBuildings.length > 0) {
      tips.push(`Cannot be placed near: ${incompatibleBuildings.join(', ')}`);
    }
  }
  
  return tips;
}
