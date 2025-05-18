import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import CityLayout from "@/components/city/CityLayout";
import CityToolbar from "@/components/city/CityToolbar";
import { useCityPlanner } from "@/hooks/useCityPlanner";
import { getCurrentUser } from "@/utils/auth";
import { BUILDINGS, Building } from "@/utils/buildings";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [
    {
      grid,
      metrics,
      cityName,
      selectedBuilding,
      isLoading,
      isSaving,
      currentSeason,
      currentTime,
      featureState,
    },
    {
      setGrid,
      setCityName,
      setSelectedBuilding,
      handleCellUpdate,
      handleSave,
      handleReset,
      handleCreateNewCity,
      loadCityData,
      handleSeasonChange,
      handleTimeChange,
      handleSelectTemplate,
      featureActions,
    },
  ] = useCityPlanner();

  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication and load city data
  useEffect(() => {
    const checkAuthAndLoadCity = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate("/login");
          return;
        }

        // Make BUILDINGS globally available for debugging
        window.BUILDINGS = BUILDINGS;

        // Make the setSelectedBuilding function available globally
        window.setSelectedBuilding = (building: Building) => {
          console.log("Setting selected building:", building);
          setSelectedBuilding(building);
        };

        await loadCityData();
      } catch (error) {
        console.error("Authentication error:", error);
        toast({
          title: "Authentication error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAuthAndLoadCity();

    // Clean up global reference on unmount
    return () => {
      delete window.setSelectedBuilding;
    };
  }, [navigate, loadCityData, setSelectedBuilding, toast]);

  // Add key bindings for enhanced UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S shortcut to save the city
      if (e.altKey && e.code === "KeyS") {
        e.preventDefault();
        handleSave();
        toast({
          title: "Saving city...",
          description: "Your city is being saved",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSave, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <Header onReset={handleReset}>
        <CityToolbar
          cityName={cityName}
          onCityNameChange={setCityName}
          onSave={handleSave}
          onNewCity={handleCreateNewCity}
          isSaving={isSaving}
          isLoading={isLoading}
          currentSeason={currentSeason}
          onSeasonChange={handleSeasonChange}
          currentTime={currentTime}
          onTimeChange={handleTimeChange}
          onSelectTemplate={handleSelectTemplate}
          onGridUpdate={setGrid}
        />
      </Header>

      <CityLayout
        grid={grid}
        setGrid={setGrid}
        selectedBuilding={selectedBuilding}
        onCellUpdate={handleCellUpdate}
        environmentalMetrics={metrics}
        isLoading={isLoading}
        currentTime={currentTime}
        featureState={featureState}
        featureActions={featureActions}
      >
        <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
          Sustain City - Build sustainable cities with real-time environmental
          impact insights
        </footer>
      </CityLayout>
    </div>
  );
};

export default Index;
