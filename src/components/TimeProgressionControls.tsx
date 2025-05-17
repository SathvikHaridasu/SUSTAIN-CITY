
import React from 'react';
import { Clock, Play, Pause, FastForward } from 'lucide-react';
import { TimeProgressionState } from '@/utils/timeProgression';

interface TimeProgressionControlsProps {
  currentYear?: number;
}

const TimeProgressionControls: React.FC<TimeProgressionControlsProps> = ({ 
  currentYear = 2025 
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-semibold">{currentYear}</span>
      </div>
      <span className="text-xs text-muted-foreground ml-2">Present Day</span>
    </div>
  );
};

export default TimeProgressionControls;
