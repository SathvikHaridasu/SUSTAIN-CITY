
import React, { useEffect, useState } from 'react';
import { EnvironmentalMetrics as Metrics, getEnvironmentalRating, getEnvironmentalScore, getScoreColor } from '@/utils/environmental';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, Droplet, Flame, TreePine, LineChart, 
  Building2, Info, Wind, ThermometerSun, Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWeatherData, WeatherData, getAirQualityData } from '@/services/environmentalApi';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

interface EnvironmentalMetricsProps {
  metrics: Metrics;
  isLoading?: boolean;
}

// Define the extended metrics type to use internally
interface ExtendedMetrics extends Metrics {
  zoneBalanceScore?: number;
  grid?: any[][];
}

const EnvironmentalMetricsComponent: React.FC<EnvironmentalMetricsProps> = ({ metrics, isLoading = false }) => {
  const score = getEnvironmentalScore(metrics);
  const rating = getEnvironmentalRating(score);
  const scoreColorClass = getScoreColor(score);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [airQualityData, setAirQualityData] = useState<{aqi: number; quality: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('metrics');
  
  // Calculate energy distribution based on metrics
  const solarPercentage = Math.round(Math.max(10, Math.min(70, 40 - metrics.energy / 3)));
  const windPercentage = Math.round(Math.max(10, Math.min(40, 30 - metrics.heat / 5)));
  const gridPercentage = 100 - solarPercentage - windPercentage;
  
  // Energy source distribution data for pie chart
  const energyData = [
    { name: 'Solar', value: solarPercentage, fill: '#82ca9d' },
    { name: 'Wind', value: windPercentage, fill: '#8884d8' },
    { name: 'Grid', value: gridPercentage, fill: '#d4af81' },
  ];

  // Configuration for the pie chart
  const chartConfig = {
    solar: { color: '#82ca9d' },
    wind: { color: '#8884d8' },
    grid: { color: '#d4af81' },
  };
  
  useEffect(() => {
    const getWeatherData = async () => {
      setLoading(true);
      try {
        const data = await fetchWeatherData();
        setWeatherData(data);
        
        const airQuality = await getAirQualityData();
        setAirQualityData({
          aqi: airQuality.aqi,
          quality: airQuality.quality
        });
      } catch (error) {
        console.error("Failed to load environmental data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getWeatherData();
    
    const interval = setInterval(getWeatherData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Safely access the extended metrics properties
  const extendedMetrics = metrics as ExtendedMetrics;

  return (
    <div className="h-full flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-stone-200">
      <div className="p-4 border-b border-stone-200">
        <h2 className="text-lg font-medium mb-2">City Analytics</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="buildings">Buildings</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="pt-2">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Carbon Footprint</span>
                <span className="text-lg font-bold">{Math.round(metrics.emissions)} tons</span>
                <Progress value={Math.min(100, metrics.emissions)} className="h-2 mt-1 bg-slate-100">
                  <div className={`h-full ${metrics.emissions < 30 ? 'bg-emerald-500' : 
                    metrics.emissions < 60 ? 'bg-amber-500' : 'bg-red-500'} rounded-full`} />
                </Progress>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium">Renewable Energy</span>
                <span className="text-lg font-bold">{Math.round((100 - metrics.energy))} %</span>
                <Progress value={Math.min(100, 100 - metrics.energy)} className="h-2 mt-1 bg-slate-100">
                  <div className={`h-full bg-blue-500 rounded-full`} />
                </Progress>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium">Livability Score</span>
                <span className="text-lg font-bold">{Math.round(metrics.happiness)}</span>
                <Progress value={Math.min(100, metrics.happiness)} className="h-2 mt-1 bg-slate-100">
                  <div className={`h-full bg-emerald-500 rounded-full`} />
                </Progress>
              </div>
            </div>
            
            <div className="space-y-2.5 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Droplet size={14} className="text-blue-600 mr-1.5" />
                  Water Consumption
                </span>
                <span className={`text-sm font-medium ${
                  metrics.water < 30 ? 'text-emerald-600' : 
                  metrics.water < 70 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {Math.round(metrics.water)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <ThermometerSun size={14} className="text-orange-600 mr-1.5" />
                  Heat Effect
                </span>
                <span className={`text-sm font-medium ${
                  metrics.heat < 30 ? 'text-emerald-600' : 
                  metrics.heat < 70 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {Math.round(metrics.heat)}
                </span>
              </div>
              {metrics.traffic !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Map size={14} className="mr-1.5 text-gray-600" />
                  Traffic Congestion
                </span>
                <span className={`text-sm font-medium ${
                  metrics.traffic < 30 ? 'text-emerald-600' : 
                  metrics.traffic < 70 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {Math.round(metrics.traffic)}
                </span>
              </div>
              )}
              
              {weatherData && (
              <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
                <span className="text-sm flex items-center">
                  <Wind size={14} className="text-blue-600 mr-1.5" />
                  Weather Conditions
                </span>
                <span className="text-sm">
                  {weatherData.temperature}°C, {weatherData.description}
                </span>
              </div>
              )}
              
              {airQualityData && (
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Activity size={14} className="text-green-600 mr-1.5" />
                  Air Quality
                </span>
                <span className={`text-sm font-medium ${
                  airQualityData.aqi < 50 ? 'text-emerald-600' : 
                  airQualityData.aqi < 100 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {airQualityData.quality}
                </span>
              </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="buildings">
            <div className="text-sm space-y-3 py-2">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Building2 size={14} className="mr-1.5 text-slate-600" />
                  Total Structures
                </span>
                <span className="font-medium">{extendedMetrics.grid?.flat().filter(cell => cell.building).length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <TreePine size={14} className="mr-1.5 text-green-600" />
                  Green Spaces
                </span>
                <span className="font-medium">{extendedMetrics.grid?.flat().filter(cell => 
                  cell.building?.category === 'greenspace').length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <Info size={14} className="mr-1.5 text-indigo-600" />
                  Zone Balance
                </span>
                <span className={`font-medium ${
                  extendedMetrics.zoneBalanceScore > 70 ? 'text-emerald-600' : 
                  extendedMetrics.zoneBalanceScore > 40 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {extendedMetrics.zoneBalanceScore ? 
                    Math.round(extendedMetrics.zoneBalanceScore) + '%' : 'N/A'}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="energy" className="pt-2">
            <div className="flex flex-row items-center justify-between">
              <div className="text-sm">
                <div className="font-medium mb-1">Energy Sources</div>
                <div className="flex flex-row gap-2 text-xs font-normal mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div>
                    <span>Solar ({solarPercentage}%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                    <span>Wind ({windPercentage}%)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-300 rounded-sm mr-1"></div>
                    <span>Grid ({gridPercentage}%)</span>
                  </div>
                </div>
              </div>

              <div className="w-24 h-24">
                <PieChart width={100} height={100}>
                  <Pie
                    data={energyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    label={(entry) => `${entry.value}`}
                    labelLine={false}
                  >
                    {energyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        labelKey="name"
                        formatter={(value) => [`${value}%`, 'Value']}
                      />
                    } 
                  />
                </PieChart>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <p className="text-gray-600">
                Increase your renewable energy sources to improve your city's sustainability score 
                and reduce carbon emissions.
              </p>
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span>Energy efficiency</span>
                  <span className={`font-medium ${
                    metrics.energy < 30 ? 'text-emerald-600' : 
                    metrics.energy < 60 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {metrics.energy < 30 ? 'Excellent' : 
                     metrics.energy < 60 ? 'Good' : 'Poor'}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-3 border-t border-stone-200 bg-gray-50 mt-auto">
        <div className="text-xs text-gray-500 flex items-center">
          <TreePine size={14} className="mr-1.5 text-green-500" />
          Add more green spaces to improve your city's environmental rating.
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalMetricsComponent;
