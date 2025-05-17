
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building } from '@/utils/buildings';
import { 
  BuildingUpgrade, 
  BUILDING_UPGRADES, 
  isUpgradedBuilding,
  canUpgradeBuilding
} from '@/utils/buildingUpgrades';
import { Leaf } from 'lucide-react';

interface BuildingUpgradePanelProps {
  building: Building | null;
  currentYear: number;
  isOpen: boolean;
  onClose: () => void;
  onApplyUpgrade: (buildingLocation: { x: number; y: number }, upgradeId: string) => void;
  buildingLocation: { x: number; y: number } | null;
}

const BuildingUpgradePanel: React.FC<BuildingUpgradePanelProps> = ({
  building,
  currentYear,
  isOpen,
  onClose,
  onApplyUpgrade,
  buildingLocation
}) => {
  const [availableUpgrades, setAvailableUpgrades] = useState<BuildingUpgrade[]>([]);
  const [appliedUpgrades, setAppliedUpgrades] = useState<string[]>([]);

  useEffect(() => {
    if (building) {
      // Get applied upgrades if any
      if (isUpgradedBuilding(building)) {
        setAppliedUpgrades(building.upgrades);
      } else {
        setAppliedUpgrades([]);
      }
      
      // Filter available upgrades
      const upgrades = BUILDING_UPGRADES.filter(upgrade => 
        canUpgradeBuilding(building, upgrade, currentYear)
      );
      setAvailableUpgrades(upgrades);
    } else {
      setAvailableUpgrades([]);
      setAppliedUpgrades([]);
    }
  }, [building, currentYear]);

  const handleUpgradeClick = (upgradeId: string) => {
    if (building && buildingLocation) {
      onApplyUpgrade(buildingLocation, upgradeId);
    }
  };

  if (!building) return null;

  const buildingName = building.name;
  const buildingCategory = building.category.charAt(0).toUpperCase() + building.category.slice(1);

  return (
    <Drawer open={isOpen && !!building} onClose={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <span>Upgrade {buildingName}</span>
            {appliedUpgrades.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {appliedUpgrades.length} Upgrade{appliedUpgrades.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </DrawerTitle>
          <DrawerDescription>
            {buildingCategory} Building • Add improvements to reduce environmental impact
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-2 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {availableUpgrades.length > 0 ? (
              availableUpgrades.map((upgrade) => (
                <Card key={upgrade.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-xl">{upgrade.icon}</span>
                        {upgrade.name}
                      </CardTitle>
                      {upgrade.requiresYear && (
                        <Badge variant="outline" className={currentYear >= upgrade.requiresYear ? "bg-green-500/10" : "bg-orange-500/10"}>
                          {upgrade.requiresYear}+
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{upgrade.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1 pb-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(upgrade.environmentalImpact).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span className={value < 1 ? "text-green-500" : value > 1 ? "text-orange-500" : ""}>
                            {value < 1 ? `-${((1 - value) * 100).toFixed(0)}%` : value > 1 ? `+${((value - 1) * 100).toFixed(0)}%` : '0%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={() => handleUpgradeClick(upgrade.id)}
                      disabled={appliedUpgrades.includes(upgrade.id)}
                    >
                      <Leaf className="h-4 w-4 mr-1" />
                      {appliedUpgrades.includes(upgrade.id) ? 'Applied' : 'Apply Upgrade'}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                {appliedUpgrades.length > 0 ? (
                  <p>All available upgrades have been applied to this building.</p>
                ) : (
                  <p>No upgrades are currently available for this building.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default BuildingUpgradePanel;
