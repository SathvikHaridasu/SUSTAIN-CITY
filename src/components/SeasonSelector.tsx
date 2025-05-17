
import React from 'react';
import { Season, SEASONS, getNextSeason } from '@/utils/seasons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

interface SeasonSelectorProps {
  currentSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ currentSeason, onSeasonChange }) => {
  const { toast } = useToast();
  const seasonData = SEASONS[currentSeason];
  
  const handleChangeSeason = () => {
    const nextSeason = getNextSeason(currentSeason);
    onSeasonChange(nextSeason);
    
    toast({
      title: `Season changed to ${SEASONS[nextSeason].displayName}`,
      description: SEASONS[nextSeason].description,
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleChangeSeason}
            variant="outline" 
            size="sm"
            className={`flex items-center gap-1.5 ${seasonData.color} text-white hover:${seasonData.color} hover:opacity-90`}
          >
            <span>{seasonData.icon}</span>
            <span>{seasonData.displayName}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="max-w-[250px]">
          <div className="space-y-1">
            <p className="font-medium">{seasonData.displayName} Effects:</p>
            <ul className="text-xs space-y-1">
              <li>Energy: {(seasonData.impact.energyModifier > 1 ? "+" : "") + ((seasonData.impact.energyModifier - 1) * 100).toFixed(0)}%</li>
              <li>Water: {(seasonData.impact.waterModifier > 1 ? "+" : "") + ((seasonData.impact.waterModifier - 1) * 100).toFixed(0)}%</li>
              <li>Emissions: {(seasonData.impact.emissionsModifier > 1 ? "+" : "") + ((seasonData.impact.emissionsModifier - 1) * 100).toFixed(0)}%</li>
              <li>Heat: {(seasonData.impact.heatModifier > 1 ? "+" : "") + ((seasonData.impact.heatModifier - 1) * 100).toFixed(0)}%</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">{seasonData.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SeasonSelector;
