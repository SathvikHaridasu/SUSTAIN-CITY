import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, FileSymlink, Plus } from "lucide-react";
import SeasonSelector from "@/components/SeasonSelector";
import TimeOfDaySelector from "@/components/TimeOfDaySelector";
import { Season } from "@/utils/seasons";
import { TimeOfDay } from "@/utils/dayNightCycle";
import { CityTemplate } from "@/utils/cityTemplates";
import CityTemplateSelector from "../CityTemplateSelector";
import RandomCityGenerator from "../RandomCityGenerator";
import { GridItem } from "@/utils/environmental";

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
  onSelectTemplate: (template: CityTemplate) => void;
  onGridUpdate: (grid: GridItem[][]) => void;
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
  onSelectTemplate,
  onGridUpdate,
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
          <span>{isSaving ? "Saving..." : "Save City"}</span>
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

        <RandomCityGenerator onGridGenerated={onGridUpdate} />

        <CityTemplateSelector onSelectTemplate={onSelectTemplate} />

        <SeasonSelector
          currentSeason={currentSeason}
          onSeasonChange={onSeasonChange}
        />

        <TimeOfDaySelector
          currentTime={currentTime}
          onTimeChange={onTimeChange}
        />
      </div>
    </div>
  );
};

export default CityToolbar;
