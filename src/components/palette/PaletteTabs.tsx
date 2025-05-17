
import React from 'react';
import { LayersIcon, SproutIcon, BarChartIcon } from 'lucide-react';

interface PaletteTabsProps {
  activeTab: 'buildings' | 'recommendations' | 'predictions';
  onTabChange: (tab: 'buildings' | 'recommendations' | 'predictions') => void;
}

const PaletteTabs: React.FC<PaletteTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex space-x-2 mb-2">
      <button 
        onClick={() => onTabChange('buildings')}
        className={`px-3 py-1.5 text-xs rounded-md flex items-center ${activeTab === 'buildings' 
          ? 'bg-teal-600 text-white' 
          : 'bg-white hover:bg-stone-100 text-stone-600'}`}
      >
        <LayersIcon size={14} className="mr-1.5" />
        Buildings
      </button>
      <button 
        onClick={() => onTabChange('recommendations')}
        className={`px-3 py-1.5 text-xs rounded-md flex items-center ${activeTab === 'recommendations' 
          ? 'bg-teal-600 text-white' 
          : 'bg-white hover:bg-stone-100 text-stone-600'}`}
      >
        <SproutIcon size={14} className="mr-1.5" />
        Insights
      </button>
      <button 
        onClick={() => onTabChange('predictions')}
        className={`px-3 py-1.5 text-xs rounded-md flex items-center ${activeTab === 'predictions' 
          ? 'bg-teal-600 text-white' 
          : 'bg-white hover:bg-stone-100 text-stone-600'}`}
      >
        <BarChartIcon size={14} className="mr-1.5" />
        Analytics
      </button>
    </div>
  );
};

export default PaletteTabs;
