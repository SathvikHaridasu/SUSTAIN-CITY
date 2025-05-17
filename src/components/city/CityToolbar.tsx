
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, FileSymlink, Plus } from 'lucide-react';
import SeasonSelector from '@/components/SeasonSelector';
import TimeOfDaySelector from '@/components/TimeOfDaySelector';
import { Season } from '@/utils/seasons';
import { TimeOfDay } from '@/utils/dayNightCycle';
import { Achievement } from '@/utils/achievements';
import { CityTemplate } from '@/utils/cityTemplates';
import AchievementsPanel from '../AchievementsPanel';
import CityTemplateSelector from '../CityTemplateSelector';

interface CityToolbarProps {
  cityName: string;
  onCityNameChange: (name: string) => void;
  onSave: () => void;
  onNewCity: () => void;
  isSaving: boolean;
  isLoading: boolean;
  currentSeason: Season;
  onSeasonChange: (season: Season) => void;
  currentTime: TimeOfDay;
  onTimeChange: (time: TimeOfDay) => void;
  achievements: Achievement[];
  onSelectTemplate: (template: CityTemplate) => void;
}

const CityToolbar: React.FC<CityToolbarProps> = ({
  cityName,
  onCityNameChange,
  onSave,
  onNewCity,
  isSaving,
  isLoading,
  currentSeason,
  onSeasonChange,
  currentTime,
  onTimeChange,
  achievements,
  onSelectTemplate
}) => {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <Input
          value={cityName}
          onChange={(e) => onCityNameChange(e.target.value)}
          className="max-w-[250px]"
          placeholder="City Name"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onSave}
          disabled={isSaving || isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? 'Saving...' : 'Save City'}</span>
        </Button>
        
        <Button
          onClick={onNewCity}
          disabled={isSaving || isLoading}
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New City</span>
        </Button>
        
        <CityTemplateSelector onSelectTemplate={onSelectTemplate} />
        
        <SeasonSelector 
          currentSeason={currentSeason}
          onSeasonChange={onSeasonChange}
        />
        
        <TimeOfDaySelector
          currentTime={currentTime}
          onTimeChange={onTimeChange}
        />
        
        <AchievementsPanel achievements={achievements} />
      </div>
    </div>
  );
};

export default CityToolbar;
