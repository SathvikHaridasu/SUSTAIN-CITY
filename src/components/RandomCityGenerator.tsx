
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Wand2 } from "lucide-react";
import { createEmptyGrid } from "@/utils/gridUtils";
import { GridItem } from "@/utils/environmental";
import { BUILDINGS } from "@/utils/buildings";
import { generateCity } from "@/api/generate-city";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RandomCityGeneratorProps {
  onGridGenerated: (grid: GridItem[][]) => void;
}

const RandomCityGenerator: React.FC<RandomCityGeneratorProps> = ({
  onGridGenerated,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();

  const placeBuilding = (
    grid: GridItem[][],
    x: number,
    y: number,
    buildingId: string
  ) => {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    if (building) {
      grid[x][y] = { x, y, building };
    }
    return grid;
  };

  const placeRoads = (
    grid: GridItem[][],
    startX: number,
    startY: number,
    length: number,
    direction: "horizontal" | "vertical"
  ) => {
    for (let i = 0; i < length; i++) {
      if (direction === "horizontal") {
        placeBuilding(grid, startX + i, startY, "road");
      } else {
        placeBuilding(grid, startX, startY + i, "road");
      }
    }
    return grid;
  };

  const fillEmptyBlocksWithBuildings = (
    grid: GridItem[][],
    buildingTypes: string[],
    density = 0.8
  ) => {
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        if (grid[x][y]?.building) continue;

        if (Math.random() < density) {
          const randomBuildingType =
            buildingTypes[Math.floor(Math.random() * buildingTypes.length)];
          placeBuilding(grid, x, y, randomBuildingType);
        }
      }
    }
    return grid;
  };

  const generateRandomCity = async () => {
    setIsGenerating(true);
    try {
      console.log("Starting city generation...");

      const prompt =
        customPrompt ||
        "Generate a sustainable city layout with a mix of residential, commercial, and green spaces. Include roads, parks, and renewable energy sources.";
      const { layout } = await generateCity(prompt);

      const grid = createEmptyGrid();

      layout.forEach((item: { type: string; x: number; y: number }) => {
        if (
          !item.type ||
          typeof item.x !== "number" ||
          typeof item.y !== "number"
        ) {
          console.warn("Invalid item in layout:", item);
          return;
        }

        if (item.type === "road") {
          placeRoads(grid, item.x, item.y, 1, "horizontal");
        } else {
          placeBuilding(grid, item.x, item.y, item.type);
        }
      });

      const buildingTypes = [
        "residential-house",
        "apartment-building",
        "green-apartment",
        "retail-store",
        "office-building",
        "park",
        "community-garden",
      ];
      fillEmptyBlocksWithBuildings(grid, buildingTypes, 0.3);

      onGridGenerated(grid);
      toast({
        title: "City Generated",
        description: "A new random city has been generated!",
        variant: "default",
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Error generating city:", error);
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate a new city. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 bg-white text-gray-800 hover:bg-gray-100 shadow-sm border border-gray-300"
        >
          <Wand2 className="h-4 w-4" />
          <span>Generate Random City</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate City</DialogTitle>
          <DialogDescription>
            Enter a prompt to describe the type of city you want to generate.
            Leave empty for a default sustainable city layout.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Example: Generate a futuristic city with lots of green spaces and renewable energy..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button
            onClick={generateRandomCity}
            disabled={isGenerating}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isGenerating ? "Generating..." : "Generate City"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RandomCityGenerator;
