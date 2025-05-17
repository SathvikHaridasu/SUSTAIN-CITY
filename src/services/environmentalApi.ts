
/**
 * API Service for fetching environmental data
 */

// Weather API endpoint (using OpenWeatherMap free API)
const WEATHER_API_KEY = "bd5e378503939ddaee76f12ad7a97608"; // This is a demo key
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  feelsLike?: number;
  pressure?: number;
  uvIndex?: number;
  airQuality?: number;
}

/**
 * Fetch current weather data for a location
 * @param city City name
 * @param country Country code (optional)
 * @returns Weather data
 */
export async function fetchWeatherData(city: string = "New York", country: string = "US"): Promise<WeatherData> {
  try {
    const response = await fetch(
      `${WEATHER_BASE_URL}/weather?q=${city},${country}&units=metric&appid=${WEATHER_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Simulate additional data that would come from a more comprehensive API
    const simulatedUVIndex = Math.floor(Math.random() * 11); // 0-10 UV index
    const simulatedAirQuality = Math.floor(Math.random() * 5) + 1; // 1-5 air quality (1 is best)
    
    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description,
      icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
      feelsLike: data.main.feels_like,
      pressure: data.main.pressure,
      uvIndex: simulatedUVIndex,
      airQuality: simulatedAirQuality
    };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    // Return fallback data
    return {
      temperature: 20,
      humidity: 65,
      windSpeed: 5,
      description: "Weather data unavailable",
      icon: "",
      feelsLike: 21,
      pressure: 1013,
      uvIndex: 4,
      airQuality: 2
    };
  }
}

// Example API for emissions factors
export interface EmissionsFactor {
  buildingType: string;
  region: string;
  emissionsPerSqMeter: number;
  energyPerSqMeter: number;
  waterPerSqMeter: number;
}

// Simulate an emissions API with sample data
export async function fetchEmissionsFactors(): Promise<EmissionsFactor[]> {
  // In a real app, this would fetch from an actual API
  // For now, returning mock data
  return [
    { 
      buildingType: "residential", 
      region: "global", 
      emissionsPerSqMeter: 50,
      energyPerSqMeter: 180,
      waterPerSqMeter: 150
    },
    { 
      buildingType: "commercial", 
      region: "global", 
      emissionsPerSqMeter: 80,
      energyPerSqMeter: 250,
      waterPerSqMeter: 100
    },
    { 
      buildingType: "industrial", 
      region: "global", 
      emissionsPerSqMeter: 120,
      energyPerSqMeter: 350,
      waterPerSqMeter: 200
    },
    { 
      buildingType: "greenspace", 
      region: "global", 
      emissionsPerSqMeter: -20,
      energyPerSqMeter: 5,
      waterPerSqMeter: 300
    },
    { 
      buildingType: "educational", 
      region: "global", 
      emissionsPerSqMeter: 60,
      energyPerSqMeter: 200,
      waterPerSqMeter: 120
    },
    { 
      buildingType: "healthcare", 
      region: "global", 
      emissionsPerSqMeter: 90,
      energyPerSqMeter: 300,
      waterPerSqMeter: 180
    },
  ];
}

// Function to get a refined environmental impact score based on current weather conditions
export async function getWeatherAdjustedImpact(baseImpact: number, buildingType: string): Promise<number> {
  try {
    // Get current weather data
    const weather = await fetchWeatherData();
    
    // Adjust impact based on weather
    let weatherMultiplier = 1.0;
    
    // Temperature impact
    // Higher temperatures increase cooling needs and energy consumption for most buildings
    if (weather.temperature > 30) {
      weatherMultiplier += 0.3; // +30% impact in very hot weather
    } else if (weather.temperature > 25) {
      weatherMultiplier += 0.2; // +20% impact in hot weather
    } else if (weather.temperature < 0) {
      weatherMultiplier += 0.25; // +25% impact in very cold weather (heating)
    } else if (weather.temperature < 10) {
      weatherMultiplier += 0.15; // +15% impact in cold weather (heating)
    }
    
    // Wind impact
    // Wind can reduce impact for some building types (better natural ventilation)
    if (weather.windSpeed > 15) {
      if (buildingType === "residential" || buildingType === "commercial") {
        weatherMultiplier -= 0.15; // -15% impact with strong wind for ventilation
      } else if (buildingType === "industrial") {
        weatherMultiplier += 0.05; // +5% for industrial (pollution spread)
      }
    } else if (weather.windSpeed > 8) {
      if (buildingType === "residential" || buildingType === "commercial") {
        weatherMultiplier -= 0.1; // -10% impact with moderate wind for ventilation
      }
    }
    
    // Humidity impact
    // High humidity can affect comfort and increase energy use
    if (weather.humidity > 85) {
      weatherMultiplier += 0.1; // +10% impact with very high humidity
    } else if (weather.humidity > 70) {
      weatherMultiplier += 0.05; // +5% impact with high humidity
    }
    
    // Special building type adjustments
    
    // Green spaces have a greater positive impact during hot weather
    if (buildingType === "greenspace" && weather.temperature > 25) {
      weatherMultiplier += 0.2; // Parks provide 20% more benefit during hot weather
    }
    
    // Solar farms are less effective in cloudy weather
    if (buildingType === "solar-farm" && weather.description.includes("cloud")) {
      weatherMultiplier -= 0.3; // 30% less effective in cloudy weather
    }
    
    // Wind farms are more effective in windy weather
    if (buildingType === "wind-farm" && weather.windSpeed > 12) {
      weatherMultiplier += 0.4; // 40% more effective in windy weather
    }
    
    return baseImpact * weatherMultiplier;
  } catch (error) {
    console.error("Error adjusting for weather:", error);
    return baseImpact; // Return unadjusted impact if there's an error
  }
}

// Function to get natural disaster risk based on weather patterns
export async function getNaturalDisasterRisk(): Promise<{
  floodRisk: number;
  heatwaveRisk: number;
  stormRisk: number;
  overallRisk: number;
}> {
  try {
    const weather = await fetchWeatherData();
    
    // Calculate risks on a scale of 0-100
    let floodRisk = 0;
    let heatwaveRisk = 0;
    let stormRisk = 0;
    
    // Flood risk factors
    if (weather.description.includes("rain") || weather.description.includes("shower")) {
      floodRisk += 30;
    }
    if (weather.humidity > 80) {
      floodRisk += 20;
    }
    floodRisk = Math.min(100, floodRisk);
    
    // Heatwave risk factors
    if (weather.temperature > 30) {
      heatwaveRisk += 50;
    } else if (weather.temperature > 25) {
      heatwaveRisk += 30;
    }
    if (weather.humidity > 70) {
      heatwaveRisk += 20;
    }
    heatwaveRisk = Math.min(100, heatwaveRisk);
    
    // Storm risk factors
    if (weather.windSpeed > 15) {
      stormRisk += 40;
    } else if (weather.windSpeed > 10) {
      stormRisk += 20;
    }
    if (weather.description.includes("thunderstorm")) {
      stormRisk += 50;
    }
    stormRisk = Math.min(100, stormRisk);
    
    // Overall risk is the maximum of the individual risks
    const overallRisk = Math.max(floodRisk, heatwaveRisk, stormRisk);
    
    return {
      floodRisk,
      heatwaveRisk,
      stormRisk,
      overallRisk
    };
  } catch (error) {
    console.error("Error calculating disaster risk:", error);
    return {
      floodRisk: 10,
      heatwaveRisk: 10,
      stormRisk: 10,
      overallRisk: 10
    };
  }
}

// Get detailed air quality data
export async function getAirQualityData(): Promise<{
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  quality: string;
}> {
  // Simulate air quality data
  const aqi = Math.floor(Math.random() * 150) + 20;
  
  // Calculate pollutant values based on AQI
  const pm25 = (aqi / 10) * (Math.random() * 0.5 + 0.75);
  const pm10 = (aqi / 5) * (Math.random() * 0.5 + 0.75);
  const o3 = (aqi / 20) * (Math.random() * 0.5 + 0.75);
  const no2 = (aqi / 15) * (Math.random() * 0.5 + 0.75);
  const so2 = (aqi / 25) * (Math.random() * 0.5 + 0.75);
  
  // Determine air quality description
  let quality;
  if (aqi <= 50) quality = "Good";
  else if (aqi <= 100) quality = "Moderate";
  else if (aqi <= 150) quality = "Unhealthy for Sensitive Groups";
  else if (aqi <= 200) quality = "Unhealthy";
  else if (aqi <= 300) quality = "Very Unhealthy";
  else quality = "Hazardous";
  
  return {
    aqi,
    pm25: Number(pm25.toFixed(1)),
    pm10: Number(pm10.toFixed(1)),
    o3: Number(o3.toFixed(1)),
    no2: Number(no2.toFixed(1)),
    so2: Number(so2.toFixed(1)),
    quality
  };
}

// Get recommendations based on current data
export function getEnvironmentalRecommendations(
  weather: WeatherData,
  airQuality: { aqi: number; quality: string }
): string[] {
  const recommendations: string[] = [];
  
  // Weather-based recommendations
  if (weather.temperature > 30) {
    recommendations.push("High temperatures detected. Consider adding more green spaces to reduce urban heat.");
    recommendations.push("Ensure buildings have adequate cooling systems or shade structures.");
  } else if (weather.temperature < 5) {
    recommendations.push("Cold temperatures detected. Improve building insulation to reduce heating needs.");
  }
  
  if (weather.windSpeed > 15) {
    recommendations.push("Strong winds detected. Wind farms would be highly effective in these conditions.");
  }
  
  // Air quality recommendations
  if (airQuality.aqi > 100) {
    recommendations.push("Poor air quality detected. Consider adding more green spaces to filter air pollution.");
    recommendations.push("Reduce industrial activities or improve emission controls.");
  } else if (airQuality.aqi > 50) {
    recommendations.push("Moderate air quality. Adding parks can help improve air quality further.");
  }
  
  // General recommendations
  recommendations.push("Balance residential, commercial, and green spaces for optimal city performance.");
  recommendations.push("Ensure adequate healthcare and educational facilities for your population.");
  
  return recommendations;
}
