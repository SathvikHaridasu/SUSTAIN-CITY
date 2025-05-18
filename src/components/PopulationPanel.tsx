
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PopulationState } from '@/utils/populationSimulation';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, BarChart2 } from 'lucide-react';

interface PopulationPanelProps {
  population: PopulationState;
  className?: string;
}

const PopulationPanel: React.FC<PopulationPanelProps> = ({ population, className }) => {
  // Configuration for the pie chart
  const chartConfig = {
    solar: { color: '#10b981' },
    wind: { color: '#3b82f6' },
    grid: { color: '#f59e0b' },
  };

  // Calculation functions
  const calculatePercentage = (value: number) => Math.min(100, Math.max(0, value));

  // Use memo for calculations to prevent unnecessary recalculations
  const metrics = useMemo(() => {
    // Extract base metrics from population data
    const baseMetrics = {
      carbonFootprint: population.traffic ? calculatePercentage(65 - population.traffic * 0.5) : 65,
      renewableEnergy: population.distribution ? calculatePercentage(
        60 + (population.distribution.parks * 2)
      ) : 70,
      livabilityScore: population.density ? calculatePercentage(100 - population.density) : 85
    };
    
    // Add small random variance for more realistic feel
    const randomVariance = () => (Math.random() * 4) - 2; // -2 to +2 variance
    
    return {
      carbonFootprint: Math.round(baseMetrics.carbonFootprint + randomVariance()),
      renewableEnergy: Math.round(baseMetrics.renewableEnergy + randomVariance()),
      livabilityScore: Math.round(baseMetrics.livabilityScore + randomVariance())
    };
  }, [population]);
  
  // Calculate energy distribution with proper percentages
  const energyData = useMemo(() => {
    const renewablePercent = metrics.renewableEnergy;
    
    // Calculate realistic energy source percentages
    const solarPercentage = Math.round(renewablePercent * 0.6);
    const windPercentage = Math.round(renewablePercent * 0.4);
    const gridPercentage = Math.max(0, 100 - solarPercentage - windPercentage);
    
    return [
      { name: 'Solar', value: solarPercentage, fill: '#10b981' },
      { name: 'Wind', value: windPercentage, fill: '#3b82f6' },
      { name: 'Grid', value: gridPercentage, fill: '#f59e0b' },
    ];
  }, [metrics.renewableEnergy]);
  
  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-white rounded-md shadow-sm border border-stone-200">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <BarChart2 size={18} className="mr-2 text-emerald-600" />
              Sustain City Analytics
            </h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Live data</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1 text-gray-700">Carbon Footprint</span>
              <span className="text-lg font-bold">{metrics.carbonFootprint} tons</span>
              <Progress 
                value={metrics.carbonFootprint} 
                className="h-2 mt-1 bg-slate-100" 
                indicatorColor={metrics.carbonFootprint > 70 ? 'bg-emerald-500' : 
                  metrics.carbonFootprint > 40 ? 'bg-amber-500' : 'bg-red-500'}
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1 text-gray-700">Renewable Energy</span>
              <span className="text-lg font-bold">{metrics.renewableEnergy}%</span>
              <Progress 
                value={metrics.renewableEnergy} 
                className="h-2 mt-1 bg-slate-100"
                indicatorColor="bg-blue-500"
              />
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm font-medium mb-1 text-gray-700">Livability Score</span>
              <span className="text-lg font-bold">{metrics.livabilityScore}</span>
              <Progress 
                value={metrics.livabilityScore} 
                className="h-2 mt-1 bg-slate-100"
                indicatorColor={metrics.livabilityScore > 70 ? 'bg-emerald-500' : 
                  metrics.livabilityScore > 40 ? 'bg-amber-500' : 'bg-red-500'}
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Energy Distribution</h3>
              <div className="flex flex-row gap-3 text-xs font-normal mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div>
                  <span>Solar ({energyData[0].value}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                  <span>Wind ({energyData[1].value}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm mr-1"></div>
                  <span>Grid ({energyData[2].value}%)</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <Activity size={12} className="mr-1 text-gray-400" />
                  {metrics.renewableEnergy > 70 
                    ? "Excellent renewable adoption rate"
                    : metrics.renewableEnergy > 50
                    ? "Good renewable energy mix"
                    : metrics.renewableEnergy > 30
                    ? "Average renewable adoption"
                    : "Consider more renewable sources"}
                </div>
              </div>
            </div>

            <div className="w-28 h-28">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={1}
                      stroke="#fff"
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
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(PopulationPanel);
