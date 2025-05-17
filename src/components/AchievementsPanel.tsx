
import React from 'react';
import { Achievement } from '@/utils/achievements';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

interface AchievementsPanelProps {
  achievements: Achievement[];
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5">
          <Award size={16} />
          <span>Achievements</span>
          <Badge className="ml-1 text-xs">{unlockedCount}/{totalCount}</Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>City Achievements</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-muted-foreground">
              You've unlocked {unlockedCount} out of {totalCount} achievements
            </div>
            <div className="text-sm font-medium">
              {Math.round((unlockedCount / totalCount) * 100)}% Complete
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`border rounded-lg p-3 ${achievement.unlocked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200 opacity-70'}`}
              >
                <div className="flex gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-medium">{achievement.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{achievement.description}</div>
                    {achievement.unlocked && (
                      <Badge className="mt-2 bg-green-100 text-green-800 border-green-200 hover:bg-green-200">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementsPanel;
