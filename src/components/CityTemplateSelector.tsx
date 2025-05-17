
import React, { useState } from 'react';
import { CITY_TEMPLATES, CityTemplate } from '@/utils/cityTemplates';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface CityTemplateSelectorProps {
  onSelectTemplate: (template: CityTemplate) => void;
}

const CityTemplateSelector: React.FC<CityTemplateSelectorProps> = ({ onSelectTemplate }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSelectTemplate = (template: CityTemplate) => {
    // Force immediate infrastructure analysis update
    onSelectTemplate({ ...template });
    setOpen(false);
    
    // Use setTimeout to ensure the toast appears after the template is fully loaded
    setTimeout(() => {
      toast({
        title: `Selected "${template.name}" template`,
        description: `${template.description} You can now customize it to your liking.`,
      });
    }, 100);
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'hard':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <span>🏙️</span>
          <span>Templates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>City Templates</DialogTitle>
          <DialogDescription>
            Choose a template to start your sustainable city or as inspiration.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 max-h-[60vh] overflow-y-auto py-2">
          {CITY_TEMPLATES.map((template) => (
            <div 
              key={template.id}
              className="border rounded-lg p-3 hover:bg-secondary/20 transition-colors cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-lg font-medium flex items-center gap-2">
                    <span className="text-2xl">{template.thumbnail}</span>
                    {template.name}
                  </div>
                  <Badge className={`mt-1 ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center items-center mt-4">
          <p className="text-xs text-muted-foreground italic">
            Tip: After selecting a template, try the Street View mode to explore your city from the ground level!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityTemplateSelector;
