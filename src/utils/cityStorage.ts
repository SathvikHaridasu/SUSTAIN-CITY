
import { GridItem, EnvironmentalMetrics } from './environmental';
import { getCurrentUser } from './auth';

export interface City {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  grid: GridItem[][];
  metrics: EnvironmentalMetrics;
}

// Save the current city
export const saveCity = async (name: string, grid: GridItem[][], metrics: EnvironmentalMetrics): Promise<string> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get all cities for the user
  const citiesStr = localStorage.getItem(`ecocity-${user.id}-cities`);
  const cities: City[] = citiesStr ? JSON.parse(citiesStr) : [];
  
  // Check if we're updating an existing city
  const cityId = localStorage.getItem('current-city-id');
  const now = new Date().toISOString();
  
  if (cityId) {
    // Find and update existing city
    const cityIndex = cities.findIndex(c => c.id === cityId);
    if (cityIndex >= 0) {
      cities[cityIndex] = {
        ...cities[cityIndex],
        name,
        grid,
        metrics,
        lastModified: now
      };
      localStorage.setItem(`ecocity-${user.id}-cities`, JSON.stringify(cities));
      return cityId;
    }
  }
  
  // Create new city
  const newCityId = `city_${Date.now()}`;
  const newCity: City = {
    id: newCityId,
    name,
    grid,
    metrics,
    createdAt: now,
    lastModified: now
  };
  
  cities.push(newCity);
  localStorage.setItem(`ecocity-${user.id}-cities`, JSON.stringify(cities));
  localStorage.setItem('current-city-id', newCityId);
  
  return newCityId;
};

// Load a city
export const loadCity = async (cityId: string): Promise<City | null> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get all cities for the user
  const citiesStr = localStorage.getItem(`ecocity-${user.id}-cities`);
  if (!citiesStr) return null;
  
  const cities: City[] = JSON.parse(citiesStr);
  return cities.find(city => city.id === cityId) || null;
};

// Get the current city
export const getCurrentCity = async (): Promise<City | null> => {
  const cityId = localStorage.getItem('current-city-id');
  if (!cityId) return null;
  
  return loadCity(cityId);
};

// Delete a city
export const deleteCity = async (cityId: string): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Get all cities for the user
  const citiesStr = localStorage.getItem(`ecocity-${user.id}-cities`);
  if (!citiesStr) return false;
  
  const cities: City[] = JSON.parse(citiesStr);
  const newCities = cities.filter(city => city.id !== cityId);
  
  localStorage.setItem(`ecocity-${user.id}-cities`, JSON.stringify(newCities));
  
  // If the current city is being deleted, clear the current city id
  if (localStorage.getItem('current-city-id') === cityId) {
    localStorage.removeItem('current-city-id');
  }
  
  return true;
};

// Create a new city from scratch
export const createNewCity = async (name: string = "New EcoCity"): Promise<string> => {
  // First, explicitly clear the current city ID
  localStorage.removeItem('current-city-id');
  
  // Create empty grid
  const grid: GridItem[][] = [];
  for (let x = 0; x < 20; x++) {
    grid[x] = [];
    for (let y = 0; y < 20; y++) {
      grid[x][y] = { x, y, building: null };
    }
  }
  
  // Create empty metrics
  const metrics: EnvironmentalMetrics = {
    emissions: 0,
    energy: 0,
    water: 0, 
    heat: 0,
    happiness: 0,
    traffic: 0
  };
  
  // Create a new city ID and set it immediately
  const newCityId = `city_${Date.now()}`;
  localStorage.setItem('current-city-id', newCityId);
  
  // Save the city with this ID
  await saveCity(name, grid, metrics);
  
  console.log("Created new city with ID:", newCityId);
  
  return newCityId;
};
