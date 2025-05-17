
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { TimeOfDay, TIME_SETTINGS, getNextTimeOfDay } from '@/utils/dayNightCycle';

interface TimeOfDaySelectorProps {
  currentTime: TimeOfDay;
  onTimeChange: (time: TimeOfDay) => void;
}

const TimeOfDaySelector: React.FC<TimeOfDaySelectorProps> = ({ currentTime, onTimeChange }) => {
  const { toast } = useToast();
  const timeSettings = TIME_SETTINGS[currentTime];
  
  const getTimeIcon = (time: TimeOfDay): string => {
    switch(time) {
      case 'dawn': return '🌅';
      case 'day': return '☀️';
      case 'dusk': return '🌇';
      case 'night': return '🌙';
    }
  };
  
  const handleChangeTime = () => {
    const nextTime = getNextTimeOfDay(currentTime);
    onTimeChange(nextTime);
    
    toast({
      title: `Time changed to ${nextTime}`,
      description: `The lighting in your city has been updated.`,
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleChangeTime}
            variant="outline" 
            size="sm"
            className="flex items-center gap-1.5"
          >
            <span>{getTimeIcon(currentTime)}</span>
            <span>{timeSettings.timeOfDay.charAt(0).toUpperCase() + timeSettings.timeOfDay.slice(1)}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="max-w-[250px]">
          <div className="space-y-1">
            <p className="font-medium">{timeSettings.timeOfDay.charAt(0).toUpperCase() + timeSettings.timeOfDay.slice(1)} Effects:</p>
            <ul className="text-xs space-y-1">
              <li>Ambient Light: {(timeSettings.ambientLightIntensity * 100).toFixed(0)}%</li>
              <li>Sun/Moon Light: {(timeSettings.directionalLightIntensity * 100).toFixed(0)}%</li>
              <li>Building Lights: {timeSettings.buildingLightsOn ? 'On' : 'Off'}</li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TimeOfDaySelector;
