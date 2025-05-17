
import React from 'react';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';

interface PaletteSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const PaletteSearchBar: React.FC<PaletteSearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative mb-2">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search buildings..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9 h-9 text-sm border-primary/20 bg-white/80"
      />
    </div>
  );
};

export default PaletteSearchBar;
