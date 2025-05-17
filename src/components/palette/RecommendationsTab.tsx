
import React from 'react';
import { EnvironmentalMetrics } from '@/utils/environmental';
import { getImprovementTips } from '@/utils/environmental';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SproutIcon, InfoIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

interface RecommendationsTabProps {
  environmentalMetrics?: EnvironmentalMetrics;
}

const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ environmentalMetrics }) => {
  // Get improvement tips if environmental metrics are available
  const improvementTips = environmentalMetrics ? getImprovementTips(environmentalMetrics) : [];

  return (
    <div className="space-y-4">
      <Card className="bg-white border-teal-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-teal-50 to-transparent">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <SproutIcon size={14} className="text-teal-600" />
            Sustainable City Building Tips
          </CardTitle>
          <CardDescription className="text-xs">
            Data-driven recommendations based on sustainability best practices
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-3 pb-1">
          {improvementTips.length > 0 ? (
            <ul className="space-y-3">
              {improvementTips.map((tip, index) => (
                <li key={index} className="flex items-start bg-white p-2 rounded-md border border-teal-100">
                  <span className="mr-1.5 mt-0.5 text-teal-600 flex-shrink-0">
                    {index % 2 === 0 ? <AlertCircleIcon size={14} /> : <CheckCircleIcon size={14} />}
                  </span>
                  <span className="text-sm text-stone-600">{tip}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-4 text-stone-500">
              Start building your city to see sustainability recommendations.
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-white border-blue-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <InfoIcon size={14} className="text-blue-600" />
            Sustainable Urban Design Principles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <ul className="space-y-2">
            <li className="flex items-start text-sm">
              <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
              <span>
                <strong className="text-stone-700">Mixed-Use Development:</strong>
                <span className="text-stone-600 ml-1">Combine residential, commercial, and recreational areas to reduce transportation needs.</span>
              </span>
            </li>
            <li className="flex items-start text-sm">
              <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
              <span>
                <strong className="text-stone-700">Green Buffer Zones:</strong>
                <span className="text-stone-600 ml-1">Place parks between industrial and residential areas to mitigate pollution.</span>
              </span>
            </li>
            <li className="flex items-start text-sm">
              <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
              <span>
                <strong className="text-stone-700">Renewable Energy:</strong>
                <span className="text-stone-600 ml-1">Integrate solar and wind farms strategically throughout your city.</span>
              </span>
            </li>
            <li className="flex items-start text-sm">
              <span className="text-blue-600 mr-1.5 flex-shrink-0">•</span>
              <span>
                <strong className="text-stone-700">Walkability:</strong>
                <span className="text-stone-600 ml-1">Design compact neighborhoods with essential services within walking distance.</span>
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsTab;
