
import React from 'react';
import { EnvironmentalMetrics } from '@/utils/environmental';
import { getFuturePredictions } from '@/utils/environmental';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChartIcon, InfoIcon, BuildingIcon, MapIcon, GlobeIcon, LineChartIcon } from 'lucide-react';

interface PredictionsTabProps {
  environmentalMetrics?: EnvironmentalMetrics;
}

// Define the extended metrics type to use internally
interface ExtendedMetrics extends EnvironmentalMetrics {
  grid?: any[][];
}

const PredictionsTab: React.FC<PredictionsTabProps> = ({ environmentalMetrics }) => {
  // Get future predictions if environmental metrics are available
  const futurePredictions = environmentalMetrics ? getFuturePredictions(environmentalMetrics) : [];

  // Calculate prediction metrics based on current data
  const calculateSustainabilityScore = () => {
    if (!environmentalMetrics) return "neutral";
    const { emissions, water, energy, heat } = environmentalMetrics;
    
    // Weighted calculation for more accurate score
    const emissionsWeight = 0.4;
    const waterWeight = 0.2;
    const energyWeight = 0.25;
    const heatWeight = 0.15;
    
    const weightedScore = (emissions * emissionsWeight) + 
                          (water * waterWeight) + 
                          (energy * energyWeight) + 
                          (heat * heatWeight);
    
    if (weightedScore < 40) return "excellent";
    if (weightedScore < 60) return "good";
    if (weightedScore < 80) return "moderate";
    return "needs improvement";
  };
  
  const calculateLongtermImpact = () => {
    if (!environmentalMetrics) return "unknown";
    const { emissions, energy } = environmentalMetrics;
    
    const combinedMetric = (emissions + energy) / 2;
    if (combinedMetric < 40) return "highly sustainable";
    if (combinedMetric < 60) return "sustainable";
    if (combinedMetric < 80) return "moderately sustainable";
    return "unsustainable";
  };
  
  const calculateFloodRisk = () => {
    if (!environmentalMetrics) return "moderate";
    
    // Calculate flood risk based on water usage and green infrastructure
    const { water } = environmentalMetrics;
    if (water < 30) return "low";
    if (water > 70) return "high";
    return "moderate";
  };
  
  const calculateAirQualityForecast = () => {
    if (!environmentalMetrics) return "moderate";
    
    // Calculate air quality based primarily on emissions
    const { emissions } = environmentalMetrics;
    if (emissions < 30) return "excellent";
    if (emissions < 50) return "good";
    if (emissions < 70) return "moderate";
    return "poor";
  };

  // Get more accurate scores
  const sustainabilityScore = calculateSustainabilityScore();
  const longtermImpact = calculateLongtermImpact();
  const floodRisk = calculateFloodRisk();
  const airQualityForecast = calculateAirQualityForecast();
  
  // Calculate emission reduction percentage with better accuracy
  const getEmissionReductionPercentage = () => {
    if (!environmentalMetrics) return 0;
    
    // Get baseline emission (what it would be with purely conventional energy sources)
    const baselineEmissions = 100;
    // Calculate reduction as a percentage
    const reduction = Math.max(0, Math.min(100, baselineEmissions - environmentalMetrics.emissions));
    return Math.round(reduction);
  };

  // Calculate climate resilience score based on various metrics
  const getClimateResilienceScore = () => {
    if (!environmentalMetrics) return 0;
    
    let score = 0;
    
    // Cast to extended metrics to safely access grid property
    const extendedMetrics = environmentalMetrics as ExtendedMetrics;
    
    // Green space ratio improves resilience
    const greenSpaces = extendedMetrics.grid?.flat().filter(cell => 
      cell.building?.category === 'greenspace'
    ).length || 0;
    
    const totalBuildings = extendedMetrics.grid?.flat().filter(cell => 
      cell.building
    ).length || 1;
    
    const greenRatio = greenSpaces / totalBuildings;
    score += greenRatio * 50;
    
    // Lower heat effect improves resilience
    score += Math.max(0, 100 - environmentalMetrics.heat) / 2;
    
    // Lower water consumption improves resilience
    score += Math.max(0, 100 - environmentalMetrics.water) / 4;
    
    return Math.min(100, Math.round(score));
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gray-50">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <BarChartIcon size={14} className="text-indigo-600" />
            Sustainability Analytics
          </CardTitle>
          <CardDescription className="text-xs">
            Data-based sustainability analysis of your city design
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 pb-1">
          {environmentalMetrics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-md border border-stone-200">
                  <div className="text-xs text-gray-500 mb-1">Sustainability Score</div>
                  <div className={`font-medium capitalize ${
                    sustainabilityScore === "excellent" ? "text-emerald-600" :
                    sustainabilityScore === "good" ? "text-emerald-600" :
                    sustainabilityScore === "moderate" ? "text-amber-600" : "text-red-600"
                  }`}>{sustainabilityScore}</div>
                </div>
                
                <div className="bg-white p-3 rounded-md border border-stone-200">
                  <div className="text-xs text-gray-500 mb-1">Long-Term Impact</div>
                  <div className={`font-medium capitalize ${
                    longtermImpact === "highly sustainable" ? "text-emerald-600" :
                    longtermImpact === "sustainable" ? "text-emerald-600" :
                    longtermImpact === "moderately sustainable" ? "text-amber-600" : "text-red-600"
                  }`}>{longtermImpact}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1.5">
                    <LineChartIcon size={14} className="text-blue-600" />
                    Carbon Footprint
                  </span>
                  <span className={`text-sm font-medium ${
                    environmentalMetrics.emissions < 30 ? 'text-emerald-600' : 
                    environmentalMetrics.emissions < 70 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {environmentalMetrics.emissions < 30 ? 'Sustainable' : 
                     environmentalMetrics.emissions < 70 ? 'Moderate Impact' : 'High Impact'}
                  </span>
                </div>
                
                <Progress 
                  value={100 - Math.min(100, environmentalMetrics.emissions)} 
                  className="h-2 mt-1 mb-2 bg-slate-100"
                  indicatorColor={
                    environmentalMetrics.emissions < 30 ? 'bg-emerald-500' :
                    environmentalMetrics.emissions < 70 ? 'bg-amber-500' : 'bg-red-500'
                  }
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1.5">
                    <MapIcon size={14} className="text-orange-600" />
                    Climate Resilience
                  </span>
                  <span className={`text-sm font-medium ${
                    environmentalMetrics.heat < 30 ? 'text-emerald-600' : 
                    environmentalMetrics.heat < 70 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {environmentalMetrics.heat < 30 ? 'Resilient' : 
                     environmentalMetrics.heat < 70 ? 'Moderate Risk' : 'Vulnerable'}
                  </span>
                </div>
                
                <Progress 
                  value={100 - Math.min(100, environmentalMetrics.heat)} 
                  className="h-2 mt-1 mb-2 bg-slate-100"
                  indicatorColor={
                    environmentalMetrics.heat < 30 ? 'bg-emerald-500' :
                    environmentalMetrics.heat < 70 ? 'bg-amber-500' : 'bg-red-500'
                  }
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1.5">
                    <GlobeIcon size={14} className="text-emerald-600" />
                    Emission Reduction
                  </span>
                  <span className={`text-sm font-medium ${
                    getEmissionReductionPercentage() > 60 ? 'text-emerald-600' : 
                    getEmissionReductionPercentage() > 30 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {getEmissionReductionPercentage()}%
                  </span>
                </div>
                
                <Progress 
                  value={getEmissionReductionPercentage()} 
                  className="h-2 mt-1 mb-2 bg-slate-100"
                  indicatorColor={
                    getEmissionReductionPercentage() > 60 ? 'bg-emerald-500' :
                    getEmissionReductionPercentage() > 30 ? 'bg-amber-500' : 'bg-red-500'
                  }
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Build your city to see sustainability analytics.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white border border-stone-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gray-50">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <GlobeIcon size={14} className="text-emerald-600" />
            Sustainability Measures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {environmentalMetrics ? (
            <div className="space-y-3">
              <div className="p-3 rounded-md border bg-gray-50 border-stone-200">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Air Quality</h4>
                <p className="text-xs text-gray-500">
                  Current air quality forecast: <span className="font-medium capitalize">{airQualityForecast}</span>
                </p>
                <div className="mt-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      airQualityForecast === "excellent" ? "bg-emerald-500" :
                      airQualityForecast === "good" ? "bg-emerald-500" :
                      airQualityForecast === "moderate" ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.max(5, 100 - environmentalMetrics.emissions)}%` }}
                  />
                </div>
              </div>
              
              <div className="p-3 rounded-md border bg-gray-50 border-stone-200">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Water Management</h4>
                <p className="text-xs text-gray-500">
                  Flood risk assessment: <span className="font-medium capitalize">{floodRisk}</span>
                </p>
                <div className="mt-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      floodRisk === "low" ? "bg-emerald-500" :
                      floodRisk === "moderate" ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.max(5, 100 - environmentalMetrics.water)}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-md border bg-gray-50 border-stone-200">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Climate Resilience</h4>
                <p className="text-xs text-gray-500">
                  Overall resilience score: <span className="font-medium">{getClimateResilienceScore()}</span>
                </p>
                <div className="mt-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      getClimateResilienceScore() > 70 ? "bg-emerald-500" :
                      getClimateResilienceScore() > 40 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${getClimateResilienceScore()}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-2 text-gray-500">
              No metrics available yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionsTab;
