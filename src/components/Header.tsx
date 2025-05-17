
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, HomeIcon, SproutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/utils/auth';
import { useToast } from '@/components/ui/use-toast';

interface HeaderProps {
  onReset: () => void;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onReset, children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account."
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
  
  const handleDashboard = () => {
    navigate('/home');
  };
  
  return (
    <header className="py-4 px-6 flex items-center justify-between border-b bg-white shadow-sm">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <SproutIcon className="h-6 w-6 text-teal-600 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-transparent bg-clip-text">SustainCityPlanner</h1>
        </div>
        {children}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleDashboard}>
          <HomeIcon className="h-4 w-4 mr-2" /> Dashboard
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          <Trash2 className="h-4 w-4 mr-2" /> Reset City
        </Button>
      </div>
    </header>
  );
};

export default Header;
