
import React from 'react';
import { BUILDING_CATEGORIES } from '@/utils/buildings';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BuildingCategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const BuildingCategoryFilter: React.FC<BuildingCategoryFilterProps> = ({ activeCategory, onCategoryChange }) => {
  return (
    <Tabs defaultValue={activeCategory} className="w-full" onValueChange={(value) => onCategoryChange(value)}>
      <TabsList className="w-full h-auto flex flex-wrap p-1 bg-white/50">
        {BUILDING_CATEGORIES.map(category => (
          <TabsTrigger 
            key={category.value} 
            value={category.value}
            className="flex-1 h-8 text-xs py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {category.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default BuildingCategoryFilter;
