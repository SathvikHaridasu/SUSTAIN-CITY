
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PopulationState } from '@/utils/populationSimulation';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

interface PopulationPanelProps {
  population: PopulationState;
  className?: string;
}

const PopulationPanel: React.FC<PopulationPanelProps> = ({ population, className }) => {
  // Energy source distribution data for pie chart - Make this dynamic
  const [energyData, setEnergyData] = useState([
    { name: 'Solar', value: 40, fill: '#82ca9d' },
    { name: 'Wind', value: 30, fill: '#8884d8' },
    { name: 'Grid', value: 30, fill: '#d4af81' },
  ]);

  // Configuration for the pie chart
  const chartConfig = {
    solar: { color: '#82ca9d' },
    wind: { color: '#8884d8' },
    grid: { color: '#d4af81' },
  };

  // Sustainability metrics
  const [metrics, setMetrics] = useState({
    carbonFootprint: 65,
    renewableEnergy: 70,
    livabilityScore: 85,
  });

  // Update metrics based on population state
  useEffect(() => {
    if (population) {
      // Calculate metrics based on population data
      const carbonReduction = population.traffic ? 100 - population.traffic : 65;
      const renewablePercent = population.distribution ? 
        Math.min(100, 60 + (population.distribution.parks * 2)) : 70;
      
      setMetrics({
        carbonFootprint: Math.max(10, Math.min(100, carbonReduction)),
        renewableEnergy: Math.max(10, Math.min(100, renewablePercent)),
        livabilityScore: Math.max(10, Math.min(100, population.density ? 100 - population.density : 85))
      });
    }
  }, [population]);
  
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-md p-4 border border-stone-200">
        <h2 className="text-lg font-medium mb-4">Sustainability Metrics</h2>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Carbon Footprint</span>
            <span className="text-lg font-bold">{metrics.carbonFootprint} tons</span>
            <Progress 
              value={metrics.carbonFootprint} 
              className="h-2 mt-1 bg-slate-100" 
              indicatorColor={metrics.carbonFootprint > 70 ? 'bg-emerald-500' : 
                metrics.carbonFootprint > 40 ? 'bg-amber-500' : 'bg-red-500'}
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium">Renewable Energy</span>
            <span className="text-lg font-bold">{metrics.renewableEnergy} %</span>
            <Progress 
              value={metrics.renewableEnergy} 
              className="h-2 mt-1 bg-slate-100"
              indicatorColor="bg-blue-500"
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium">Livability Score</span>
            <span className="text-lg font-bold">{metrics.livabilityScore}</span>
            <Progress 
              value={metrics.livabilityScore} 
              className="h-2 mt-1 bg-slate-100"
              indicatorColor={metrics.livabilityScore > 70 ? 'bg-emerald-500' : 
                metrics.livabilityScore > 40 ? 'bg-amber-500' : 'bg-red-500'}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between mt-4">
          <div className="text-sm font-medium">
            <div className="mb-1">Energy</div>
            <div className="flex flex-row gap-2 text-xs font-normal mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div>
                <span>Solar</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                <span>Wind</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-300 rounded-sm mr-1"></div>
                <span>Grid</span>
              </div>
            </div>
          </div>

          <div className="w-24 h-24">
            <ChartContainer config={chartConfig} className="h-full">
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
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopulationPanel;
