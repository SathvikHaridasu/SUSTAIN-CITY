
import React from 'react';
import { Building, getCompatibilityTips } from '@/utils/buildings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InfoIcon } from 'lucide-react';

interface BuildingInfoPanelProps {
  building: Building;
}

const BuildingInfoPanel: React.FC<BuildingInfoPanelProps> = ({ building }) => {
  if (!building) return null;
  
  return (
    <Card className="bg-white/80 border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <InfoIcon size={14} className="text-primary" />
          {building.name}
        </CardTitle>
        <CardDescription className="text-xs">{building.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex gap-2 flex-wrap mb-2">
          <Badge variant="outline" className="text-[10px] py-0 border-primary/30 bg-white/70">
            {building.size.width}x{building.size.depth}
          </Badge>
          <Badge variant="outline" className="text-[10px] py-0 border-primary/30 bg-white/70">
            {building.category}
          </Badge>
        </div>
        <Separator className="my-2 bg-muted/50" />
        <div className="space-y-1.5">
          {getCompatibilityTips(building.id).map((tip, index) => (
            <div key={index} className="text-xs flex items-start">
              <span className="text-primary mr-1.5 flex-shrink-0">•</span>
              <span className="text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuildingInfoPanel;
