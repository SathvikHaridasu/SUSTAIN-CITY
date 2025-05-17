
import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Disaster } from '@/utils/naturalDisasters';
import { cn } from '@/lib/utils';

interface DisasterAlertProps {
  disaster: Disaster;
  onClose?: () => void;
  className?: string;
}

const DisasterAlert: React.FC<DisasterAlertProps> = ({ 
  disaster, 
  onClose,
  className
}) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [disaster, onClose]);

  const getAlertVariant = () => {
    switch (disaster.type) {
      case 'flood': return 'bg-blue-500/10 border-blue-500/30';
      case 'heat-wave': return 'bg-orange-500/10 border-orange-500/30';
      case 'storm': return 'bg-indigo-500/10 border-indigo-500/30';
      case 'drought': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'wildfire': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const getDisasterImpactText = () => {
    switch (disaster.type) {
      case 'flood':
        return 'Affected areas experiencing water damage and reduced functionality. Roads in low-lying areas closed.';
      case 'heat-wave':
        return 'Energy consumption has increased by 30%. Green spaces providing critical cooling effects.';
      case 'storm':
        return 'Power outages affecting parts of the city. Wind damage to exposed structures.';
      case 'drought':
        return 'Water restrictions in place. Parks and agriculture suffering reduced efficiency.';
      case 'wildfire':
        return 'Air quality severely reduced. Emergency services stretched thin. Evacuation orders in at-risk areas.';
      default:
        return 'City services affected. Monitor updates for more information.';
    }
  };

  return (
    <Alert className={cn("transition-all", getAlertVariant(), className)}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{disaster.icon}</span>
        <div>
          <AlertTitle className="text-lg font-semibold">
            {disaster.name} Alert
          </AlertTitle>
          <AlertDescription className="text-sm">
            {disaster.description}. Will last for {disaster.remainingDuration} year{disaster.remainingDuration > 1 ? 's' : ''}.
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="font-medium">Current Impact:</span> {getDisasterImpactText()}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default DisasterAlert;
