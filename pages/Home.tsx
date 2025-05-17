import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Home as HomeIcon, Leaf, Calendar, ChevronRight, BookOpen, ArrowRight, TreePine, Wind, Globe } from "lucide-react";
import { logout, getCurrentUser } from '@/utils/auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface City {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  grid: any;
  metrics: any;
}

const Home = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fixed useEffect to prevent infinite reloads
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }
        setUser(currentUser);
        
        // Load saved cities from localStorage
        const savedCities = localStorage.getItem(`ecocity-${currentUser.id}-cities`);
        if (savedCities) {
          setCities(JSON.parse(savedCities));
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking user:", error);
        navigate('/login');
      }
    };
    
    checkUser();
    // Adding navigate to the dependency array to prevent the warning
    // This won't cause infinite reloads because navigate function reference is stable
  }, [navigate]);

  const handleCreateNew = () => {
    // Clear current city ID before navigating to planner
    localStorage.removeItem('current-city-id');
    navigate('/planner');
    toast({
      title: "Creating New City",
      description: "Starting with a blank canvas for your new city."
    });
  };

  const handleOpenCity = (city: City) => {
    // Store the selected city ID in localStorage
    localStorage.setItem('current-city-id', city.id);
    
    // Navigate to the planner
    navigate('/planner');
    toast({
      title: `Opening ${city.name}`,
      description: "Loading your saved city design."
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "See you next time!"
      });
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Calculate some basic metrics for the Welcome Dashboard
  const totalCities = cities.length;
  const recentActivity = cities.length > 0 
    ? new Date(Math.max(...cities.map(c => new Date(c.lastModified).getTime()))).toLocaleDateString()
    : 'No recent activity';

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Leaf className="h-12 w-12 text-eco mb-4 animate-leaf-sway" />
          <div className="text-2xl">Loading your cities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-light/30 to-background nature-pattern">
      <header className="sticky top-0 z-10 py-5 px-6 flex items-center justify-between border-b backdrop-blur-sm bg-white/70">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-eco animate-leaf-sway" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-eco to-nature-leaf text-transparent bg-clip-text">EcoCity Planner</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground hidden md:block">
            Welcome, <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="transition-all duration-300 hover:bg-eco/10 border-eco/20">Logout</Button>
        </div>
      </header>

      <main className="container py-10">
        {/* Welcome Dashboard */}
        <div className="mb-10 p-6 rounded-xl bg-gradient-to-r from-eco/5 to-eco-light/30 border border-eco/10 shadow-eco eco-corner-accent">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h2>
              <p className="text-muted-foreground">Continue building sustainable urban environments</p>
            </div>
            <Button onClick={handleCreateNew} className="gap-2 transition-all duration-300 hover:scale-[1.03] shadow-button hover:shadow-button-hover bg-eco hover:bg-eco-dark">
              <PlusCircle className="mr-1 h-4 w-4" />
              Create New City
            </Button>
          </div>

          <Collapsible 
            open={!isCollapsed} 
            onOpenChange={setIsCollapsed}
            className="mt-6 border-t border-eco/10 pt-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Your Dashboard</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-8 w-8 hover:bg-eco/10">
                  <ChevronRight className={`h-4 w-4 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-panel bg-white/80">
                  <span className="text-xs text-muted-foreground">Total Cities</span>
                  <span className="stat-value text-eco-dark">{totalCities}</span>
                </div>
                <div className="stat-panel bg-white/80">
                  <span className="text-xs text-muted-foreground">Last Activity</span>
                  <span className="stat-value text-base text-eco-dark">{recentActivity}</span>
                </div>
                <div className="stat-panel bg-white/80">
                  <span className="text-xs text-muted-foreground">Account Type</span>
                  <span className="stat-value text-base text-eco-dark">Free</span>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Your Cities</h2>
          <Button onClick={handleCreateNew} className="gap-2 transition-all duration-300 hover:shadow-md bg-eco hover:bg-eco-dark">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New City
          </Button>
        </div>

        {cities.length === 0 ? (
          <div className="text-center py-16 bg-eco-light/20 rounded-xl border border-dashed border-eco/20 animate-fade-in">
            <HomeIcon className="h-12 w-12 mx-auto mb-4 text-eco opacity-70" />
            <h3 className="text-xl font-medium mb-4">No cities yet</h3>
            <p className="text-muted-foreground mb-8">Create your first sustainable city design</p>
            <Button onClick={handleCreateNew} className="gap-2 shadow-button hover:shadow-button-hover transition-all duration-300 hover:scale-[1.03] bg-eco hover:bg-eco-dark">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New City
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city, index) => (
              <Card 
                key={city.id} 
                className="overflow-hidden hover:shadow-eco transition-shadow duration-300 hover:border-eco/30 hover:scale-[1.01] transform-gpu animate-fade-in eco-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3 bg-gradient-to-r from-eco/5 to-transparent">
                  <div className="flex justify-between items-center">
                    <CardTitle>{city.name}</CardTitle>
                    <Badge variant="outline" className="text-xs text-eco-dark border-eco/20">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(city.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    Last modified: {new Date(city.lastModified).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <AspectRatio ratio={16/9} className="bg-eco-light/30">
                    <div className="grid grid-cols-5 grid-rows-5 gap-1 h-full p-4 grid-eco-overlay">
                      {/* Simple visualization of the city with eco theme */}
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`
                            ${i % 7 === 0 ? 'bg-nature-leaf/20' : 
                              i % 5 === 0 ? 'bg-nature-water/20' : 
                              i % 3 === 0 ? 'bg-eco/10' : 'bg-eco-light/50'}
                            hover:bg-eco/20 transition-colors rounded
                          `}
                        />
                      ))}
                    </div>
                  </AspectRatio>
                </CardContent>
                <CardFooter className="pt-3 flex justify-between bg-gradient-to-r from-transparent to-eco/5">
                  <Button variant="outline" size="sm" onClick={() => handleOpenCity(city)} className="gap-2 transition-all duration-300 hover:bg-eco/10 border-eco/20">
                    <Edit className="h-4 w-4" />
                    Open & Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-eco hover:text-eco-dark">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* Add New City Card */}
            <Card 
              className="overflow-hidden border-dashed border-eco/30 hover:border-eco/50 transition-colors cursor-pointer group eco-card"
              onClick={handleCreateNew}
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-6">
                <div className="w-16 h-16 rounded-full bg-eco/10 flex items-center justify-center mb-4 group-hover:bg-eco/20 transition-colors">
                  <PlusCircle className="h-8 w-8 text-eco" />
                </div>
                <h3 className="text-lg font-medium mb-2">Create New City</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Start with a blank canvas and design your next sustainable city
                </p>
              </div>
            </Card>
          </div>
        )}
        
        {cities.length > 0 && (
          <div className="mt-10 p-6 rounded-lg bg-eco-light/20 border border-eco/10 animate-fade-in eco-section">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-eco" />
              <h3 className="text-lg font-medium">Sustainability Tips</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enhance your city planning with these sustainable development principles:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <Alert className="bg-eco/5 border-eco/10">
                <TreePine className="h-4 w-4 mr-2 text-eco" />
                <AlertDescription>
                  Create green corridors to connect parks for improved biodiversity.
                </AlertDescription>
              </Alert>
              <Alert className="bg-eco/5 border-eco/10">
                <Wind className="h-4 w-4 mr-2 text-eco" />
                <AlertDescription>
                  Include renewable energy zones to power your eco-friendly buildings.
                </AlertDescription>
              </Alert>
              <Alert className="bg-eco/5 border-eco/10">
                <Globe className="h-4 w-4 mr-2 text-eco" />
                <AlertDescription>
                  Design compact neighborhoods to reduce transportation emissions.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-eco/10 py-6 text-center text-sm text-muted-foreground bg-eco-light/20">
        <div className="container">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="h-4 w-4 text-eco" />
            <span>EcoCity Planner — Building sustainable futures together</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
