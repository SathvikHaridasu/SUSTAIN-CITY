
import React, { useMemo } from 'react';
import { EnvironmentalMetrics } from '@/utils/environmental';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChartIcon, InfoIcon, BuildingIcon, GlobeIcon, LineChartIcon } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PredictionsTabProps {
  environmentalMetrics?: EnvironmentalMetrics;
}

// Define the extended metrics type to use internally
interface ExtendedMetrics extends EnvironmentalMetrics {
  grid?: any[][];
}

const PredictionsTab: React.FC<PredictionsTabProps> = ({ environmentalMetrics }) => {
  // Helper functions for UI 
  const getMetricClass = (value: number) => {
    if (value < 30) return "text-red-600";
    if (value < 60) return "text-amber-600";
    return "text-emerald-600";
  };
  
  const getProgressColor = (value: number) => {
    if (value < 30) return "bg-red-500";
    if (value < 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  // Calculate metrics with memoization to avoid recalculation
  const metrics = useMemo(() => {
    if (!environmentalMetrics) return null;
    
    // Ensure all values are within proper ranges (0-100)
    const emissions = Math.min(100, Math.max(0, environmentalMetrics.emissions));
    const water = Math.min(100, Math.max(0, environmentalMetrics.water));
    const energy = Math.min(100, Math.max(0, environmentalMetrics.energy));
    const heat = Math.min(100, Math.max(0, environmentalMetrics.heat));
    
    // Calculate sustainability score with proper weighting
    const emissionsWeight = 0.4;
    const waterWeight = 0.2;
    const energyWeight = 0.25;
    const heatWeight = 0.15;
    
    const weightedScore = Math.min(100, Math.max(0,
      (100 - emissions) * emissionsWeight + 
      (100 - water) * waterWeight + 
      (100 - energy) * energyWeight + 
      (100 - heat) * heatWeight
    ));
    
    const sustainability = {
      score: Math.round(weightedScore),
      label: weightedScore > 70 ? "excellent" : 
             weightedScore > 50 ? "good" : 
             weightedScore > 30 ? "moderate" : 
             "needs improvement"
    };
    
    // Calculate long-term impact
    const combinedMetric = Math.min(100, Math.max(0, 100 - (emissions + energy) / 2));
    const longterm = {
      value: Math.round(combinedMetric),
      label: combinedMetric > 70 ? "highly sustainable" :
             combinedMetric > 50 ? "sustainable" :
             combinedMetric > 30 ? "moderately sustainable" :
             "unsustainable"
    };
    
    // Calculate flood risk (higher water value = higher risk)
    const floodRisk = {
      value: Math.min(100, Math.max(0, water)),
      label: water < 30 ? "low" :
             water > 70 ? "high" :
             "moderate"
    };
    
    // Calculate air quality (inversely related to emissions)
    const airQuality = {
      value: Math.min(100, Math.max(0, 100 - emissions)),
      label: emissions < 30 ? "excellent" :
             emissions < 50 ? "good" :
             emissions < 70 ? "moderate" :
             "poor"
    };
    
    // Calculate emission reduction (baseline - current)
    const baselineEmissions = 100;
    const reduction = Math.min(100, Math.max(0, baselineEmissions - emissions));
    
    // Calculate climate resilience (higher is better)
    const resilienceScore = Math.min(100, Math.max(0, 100 - heat + (100 - water) / 4));
    
    // Calculate adaptability score
    const energyScore = Math.min(100, Math.max(0, 100 - energy));
    const waterScore = Math.min(100, Math.max(0, 100 - water));
    const heatScore = Math.min(100, Math.max(0, 100 - heat));
    const adaptabilityScore = Math.min(100, Math.max(0,
      (energyScore * 0.5) + (waterScore * 0.3) + (heatScore * 0.2)
    ));
    
    // Energy distribution - realistic and always adds up to 100%
    const renewablePercent = Math.min(100, Math.max(0, 100 - energy));
    const solarPercent = Math.min(renewablePercent, Math.round(renewablePercent * 0.6));
    const windPercent = Math.min(renewablePercent - solarPercent, Math.round(renewablePercent * 0.4));
    const gridPercent = Math.max(0, 100 - solarPercent - windPercent);
    
    const energyDistribution = [
      { name: 'Solar', value: solarPercent, fill: '#10b981' },
      { name: 'Wind', value: windPercent, fill: '#3b82f6' },
      { name: 'Grid', value: gridPercent, fill: '#f59e0b' }
    ];
    
    return {
      sustainability,
      longterm,
      floodRisk,
      airQuality,
      emissionReduction: reduction,
      resilienceScore,
      adaptabilityScore,
      energyDistribution
    };
  }, [environmentalMetrics]);

  // Chart configuration
  const chartConfig = {
    solar: { color: '#10b981' },
    wind: { color: '#3b82f6' },
    grid: { color: '#f59e0b' },
  };

  if (!metrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        Build your city to see sustainability analytics.
      </div>
    );
  }

  return (
    <Card className="bg-white border border-stone-200 shadow-sm overflow-hidden">
      <ChartContainer config={chartConfig}>
        <CardHeader className="pb-2 bg-gray-50">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <BarChartIcon size={14} className="text-indigo-600" />
            SustainCity Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            Data-based sustainability analysis of your city design
          </CardDescription>
        </CardHeader>
      </ChartContainer>
      <CardContent className="pt-4 pb-3 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-md border border-stone-200">
            <div className="text-xs text-gray-500 mb-1">Sustainability Score</div>
            <div className={`font-medium capitalize ${
              metrics.sustainability.score > 70 ? "text-emerald-600" :
              metrics.sustainability.score > 50 ? "text-emerald-600" :
              metrics.sustainability.score > 30 ? "text-amber-600" : "text-red-600"
            }`}>
              {metrics.sustainability.score}% - {metrics.sustainability.label}
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-md border border-stone-200">
            <div className="text-xs text-gray-500 mb-1">Long-Term Impact</div>
            <div className={`font-medium capitalize ${
              metrics.longterm.value > 70 ? "text-emerald-600" :
              metrics.longterm.value > 50 ? "text-emerald-600" :
              metrics.longterm.value > 30 ? "text-amber-600" : "text-red-600"
            }`}>
              {metrics.longterm.value}% - {metrics.longterm.label}
            </div>
          </div>
        </div>
        
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1.5">
              <LineChartIcon size={14} className="text-blue-600" />
              Air Quality
            </span>
            <span className={`text-sm font-medium ${getMetricClass(metrics.airQuality.value)}`}>
              {metrics.airQuality.value}% - {metrics.airQuality.label}
            </span>
          </div>
          
          <Progress 
            value={metrics.airQuality.value} 
            className="h-2 mt-1 mb-3 bg-slate-100"
            indicatorColor={getProgressColor(metrics.airQuality.value)}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1.5">
              <GlobeIcon size={14} className="text-emerald-600" />
              Climate Resilience
            </span>
            <span className={`text-sm font-medium ${getMetricClass(metrics.resilienceScore)}`}>
              {metrics.resilienceScore}% - {
                metrics.resilienceScore > 70 ? "Resilient" : 
                metrics.resilienceScore > 40 ? "Moderate Risk" : "Vulnerable"
              }
            </span>
          </div>
          
          <Progress 
            value={metrics.resilienceScore} 
            className="h-2 mt-1 mb-3 bg-slate-100"
            indicatorColor={getProgressColor(metrics.resilienceScore)}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1.5">
              <GlobeIcon size={14} className="text-emerald-600" />
              Emission Reduction
            </span>
            <span className={`text-sm font-medium ${getMetricClass(metrics.emissionReduction)}`}>
              {metrics.emissionReduction}%
            </span>
          </div>
          
          <Progress 
            value={metrics.emissionReduction} 
            className="h-2 mt-1 mb-3 bg-slate-100"
            indicatorColor={getProgressColor(metrics.emissionReduction)}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-sm flex items-center gap-1.5">
              <BuildingIcon size={14} className="text-indigo-600" />
              Urban Adaptability
            </span>
            <span className={`text-sm font-medium ${getMetricClass(metrics.adaptabilityScore)}`}>
              {metrics.adaptabilityScore}%
            </span>
          </div>
          
          <Progress 
            value={metrics.adaptabilityScore} 
            className="h-2 mt-1 mb-1 bg-slate-100"
            indicatorColor={getProgressColor(metrics.adaptabilityScore)}
          />
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-2 text-gray-700">Energy Distribution</h3>
              <div className="flex flex-row gap-3 text-xs font-normal mt-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-1"></div>
                  <span>Solar ({metrics.energyDistribution[0].value}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></div>
                  <span>Wind ({metrics.energyDistribution[1].value}%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm mr-1"></div>
                  <span>Grid ({metrics.energyDistribution[2].value}%)</span>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <InfoIcon size={12} className="mr-1 text-gray-400" />
                  {metrics.energyDistribution[0].value + metrics.energyDistribution[1].value > 50 
                    ? "Excellent renewable adoption rate"
                    : metrics.energyDistribution[0].value + metrics.energyDistribution[1].value > 30
                    ? "Good renewable energy mix"
                    : "Consider more renewable sources"}
                </div>
              </div>
            </div>

            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.energyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={1}
                    stroke="#fff"
                    label={(entry) => `${entry.value}%`}
                    labelLine={false}
                  >
                    {metrics.energyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="p-3 rounded-md border bg-gray-50 border-stone-200">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Environmental Projections</h4>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Air Quality: <span className="font-medium capitalize">{metrics.airQuality.label}</span></span>
            <span className="text-xs text-gray-500">Flood Risk: <span className="font-medium capitalize">{metrics.floodRisk.label}</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Using memo to prevent unnecessary re-renders
export default React.memo(PredictionsTab);
